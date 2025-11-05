import { asyncHandler } from "../utils/asyncHandler.js";
import Testimonial from "../models/Testimonial.js";
import validator from "validator";

// Get all testimonials
export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({}).lean();
  res.status(200).json(testimonials);
});

// Submit a new testimonial
export const submitTestimonial = asyncHandler(async (req, res) => {
  const { name, title, text, stars } = req.body;

  // Validate inputs
  if (!name || !title || !text || !stars) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!validator.isLength(name, { min: 1, max: 50 })) {
    return res.status(400).json({ message: "Name must be between 1 and 50 characters" });
  }
  if (!validator.isLength(title, { min: 1, max: 100 })) {
    return res.status(400).json({ message: "Title must be between 1 and 100 characters" });
  }
  if (!validator.isLength(text, { min: 1, max: 500 })) {
    return res.status(400).json({ message: "Testimonial must be between 1 and 500 characters" });
  }
  if (!Number.isInteger(Number(stars)) || stars < 1 || stars > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
  }

  const testimonial = new Testimonial({
    name,
    title,
    text,
    stars,
  });
  await testimonial.save();

  res.status(201).json({ message: "Testimonial submitted successfully", testimonial });
});

// Delete a testimonial (admin only)
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return res.status(404).json({ message: "Testimonial not found" });
  }

  await Testimonial.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Testimonial deleted successfully" });
});