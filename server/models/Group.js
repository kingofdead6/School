import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  subject: { type: String, required: true },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
  },
  schedule: {
    day: { type: String, required: true },
    startingtime: { type: String, required: true },
    endingtime: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);