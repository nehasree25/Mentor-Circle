import { motion } from "framer-motion";
import { BrainCircuit, Compass, Users, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { title: "AI Peer Matching", icon: BrainCircuit, text: "Match with learners sharing similar STEM interests and goals." },
  { title: "Learning Circles", icon: Users, text: "Build momentum through focused peer learning communities." },
  { title: "Mentor Discovery", icon: Compass, text: "Discover mentors by domain expertise and guidance style." },
  { title: "STEM Roadmaps", icon: GraduationCap, text: "Plan your growth with structured learning pathways." },
  { title: "AI Recommendations", icon: Sparkles, text: "Get personalized recommendations from your activity and interests." },
];

const Landing = () => {
  return (
    <main className="min-h-screen bg-appbg text-navy">
      <header className="sticky top-0 z-20 border-b border-borderline bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-darkblue">MentorCircle</span>
          <div className="hidden gap-8 text-sm text-textsecondary md:flex">
            <Link to="/">Home</Link>
            <Link to="/circles">Circles</Link>
            <Link to="/mentors">Mentors</Link>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="rounded-xl border border-borderline px-4 py-2 text-sm font-medium">Login</Link>
            <Link to="/signup" className="rounded-xl bg-royal px-4 py-2 text-sm font-semibold text-white">Get Started</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">Where Students, Mentors and Opportunities Connect</h1>
          <p className="mt-5 text-lg text-textsecondary">AI-powered STEM learning circles helping students collaborate, grow, and discover mentorship opportunities together.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/circles" className="inline-flex items-center gap-2 rounded-xl bg-royal px-5 py-3 font-semibold text-white">Join a Circle <ArrowRight size={16} /></Link>
            <Link to="/mentors" className="rounded-xl border border-borderline bg-white px-5 py-3 font-semibold">Explore Mentors</Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-3xl bg-gradient-to-br from-softblue to-white p-8 shadow-soft">
          <div className="space-y-4 rounded-2xl border border-white/70 bg-white/70 p-6 backdrop-blur">
            <p className="text-sm font-semibold text-darkblue">AI Learning Workspace</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white p-3">Peer Similarity Engine</div>
              <div className="rounded-xl bg-white p-3">Mentor Fit Signals</div>
              <div className="rounded-xl bg-white p-3">Circle Activity Feed</div>
              <div className="rounded-xl bg-white p-3">Roadmap Suggestions</div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="text-3xl font-bold">Platform Features</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article key={feature.title} whileHover={{ y: -4 }} className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
                <Icon className="text-royal" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-textsecondary">{feature.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-borderline bg-white p-8 shadow-soft">
          <h3 className="text-2xl font-bold">How it works</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Create profile", "Join circles", "Connect with mentors"].map((step, idx) => (
              <div key={step} className="rounded-2xl bg-appbg p-4">
                <p className="text-xs font-semibold text-darkblue">STEP {idx + 1}</p>
                <p className="mt-2 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
