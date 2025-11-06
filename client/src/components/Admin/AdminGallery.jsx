import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus, FaUpload, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../../../api";

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`);
      setImages(response.data);
    } catch (err) {
      console.error("Fetch gallery images error:", err);
      setError("Failed to load images");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedImages.length) {
      errors.images = "Please select at least one image";
    } else if (selectedImages.length > 10) {
      errors.images = "You can upload up to 10 images at a time";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const formData = new FormData();
    selectedImages.forEach((image) => formData.append("images", image));

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      };
      await axios.post(`${API_BASE_URL}/gallery`, formData, config);
      setSelectedImages([]);
      setShowModal(false);
      setFormErrors({});
      fetchImages();
      setError("");
    } catch (err) {
      console.error("Upload images error:", err);
      setError(err.response?.data?.message || "Failed to upload images");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages();
    } catch (err) {
      console.error("Delete image error:", err);
      setError(err.response?.data?.message || "Failed to delete image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
            className="text-3xl md:text-4xl font-extrabold text-red-600"
          >
            Gallery Management
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedImages([]);
              setFormErrors({});
              setShowModal(true);
            }}
            className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-300 transition"
          >
            <FaPlus /> Add Images
          </motion.button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 text-center mb-6 font-medium bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        {images.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, i) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                className="group relative bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:border-red-300 transition-all"
              >
                <img
                  src={img.image}
                  alt="Gallery"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow transition"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 mt-16 text-lg"
          >
            No images in the gallery yet.
          </motion.p>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-6 border border-red-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-2xl font-bold text-red-700">Add Images to Gallery</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="cursor-pointer text-gray-500 hover:text-red-600 transition"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-red-700 font-semibold mb-2">
                      Select Images (up to 10)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png"
                        onChange={(e) => setSelectedImages([...e.target.files])}
                        className={`w-full p-3 pl-11 rounded-xl bg-white border-2 text-gray-800 placeholder-gray-500 transition-all focus:outline-none focus:ring-4 focus:ring-red-100 ${
                          formErrors.images
                            ? "border-red-500 shake"
                            : "border-red-200 focus:border-red-500"
                        }`}
                        disabled={loading}
                      />
                      <FaUpload className="absolute left-3.5 top-3.5 text-red-500" size={20} />
                    </div>
                    <AnimatePresence>
                      {formErrors.images && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-600 text-sm mt-1 pl-1"
                        >
                          {formErrors.images}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    {selectedImages.length > 0 && (
                      <p className="text-gray-600 text-sm mt-2 pl-1">
                        {selectedImages.length} image(s) selected
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <motion.button
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                      type="submit"
                      disabled={loading}
                      className={`cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
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
                            className="cursor-pointer w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload /> Upload
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="cursor-pointer px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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