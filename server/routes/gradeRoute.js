import express from 'express';
import { getGrades, addGrade, deleteGrade, getStudentsByGrade, getGroupsByGrade } from '../controllers/gradeController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/',  getGrades);
router.post('/', authMiddleware, adminMiddleware, addGrade);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGrade);
router.get('/:id/students', authMiddleware, adminMiddleware, getStudentsByGrade);
router.get('/:id/groups',  getGroupsByGrade);

export default router;