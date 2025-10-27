import express from 'express';
import {
  teacherLogin,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherGroups,
  manageGalleryImages,
} from '../controllers/teacherController.js';
import { authMiddleware, adminMiddleware, teacherMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10, // Max 10 files for galleryImages
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true); // Allow no file
    }
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG and PNG images are allowed'), false);
    }
    cb(null, true);
  },
}).fields([
  { name: 'photo', maxCount: 1 }, // Single profile photo
  { name: 'galleryImages', maxCount: 10 }, // Multiple gallery images
]);

// Routes
router.post('/login', teacherLogin);
router.get('/', getTeachers);
router.post('/', authMiddleware, adminMiddleware, upload, createTeacher);
router.put('/:id', authMiddleware, adminMiddleware, upload, updateTeacher);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTeacher);
router.get('/profile', authMiddleware, teacherMiddleware, getTeacherProfile);
router.put('/profile', authMiddleware, teacherMiddleware, upload, updateTeacherProfile);
router.get('/groups', authMiddleware, teacherMiddleware, getTeacherGroups);
router.get('/:id/groups', getTeacherGroups); // Public access for groups
router.put('/:id/gallery', authMiddleware, teacherMiddleware, upload, manageGalleryImages);

export default router;