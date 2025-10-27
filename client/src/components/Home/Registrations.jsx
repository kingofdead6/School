import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Registrations = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center overflow-hidden">

      {/* Content */}
      <div className="relative z-10 text-center text-gray-600 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-red-500 drop-shadow-lg"
        >
          Registration Portal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-lg text-gray-600 mt-4 max-w-xl mx-auto"
        >
          Enroll your child today and join a community of excellence, learning,
          and innovation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8"
        >
          <button
            onClick={() => navigate("/registration")}
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-10 rounded-lg text-lg shadow-lg transition-all duration-300"
          >
            Register Now
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Registrations;
