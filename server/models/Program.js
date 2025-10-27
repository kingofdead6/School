import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  yearLevel: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true }, // Updated to reference Grade
  image: { type: String, default: null },
  publicId: { type: String, default: null }, // For Cloudinary
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Program', programSchema);