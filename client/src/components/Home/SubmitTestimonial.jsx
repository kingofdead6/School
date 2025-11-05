import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaComment } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../../api";

export default function SubmitTestimonialPage() {
  const [form, setForm] = useState({ name: "", text: "", stars: 5 });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    const errors = {};
    if (!form.name) errors.name = "Name is required";
    else if (form.name.length > 50) errors.name = "Name cannot exceed 50 characters";
    if (!form.text) errors.text = "Testimonial is required";
    else if (form.text.length > 500) errors.text = "Testimonial cannot exceed 500 characters";
    if (!form.stars || form.stars < 1 || form.stars > 5) errors.stars = "Rating must be between 1 and 5 stars";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/testimonials`, {
        name: form.name.trim(),
        title: "Community Feedback",
        text: form.text.trim(),
        stars: parseInt(form.stars),
      });
      setSuccess("Testimonial submitted successfully! Thank you for your feedback.");
      setError("");
      setForm({ name: "", text: "", stars: 5 });
      setFormErrors({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit testimonial. Please try again.");
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Share Your Experience
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            We value your feedback! Tell us about your experience with our school to inspire others.
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
              <label className="block text-red-700 font-medium mb-2">Testimonial</label>
              <div className="relative">
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Share your experience"
                  rows="5"
                  className={`w-full p-3 pl-10 pt-3 rounded-lg bg-white border ${
                    formErrors.text ? "border-red-600" : "border-red-200"
                  } text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
                  disabled={loading}
                />
                <div className="absolute top-3 left-3 pointer-events-none text-red-400">
                  <FaComment size={18} />
                </div>
              </div>
              {formErrors.text && (
                <p className="text-red-600 text-sm mt-1">{formErrors.text}</p>
              )}
            </div>

            <div>
              <label className="block text-red-700 font-medium mb-2">Rating</label>
              <select
                value={form.stars}
                onChange={(e) => setForm({ ...form, stars: e.target.value })}
                className={`w-full p-3 rounded-lg bg-white border ${
                  formErrors.stars ? "border-red-600" : "border-red-200"
                } text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500`}
                disabled={loading}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              {formErrors.stars && (
                <p className="text-red-600 text-sm mt-1">{formErrors.stars}</p>
              )}
            </div>

            <div className="flex justify-center">
              <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  type="submit"
  disabled={loading}
  className={`cursor-pointer flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition ${
    loading ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  {loading ? "Submitting..." : "Submit Testimonial"}
</motion.button>

            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}