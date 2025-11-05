import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoute.js';
import teacherRoutes from './routes/teacherRoute.js';
import studentRoutes from './routes/studentRoute.js';
import registrationRoutes from './routes/registrationRoute.js';
import groupRoutes from './routes/groupRoute.js';
import gradeRoutes from './routes/gradeRoute.js';
import galleryRoutes from './routes/galleryRoute.js';
import contactRoutes from './routes/ContactRoute.js';
import announcementRoutes from './routes/AnnouncementRoute.js';
import newsletterRoutes from './routes/newslettersRoute.js';
import programRoutes from './routes/programRoute.js';
import testimonialRoutes from './routes/testimonialRoutes.js'
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/gallery' , galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/programs' , programRoutes);
app.use("/api/testimonials", testimonialRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));