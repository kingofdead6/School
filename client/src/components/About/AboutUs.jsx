import { motion } from "framer-motion";
import { FaGraduationCap, FaUsers, FaChalkboardTeacher, FaLightbulb } from "react-icons/fa";
import LightParticles from "./LightParticles";

export default function AboutUs() {
  return (
    <>
      <LightParticles />
      <div className="min-h-screen  py-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h1
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
              className="text-5xl md:text-7xl font-extrabold text-red-600 flex items-center justify-center gap-3"
            >
              <FaGraduationCap className="w-16 h-16 animate-pulse" />
              About Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed"
            >
              We are more than a school — we are a <span className="text-red-600 font-bold">movement</span> dedicated to shaping tomorrow’s leaders.
            </motion.p>
          </motion.div>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <FaGraduationCap />, title: "Excellence", desc: "World-class curriculum & results" },
              { icon: <FaUsers />, title: "Family", desc: "Parents, students, teachers united" },
              { icon: <FaChalkboardTeacher />, title: "Innovation", desc: "Modern tools & teaching methods" },
              { icon: <FaLightbulb />, title: "Future-Ready", desc: "Skills for life, not just exams" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition"
              >
                <div className="text-red-600 text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-red-700 mb-2">{item.title}</h3>
                <p className="text-gray-700 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Final Statement */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl p-10 shadow-xl text-center"
          >
            <p className="text-lg text-gray-800 leading-relaxed max-w-4xl mx-auto">
              Since our founding, <span className="text-red-600 font-bold">EduCenter</span> has empowered over <strong>5,000 students</strong> to dream bigger, work harder, and achieve more than they ever thought possible.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}