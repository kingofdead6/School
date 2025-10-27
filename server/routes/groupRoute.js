import express from 'express';
import { getGroups, createGroup, updateGroupSchedule, getStudentsByGroup, getGroupsByGrade, deleteGroup } from '../controllers/GroupController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGroups);
router.post('/', authMiddleware, adminMiddleware, createGroup);
router.put('/:id/schedule', authMiddleware, adminMiddleware, updateGroupSchedule);
router.get('/:id/students', authMiddleware, getStudentsByGroup);
router.get('/grade/:id', getGroupsByGrade);
router.delete('/:id', authMiddleware, adminMiddleware, deleteGroup);

export default router;