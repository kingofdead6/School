import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/Cloudinary.js';
import Announcement from '../models/Announcement.js';
import validator from 'validator';

// Helper to ensure admin or superadmin access
const ensureAdmin = (user) => {
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    throw new Error('Admin access required');
  }
};

// Get all announcements
export const getAnnouncements = asyncHandler(async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .populate('creator', 'fullName')
      .lean();
    if (!announcements) {
      return res.status(404).json({ message: 'No announcements found' });
    }
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error in getAnnouncements:', error);
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
});

// Create a new announcement
export const createAnnouncement = asyncHandler(async (req, res) => {
  try {
    ensureAdmin(req.user);
    const { title, description } = req.body;
    const image = req.file;

    // Validate inputs
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    if (!validator.isLength(title, { min: 1, max: 100 })) {
      return res.status(400).json({ message: 'Title must be between 1 and 100 characters' });
    }
    if (!validator.isLength(description, { min: 1, max: 1000 })) {
      return res.status(400).json({ message: 'Description must be between 1 and 1000 characters' });
    }

    let imageUrl = null;
    if (image) {
      try {
        imageUrl = await uploadToCloudinary(image);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(400).json({ message: 'Failed to upload image to Cloudinary', error: error.message });
      }
    }

    const announcement = new Announcement({
      title,
      description,
      image: imageUrl,
      creator: req.user._id,
    });
    await announcement.save();

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('creator', 'fullName')
      .lean();

    res.status(201).json({ message: 'Announcement created successfully', announcement: populatedAnnouncement });
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
});

// Update an announcement
export const updateAnnouncement = asyncHandler(async (req, res) => {
  try {
    ensureAdmin(req.user);
    const { title, description } = req.body;
    const image = req.file;
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Validate inputs
    if (title && !validator.isLength(title, { min: 1, max: 100 })) {
      return res.status(400).json({ message: 'Title must be between 1 and 100 characters' });
    }
    if (description && !validator.isLength(description, { min: 1, max: 1000 })) {
      return res.status(400).json({ message: 'Description must be between 1 and 1000 characters' });
    }

    if (image) {
      try {
        // Delete old image from Cloudinary if it exists
        if (announcement.image) {
          const publicId = announcement.image.split('/').pop().split('.')[0];
          await deleteFromCloudinary(`Tyabelawras-website/${publicId}`).catch((err) => {
            console.error('Cloudinary deletion error:', err);
          });
        }
        // Upload new image
        announcement.image = await uploadToCloudinary(image);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(400).json({ message: 'Failed to upload image to Cloudinary', error: error.message });
      }
    }

    announcement.title = title || announcement.title;
    announcement.description = description || announcement.description;
    announcement.updatedAt = Date.now();
    await announcement.save();

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('creator', 'fullName')
      .lean();

    res.status(200).json({ message: 'Announcement updated successfully', announcement: populatedAnnouncement });
  } catch (error) {
    console.error('Error in updateAnnouncement:', error);
    res.status(500).json({ message: 'Failed to update announcement', error: error.message });
  }
});

// Delete an announcement
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  try {
    ensureAdmin(req.user);
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Delete image from Cloudinary if it exists
    if (announcement.image) {
      const publicId = announcement.image.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`Tyabelawras-website/${publicId}`).catch((err) => {
        console.error('Cloudinary deletion error:', err);
      });
    }

    await Announcement.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error);
    res.status(500).json({ message: 'Failed to delete announcement', error: error.message });
  }
});