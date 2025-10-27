import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaComment, FaPaperPlane } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!form.name) errors.name = "Name is required";
    else if (form.name.length > 50) errors.name = "Name cannot exceed 50 characters";
    if (!form.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Please enter a valid email address";
    if (!form.message) errors.message = "Message is required";
    else if (form.message.length > 1000)
      errors.message = "Message cannot exceed 1000 characters";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/contact`, {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSuccess("Message sent successfully! We'll get back to you soon.");
      setError("");
      setForm({ name: "", email: "", message: "" });
      setFormErrors({});
    } catch (err) {
      console.error("Contact form submission error:", err);
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 overflow-x-hidden">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Contact Us
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Reach out to us with any questions, feedback, or inquiries. We're here to help!
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto bg-red-50 rounded-xl shadow-sm p-8"
        >
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-red-700 font-medium mb-2">Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                  className={`w-full p-3 pl-10 rounded-lg bg-white border ${
                    formErrors.name ? "border-red-600" : "border-red-200"
                  } text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500`}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-red-400">
                  <FaUser size={18} />
                </div>
              </div>
              {formErrors.name && (
                <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-red-700 font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                  className={`w-full p-3 pl-10 rounded-lg bg-white border ${
                    formErrors.email ? "border-red-600" : "border-red-200"
                  } text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500`}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-red-400">
                  <FaEnvelope size={18} />
                </div>
              </div>
              {formErrors.email && (
                <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-red-700 font-medium mb-2">Message</label>
              <div className="relative">
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Enter your message"
                  rows="5"
                  className={`w-full p-3 pl-10 pt-3 rounded-lg bg-white border ${
                    formErrors.message ? "border-red-600" : "border-red-200"
                  } text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
                  disabled={loading}
                />
                <div className="absolute top-3 left-3 pointer-events-none text-red-400">
                  <FaComment size={18} />
                </div>
              </div>
              {formErrors.message && (
                <p className="text-red-600 text-sm mt-1">{formErrors.message}</p>
              )}
            </div>

            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className={`cursor-pointer flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaPaperPlane /> {loading ? "Sending..." : "Send Message"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}