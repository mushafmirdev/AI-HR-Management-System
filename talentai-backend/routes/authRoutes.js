const express = require('express');
const authController = require('../controllers/authController');
const upload = require('../utils/multer');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register/candidate', upload.single('resume'), authController.registerCandidate);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected routes (require authentication)
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

module.exports = router;