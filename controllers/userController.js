const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendOTP } = require('../config/email');

// const nodemailer = require('nodemailer');


// const transporter = nodemailer.createTransport({
//     service: 'gmail', // use gmail
//     auth: {
//         user: 'yazankamseh@gmail.com',  //my account
//         pass: 'y j d d g r d b a t u j a r s u'  // my app password 
//     }
// });

// // to send email
// const sendEmail = async (to, subject, text) => {
//     try {
//         const mailOptions = {
//             from: 'yazankamseh@gmail.com', 
//             to: to,   //reseverrrrr
//             subject: subject, 
//             text: text  
//         };

//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent: ' + info.response);
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// };

//http://localhost:5000/api/users/verify-otp
const verifyOTP = (req, res) => {
    const { email, otp } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];

        if (user.is_verified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (user.otp_code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date(user.otp_expires) < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        db.query('UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires = NULL WHERE email = ?', [email], (err) => {
            if (err) return res.status(500).json({ message: 'Error verifying OTP' });

            res.json({ message: 'Email verified successfully' });
        });
    });
};







//y j d d g r d b a t u j a r s u


// register ----------http://localhost:5000/api/users/register
const registerUser = (req, res) => {
    const { name, email, password, phone, address } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();  // توليد OTP مكون من 6 أرقام
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);  // صلاحية OTP لمدة 10 دقائق

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO users (name, email, password, phone, address, otp_code, otp_expires) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, address, otp, otpExpires],
            async (err) => {
                if (err) return res.status(500).json({ message: 'Error registering user' });

                await sendOTP(email, otp);
                res.status(201).json({ message: 'OTP sent. Please verify your email.' });
            }
        );
    });
};

// login----------http://localhost:5000/api/users/login
const loginUser = (req, res) => {
    const { emailOrName, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ? OR name = ?', [emailOrName, emailOrName], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({ message: 'Invalid email, name, or password' });
        }

        if (!results[0].is_verified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }
        const token = jwt.sign({ id: results[0].id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 1000,
        });

        res.json({ message: 'Login successful', token });
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
    let fields = [];
    let values = [];
    let updatedFields = [];

    if (name) {
        fields.push("name = ?");
        values.push(name);
        updatedFields.push("name");
    }
    if (phone) {
        fields.push("phone = ?");
        values.push(phone);
        updatedFields.push("phone");
    }
    if (address) {
        fields.push("address = ?");
        values.push(address);
        updatedFields.push("address");
    }

    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ message: "Error hashing password" });

            fields.push("password = ?");
            values.push(hashedPassword);
            updatedFields.push("password");

            executeUpdate(fields, values, updatedFields, req.user.id, res);
        });
    } else {
        executeUpdate(fields, values, updatedFields, req.user.id, res);
    }
};

const executeUpdate = (fields, values, updatedFields, userId, res) => {
    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    let sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(userId);

    db.query(sql, values, (err) => {
        if (err) return res.status(500).json({ message: "Error updating profile" });

        res.json({
            message: `Profile updated successfully`,
            updatedFields: updatedFields
        });
    });
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
    deleteUser,  logoutUser,verifyOTP
  
};