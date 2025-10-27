import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "teacher") {
          setUserRole(decoded.role);
        } else {
          setError("Access denied: Teachers only");
          navigate("/login");
        }
      } catch (err) {
        setError("Invalid token. Please log in again.");
        navigate("/login");
      }
    } else {
      setError("No token provided. Please log in.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sections = [
    {
      path: "/teacher/profile",
      title: "Profile",
      description: "View and edit your profile information",
    },
    {
      path: "/teacher/groups",
      title: "Assigned Groups",
      description: "View your groups and their students",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-red-600">Teacher Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.path}
              className="p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition text-center shadow-lg hover:shadow-2xl shadow-red-500"
            >
              <h2 className="text-2xl font-semibold text-red-600">{section.title}</h2>
              <p className="mt-2 text-gray-200">{section.description}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}