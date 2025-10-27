import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaEnvelope, FaComment } from "react-icons/fa";
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
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const response = await axios.get(`${API_BASE_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data);
      setError("");
    } catch (err) {
      console.error('Fetch contacts error:', err);
      setError(err.response?.data?.message || "Failed to fetch contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      await axios.delete(`${API_BASE_URL}/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Contact deleted successfully!");
      setError("");
      setSelectedContact(null); // Close modal if open
      fetchContacts();
    } catch (err) {
      console.error('Delete contact error:', err);
      setError(err.response?.data?.message || "Failed to delete contact. Please try again.");
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
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">Contact Messages Management</h1>
        </div>

        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}
        {success && <p className="text-green-500 text-center mb-6 font-medium">{success}</p>}

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-1/2 p-3 pl-10 rounded-lg bg-gray-800 border border-gray-600 text-white"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <FaEnvelope />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact, i) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
                onClick={() => handleCardClick(contact)}
              >
                <h2 className="text-xl font-semibold text-red-600">{contact.name}</h2>
                <p className="text-gray-300 mt-2">Email: {contact.email}</p>
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from opening modal
                      handleDelete(contact._id);
                    }}
                    disabled={deletingId === contact._id}
                    className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition ${
                      deletingId === contact._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FaTrash /> {deletingId === contact._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-200 mt-10">No contact messages found</p>
        )}

        <AnimatePresence>
          {selectedContact && (
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
                className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg"
              >
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                  Contact Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-200 font-semibold">Name</label>
                    <p className="text-white">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-200 font-semibold">Email</label>
                    <p className="text-white">{selectedContact.email}</p>
                  </div>
                  <div>
  <label className="block text-gray-200 font-semibold">Message</label>
  <p className="text-white bg-gray-800 p-3 rounded-lg max-w-xl whitespace-normal break-words">
    {selectedContact.message}
  </p>
</div>

                  <div>
                    <label className="block text-gray-200 font-semibold">Created At</label>
                    <p className="text-white">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => handleDelete(selectedContact._id)}
                    disabled={deletingId === selectedContact._id}
                    className={`flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition ${
                      deletingId === selectedContact._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <FaTrash /> {deletingId === selectedContact._id ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition"
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