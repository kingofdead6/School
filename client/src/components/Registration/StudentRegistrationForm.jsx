import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../../../api";


export default function StudentRegistrationForm() {
  const [formData, setFormData] = useState({
    studentInfo: { firstName: "", lastName: "", grade: "" },
    parentInfo: { name: "", email: "", phone: "" },
    group: "",
  });
  const [groups, setGroups] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch groups
    axios
      .get(`${API_BASE_URL}/groups`)
      .then((response) => setGroups(response.data))
      .catch((error) => console.error("Error fetching groups:", error));
  }, []);

  const validate = () => {
    const e = {};
    if (!formData.studentInfo.firstName) e.firstName = "Student first name is required.";
    if (!formData.studentInfo.lastName) e.lastName = "Student last name is required.";
    if (!formData.studentInfo.grade) e.grade = "Grade is required.";
    if (!formData.parentInfo.name) e.parentName = "Parent name is required.";
    if (!formData.parentInfo.email) e.parentEmail = "Parent email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.parentInfo.email))
      e.parentEmail = "Invalid email format.";
    if (!formData.group) e.group = "Group is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        await axios.post(`${API_BASE_URL}/registrations`, formData);
        setSuccess(true);
        setFormData({
          studentInfo: { firstName: "", lastName: "", grade: "" },
          parentInfo: { name: "", email: "", phone: "" },
          group: "",
        });
        setErrors({});
      } catch (error) {
        setErrors({ form: error.response?.data?.message || "Registration failed. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
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
          <h1 className="mt-4 text-2xl font-bold text-white">Student Registration</h1>
          <p className="mt-2 text-sm text-gray-300">Register a student for our programs</p>
        </div>

        {errors.form && (
          <div className="mb-4 text-sm text-red-400 text-center">{errors.form}</div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-400 text-center">
            Registration submitted successfully! Awaiting admin approval.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {/* Student First Name */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Student First Name</label>
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
                className={`w-full pr-12 pl-4 py-3 rounded-lg bg-gray-800 border ${
                  errors.firstName ? "border-red-500" : "border-red-700"
                } text-white outline-none focus:border-red-600`}
                placeholder="Enter first name"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
            </div>
            {errors.firstName && (
              <p className="mt-2 text-xs text-red-400">{errors.firstName}</p>
            )}
          </div>

          {/* Student Last Name */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Student Last Name</label>
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
                className={`w-full pr-12 pl-4 py-3 rounded-lg bg-gray-800 border ${
                  errors.lastName ? "border-red-500" : "border-red-700"
                } text-white outline-none focus:border-red-600`}
                placeholder="Enter last name"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
            </div>
            {errors.lastName && (
              <p className="mt-2 text-xs text-red-400">{errors.lastName}</p>
            )}
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Grade</label>
            <input
              type="text"
              value={formData.studentInfo.grade}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  studentInfo: { ...formData.studentInfo, grade: e.target.value },
                })
              }
              className={`w-full pr-12 pl-4 py-3 rounded-lg bg-gray-800 border ${
                errors.grade ? "border-red-500" : "border-red-700"
              } text-white outline-none focus:border-red-600`}
              placeholder="Enter grade (e.g., Grade 5)"
            />
            {errors.grade && <p className="mt-2 text-xs text-red-400">{errors.grade}</p>}
          </div>

          {/* Parent Name */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Parent Name</label>
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
                className={`w-full pr-12 pl-4 py-3 rounded-lg bg-gray-800 border ${
                  errors.parentName ? "border-red-500" : "border-red-700"
                } text-white outline-none focus:border-red-600`}
                placeholder="Enter parent name"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
            </div>
            {errors.parentName && (
              <p className="mt-2 text-xs text-red-400">{errors.parentName}</p>
            )}
          </div>

          {/* Parent Email */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Parent Email</label>
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
                className={`w-full pr-12 pl-4 py-3 rounded-lg bg-gray-800 border ${
                  errors.parentEmail ? "border-red-500" : "border-red-700"
                } text-white outline-none focus:border-red-600`}
                placeholder="Enter parent email"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope />
              </div>
            </div>
            {errors.parentEmail && (
              <p className="mt-2 text-xs text-red-400">{errors.parentEmail}</p>
            )}
          </div>

          {/* Parent Phone */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Parent Phone</label>
            <div className="relative">
              <input
                type="text"
                value={formData.parentInfo.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, phone: e.target.value },
                  })
                }
                className="w-full pr-12 pl-4 py-3 rounded-lg bg-gray-800 border border-red-700 text-white outline-none focus:border-red-600"
                placeholder="Enter parent phone (optional)"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <FaPhone />
              </div>
            </div>
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm text-gray-200 mb-2">Program Group</label>
            <select
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className={`w-full p-3 rounded-lg bg-gray-800 border ${
                errors.group ? "border-red-500" : "border-red-700"
              } text-white outline-none focus:border-red-600`}
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))}
            </select>
            {errors.group && <p className="mt-2 text-xs text-red-400">{errors.group}</p>}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-3 rounded-lg bg-red-600 text-black font-bold hover:bg-red-500 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Register"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}