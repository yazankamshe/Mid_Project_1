const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,logoutUser }  = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUser);
router.post('/logout', logoutUser); 


module.exports = router;