import express from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    fields: 10, 
    files: 1, 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!file) {
      return cb(null, true); 
    }
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG and PNG images are allowed'), false);
    }
    cb(null, true);
  },
}).single('image');

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Too many files uploaded' });
    }
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.get('/', getAnnouncements);
router.post('/', authMiddleware, adminMiddleware, upload, handleMulterError, createAnnouncement);
router.put('/:id', authMiddleware, adminMiddleware, upload, handleMulterError, updateAnnouncement);
router.delete('/:id', authMiddleware, adminMiddleware, deleteAnnouncement);

export default router;