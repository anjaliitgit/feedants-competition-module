const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(process.cwd(),'uploads');
fs.mkdirSync(uploadDir,{recursive:true});

const storage = multer.diskStorage({
  destination: (_,__,cb)=>cb(null,uploadDir),
  filename: (_,file,cb)=>{
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_');
    cb(null,`${Date.now()}-${safe}`);
  }
});

const allowed = ['video/mp4','video/quicktime','video/webm','image/jpeg','image/png'];

module.exports = multer({
  storage,
  limits:{fileSize:(Number(process.env.MAX_UPLOAD_MB)||50)*1024*1024},
  fileFilter:(_,file,cb)=>{
    if(!allowed.includes(file.mimetype)) return cb(new Error('Unsupported file type'));
    cb(null,true);
  }
});
