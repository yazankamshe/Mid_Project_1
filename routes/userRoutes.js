const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,logoutUser ,verifyOTP,forgotPassword,resetPassword}  = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUser);
router.post('/logout', logoutUser); 

router.post('/verify-otp', verifyOTP);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;