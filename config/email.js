const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD  //"App Password" 
    }
});

const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_SERVICE,
            to: email,
            subject: 'Your OTP Code',
            text: `Your verification code is: ${otp}. It is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log(` OTP sent to ${email}`);
    } catch (error) {
        console.error(' Error sending OTP:', error);
    }
};

module.exports = { sendOTP };
