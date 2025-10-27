import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaEdit, FaUser, FaTrash, FaCamera, FaTimes } from 'react-icons/fa';
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
        fullName: response.data.fullName,
        email: response.data.email,
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
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Failed to fetch profile. Please try again.');
      if (err.message === 'No token provided') navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName) errors.fullName = 'Full name is required';
    else if (formData.fullName.length > 50) errors.fullName = 'Name cannot exceed 50 characters';
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.subjectsTaught || formData.subjectsTaught.length === 0) errors.subjectsTaught = 'At least one subject is required';
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
    form.append('fullName', formData.fullName);
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
      setError('');
      setShowEditModal(false);
      fetchProfile();
    } catch (err) {
      console.error('Update profile error:', err);
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
    galleryFormData.galleryImages.forEach((file) => {
      form.append('galleryImages', file);
    });
    if (galleryFormData.removeImageIds.length > 0) {
      form.append('removeImageIds', JSON.stringify(galleryFormData.removeImageIds));
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/teachers/${user._id}/gallery`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Gallery updated successfully!');
      setError('');
      setShowGalleryModal(false);
      setGalleryFormData({ galleryImages: [], removeImageIds: [] });
      fetchProfile();
    } catch (err) {
      console.error('Update gallery error:', err);
      setError(err.response?.data?.message || 'Failed to update gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject) => {
    setFormData((prev) => {
      const updatedSubjects = prev.subjectsTaught.includes(subject)
        ? prev.subjectsTaught.filter((s) => s !== subject)
        : [...prev.subjectsTaught, subject];
      return { ...prev, subjectsTaught: updatedSubjects };
    });
  };

  const handleGalleryImageChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...files],
    }));
  };

  const removeGalleryImagePreview = (index) => {
    setGalleryFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const toggleRemoveImageId = (publicId) => {
    setGalleryFormData((prev) => {
      const updatedRemoveImageIds = prev.removeImageIds.includes(publicId)
        ? prev.removeImageIds.filter((id) => id !== publicId)
        : [...prev.removeImageIds, publicId];
      return { ...prev, removeImageIds: updatedRemoveImageIds };
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section with Profile Picture */}
      <div className="relative bg-gradient-to-r from-red-600 to-black h-64 flex items-center justify-center">
        {user?.photo?.url ? (
          <motion.img
            src={user.photo.url}
            alt={user.fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg absolute -bottom-16"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border-4 border-white shadow-lg absolute -bottom-16">
            <FaUser size={48} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-4xl mx-auto mt-20 px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-4xl font-extrabold text-red-600 text-center mb-4">{user?.fullName || 'Teacher Profile'}</h1>
        <p className="text-center text-gray-400 mb-8">{user?.email || 'Loading...'}</p>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-center mb-6 font-medium bg-red-900/20 p-3 rounded-lg"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 text-center mb-6 font-medium bg-green-900/20 p-3 rounded-lg"
          >
            {success}
          </motion.p>
        )}

        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading...</p>
        ) : user ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-red-600">Subjects Taught</h3>
                <p className="text-gray-300">{user.subjectsTaught?.join(', ') || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-600">Degree</h3>
                <p className="text-gray-300">{user.degree || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-600">Bio</h3>
                <p className="text-gray-300">{user.bio || 'N/A'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditModal(true)}
                className="mt-6 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md mx-auto"
              >
                <FaEdit /> Edit Profile
              </motion.button>
            </div>

            {/* Gallery Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-red-600">Gallery</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGalleryModal(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <FaCamera /> Manage Gallery
                </motion.button>
              </div>
              {user.galleryImages?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {user.galleryImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300">No gallery images available.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-200 bg-gray-800 p-4 rounded-lg">No profile data available</p>
        )}
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-red-600/50"
            >
              <div className="relative mb-6">
                {user?.photo?.url && !formData.removePhoto ? (
                  <motion.img
                    src={user.photo.url}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border-4 border-white shadow-lg mx-auto">
                    <FaUser size={36} />
                  </div>
                )}
                <h2 className="text-3xl font-bold text-red-600 text-center mt-4">Edit Profile</h2>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-200 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full p-3 rounded-lg bg-gray-800 border ${
                      formErrors.fullName ? 'border-red-500' : 'border-gray-600'
                    } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                    disabled={loading}
                  />
                  {formErrors.fullName && <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-gray-200 font-medium mb-2">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full p-3 rounded-lg bg-gray-800 border ${
                      formErrors.password ? 'border-red-500' : 'border-gray-600'
                    } text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition`}
                    disabled={loading}
                  />
                  {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-gray-200 font-medium mb-2">Subjects Taught (Select up to 2)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects.map((subject) => (
                      <label key={subject} className="flex items-center gap-2 text-gray-200">
                        <input
                          type="checkbox"
                          checked={formData.subjectsTaught.includes(subject)}
                          onChange={() => toggleSubject(subject)}
                          disabled={loading || (formData.subjectsTaught.length >= 2 && !formData.subjectsTaught.includes(subject))}
                          className="h-4 w-4 text-red-600 focus:ring-red-600 bg-gray-800 border-gray-600 rounded"
                        />
                        {subject}
                      </label>
                    ))}
                  </div>
                  {formErrors.subjectsTaught && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.subjectsTaught}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-200 font-medium mb-2">Degree</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                    disabled={loading}
                  />
                  {formErrors.degree && <p className="text-red-400 text-sm mt-1">{formErrors.degree}</p>}
                </div>
                <div>
                  <label className="block text-gray-200 font-medium mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="5"
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition resize-none"
                    disabled={loading}
                  />
                  {formErrors.bio && <p className="text-red-400 text-sm mt-1">{formErrors.bio}</p>}
                </div>
                <div>
                  <label className="block text-gray-200 font-medium mb-2">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => setFormData({ ...formData, photo: e.target.files[0], removePhoto: false })}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white file:bg-red-600 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
                    disabled={loading}
                  />
                  {formErrors.photo && <p className="text-red-400 text-sm mt-1">{formErrors.photo}</p>}
                  {user?.photo?.url && (
                    <div className="mt-4 flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: null, removePhoto: true })}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium"
                        disabled={loading}
                      >
                        <FaTrash /> Remove Photo
                      </motion.button>
                    </div>
                  )}
                </div>
                <div className="flex justify-between gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Management Modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-red-600/50"
            >
              <h2 className="text-3xl font-bold text-red-600 text-center mb-6">Manage Gallery</h2>
              <form onSubmit={handleGallerySubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-200 font-medium mb-2">Add New Images (up to 10)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleGalleryImageChange}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white file:bg-red-600 file:text-white file:border-none file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-red-700 transition"
                    disabled={loading}
                  />
                  {Object.keys(galleryFormErrors).map((key) => (
                    <p key={key} className="text-red-400 text-sm mt-1">{galleryFormErrors[key]}</p>
                  ))}
                </div>
                {galleryFormData.galleryImages.length > 0 && (
                  <div>
                    <h3 className="text-gray-200 font-medium mb-2">Image Previews</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {galleryFormData.galleryImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImagePreview(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {user?.galleryImages?.length > 0 && (
                  <div>
                    <h3 className="text-gray-200 font-medium mb-2">Existing Images</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {user.galleryImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={`Gallery image ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg ${
                              galleryFormData.removeImageIds.includes(image.publicId) ? 'opacity-50' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => toggleRemoveImageId(image.publicId)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className={`flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Gallery'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowGalleryModal(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}