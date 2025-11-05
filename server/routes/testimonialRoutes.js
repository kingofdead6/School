import express from "express";
import { getTestimonials, submitTestimonial, deleteTestimonial } from "../controllers/testimonialController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", submitTestimonial);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTestimonial);

export default router;