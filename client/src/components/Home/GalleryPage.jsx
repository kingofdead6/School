import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../../api";

const GalleryPage = () => {
  const sliderRef = useRef(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const settings = {
    dots: false,
    infinite: galleryImages.length > 5,
    speed: 5000,
    slidesToShow: Math.min(5, Math.max(1, galleryImages.length)),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: false,
    arrows: false,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, Math.max(1, galleryImages.length)),
          slidesToScroll: 1,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "0px",
        },
      },
    ],
  };

  useEffect(() => {
    const fetchGalleryImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/gallery`);
        const images = Array.isArray(response.data) ? response.data : response.data.images || [];
        setGalleryImages(images);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load gallery images");
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-10 bg-white">
        Error: {error}
      </div>
    );
  }

  return (
    <div className=" py-12 px-4 overflow-x-hidden">
      <div className="max-w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-red-600 flex items-center justify-center gap-3">
            <svg
              className="w-9 h-9 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Our Gallery
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover moments captured from our school’s events, activities, and community.
          </p>
        </motion.div>

        {galleryImages.length === 0 ? (
          <div className="w-full text-center text-gray-600 py-10 bg-white">
            No images found in the gallery.
          </div>
        ) : (
          <section className="relative pt-2">
            <div className="relative max-w-full mx-auto z-10">
              <Slider ref={sliderRef} {...settings}>
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={image._id || index}
                    className="px-1"
                    initial={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  >
                    <div className="mx-auto max-w-full relative">
                      <div className="rounded-xl">
                        <img
                          src={image.image || "https://via.placeholder.com/300x200?text=No+Image"}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-60 sm:h-64 md:h-80 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                      </div>
                      {/* Overlap Effect */}
                      <div className="absolute -right-2 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/20 z-10" />
                    </div>
                  </motion.div>
                ))}
              </Slider>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;