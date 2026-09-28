const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  competitionId: {type:mongoose.Schema.Types.ObjectId, ref:'Competition', required:true, index:true},
  userId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true, index:true},
  title: {type:String, required:true, maxlength:120},
  description: {type:String, maxlength:1000},
  fileUrl: {type:String, required:true},
  mimeType:String,
  size:Number,
  status: {type:String, enum:['submitted','under_review','judged','disqualified'], default:'submitted'}
}, {timestamps:true});

schema.index({competitionId:1,userId:1},{unique:true});

module.exports = mongoose.model('Submission', schema);
