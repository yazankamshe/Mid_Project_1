const db = require('../config/db');
const axios = require('axios');


// Get all favorite cities of the user
const getFavoriteCities = (req, res) => {
    const userId = req.user.id;

    db.query('SELECT * FROM favorite WHERE userid = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching favorite cities' });

        res.json(results);
    });
};



const API_KEY = '759232dcea7915c2947811f9466d7ec0'; 

// Get a favorite city by ID and show weather data
const getFavoriteCityById = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch the city 
    db.query('SELECT * FROM favorite WHERE id = ? AND userid = ?', [id, userId], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching city' });

        if (results.length === 0) return res.status(404).json({ message: 'City not found' });

        const city = results[0].city;

        try {
            // Fetch weather data from OpenWeather API
            const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
            const weatherData = weatherResponse.data;

            
            res.json({
                city: results[0],
                weather: {
                    temperature: weatherData.main.temp,
                    description: weatherData.weather[0].description,
                    humidity: weatherData.main.humidity,
                    windSpeed: weatherData.wind.speed,
                    icon: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching weather data' });
        }
    });
};




const addFavoriteCity = (req, res) => {
    const { city } = req.body;
    const userId = req.user.id;

    if (!city) {
        return res.status(400).json({ message: 'City name is required' });
    }

    // Check if the city already exists 
    db.query('SELECT * FROM favorite WHERE userid = ? AND city = ?', [userId, city], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error checking favorite cities' });

        if (results.length > 0) {
            return res.status(400).json({ message: 'City already exists in your favorite cities' });
        }

        
        db.query('INSERT INTO favorite (userid, city) VALUES (?, ?)', [userId, city], (err) => {
            if (err) return res.status(500).json({ message: 'Error adding favorite city' });

            res.status(201).json({ message: 'City added to favorites' });
        });
    });
};


// Update a favorite city
const updateFavoriteCity = (req, res) => {
    const { id } = req.params;
    const { city } = req.body;
    const userId = req.user.id;

    if (!city) {
        return res.status(400).json({ message: 'City name is required' });
    }

    db.query('UPDATE favorite SET city = ? WHERE id = ? AND userid = ?', [city, id, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Error updating city' });

        res.json({ message: 'City updated successfully' });
    });
};

// Delete a city from the user's favorites
const deleteFavoriteCity = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.query('DELETE FROM favorite WHERE id = ? AND userid = ?', [id, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting city' });

        res.json({ message: 'City removed from favorites' });
    });
};

module.exports = {
    getFavoriteCities,
    getFavoriteCityById,
    addFavoriteCity,
    updateFavoriteCity,
    deleteFavoriteCity
};
