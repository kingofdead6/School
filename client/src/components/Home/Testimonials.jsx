import React from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { FaStar, FaQuoteLeft, FaPen } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom"; // ✅ Correct import for navigation

// === Arrows ===
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

// === Testimonials Data ===
const testimonials = [
  {
    name: "Alice Johnson",
    title: "Amazing Quality!",
    text: "The prints are top-notch and exceeded my expectations. Will definitely order again!",
    stars: 5,
    image:
      "https://res.cloudinary.com/dtwa3lxdk/image/upload/v1759361064/20251002_0010_Enhanced_Design_Symbol_remix_01k6h0mgarfwpb5p8s654nwy76_ywrayk.png",
  },
  {
    name: "Michael Smith",
    title: "Fast Delivery",
    text: "I was surprised by how quickly my custom design was ready. Highly recommend!",
    stars: 4,
    image:
      "https://res.cloudinary.com/dtwa3lxdk/image/upload/v1759361064/20251002_0010_Enhanced_Design_Symbol_remix_01k6h0mgarfwpb5p8s654nwy76_ywrayk.png",
  },
  {
    name: "Sophie Williams",
    title: "Unmatched Creativity",
    text: "They turned my simple sketch into a stunning shirt design. Loved it!",
    stars: 5,
    image:
      "https://res.cloudinary.com/dtwa3lxdk/image/upload/v1759361064/20251002_0010_Enhanced_Design_Symbol_remix_01k6h0mgarfwpb5p8s654nwy76_ywrayk.png",
  },
  {
    name: "James Brown",
    title: "Great Support",
    text: "Customer service was super helpful and guided me through the whole process.",
    stars: 5,
    image:
      "https://res.cloudinary.com/dtwa3lxdk/image/upload/v1759361064/20251002_0010_Enhanced_Design_Symbol_remix_01k6h0mgarfwpb5p8s654nwy76_ywrayk.png",
  },
];

// === Main Component ===
const Testimonials = () => {
  const navigate = useNavigate(); // ✅ Hook to navigate programmatically

  const sliderSettings = {
    dots: false,
    infinite: testimonials.length > 3,
    speed: 600,
    slidesToShow: Math.min(3, testimonials.length),
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1100, settings: { slidesToShow: 2 } },
      { breakpoint: 700, settings: { slidesToShow: 1 } },
    ],
    adaptiveHeight: true,
  };

  return (
    <>
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto px-4 py-12 bg-white overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-red-600 flex items-center justify-center gap-3">
            <FaQuoteLeft size={36} />
            What Our Clients Say
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Hear from our amazing customers who trusted us with their ideas and designs.
          </p>
        </motion.div>
      </div>

      {/* Testimonials Slider */}
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
          <div className="relative">
            <Slider {...sliderSettings}>
              {testimonials.map((t, i) => (
                <div key={i} className="px-3">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-red-100"
                  >
                    <div className="flex flex-col items-center text-center p-8">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-28 h-28 rounded-full object-cover border-4 border-red-600 mb-4"
                      />
                      <div className="flex justify-center mb-3">
                        {Array.from({ length: t.stars }).map((_, j) => (
                          <FaStar key={j} className="text-red-500 mr-1 text-lg" />
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold text-red-700 mb-2">
                        {t.title}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {t.text}
                      </p>
                      <span className="text-red-600 font-medium">— {t.name}</span>
                    </div>
                  </motion.div>
                </div>
              ))}
            </Slider>
          </div>

          {/* Add Review Button */}
          <div className="flex justify-center mt-12 mb-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full shadow-md flex items-center gap-2 text-lg transition"
              onClick={() => navigate("/reviews")} // ✅ Fixed navigation
            >
              <FaPen />
              Add Your Own Review
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;
