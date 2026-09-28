const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');

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

async function create(req, res) {
  const c = await Competition.findOne(
    competitionQuery(req.params.id)
  );

  if (!c) {
    return res.status(404).json({
      message: 'Competition not found'
    });
  }

  if (!req.file) {
    return res.status(422).json({
      message: 'A submission file is required'
    });
  }

  const now = new Date();

  // Submission must be inside the configured submission window.
  if (
    now < c.submissionStartsAt ||
    now > c.submissionEndsAt
  ) {
    return res.status(409).json({
      message: 'Submission window is not open'
    });
  }

  // Only registered participants can submit.
  const registered = await Registration.exists({
    competitionId: c._id,
    userId: req.user._id,
    status: 'registered'
  });

  if (!registered) {
    return res.status(403).json({
      message: 'Only registered participants can submit'
    });
  }

  // Fast check for the normal duplicate-submission case.
  const exists = await Submission.exists({
    competitionId: c._id,
    userId: req.user._id
  });

  if (exists) {
    await removeUploadedFile(req.file);

    return res.status(409).json({
      message: 'A submission already exists for this competition'
    });
  }

  try {
    const submission = await Submission.create({
      competitionId: c._id,
      userId: req.user._id,
      title: req.body.title || 'Competition Submission',
      description: req.body.description || '',
      fileUrl: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    return res.status(201).json({
      message: 'Submission uploaded',
      submission
    });
  } catch (error) {
    /*
      The Submission model has a unique compound index on:

      competitionId + userId

      Therefore, if two requests arrive at almost exactly the
      same time, MongoDB protects us from creating two submissions.
    */
    if (error.code === 11000) {
      await removeUploadedFile(req.file);

      return res.status(409).json({
        message: 'A submission already exists for this competition'
      });
    }

    console.error('Submission creation error:', error);

    await removeUploadedFile(req.file);

    return res.status(500).json({
      message: 'Could not upload submission'
    });
  }
}

async function mine(req, res) {
  const c = await Competition.findOne(
    competitionQuery(req.params.id)
  );

  if (!c) {
    return res.status(404).json({
      message: 'Competition not found'
    });
  }

  const submission = await Submission.findOne({
    competitionId: c._id,
    userId: req.user._id
  });

  res.json({
    submission
  });
}

/*
  If a database operation fails after Multer has already saved
  the uploaded file, remove the unused file from disk.
*/
async function removeUploadedFile(file) {
  if (!file || !file.path) {
    return;
  }

  try {
    await fs.unlink(path.resolve(file.path));
  } catch (error) {
    // File may already have been removed.
    if (error.code !== 'ENOENT') {
      console.error('Could not remove uploaded file:', error);
    }
  }
}

module.exports = {
  create,
  mine
};