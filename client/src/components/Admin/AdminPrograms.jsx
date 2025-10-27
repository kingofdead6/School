import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaEdit, FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../api";

export default function AdminPrograms() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [grades, setGrades] = useState([]); // New state for grades
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ name: "", yearLevel: "", image: null });
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchGrades(); // Fetch grades on mount
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(`${API_BASE_URL}/programs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrograms(response.data);
    } catch (err) {
      console.error("Fetch programs error:", err);
      setError(err.response?.data?.message || "Error fetching programs");
      if (err.message === "No authentication token found") {
        navigate("/login");
      }
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(`${API_BASE_URL}/grades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrades(response.data);
    } catch (err) {
      console.error("Fetch grades error:", err);
      setError(err.response?.data?.message || "Error fetching grades");
      if (err.message === "No authentication token found") {
        navigate("/login");
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name) errors.name = "Name is required";
    else if (form.name.length > 100) errors.name = "Name cannot exceed 100 characters";
    if (!form.yearLevel) errors.yearLevel = "Year level is required";
    if (form.image && !["image/jpeg", "image/png"].includes(form.image.type)) {
      errors.image = "Only JPG and PNG images are allowed";
    }
    if (form.image && form.image.size > 5 * 1024 * 1024) {
      errors.image = "Image size cannot exceed 5MB";
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
    formData.append("name", form.name.trim());
    formData.append("yearLevel", form.yearLevel); // Send Grade ID
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
        await axios.put(`${API_BASE_URL}/programs/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_BASE_URL}/programs`, formData, config);
      }

      setSuccess(true);
      setForm({ name: "", yearLevel: "", image: null });
      setEditingId(null);
      setShowModal(false);
      setFormErrors({});
      fetchPrograms();
    } catch (err) {
      console.error("Save program error:", err);
      setError(err.response?.data?.message || "Error saving program");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program) => {
    setForm({ name: program.name, yearLevel: program.yearLevel._id, image: null });
    setEditingId(program._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      await axios.delete(`${API_BASE_URL}/programs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPrograms();
    } catch (err) {
      console.error("Delete program error:", err);
      setError(err.response?.data?.message || "Error deleting program");
    }
  };

  const filteredPrograms = programs.filter((program) =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">Programs Management</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", yearLevel: "", image: null });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> Add Program
          </button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-center mb-6 font-medium bg-red-100 p-3 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 text-center mb-6 font-medium bg-green-100 p-3 rounded-lg"
          >
            Operation successful!
          </motion.p>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by program name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {filteredPrograms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Year Level</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr
                    key={program._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3">{program.name}</td>
                    <td className="p-3">{program.yearLevel?.name || "N/A"}</td>
                    <td className="p-3">
                      {program.image ? (
                        <a href={program.image} target="_blank" rel="noopener noreferrer">
                          <img
                            src={program.image}
                            alt={program.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      {new Date(program.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(program)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                      >
                        <FaEdit /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(program._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
                      >
                        <FaTrash /> Delete
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-10">No programs found</p>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              >
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                  {editingId ? "Edit Program" : "Add Program"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                  <div>
                    <label className="block text-gray-900 mb-2">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`w-full pl-10 pr-3 py-3 rounded-lg bg-gray-100 border ${
                          formErrors.name ? "border-red-600" : "border-gray-300"
                        } text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600`}
                        placeholder="Enter program name"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                        <FaBook />
                      </div>
                    </div>
                    {formErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-900 mb-2">Year Level</label>
                    <select
                      value={form.yearLevel}
                      onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-100 border ${
                        formErrors.yearLevel ? "border-red-600" : "border-gray-300"
                      } text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600`}
                    >
                      <option value="">Select a grade</option>
                      {grades.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.yearLevel && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.yearLevel}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-900 mb-2">Image </label>
                    <input
                      type="file"
                      onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })}
                      accept="image/jpeg,image/png"
                      className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 file:bg-red-600 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
                    />
                    {formErrors.image && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.image}</p>
                    )}
                    {editingId && form.image && (
                      <p className="text-gray-500 text-sm mt-1">Uploading a new image will replace the existing one.</p>
                    )}
                  </div>
                  <div className="flex justify-between mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading || grades.length === 0}
                      className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition ${
                        loading || grades.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Saving..." : editingId ? "Update" : "Add"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-bold transition"
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
    </div>
  );
}