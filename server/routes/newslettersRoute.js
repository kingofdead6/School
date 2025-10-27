import express from 'express';
import { subscribeNewsletter, getSubscribers, deleteSubscriber, sendNewsletter } from '../controllers/newsletterController.js';
import {  authMiddleware , adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', subscribeNewsletter);
router.get('/',  authMiddleware , adminMiddleware, getSubscribers);
router.delete('/:id',  authMiddleware , adminMiddleware, deleteSubscriber);
router.post('/send',  authMiddleware , adminMiddleware,sendNewsletter);

export default router;