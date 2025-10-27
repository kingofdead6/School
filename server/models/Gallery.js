import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  image : { type: String, required: true }, // Cloudinary URL
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);