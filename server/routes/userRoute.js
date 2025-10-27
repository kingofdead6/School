import express from 'express';
import { login, registerSuperAdmin, registerAdmin, getAdmins, deleteAdmin, updateAdmin } from '../controllers/userController.js';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.post('/login', login);
router.post('/register-superadmin', registerSuperAdmin);
router.post('/register-admin', authMiddleware, superAdminMiddleware, registerAdmin);
router.get('/admins', authMiddleware, superAdminMiddleware, getAdmins);
router.delete('/admins/:id', authMiddleware, superAdminMiddleware, deleteAdmin);
router.put('/admins/:id', authMiddleware, superAdminMiddleware, updateAdmin);

export default router;