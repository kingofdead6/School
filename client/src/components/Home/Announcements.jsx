// Announcements.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../../../api"; // adjust path if needed

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null); // modal
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/announcements`);
        if (!cancelled) {
          // Expecting an array; sort newest first
          const data = Array.isArray(res.data) ? res.data : [];
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAnnouncements(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch announcements:", err);
          setError(err.response?.data?.message || "Failed to load announcements");
          setLoading(false);
        }
      }
    };

    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filtered = announcements.filter((a) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      (a.title || "").toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q) ||
      (a.creator?.fullName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen text-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header & Search */}
        <div className="text-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-600">
              Announcements
            </h1>
            <p className="text-gray-600 mt-2">
              Stay up-to-date with the latest news from the school.
            </p>
          </div>

      
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12 rounded-lg border border-gray-100">
                No announcements found.
              </div>
            ) : (
              filtered.map((a) => (
                <motion.article
                  key={a._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
                >
                  {a.image ? (
                    <div className="w-full h-44 sm:h-52 overflow-hidden">
                      <img
                        src={a.image}
                        alt={a.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/800x400?text=Image+not+available";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-44 sm:h-52 bg-red-50 flex items-center justify-center text-red-400">
                      <span className="text-lg font-medium">No Image</span>
                    </div>
                  )}

                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {a.title}
                    </h3>

                
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        <div className="mt-1">{formatDate(a.createdAt)}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActiveAnnouncement(a)}
                          className="cursor-pointer px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                        >
                          Read more
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal for full announcement */}
      <AnimatePresence>
        {activeAnnouncement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveAnnouncement(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden"
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {activeAnnouncement.image ? (
                  <img
                    src={activeAnnouncement.image}
                    alt={activeAnnouncement.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/1200x600?text=Image+not+available";
                    }}
                  />
                ) : (
                  <div className="w-full h-44 bg-red-50 flex items-center justify-center text-red-400">
                    <span className="text-lg font-medium">No Image</span>
                  </div>
                )}

                <button
                  onClick={() => setActiveAnnouncement(null)}
                  className="cursor-pointer absolute top-4 right-4 bg-white/80 text-gray-700 p-2 rounded-full shadow hover:bg-white transition"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {activeAnnouncement.title}
                </h2>

                <div className="text-sm text-gray-500 mb-4">
                  <span className="mx-2">•</span>
                  <span>{formatDate(activeAnnouncement.createdAt)}</span>
                </div>

                <div className="text-gray-700 whitespace-pre-line">
                  {activeAnnouncement.description}
                </div>


                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveAnnouncement(null)}
                    className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Announcements;
