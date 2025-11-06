import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  FaUsers, FaChalkboardTeacher, FaCalendarAlt, FaClock, 
  FaTimes, FaUser, FaGraduationCap, FaPhone, FaEnvelope 
} from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function TeacherGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token provided");
      const response = await axios.get(`${API_BASE_URL}/teachers/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch groups. Please try again.");
      if (err.message === "No token provided") navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (groupId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    fetchStudents(group._id);
    setShowStudentsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <FaChalkboardTeacher className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-red-600">
                My Assigned Groups
              </h1>
              <p className="text-gray-600">Click a group to view students</p>
            </div>
          </motion.div>
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
        </AnimatePresence>

        {/* Groups Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading groups...</p>
          </motion.div>
        ) : groups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, i) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleGroupClick(group)}
                className="group cursor-pointer bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-red-700 line-clamp-1">{group.name}</h3>
                  
                </div>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p className="flex items-center gap-2">
                    <FaChalkboardTeacher className="text-red-500" /> {group.subject}
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

                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    View Students
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <FaUsers size={14} />
                    </motion.div>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-red-100"
          >
            <FaUsers className="mx-auto text-red-300 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No groups assigned yet</p>
            <p className="text-gray-500 text-sm mt-2">Contact your admin for group assignments</p>
          </motion.div>
        )}

        {/* Students Modal */}
        <AnimatePresence>
          {showStudentsModal && selectedGroup && (
            <StudentsModal
              group={selectedGroup}
              students={students}
              loading={loading}
              error={error}
              onClose={() => setShowStudentsModal(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
      `}</style>
    </div>
  );
}

// Students Modal Component
function StudentsModal({ group, students, loading, error, onClose }) {
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
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Students in {group.name}</h2>
              <p className="text-sm opacity-90 mt-1">
                {group.subject} • {group.grade?.name || "N/A"} • {group.schedule.day} {group.schedule.startingtime}-{group.schedule.endingtime}
              </p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer text-white hover:bg-white/20 p-2 rounded-lg transition"
              disabled={loading}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-600">Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {students.map((student, i) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-red-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {student.firstName} {student.lastName}
                      </h4>
                      {student.grade && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <FaGraduationCap /> {student.grade.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {student.parentInfo?.name && (
                      <p className="flex items-center gap-2 text-gray-700">
                        <FaUser className="text-red-500" /> Parent: {student.parentInfo.name}
                      </p>
                    )}
                    {student.parentInfo?.email && (
                      <p className="flex items-center gap-2 text-gray-700">
                        <FaEnvelope className="text-red-500" /> {student.parentInfo.email}
                      </p>
                    )}
                    {student.parentInfo?.phone && (
                      <p className="flex items-center gap-2 text-gray-700">
                        <FaPhone className="text-red-500" /> {student.parentInfo.phone}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaUsers className="mx-auto text-red-200 mb-3" size={48} />
              <p className="text-gray-600">No students in this group</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-red-100">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-red-600">{students.length}</span> student{students.length !== 1 ? 's' : ''}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="cursor-pointer px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition"
              disabled={loading}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}