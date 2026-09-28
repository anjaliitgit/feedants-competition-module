const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator');
const User = require('../models/User');
const signToken = require('../utils/token');

async function register(req,res) {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(422).json({message:'Validation failed',errors:errors.array()});
  const {name,email,password} = req.body;
  const existing = await User.findOne({email});
  if(existing) return res.status(409).json({message:'Email already registered'});
  const passwordHash = await bcrypt.hash(password,12);
  const user = await User.create({name,email,passwordHash});
  res.status(201).json({token:signToken(user),user:{_id:user._id,name:user.name,email:user.email,role:user.role}});
}

async function login(req,res) {
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user || !(await bcrypt.compare(password,user.passwordHash))) {
    return res.status(401).json({message:'Invalid email or password'});
  }
  res.json({token:signToken(user),user:{_id:user._id,name:user.name,email:user.email,role:user.role}});
}

async function me(req,res) {
  res.json({user:req.user});
}

module.exports = {register,login,me};
