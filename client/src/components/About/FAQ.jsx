import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import LightParticles from "./LightParticles";

const faqs = [
  { q: "What grades do you offer?", a: "We cover grades 1 through 12, including preparatory and baccalaureate levels." },
  { q: "Are online classes available?", a: "Yes! We offer hybrid and fully online programs with live and recorded sessions." },
  { q: "How do parents stay involved?", a: "Through our parent portal: real-time grades, attendance, and direct teacher communication." },
  { q: "Do you offer financial aid?", a: "Yes, merit and need-based scholarships are available. Contact admissions for details." },
  { q: "What subjects are taught?", a: "Core subjects + optional languages: Spanish, German, and advanced STEM tracks." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <LightParticles />
      <div className="min-h-screen   py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-5xl md:text-6xl font-extrabold text-center text-red-600 mb-16"
          >
            FAQ
          </motion.h1>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-red-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <FaQuestionCircle className="text-red-600" />
                    <span className="font-semibold text-red-700">{faq.q}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-red-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-gray-700">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}