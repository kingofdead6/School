import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Group from '../models/Group.js';
import Teacher from '../models/Teacher.js';

// Get all students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate({
      path: 'groups',
      populate: [
        { path: 'teacher', select: 'fullName' },
        { path: 'grade', select: 'name' }
      ],
    }).populate('grade', 'name');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).populate({
      path: 'groups',
      populate: [
        { path: 'teacher', select: 'fullName' },
        { path: 'grade', select: 'name' }
      ],
    }).populate('grade', 'name');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a student
export const addStudent = async (req, res) => {
  try {
    const { firstName, lastName, parentInfo, grade, groups, teacher } = req.body;
    if (!firstName || !lastName || !parentInfo.name || !parentInfo.email || !grade || !groups || !teacher) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    if (!/^\S+@\S+\.\S+$/.test(parentInfo.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const gradeExists = await Grade.findById(grade);
    if (!gradeExists) {
      return res.status(400).json({ message: 'Invalid grade ID' });
    }
    const teacherExists = await Teacher.findById(teacher);
    if (!teacherExists) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }
    const group = await Group.findById(groups[0]);
    if (!group) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    if (group.teacher.toString() !== teacher) {
      return res.status(400).json({ message: 'Selected teacher does not teach this group' });
    }
    const student = new Student({
      firstName,
      lastName,
      parentInfo,
      grade,
      groups,
    });
    await student.save();
    const populatedStudent = await Student.findById(student._id)
      .populate({
        path: 'groups',
        populate: [
          { path: 'teacher', select: 'fullName' },
          { path: 'grade', select: 'name' }
        ],
      })
      .populate('grade', 'name');
    res.status(201).json({ message: 'Student added successfully', student: populatedStudent });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add student', error: error.message });
  }
};

// Add a group to a student
export const addGroupToStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { group, teacher } = req.body;
    if (!group || !teacher) {
      return res.status(400).json({ message: 'Group and teacher are required' });
    }
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const groupExists = await Group.findById(group);
    if (!groupExists) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    const teacherExists = await Teacher.findById(teacher);
    if (!teacherExists) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }
    if (groupExists.teacher.toString() !== teacher) {
      return res.status(400).json({ message: 'Selected teacher does not teach this group' });
    }
    if (groupExists.grade.toString() !== student.grade.toString()) {
      return res.status(400).json({ message: 'Group grade does not match student grade' });
    }
    if (student.groups.includes(group)) {
      return res.status(400).json({ message: 'Student is already in this group' });
    }
    student.groups.push(group);
    await student.save();
    const populatedStudent = await Student.findById(id)
      .populate({
        path: 'groups',
        populate: [
          { path: 'teacher', select: 'fullName' },
          { path: 'grade', select: 'name' }
        ],
      })
      .populate('grade', 'name');
    res.status(200).json({ message: 'Group added to student successfully', student: populatedStudent });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add group to student', error: error.message });
  }
};

// Delete a student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await Student.findByIdAndDelete(id);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};