import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaUser, FaEnvelope, FaPhone, FaInfoCircle, FaTimes, FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
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
    "Math", "Physics", "Science", "Arabic", "English", "French",
    "Islamic", "History", "Geography", "Philosophy"
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
      setError(err.response?.data?.message || "Error fetching teachers");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.studentInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.studentInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.studentInfo.grade) errors.grade = "Grade is required";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.teacher) errors.teacher = "Teacher is required";
    if (!formData.group) errors.group = "Group is required";
    if (!formData.parentInfo.name.trim()) errors.parentName = "Parent name is required";
    if (!formData.parentInfo.email.trim()) errors.parentEmail = "Parent email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.parentInfo.email))
      errors.parentEmail = "Invalid email format";
    return errors;
  };

  const validateAddGroupForm = () => {
    const errors = {};
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
        firstName: formData.studentInfo.firstName.trim(),
        lastName: formData.studentInfo.lastName.trim(),
        parentInfo: {
          name: formData.parentInfo.name.trim(),
          email: formData.parentInfo.email.trim(),
          phone: formData.parentInfo.phone.trim(),
        },
        grade: formData.studentInfo.grade,
        groups: [formData.group],
        teacher: formData.teacher,
      };
      await axios.post(`${API_BASE_URL}/students`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setShowModal(false);
      setFormData({
        studentInfo: { firstName: "", lastName: "", grade: "" },
        parentInfo: { name: "", email: "", phone: "" },
        subject: "", teacher: "", group: ""
      });
      setFormErrors({});
      fetchStudents();
    } catch (err) {
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
      setTimeout(() => setSuccess(false), 3000);
      setShowAddGroupModal(false);
      setAddGroupFormData({ grade: "", subject: "", teacher: "", group: "" });
      setAddGroupFormErrors({});
      fetchStudents();
      const updatedStudent = await axios.get(`${API_BASE_URL}/students/${selectedStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedStudent(updatedStudent.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding group to student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
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
    (teacher) => addGroupFormData.subject && teacher.subjectsTaught.includes(addGroupFormData.subject)
  );

  const filteredStudents = students
    .filter((student) =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentInfo.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((student) => (filterGrade ? student.grade?._id === filterGrade : true));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="text-3xl md:text-4xl font-extrabold text-red-600 flex items-center gap-3"
          >
            <FaGraduationCap className="text-red-700" />
            Students Management
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPlus /> Add Student
          </motion.button>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-600 text-center mb-6 font-medium bg-green-50 p-3 rounded-lg border border-green-200"
            >
              {showAddGroupModal ? "Group added successfully!" : "Student added successfully!"}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full md:w-64 p-4 rounded-xl bg-white border-2 border-red-200 text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
          >
            <option value="">All Grades</option>
            {grades.map((grade) => (
              <option key={grade._id} value={grade._id}>{grade.name}</option>
            ))}
          </select>
        </div>

        {/* Student Cards */}
        {filteredStudents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, i) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-red-700 line-clamp-1">
                    {student.firstName} {student.lastName}
                  </h3>
                  <span className="text-xs text-gray-500 bg-red-50 px-2 py-1 rounded-full">
                    {student.grade?.name || "N/A"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <FaUser className="text-red-500" /> {student.parentInfo.name}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="text-red-500" /> {student.parentInfo.email}
                  </p>
                  {student.parentInfo.phone && (
                    <p className="flex items-center gap-2">
                      <FaPhone className="text-red-500" /> {student.parentInfo.phone}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDetailsClick(student)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaInfoCircle /> Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(student._id)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaTrash /> Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 mt-16 text-lg"
          >
            No students found
          </motion.p>
        )}

        {/* Add Student Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-red-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-red-700">Add New Student</h2>
                  <button onClick={() => setShowModal(false)} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Student Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-red-700 font-semibold mb-2">First Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.studentInfo.firstName}
                          onChange={(e) => setFormData({
                            ...formData,
                            studentInfo: { ...formData.studentInfo, firstName: e.target.value }
                          })}
                          className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                            formErrors.firstName ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                          }`}
                          placeholder="Enter first name"
                        />
                        <FaUser className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                      </div>
                      {formErrors.firstName && <p className="text-red-600 text-sm mt-1">{formErrors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-red-700 font-semibold mb-2">Last Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.studentInfo.lastName}
                          onChange={(e) => setFormData({
                            ...formData,
                            studentInfo: { ...formData.studentInfo, lastName: e.target.value }
                          })}
                          className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                            formErrors.lastName ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                          }`}
                          placeholder="Enter last name"
                        />
                        <FaUser className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                      </div>
                      {formErrors.lastName && <p className="text-red-600 text-sm mt-1">{formErrors.lastName}</p>}
                    </div>
                  </div>

                  {/* Grade & Subject */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-red-700 font-semibold mb-2">Grade</label>
                      <select
                        value={formData.studentInfo.grade}
                        onChange={(e) => setFormData({
                          ...formData,
                          studentInfo: { ...formData.studentInfo, grade: e.target.value },
                          subject: "", teacher: "", group: ""
                        })}
                        className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.grade ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                      >
                        <option value="">Select Grade</option>
                        {grades.map((grade) => (
                          <option key={grade._id} value={grade._id}>{grade.name}</option>
                        ))}
                      </select>
                      {formErrors.grade && <p className="text-red-600 text-sm mt-1">{formErrors.grade}</p>}
                    </div>

                    <div>
                      <label className="block text-red-700 font-semibold mb-2">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value, teacher: "", group: "" })}
                        disabled={!formData.studentInfo.grade}
                        className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.subject ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {formErrors.subject && <p className="text-red-600 text-sm mt-1">{formErrors.subject}</p>}
                    </div>
                  </div>

                  {/* Teacher & Group */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-red-700 font-semibold mb-2">Teacher</label>
                      <select
                        value={formData.teacher}
                        onChange={(e) => setFormData({ ...formData, teacher: e.target.value, group: "" })}
                        disabled={!formData.subject}
                        className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.teacher ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                      >
                        <option value="">Select Teacher</option>
                        {filteredTeachers.map((t) => (
                          <option key={t._id} value={t._id}>{t.fullName}</option>
                        ))}
                      </select>
                      {formErrors.teacher && <p className="text-red-600 text-sm mt-1">{formErrors.teacher}</p>}
                    </div>

                    <div>
                      <label className="block text-red-700 font-semibold mb-2">Group</label>
                      <select
                        value={formData.group}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        disabled={!formData.teacher}
                        className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.group ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                      >
                        <option value="">Select Group</option>
                        {filteredGroups.map((g) => (
                          <option key={g._id} value={g._id}>
                            {g.name} ({g.schedule.day} {g.schedule.startingtime}-{g.schedule.endingtime})
                          </option>
                        ))}
                      </select>
                      {formErrors.group && <p className="text-red-600 text-sm mt-1">{formErrors.group}</p>}
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-red-700 font-semibold mb-2">Parent Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.parentInfo.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            parentInfo: { ...formData.parentInfo, name: e.target.value }
                          })}
                          className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                            formErrors.parentName ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                          }`}
                          placeholder="Enter parent name"
                        />
                        <FaUser className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                      </div>
                      {formErrors.parentName && <p className="text-red-600 text-sm mt-1">{formErrors.parentName}</p>}
                    </div>

                    <div>
                      <label className="block text-red-700 font-semibold mb-2">Parent Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.parentInfo.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            parentInfo: { ...formData.parentInfo, email: e.target.value }
                          })}
                          className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                            formErrors.parentEmail ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                          }`}
                          placeholder="Enter parent email"
                        />
                        <FaEnvelope className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                      </div>
                      {formErrors.parentEmail && <p className="text-red-600 text-sm mt-1">{formErrors.parentEmail}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Parent Phone (Optional)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.parentInfo.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          parentInfo: { ...formData.parentInfo, phone: e.target.value }
                        })}
                        className="w-full p-3 pl-11 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
                        placeholder="Enter parent phone"
                      />
                      <FaPhone className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <motion.button
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                      type="submit"
                      disabled={loading}
                      className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                        loading
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-300"
                      }`}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaPlus /> Add Student
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Student Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedStudent && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-3xl p-6 border border-red-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-red-700">
                    {selectedStudent.firstName} {selectedStudent.lastName}'s Groups
                  </h2>
                  <button onClick={() => setShowDetailsModal(false)} className="cursor-pointer text-gray-500 hover:text-red-600">
                    <FaTimes size={20} />
                  </button>
                </div>

                {selectedStudent.groups?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedStudent.groups.map((group) => (
                      <div key={group._id} className="bg-gray-50 p-4 rounded-xl border border-red-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-red-700">{group.subject}</p>
                            <p className="text-gray-700 flex items-center gap-2">
                              <FaChalkboardTeacher className="text-red-500" />
                              {group.teacher?.fullName || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {group.name} • {group.schedule.day} {group.schedule.startingtime}-{group.schedule.endingtime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">No groups assigned</p>
                )}

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-red-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setAddGroupFormData({ grade: selectedStudent.grade._id, subject: "", teacher: "", group: "" });
                      setShowAddGroupModal(true);
                      setShowDetailsModal(false);
                    }}
                    className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-300 transition"
                  >
                    <FaPlus /> Add to Group
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDetailsModal(false)}
                    className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Group Modal */}
        <AnimatePresence>
          {showAddGroupModal && selectedStudent && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowAddGroupModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-red-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-red-700">Add to Group</h2>
                  <button onClick={() => setShowAddGroupModal(false)} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddGroupSubmit} className="space-y-5">
                  <input type="hidden" value={selectedStudent.grade._id} />

                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Subject</label>
                    <select
                      value={addGroupFormData.subject}
                      onChange={(e) => setAddGroupFormData({ ...addGroupFormData, subject: e.target.value, teacher: "", group: "" })}
                      className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                        addGroupFormErrors.subject ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                      }`}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {addGroupFormErrors.subject && <p className="text-red-600 text-sm mt-1">{addGroupFormErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Teacher</label>
                    <select
                      value={addGroupFormData.teacher}
                      onChange={(e) => setAddGroupFormData({ ...addGroupFormData, teacher: e.target.value, group: "" })}
                      disabled={!addGroupFormData.subject}
                      className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                        addGroupFormErrors.teacher ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                      }`}
                    >
                      <option value="">Select Teacher</option>
                      {filteredAddGroupTeachers.map((t) => (
                        <option key={t._id} value={t._id}>{t.fullName}</option>
                      ))}
                    </select>
                    {addGroupFormErrors.teacher && <p className="text-red-600 text-sm mt-1">{addGroupFormErrors.teacher}</p>}
                  </div>

                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Group</label>
                    <select
                      value={addGroupFormData.group}
                      onChange={(e) => setAddGroupFormData({ ...addGroupFormData, group: e.target.value })}
                      disabled={!addGroupFormData.teacher}
                      className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                        addGroupFormErrors.group ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                      }`}
                    >
                      <option value="">Select Group</option>
                      {filteredAddGroupGroups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name} ({g.schedule.day} {g.schedule.startingtime}-{g.schedule.endingtime})
                        </option>
                      ))}
                    </select>
                    {addGroupFormErrors.group && <p className="text-red-600 text-sm mt-1">{addGroupFormErrors.group}</p>}
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <motion.button
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                      type="submit"
                      disabled={loading}
                      className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                        loading
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-300"
                      }`}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Adding...
                        </>
                      ) : (
                        <>
                          <FaPlus /> Add to Group
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAddGroupModal(false)}
                      disabled={loading}
                      className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Shake & Line Clamp */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.5s ease-in-out; }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}