const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');







// register ----------http://localhost:5000/api/users/register
const registerUser = (req, res) => {
    const { name, email, password, phone, address } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, address],
            (err) => {
                if (err) return res.status(500).json({ message: 'Error registering user' });
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
};

// login----------http://localhost:5000/api/users/login
const loginUser = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: results[0].id }, 'your_jwt_secret', { expiresIn: '1h' });
        // const refreshToken = jwt.sign({ id: results[0].id }, 'your_jwt_secret', { expiresIn: "7d" });
             // Set token in HTTP-only cookie
             res.cookie('token', token, {
                httpOnly: true,  // Prevent client-side access to the cookie
                secure: process.env.NODE_ENV === 'production',  // Enable secure flag in production
                sameSite: 'Strict',  // Prevent CSRF attacks
                maxAge: 60 * 60 * 1000,  // 1 hour expiration
            });
    
            res.json({ message: 'Login successful' ,token});
        });
    };
//  Fetch User --------http://localhost:5000/api/users/profile
const getUserProfile = (req, res) => {
    db.query('SELECT id, name, email, phone, address FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    });
};

// update profile-------------- http://localhost:5000/api/users/profile
const updateUserProfile = (req, res) => {
    const { name, phone, address, password } = req.body;
    let sql = 'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?';
    let params = [name, phone, address, req.user.id];

    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: 'Error hashing password' });
            sql = 'UPDATE users SET name = ?, phone = ?, address = ?, password = ? WHERE id = ?';
            params = [name, phone, address, hashedPassword, req.user.id];
            db.query(sql, params, (err) => {
                if (err) return res.status(500).json({ message: 'Error updating profile' });
                res.json({ message: 'Profile updated successfully' });
            });
        });
    } else {
        db.query(sql, params, (err) => {
            if (err) return res.status(500).json({ message: 'Error updating profile' });
            res.json({ message: 'Profile updated successfully' });
        });
    }
};



//delete user--------------http://localhost:5000/api/users/profile
const deleteUser = (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting user' });
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.json({ message: 'User deleted successfully' });
    });
};


const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        sameSite: 'Strict',
    });

    res.json({ message: 'Logged out successfully' });
};


module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,  logoutUser,
  
};