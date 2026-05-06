const express = require('express');
const router = express.Router();
const {
  sendEmailCode,
  registerWithEmail,
  loginWithEmail,
  loginWithEmailPassword,
  getEvmChallenge,
  loginWithEvm,
  getMe,
  verifyToken
} = require('../controllers/authController');

router.post('/send-code', sendEmailCode);
router.post('/register', registerWithEmail);
router.post('/login/email', loginWithEmail);
router.post('/login/email-password', loginWithEmailPassword);
router.post('/login/evm-challenge', getEvmChallenge);
router.post('/login/evm', loginWithEvm);
router.get('/me', verifyToken, getMe);

module.exports = router;
