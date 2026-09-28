const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Review = require('../models/Review');
const { presentCompetition } = require('../services/competitionService');

function competitionQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return {
      $or: [
        { slug: id },
        { _id: id }
      ]
    };
  }

  return {
    slug: id
  };
}

async function list(req, res) {
  const competitions = await Competition
    .find({})
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    competitions: competitions.map(c => presentCompetition(c))
  });
}

async function getOne(req, res) {
  const c = await Competition
    .findOne(competitionQuery(req.params.id))
    .lean();

  if (!c) {
    return res.status(404).json({
      message: 'Competition not found'
    });
  }

  let registered = false;

  if (req.user) {
    registered = !!await Registration.exists({
      competitionId: c._id,
      userId: req.user._id,
      status: 'registered'
    });
  }

  res.json({
    competition: presentCompetition(c, registered)
  });
}

async function register(req, res) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const c = await Competition.findOneAndUpdate(
      {
        ...competitionQuery(req.params.id),
        status: 'registration_open',
        registrationClosesAt: { $gt: new Date() },
        $expr: {
          $lt: ['$registeredCount', '$maxParticipants']
        }
      },
      {
        $inc: {
          registeredCount: 1
        }
      },
      {
        new: true,
        session
      }
    );

    if (!c) {
      await session.abortTransaction();

      return res.status(409).json({
        message: 'Registration is closed or the competition is full'
      });
    }

    try {
      await Registration.create(
        [
          {
            competitionId: c._id,
            userId: req.user._id,
            paymentStatus: 'paid',
            status: 'registered'
          }
        ],
        { session }
      );
    } catch (e) {
      if (e.code === 11000) {
        await Competition.updateOne(
          { _id: c._id },
          {
            $inc: {
              registeredCount: -1
            }
          },
          { session }
        );

        await session.commitTransaction();

        return res.status(409).json({
          message: 'You are already registered'
        });
      }

      throw e;
    }

    await session.commitTransaction();

    res.status(201).json({
      message: 'Registration successful',
      competition: presentCompetition(c, true)
    });
  } catch (e) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error('Registration error:', e);

    res.status(500).json({
      message: 'Could not complete registration'
    });
  } finally {
    await session.endSession();
  }
}

async function myRegistration(req, res) {
  const c = await Competition.findOne(
    competitionQuery(req.params.id)
  );

  if (!c) {
    return res.status(404).json({
      message: 'Competition not found'
    });
  }

  const registration = await Registration.findOne({
    competitionId: c._id,
    userId: req.user._id,
    status: 'registered'
  });

  res.json({
    registered: !!registration,
    registration
  });
}

async function reviews(req, res) {
  const c = await Competition.findOne(
    competitionQuery(req.params.id)
  );

  if (!c) {
    return res.status(404).json({
      message: 'Competition not found'
    });
  }

  const items = await Review
    .find({
      competitionId: c._id
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

  const average = items.length
    ? items.reduce((total, review) => total + review.rating, 0) / items.length
    : 0;

  res.json({
    averageRating: Number(average.toFixed(1)),
    count: items.length,
    reviews: items
  });
}

async function addReview(req, res) {
  const c = await Competition.findOne(
    competitionQuery(req.params.id)
  );

  if (!c) {
    return res.status(404).json({
      message: 'Competition not found'
    });
  }

  const { rating, comment } = req.body;

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(422).json({
      message: 'Rating must be 1-5'
    });
  }

  try {
    const review = await Review.create({
      competitionId: c._id,
      userId: req.user._id,
      rating: numericRating,
      comment: comment || ''
    });

    res.status(201).json({
      review
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        message: 'You already reviewed this competition'
      });
    }

    console.error('Review error:', e);

    res.status(500).json({
      message: 'Could not add review'
    });
  }
}

module.exports = {
  list,
  getOne,
  register,
  myRegistration,
  reviews,
  addReview
};