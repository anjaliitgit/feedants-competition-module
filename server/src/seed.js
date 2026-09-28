require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Competition = require('./models/Competition');
const Registration = require('./models/Registration');

async function run() {
  await connectDB();

  await User.deleteMany({});
  await Competition.deleteMany({});
  await Registration.deleteMany({});

  const passwordHash = await bcrypt.hash('Demo@123',12);
  const [demo, participant2] = await User.create([
    {name:'Demo User',email:'demo@feedants.local',passwordHash},
    {name:'Participant Two',email:'participant2@feedants.local',passwordHash}
  ]);

  const now = Date.now();
  const registrationClosesAt = new Date(now + 24*60*60*1000);
  const submissionStartsAt = new Date(now - 2*60*60*1000);
  const submissionEndsAt = new Date(now + 2*24*60*60*1000);
  const resultAt = new Date(now + 3*24*60*60*1000);

  const competition = await Competition.create({
    slug:'demo-classical-dance',
    title:'Feedants Classical Dance',
    tags:['Dance','Multi-Win'],
    certificateText:'Winners get certificate',
    prizePool:1500,
    entryFee:99,
    maxParticipants:20,
    registeredCount:1,
    status:'registration_open',
    registrationClosesAt,
    submissionStartsAt,
    submissionEndsAt,
    resultAt,
    judge:{
      name:'Manju Dubey',
      role:'Professional Kathak Dancer',
      experience:'12+ Years of Experience',
      imageUrl:'',
      introVideoUrl:''
    },
    dates:{
      registerBefore:'29 Sep 26',
      registerTime:'11:50 PM',
      submissionStarts:'28 Sep 26',
      submissionStartsTime:'04:00 AM',
      submissionEnds:'30 Sep 26',
      submissionEndsTime:'11:55 PM',
      resultDate:'1 Oct 26',
      resultTime:'11:50 PM'
    },
    winners:[
      {name:'Riya Shah',position:'1st Winner'},
      {name:'Aarav Mehta',position:'1st Winner'},
      {name:'Neha Verma',position:'2nd Winner'},
      {name:'Ishita Chopra',position:'3rd Winner'}
    ],
    about:'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    judging:'Participants are evaluated on technique, expression, presentation and overall performance.',
    rules:'Open to all age groups. Submit an original performance within the submission window. Paid registration is required for judging.',
    rewards:[
      {position:'1st Winner',amount:550},
      {position:'2nd Winner',amount:300},
      {position:'3rd Winner',amount:240},
      {position:'4th Winner',amount:200},
      {position:'5th Winner',amount:130},
      {position:'6th Winner',amount:80}
    ]
  });

  await Registration.create({competitionId:competition._id,userId:demo._id,paymentStatus:'paid'});
  console.log('Seed complete');
  console.log('Competition:',competition.slug);
  console.log('Demo:',demo.email,'Demo@123');
  console.log('Second user:',participant2.email,'Demo@123');
  await mongoose.disconnect();
}

run().catch(async e=>{console.error(e);await mongoose.disconnect();process.exit(1);});
