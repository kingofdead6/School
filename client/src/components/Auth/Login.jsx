import { useState } from "react";
import { AnimatePresence,motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email format.";
    if (!password) e.password = "Please enter your password.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        let response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        window.dispatchEvent(new Event("authChanged"));

        if (user.role === "superadmin" || user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          setErrors({ form: "Unauthorized role" });
        }
      } catch (err) {
        try {
          const response = await axios.post(`${API_BASE_URL}/teachers/login`, { email, password });
          const { token, user } = response.data;

          localStorage.setItem("token", token);
          window.dispatchEvent(new Event("authChanged"));

          if (user.role === "teacher") {
            navigate("/teacher/dashboard");
          } else {
            setErrors({ form: "Unauthorized role" });
          }
        } catch (teacherErr) {
          setErrors({ form: teacherErr.response?.data?.message || "Login failed. Please try again." });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="w-full max-w-md bg-zinc-900/95 backdrop-blur-xl border border-red-800/50 rounded-2xl p-8 shadow-2xl shadow-red-900/20"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 p-1 shadow-lg shadow-red-600/50"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                E
              </div>
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
        </div>

        {/* Form Error */}
        <AnimatePresence>
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm text-center"
            >
              {errors.form}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition">
                <FaUser size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800 border-2 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500/20 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 shake"
                    : "border-zinc-700 focus:border-red-500"
                }`}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-xs text-red-400 pl-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition">
                <FaLock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-3 rounded-xl bg-zinc-800 border-2 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500/20 ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 shake"
                    : "border-zinc-700 focus:border-red-500"
                }`}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="cursor-pointer absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-xs text-red-400 pl-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
              loading
                ? "bg-red-700 cursor-not-allowed opacity-80"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-600/30"
            }`}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        {/* Footer Links */}
        
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