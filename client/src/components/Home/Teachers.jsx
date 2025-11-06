import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaChalkboardTeacher, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { API_BASE_URL } from "../../../api";

const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg z-20 transition-transform hover:scale-105"
  >
    <FaArrowLeft />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg z-20 transition-transform hover:scale-105"
  >
    <FaArrowRight />
  </button>
);

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const allSubjects = [
    "Math", "Physics", "Science", "Arabic", "English",
    "French", "Islamic", "History", "Geography", "Philosophy"
  ];

  // ✅ Filter logic
  const filteredTeachers = teachers.filter((teacher) => {
    let matchesSearch = true;
    let matchesGrade = true;
    let matchesSubject = true;

    if (searchQuery) {
      matchesSearch = (teacher.fullName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }

    if (selectedGrade) {
      const teacherGradeIds = (teacher.groups || [])
        .map((g) =>
          g.grade && g.grade._id
            ? g.grade._id.toString()
            : typeof g.grade === "string"
            ? g.grade
            : null
        )
        .filter(Boolean);
      matchesGrade = teacherGradeIds.includes(selectedGrade);
    }

    if (selectedSubject) {
      matchesSubject = (teacher.subjectsTaught || []).includes(selectedSubject);
    }

    return matchesSearch && matchesGrade && matchesSubject;
  });
  // ✅ Handle screen resizing for mobile responsiveness
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ✅ Fetch grades and teachers
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [gradesRes, teachersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/grades`),
          axios.get(`${API_BASE_URL}/teachers`),
        ]);

        const gradesData = gradesRes.data || [];
        const teachersData = teachersRes.data || [];

        // fetch groups for each teacher
        const groupsPromises = teachersData.map((t) =>
          axios
            .get(`${API_BASE_URL}/teachers/${t._id}/groups`)
            .then((r) => r.data)
            .catch(() => [])
        );
        const groupsResults = await Promise.all(groupsPromises);

        const teachersWithGroups = teachersData.map((t, idx) => ({
          ...t,
          groups: groupsResults[idx] || [],
        }));

        const gradeMap = new Map();
        teachersWithGroups.forEach((t) => {
          (t.groups || []).forEach((g) => {
            const grade = g.grade;
            if (!grade) return;
            if (typeof grade === "object" && grade._id) {
              gradeMap.set(grade._id.toString(), grade);
            } else {
              const found = gradesData.find(
                (gr) => gr._id.toString() === grade.toString()
              );
              if (found) gradeMap.set(found._id.toString(), found);
            }
          });
        });

        setTeachers(teachersWithGroups);
        setGrades(gradeMap.size ? Array.from(gradeMap.values()) : gradesData);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data");
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ✅ Fetch subjects by grade
  useEffect(() => {
    const fetchSubjectsForGrade = async () => {
      if (selectedGrade) {
        try {
          const groupsResponse = await axios.get(`${API_BASE_URL}/groups/grade/${selectedGrade}`);
          const subjects = [
            ...new Set(groupsResponse.data?.map((group) => group.subject).filter(Boolean)),
          ];
          setAvailableSubjects(subjects.length ? subjects : allSubjects);
        } catch {
          setAvailableSubjects(allSubjects);
        }
      } else {
        setAvailableSubjects([]);
        setSelectedSubject("");
      }
    };
    fetchSubjectsForGrade();
  }, [selectedGrade]);

  const resolveGradeName = (gradeField) => {
    if (!gradeField) return null;
    if (typeof gradeField === "object" && gradeField.name) return gradeField.name;
    const found = grades.find((g) => g._id?.toString() === gradeField.toString());
    return found ? found.name : null;
  };

  const getGradesTaught = (teacher) => {
    const gradeNames = new Set();
    (teacher.groups || []).forEach((group) => {
      const gName = resolveGradeName(group.grade);
      if (gName) gradeNames.add(gName);
    });
    return gradeNames.size ? Array.from(gradeNames).join(", ") : "None";
  };


  // ✅ Slider Settings (desktop + mobile)
  const desktopSettings = {
    dots: false,
    infinite: filteredTeachers.length > 4,
    speed: 600,
    slidesToShow: Math.min(4, Math.max(1, filteredTeachers.length)),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1100, settings: { slidesToShow: 3 } },
      { breakpoint: 700, settings: { slidesToShow: 2 } },
      { breakpoint: 500, settings: { slidesToShow: 1 } },
    ],
    adaptiveHeight: true,
  };

  const mobileSettings = {
    dots: true,
    infinite: filteredTeachers.length > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    pauseOnHover: false,
    adaptiveHeight: true,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-10">Error: {error}</div>
    );
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
            <FaChalkboardTeacher size={36} className="hidden md:inline-block"/>
            Our Esteemed Teachers
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover our dedicated educators who inspire and guide students toward academic excellence.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-red-50 rounded-xl shadow-sm p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-red-700 font-medium mb-2">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSubject("");
              }}
              className="w-full p-3 rounded-lg border border-red-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-red-700 font-medium mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 rounded-lg border border-red-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={!selectedGrade}
            >
              <option value="">All Subjects</option>
              {(availableSubjects.length ? availableSubjects : allSubjects).map(
                (subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-red-700 font-medium mb-2">Search by Name</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers..."
                className="w-full p-3 pl-10 rounded-lg border border-red-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FaSearch className="absolute left-3 top-3.5 text-red-400" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Carousel Section */}
      <div className="w-full md:w-7xl ml-0 md:-ml-35 px-2 md:px-10 overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="w-full text-center text-gray-600 py-10 bg-white">
            No teachers found matching your criteria.
          </div>
        ) : (
          <Slider
            key={isMobile ? "mobile" : "desktop"}
            ref={sliderRef}
            {...(isMobile ? mobileSettings : desktopSettings)}
            className="!m-0 !p-0"
          >
            {filteredTeachers.map((teacher) => (
              <div key={teacher._id} className="px-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={teacher.photo?.url || "https://via.placeholder.com/300x200"}
                      alt={teacher.fullName}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                      {teacher.degree || "Educator"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {teacher.fullName}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {teacher.subjectsTaught?.join(", ") || "Multiple Subjects"}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      <span className="text-red-600 font-medium">Grades:</span>{" "}
                      {getGradesTaught(teacher)}
                    </p>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {teacher.bio ||
                        "Dedicated to fostering a love for learning and academic excellence."}
                    </p>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      onClick={() =>
                        navigate(`/teacher/${teacher._id}`, { state: { teacher } })
                      }
                      className="cursor-pointer w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </>
  );
};

export default Teachers;
