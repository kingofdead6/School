import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlus, FaTrash, FaEdit, FaUsers, FaTimes, FaCalendarAlt, 
  FaClock, FaChalkboardTeacher, FaBookOpen, FaGraduationCap , FaUser
} from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    subject: "",
    grade: "",
    schedule: { day: "", startingtime: "", endingtime: "" },
  });
  const [editFormData, setEditFormData] = useState({
    schedule: { day: "", startingtime: "", endingtime: "" },
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
    fetchGrades();
  }, []);

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

  const fetchStudentsByGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
      setShowStudentsModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching students");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Group name is required";
    if (!formData.teacher) errors.teacher = "Teacher is required";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.schedule.day) errors.day = "Day is required";
    if (!formData.schedule.startingtime) errors.startingtime = "Start time is required";
    if (!formData.schedule.endingtime) errors.endingtime = "End time is required";
    return errors;
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.schedule.day) errors.day = "Day is required";
    if (!editFormData.schedule.startingtime) errors.startingtime = "Start time is required";
    if (!editFormData.schedule.endingtime) errors.endingtime = "End time is required";
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
      await axios.post(`${API_BASE_URL}/groups`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setSuccess("Group created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowModal(false);
      resetForm();
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating group");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/groups/${selectedGroup._id}/schedule`, editFormData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setSuccess("Schedule updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowEditModal(false);
      setEditFormData({ schedule: { day: "", startingtime: "", endingtime: "" } });
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Group deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting group");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      teacher: "",
      subject: "",
      grade: "",
      schedule: { day: "", startingtime: "", endingtime: "" },
    });
    setFormErrors({});
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setEditFormData({ schedule: { ...group.schedule } });
    setShowEditModal(true);
  };

  const filteredGroups = groups.filter(g =>
    (g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     g.subject.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterDay ? g.schedule.day === filterDay : true)
  );

  const selectedTeacher = teachers.find(t => t._id === formData.teacher);
  const availableSubjects = selectedTeacher?.subjectsTaught || [];

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
            <FaUsers className="text-red-700" />
            Groups Management
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPlus /> Add Group
          </motion.button>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-600 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-600 text-center mb-6 font-medium bg-green-50 p-3 rounded-lg border border-green-200"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="w-full md:w-64 p-4 rounded-xl bg-white border-2 border-red-200 text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
          >
            <option value="">All Days</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </motion.div>

        {/* Group Cards */}
        {filteredGroups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, i) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-red-700 line-clamp-1">{group.name}</h3>
                  <span className="text-xs text-gray-500 bg-red-50 px-2 py-1 rounded-full">
                    {group.students?.length || 0} students
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p className="flex items-center gap-2">
                    <FaChalkboardTeacher className="text-red-500" /> {group.teacher?.fullName || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaBookOpen className="text-red-500" /> {group.subject}
                  </p>
                  {group.grade && (
                    <p className="flex items-center gap-2">
                      <FaGraduationCap className="text-red-500" /> {group.grade.name}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-red-500" /> {group.schedule.day}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaClock className="text-red-500" /> {group.schedule.startingtime} - {group.schedule.endingtime}
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditModal(group)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaEdit /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchStudentsByGroup(group._id)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaUsers /> View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(group._id)}
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
            No groups found
          </motion.p>
        )}

        {/* Add Group Modal */}
        <AnimatePresence>
          {showModal && (
            <GroupModal
              isEdit={false}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              loading={loading}
              teachers={teachers}
              grades={grades}
              availableSubjects={availableSubjects}
              onSubmit={handleSubmit}
              onClose={() => { setShowModal(false); resetForm(); }}
            />
          )}
        </AnimatePresence>

        {/* Edit Schedule Modal */}
        <AnimatePresence>
          {showEditModal && selectedGroup && (
            <ScheduleModal
              group={selectedGroup}
              formData={editFormData}
              setFormData={setEditFormData}
              formErrors={editFormErrors}
              loading={loading}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Students Modal */}
        <AnimatePresence>
          {showStudentsModal && (
            <StudentsModal
              students={students}
              onClose={() => setShowStudentsModal(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-4px)} 20%,40%,60%,80%{transform:translateX(4px)} }
        .shake { animation: shake 0.5s ease-in-out; }
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
      `}</style>
    </div>
  );
}

// Add/Edit Group Modal
function GroupModal({ isEdit, formData, setFormData, formErrors, loading, teachers, grades, availableSubjects, onSubmit, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-red-700">Add New Group</h2>
          <button onClick={onClose} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Group Name */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Group Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.name ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                placeholder="e.g. Math 101"
                disabled={loading}
              />
              <FaBookOpen className="absolute left-3.5 top-3.5 text-red-500" size={20} />
            </div>
            {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
          </div>

          {/* Teacher */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Teacher</label>
            <div className="relative">
              <select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value, subject: "" })}
                className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.teacher ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={loading}
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.fullName}</option>
                ))}
              </select>
              <FaChalkboardTeacher className="absolute left-3.5 top-3.5 text-red-500" size={20} />
            </div>
            {formErrors.teacher && <p className="text-red-600 text-sm mt-1">{formErrors.teacher}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Subject</label>
            <div className="relative">
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.subject ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={!formData.teacher || loading}
              >
                <option value="">Select Subject</option>
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <FaBookOpen className="absolute left-3.5 top-3.5 text-red-500" size={20} />
            </div>
            {formErrors.subject && <p className="text-red-600 text-sm mt-1">{formErrors.subject}</p>}
            {!formData.teacher && <p className="text-gray-500 text-sm mt-1">Select a teacher first</p>}
          </div>

          {/* Grade */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Grade (Optional)</label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
              disabled={loading}
            >
              <option value="">Select Grade</option>
              {grades.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-red-700 font-semibold mb-2">Day</label>
              <select
                value={formData.schedule.day}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, day: e.target.value } })}
                className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.day ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={loading}
              >
                <option value="">Select Day</option>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {formErrors.day && <p className="text-red-600 text-sm mt-1">{formErrors.day}</p>}
            </div>
            <div>
              <label className="block text-red-700 font-semibold mb-2">Start Time</label>
              <input
                type="time"
                value={formData.schedule.startingtime}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, startingtime: e.target.value } })}
                className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.startingtime ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={loading}
              />
              {formErrors.startingtime && <p className="text-red-600 text-sm mt-1">{formErrors.startingtime}</p>}
            </div>
            <div>
              <label className="block text-red-700 font-semibold mb-2">End Time</label>
              <input
                type="time"
                value={formData.schedule.endingtime}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, endingtime: e.target.value } })}
                className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.endingtime ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={loading}
              />
              {formErrors.endingtime && <p className="text-red-600 text-sm mt-1">{formErrors.endingtime}</p>}
            </div>
          </div>

          {/* Actions */}
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
                  <FaPlus /> Create Group
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Edit Schedule Modal
function ScheduleModal({ group, formData, setFormData, formErrors, loading, onSubmit, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-6 border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-red-700">Edit Schedule</h2>
          <button onClick={onClose} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700 mb-4">
            <strong>{group.name}</strong> - {group.subject}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-red-700 font-semibold mb-2">Day</label>
              <select
                value={formData.schedule.day}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, day: e.target.value } })}
                className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.day ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={loading}
              >
                <option value="">Select Day</option>
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {formErrors.day && <p className="text-red-600 text-sm mt-1">{formErrors.day}</p>}
            </div>
            <div>
              <label className="block text-red-700 font-semibold mb-2">Start Time</label>
              <input
                type="time"
                value={formData.schedule.startingtime}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, startingtime: e.target.value } })}
                className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.startingtime ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={loading}
              />
              {formErrors.startingtime && <p className="text-red-600 text-sm mt-1">{formErrors.startingtime}</p>}
            </div>
            <div>
              <label className="block text-red-700 font-semibold mb-2">End Time</label>
              <input
                type="time"
                value={formData.schedule.endingtime}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, endingtime: e.target.value } })}
                className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.endingtime ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                disabled={loading}
              />
              {formErrors.endingtime && <p className="text-red-600 text-sm mt-1">{formErrors.endingtime}</p>}
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
                  Updating...
                </>
              ) : (
                <>
                  <FaEdit /> Update
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Students Modal
function StudentsModal({ students, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] p-6 border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-red-700">Students in Group</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-red-600">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {students.length > 0 ? (
            <div className="space-y-2">
              {students.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <FaUser className="text-red-600" />
                  <span className="font-medium text-gray-800">{s.firstName} {s.lastName}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No students in this group</p>
          )}
        </div>

        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="cursor-pointer w-full px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}