import GalleryImage from '../models/Gallery.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/Cloudinary.js';



// Get all gallery images
export const getGalleryImages = asyncHandler(async (req, res) => {
  const images = await GalleryImage.find({}).lean();
  res.status(200).json(images);
});

// Upload multiple gallery images
export const uploadGalleryImage = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'At least one image is required' });
  }
  if (files.length > 10) {
    return res.status(400).json({ message: 'Cannot upload more than 10 images at once' });
  }

  const uploadedImages = [];
  try {
    for (const file of files) {
      const imageUrl = await uploadToCloudinary(file);
      const galleryImage = new GalleryImage({ image: imageUrl });
      await galleryImage.save();
      uploadedImages.push(galleryImage);
    }
    res.status(201).json({ message: 'Images uploaded successfully', images: uploadedImages });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ message: 'Failed to upload images to Cloudinary' });
  }
});

// Delete a gallery image
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findById(req.params.id);

  if (!image) {
    return res.status(404).json({ message: 'Image not found' });
  }

  // Delete image from Cloudinary if it exists
  if (image.image) {
    const publicId = image.image.split('/').pop().split('.')[0];
    await deleteFromCloudinary(`Tyabelawras-website/${publicId}`).catch((err) => {
      console.error('Cloudinary deletion error:', err);
    });
  }

  await GalleryImage.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: 'Image deleted successfully' });
});