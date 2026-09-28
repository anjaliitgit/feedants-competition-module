const router = require('express').Router();
const auth = require('../middleware/auth');
const optionalAuth = (req,res,next)=>{
  if(req.headers.authorization) return auth(req,res,next);
  next();
};
const c = require('../controllers/competitionController');
const upload = require('../middleware/upload');
const submissions = require('../controllers/submissionController');

router.get('/',c.list);
router.get('/:id',optionalAuth,c.getOne);
router.post('/:id/register',auth,c.register);
router.get('/:id/registration/me',auth,c.myRegistration);
router.get('/:id/reviews',c.reviews);
router.post('/:id/reviews',auth,c.addReview);
router.post('/:id/submissions',auth,upload.single('file'),submissions.create);
router.get('/:id/submissions/me',auth,submissions.mine);

module.exports = router;
