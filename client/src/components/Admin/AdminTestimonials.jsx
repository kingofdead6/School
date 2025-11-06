import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaStar, FaTrash, FaCheckCircle } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, action: "", id: null, name: "" });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/testimonials`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const fetched = Array.isArray(response.data) ? response.data : response.data.testimonials || [];
        setTestimonials(fetched);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load testimonials");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/testimonials/${id}/approve`,
        { approved: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setTestimonials(testimonials.map((t) => (t._id === id ? { ...t, approved: true } : t)));
      setModal({ open: false, action: "", id: null, name: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve testimonial");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTestimonials(testimonials.filter((t) => t._id !== id));
      setModal({ open: false, action: "", id: null, name: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete testimonial");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-10 bg-white">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 overflow-x-hidden mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-600 flex items-center justify-center gap-3">
            <svg
              className="w-9 h-9 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Manage Testimonials
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Review, approve, or delete testimonials submitted by our community.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            No testimonials found.
          </div>
        ) : (
          <div className="bg-red-50 rounded-xl shadow-sm p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-red-200">
                    <th className="py-3 px-4 text-red-700 font-medium">Name</th>
                    <th className="py-3 px-4 text-red-700 font-medium">Testimonial</th>
                    <th className="py-3 px-4 text-red-700 font-medium">Rating</th>
                    <th className="py-3 px-4 text-red-700 font-medium">Status</th>
                    <th className="py-3 px-4 text-red-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t._id} className="border-b border-red-200">
                      <td className="py-3 px-4 text-gray-800">{t.name}</td>
                      <td className="py-3 px-4 text-gray-600">{t.text.substring(0, 100)}{t.text.length > 100 ? "..." : ""}</td>
                      <td className="py-3 px-4">
                        <div className="flex">
                          {Array.from({ length: t.stars }).map((_, i) => (
                            <FaStar key={i} className="text-red-600 mr-1" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {t.approved ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <FaCheckCircle /> Approved
                          </span>
                        ) : (
                          <span className="text-red-600">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {!t.approved && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setModal({ open: true, action: "approve", id: t._id, name: t.name })}
                            className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                          >
                            Approve
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModal({ open: true, action: "delete", id: t._id, name: t.name })}
                          className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                          <FaTrash />
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {modal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-red-600 mb-4">
                {modal.action === "approve" ? "Approve Testimonial" : "Delete Testimonial"}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {modal.action} the testimonial by {modal.name}?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setModal({ open: false, action: "", id: null, name: "" })}
                  className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (modal.action === "approve" ? handleApprove(modal.id) : handleDelete(modal.id))}
                  className={`cursor-pointer px-4 py-2 rounded-lg text-white ${
                    modal.action === "approve" ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                  } transition`}
                >
                  {modal.action === "approve" ? "Approve" : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}