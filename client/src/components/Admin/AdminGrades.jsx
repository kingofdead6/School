import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaUsers, FaChalkboardTeacher } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminGrades() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

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

  const fetchStudentsByGrade = async (gradeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/grades/${gradeId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
      setShowStudentsModal(true);
    } catch (err) {
      console.error("Fetch students by grade error:", err);
      setError(err.response?.data?.message || "Error fetching students");
    }
  };

  const fetchGroupsByGrade = async (gradeId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/grades/${gradeId}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
      setShowGroupsModal(true);
    } catch (err) {
      console.error("Fetch groups by grade error:", err);
      setError(err.response?.data?.message || "Error fetching groups");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Grade name is required";
    if (grades.some((grade) => grade.name.toLowerCase() === formData.name.toLowerCase())) {
      errors.name = "Grade already exists";
    }
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
      await axios.post(
        `${API_BASE_URL}/grades`,
        { name: formData.name },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      setSuccess(true);
      setShowAddModal(false);
      setFormData({ name: "" });
      setFormErrors({});
      fetchGrades();
    } catch (err) {
      console.error("Add grade error:", err);
      setError(err.response?.data?.message || "Error adding grade");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/grades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGrades();
    } catch (err) {
      console.error("Delete grade error:", err);
      setError(err.response?.data?.message || "Error deleting grade");
    }
  };

  const filteredGrades = grades.filter((grade) =>
    grade.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-red-600">Grades Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> Add Grade
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-6 font-medium">
            Grade added successfully!
          </p>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search grades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        {filteredGrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg shadow-lg">
              <thead>
                <tr className="bg-red-700 text-white">
                  <th className="p-3 text-left">Grade</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr
                    key={grade._id}
                    className="border-b border-gray-800 hover:bg-gray-800"
                  >
                    <td className="p-3">{grade.name}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => fetchStudentsByGrade(grade._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
                      >
                        <FaUsers /> View Students
                      </button>
                      <button
                        onClick={() => fetchGroupsByGrade(grade._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                      >
                        <FaChalkboardTeacher /> View Groups
                      </button>
                      <button
                        onClick={() => handleDelete(grade._id)}
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
          <p className="text-center text-gray-200 mt-10">No grades found</p>
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
                  Add New Grade
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-200 mb-2">Grade Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.name ? "border-red-500" : "border-gray-600"
                      } text-white`}
                      placeholder="Enter grade (e.g., Grade 5)"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
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
                      {loading ? "Adding..." : "Add Grade"}
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
          {showStudentsModal && (
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
                  Students in Grade
                </h2>
                <div className="max-h-64 overflow-y-auto">
                  {students.length > 0 ? (
                    <ul className="space-y-2">
                      {students.map((student) => (
                        <li key={student._id} className="text-gray-200">
                          {student.firstName} {student.lastName}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-200 text-center">No students in this grade</p>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowStudentsModal(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGroupsModal && (
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
                  Groups in Grade
                </h2>
                <div className="max-h-64 overflow-y-auto">
                  {groups.length > 0 ? (
                    <ul className="space-y-2">
                      {groups.map((group) => (
                        <li key={group._id} className="text-gray-200">
                          {group.name} ({group.teacher?.fullName || "N/A"}, {group.subject})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-200 text-center">No groups in this grade</p>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowGroupsModal(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}