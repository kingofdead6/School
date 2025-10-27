// controllers/programController.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/Cloudinary.js';
import Program from '../models/Program.js';
import validator from 'validator';

// Get all programs
export const getPrograms = asyncHandler(async (req, res) => {
  try {
    const programs = await Program.find({})
      .populate('yearLevel', 'name') // Populate grade name
      .lean();
    if (!programs || programs.length === 0) {
      return res.status(404).json({ message: 'No programs found' });
    }
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error in getPrograms:', error);
    res.status(500).json({ message: 'Failed to fetch programs', error: error.message });
  }
});

// Create a new program (admin only)
export const createProgram = asyncHandler(async (req, res) => {
  try {
    const { name, yearLevel } = req.body;
    const image = req.file;

    // Validate inputs
    if (!name || !yearLevel) {
      return res.status(400).json({ message: 'Name and yearLevel are required' });
    }
    if (!validator.isLength(name, { min: 1, max: 100 })) {
      return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
    }
    if (!validator.isMongoId(yearLevel)) {
      return res.status(400).json({ message: 'Invalid yearLevel ID' });
    }

    let imageData = null;
    if (image) {
      try {
        const imageUrl = await uploadToCloudinary(image, 'image');
        imageData = {
          url: imageUrl,
          publicId: `program_image_${Date.now()}`,
        };
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(400).json({ message: 'Failed to upload image to Cloudinary', error: error.message });
      }
    }

    const program = new Program({
      name,
      yearLevel,
      image: imageData ? imageData.url : null,
      publicId: imageData ? imageData.publicId : null,
    });
    await program.save();

    const populatedProgram = await Program.findById(program._id)
      .populate('yearLevel', 'name')
      .lean();

    res.status(201).json({ message: 'Program created successfully', program: populatedProgram });
  } catch (error) {
    console.error('Error in createProgram:', error);
    res.status(500).json({ message: 'Failed to create program', error: error.message });
  }
});

// Update a program (admin only)
export const updateProgram = asyncHandler(async (req, res) => {
  try {
    const { name, yearLevel } = req.body;
    const image = req.file;
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Validate inputs
    if (name && !validator.isLength(name, { min: 1, max: 100 })) {
      return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
    }
    if (yearLevel && !validator.isMongoId(yearLevel)) {
      return res.status(400).json({ message: 'Invalid yearLevel ID' });
    }

    if (image) {
      try {
        // Delete old image from Cloudinary if it exists
        if (program.publicId) {
          await deleteFromCloudinary(program.publicId, 'image').catch((err) => {
            console.error('Cloudinary deletion error:', err);
          });
        }
        // Upload new image
        const imageUrl = await uploadToCloudinary(image, 'image');
        program.image = imageUrl;
        program.publicId = `program_image_${Date.now()}`;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(400).json({ message: 'Failed to upload image to Cloudinary', error: error.message });
      }
    }

    program.name = name || program.name;
    program.yearLevel = yearLevel || program.yearLevel;
    program.updatedAt = Date.now();
    await program.save();

    const populatedProgram = await Program.findById(program._id)
      .populate('yearLevel', 'name')
      .lean();

    res.status(200).json({ message: 'Program updated successfully', program: populatedProgram });
  } catch (error) {
    console.error('Error in updateProgram:', error);
    res.status(500).json({ message: 'Failed to update program', error: error.message });
  }
});

// Delete a program (admin only)
export const deleteProgram = asyncHandler(async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Delete image from Cloudinary if it exists
    if (program.publicId) {
      await deleteFromCloudinary(program.publicId, 'image').catch((err) => {
        console.error('Cloudinary deletion error:', err);
      });
    }

    await Program.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProgram:', error);
    res.status(500).json({ message: 'Failed to delete program', error: error.message });
  }
});