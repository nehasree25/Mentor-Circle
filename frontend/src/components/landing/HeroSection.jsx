import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, BookOpen, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative bg-white overflow-hidden pt-[68px]">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.4,
        }}
      />
      {/* Radial gradient fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(219,234,254,0.55),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-14 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-[#1a56db] text-[12.5px] font-semibold mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] animate-pulse" />
            Mentor-led learning circles for ambitious professionals
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-[2.6rem] sm:text-5xl md:text-[3.75rem] lg:text-[4.25rem] font-extrabold text-[#0F172A] leading-[1.08] tracking-[-0.03em] mb-6"
          >
            The smarter way to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a56db] to-[#7C3AED]">
              learn and grow
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-[1.05rem] md:text-lg text-[#475569] leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            Join mentor-led learning circles. Get structured guidance from industry
            professionals, collaborate with motivated peers, and accelerate your career —
            all on one focused platform.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10"
          >
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1a56db] hover:bg-[#1648c4] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(26,86,219,0.35)] hover:shadow-[0_6px_20px_rgba(26,86,219,0.45)] text-[15px]"
            >
              Explore MentorCircle
              <ArrowRight size={16} />
            </Link>
            <Link
              to={isAuthenticated ? "/circles" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] font-semibold rounded-xl transition-all duration-200 text-[15px] shadow-sm"
            >
              Browse circles
            </Link>
          </motion.div>

          {/* Simple trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-[13px] text-[#94A3B8]"
          >
            Free to join · No credit card required
          </motion.p>
        </div>

        {/* Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
          className="relative mt-16 max-w-5xl mx-auto"
        >
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#BFDBFE] to-transparent opacity-60" />
          <div className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_24px_64px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FDA4AF]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white border border-[#E2E8F0] rounded-md text-[11px] text-[#94A3B8] w-64 text-center">
                  app.mentorcircle.io/dashboard
                </div>
              </div>
            </div>

            {/* App UI Mock — feature tiles only, no fake numbers */}
            <div className="p-6 bg-[#F8FAFC] min-h-[300px] md:min-h-[340px]">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Learning Circles", sublabel: "Join or create a circle", icon: Users, color: "text-[#1a56db]", bg: "bg-[#EFF6FF]" },
                  { label: "Shared Resources", sublabel: "Docs, links & materials", icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50" },
                  { label: "Track Progress", sublabel: "Milestones & goals", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm">
                    <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center mb-3`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div className="text-[13.5px] font-semibold text-[#0F172A] mb-0.5">{item.label}</div>
                    <div className="text-[11.5px] text-[#94A3B8]">{item.sublabel}</div>
                  </div>
                ))}
              </div>

              {/* Static circle list — no member counts */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F1F5F9]">
                  <span className="text-[13px] font-semibold text-[#0F172A]">Available Circles</span>
                </div>
                {[
                  { name: "Machine Learning Circle", tag: "AI / ML", active: true },
                  { name: "Web Development Circle", tag: "Full-Stack", active: true },
                  { name: "Data Science Circle", tag: "Analytics", active: false },
                ].map((circle, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < 2 ? "border-b border-[#F8FAFC]" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1a56db] to-[#7C3AED] opacity-90" />
                      <div>
                        <div className="text-[13px] font-medium text-[#0F172A]">{circle.name}</div>
                        <div className="text-[11px] text-[#94A3B8]">{circle.tag}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${circle.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                      {circle.active ? "Active" : "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
