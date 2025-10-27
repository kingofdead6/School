import { useState } from "react";
import { motion } from "framer-motion";
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
        // Try User login first
        let response = await axios.post(`${API_BASE_URL}/users/login`, { email, password });
        const { token, user } = response.data;

        // Store token
        localStorage.setItem("token", token);

        // Dispatch auth event
        window.dispatchEvent(new Event("authChanged"));

        // Redirect based on role
        if (user.role === "superadmin" || user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          setErrors({ form: "Unauthorized role" });
        }
      } catch (err) {
        // If User login fails, try Teacher login
        try {
          const response = await axios.post(`${API_BASE_URL}/teachers/login`, { email, password });
          const { token, user } = response.data;

          // Store token
          localStorage.setItem("token", token);

          // Dispatch auth event
          window.dispatchEvent(new Event("authChanged"));

          // Redirect for teacher
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-black/70 backdrop-blur-md border border-red-700 rounded-2xl p-6 shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_10px_red]">
            <img
              src="https://res.cloudinary.com/dtwa3lxdk/image/upload/v1756897359/465660711_1763361547537323_2674934284076407223_n_prlt48.jpg"
              alt="Logo"
              className="rounded-full"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Login</h1>
          <p className="mt-2 text-sm text-gray-300">Enter your credentials to continue</p>
        </div>

        {errors.form && (
          <div className="mb-4 text-sm text-red-400 text-center">{errors.form}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Email</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pr-4 pl-10 py-3 rounded-lg bg-gray-800 border ${
                  errors.email ? "border-red-500" : "border-red-700"
                } text-white outline-none focus:border-red-600`}
                placeholder="example@mail.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              
            </div>
            {errors.email && (
              <p id="email-error" className="mt-2 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Password</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 hover:text-red-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border ${
                  errors.password ? "border-red-500" : "border-red-700"
                } text-white outline-none focus:border-red-600`}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="cursor-pointer absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-red-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              
            </div>
            {errors.password && (
              <p id="password-error" className="mt-2 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-3 rounded-lg bg-red-600 text-black font-bold hover:bg-red-500 transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}