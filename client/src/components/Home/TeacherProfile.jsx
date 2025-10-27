// TeacherProfile.jsx
import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// NOTE: install if you haven't:
// npm install react-slick slick-carousel

const NextArrow = ({ onClick }) => (
  <motion.button
    className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white p-3 px-4 rounded-full shadow-lg hover:bg-red-600 z-20"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label="Next"
  >
    →
  </motion.button>
);

const PrevArrow = ({ onClick }) => (
  <motion.button
    className="cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white p-3 px-4 rounded-full shadow-lg hover:bg-red-600 z-20"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label="Previous"
  >
    ←
  </motion.button>
);

const TeacherProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const teacher = state?.teacher;
  const sliderRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!teacher) {
    return (
      <div className="w-full min-h-screen bg-white text-center pt-20">
        <p className="text-red-600 text-lg">Teacher data not found.</p>
        <button
          onClick={() => navigate('/teachers')}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Teachers
        </button>
      </div>
    );
  }

  const resolveGradeName = (gradeField) => {
    if (!gradeField) return 'N/A';
    if (typeof gradeField === 'object' && gradeField.name) return gradeField.name;
    return gradeField.toString();
  };

  // normalize gallery: support array of strings or array of { url, caption }
  const rawGallery = Array.isArray(teacher.galleryImages) ? teacher.galleryImages : [];
  const gallery = rawGallery.map(item => {
    if (!item) return null;
    if (typeof item === 'string') return { url: item, caption: '' };
    if (typeof item === 'object' && (item.url || item.uri)) return { url: item.url || item.uri, caption: item.caption || '' };
    return null;
  }).filter(Boolean);

  const gallerySettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots custom-dots",
    adaptiveHeight: true,
    pauseOnHover: true,
    centerMode: false,
  };

  const openImageModal = (img) => setSelectedImage(img);
  const closeImageModal = () => setSelectedImage(null);

  return (
    <div className="w-full min-h-screen bg-white">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
        {/* Hero Header (curved + overlay + avatar) */}
        <div className="relative">
          <div className="w-full h-[420px] md:h-[480px] overflow-hidden relative">
            <img
              src={teacher.photo?.url || 'https://via.placeholder.com/1400x480'}
              alt={teacher.fullName}
              className="w-full h-full object-cover transform scale-105"
            />

            {/* decorative curved white bottom */}
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 1440 120"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path d="M0,40 C200,120 400,0 720,40 C1040,80 1240,20 1440,60 L1440 120 L0 120 Z" fill="white" />
            </svg>

            {/* red gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-black/30 pointer-events-none" />

            {/* Back button */}
            <div className="absolute top-6 left-6 z-30">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                <FaArrowLeft className="mr-2" /> Back
              </button>
            </div>

            {/* Teacher avatar and name card */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-40">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl border border-white/60">
                <img
                  src={teacher.photo?.url || 'https://via.placeholder.com/120'}
                  alt={teacher.fullName}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-red-600"
                />
                <div className="text-left">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">{teacher.fullName}</h1>
                  <p className="text-sm text-red-600 font-medium">{teacher.degree || 'Educator'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-12 -mt-6">
          <div className="bg-red-50 rounded-xl shadow-sm p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium text-red-600">Email:</span>{' '}
                  {teacher.email || 'Not provided'}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium text-red-600">Subjects:</span>{' '}
                  {teacher.subjectsTaught?.join(', ') || 'Multiple Subjects'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-red-600">Grades:</span>{' '}
                  {teacher.groups?.map(g => resolveGradeName(g.grade)).filter(Boolean).join(', ') || 'None'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-medium text-red-600">Bio:</span>{' '}
                  {teacher.bio || 'Dedicated to fostering a love for learning and academic excellence.'}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Groups */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Assigned Groups</h2>
            {teacher.groups?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacher.groups.map(group => (
                  <div
                    key={group._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-red-100"
                  >
                    <p className="text-gray-800 font-medium">{group.name}</p>
                    <p className="text-gray-600 text-sm">Subject: {group.subject || 'N/A'}</p>
                    <p className="text-gray-600 text-sm">Grade: {resolveGradeName(group.grade)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No groups assigned.</p>
            )}
          </div>

          {/* Gallery using react-slick (slick carousel) */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-red-600 mb-6">Gallery</h2>

            {gallery.length > 0 ? (
              <>
                <style>{`
                  .custom-dots li button:before { color: #000; opacity: 0.5; font-size: 12px; }
                  .custom-dots li.slick-active button:before { color: #ef4444; opacity: 1; }
                  .gallery-image { max-height: 70vh; width: 100%; object-fit: cover; border-radius: 24px; box-shadow: 0 6px 28px rgba(0,0,0,0.12); }
                  .gallery-modal { max-height: 90vh; max-width: 90vw; object-fit: contain; border-radius: 12px; border: 2px solid #ef4444; }
                `}</style>

                <div className="relative">
                  <Slider ref={sliderRef} {...gallerySettings}>
                    {gallery.map((img, idx) => (
                      <div key={idx} className="px-2">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.25 }}
                          className="cursor-pointer"
                          onClick={() => openImageModal(img.url)}
                        >
                          <img
                            src={img.url}
                            alt={img.caption || `Gallery ${idx + 1}`}
                            className="rounded-2xl gallery-image"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x800?text=Image+Not+Found'; }}
                          />
                        </motion.div>
                      </div>
                    ))}
                  </Slider>

                  {/* Thumbnails grid (desktop) */}
                  <div className="hidden md:grid grid-cols-6 gap-3 mt-4">
                    {gallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (sliderRef.current) sliderRef.current.slickGoTo(i);
                          // also open modal optionally:
                          // setSelectedImage(img.url);
                        }}
                        className="overflow-hidden rounded-md border border-gray-200"
                        aria-label={`Go to image ${i + 1}`}
                      >
                        <img
                          src={img.url}
                          alt={`thumb-${i}`}
                          className="w-full h-20 object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                        />
                      </button>
                    ))}
                  </div>

                  {/* mobile thumbnails as horizontal scroll */}
                  <div className="md:hidden flex gap-2 overflow-x-auto mt-4 pb-2">
                    {gallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => sliderRef.current && sliderRef.current.slickGoTo(i)}
                        className="min-w-[120px] overflow-hidden rounded-md border border-gray-200"
                        aria-label={`Go to image ${i + 1}`}
                      >
                        <img
                          src={img.url}
                          alt={`thumb-${i}`}
                          className="w-full h-24 object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-600">No gallery images available.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeImageModal}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Full-size"
              className="gallery-modal"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x800?text=Image+Not+Found'; }}
            />
            <motion.button
              onClick={closeImageModal}
              className="cursor-pointer absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg text-red-600"
              whileHover={{ scale: 1.05 }}
            >
              <FaTimes className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TeacherProfile;
