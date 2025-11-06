import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  parentInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String },
  },
  studentInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    grade: { type: String, required: true },
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group', 
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Registration', registrationSchema);