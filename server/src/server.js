require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const competitionRoutes = require('./routes/competitions');
const {notFound,errorHandler} = require('./middleware/error');

const app = express();
app.use(cors({origin:process.env.CLIENT_ORIGIN || '*'}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads',express.static(path.join(process.cwd(),'uploads')));

app.get('/api/health',(req,res)=>res.json({ok:true,service:'feedants-api',time:new Date().toISOString()}));
app.use('/api/auth',authRoutes);
app.use('/api/competitions',competitionRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB()
  .then(()=>app.listen(port,()=>console.log(`Feedants API running at http://localhost:${port}`)))
  .catch(err=>{console.error(err);process.exit(1);});
