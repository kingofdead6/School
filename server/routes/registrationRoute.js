import express from 'express';
import { getRegistrations, updateRegistration, createRegistration } from '../controllers/registrationController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'superadmin' && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access restricted to admins' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

router.get('/', verifyAdmin, getRegistrations);
router.put('/:id', verifyAdmin, updateRegistration);
router.post('/', createRegistration); // Public route for student registration

export default router;