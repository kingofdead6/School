import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBook,
  FaChalkboardTeacher,
  FaUsers,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../../api";

export default function StudentRegistrationForm() {
  // ── State ────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    studentInfo: { firstName: "", lastName: "", grade: "" },
    parentInfo: { name: "", email: "", phone: "" },
    subject: "",
    teacher: "",
    group: "",
  });
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const subjects = [
    "Math",
    "Physics",
    "Science",
    "Arabic",
    "English",
    "French",
    "Islamic",
    "History",
    "Geography",
    "Philosophy",
  ];

  // ── Fetch data ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, teachersRes, groupsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/grades`),
          axios.get(`${API_BASE_URL}/teachers`),
          axios.get(`${API_BASE_URL}/groups`),
        ]);
        setGrades(gradesRes.data);
        setTeachers(teachersRes.data);
        setGroups(groupsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // ── Filtering helpers ─────────────────────────────────────────────
  const filteredTeachers = teachers.filter((t) =>
    formData.subject ? t.subjectsTaught.includes(formData.subject) : true
  );

  const filteredGroups = groups.filter(
    (g) =>
      (!formData.studentInfo.grade || g.grade?._id === formData.studentInfo.grade) &&
      (!formData.subject || g.subject === formData.subject) &&
      (!formData.teacher || g.teacher?._id === formData.teacher)
  );

  // ── Validation ───────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.studentInfo.firstName.trim()) e.firstName = "Student first name is required.";
    if (!formData.studentInfo.lastName.trim()) e.lastName = "Student last name is required.";
    if (!formData.studentInfo.grade) e.grade = "Grade is required.";
    if (!formData.subject) e.subject = "Subject is required.";
    if (!formData.teacher) e.teacher = "Teacher is required.";
    if (!formData.group) e.group = "Group is required.";
    if (!formData.parentInfo.name.trim()) e.parentName = "Parent name is required.";
    if (!formData.parentInfo.email.trim()) e.parentEmail = "Parent email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.parentInfo.email))
      e.parentEmail = "Invalid email format.";
    return e;
  };

  // ── Reset Form ───────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      studentInfo: { firstName: "", lastName: "", grade: "" },
      parentInfo: { name: "", email: "", phone: "" },
      subject: "",
      teacher: "",
      group: "",
    });
    setErrors({});
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/registrations`, {
        studentInfo: {
          firstName: formData.studentInfo.firstName.trim(),
          lastName: formData.studentInfo.lastName.trim(),
          grade: formData.studentInfo.grade,
        },
        parentInfo: {
          name: formData.parentInfo.name.trim(),
          email: formData.parentInfo.email.trim(),
          phone: formData.parentInfo.phone.trim(),
        },
        group: formData.group,
      });

      resetForm();
      setShowSuccessPopup(true); // Show popup
      setTimeout(() => setShowSuccessPopup(false), 7000); // Auto-hide after 7s
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Registration failed." });
    } finally {
      setLoading(false);
    }
  };

  // ── Field Animation Variants ─────────────────────────────────────
  const fieldVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  const fields = [
    "firstName",
    "lastName",
    "grade",
    "subject",
    "teacher",
    "group",
    "parentName",
    "parentEmail",
    "parentPhone",
  ];

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen  mt-20  py-12 px-4 overflow-x-hidden relative">
      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-green-200 flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <FaCheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800">Registration Successful!</h3>
                <p className="text-gray-700 mt-1">
                  Our team will review your application and call you to confirm acceptance.
                </p>
                <p className="text-sm text-gray-500 mt-2">Thank you for choosing us!</p>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when popup is open */}
      {showSuccessPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-40"
          onClick={() => setShowSuccessPopup(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="text-5xl font-extrabold text-red-600 flex items-center justify-center gap-3"
          >
            <FaGraduationCap className="w-12 h-12 animate-pulse" />
            Student Registration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg"
          >
            Enroll your child in our educational programs. Fill out the form below to get started.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
          className="max-w-lg mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-red-100"
        >
          {/* Submit Error */}
          {errors.submit && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {errors.submit}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field, index) => (
              <motion.div
                key={field}
                custom={index}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Render fields dynamically with error handling */}
                {(() => {
                  const commonInputClass = `w-full p-3 pl-11 rounded-xl bg-white border-2 transition-all duration-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-100 ${
                    errors[field] ? "border-red-500 shake" : "border-red-200 focus:border-red-500"
                  }`;

                  const commonLabel = "block text-red-700 font-semibold mb-2";

                  switch (field) {
                    case "firstName":
                      return (
                        <div>
                          <label className={commonLabel}>Student First Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.studentInfo.firstName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  studentInfo: { ...formData.studentInfo, firstName: e.target.value },
                                })
                              }
                              placeholder="Enter first name"
                              className={commonInputClass}
                              disabled={loading}
                            />
                            <FaUser className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.firstName && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.firstName}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "lastName":
                      return (
                        <div>
                          <label className={commonLabel}>Student Last Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.studentInfo.lastName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  studentInfo: { ...formData.studentInfo, lastName: e.target.value },
                                })
                              }
                              placeholder="Enter last name"
                              className={commonInputClass}
                              disabled={loading}
                            />
                            <FaUser className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.lastName && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.lastName}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "grade":
                      return (
                        <div>
                          <label className={commonLabel}>Grade</label>
                          <div className="relative">
                            <select
                              value={formData.studentInfo.grade}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  studentInfo: { ...formData.studentInfo, grade: e.target.value },
                                  subject: "",
                                  teacher: "",
                                  group: "",
                                });
                              }}
                              className={`${commonInputClass} appearance-none`}
                              disabled={loading}
                            >
                              <option value="">Select Grade</option>
                              {grades.map((g) => (
                                <option key={g._id} value={g._id}>
                                  {g.name}
                                </option>
                              ))}
                            </select>
                            <FaGraduationCap className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.grade && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.grade}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "subject":
                      return (
                        <div>
                          <label className={commonLabel}>Subject</label>
                          <div className="relative">
                            <select
                              value={formData.subject}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  subject: e.target.value,
                                  teacher: "",
                                  group: "",
                                });
                              }}
                              className={`${commonInputClass} appearance-none`}
                              disabled={!formData.studentInfo.grade || loading}
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <FaBook className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.subject && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.subject}
                              </motion.p>
                            )}
                            {!formData.studentInfo.grade && (
                              <p className="text-gray-500 text-sm mt-1 pl-1">Select a grade first</p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "teacher":
                      return (
                        <div>
                          <label className={commonLabel}>Teacher</label>
                          <div className="relative">
                            <select
                              value={formData.teacher}
                              onChange={(e) => {
                                setFormData({ ...formData, teacher: e.target.value, group: "" });
                              }}
                              className={`${commonInputClass} appearance-none`}
                              disabled={!formData.subject || loading}
                            >
                              <option value="">Select Teacher</option>
                              {filteredTeachers.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.fullName}
                                </option>
                              ))}
                            </select>
                            <FaChalkboardTeacher className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.teacher && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.teacher}
                              </motion.p>
                            )}
                            {!formData.subject && (
                              <p className="text-gray-500 text-sm mt-1 pl-1">Select a subject first</p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "group":
                      return (
                        <div>
                          <label className={commonLabel}>Group</label>
                          <div className="relative">
                            <select
                              value={formData.group}
                              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                              className={`${commonInputClass} appearance-none`}
                              disabled={
                                !formData.studentInfo.grade ||
                                !formData.subject ||
                                !formData.teacher ||
                                loading
                              }
                            >
                              <option value="">Select Group</option>
                              {filteredGroups.map((g) => (
                                <option key={g._id} value={g._id}>
                                  {`${g.name} (${g.subject}, ${g.schedule.day} ${g.schedule.startingtime}-${g.schedule.endingtime})`}
                                </option>
                              ))}
                            </select>
                            <FaUsers className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.group && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.group}
                              </motion.p>
                            )}
                            {(!formData.studentInfo.grade ||
                              !formData.subject ||
                              !formData.teacher) && (
                              <p className="text-gray-500 text-sm mt-1 pl-1">
                                Select grade, subject and teacher first
                              </p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "parentName":
                      return (
                        <div>
                          <label className={commonLabel}>Parent Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.parentInfo.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  parentInfo: { ...formData.parentInfo, name: e.target.value },
                                })
                              }
                              placeholder="Enter parent name"
                              className={commonInputClass}
                              disabled={loading}
                            />
                            <FaUser className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.parentName && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.parentName}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "parentEmail":
                      return (
                        <div>
                          <label className={commonLabel}>Parent Email</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.parentInfo.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  parentInfo: { ...formData.parentInfo, email: e.target.value },
                                })
                              }
                              placeholder="parent@example.com"
                              className={commonInputClass}
                              disabled={loading}
                            />
                            <FaEnvelope className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                          <AnimatePresence>
                            {errors.parentEmail && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-600 text-sm mt-1 pl-1"
                              >
                                {errors.parentEmail}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      );

                    case "parentPhone":
                      return (
                        <div>
                          <label className={commonLabel}>Parent Phone</label>
                          <div className="relative">
                           <input
  type="tel"
  pattern="\d{10}"
  maxLength="10"
  value={formData.parentInfo.phone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // remove non-digits
    setFormData({
      ...formData,
      parentInfo: { ...formData.parentInfo, phone: value },
    });
  }}
  placeholder="+213 **********"
  className="w-full p-3 pl-11 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all duration-200"
  disabled={loading}
/>

                            <FaPhone className="absolute left-3.5 top-3.5 text-red-400" size={20} />
                          </div>
                        </div>
                      );

                    default:
                      return null;
                  }
                })()}
              </motion.div>
            ))}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center pt-6"
            >
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.06 }}
                whileTap={{ scale: loading ? 1 : 0.96 }}
                type="submit"
                disabled={loading}
                className={`cursor-pointer flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all duration-300 ${
                  loading
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-300"
                }`}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Submitting...
                  </>
                ) : (
                  "Register Student"
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
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