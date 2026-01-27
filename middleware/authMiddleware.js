
import jwt from 'jsonwebtoken';
import User from '../models/User.js'
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: 'Unauthorized: No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id).select('-password');
    console.log(user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log(user);

    req.user = user;
    console.log('User authenticated:', req.user.id);
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

export default protect;
