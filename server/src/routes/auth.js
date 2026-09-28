const router = require('express').Router();
const {body} = require('express-validator');
const {register,login,me} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register',
  body('name').trim().isLength({min:2,max:80}),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({min:8}),
  register
);
router.post('/login',body('email').isEmail().normalizeEmail(),login);
router.get('/me',auth,me);

module.exports = router;
