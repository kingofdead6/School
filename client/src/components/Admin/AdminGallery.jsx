import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaPlus } from "react-icons/fa";
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
      console.error('Fetch gallery images error:', err);
      setError("⚠️ خطأ في جلب الصور");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedImages.length) {
      errors.images = "يجب اختيار صورة واحدة على الأقل";
    } else if (selectedImages.length > 10) {
      errors.images = "لا يمكن رفع أكثر من 10 صور في المرة الواحدة";
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
    } catch (err) {
      console.error('Upload images error:', err);
      setError(err.response?.data?.message || "⚠️ خطأ في رفع الصور");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages();
    } catch (err) {
      console.error('Delete image error:', err);
      setError(err.response?.data?.message || "⚠️ خطأ في حذف الصورة");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">إدارة المعرض</h1>
          <button
            onClick={() => {
              setSelectedImages([]);
              setShowModal(true);
            }}
            className="cursor-pointer flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaPlus /> إضافة صور
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}

        {/* Gallery */}
        {images.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, i) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="shadow-red-500 bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
              >
                <img
                  src={img.image}
                  alt="Gallery"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex justify-center">
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg shadow transition"
                  >
                    <FaTrash /> حذف
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-200 mt-10">لا توجد صور في المعرض</p>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md"
              >
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                  إضافة صور إلى المعرض
                </h2>
                <form onSubmit={handleSubmit} dir="rtl" className="space-y-4">
                  <div>
                    <label className="block text-gray-200 mb-2">
                      اختر الصور (حتى 10 صور)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png"
                      onChange={(e) => setSelectedImages([...e.target.files])}
                      className={`w-full p-3 rounded-lg bg-gray-800 border ${
                        formErrors.images ? "border-red-500" : "border-gray-600"
                      } text-white`}
                    />
                    {formErrors.images && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.images}</p>
                    )}
                    {selectedImages.length > 0 && (
                      <p className="text-gray-200 text-sm mt-2">
                        {selectedImages.length} صورة/صور تم اختيارها
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`cursor-pointer bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "جارٍ الرفع..." : "رفع الصور"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={loading}
                      className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}