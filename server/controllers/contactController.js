import Contact from '../models/Contact.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import validator from 'validator';


// Submit a contact message
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // Validate inputs
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }
  if (!validator.isLength(name, { min: 1, max: 100 })) {
    return res.status(400).json({ message: 'Name must be between 1 and 100 characters' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (!validator.isLength(message, { min: 1, max: 1000 })) {
    return res.status(400).json({ message: 'Message must be between 1 and 1000 characters' });
  }

  const contact = await Contact.create({ name, email, message });
  res.status(201).json({ message: 'Message sent successfully', contact });
});

// Get all contact messages (admin only)
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({}).lean();
  res.status(200).json(contacts);
});

// Delete a contact message (admin only)
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({ message: 'Contact message not found' });
  }

  await Contact.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Contact message deleted successfully' });
});