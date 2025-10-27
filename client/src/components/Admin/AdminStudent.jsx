import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaUser, FaEnvelope, FaPhone, FaInfoCircle } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminStudent() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentInfo: { firstName: "", lastName: "", grade: "" },
    parentInfo: { name: "", email: "", phone: "" },
    subject: "",
    teacher: "",
    group: "",
  });
  const [addGroupFormData, setAddGroupFormData] = useState({
    grade: "",
    subject: "",
    teacher: "",
    group: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [addGroupFormErrors, setAddGroupFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subjects = [
    "Math",
    "Physics",
    "Science",
    "Arabic",
    "English",
    "French",
    "Islamic",
    "History",
    "Geography",
    "Philosophy",
  ];

  useEffect(() => {
    fetchStudents();
    fetchGrades();
    fetchGroups();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(err.response?.data?.message || "Error fetching students");
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/grades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrades(response.data);
    } catch (err) {
      console.error("Fetch grades error:", err);
      setError(err.response?.data?.message || "Error fetching grades");
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
    } catch (err) {
      console.error("Fetch groups error:", err);
      setError(err.response?.data?.message || "Error fetching groups");
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data);
    } catch (err) {
      console.error("Fetch teachers error:", err);
      setError(err.response?.data?.message || "Error fetching teachers");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.studentInfo.firstName) errors.firstName = "Student first name is required";
    if (!formData.studentInfo.lastName) errors.lastName = "Student last name is required";
    if (!formData.studentInfo.grade) errors.grade = "Grade is required";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.teacher) errors.teacher = "Teacher is required";
    if (!formData.group) errors.group = "Group is required";
    if (!formData.parentInfo.name) errors.parentName = "Parent name is required";
    if (!formData.parentInfo.email) errors.parentEmail = "Parent email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.parentInfo.email))
      errors.parentEmail = "Invalid email format";
    return errors;
  };

  const validateAddGroupForm = () => {
    const errors = {};
    if (!addGroupFormData.grade) errors.grade = "Grade is required";
    if (!addGroupFormData.subject) errors.subject = "Subject is required";
    if (!addGroupFormData.teacher) errors.teacher = "Teacher is required";
    if (!addGroupFormData.group) errors.group = "Group is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        firstName: formData.studentInfo.firstName,
        lastName: formData.studentInfo.lastName,
        parentInfo: formData.parentInfo,
        grade: formData.studentInfo.grade,
        groups: [formData.group],
        teacher: formData.teacher,
      };
      await axios.post(`${API_BASE_URL}/students`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setSuccess(true);
      setShowModal(false);
      setFormData({
        studentInfo: { firstName: "", lastName: "", grade: "" },
        parentInfo: { name: "", email: "", phone: "" },
        subject: "",
        teacher: "",
        group: "",
      });
      setFormErrors({});
      fetchStudents();
    } catch (err) {
      console.error("Create student error:", err);
      setError(err.response?.data?.message || "Error creating student");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroupSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAddGroupForm();
    setAddGroupFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/students/${selectedStudent._id}/add-group`,
        { group: addGroupFormData.group, teacher: addGroupFormData.teacher },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setSuccess(true);
      setShowAddGroupModal(false);
      setAddGroupFormData({ grade: "", subject: "", teacher: "", group: "" });
      setAddGroupFormErrors({});
      fetchStudents();
      // Refresh selected student data
      const updatedStudent = await axios.get(`${API_BASE_URL}/students/${selectedStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedStudent(updatedStudent.data);
    } catch (err) {
      console.error("Add group error:", err);
      setError(err.response?.data?.message || "Error adding group to student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudents();
      if (selectedStudent?._id === id) {
        setShowDetailsModal(false);
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error("Delete student error:", err);
      setError(err.response?.data?.message || "Error deleting student");
    }
  };

  const handleDetailsClick = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const filteredGroups = groups.filter(
    (group) =>
      (!formData.studentInfo.grade || group.grade?._id === formData.studentInfo.grade) &&
      (!formData.subject || group.subject === formData.subject) &&
      (!formData.teacher || group.teacher?._id === formData.teacher)
  );

  const filteredAddGroupGroups = groups.filter(
    (group) =>
      (!addGroupFormData.grade || group.grade?._id === addGroupFormData.grade) &&
      (!addGroupFormData.subject || group.subject === addGroupFormData.subject) &&
      (!addGroupFormData.teacher || group.teacher?._id === addGroupFormData.teacher) &&
      (!selectedStudent || !selectedStudent.groups.some((g) => g._id === group._id))
  );

  const filteredTeachers = teachers.filter(
    (teacher) => formData.subject && teacher.subjectsTaught.includes(formData.subject)
  );

  const filteredAddGroupTeachers = teachers.filter(
    (teacher) =>
      addGroupFormData.subject && teacher.subjectsTaught.includes(addGroupFormData.subject)
  );

  const filteredStudents = students.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.parentInfo.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((student) => (filterGrade ? student.grade?._id === filterGrade : true));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-black h-48 flex items-center justify-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Students Management</h1>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-red-600">Student List</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
          >
            <FaPlus /> Add Student
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center mb-6 font-medium bg-red-900/20 p-3 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 text-center mb-6 font-medium bg-green-900/20 p-3 rounded-lg"
          >
            {showAddGroupModal ? "Group added successfully!" : "Student added successfully!"}
          </motion.p>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or parent email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <FaUser />
            </div>
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full sm:w-1/4 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          >
            <option value="">All Grades</option>
            {grades.map((grade) => (
              <option key={grade._id} value={grade._id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-red-600/30 backdrop-blur-sm overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-red-600/20 text-red-600">
                  <th className="px-4 py-3 text-left font-semibold">First Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Grade</th>
                  <th className="px-4 py-3 text-left font-semibold">Parent Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Parent Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Parent Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, i) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800"
                  >
                    <td className="px-4 py-3 text-gray-300">{student.firstName}</td>
                    <td className="px-4 py-3 text-gray-300">{student.lastName}</td>
                    <td className="px-4 py-3 text-gray-300">{student.grade?.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-300">{student.parentInfo.name}</td>
                    <td className="px-4 py-3 text-gray-300">{student.parentInfo.email}</td>
                    <td className="px-4 py-3 text-gray-300">{student.parentInfo.phone || "-"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDetailsClick(student)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <FaInfoCircle /> Details
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(student._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        <FaTrash /> Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-200 bg-gray-800 p-4 rounded-lg">No students found</p>
        )}

        {/* Add Student Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-red-600/50"
              >
                <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">Add New Student</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Student First Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.studentInfo.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentInfo: {
                              ...formData.studentInfo,
                              firstName: e.target.value,
                            },
                          })
                        }
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          formErrors.firstName ? "border-red-500" : "border-gray-600"
                        } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                        placeholder="Enter first name"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser />
                      </div>
                    </div>
                    {formErrors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Student Last Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.studentInfo.lastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentInfo: {
                              ...formData.studentInfo,
                              lastName: e.target.value,
                            },
                          })
                        }
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          formErrors.lastName ? "border-red-500" : "border-gray-600"
                        } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                        placeholder="Enter last name"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser />
                      </div>
                    </div>
                    {formErrors.lastName && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Grade</label>
                    <select
                      value={formData.studentInfo.grade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentInfo: { ...formData.studentInfo, grade: e.target.value },
                          subject: "",
                          teacher: "",
                          group: "",
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.grade ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.grade && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.grade}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subject: e.target.value,
                          teacher: "",
                          group: "",
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.subject ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={!formData.studentInfo.grade}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    {formErrors.subject && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.subject}</p>
                    )}
                    {!formData.studentInfo.grade && (
                      <p className="text-gray-400 text-sm mt-1">Select a grade first</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Teacher</label>
                    <select
                      value={formData.teacher}
                      onChange={(e) =>
                        setFormData({ ...formData, teacher: e.target.value, group: "" })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.teacher ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={!formData.subject}
                    >
                      <option value="">Select Teacher</option>
                      {filteredTeachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName}
                        </option>
                      ))}
                    </select>
                    {formErrors.teacher && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.teacher}</p>
                    )}
                    {!formData.subject && (
                      <p className="text-gray-400 text-sm mt-1">Select a subject first</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Group</label>
                    <select
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.group ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={!formData.studentInfo.grade || !formData.subject || !formData.teacher}
                    >
                      <option value="">Select Group</option>
                      {filteredGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {`${group.name} (${group.subject}, ${group.schedule.day} ${group.schedule.startingtime}-${group.schedule.endingtime})`}
                        </option>
                      ))}
                    </select>
                    {formErrors.group && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.group}</p>
                    )}
                    {(!formData.studentInfo.grade || !formData.subject || !formData.teacher) && (
                      <p className="text-gray-400 text-sm mt-1">
                        Select a grade, subject, and teacher first
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Parent Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.parentInfo.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parentInfo: { ...formData.parentInfo, name: e.target.value },
                          })
                        }
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          formErrors.parentName ? "border-red-500" : "border-gray-600"
                        } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                        placeholder="Enter parent name"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser />
                      </div>
                    </div>
                    {formErrors.parentName && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.parentName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Parent Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.parentInfo.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parentInfo: { ...formData.parentInfo, email: e.target.value },
                          })
                        }
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          formErrors.parentEmail ? "border-red-500" : "border-gray-600"
                        } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                        placeholder="Enter parent email"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaEnvelope />
                      </div>
                    </div>
                    {formErrors.parentEmail && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.parentEmail}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Parent Phone (Optional)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.parentInfo.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parentInfo: { ...formData.parentInfo, phone: e.target.value },
                          })
                        }
                        className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                        placeholder="Enter parent phone"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaPhone />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      onClick={handleSubmit}
                      className={`flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Creating..." : "Add Student"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Student Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedStudent && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-red-600/50"
              >
                <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">
                  {selectedStudent.firstName} {selectedStudent.lastName}'s Details
                </h2>
                {selectedStudent.groups?.length > 0 ? (
                  <table className="w-full table-auto mb-6">
                    <thead>
                      <tr className="bg-red-600/20 text-red-600">
                        <th className="px-4 py-3 text-left font-semibold">Subject</th>
                        <th className="px-4 py-3 text-left font-semibold">Teacher</th>
                        <th className="px-4 py-3 text-left font-semibold">Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.groups.map((group) => (
                        <tr key={group._id} className="border-b border-gray-800">
                          <td className="px-4 py-3 text-gray-300">{group.subject}</td>
                          <td className="px-4 py-3 text-gray-300">{group.teacher?.fullName || "-"}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {`${group.name} (${group.schedule.day} ${group.schedule.startingtime}-${group.schedule.endingtime})`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-200 text-center mb-6">No groups assigned</p>
                )}
                <div className="flex justify-between gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setAddGroupFormData({ grade: selectedStudent.grade._id, subject: "", teacher: "", group: "" });
                      setShowAddGroupModal(true);
                    }}
                    className="flex items-center gap-2 flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
                  >
                    <FaPlus /> Add to Another Group
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    disabled={loading}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Group to Student Modal */}
        <AnimatePresence>
          {showAddGroupModal && selectedStudent && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-red-600/50"
              >
                <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">
                  Add {selectedStudent.firstName} {selectedStudent.lastName} to Group
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Grade</label>
                    <select
                      value={addGroupFormData.grade}
                      onChange={(e) =>
                        setAddGroupFormData({
                          ...addGroupFormData,
                          grade: e.target.value,
                          subject: "",
                          teacher: "",
                          group: "",
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        addGroupFormErrors.grade ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                    {addGroupFormErrors.grade && (
                      <p className="text-red-400 text-sm mt-1">{addGroupFormErrors.grade}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Subject</label>
                    <select
                      value={addGroupFormData.subject}
                      onChange={(e) =>
                        setAddGroupFormData({
                          ...addGroupFormData,
                          subject: e.target.value,
                          teacher: "",
                          group: "",
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        addGroupFormErrors.subject ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    {addGroupFormErrors.subject && (
                      <p className="text-red-400 text-sm mt-1">{addGroupFormErrors.subject}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Teacher</label>
                    <select
                      value={addGroupFormData.teacher}
                      onChange={(e) =>
                        setAddGroupFormData({
                          ...addGroupFormData,
                          teacher: e.target.value,
                          group: "",
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        addGroupFormErrors.teacher ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={!addGroupFormData.subject}
                    >
                      <option value="">Select Teacher</option>
                      {filteredAddGroupTeachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName}
                        </option>
                      ))}
                    </select>
                    {addGroupFormErrors.teacher && (
                      <p className="text-red-400 text-sm mt-1">{addGroupFormErrors.teacher}</p>
                    )}
                    {!addGroupFormData.subject && (
                      <p className="text-gray-400 text-sm mt-1">Select a subject first</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Group</label>
                    <select
                      value={addGroupFormData.group}
                      onChange={(e) =>
                        setAddGroupFormData({ ...addGroupFormData, group: e.target.value })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        addGroupFormErrors.group ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={!addGroupFormData.grade || !addGroupFormData.subject || !addGroupFormData.teacher}
                    >
                      <option value="">Select Group</option>
                      {filteredAddGroupGroups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {`${group.name} (${group.subject}, ${group.schedule.day} ${group.schedule.startingtime}-${group.schedule.endingtime})`}
                        </option>
                      ))}
                    </select>
                    {addGroupFormErrors.group && (
                      <p className="text-red-400 text-sm mt-1">{addGroupFormErrors.group}</p>
                    )}
                    {(!addGroupFormData.grade || !addGroupFormData.subject || !addGroupFormData.teacher) && (
                      <p className="text-gray-400 text-sm mt-1">
                        Select a grade, subject, and teacher first
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      onClick={handleAddGroupSubmit}
                      className={`flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Adding..." : "Add to Group"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAddGroupModal(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}