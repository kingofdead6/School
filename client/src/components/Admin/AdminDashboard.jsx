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
    navigate("/login");
  };

  const adminSections = [
    {
      path: "/admin/gallery",
      title: "Gallery Management",
      description: "Upload and delete photos and videos",
    },
    {
      path: "/admin/announcements",
      title: "Announcements",
      description: "Create, edit, and delete announcements",
    },
    {
      path: "/admin/newsletter",
      title: "Newsletter",
      description: "Manage email lists and send newsletters",
    },
    {
      path: "/admin/contact",
      title: "Contact Messages",
      description: "View and respond to website inquiries",
    },
    {
      path: "/admin/registrations",
      title: "Registrations",
      description: "View, accept, or reject student applications",
    },
    {
      path: "/admin/students",
      title: "Students",
      description: "View all student records and attendance",
    },
    {
      path: "/admin/programs",
      title: "Programs Management",
      description: "Add and edit programs and curriculum",
    },
    
  ];

  const superadminSections = [
    ...adminSections,
    {
      path: "/admin/admins",
      title: "Admin Management",
      description: "Create, edit, and delete admin accounts",
    },
    {
      path: "/admin/teachers",
      title: "Teachers Management",
      description: "Add, edit, and assign teacher info",
    },
    {
      path: "/admin/groups",
      title: "Groups Management",
      description: "Create and assign groups to teachers",
    },
    {
      path: "/admin/grades",
      title: "Grades Management",
      description: "Add and edit grades",
    },
  ];

  const sections = userRole === "superadmin" ? superadminSections : adminSections;

  return (
    <div className="min-h-screen  py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-center text-red-600">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="cursor-pointer bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition"
          >
            Logout
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.path}
              className="p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition text-center shadow-lg hover:shadow-2xl shadow-red-500"
            >
              <h2 className="text-2xl font-semibold text-red-500">{section.title}</h2>
              <p className="mt-2 text-gray-200">{section.description}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}