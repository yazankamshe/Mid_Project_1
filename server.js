const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

const path = require('path'); 
require('dotenv').config();


const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(cookieParser());
// خدمة الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));