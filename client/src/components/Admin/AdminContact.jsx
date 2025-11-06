import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaEnvelope, FaComment, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminContact() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const response = await axios.get(`${API_BASE_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data);
      setError("");
    } catch (err) {
      console.error("Fetch contacts error:", err);
      setError(err.response?.data?.message || "Failed to fetch contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Message deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setSelectedContact(null);
      fetchContacts();
    } catch (err) {
      console.error("Delete contact error:", err);
      setError(err.response?.data?.message || "Failed to delete message. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCardClick = (contact) => {
    setSelectedContact(contact);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="text-3xl md:text-4xl font-extrabold text-red-600 flex items-center gap-3"
          >
            <FaEnvelope className="text-red-700" />
            Contact Messages
          </motion.h1>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
        </motion.div>

        {/* Contact Cards */}
        {loading ? (
          <p className="text-center text-gray-600">Loading messages...</p>
        ) : filteredContacts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact, i) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(contact)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-red-700 line-clamp-1">
                      {contact.name}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2 line-clamp-1">
                    {contact.email}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2 italic">
                    "{contact.message}"
                  </p>
                  <div className="flex justify-end mt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contact._id);
                      }}
                      disabled={deletingId === contact._id}
                      className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow transition ${
                        deletingId === contact._id
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 shadow-red-300"
                      }`}
                    >
                      <FaTrash />
                      {deletingId === contact._id ? "Deleting..." : "Delete"}
                    </motion.button>
                  </div>
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
            No contact messages found
          </motion.p>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedContact && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContact(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-red-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-red-700">Message Details</h2>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="cursor-pointer text-gray-500 hover:text-red-600 transition"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-1">Name</label>
                    <p className="text-gray-800 text-lg">{selectedContact.name}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-1">Email</label>
                    <p className="text-gray-800 break-all">{selectedContact.email}</p>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-1">Message</label>
                    <div className="bg-gray-50 p-4 rounded-xl border border-red-100">
                      <p className="text-gray-800 whitespace-pre-wrap break-words">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-1">Received</label>
                    <p className="text-gray-700 flex items-center gap-2">
                      <FaCalendarAlt className="text-red-500" />
                      {new Date(selectedContact.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-red-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(selectedContact._id)}
                    disabled={deletingId === selectedContact._id}
                    className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                      deletingId === selectedContact._id
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 shadow-red-300"
                    }`}
                  >
                    <FaTrash />
                    {deletingId === selectedContact._id ? "Deleting..." : "Delete Message"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedContact(null)}
                    className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Line Clamp & Shake */}
      <style jsx>{`
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}