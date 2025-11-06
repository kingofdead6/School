import { motion } from "framer-motion";
import LightParticles from "./LightParticles";

const timeline = [
  { year: "2015", title: "The Beginning", desc: "Started with 1 classroom and 12 passionate students." },
  { year: "2018", title: "Growth", desc: "Expanded to 3 branches in Algiers." },
  { year: "2020", title: "Resilience", desc: "Pivoted to online learning during global crisis." },
  { year: "2022", title: "Milestone", desc: "Celebrated 500+ successful graduates." },
  { year: "2024", title: "Innovation", desc: "Launched AI-powered personalized learning." },
  { year: "2025", title: "Recognition", desc: "Awarded 'Best Educational Institute' in Algeria." },
];

export default function OurStory() {
  return (
    <>
      <LightParticles />
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-5xl md:text-6xl font-extrabold text-center text-red-600 mb-16"
          >
            Our Story
          </motion.h1>

          <div className="relative">
            {/* Center Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-red-200 h-full rounded-full"></div>

            {timeline.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className={`relative flex items-center mb-20 ${
                  i % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow-lg z-10"></div>

                {/* Card */}
                <div
                  className={`w-full md:w-5/12 ${
                    i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                  } ml-16 md:ml-0`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl p-6 shadow-xl"
                  >
                    <h3 className="text-3xl font-bold text-red-600">{event.year}</h3>
                    <h4 className="text-xl font-semibold text-red-700 mt-1">{event.title}</h4>
                    <p className="text-gray-700 mt-2">{event.desc}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}