import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Group from '../models/Group.js';

// Get all grades
export const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().select('name _id');
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a grade
export const addGrade = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Grade name is required' });
    }
    const existingGrade = await Grade.findOne({ name });
    if (existingGrade) {
      return res.status(400).json({ message: 'Grade already exists' });
    }
    const grade = new Grade({ name });
    await grade.save();
    res.status(201).json({ message: 'Grade added successfully', grade });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a grade
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    const students = await Student.find({ grade: id });
    if (students.length > 0) {
      return res.status(400).json({ message: 'Cannot delete grade with registered students' });
    }
    const groups = await Group.find({ grade: id });
    if (groups.length > 0) {
      return res.status(400).json({ message: 'Cannot delete grade with associated groups' });
    }
    await Grade.findByIdAndDelete(id);
    res.status(200).json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students by grade
export const getStudentsByGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await Student.find({ grade: id }).select('firstName lastName');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get groups by grade
export const getGroupsByGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await Group.find({ grade: id }).populate('teacher', 'fullName');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};