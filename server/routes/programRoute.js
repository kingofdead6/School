import express from 'express';
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from '../controllers/programsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 1, 
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true);
    }
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG and PNG images are allowed'), false);
    }
    cb(null, true);
  },
}).single('image');

router.get('/', getPrograms); 
router.post('/', authMiddleware, adminMiddleware, upload, createProgram);
router.put('/:id', authMiddleware, adminMiddleware, upload, updateProgram);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProgram);

export default router;