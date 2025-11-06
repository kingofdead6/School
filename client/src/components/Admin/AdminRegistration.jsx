import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "../../../api";
import {
  FaCheck,
  FaTimes,
  FaSearch,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBook,
  FaChalkboardTeacher,
  FaUsers,
  FaEye,
  FaTrash,
  FaClock,
} from "react-icons/fa";

export default function AdminRegistration() {
  const [pending, setPending] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "rejected"
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [grades, setGrades] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
      if (!["superadmin", "admin"].includes(decoded.role)) {
        navigate("/login");
        return;
      }
    } catch (error) {
      navigate("/login");
      return;
    }

    fetchRegistrations();
    fetchGrades();
  }, [navigate]);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setPending(data.filter((r) => r.status === "pending"));
      setRejected(data.filter((r) => r.status === "rejected"));
    } catch (error) {
      setError("Failed to load registrations");
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/grades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrades(response.data);
    } catch (err) {}
  };

  const handleAccept = async () => {
    if (!selectedReg) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE_URL}/registrations/${selectedReg._id}`,
        { status: "accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const payload = {
        firstName: selectedReg.studentInfo.firstName,
        lastName: selectedReg.studentInfo.lastName,
        parentInfo: selectedReg.parentInfo,
        grade: selectedReg.group.grade._id,
        groups: [selectedReg.group._id],
        teacher: selectedReg.group.teacher._id,
      };

      await axios.post(`${API_BASE_URL}/students`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Student accepted and added!");
      setShowAcceptModal(false);
      fetchRegistrations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept");
    } finally {
      setLoading(false);
    }
  };

   const handleReject = async () => {
    if (!selectedReg) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/registrations/${selectedReg._id}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Registration rejected.");
      setShowRejectModal(false);
      fetchRegistrations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject");
    } finally {
      setLoading(false);
    }
  };


  const currentData = activeTab === "pending" ? pending : rejected;

  const filteredData = currentData
    .filter((reg) => {
      const fullName = `${reg.studentInfo.firstName} ${reg.studentInfo.lastName}`.toLowerCase();
      const email = reg.parentInfo.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query);
    })
    .filter((reg) => (filterGrade ? reg.group?.grade?._id === filterGrade : true));

  const formatTime = (time) => (time ? time.slice(0, 5) : "-");

  return (
    <div className="min-h-screen bg-white py-12 px-4 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 flex items-center justify-center gap-3">
            <FaGraduationCap className="w-9 h-9" />
            Registration Requests
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Manage student registration requests efficiently.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "pending"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <FaClock /> Pending ({pending.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("rejected")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "rejected"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <FaTrash /> Rejected ({rejected.length})
          </motion.button>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
          </div>
          <div className="relative">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full sm:w-64 p-3 pl-10 rounded-lg bg-white border border-red-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
            >
              <option value="">All Grades</option>
              {grades.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
            <FaGraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
          </div>
        </div>

        {/* Messages */}
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
            {success}
          </motion.p>
        )}

        {/* Table */}
        {filteredData.length > 0 ? (
          <div className="bg-red-50 rounded-xl shadow-sm p-6 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-red-100 text-red-700">
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Parent</th>
                  <th className="px-4 py-3 text-left font-semibold">Grade</th>
                  <th className="px-4 py-3 text-left font-semibold">Group</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((reg, i) => (
                  <motion.tr
                    key={reg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-red-100 hover:bg-red-50/50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {reg.studentInfo.firstName} {reg.studentInfo.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{reg.parentInfo.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                        {reg.group?.grade?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{reg.group?.name || "—"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedReg(reg);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FaEye />
                      </button>
                      {activeTab === "pending" && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedReg(reg);
                              setShowAcceptModal(true);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FaCheck />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedReg(reg);
                              setShowRejectModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FaTimes />
                          </motion.button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600 bg-red-50 p-6 rounded-lg">
            No {activeTab === "pending" ? "pending" : "rejected"} requests
          </p>
        )}

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedReg && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-red-200"
              >
                <h3 className="text-2xl font-bold text-red-600 mb-6 text-center">
                  Registration Details
                </h3>
                <div className="space-y-6 text-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaUser /> Student
                      </p>
                      <p className="ml-6">
                        {selectedReg.studentInfo.firstName} {selectedReg.studentInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaGraduationCap /> Grade
                      </p>
                      <p className="ml-6">{selectedReg.group?.grade?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaUser /> Parent
                      </p>
                      <p className="ml-6">{selectedReg.parentInfo.name}</p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaEnvelope /> Email
                      </p>
                      <p className="ml-6">{selectedReg.parentInfo.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaPhone /> Phone
                      </p>
                      <p className="ml-6">{selectedReg.parentInfo.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaUsers /> Group
                      </p>
                      <p className="ml-6">{selectedReg.group?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaBook /> Subject
                      </p>
                      <p className="ml-6 text-red-600">{selectedReg.group?.subject || "—"}</p>
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <FaChalkboardTeacher /> Teacher
                      </p>
                      <p className="ml-6">{selectedReg.group?.teacher?.fullName || "—"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Schedule</p>
                      <p className="ml-6">
                        {selectedReg.group?.schedule ? (
                          <>
                            {selectedReg.group.schedule.day}
                            <br />
                            <span className="text-red-600">
                              {formatTime(selectedReg.group.schedule.startingtime)} -{" "}
                              {formatTime(selectedReg.group.schedule.endingtime)}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Submitted</p>
                      <p className="ml-6">
                        {new Date(selectedReg.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDetailsModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-bold"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accept Modal */}
        <AnimatePresence>
          {showAcceptModal && selectedReg && (
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-red-200"
              >
                <h3 className="text-xl font-bold text-green-600 mb-3">Accept Registration?</h3>
                <p className="text-gray-700 mb-6">
                  Add <strong>{selectedReg.studentInfo.firstName} {selectedReg.studentInfo.lastName}</strong> to students?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className={`flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold ${loading ? "opacity-50" : ""}`}
                  >
                    {loading ? "Accepting..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowAcceptModal(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        <AnimatePresence>
          {showRejectModal && selectedReg && (
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-red-200"
              >
                <h3 className="text-xl font-bold text-red-600 mb-3">Reject Registration?</h3>
                <p className="text-gray-700 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className={`flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold ${loading ? "opacity-50" : ""}`}
                  >
                    {loading ? "Rejecting..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-bold"
                  >
                    Cancel
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