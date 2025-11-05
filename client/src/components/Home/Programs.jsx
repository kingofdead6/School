import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaBook, FaTimes } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { API_BASE_URL } from "../../../api";

const NextArrow = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="cursor-pointer absolute -right-3 top-1/2 z-20 -translate-y-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700"
    aria-label="Next"
  >
    →
  </motion.button>
);

const PrevArrow = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="cursor-pointer absolute -left-3 top-1/2 z-20 -translate-y-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700"
    aria-label="Previous"
  >
    ←
  </motion.button>
);

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // 👈 for fullscreen image
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [programsRes, gradesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/programs`),
          axios.get(`${API_BASE_URL}/grades`),
        ]);

        const programsData = Array.isArray(programsRes.data)
          ? programsRes.data
          : programsRes.data.programs || [];
        const gradesData = Array.isArray(gradesRes.data)
          ? gradesRes.data
          : gradesRes.data.grades || [];

        setPrograms(programsData);
        setGrades(gradesData);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const filteredPrograms = programs.filter((program) => {
    let matchesSearch = true;
    let matchesGrade = true;

    if (searchQuery) {
      const queryLower = searchQuery.trim().toLowerCase();
      matchesSearch =
        (program.name || "").toLowerCase().includes(queryLower) ||
        (program.yearLevel?.name || "").toLowerCase().includes(queryLower);
    }

    if (selectedGrade) {
      matchesGrade =
        program.yearLevel?._id?.toString() === selectedGrade;
    }

    return matchesSearch && matchesGrade;
  });

  const sliderSettings = {
    dots: false,
    infinite: filteredPrograms.length > 4,
    speed: 600,
    slidesToShow: Math.min(4, Math.max(1, filteredPrograms.length)),
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1100, settings: { slidesToShow: Math.min(2, filteredPrograms.length) } },
      { breakpoint: 700, settings: { slidesToShow: 1 } },
    ],
    adaptiveHeight: true,
    centerMode: false,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-10">Error: {error}</div>;
  }

  return (
    <>
      {/* Header + Filters */}
      <div className="w-full max-w-7xl mx-auto px-4 py-12 bg-white overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-red-600 flex items-center justify-center gap-3">
            <FaBook size={36} />
            Our Academic Programs
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Explore our diverse range of academic programs designed to foster learning and growth.
          </p>
        </motion.div>

        <div className="bg-red-50 rounded-xl shadow-sm p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-red-700 font-medium mb-2">Year Level</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-3 rounded-lg border border-red-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Year Levels</option>
              {grades.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-red-700 font-medium mb-2">Search by Name</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs..."
                className="w-full p-3 pl-10 rounded-lg border border-red-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FaSearch className="absolute left-3 top-3.5 text-red-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Programs Slider */}
      <div
        style={{
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          width: "100vw",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          boxSizing: "border-box",
          background: "transparent",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          {filteredPrograms.length === 0 ? (
            <div className="w-full text-center text-gray-600 py-10 bg-white">
              No programs found matching your criteria.
            </div>
          ) : (
            <div className="relative">
              <Slider ref={sliderRef} {...sliderSettings}>
                {filteredPrograms.map((program) => (
                  <div key={program._id} className="px-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(program.image || "https://via.placeholder.com/300x200?text=No+Image")}
                    >
                      <div className="relative">
                        <img
                          src={program.image || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={program.name}
                          className="w-full h-80 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                          {program.yearLevel?.name || "N/A"}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-5xl w-full p-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="cursor-pointer absolute top-4 right-4 text-white text-3xl hover:text-red-500 transition"
              >
                <FaTimes />
              </button>
              <img
                src={selectedImage}
                alt="Program Full"
                className="w-full max-h-[90vh] object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Programs;
