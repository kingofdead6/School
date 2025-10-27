import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaEdit, FaBullhorn } from "react-icons/fa";
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
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(`${API_BASE_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching announcements");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title) errors.title = "Title is required";
    else if (form.title.length > 100) errors.title = "Title cannot exceed 100 characters";
    if (!form.description) errors.description = "Description is required";
    else if (form.description.length > 1000) errors.description = "Description cannot exceed 1000 characters";
    if (form.image && !['image/jpeg', 'image/png'].includes(form.image.type)) {
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
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/announcements/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_BASE_URL}/announcements`, formData, config);
      }

      setSuccess(true);
      setForm({ title: "", description: "", image: null });
      setEditingId(null);
      setShowModal(false);
      setFormErrors({});
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setForm({ title: announcement.title, description: announcement.description, image: null });
    setEditingId(announcement._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      await axios.delete(`${API_BASE_URL}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting announcement");
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-red-600">Announcements Management</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", description: "", image: null });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> Add Announcement
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-6 font-medium">
            Operation successful!
          </p>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        {filteredAnnouncements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg shadow-lg">
              <thead>
                <tr className="bg-red-700 text-white">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Creator</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map((announcement) => (
                  <tr
                    key={announcement._id}
                    className="border-b border-gray-800 hover:bg-gray-800"
                  >
                    <td className="p-3">{announcement.title}</td>
                    <td className="p-3 max-w-xs truncate">{announcement.description}</td>
                    <td className="p-3">
                      {announcement.image ? (
                        <a href={announcement.image} target="_blank" rel="noopener noreferrer">
                          <img
                            src={announcement.image}
                            alt={announcement.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">{announcement.creator?.fullName || "N/A"}</td>
                    <td className="p-3">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg shadow transition"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-200 mt-10">No announcements found</p>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md"
              >
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                  {editingId ? "Edit Announcement" : "Add Announcement"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                  <div>
                    <label className="block text-gray-200 mb-2">Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          formErrors.title ? "border-red-500" : "border-gray-600"
                        } text-white`}
                        placeholder="Enter title"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaBullhorn />
                      </div>
                    </div>
                    {formErrors.title && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.description ? "border-red-500" : "border-gray-600"
                      } text-white`}
                      placeholder="Enter description"
                      rows="4"
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Image (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })}
                      accept="image/jpeg,image/png"
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
                    />
                    {formErrors.image && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
                    )}
                    {editingId && form.image && (
                      <p className="text-gray-400 text-sm mt-1">Uploading a new image will replace the existing one.</p>
                    )}
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Saving..." : editingId ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}