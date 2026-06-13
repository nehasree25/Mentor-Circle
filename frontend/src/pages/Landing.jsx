import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Users,
  CheckCircle2,
  MessageSquare,
  Shield,
  Zap,
  Globe,
  Brain,
  BookOpen,
  Search,
  UserCheck,
  Lightbulb,
  Star,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import HeroSection from "../components/landing/HeroSection";
import LandingNavbar from "../components/landing/LandingNavbar";
import Footer from "../components/landing/Footer";

/* ─── Reusable section badge ─── */
const SectionBadge = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-[#1a56db] text-[12px] font-semibold mb-5">
    {children}
  </div>
);

/* ─── Why MentorCircle ─── */
const whyItems = [
  {
    icon: Brain,
    title: "Expert-Led Learning",
    description: "Learn directly from professionals who've been where you want to go. Every circle is guided by vetted, experienced mentors.",
    color: "text-[#1a56db]",
    bg: "bg-[#EFF6FF]",
  },
  {
    icon: Users,
    title: "Cohort-Based Growth",
    description: "Progress alongside motivated peers. Accountability, shared goals, and collaborative energy drive measurably better outcomes.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Zap,
    title: "Structured Curriculum",
    description: "No scattered playlists. Each circle follows a focused roadmap — discussions, resources, and milestones that build momentum.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Globe,
    title: "Real Connections",
    description: "Build a professional network that actually matters. Mentors and peers who support your long-term career journey.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "Verified Mentors",
    description: "Every mentor is reviewed for professional credibility. You get guidance from people with real industry experience.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: MessageSquare,
    title: "Discussions & Resources",
    description: "Combine structured discussions with async resource sharing. Everything your circle needs, in one place.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
];

/* ─── How Circles Work — 3 illustrative cards ─── */
const circleCards = [
  {
    icon: Search,
    color: "text-[#1a56db]",
    bg: "bg-[#EFF6FF]",
    grad: "from-[#1a56db] to-[#7C3AED]",
    title: "Discover & Join a Circle",
    description:
      "Browse circles organised by domain and skill level — Machine Learning, Web Development, Data Science, and more. Public circles let you join instantly; private ones require a quick mentor approval.",
    points: ["Filter by domain or skill level", "Public or invite-only circles", "Join with one click"],
  },
  {
    icon: BookOpen,
    color: "text-violet-600",
    bg: "bg-violet-50",
    grad: "from-violet-500 to-indigo-600",
    title: "Learn, Discuss & Share",
    description:
      "Inside your circle you get access to a structured discussion board, shared resources (PDFs, links, notes), and a community of peers all working toward the same goals.",
    points: ["Structured discussion threads", "Upload & share resources", "Peer-to-peer collaboration"],
  },
  {
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    grad: "from-emerald-500 to-teal-600",
    title: "Grow With Your Circle",
    description:
      "Track milestones, build your portfolio, and grow your professional network. The circle model keeps you accountable and makes progress visible — so you actually finish what you start.",
    points: ["Milestone & progress tracking", "Build a real portfolio", "Expand your professional network"],
  },
];

/* ─── How Mentorship Works — 3 illustrative cards ─── */
const mentorCards = [
  {
    icon: UserCheck,
    color: "text-[#1a56db]",
    bg: "bg-[#EFF6FF]",
    title: "Find Your Mentor",
    description:
      "Browse verified professionals across every domain. Filter by expertise, industry, or availability. Every mentor on MentorCircle is reviewed so you know you're getting real guidance.",
    points: ["Verified professional profiles", "Filter by domain & expertise", "See mentor backgrounds"],
  },
  {
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Get Personalised Guidance",
    description:
      "Your mentor leads your circle, answers questions, shares resources, and gives direct feedback on your work. It's structured mentorship — not just a one-off chat.",
    points: ["Direct feedback on your work", "Structured circle sessions", "Q&A and async discussions"],
  },
  {
    icon: Clock,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Mentor on Your Schedule",
    description:
      "Mentors lead circles around their own schedule. Whether you have two hours a week or ten, you choose your commitment. The platform handles everything else.",
    points: ["Flexible time commitment", "Lead at your own pace", "Async-friendly platform"],
  },
];

/* ─── How It Works steps ─── */
const steps = [
  { num: "01", title: "Discover", description: "Browse circles curated around your goals. Filter by domain, skill level, or schedule." },
  { num: "02", title: "Join or Apply", description: "Request to join a circle or create your own. Public circles are open; private ones require mentor approval." },
  { num: "03", title: "Learn Together", description: "Participate in structured discussions, resource sharing, and peer collaboration." },
  { num: "04", title: "Grow & Advance", description: "Track your progress, expand your network, and build a portfolio that proves your expertise." },
];


const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <main className="bg-white min-h-screen overflow-hidden">
      <LandingNavbar />
      <HeroSection />

      {/* ─── Why MentorCircle ─── */}
      <section id="why" className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionBadge>Why MentorCircle</SectionBadge>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
              Everything you need to grow faster
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="text-[#64748B] max-w-xl mx-auto text-[15px]">
              We combine the best of cohort learning, expert mentorship, and real community — in one focused platform.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="p-6 bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#BFDBFE] hover:shadow-[0_8px_24px_rgba(26,86,219,0.08)] transition-all duration-200"
              >
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <h3 className="text-[15px] font-semibold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-[13.5px] text-[#64748B] leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Circles ─── */}
      <section id="circles" className="py-14 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionBadge>Our Circles</SectionBadge>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
              How circles work
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="text-[#64748B] max-w-xl mx-auto text-[15px]">
              A circle is a small, focused learning group led by an experienced mentor. Here's how it comes together.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {circleCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-200"
              >
                {/* Color top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${card.grad}`} />
                <div className="p-6">
                  {/* Step number + icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-bold text-[#94A3B8] tracking-widest uppercase">
                      Step {i + 1}
                    </span>
                    <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                      <card.icon size={20} className={card.color} />
                    </div>
                  </div>

                  <h3 className="text-[16px] font-bold text-[#0F172A] mb-3">{card.title}</h3>
                  <p className="text-[13.5px] text-[#64748B] leading-relaxed mb-5">{card.description}</p>

                  {/* Bullet points */}
                  <ul className="flex flex-col gap-2">
                    {card.points.map((pt, j) => (
                      <li key={j} className="flex items-center gap-2.5">
                        <CheckCircle2 size={14} className={card.color} />
                        <span className="text-[13px] text-[#475569]">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              to={isAuthenticated ? "/circles" : "/login"}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1a56db] hover:bg-[#1648c4] text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(26,86,219,0.3)]"
            >
              Explore circles
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how" className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionBadge>How It Works</SectionBadge>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
              From sign-up to career growth<br />in four steps
            </motion.h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[28px] left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px bg-gradient-to-r from-transparent via-[#BFDBFE] to-transparent" />
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-14 h-14 bg-white border-2 border-[#BFDBFE] rounded-full flex items-center justify-center mx-auto mb-5 relative z-10">
                    <span className="text-[13px] font-extrabold text-[#1a56db]">{step.num}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#0F172A] mb-2">{step.title}</h3>
                  <p className="text-[13.5px] text-[#64748B] leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── For Mentors ─── */}
      <section id="mentors" className="py-14 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionBadge>For Mentors</SectionBadge>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
              How mentorship works
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="text-[#64748B] max-w-xl mx-auto text-[15px]">
              Whether you're seeking a mentor or ready to become one — here's how the mentorship experience works on MentorCircle.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mentorCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <card.icon size={20} className={card.color} />
                </div>
                <h3 className="text-[16px] font-bold text-[#0F172A] mb-3">{card.title}</h3>
                <p className="text-[13.5px] text-[#64748B] leading-relaxed mb-5">{card.description}</p>
                <ul className="flex flex-col gap-2">
                  {card.points.map((pt, j) => (
                    <li key={j} className="flex items-center gap-2.5">
                      <CheckCircle2 size={14} className={card.color} />
                      <span className="text-[13px] text-[#475569]">{pt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link
              to={isAuthenticated ? "/mentors" : "/login"}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0F172A] hover:bg-[#1e293b] text-white text-[14px] font-semibold rounded-xl transition-all duration-200 shadow-sm"
            >
              Explore mentors
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Landing;
