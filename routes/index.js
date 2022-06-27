var express = require('express');
var router = express.Router();
const flash = require('express-flash');
const session = require('express-session');

router.use(flash());
router.use(session({ 
  secret: 'admindetails',
  resave: false,
  saveUninitialized: true
}));

const userControllers = require('../controllers/userControllers')
const helper = require('../helpers/Helper')

/* GET home page. */
router.get('/', userControllers.indexPage);

// Contact Us
router.post('/submit-contact-us', userControllers.submitContactUs)

// Login Page
router.get('/login',  userControllers.loginPage);

router.post('/submit-login', userControllers.userLogin);

// Forgot Password
router.get('/forgot-pass',  userControllers.forgotPassPage);

router.post('/submit-forgot-password', userControllers.submitForgotPassword)

router.get('/forgot-password-verification-email', helper.forgotPasswordVerificationEmail)

router.get('/forgot-password-verification-page', userControllers.forgotPasswordVerification)

router.post('/submit-forgot-password-verification', userControllers.submitForgotPasswordVerification)

router.get('/set-new-password', userControllers.setNewPasswordPage)

router.post('/submit-set-new-password', userControllers.submitSetNewPassword)

// Sign up
router.get('/Signup', userControllers.signupPage);

router.post('/submit_registration', userControllers.submitUser);

router.get('/email-authentication', userControllers.authPage)

router.post('/submit-email-authentication', userControllers.submitAuthPage)

router.get('/send-email', helper.sendEmailVerification)

module.exports = router;
