const express = require('express');
const router = express.Router();
const {
  generateRoster,
  getRoster,
  updateCell,
  simulateLeave,
  applyBackup,
  getMetadata,
  resetSeedData,
} = require('../controllers/rosterController');

// Generation & Retrieval
router.post('/generate', generateRoster);
router.get('/metadata', getMetadata);
router.get('/:year/:month', getRoster);

// Interactive Editing & Change Handling
router.patch('/cell', updateCell);
router.post('/simulate-leave', simulateLeave);
router.post('/apply-backup', applyBackup);

// Recruiter Reset Action
router.post('/reset-seed', resetSeedData);

module.exports = router;
