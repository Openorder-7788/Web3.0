const express = require('express');
const router = express.Router();
const { submitResult, getStatistics, getPersonalities, getValidationKey } = require('../controllers/testController');

router.post('/submit', submitResult);
router.get('/statistics', getStatistics);
router.get('/personalities', getPersonalities);
router.get('/validation-key.txt', getValidationKey);

module.exports = router;
