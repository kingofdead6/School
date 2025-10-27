import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  parentInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String },
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  }],
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    required: true,
  },
  attendance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);