import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxLength: 50 },
    title: { type: String, required: true, trim: true, maxLength: 100 },
    text: { type: String, required: true, trim: true, maxLength: 500 },
    stars: { type: Number, required: true, min: 1, max: 5 },
    image: { type: String, default: null }, 
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);