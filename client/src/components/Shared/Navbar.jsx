import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserShield,
  FaHome,
  FaInfoCircle,
  FaUserGraduate,
  FaUsers,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaBook,
  FaImages,
  FaBullhorn,
  FaEnvelope,
  FaCommentDots,
  FaQuoteLeft,
  FaUserCog,
  FaUserCircle,
  FaClipboardList,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const logoRef = useRef(null);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Logo pulse
  useEffect(() => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        scale: [1, 1.12, 1],
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  // === AUTH STATE MANAGEMENT ===
  const updateAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || null);
        setUserName(decoded.fullName || decoded.email?.split("@")[0] || "User");
      } catch (err) {
        console.error("Invalid token:", err);
        setUserRole(null);
        setUserName("");
        localStorage.removeItem("token");
      }
    } else {
      setUserRole(null);
      setUserName("");
    }
  };

  // Run on mount + on auth change
  useEffect(() => {
    updateAuth(); // On load
    const handleAuthChange = () => updateAuth();
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    setMenuOpen(false);
    navigate("/login");
  };

  // === NAVIGATION ITEMS ===
  const publicNav = [
    { label: "Home", path: "/", icon: <FaHome /> },
    { label: "About Us", path: "/about-us", icon: <FaInfoCircle /> },
    { label: "Registration", path: "/registration", icon: <FaUserGraduate /> },
  ];

  const adminNav = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaUserShield /> },
    { label: "Registrations", path: "/admin/registrations", icon: <FaUserGraduate /> },
    { label: "Students", path: "/admin/students", icon: <FaUsers /> },
    { label: "Teachers", path: "/admin/teachers", icon: <FaChalkboardTeacher /> },
    { label: "Groups", path: "/admin/groups", icon: <FaUsers /> },
    { label: "Grades", path: "/admin/grades", icon: <FaGraduationCap /> },
    { label: "Programs", path: "/admin/programs", icon: <FaBook /> },
    { label: "Gallery", path: "/admin/gallery", icon: <FaImages /> },
    { label: "Announcements", path: "/admin/announcements", icon: <FaBullhorn /> },
    { label: "Newsletter", path: "/admin/newsletter", icon: <FaEnvelope /> },
    { label: "Contact", path: "/admin/contact", icon: <FaCommentDots /> },
    { label: "Testimonials", path: "/admin/testimonials", icon: <FaQuoteLeft /> },
  ];

  const superadminNav = [
    ...adminNav,
    { label: "Admins", path: "/admin/admins", icon: <FaUserCog /> },
  ];

  const teacherNav = [
    { label: "Dashboard", path: "/teacher/dashboard", icon: <FaChalkboardTeacher /> },
    { label: "Profile", path: "/teacher/profile", icon: <FaUserCircle /> },
    { label: "Groups", path: "/teacher/groups", icon: <FaClipboardList /> },
  ];

  const navItems = userRole === "superadmin"
    ? superadminNav
    : userRole === "admin"
    ? adminNav
    : userRole === "teacher"
    ? teacherNav
    : publicNav;

  const renderNavItems = (items) =>
    items.map((item, index) => (
      <motion.li
        key={`${item.path}-${index}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2"
      >
        <Link
          to={item.path}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
            location.pathname === item.path
              ? "bg-red-600 text-white shadow-md"
              : "text-gray-700 hover:bg-red-50 hover:text-red-600"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </motion.li>
    ));

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-lg ${
        scrolled ? "bg-white/95 backdrop-blur-sm" : "bg-white"
      } border-b border-red-100`}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-6 max-w-7xl">
        {/* Logo */}
        <motion.div
          ref={logoRef}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 ml-5"
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-red-600">Edu</span>
              <span className="text-gray-800">Center</span>
            </h1>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <ul className="flex gap-1">
            {renderNavItems(navItems.slice(0, userRole ? 5 : 3))}
          </ul>

          {/* More Dropdown */}
          {userRole && navItems.length > 5 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <button className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium flex items-center gap-2">
                More
              </button>
              <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-red-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-max">
                <ul className="py-2">
                  {navItems.slice(5).map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.path}
                        className="flex items-center gap-2 px-6 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* User + Logout */}
          {userRole && (
            <div className="ml-4 flex items-center gap-3">
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition flex items-center gap-2 shadow-md"
              >
                <FaSignOutAlt />
                Logout
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="lg:hidden text-2xl text-red-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: menuOpen ? "auto" : 0, opacity: menuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden overflow-hidden bg-white border-t border-red-100"
      >
        <ul className="py-4 px-6 space-y-2">
          {renderNavItems(navItems)}

          {userRole && (
            <div className="pt-4 border-t border-red-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-red-600" />
                  <span className="font-bold text-red-700 capitalize">{userName}</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition flex items-center justify-center gap-2 shadow-md"
              >
                <FaSignOutAlt />
                Logout
              </motion.button>
            </div>
          )}
        </ul>
      </motion.div>
    </motion.nav>
  );
}