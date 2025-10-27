import Newsletter from '../models/NewsLetter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import validator from 'validator';
import nodemailer from 'nodemailer';


// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Subscribe to newsletter
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate input
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Check if email already subscribed
  const existingSubscription = await Newsletter.findOne({ email });
  if (existingSubscription) {
    return res.status(400).json({ message: 'Email is already subscribed' });
  }

  const subscription = await Newsletter.create({ email });
  res.status(201).json({ message: 'Subscribed successfully', subscription });
});

// Get all subscribers (admin only)
export const getSubscribers = asyncHandler(async (req, res) => {
  
  const subscribers = await Newsletter.find({}).lean();
  res.status(200).json(subscribers);
});

// Delete a subscriber (admin only)
export const deleteSubscriber = asyncHandler(async (req, res) => {
  
  const subscriber = await Newsletter.findById(req.params.id);

  if (!subscriber) {
    return res.status(404).json({ message: 'Subscriber not found' });
  }

  await Newsletter.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Subscriber deleted successfully' });
});

// Send newsletter to selected subscribers (admin only)
export const sendNewsletter = asyncHandler(async (req, res) => {
  const { subscriberIds, subject, message, isHtml } = req.body;

  // Validate inputs
  if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
    return res.status(400).json({ message: 'At least one subscriber must be selected' });
  }
  if (!subject || subject.trim() === "") {
    return res.status(400).json({ message: 'Subject is required' });
  }
  if (!message || message.trim() === "") {
    return res.status(400).json({ message: 'Message is required' });
  }

  // Fetch selected subscribers
  const subscribers = await Newsletter.find({ _id: { $in: subscriberIds } });
  if (subscribers.length === 0) {
    return res.status(404).json({ message: 'No valid subscribers found' });
  }

  // Prepare email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Gmail requires "to"
    subject,
    bcc: subscribers.map((sub) => sub.email),
    // choose between html or text
    ...(isHtml
      ? { html: message } // render as HTML
      : { text: message } // render as plain text
    )
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Newsletter sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Failed to send newsletter' });
  }
});
