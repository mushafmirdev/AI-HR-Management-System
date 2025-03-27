const express = require('express');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.post('/jobs', adminController.createJob);
router.get('/candidates', adminController.getAllCandidates);
router.patch('/candidates/:candidateId/applications/:applicationId', adminController.updateCandidateStatus);

module.exports = router;