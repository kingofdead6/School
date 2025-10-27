import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Teacher from '../models/Teacher.js';
import Group from '../models/Group.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/Cloudinary.js';

// Login controller for teachers
export const teacherLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const role = teacher.role || 'teacher';
    const token = jwt.sign(
      { userId: teacher._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        role,
      },
    });
  } catch (error) {
    console.error('Teacher Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate({
        path: 'groups',
        populate: { path: 'grade', select: 'name _id' },
      })
      .select('-password');
    res.status(200).json(teachers);
  } catch (error) {
    console.error('Get Teachers Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new teacher (admin only)
export const createTeacher = async (req, res) => {
  try {
    const { fullName, email, password, degree, subjectsTaught, bio } = req.body;
    const file = req.file; // Main profile photo
    const galleryFiles = req.files?.galleryImages; // Multiple gallery images

    if (!fullName || !email || !password || !subjectsTaught || subjectsTaught.length === 0) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    let parsedSubjectsTaught;
    try {
      parsedSubjectsTaught = JSON.parse(subjectsTaught);
      if (!Array.isArray(parsedSubjectsTaught) || parsedSubjectsTaught.length === 0) {
        return res.status(400).json({ message: 'At least one subject is required' });
      }
      if (parsedSubjectsTaught.length > 2) {
        return res.status(400).json({ message: 'Maximum two subjects allowed' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid subjectsTaught format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let photo = {};
    if (file) {
      const photoUrl = await uploadToCloudinary(file, 'image');
      photo = { url: photoUrl, publicId: `image_${Date.now()}` };
    }

    let galleryImages = [];
    if (galleryFiles && Array.isArray(galleryFiles)) {
      const uploadPromises = galleryFiles.map(async (file, index) => {
        const url = await uploadToCloudinary(file, 'image');
        return { url, publicId: `gallery_image_${Date.now()}_${index}` };
      });
      galleryImages = await Promise.all(uploadPromises);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      fullName,
      email,
      password: hashedPassword,
      degree,
      subjectsTaught: parsedSubjectsTaught,
      bio,
      photo: photo.url ? photo : undefined,
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
    });

    await teacher.save();
    const newTeacher = await Teacher.findById(teacher._id).select('-password');
    res.status(201).json(newTeacher);
  } catch (error) {
    console.error('Create Teacher Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a teacher (admin only)
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, password, degree, subjectsTaught, bio, removePhoto, removeGalleryImages } = req.body;
    const file = req.file; // Main profile photo
    const galleryFiles = req.files?.galleryImages; // Multiple gallery images

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (!fullName || !subjectsTaught) {
      return res.status(400).json({ message: 'Full name and subjects taught are required' });
    }
    let parsedSubjectsTaught;
    try {
      parsedSubjectsTaught = JSON.parse(subjectsTaught);
      if (!Array.isArray(parsedSubjectsTaught) || parsedSubjectsTaught.length === 0) {
        return res.status(400).json({ message: 'At least one subject is required' });
      }
      if (parsedSubjectsTaught.length > 2) {
        return res.status(400).json({ message: 'Maximum two subjects allowed' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid subjectsTaught format' });
    }

    if (email && email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ email });
      if (existingTeacher && existingTeacher._id.toString() !== id) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      teacher.email = email;
    }

    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (degree && degree.length > 100) {
      return res.status(400).json({ message: 'Degree cannot exceed 100 characters' });
    }
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: 'Bio cannot exceed 500 characters' });
    }

    teacher.fullName = fullName;
    if (password) teacher.password = await bcrypt.hash(password, 10);
    teacher.subjectsTaught = parsedSubjectsTaught;
    teacher.degree = degree || '';
    teacher.bio = bio || '';

    if (removePhoto === 'true') {
      if (teacher.photo && teacher.photo.publicId) {
        await deleteFromCloudinary(teacher.photo.publicId, 'image');
      }
      teacher.photo = undefined;
    } else if (file) {
      if (teacher.photo && teacher.photo.publicId) {
        await deleteFromCloudinary(teacher.photo.publicId, 'image');
      }
      const photoUrl = await uploadToCloudinary(file, 'image');
      teacher.photo = { url: photoUrl, publicId: `image_${Date.now()}` };
    }

    if (removeGalleryImages === 'true') {
      if (teacher.galleryImages && teacher.galleryImages.length > 0) {
        const deletePromises = teacher.galleryImages.map(image =>
          deleteFromCloudinary(image.publicId, 'image')
        );
        await Promise.all(deletePromises);
        teacher.galleryImages = [];
      }
    } else if (galleryFiles && Array.isArray(galleryFiles)) {
      const uploadPromises = galleryFiles.map(async (file, index) => {
        const url = await uploadToCloudinary(file, 'image');
        return { url, publicId: `gallery_image_${Date.now()}_${index}` };
      });
      const newGalleryImages = await Promise.all(uploadPromises);
      teacher.galleryImages = [...(teacher.galleryImages || []), ...newGalleryImages];
    }

    await teacher.save();
    const updatedTeacher = await Teacher.findById(id).select('-password');
    res.status(200).json(updatedTeacher);
  } catch (error) {
    console.error('Update Teacher Error:', error);
    if (error.message.includes('Cloudinary')) {
      return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a teacher (admin only)
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.photo && teacher.photo.publicId) {
      await deleteFromCloudinary(teacher.photo.publicId, 'image');
    }
    if (teacher.galleryImages && teacher.galleryImages.length > 0) {
      const deletePromises = teacher.galleryImages.map(image =>
        deleteFromCloudinary(image.publicId, 'image')
      );
      await Promise.all(deletePromises);
    }

    await Teacher.findByIdAndDelete(id);
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete Teacher Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get teacher profile (teacher only)
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.userId).select('-password');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(200).json(teacher);
  } catch (error) {
    console.error('Teacher Profile Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update teacher profile (teacher only)
export const updateTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.userId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { fullName, password, subjectsTaught, degree, bio, removePhoto, removeGalleryImages } = req.body;
    const file = req.file; // Main profile photo
    const galleryFiles = req.files?.galleryImages; // Multiple gallery images

    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    let parsedSubjectsTaught;
    try {
      parsedSubjectsTaught = JSON.parse(subjectsTaught);
      if (!Array.isArray(parsedSubjectsTaught) || parsedSubjectsTaught.length === 0) {
        return res.status(400).json({ message: 'At least one subject is required' });
      }
      if (parsedSubjectsTaught.length > 2) {
        return res.status(400).json({ message: 'Maximum two subjects allowed' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid subjectsTaught format' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (degree && degree.length > 100) {
      return res.status(400).json({ message: 'Degree cannot exceed 100 characters' });
    }
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: 'Bio cannot exceed 500 characters' });
    }

    teacher.fullName = fullName;
    if (password) teacher.password = await bcrypt.hash(password, 10);
    teacher.subjectsTaught = parsedSubjectsTaught;
    teacher.degree = degree || '';
    teacher.bio = bio || '';

    if (removePhoto === 'true') {
      if (teacher.photo && teacher.photo.publicId) {
        await deleteFromCloudinary(teacher.photo.publicId, 'image');
      }
      teacher.photo = undefined;
    } else if (file) {
      if (teacher.photo && teacher.photo.publicId) {
        await deleteFromCloudinary(teacher.photo.publicId, 'image');
      }
      const photoUrl = await uploadToCloudinary(file, 'image');
      teacher.photo = { url: photoUrl, publicId: `image_${Date.now()}` };
    }

    if (removeGalleryImages === 'true') {
      if (teacher.galleryImages && teacher.galleryImages.length > 0) {
        const deletePromises = teacher.galleryImages.map(image =>
          deleteFromCloudinary(image.publicId, 'image')
        );
        await Promise.all(deletePromises);
        teacher.galleryImages = [];
      }
    } else if (galleryFiles && Array.isArray(galleryFiles)) {
      const uploadPromises = galleryFiles.map(async (file, index) => {
        const url = await uploadToCloudinary(file, 'image');
        return { url, publicId: `gallery_image_${Date.now()}_${index}` };
      });
      const newGalleryImages = await Promise.all(uploadPromises);
      teacher.galleryImages = [...(teacher.galleryImages || []), ...newGalleryImages];
    }

    await teacher.save();
    const updatedTeacher = await Teacher.findById(req.user.userId).select('-password');
    res.status(200).json(updatedTeacher);
  } catch (error) {
    console.error('Update Teacher Profile Error:', error);
    if (error.message.includes('Cloudinary')) {
      return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get groups for a specific teacher (public access)
export const getTeacherGroups = async (req, res) => {
  try {
    const teacherId = req.params.id || req.user?.userId;
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }
    const groups = await Group.find({ teacher: teacherId })
      .populate('teacher', 'fullName subjectsTaught')
      .populate('grade', 'name');
    res.status(200).json(groups);
  } catch (error) {
    console.error('Get Teacher Groups Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Manage gallery images (admin or teacher)
export const manageGalleryImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { removeImageIds } = req.body; // Array of publicIds to remove
    const galleryFiles = req.files?.galleryImages; // New images to add

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Remove specified images
    if (removeImageIds && Array.isArray(removeImageIds)) {
      const deletePromises = removeImageIds.map(async (publicId) => {
        await deleteFromCloudinary(publicId, 'image');
        teacher.galleryImages = teacher.galleryImages.filter(img => img.publicId !== publicId);
      });
      await Promise.all(deletePromises);
    }

    // Add new images
    if (galleryFiles && Array.isArray(galleryFiles)) {
      const uploadPromises = galleryFiles.map(async (file, index) => {
        const url = await uploadToCloudinary(file, 'image');
        return { url, publicId: `gallery_image_${Date.now()}_${index}` };
      });
      const newGalleryImages = await Promise.all(uploadPromises);
      teacher.galleryImages = [...(teacher.galleryImages || []), ...newGalleryImages];
    }

    await teacher.save();
    const updatedTeacher = await Teacher.findById(id).select('-password');
    res.status(200).json(updatedTeacher);
  } catch (error) {
    console.error('Manage Gallery Images Error:', error);
    if (error.message.includes('Cloudinary')) {
      return res.status(500).json({ message: 'Failed to upload or delete images from Cloudinary' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};