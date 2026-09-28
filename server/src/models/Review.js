const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  competitionId: {type:mongoose.Schema.Types.ObjectId, ref:'Competition', required:true, index:true},
  userId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  rating: {type:Number, min:1, max:5, required:true},
  comment: {type:String, maxlength:500}
}, {timestamps:true});

schema.index({competitionId:1,userId:1},{unique:true});

module.exports = mongoose.model('Review', schema);
