const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  slug: {type:String, required:true, unique:true, index:true},
  title: {type:String, required:true},
  tags: [String],
  certificateText: String,
  prizePool: Number,
  entryFee: Number,
  maxParticipants: Number,
  registeredCount: {type:Number, default:0},
  status: {
    type:String,
    enum:['draft','upcoming','registration_open','registration_closed','submission_open','completed'],
    default:'draft',
    index:true
  },
  registrationClosesAt: Date,
  submissionStartsAt: Date,
  submissionEndsAt: Date,
  resultAt: Date,
  judge: {
    name:String,
    role:String,
    experience:String,
    imageUrl:String,
    introVideoUrl:String
  },
  dates: {
    registerBefore:String,
    registerTime:String,
    submissionStarts:String,
    submissionStartsTime:String,
    submissionEnds:String,
    submissionEndsTime:String,
    resultDate:String,
    resultTime:String
  },
  winners: [{
    name:String,
    position:String,
    imageUrl:String,
    videoUrl:String
  }],
  about:String,
  judging:String,
  rules:String,
  rewards: [{
    position:String,
    amount:Number
  }]
}, {timestamps:true});

module.exports = mongoose.model('Competition', schema);
