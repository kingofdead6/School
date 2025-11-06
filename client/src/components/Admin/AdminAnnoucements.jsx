import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaEdit, FaBullhorn, FaUpload, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ title: "", description: "", image: null });
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await axios.get(`${API_BASE_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Title is required";
    else if (form.title.length > 100) errors.title = "Title cannot exceed 100 characters";
    if (!form.description.trim()) errors.description = "Description is required";
    else if (form.description.length > 1000) errors.description = "Description cannot exceed 1000 characters";
    if (form.image && !["image/jpeg", "image/png"].includes(form.image.type)) {
      errors.image = "Only JPG and PNG images are allowed";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    if (form.image) formData.append("image", form.image);

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/announcements/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_BASE_URL}/announcements`, formData, config);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      resetForm();
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save announcement");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", image: null });
    setEditingId(null);
    setFormErrors({});
  };

  const handleEdit = (announcement) => {
    setForm({
      title: announcement.title,
      description: announcement.description,
      image: null,
    });
    setEditingId(announcement._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="text-3xl md:text-4xl font-extrabold text-red-600 flex items-center gap-3"
          >
            <FaBullhorn className="text-red-700" />
            Announcements
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPlus /> Add Announcement
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
              Announcement saved successfully!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaBullhorn className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
        </motion.div>

        {/* Announcement Cards */}
        {filteredAnnouncements.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement, i) => (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 overflow-hidden"
              >
                {announcement.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className={`p-6 ${announcement.image ? "" : "pt-8"}`}>
                  <h3 className="text-xl font-bold text-red-700 mb-2 line-clamp-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {announcement.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{announcement.creator?.fullName || "Admin"}</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(announcement._id)}
                      className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow transition"
                    >
                      <FaTrash /> Delete
                    </motion.button>
                  </div>
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
            No announcements found
          </motion.p>
        )}

        {/* Modal */}
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
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-red-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-red-700">
                    {editingId ? "Edit Announcement" : "Add Announcement"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="cursor-pointer text-gray-500 hover:text-red-600 transition"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.title ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                        placeholder="Enter title"
                        maxLength="100"
                      />
                      <FaBullhorn className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      {formErrors.title && <span className="text-red-600">{formErrors.title}</span>}
                      <span className="text-gray-500 ml-auto">{form.title.length}/100</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 resize-none ${
                        formErrors.description ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                      }`}
                      placeholder="Enter description"
                      rows="5"
                      maxLength="1000"
                    />
                    <div className="flex justify-between text-xs mt-1">
                      {formErrors.description && <span className="text-red-600">{formErrors.description}</span>}
                      <span className="text-gray-500 ml-auto">{form.description.length}/1000</span>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Image (Optional)</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })}
                        accept="image/jpeg,image/png"
                        className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.image ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                      />
                      <FaUpload className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                    {formErrors.image && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.image}</p>
                    )}
                    {editingId && announcement?.image && !form.image && (
                      <p className="text-gray-500 text-xs mt-1">Current image will be kept unless replaced.</p>
                    )}
                  </div>

                  {/* Buttons */}
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
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingId ? <FaEdit /> : <FaPlus />}
                          {editingId ? "Update" : "Add"}
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
      </motion.div>

      {/* Shake Animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}