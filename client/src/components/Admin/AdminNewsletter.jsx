import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPaperPlane, FaEnvelope } from "react-icons/fa";
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
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
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
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
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
    if (!form.subject) {
      errors.subject = "Subject is required";
    } else if (form.subject.length > 100) {
      errors.subject = "Subject cannot exceed 100 characters";
    }
    if (!form.message) {
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
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
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
      setError("");
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
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">Newsletter Management</h1>
          <button
            onClick={() => {
              setForm({ subject: "", message: "", isHtml: false });
              setSelectedSubscribers([]);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPaperPlane /> Send Newsletter
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}
        {success && <p className="text-green-500 text-center mb-6 font-medium">{success}</p>}

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by email..."
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
        ) : filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900 rounded-lg shadow-lg">
              <thead>
                <tr className="bg-red-700 text-white">
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === subscribers.length}
                      onChange={toggleSelectAll}
                      className="h-5 w-5 text-red-600 border-gray-600 rounded focus:ring-red-600"
                    />
                  </th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Subscribed At</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber._id}
                    className="border-b border-gray-800 hover:bg-gray-800"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber._id)}
                        onChange={() => toggleSubscriber(subscriber._id)}
                        className="h-5 w-5 text-red-600 border-gray-600 rounded focus:ring-red-600"
                      />
                    </td>
                    <td className="p-3">{subscriber.email}</td>
                    <td className="p-3">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(subscriber._id)}
                        disabled={deletingId === subscriber._id}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition ${
                          deletingId === subscriber._id ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <FaTrash /> {deletingId === subscriber._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-200 mt-10">No subscribers found</p>
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
                className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg"
              >
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                  Send Newsletter
                </h2>
                <form onSubmit={handleSendNewsletter} className="space-y-4">
                  <div>
                    <label className="block text-gray-200 mb-2">Subscribers</label>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.length === subscribers.length}
                        onChange={toggleSelectAll}
                        className="h-5 w-5 text-red-600 border-gray-600 rounded focus:ring-red-600"
                      />
                      <span className="ml-2">Select All</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-800 p-3 rounded">
                      {subscribers.map((sub) => (
                        <div key={sub._id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.includes(sub._id)}
                            onChange={() => toggleSubscriber(sub._id)}
                            className="h-4 w-4 text-red-600 border-gray-600 rounded focus:ring-red-600"
                          />
                          <span>{sub.email}</span>
                        </div>
                      ))}
                    </div>
                    {formErrors.subscribers && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.subscribers}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2">Subject</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${
                          formErrors.subject ? "border-red-500" : "border-gray-600"
                        } text-white`}
                        placeholder="Enter subject"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                        <FaEnvelope />
                      </div>
                    </div>
                    {formErrors.subject && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows="5"
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.message ? "border-red-500" : "border-gray-600"
                      } text-white resize-none`}
                      placeholder="Enter message"
                    />
                    {formErrors.message && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isHtml}
                      onChange={(e) => setForm({ ...form, isHtml: e.target.checked })}
                      className="h-4 w-4 text-red-600 border-gray-600 rounded focus:ring-red-600"
                    />
                    <span>Send as HTML</span>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="submit"
                      disabled={sendLoading}
                      className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition ${
                        sendLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {sendLoading ? "Sending..." : "Send"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={sendLoading}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}