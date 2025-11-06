import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "superadmin" || decoded.role === "admin") {
          setUserRole(decoded.role);
        } else {
          setUserRole(null);
          navigate("/login");
        }
      } catch (error) {
        setUserRole(null);
        navigate("/login");
      }
    } else {
      setUserRole(null);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  const adminSections = [
    { path: "/admin/gallery", title: "Gallery Management", description: "Upload and delete photos and videos" },
    { path: "/admin/announcements", title: "Announcements", description: "Create, edit, and delete announcements" },
    { path: "/admin/newsletter", title: "Newsletter", description: "Manage email lists and send newsletters" },
    { path: "/admin/contact", title: "Contact Messages", description: "View and respond to website inquiries" },
    { path: "/admin/registrations", title: "Registrations", description: "View, accept, or reject student applications" },
    { path: "/admin/students", title: "Students", description: "View all student records and attendance" },
    { path: "/admin/programs", title: "Programs Management", description: "Add and edit programs and curriculum" },
    { path: "/admin/testimonials", title: "Testimonials ", description: "Approve or delete submitted testimonials" },
  ];

  const superadminSections = [
    ...adminSections,
    { path: "/admin/admins", title: "Admin Management", description: "Create, edit, and delete admin accounts" },
    { path: "/admin/teachers", title: "Teachers Management", description: "Add, edit, and assign teacher info" },
    { path: "/admin/groups", title: "Groups Management", description: "Create and assign groups to teachers" },
    { path: "/admin/grades", title: "Grades Management", description: "Add and edit grades" },
  ];

  const sections = userRole === "superadmin" ? superadminSections : adminSections;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="text-4xl md:text-5xl font-extrabold text-red-600 flex items-center gap-3"
          >
            Admin Dashboard
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            Logout
          </motion.button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="group"
            >
              <Link
                to={section.path}
                className="block p-6 bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-red-300"
              >
                <h2 className="text-2xl font-bold text-red-700 group-hover:text-red-600 transition">
                  {section.title}
                </h2>
                <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                  {section.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Optional: Superadmin Badge */}
        {userRole === "superadmin" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              Super Admin Access
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}