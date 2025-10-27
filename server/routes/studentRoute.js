import express from 'express';
import { getStudents, addStudent, deleteStudent, getStudentById, addGroupToStudent } from '../controllers/studentController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getStudents);
router.get('/:id', authMiddleware, adminMiddleware, getStudentById);
router.post('/', authMiddleware, adminMiddleware, addStudent);
router.put('/:id/add-group', authMiddleware, adminMiddleware, addGroupToStudent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStudent);

export default router;