import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaPaperPlane,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaHome,
  FaInfoCircle,
  FaUserShield,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";
    return "";
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const emailError = validateEmail();
    setError(emailError);
    setSuccess("");
    if (emailError) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/newsletter`, { email });
      setSuccess("Subscribed successfully! Welcome to our community.");
      setEmail("");
      setError("");
      setTimeout(() => setSuccess(""), 5000); // Auto-clear
    } catch (err) {
      setError(err.response?.data?.message || "Failed to subscribe. Try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", path: "/", icon: <FaHome /> },
    { label: "About Us", path: "/about-us", icon: <FaInfoCircle /> },
    { label: "Registration", path: "/registration", icon: <FaUserShield /> },
    { label: "Contact", path: "/contact", icon: <FaEnvelopeOpenText /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="bg-gradient-to-t from-gray-900 to-gray-800 text-white py-16 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-700 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10"
      >
        {/* Brand & Description */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              E
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">
              <span className="text-red-500">Edu</span>
              <span className="text-white">Center</span>
            </h3>
          </motion.div>
          <p className="text-gray-300 leading-relaxed">
            Empowering the next generation with quality education, modern tools, and a supportive learning environment.
          </p>
          <div className="flex gap-3 mt-6">
            {[FaFacebook, FaInstagram, FaLinkedin].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.2, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-red-500 mb-5">Quick Links</h3>
          <ul className="space-y-3">
            {quickLinks.map((link, i) => (
              <motion.li
                key={i}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
              >
                <span className="text-red-500">{link.icon}</span>
                <a
                  href={link.path}
                  className="text-gray-300 hover:text-red-400 transition font-medium"
                >
                  {link.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-red-500 mb-5">Contact Us</h3>
          <ul className="space-y-4 text-gray-300">
            <motion.li whileHover={{ x: 5 }} className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-red-500" />
              <span>123 Education St, Algiers, Algeria</span>
            </motion.li>
            <motion.li whileHover={{ x: 5 }} className="flex items-center gap-3">
              <FaPhone className="text-red-500" />
              <span>+213 555 123 456</span>
            </motion.li>
            <motion.li whileHover={{ x: 5 }} className="flex items-center gap-3">
              <FaEnvelope className="text-red-500" />
              <span>contact@educenter.dz</span>
            </motion.li>
          </ul>
        </motion.div>

        {/* Newsletter */}
        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-red-500 mb-5">Stay Updated</h3>
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full p-4 pl-12 rounded-xl bg-gray-800 border-2 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-500/30 ${
                  error ? "border-red-500 shake" : "border-gray-600"
                }`}
                disabled={loading}
              />
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={20} />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm font-medium"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-400 text-sm font-medium flex items-center gap-2"
                >
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: 2, duration: 0.4 }}
                  >
                  </motion.span>
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className={`cursor-pointer w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              }`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Subscribing...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Subscribe
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400"
      >
        <p className="text-sm">
          © {currentYear} <span className="text-red-500 font-semibold">EduCenter</span>. All rights reserved.
        </p>
        <p className="text-xs mt-2">Crafted with passion for education</p>
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
    </footer>
  );
}