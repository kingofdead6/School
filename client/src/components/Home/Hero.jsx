import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative  overflow-visible">
      {/* Circular Background Area */}
      <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">
        <div
          className="absolute top-0 right-0 w-full h-full overflow-hidden"
         
        >
          {/* Background Video or Image */}
          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="https://res.cloudinary.com/dtwa3lxdk/video/upload/v1761472126/215475_eczqtg.mp4"
            autoPlay
            loop
            muted
          ></video>

          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Hero Text Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg -mt-10"
          >
            INSPIRING A PASSION FOR LEARNING
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-lg md:text-2xl text-white/90 mt-6 max-w-3xl"
          >
            Where curiosity meets creativity — empowering students for a lifetime of discovery.
          </motion.p>

         
        </div>
      </div>

      
    </section>
  );
};

export default Hero;
