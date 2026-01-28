import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import generateToken from '../utils/generateToken.js'
import sendEmail from '../utils/sendEmail.js'
import generateOTP from '../utils/generateOTP.js'
import { getFirebaseAdmin } from "../utils/firebaseAdmin.js";

const normalizeName = (name, email) => {
  const fallback = email?.split("@")[0] || "user";
  let nextName = (name || fallback).replace(/\s+/g, " ").trim();
  if (nextName.length < 6) {
    nextName = `${nextName}${"user"}`.trim();
  }
  while (nextName.length < 6) {
    nextName += "x";
  }
  return nextName;
};





export const registerUser = async (req, res) => {
  try {
    const { name, email, password, accountType, adminSecret } = req.body;

    
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    if (name.length < 6)
      return res.status(400).json({ message: 'Name must be at least 6 characters' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: 'User already exists with this email' });

    if (accountType === 'admin') {
      const expectedSecret = process.env.ADMIN_SECRET;
      if (!expectedSecret || adminSecret !== expectedSecret) {
        return res.status(403).json({ message: 'Invalid admin secret' });
      }
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiresAt,
      isAdmin: accountType === 'admin'
    });

    
    await sendEmail(email, otp);

    
    const token = generateToken(user._id);

    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Registered successfully. OTP sent to email.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    
    if (!user.isVerified)
      return res.status(403).json({ message: 'Please verify your email before logging in' });

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    
    const token = generateToken(user._id);
    if (!token) {
      return res.status(500).json({ message: 'Token generation failed' });
    }
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Missing Google ID token" });
    }

    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = (decoded.email || "").toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        name: normalizeName(decoded.name, email),
        email,
        password: hashedPassword,
        isVerified: true,
        otp: "",
        otpExpiresAt: null,
        isAdmin: false,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      user.otp = "";
      user.otpExpiresAt = null;
      await user.save();
    }

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (!user.otp || !user.otpExpiresAt || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

   
    user.isVerified = true;
    user.otp = '';
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully. You can now login.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfile = (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Logout failed' });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

   
    await sendEmail(user.email, otp);

    res.status(200).json({ message: 'OTP sent to your email successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while sending OTP' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request again.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.otp = '';
    user.otpExpiresAt = null;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    await user.save();

    await sendEmail(user.email, otp);

    res.status(200).json({ message: 'OTP resent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error while resending OTP' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};
