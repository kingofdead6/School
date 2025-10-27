import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'teacher',
    enum: ['teacher'],
  },
  photo: {
    url: { type: String },
    publicId: { type: String },
  },
  degree: {
    type: String,
  },
  subjectsTaught: [{
    type: String,
    required: true,
    enum: [
      'Math',
      'Physics',
      'Science',
      'Arabic',
      'English',
      'French',
      'Islamic',
      'History',
      'Geography',
      'Philosophy',
    ],
  }, { minItems: 1, maxItems: 2 }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  }],
  bio: {
    type: String,
    maxlength: 500,
  },
  galleryImages: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('Teacher', teacherSchema);