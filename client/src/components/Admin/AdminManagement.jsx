import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaUser, FaEnvelope, FaEdit } from "react-icons/fa";
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
      console.error("Fetch admins error:", err);
      setError(err.response?.data?.message || "Error fetching admins");
    }
  };

  const validateAddForm = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = "Full name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
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
      setShowAddModal(false);
      setFormData({ fullName: "", email: "", password: "" });
      setFormErrors({});
      fetchAdmins();
    } catch (err) {
      console.error("Add admin error:", err);
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
      if (editFormData.fullName) updateData.fullName = editFormData.fullName;
      if (editFormData.password) updateData.password = editFormData.password;

      await axios.put(
        `${API_BASE_URL}/users/admins/${selectedAdmin._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      setSuccess(true);
      setShowEditModal(false);
      setEditFormData({ fullName: "", password: "" });
      setEditFormErrors({});
      fetchAdmins();
    } catch (err) {
      console.error("Update admin error:", err);
      setError(err.response?.data?.message || "Error updating admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/users/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins();
    } catch (err) {
      console.error("Delete admin error:", err);
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
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">Admin Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> Add Admin
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
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        {filteredAdmins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg shadow-lg">
              <thead>
                <tr className="bg-red-700 text-white">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="border-b border-gray-800 hover:bg-gray-800"
                  >
                    <td className="p-3">{admin.fullName}</td>
                    <td className="p-3">{admin.email}</td>
                    <td className="p-3">{admin.role}</td>
                    <td className="p-3">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(admin._id)}
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
          <p className="text-center text-gray-200 mt-10">No admins found</p>
        )}

        <AnimatePresence>
          {showAddModal && (
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
                  Add New Admin
                </h2>
                <form onSubmit={handleAddSubmit} className="space-y-4" autoComplete="on">
                  <div>
                    <label className="block text-gray-200 mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          formErrors.fullName ? "border-red-500" : "border-gray-600"
                        } text-white`}
                        placeholder="Enter full name"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser />
                      </div>
                    </div>
                    {formErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          formErrors.email ? "border-red-500" : "border-gray-600"
                        } text-white`}
                        placeholder="Enter email"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaEnvelope />
                      </div>
                    </div>
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.password ? "border-red-500" : "border-gray-600"
                      } text-white`}
                      placeholder="Enter password"
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
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
                      {loading ? "Adding..." : "Add Admin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
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

        <AnimatePresence>
          {showEditModal && (
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
                  Edit Admin
                </h2>
                <form onSubmit={handleEditSubmit} className="space-y-4" autoComplete="on">
                  <div>
                    <label className="block text-gray-200 mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editFormData.fullName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, fullName: e.target.value })
                        }
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border ${
                          editFormErrors.fullName ? "border-red-500" : "border-gray-600"
                        } text-white`}
                        placeholder="Enter full name"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaUser />
                      </div>
                    </div>
                    {editFormErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{editFormErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">New Password (Optional)</label>
                    <input
                      type="password"
                      value={editFormData.password}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, password: e.target.value })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        editFormErrors.password ? "border-red-500" : "border-gray-600"
                      } text-white`}
                      placeholder="Enter new password (optional)"
                    />
                    {editFormErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{editFormErrors.password}</p>
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
                      {loading ? "Updating..." : "Update Admin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
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