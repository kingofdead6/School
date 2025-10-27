import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaEdit, FaUsers, FaUser } from "react-icons/fa";
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
      if (!token) throw new Error("No authentication token found. Please log in.");
      const response = await axios.get(`${API_BASE_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data);
      setError("");
    } catch (err) {
      console.error("Fetch teachers error:", err);
      setError(err.response?.data?.message || "Failed to fetch teachers. Please try again.");
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
      setError("");
    } catch (err) {
      console.error("Fetch groups error:", err);
      setError(err.response?.data?.message || "Failed to fetch groups. Please try again.");
    } finally {
      setGroupsLoading(false);
    }
  };

  const validateForm = (isEdit = false) => {
    const errors = {};
    if (!formData.fullName) errors.fullName = "Full name is required";
    else if (formData.fullName.length > 50) errors.fullName = "Name cannot exceed 50 characters";
    if (!isEdit) {
      if (!formData.email) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    } else {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    }
    if (formData.password && formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!formData.subjectsTaught || formData.subjectsTaught.length === 0) errors.subjectsTaught = "At least one subject is required";
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
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setSuccess("Teacher created successfully!");
      setError("");
      setShowAddModal(false);
      setFormData({ fullName: "", email: "", password: "", subjectsTaught: [], degree: "", bio: "", photo: null, removePhoto: false });
      setFormErrors({});
      fetchTeachers();
    } catch (err) {
      console.error("Create teacher error:", err);
      setError(err.response?.data?.message || "Failed to create teacher. Please try again.");
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
    form.append("email", formData.email);
    if (formData.password) form.append("password", formData.password);
    form.append("subjectsTaught", JSON.stringify(formData.subjectsTaught));
    form.append("degree", formData.degree || "");
    form.append("bio", formData.bio || "");
    if (formData.photo) form.append("photo", formData.photo);
    form.append("removePhoto", formData.removePhoto.toString());

    try {
      const token = localStorage.getItem("token");
      console.log('Updating teacher with ID:', selectedTeacher._id); // Debug log
      console.log('Form data:', Object.fromEntries(form)); // Debug log
      console.log('Token:', token); // Debug log
      const response = await axios.put(`${API_BASE_URL}/teachers/${selectedTeacher._id}`, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      console.log('Update response:', response.data); // Debug log
      setSuccess("Teacher updated successfully!");
      setError("");
      setShowEditModal(false);
      setSelectedTeacher(null);
      setFormData({ fullName: "", email: "", password: "", subjectsTaught: [], degree: "", bio: "", photo: null, removePhoto: false });
      setFormErrors({});
      fetchTeachers();
    } catch (err) {
      console.error("Update teacher error:", err);
      setError(err.response?.data?.message || "Failed to update teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      console.log('Deleting teacher with ID:', id); // Debug log
      await axios.delete(`${API_BASE_URL}/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Teacher deleted successfully!");
      setError("");
      setShowGroupsModal(false);
      fetchTeachers();
    } catch (err) {
      console.error("Delete teacher error:", err);
      setError(err.response?.data?.message || "Failed to delete teacher. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (teacher) => {
    console.log('Editing teacher:', teacher); // Debug log
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
    setFormData((prev) => {
      const updatedSubjects = prev.subjectsTaught.includes(subject)
        ? prev.subjectsTaught.filter((s) => s !== subject)
        : [...prev.subjectsTaught, subject];
      return { ...prev, subjectsTaught: updatedSubjects };
    });
  };

  const handleGroupsClick = (teacher) => {
    setSelectedTeacher(teacher);
    fetchGroups(teacher._id);
    setShowGroupsModal(true);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      (teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       teacher.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterSubject ? teacher.subjectsTaught.includes(filterSubject) : true)
  );

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">Teachers Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> Add Teacher
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
            {success}
          </motion.p>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <FaUsers />
            </div>
          </div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full sm:w-1/4 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading...</p>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher, i) => (
              <motion.div
                key={teacher._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
                onClick={() => handleGroupsClick(teacher)}
              >
                <div className="flex items-center space-x-4">
                  {teacher.photo?.url ? (
                    <img
                      src={teacher.photo.url}
                      alt={teacher.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                      <FaUsers />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-red-600">{teacher.fullName}</h2>
                    <p className="text-gray-300">{teacher.email}</p>
                    <p className="text-gray-400 text-sm">{teacher.subjectsTaught?.join(", ") || "-"}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(teacher);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                  >
                    <FaEdit /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(teacher._id);
                    }}
                    disabled={deletingId === teacher._id}
                    className={`flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition ${
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
          <p className="text-center text-gray-200 mt-10 bg-gray-800 p-4 rounded-lg">No teachers found</p>
        )}

        {/* Add Teacher Modal */}
        <AnimatePresence>
          {showAddModal && (
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
                <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">Add New Teacher</h2>
                <form onSubmit={handleAddSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.fullName ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={loading}
                    />
                    {formErrors.fullName && <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.email ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={loading}
                    />
                    {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.password ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={loading}
                    />
                    {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Subjects Taught</label>
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map((subject) => (
                        <label key={subject} className="flex items-center gap-2 text-gray-200">
                          <input
                            type="checkbox"
                            checked={formData.subjectsTaught.includes(subject)}
                            onChange={() => toggleSubject(subject)}
                            className="h-5 w-5 text-red-600 focus:ring-red-600 rounded"
                            disabled={loading}
                          />
                          {subject}
                        </label>
                      ))}
                    </div>
                    {formErrors.subjectsTaught && <p className="text-red-400 text-sm mt-1">{formErrors.subjectsTaught}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Degree (Optional)</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                      disabled={loading}
                    />
                    {formErrors.degree && <p className="text-red-400 text-sm mt-1">{formErrors.degree}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Bio (Optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows="5"
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                      disabled={loading}
                    />
                    {formErrors.bio && <p className="text-red-400 text-sm mt-1">{formErrors.bio}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setFormData({ ...formData, photo: e.target.files[0], removePhoto: false })}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white file:bg-red-600 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
                      disabled={loading}
                    />
                    {formErrors.photo && <p className="text-red-400 text-sm mt-1">{formErrors.photo}</p>}
                  </div>
                  <div className="flex justify-between gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className={`flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Creating..." : "Create Teacher"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Teacher Modal */}
        <AnimatePresence>
          {showEditModal && selectedTeacher && (
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
                <div className="relative mb-6">
                  {selectedTeacher.photo?.url && !formData.removePhoto ? (
                    <motion.img
                      src={selectedTeacher.photo.url}
                      alt={selectedTeacher.fullName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border-4 border-white shadow-lg mx-auto">
                      <FaUser size={36} />
                    </div>
                  )}
                  <h2 className="text-3xl font-bold text-red-600 text-center mt-4">Edit Teacher</h2>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.fullName ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={loading}
                    />
                    {formErrors.fullName && <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.email ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={loading}
                    />
                    {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.password ? "border-red-500" : "border-gray-600"
                      } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                      disabled={loading}
                    />
                    {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Subjects Taught</label>
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map((subject) => (
                        <label key={subject} className="flex items-center gap-2 text-gray-200">
                          <input
                            type="checkbox"
                            checked={formData.subjectsTaught.includes(subject)}
                            onChange={() => toggleSubject(subject)}
                            className="h-5 w-5 text-red-600 focus:ring-red-600 rounded"
                            disabled={loading}
                          />
                          {subject}
                        </label>
                      ))}
                    </div>
                    {formErrors.subjectsTaught && <p className="text-red-400 text-sm mt-1">{formErrors.subjectsTaught}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Degree</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                      disabled={loading}
                    />
                    {formErrors.degree && <p className="text-red-400 text-sm mt-1">{formErrors.degree}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows="5"
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition resize-none"
                      disabled={loading}
                    />
                    {formErrors.bio && <p className="text-red-400 text-sm mt-1">{formErrors.bio}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-200 font-medium mb-2">Photo</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setFormData({ ...formData, photo: e.target.files[0], removePhoto: false })}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white file:bg-red-600 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
                      disabled={loading}
                    />
                    {formErrors.photo && <p className="text-red-400 text-sm mt-1">{formErrors.photo}</p>}
                    {selectedTeacher.photo?.url && (
                      <div className="mt-4 flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: null, removePhoto: true })}
                          className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium"
                          disabled={loading}
                        >
                          <FaTrash /> Remove Photo
                        </motion.button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className={`flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Updating..." : "Update Teacher"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedTeacher(null);
                      }}
                      disabled={loading}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Groups Modal */}
        <AnimatePresence>
          {showGroupsModal && selectedTeacher && (
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
                  Groups for {selectedTeacher.fullName}
                </h2>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-center mb-6 font-medium bg-red-900/20 p-3 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}
                {groupsLoading ? (
                  <p className="text-center text-gray-400 animate-pulse">Loading...</p>
                ) : groupsData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-red-600/20 text-red-600">
                          <th className="px-4 py-3 text-left font-semibold">Group Name</th>
                          <th className="px-4 py-3 text-left font-semibold">Subject</th>
                          <th className="px-4 py-3 text-left font-semibold">Grade</th>
                          <th className="px-4 py-3 text-left font-semibold">Schedule</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupsData.map((group, i) => (
                          <motion.tr
                            key={group._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="border-b border-gray-800"
                          >
                            <td className="px-4 py-3 text-gray-300">{group.name}</td>
                            <td className="px-4 py-3 text-gray-300">{group.subject}</td>
                            <td className="px-4 py-3 text-gray-300">{group.grade?.name || "N/A"}</td>
                            <td className="px-4 py-3 text-gray-300">
                              {group.schedule.day} {group.schedule.startingtime} - {group.schedule.endingtime}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-200 text-center">No groups assigned</p>
                )}
                <div className="flex justify-between gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(selectedTeacher._id)}
                    disabled={deletingId === selectedTeacher._id}
                    className={`flex items-center gap-2 flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all ${
                      deletingId === selectedTeacher._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FaTrash /> {deletingId === selectedTeacher._id ? "Deleting..." : "Delete Teacher"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowGroupsModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}