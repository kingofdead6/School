import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaEdit, FaUser, FaTrash, FaCamera, FaTimes, FaGraduationCap, 
  FaBookOpen, FaInfoCircle, FaImage, FaCheck, FaLock ,FaEnvelope
} from 'react-icons/fa';
import { API_BASE_URL } from '../../../api';

export default function TeacherProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    subjectsTaught: [],
    degree: '',
    bio: '',
    photo: null,
    removePhoto: false,
  });
  const [galleryFormData, setGalleryFormData] = useState({
    galleryImages: [],
    removeImageIds: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [galleryFormErrors, setGalleryFormErrors] = useState({});

  const subjects = [
    'Math', 'Physics', 'Science', 'Arabic', 'English',
    'French', 'Islamic', 'History', 'Geography', 'Philosophy',
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token provided');
      const response = await axios.get(`${API_BASE_URL}/teachers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        password: '',
        subjectsTaught: response.data.subjectsTaught || [],
        degree: response.data.degree || '',
        bio: response.data.bio || '',
        photo: null,
        removePhoto: false,
      });
      setGalleryFormData({
        galleryImages: [],
        removeImageIds: [],
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile. Please try again.');
      if (err.message === 'No token provided') navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    else if (formData.fullName.length > 50) errors.fullName = 'Name cannot exceed 50 characters';
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.subjectsTaught.length) errors.subjectsTaught = 'At least one subject is required';
    else if (formData.subjectsTaught.length > 2) errors.subjectsTaught = 'Maximum two subjects allowed';
    if (formData.degree && formData.degree.length > 100) errors.degree = 'Degree cannot exceed 100 characters';
    if (formData.bio && formData.bio.length > 500) errors.bio = 'Bio cannot exceed 500 characters';
    if (formData.photo && !['image/jpeg', 'image/png'].includes(formData.photo.type)) {
      errors.photo = 'Only JPEG or PNG images are allowed';
    }
    if (formData.photo && formData.photo.size > 5 * 1024 * 1024) {
      errors.photo = 'Image size cannot exceed 5MB';
    }
    return errors;
  };

  const validateGalleryForm = () => {
    const errors = {};
    if (galleryFormData.galleryImages.length > 10) {
      errors.galleryImages = 'Maximum 10 images allowed';
    }
    galleryFormData.galleryImages.forEach((file, index) => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        errors[`galleryImage${index}`] = `Image ${index + 1}: Only JPEG or PNG allowed`;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors[`galleryImage${index}`] = `Image ${index + 1}: Size cannot exceed 5MB`;
      }
    });
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const form = new FormData();
    form.append('fullName', formData.fullName.trim());
    if (formData.password) form.append('password', formData.password);
    form.append('subjectsTaught', JSON.stringify(formData.subjectsTaught));
    form.append('degree', formData.degree || '');
    form.append('bio', formData.bio || '');
    if (formData.photo) form.append('photo', formData.photo);
    form.append('removePhoto', formData.removePhoto.toString());

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/teachers/profile`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowEditModal(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    const errors = validateGalleryForm();
    setGalleryFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const form = new FormData();
    galleryFormData.galleryImages.forEach((file) => form.append('galleryImages', file));
    if (galleryFormData.removeImageIds.length > 0) {
      form.append('removeImageIds', JSON.stringify(galleryFormData.removeImageIds));
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/teachers/${user._id}/gallery`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Gallery updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowGalleryModal(false);
      setGalleryFormData({ galleryImages: [], removeImageIds: [] });
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject) => {
    setFormData(prev => {
      const updated = prev.subjectsTaught.includes(subject)
        ? prev.subjectsTaught.filter(s => s !== subject)
        : prev.subjectsTaught.length < 2 ? [...prev.subjectsTaught, subject] : prev.subjectsTaught;
      return { ...prev, subjectsTaught: updated };
    });
  };

  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFormData(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...files].slice(0, 10),
    }));
  };

  const removeGalleryImagePreview = (index) => {
    setGalleryFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const toggleRemoveImageId = (publicId) => {
    setGalleryFormData(prev => {
      const updated = prev.removeImageIds.includes(publicId)
        ? prev.removeImageIds.filter(id => id !== publicId)
        : [...prev.removeImageIds, publicId];
      return { ...prev, removeImageIds: updated };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="relative"
            >
              {user?.photo?.url && !formData.removePhoto ? (
                <img
                  src={user.photo.url}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <FaUser className="text-red-600" size={48} />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-md">
                <FaCamera className="text-white" size={18} />
              </div>
            </motion.div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-red-700">{user?.fullName || 'Loading...'}</h1>
              <p className="text-gray-600 mt-1 flex items-center justify-center md:justify-start gap-2">
                <FaEnvelope className="text-red-500" /> {user?.email}
              </p>
              <div className="flex justify-center md:justify-start gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-300 transition"
                >
                  <FaEdit /> Edit Profile
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium flex items-center justify-center gap-2"
            >
              <FaLock /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center font-medium flex items-center justify-center gap-2"
            >
              <FaCheck /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        ) : user ? (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Subjects */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 p-6"
            >
              <h3 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
                <FaBookOpen /> Subjects Taught
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.subjectsTaught?.length > 0 ? (
                  user.subjectsTaught.map((subject, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No subjects assigned</p>
                )}
              </div>
            </motion.div>

            {/* Degree & Bio */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 p-6"
            >
              <h3 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
                <FaGraduationCap /> Degree & Bio
              </h3>
              <p className="text-gray-700 font-medium">{user.degree || 'N/A'}</p>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                {user.bio || 'No bio available.'}
              </p>
            </motion.div>
          </div>
        ) : null}

        {/* Gallery Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
              <FaImage /> Gallery
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGalleryModal(true)}
              className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium shadow transition"
            >
              <FaCamera /> Manage
            </motion.button>
          </div>

          {user?.galleryImages?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {user.galleryImages.map((image, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition"
                >
                  <img
                    src={image.url}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition"></div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaImage className="mx-auto text-red-200 mb-3" size={48} />
              <p className="text-gray-600">No images in gallery</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            user={user}
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            loading={loading}
            subjects={subjects}
            toggleSubject={toggleSubject}
            onSubmit={handleEditSubmit}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <GalleryModal
            user={user}
            galleryFormData={galleryFormData}
            setGalleryFormData={setGalleryFormData}
            galleryFormErrors={galleryFormErrors}
            loading={loading}
            handleGalleryImageChange={handleGalleryImageChange}
            removeGalleryImagePreview={removeGalleryImagePreview}
            toggleRemoveImageId={toggleRemoveImageId}
            onSubmit={handleGallerySubmit}
            onClose={() => setShowGalleryModal(false)}
          />
        )}
      </AnimatePresence>

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

// Edit Profile Modal
function EditProfileModal({ user, formData, setFormData, formErrors, loading, subjects, toggleSubject, onSubmit, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-red-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-red-700">Edit Profile</h2>
            <button onClick={onClose} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Photo */}
          <div className="flex justify-center mb-4">
            {formData.photo ? (
              <img src={URL.createObjectURL(formData.photo)} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-red-200" />
            ) : user?.photo?.url && !formData.removePhoto ? (
              <img src={user.photo.url} alt="Current" className="w-24 h-24 rounded-full object-cover border-4 border-red-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <FaUser className="text-red-500" size={36} />
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full p-3 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${formErrors.fullName ? 'border-red-500 shake' : 'border-red-200 focus:border-red-500'}`}
              placeholder="Enter full name"
              disabled={loading}
            />
            {formErrors.fullName && <p className="text-red-600 text-sm mt-1">{formErrors.fullName}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">New Password (optional)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
              placeholder="Leave blank to keep current"
              disabled={loading}
            />
            {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Subjects Taught (Max 2)</label>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((subject) => (
                <label
                  key={subject}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition ${
                    formData.subjectsTaught.includes(subject)
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-red-200 text-gray-700 hover:border-red-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.subjectsTaught.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="hidden"
                    disabled={loading}
                  />
                  <span className="font-medium text-sm">{subject}</span>
                </label>
              ))}
            </div>
            {formErrors.subjectsTaught && <p className="text-red-600 text-sm mt-1">{formErrors.subjectsTaught}</p>}
          </div>

          {/* Degree & Bio */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Degree</label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition"
              placeholder="e.g. Master's in Education"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-red-700 font-semibold mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition resize-none"
              placeholder="Tell us about yourself..."
              disabled={loading}
            />
            {formErrors.bio && <p className="text-red-600 text-sm mt-1">{formErrors.bio}</p>}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-red-700 font-semibold mb-2">Profile Photo</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setFormData({ ...formData, photo: e.target.files[0], removePhoto: false })}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 file:bg-red-600 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
              disabled={loading}
            />
            {formErrors.photo && <p className="text-red-600 text-sm mt-1">{formErrors.photo}</p>}
            {user?.photo?.url && !formData.photo && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setFormData({ ...formData, removePhoto: true })}
                className="cursor-pointer mt-2 text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                disabled={loading}
              >
                <FaTrash /> Remove Current Photo
              </motion.button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
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
                  Updating...
                </>
              ) : (
                <>Update Profile</>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Gallery Modal
function GalleryModal({ user, galleryFormData, setGalleryFormData, galleryFormErrors, loading, handleGalleryImageChange, removeGalleryImagePreview, toggleRemoveImageId, onSubmit, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-red-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-red-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-red-700">Manage Gallery</h2>
            <button onClick={onClose} disabled={loading} className="cursor-pointer text-gray-500 hover:text-red-600">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-red-700 font-semibold mb-2">Add Images (Max 10)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleGalleryImageChange}
              className="w-full p-3 rounded-xl bg-white border-2 border-red-200 text-gray-800 file:bg-red-600 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
              disabled={loading}
            />
            {Object.values(galleryFormErrors).map((err, i) => (
              <p key={i} className="text-red-600 text-sm mt-1">{err}</p>
            ))}
          </div>

          {/* New Previews */}
          {galleryFormData.galleryImages.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">New Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {galleryFormData.galleryImages.map((file, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImagePreview(i)}
                      className="cursor-pointer absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing */}
          {user?.galleryImages?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Current Images</h3>
              <div className="grid grid-cols-3 gap-2">
                {user.galleryImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.url}
                      alt=""
                      className={`w-full h-24 object-cover rounded-lg transition ${galleryFormData.removeImageIds.includes(img.publicId) ? 'opacity-50' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleRemoveImageId(img.publicId)}
                      className={`cursor-pointer absolute top-1 right-1 rounded-full p-1 transition ${
                        galleryFormData.removeImageIds.includes(img.publicId)
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {galleryFormData.removeImageIds.includes(img.publicId) ? <FaCheck size={12} /> : <FaTrash size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
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
                  Updating...
                </>
              ) : (
                <>Update Gallery</>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}