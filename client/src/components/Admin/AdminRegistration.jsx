import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { API_BASE_URL } from "../../../api";
export default function AdminRegistration() {
  const [registrations, setRegistrations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "superadmin" && decoded.role !== "admin") {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }

    axios
      .get(`${API_BASE_URL}/api/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setRegistrations(response.data))
      .catch((error) => console.error("Error fetching registrations:", error));
  }, [navigate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/registrations/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(`${API_BASE_URL}/api/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error("Error updating registration:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-red-600 mb-6">Registrations Management</h1>
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-red-900 text-left">
                <th className="p-3">Student Name</th>
                <th className="p-3">Parent Name</th>
                <th className="p-3">Parent Email</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Group</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id} className="border-b border-red-700">
                  <td className="p-3">{`${reg.studentInfo.firstName} ${reg.studentInfo.lastName}`}</td>
                  <td className="p-3">{reg.parentInfo.name}</td>
                  <td className="p-3">{reg.parentInfo.email}</td>
                  <td className="p-3">{reg.studentInfo.grade}</td>
                  <td className="p-3">
                    {`${reg.group.name} (${reg.group.subject}, ${reg.group.schedule.day} ${reg.group.schedule.startingtime})`}
                  </td>
                  <td className="p-3">{reg.status}</td>
                  <td className="p-3">{new Date(reg.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <select
                      value={reg.status}
                      onChange={(e) => handleStatusUpdate(reg._id, e.target.value)}
                      className="p-1 rounded bg-gray-800 border border-red-700 text-white focus:border-red-600"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}