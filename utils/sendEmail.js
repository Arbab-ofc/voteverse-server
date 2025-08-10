import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

const sendEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"VoteVerse" <${process.env.MAIL_USERNAME}>`,
      to: email, 
      subject: 'Your VoteVerse OTP Verification Code',
      html: `<p>Your OTP is: <b>${otp}</b></p><p>Valid for 10 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', email);
  } catch (err) {
    console.error('❌ Email send failed:', err);
    throw err;
  }
};

export default sendEmail;
