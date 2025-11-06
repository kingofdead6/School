import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlus, FaTrash, FaUsers, FaChalkboardTeacher, FaTimes, 
  FaGraduationCap, FaUser, FaBookOpen 
} from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminGrades() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      setError(err.response?.data?.message || "Error fetching groups");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Grade name is required";
    } else if (grades.some(g => g.name.toLowerCase() === formData.name.toLowerCase().trim())) {
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
        { name: formData.name.trim() },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      setSuccess("Grade added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setShowAddModal(false);
      setFormData({ name: "" });
      setFormErrors({});
      fetchGrades();
    } catch (err) {
      setError(err.response?.data?.message || "Error adding grade");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this grade?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/grades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Grade deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchGrades();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting grade");
    }
  };

  const filteredGrades = grades.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <FaGraduationCap className="text-red-700" />
            Grades Management
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPlus /> Add Grade
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

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search grades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
        </motion.div>

        {/* Grade Cards */}
        {filteredGrades.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGrades.map((grade, i) => (
              <motion.div
                key={grade._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-red-700">{grade.name}</h3>
              
              
                </div>

                <div className="flex gap-2 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchStudentsByGrade(grade._id)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaUsers /> Students
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchGroupsByGrade(grade._id)}
                    className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
                  >
                    <FaChalkboardTeacher /> Groups
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(grade._id)}
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
            No grades found
          </motion.p>
        )}

        {/* Add Grade Modal */}
        <AnimatePresence>
          {showAddModal && (
            <AddGradeModal
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              loading={loading}
              onSubmit={handleSubmit}
              onClose={() => { setShowAddModal(false); setFormData({ name: "" }); setFormErrors({}); }}
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

        {/* Groups Modal */}
        <AnimatePresence>
          {showGroupsModal && (
            <GroupsModal
              groups={groups}
              onClose={() => setShowGroupsModal(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 10%,30%,50%,70%,90%{transform:translateX(-4px)} 20%,40%,60%,80%{transform:translateX(4px)} }
        .shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}

// Add Grade Modal
function AddGradeModal({ formData, setFormData, formErrors, loading, onSubmit, onClose }) {
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
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-6 border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-red-700">Add New Grade</h2>
          <button onClick={onClose} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-red-700 font-semibold mb-2">Grade Name</label>
            <div className="relative">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                  formErrors.name ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                }`}
                placeholder="e.g. Grade 5"
                disabled={loading}
              />
              <FaGraduationCap className="absolute left-3.5 top-3.5 text-red-500" size={20} />
            </div>
            {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
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
                  <FaPlus /> Add Grade
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
          <h2 className="text-2xl font-bold text-red-700">Students in Grade</h2>
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
            <p className="text-center text-gray-600 py-8">No students in this grade</p>
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

// Groups Modal
function GroupsModal({ groups, onClose }) {
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
          <h2 className="text-2xl font-bold text-red-700">Groups in Grade</h2>
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-red-600">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {groups.length > 0 ? (
            <div className="space-y-2">
              {groups.map((g, i) => (
                <motion.div
                  key={g._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2">
                    <FaBookOpen className="text-blue-600" />
                    <span className="font-medium text-gray-800">{g.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    {g.teacher?.fullName || "No teacher"} • {g.subject}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No groups in this grade</p>
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