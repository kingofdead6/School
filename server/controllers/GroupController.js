import Group from '../models/Group.js';
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Teacher from '../models/Teacher.js';

// Get all groups (admin only)
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('teacher', 'fullName subjectsTaught')
      .populate('grade', 'name');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new group (admin only)
export const createGroup = async (req, res) => {
  try {
    const { name, teacher, subject, grade, schedule } = req.body;
    if (!name || !teacher || !subject || !schedule.day || !schedule.startingtime || !schedule.endingtime) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (grade) {
      const gradeExists = await Grade.findById(grade);
      if (!gradeExists) {
        return res.status(400).json({ message: 'Invalid grade ID' });
      }
    }
    const teacherExists = await Teacher.findById(teacher);
    if (!teacherExists) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }
    if (!teacherExists.subjectsTaught.includes(subject)) {
      return res.status(400).json({ message: 'Teacher does not teach this subject' });
    }
    const group = new Group({
      name,
      teacher,
      subject,
      grade,
      schedule,
    });
    await group.save();
    const populatedGroup = await Group.findById(group._id)
      .populate('teacher', 'fullName subjectsTaught')
      .populate('grade', 'name');
    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update group schedule (admin only)
export const updateGroupSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;
    if (!schedule.day || !schedule.startingtime || !schedule.endingtime) {
      return res.status(400).json({ message: 'All schedule fields are required' });
    }
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    group.schedule = schedule;
    await group.save();
    const populatedGroup = await Group.findById(id)
      .populate('teacher', 'fullName subjectsTaught')
      .populate('grade', 'name');
    res.status(200).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students by group (admin and teacher access)
export const getStudentsByGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const students = await Student.find({ groups: id })
      .select('firstName lastName parentInfo grade')
      .populate('grade', 'name');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get groups by grade (admin only)
export const getGroupsByGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const groups = await Group.find({ grade: id })
      .populate('teacher', 'fullName subjectsTaught')
      .populate('grade', 'name');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a group (admin only)
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    await Group.findByIdAndDelete(id);
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};