import Registration from '../models/Registration.js';

// Get all registrations (admin only)
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().populate({
      path: 'group',
      populate: [
        { path: 'teacher', select: 'fullName' },
        { path: 'program', select: 'name' }
      ]
    });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update registration status (admin only)
export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const registration = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate({
      path: 'group',
      populate: [
        { path: 'teacher', select: 'fullName' },
        { path: 'program', select: 'name' }
      ]
    });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(200).json({ message: 'Registration updated', registration });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update registration', error: error.message });
  }
};

// Create a new registration (public)
export const createRegistration = async (req, res) => {
  try {
    const { studentInfo, parentInfo, group } = req.body;
    if (!studentInfo.firstName || !studentInfo.lastName || !studentInfo.grade ||
        !parentInfo.name || !parentInfo.email || !group) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    if (!/^\S+@\S+\.\S+$/.test(parentInfo.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const registration = new Registration({
      studentInfo,
      parentInfo,
      group,
      status: 'pending',
    });
    await registration.save();
    res.status(201).json({ message: 'Registration submitted successfully', registration });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create registration', error: error.message });
  }
};