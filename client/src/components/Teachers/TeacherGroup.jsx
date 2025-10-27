import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
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
      console.error("Fetch groups error:", err);
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
      console.error("Fetch students error:", err);
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
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-red-600 to-black h-48 flex items-center justify-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Assigned Groups</h1>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8"
      >
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center mb-6 font-medium bg-red-900/20 p-3 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading...</p>
        ) : groups.length > 0 ? (
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-red-600/30 backdrop-blur-sm">
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
                {groups.map((group, i) => (
                  <motion.tr
                    key={group._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleGroupClick(group)}
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
          <p className="text-center text-gray-200 bg-gray-800 p-4 rounded-lg">No groups assigned</p>
        )}

        {/* Students Modal */}
        <AnimatePresence>
          {showStudentsModal && selectedGroup && (
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
                className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-red-600/50"
              >
                <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">
                  Students in {selectedGroup.name}
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
                {loading ? (
                  <p className="text-center text-gray-400 animate-pulse">Loading...</p>
                ) : students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-red-600/20 text-red-600">
                          <th className="px-4 py-3 text-left font-semibold">First Name</th>
                          <th className="px-4 py-3 text-left font-semibold">Last Name</th>
                          <th className="px-4 py-3 text-left font-semibold">Grade</th>
                          <th className="px-4 py-3 text-left font-semibold">Parent Name</th>
                          <th className="px-4 py-3 text-left font-semibold">Parent Email</th>
                          <th className="px-4 py-3 text-left font-semibold">Parent Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, i) => (
                          <motion.tr
                            key={student._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="border-b border-gray-800"
                          >
                            <td className="px-4 py-3 text-gray-300">{student.firstName}</td>
                            <td className="px-4 py-3 text-gray-300">{student.lastName}</td>
                            <td className="px-4 py-3 text-gray-300">{student.grade?.name || "N/A"}</td>
                            <td className="px-4 py-3 text-gray-300">{student.parentInfo?.name || "N/A"}</td>
                            <td className="px-4 py-3 text-gray-300">{student.parentInfo?.email || "N/A"}</td>
                            <td className="px-4 py-3 text-gray-300">{student.parentInfo?.phone || "N/A"}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-200 text-center">No students in this group</p>
                )}
                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowStudentsModal(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    disabled={loading}
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