// controllers/registrationController.js
import Registration from '../models/Registration.js';

// Helper to populate everything we need
const populateRegistration = (query) =>
  query
    .populate({
      path: 'group',
      populate: [
        { path: 'teacher', select: 'fullName' },
        { path: 'grade', select: 'name' },          // <-- NEW
        // { path: 'program', select: 'name' }      // <-- REMOVE (does NOT exist)
      ].filter(Boolean),
    })
    .sort({ createdAt: -1 });

export const getRegistrations = async (req, res) => {
  try {
    const registrations = await populateRegistration(Registration.find());
    res.status(200).json(registrations);
  } catch (error) {
    console.error('getRegistrations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const populated = await populateRegistration(Registration.findById(id));
    res.status(200).json({ message: 'Registration updated', registration: populated });
  } catch (error) {
    console.error('updateRegistration error:', error);
    res.status(400).json({ message: 'Failed to update registration', error: error.message });
  }
};

export const createRegistration = async (req, res) => {
  try {
    const { studentInfo, parentInfo, group } = req.body;

    // ---- Validation -------------------------------------------------
    if (
      !studentInfo?.firstName?.trim() ||
      !studentInfo?.lastName?.trim() ||
      !studentInfo?.grade ||
      !parentInfo?.name?.trim() ||
      !parentInfo?.email?.trim() ||
      !group
    ) {
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
    const populated = await populateRegistration(Registration.findById(registration._id));
    res.status(201).json({ message: 'Registration submitted successfully', registration: populated });
  } catch (error) {
    console.error('createRegistration error:', error);
    res.status(400).json({ message: 'Failed to create registration', error: error.message });
  }
};