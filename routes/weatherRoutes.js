const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // ✅ Protect routes with middleware
const { 
    getFavoriteCities, 
    getFavoriteCityById, 
    addFavoriteCity, 
    updateFavoriteCity, 
    deleteFavoriteCity 
} = require('../controllers/weatherController.js');

// get favorite cities of the user
router.get('/favoriteCities', protect, getFavoriteCities);

// Get a specific favorite city by ID and its weather data
router.get('/favoritecitylookup/:id', protect, getFavoriteCityById);

//  user add favorite city
router.post('/addcity', protect, addFavoriteCity);

// update favorite city
router.put('/updatecity/:id', protect, updateFavoriteCity);

//delete favorite city
router.delete('/deletecity/:id', protect, deleteFavoriteCity);

module.exports = router;
