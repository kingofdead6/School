import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPaperPlane, FaEnvelope, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "", isHtml: false });
  const [formErrors, setFormErrors] = useState({});
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const response = await axios.get(`${API_BASE_URL}/newsletter`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscribers(response.data);
      setError("");
    } catch (err) {
      console.error("Fetch subscribers error:", err);
      setError(err.response?.data?.message || "Failed to fetch subscribers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/newsletter/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Subscriber deleted successfully!");
      setError("");
      fetchSubscribers();
    } catch (err) {
      console.error("Delete subscriber error:", err);
      setError(err.response?.data?.message || "Failed to delete subscriber. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (selectedSubscribers.length === 0) {
      errors.subscribers = "At least one subscriber must be selected";
    }
    if (!form.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (form.subject.length > 100) {
      errors.subject = "Subject cannot exceed 100 characters";
    }
    if (!form.message.trim()) {
      errors.message = "Message is required";
    } else if (form.message.length > 1000) {
      errors.message = "Message cannot exceed 1000 characters";
    }
    return errors;
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSendLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/newsletter/send`,
        {
          subscriberIds: selectedSubscribers,
          subject: form.subject,
          message: form.message,
          isHtml: form.isHtml,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Newsletter sent successfully!");
      setTimeout(() => setSuccess(""), 4000);
      setForm({ subject: "", message: "", isHtml: false });
      setSelectedSubscribers([]);
      setShowModal(false);
      setFormErrors({});
    } catch (err) {
      console.error("Send newsletter error:", err);
      setError(err.response?.data?.message || "Failed to send newsletter. Please try again.");
    } finally {
      setSendLoading(false);
    }
  };

  const toggleSubscriber = (id) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map((s) => s._id));
    }
  };

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            <FaPaperPlane className="text-red-700" />
            Newsletter Management
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setForm({ subject: "", message: "", isHtml: false });
              setSelectedSubscribers([]);
              setFormErrors({});
              setShowModal(true);
            }}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPaperPlane /> Send Newsletter
          </motion.button>
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
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
            />
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          </div>
        </motion.div>

        {/* Subscriber Cards */}
        {loading ? (
          <p className="text-center text-gray-600">Loading subscribers...</p>
        ) : filteredSubscribers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscribers.map((subscriber, i) => (
              <motion.div
                key={subscriber._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.includes(subscriber._id)}
                    onChange={() => toggleSubscriber(subscriber._id)}
                    className="h-5 w-5 text-red-600 border-red-200 rounded focus:ring-red-500"
                  />
                  <span className="text-xs text-gray-500">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-800 font-medium text-lg mb-2 break-all">
                  {subscriber.email}
                </p>
                <div className="flex justify-end mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(subscriber._id)}
                    disabled={deletingId === subscriber._id}
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow transition ${
                      deletingId === subscriber._id
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 shadow-red-300"
                    }`}
                  >
                    <FaTrash />
                    {deletingId === subscriber._id ? "Deleting..." : "Delete"}
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
            No subscribers found
          </motion.p>
        )}

        {/* Send Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !sendLoading && setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-red-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-red-700">Send Newsletter</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={sendLoading}
                    className="cursor-pointer text-gray-500 hover:text-red-600 transition"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleSendNewsletter} className="space-y-5">
                  {/* Subscribers */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Subscribers</label>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.length === subscribers.length}
                        onChange={toggleSelectAll}
                        className="h-5 w-5 text-red-600 border-red-200 rounded focus:ring-red-500"
                      />
                      <span className="ml-2 text-gray-700">Select All ({selectedSubscribers.length}/{subscribers.length})</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg border border-red-100">
                      {subscribers.map((sub) => (
                        <div key={sub._id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.includes(sub._id)}
                            onChange={() => toggleSubscriber(sub._id)}
                            className="h-4 w-4 text-red-600 border-red-200 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 truncate">{sub.email}</span>
                        </div>
                      ))}
                    </div>
                    {formErrors.subscribers && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.subscribers}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Subject</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.subject ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                        }`}
                        placeholder="Enter subject"
                        maxLength="100"
                      />
                      <FaEnvelope className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                    <div className="flex justify-end text-xs mt-1">
                      <span className="text-gray-500">{form.subject.length}/100</span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows="6"
                      className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 resize-none ${
                        formErrors.message ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                      }`}
                      placeholder="Enter your message"
                      maxLength="1000"
                    />
                    <div className="flex justify-end text-xs mt-1">
                      <span className="text-gray-500">{form.message.length}/1000</span>
                    </div>
                  </div>

                  {/* HTML Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isHtml}
                      onChange={(e) => setForm({ ...form, isHtml: e.target.checked })}
                      className="h-4 w-4 text-red-600 border-red-200 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-700">Send as HTML</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-end pt-4">
                    <motion.button
                      whileHover={{ scale: sendLoading ? 1 : 1.05 }}
                      whileTap={{ scale: sendLoading ? 1 : 0.95 }}
                      type="submit"
                      disabled={sendLoading}
                      className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                        sendLoading
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-300"
                      }`}
                    >
                      {sendLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="cursor-pointer w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane /> Send
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={sendLoading}
                      className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Shake Animation */}
      <style jsx>{`
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