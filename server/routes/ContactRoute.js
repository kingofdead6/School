import express from 'express';
import { submitContact, getContacts, deleteContact } from '../controllers/contactController.js';
import {  authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', authMiddleware , adminMiddleware, getContacts);
router.delete('/:id', authMiddleware , adminMiddleware, deleteContact);

export default router;