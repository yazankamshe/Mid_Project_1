const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yazankamseh@gmail.com',
        pass: 'y j d d g r d b a t u j a r s u'  //"App Password" 
    }
});

const sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: 'yazankamseh@gmail.com',
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
