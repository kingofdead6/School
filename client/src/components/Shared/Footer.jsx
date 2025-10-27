import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const emailError = validateEmail();
    setError(emailError);
    if (emailError) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/newsletter`, { email });
      setSuccess("Subscribed successfully! Thank you for joining our newsletter.");
      setError("");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      setError(err.response?.data?.message || "Failed to subscribe. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Site Description */}
        <div>
          <h3 className="text-xl font-bold text-red-600 mb-4">Tyabelawras</h3>
          <p className="text-gray-300">
            Empowering education with innovative tools and resources. Stay connected with our latest updates and announcements.
          </p>
        </div>

        {/* Newsletter Form */}
        <div>
          <h3 className="text-xl font-bold text-red-600 mb-4">Join Our Newsletter</h3>
          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full p-3 pl-10 rounded-lg bg-gray-800 border ${
                  error ? "border-red-500" : "border-gray-600"
                } text-white`}
                disabled={loading}
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaPaperPlane /> {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-xl font-bold text-red-600 mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/contact" className="text-gray-300 hover:text-red-600 transition">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/about" className="text-gray-300 hover:text-red-600 transition">
                About Us
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-gray-300 hover:text-red-600 transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-gray-300 hover:text-red-600 transition">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center">
        <p className="text-gray-400">
          &copy; {new Date().getFullYear()} Tyabelawras. All rights reserved.
        </p>
      </div>
    </footer>
  );
}