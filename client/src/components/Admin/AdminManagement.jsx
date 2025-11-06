import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaUser, FaEnvelope, FaEdit, FaTimes, FaShieldAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/users/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching admins");
    }
  };

  const validateAddForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    return errors;
  };

  const validateEditForm = () => {
    const errors = {};
    if (editFormData.password && editFormData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAddForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/users/register-admin`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setShowAddModal(false);
      setFormData({ fullName: "", email: "", password: "" });
      setFormErrors({});
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Error adding admin");
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
      const updateData = {};
      if (editFormData.fullName.trim()) updateData.fullName = editFormData.fullName.trim();
      if (editFormData.password) updateData.password = editFormData.password;

      if (Object.keys(updateData).length === 0) {
        setError("No changes to update");
        setLoading(false);
        return;
      }

      await axios.put(
        `${API_BASE_URL}/users/admins/${selectedAdmin._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setShowEditModal(false);
      setEditFormData({ fullName: "", password: "" });
      setEditFormErrors({});
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/users/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting admin");
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditFormData({ fullName: admin.fullName, password: "" });
    setShowEditModal(true);
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            <FaShieldAlt className="text-red-700" />
            Admin Management
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPlus /> Add Admin
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
              Operation successful!
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
        </motion.div>

        {/* Admin Cards */}
        {filteredAdmins.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdmins.map((admin, i) => (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-red-700 line-clamp-1">
                    {admin.fullName}
                  </h3>
                  <span className="text-xs text-gray-500 bg-red-50 px-2 py-1 rounded-full">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="text-red-500" /> {admin.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaShieldAlt className="text-red-500" /> {admin.role}
                  </p>
                </div>

                <div className="flex gap-2 mt-5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditModal(admin)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaEdit /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(admin._id)}
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
            No admins found
          </motion.p>
        )}

        {/* Add Admin Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowAddModal(false)}
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
                  <h2 className="text-2xl font-bold text-red-700">Add New Admin</h2>
                  <button onClick={() => setShowAddModal(false)} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddSubmit} className="space-y-5">
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
                      />
                      <FaUser className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                    {formErrors.fullName && <p className="text-red-600 text-sm mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.email ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                        placeholder="Enter email"
                      />
                      <FaEnvelope className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                    {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                        formErrors.password ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                      }`}
                      placeholder="Enter password"
                    />
                    {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
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
                          <FaPlus /> Add Admin
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowAddModal(false)}
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

        {/* Edit Admin Modal */}
        <AnimatePresence>
          {showEditModal && selectedAdmin && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowEditModal(false)}
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
                  <h2 className="text-2xl font-bold text-red-700">Edit Admin</h2>
                  <button onClick={() => setShowEditModal(false)} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        className="w-full p-3 pl-11 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
                        placeholder="Leave empty to keep current"
                      />
                      <FaUser className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-red-700 font-semibold mb-2">New Password (Optional)</label>
                    <input
                      type="password"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                        editFormErrors.password ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                      }`}
                      placeholder="Enter new password"
                    />
                    {editFormErrors.password && <p className="text-red-600 text-sm mt-1">{editFormErrors.password}</p>}
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
                          <FaEdit /> Update Admin
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowEditModal(false)}
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