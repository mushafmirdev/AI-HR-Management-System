const express = require('express');
const candidateController = require('../controllers/candidateController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', candidateController.getProfile);
router.patch('/updateMe', candidateController.updateProfile);
router.get('/applications', candidateController.getJobApplications);
router.post('/apply/:jobId', candidateController.applyForJob);

module.exports = router;