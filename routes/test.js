const express = require('express');
const router = express.Router();
const { submitResult, getStatistics, getPersonalities } = require('../controllers/testController');

router.post('/submit', submitResult);
router.get('/statistics', getStatistics);
router.get('/personalities', getPersonalities);

module.exports = router;
