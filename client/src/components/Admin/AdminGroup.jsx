import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaEdit, FaUsers } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    subject: "",
    grade: "",
    schedule: { day: "", startingtime: "", endingtime: "" },
  });
  const [editFormData, setEditFormData] = useState({
    schedule: { day: "", startingtime: "", endingtime: "" },
  });
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
    fetchGrades();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
    } catch (err) {
      console.error("Fetch groups error:", err);
      setError(err.response?.data?.message || "Error fetching groups");
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data);
    } catch (err) {
      console.error("Fetch teachers error:", err);
      setError(err.response?.data?.message || "Error fetching teachers");
    }
  };

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

  const fetchStudentsByGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
      setShowStudentsModal(true);
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(err.response?.data?.message || "Error fetching students");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Group name is required";
    if (!formData.teacher) errors.teacher = "Teacher is required";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.schedule.day) errors.day = "Day is required";
    if (!formData.schedule.startingtime) errors.startingtime = "Start time is required";
    if (!formData.schedule.endingtime) errors.endingtime = "End time is required";
    return errors;
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.schedule.day) errors.day = "Day is required";
    if (!editFormData.schedule.startingtime) errors.startingtime = "Start time is required";
    if (!editFormData.schedule.endingtime) errors.endingtime = "End time is required";
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
      await axios.post(`${API_BASE_URL}/groups`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setSuccess(true);
      setShowModal(false);
      setFormData({
        name: "",
        teacher: "",
        subject: "",
        grade: "",
        schedule: { day: "", startingtime: "", endingtime: "" },
      });
      setFormErrors({});
      fetchGroups();
    } catch (err) {
      console.error("Create group error:", err);
      setError(err.response?.data?.message || "Error creating group");
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
      await axios.put(`${API_BASE_URL}/groups/${selectedGroup._id}/schedule`, editFormData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      setSuccess(true);
      setShowEditModal(false);
      setEditFormData({ schedule: { day: "", startingtime: "", endingtime: "" } });
      setEditFormErrors({});
      fetchGroups();
    } catch (err) {
      console.error("Update group schedule error:", err);
      setError(err.response?.data?.message || "Error updating group schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGroups();
    } catch (err) {
      console.error("Delete group error:", err);
      setError(err.response?.data?.message || "Error deleting group");
    }
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setEditFormData({ schedule: { ...group.schedule } });
    setShowEditModal(true);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((group) => (filterDay ? group.schedule.day === filterDay : true));

  const selectedTeacher = teachers.find((teacher) => teacher._id === formData.teacher);
  const availableSubjects = selectedTeacher?.subjectsTaught || [];

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">Groups Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> Add Group
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-6 font-medium">
            Operation successful!
          </p>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
          />
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="w-full sm:w-1/4 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
          >
            <option value="">All Days</option>
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>

        {filteredGroups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg shadow-lg">
              <thead>
                <tr className="bg-red-700 text-white">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Teacher</th>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-left">Grade</th>
                  <th className="p-3 text-left">Schedule</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={group._id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="p-3">{group.name}</td>
                    <td className="p-3">{group.teacher?.fullName || "N/A"}</td>
                    <td className="p-3">{group.subject}</td>
                    <td className="p-3">{group.grade?.name || "-"}</td>
                    <td className="p-3">
                      {group.schedule.day} {group.schedule.startingtime} -{" "}
                      {group.schedule.endingtime}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => openEditModal(group)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                      >
                        <FaEdit /> Edit Schedule
                      </button>
                      <button
                        onClick={() => fetchStudentsByGroup(group._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
                      >
                        <FaUsers /> View Students
                      </button>
                      <button
                        onClick={() => handleDelete(group._id)}
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
          <p className="text-center text-gray-200 mt-10">No groups found</p>
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
                className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80%] overflow-y-scroll"
              >
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                  Add New Group
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-200 mb-2">Group Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.name ? "border-red-500" : "border-gray-600"
                      } text-white`}
                      placeholder="Enter group name"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Teacher</label>
                    <select
                      value={formData.teacher}
                      onChange={(e) =>
                        setFormData({ ...formData, teacher: e.target.value, subject: "" })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.teacher ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName}
                        </option>
                      ))}
                    </select>
                    {formErrors.teacher && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.teacher}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.subject ? "border-red-500" : "border-gray-600"
                      } text-white`}
                      disabled={!formData.teacher}
                    >
                      <option value="">Select Subject</option>
                      {availableSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    {formErrors.subject && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                    )}
                    {!formData.teacher && (
                      <p className="text-gray-400 text-sm mt-1">Select a teacher first</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Grade (Optional)</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade._id} value={grade._id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Schedule Day</label>
                    <select
                      value={formData.schedule.day}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, day: e.target.value },
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.day ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    >
                      <option value="">Select Day</option>
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                    {formErrors.day && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.day}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.schedule.startingtime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, startingtime: e.target.value },
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.startingtime ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    />
                    {formErrors.startingtime && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.startingtime}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.schedule.endingtime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, endingtime: e.target.value },
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.endingtime ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    />
                    {formErrors.endingtime && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.endingtime}</p>
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
                      {loading ? "Creating..." : "Create Group"}
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
                  Edit Group Schedule
                </h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-200 mb-2">Schedule Day</label>
                    <select
                      value={editFormData.schedule.day}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          schedule: { ...editFormData.schedule, day: e.target.value },
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        editFormErrors.day ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    >
                      <option value="">Select Day</option>
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                    {editFormErrors.day && (
                      <p className="text-red-500 text-sm mt-1">{editFormErrors.day}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={editFormData.schedule.startingtime}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          schedule: { ...editFormData.schedule, startingtime: e.target.value },
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        editFormErrors.startingtime ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    />
                    {editFormErrors.startingtime && (
                      <p className="text-red-500 text-sm mt-1">{editFormErrors.startingtime}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2">End Time</label>
                    <input
                      type="time"
                      value={editFormData.schedule.endingtime}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          schedule: { ...editFormData.schedule, endingtime: e.target.value },
                        })
                      }
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        editFormErrors.endingtime ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    />
                    {editFormErrors.endingtime && (
                      <p className="text-red-500 text-sm mt-1">{editFormErrors.endingtime}</p>
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
                      {loading ? "Updating..." : "Update Schedule"}
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
                  Students in Group
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
                    <p className="text-gray-200 text-center">No students in this group</p>
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
      </motion.div>
    </div>
  );
}