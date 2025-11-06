import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlus, FaTrash, FaEdit, FaUsers, FaUser, FaTimes, 
  FaBook, FaGraduationCap, FaCalendarAlt, FaImage, FaCheck, FaTimesCircle  , FaEnvelope
} from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    subjectsTaught: [],
    degree: "",
    bio: "",
    photo: null,
    removePhoto: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [groupsData, setGroupsData] = useState([]);

  const subjects = [
    "Math", "Physics", "Science", "Arabic", "English",
    "French", "Islamic", "History", "Geography", "Philosophy"
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async (teacherId) => {
    setGroupsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupsData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch groups");
    } finally {
      setGroupsLoading(false);
    }
  };

  const validateForm = (isEdit = false) => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    else if (formData.fullName.length > 50) errors.fullName = "Name cannot exceed 50 characters";

    if (!isEdit) {
      if (!formData.email.trim()) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    } else {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    }

    if (formData.password && formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!formData.subjectsTaught.length) errors.subjectsTaught = "At least one subject is required";
    if (formData.degree && formData.degree.length > 100) errors.degree = "Degree cannot exceed 100 characters";
    if (formData.bio && formData.bio.length > 500) errors.bio = "Bio cannot exceed 500 characters";
    if (formData.photo && !["image/jpeg", "image/png"].includes(formData.photo.type)) {
      errors.photo = "Only JPEG or PNG images are allowed";
    }
    if (formData.photo && formData.photo.size > 5 * 1024 * 1024) {
      errors.photo = "Image size cannot exceed 5MB";
    }
    return errors;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const form = new FormData();
    form.append("fullName", formData.fullName);
    form.append("email", formData.email);
    if (formData.password) form.append("password", formData.password);
    form.append("subjectsTaught", JSON.stringify(formData.subjectsTaught));
    form.append("degree", formData.degree || "");
    form.append("bio", formData.bio || "");
    if (formData.photo) form.append("photo", formData.photo);
    form.append("removePhoto", formData.removePhoto.toString());

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/teachers`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Teacher created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowAddModal(false);
      resetForm();
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(true);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const form = new FormData();
    form.append("fullName", formData.fullName);
    if (formData.email) form.append("email", formData.email);
    if (formData.password) form.append("password", formData.password);
    form.append("subjectsTaught", JSON.stringify(formData.subjectsTaught));
    form.append("degree", formData.degree || "");
    form.append("bio", formData.bio || "");
    if (formData.photo) form.append("photo", formData.photo);
    form.append("removePhoto", formData.removePhoto.toString());

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/teachers/${selectedTeacher._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Teacher updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowEditModal(false);
      setSelectedTeacher(null);
      resetForm();
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Teacher deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowGroupsModal(false);
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete teacher");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "", email: "", password: "", subjectsTaught: [], degree: "", bio: "", photo: null, removePhoto: false
    });
    setFormErrors({});
  };

  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      email: teacher.email,
      password: "",
      subjectsTaught: teacher.subjectsTaught || [],
      degree: teacher.degree || "",
      bio: teacher.bio || "",
      photo: null,
      removePhoto: false,
    });
    setShowEditModal(true);
  };

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjectsTaught: prev.subjectsTaught.includes(subject)
        ? prev.subjectsTaught.filter(s => s !== subject)
        : [...prev.subjectsTaught, subject]
    }));
  };

  const handleGroupsClick = (teacher) => {
    setSelectedTeacher(teacher);
    fetchGroups(teacher._id);
    setShowGroupsModal(true);
  };

  const filteredTeachers = teachers.filter(t =>
    (t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterSubject ? t.subjectsTaught.includes(filterSubject) : true)
  );

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
            Teachers Management
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPlus /> Add Teacher
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full md:w-64 p-4 rounded-xl bg-white border-2 border-red-200 text-gray-800 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </motion.div>

        {/* Teacher Cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"
            />
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher, i) => (
              <motion.div
                key={teacher._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 p-6 cursor-pointer"
                onClick={() => handleGroupsClick(teacher)}
              >
                <div className="flex items-center gap-4 mb-4">
                  {teacher.photo?.url ? (
                    <img
                      src={teacher.photo.url}
                      alt={teacher.fullName}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-red-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 ring-4 ring-red-200">
                      <FaUser size={28} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-700 line-clamp-1">{teacher.fullName}</h3>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p className="flex items-center gap-2">
                    <FaBook className="text-red-500" /> {teacher.subjectsTaught?.join(", ") || "None"}
                  </p>
                  {teacher.degree && (
                    <p className="flex items-center gap-2">
                      <FaGraduationCap className="text-red-500" /> {teacher.degree}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleEditClick(teacher); }}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaEdit /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(teacher._id); }}
                    disabled={deletingId === teacher._id}
                    className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow transition ${
                      deletingId === teacher._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FaTrash /> {deletingId === teacher._id ? "Deleting..." : "Delete"}
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
            No teachers found
          </motion.p>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || (showEditModal && selectedTeacher)) && (
            <Modal
              isEdit={showEditModal}
              teacher={selectedTeacher}
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              loading={loading}
              onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit}
              onClose={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedTeacher(null);
                resetForm();
              }}
              toggleSubject={toggleSubject}
              subjects={subjects}
            />
          )}
        </AnimatePresence>

        {/* Groups Modal */}
        <AnimatePresence>
          {showGroupsModal && selectedTeacher && (
            <GroupsModal
              teacher={selectedTeacher}
              groups={groupsData}
              loading={groupsLoading}
              deleting={deletingId === selectedTeacher._id}
              onDelete={() => handleDelete(selectedTeacher._id)}
              onClose={() => setShowGroupsModal(false)}
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

// Reusable Modal Component
function Modal({ isEdit, teacher, formData, setFormData, formErrors, loading, onSubmit, onClose, toggleSubject, subjects }) {
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
          <h2 className="text-2xl font-bold text-red-700">
            {isEdit ? "Edit Teacher" : "Add New Teacher"}
          </h2>
          <button onClick={onClose} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
            <FaTimes size={20} />
          </button>
        </div>

        {isEdit && teacher?.photo?.url && !formData.removePhoto && (
          <div className="flex justify-center mb-4">
            <img src={teacher.photo.url} alt={teacher.fullName} className="w-24 h-24 rounded-full object-cover ring-4 ring-red-100" />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.fullName ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                placeholder="Enter full name"
                disabled={loading}
              />
              <FaUser className="absolute left-3.5 top-3.5 text-red-500" size={20} />
            </div>
            {formErrors.fullName && <p className="text-red-600 text-sm mt-1">{formErrors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Email {isEdit && "(Optional)"}</label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.email ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                placeholder="Enter email"
                disabled={loading}
              />
              <FaEnvelope className="absolute left-3.5 top-3.5 text-red-500" size={20} />
            </div>
            {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">
              {isEdit ? "New Password (Optional)" : "Password"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                formErrors.password ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
              }`}
              placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
              disabled={loading}
            />
            {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Subjects Taught</label>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map(subject => (
                <label key={subject} className="flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.subjectsTaught.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    disabled={loading}
                  />
                  <span className="select-none">{subject}</span>
                </label>
              ))}
            </div>
            {formErrors.subjectsTaught && <p className="text-red-600 text-sm mt-1">{formErrors.subjectsTaught}</p>}
          </div>

          {/* Degree */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Degree (Optional)</label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
              placeholder="e.g. Master's in Physics"
              disabled={loading}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Bio (Optional)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows="4"
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
              placeholder="Short bio..."
              disabled={loading}
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Photo (Optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setFormData({ ...formData, photo: e.target.files[0], removePhoto: false })}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 file:bg-red-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
              disabled={loading}
            />
            {formErrors.photo && <p className="text-red-600 text-sm mt-1">{formErrors.photo}</p>}
            {isEdit && teacher?.photo?.url && !formData.removePhoto && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, photo: null, removePhoto: true })}
                className="cursor-pointer mt-2 flex items-center gap-2 text-red-600 hover:text-red-700"
                disabled={loading}
              >
                <FaTrash /> Remove Current Photo
              </motion.button>
            )}
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
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEdit ? <FaEdit /> : <FaPlus />} {isEdit ? "Update" : " Add"} Teacher
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

// Groups Modal
function GroupsModal({ teacher, groups, loading, deleting, onDelete, onClose }) {
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
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-red-700">Groups for {teacher.fullName}</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-red-600">
            <FaTimes size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"
            />
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((g, i) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-red-700">{g.name}</h4>
                  <p className="text-sm text-gray-700">
                    <FaBook className="inline mr-1" /> {g.subject} | 
                    <FaGraduationCap className="inline ml-2 mr-1" /> {g.grade?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <FaCalendarAlt className="inline mr-1" /> {g.schedule.day} {g.schedule.startingtime} - {g.schedule.endingtime}
                  </p>
                </div>
                <FaCheck className="text-green-600" size={20} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-8">No groups assigned</p>
        )}

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            disabled={deleting}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all ${
              deleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <FaTrash /> {deleting ? "Deleting..." : "Delete Teacher"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="cursor-pointer flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}