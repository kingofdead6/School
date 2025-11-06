import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Users, Megaphone } from "lucide-react";
import { GiArchiveRegister } from "react-icons/gi";

import Programs from "./Programs";
import Teachers from "./Teachers";
import Announcements from "./Announcements";
import Registrations from "./Registrations";

const MainPage = () => {
  const [activeSection, setActiveSection] = useState("teachers");

  const boxes = [
    { id: "programs", label: "Programs", icon: <BookOpen size={32} /> },
    { id: "teachers", label: "Teachers", icon: <Users size={32} /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone size={32} /> },
    { id: "registerations", label: "Registrations", icon: <GiArchiveRegister size={32} /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "programs":
        return <Programs />;
      case "teachers":
        return <Teachers />;
      case "announcements":
        return <Announcements />;
      case "registerations":
        return <Registrations />;
      default:
        return <Teachers />;
    }
  };

  return (
    <div className="flex flex-col items-center py-8 px-4 sm:px-6 md:px-10 -mt-30">
      {/* Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 w-full max-w-6xl rounded-2xl overflow-hidden shadow-lg border border-red-200">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection(box.id)}
            className={`z-20 cursor-pointer select-none text-white font-semibold text-center py-8 sm:py-10 md:py-12 px-4 flex flex-col items-center justify-center border border-white/10 transition-all
              ${
                activeSection === box.id
                  ? "bg-red-800"
                  : "bg-red-600 hover:bg-red-700"
              }`}
          >
            <div className="mb-2 sm:mb-3">{box.icon}</div>
            <h3 className="text-sm sm:text-base md:text-lg uppercase tracking-wide">
              {box.label}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Content */}
      <div className="w-full max-w-5xl mt-8 sm:mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="px-2 sm:px-4"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainPage;
