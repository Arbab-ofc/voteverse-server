import express from 'express';

import { registerUser , loginUser,
  verifyOtp,
  getUserProfile,
  logoutUser,
  forgetPassword,
  resetPassword,
  resendOtp,
  changePassword } from '../controllers/authController.js';

import  protect  from '../middleware/authMiddleware.js'

const UserRouter = express.Router();


UserRouter.post('/register', registerUser);
UserRouter.post('/login', loginUser);
UserRouter.post('/verify-otp', verifyOtp);
UserRouter.post('/resend-otp', resendOtp);


UserRouter.post('/forget', forgetPassword);
UserRouter.post('/reset-password', resetPassword);
UserRouter.put('/change-password', protect, changePassword);


UserRouter.get('/profile', protect, getUserProfile);
UserRouter.post('/logout', protect, logoutUser);

export default UserRouter;