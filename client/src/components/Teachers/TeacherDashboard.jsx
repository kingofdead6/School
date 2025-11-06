import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { 
  FaUserCog, FaUsers, FaSignOutAlt, FaChalkboardTeacher, 
  FaArrowRight, FaLock 
} from "react-icons/fa";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "teacher") {
          setUserRole(decoded.role);
          setTeacherName(decoded.fullName || "Teacher");
        } else {
          setError("Access denied: Teachers only");
          setTimeout(() => navigate("/login"), 1500);
        }
      } catch (err) {
        setError("Invalid token. Please log in again.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } else {
      setError("No token provided. Please log in.");
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sections = [
    {
      path: "/teacher/profile",
      title: "My Profile",
      description: "Update personal info, contact, and teaching subjects",
      icon: <FaUserCog className="text-red-600" size={28} />,
      gradient: "from-red-500 to-red-600",
    },
    {
      path: "/teacher/groups",
      title: "Assigned Groups",
      description: "View your classes, students, and attendance",
      icon: <FaUsers className="text-red-600" size={28} />,
      gradient: "from-red-600 to-red-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <FaChalkboardTeacher className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-red-600">
                Welcome, {teacherName}!
              </h1>
              <p className="text-gray-600">Teacher Dashboard</p>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaSignOutAlt /> Logout
          </motion.button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium flex items-center justify-center gap-2"
            >
              <FaLock /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link
                to={section.path}
                className="block p-8 bg-white/95 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-red-300 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br ${section.gradient} rounded-xl shadow-md">
                    {section.icon}
                  </div>
                  <FaArrowRight className="text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" size={20} />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {section.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-red-600 font-medium">
                  <span>Go to {section.title.toLowerCase()}</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FaArrowRight size={16} />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </motion.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}