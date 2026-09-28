const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  competitionId: {type:mongoose.Schema.Types.ObjectId, ref:'Competition', required:true, index:true},
  userId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true, index:true},
  paymentStatus: {type:String, enum:['pending','paid','refunded'], default:'paid'},
  status: {type:String, enum:['registered','cancelled'], default:'registered'}
}, {timestamps:true});

schema.index({competitionId:1,userId:1},{unique:true});

module.exports = mongoose.model('Registration', schema);
