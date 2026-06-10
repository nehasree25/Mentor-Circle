import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Users, Heart, Search, TrendingUp } from "lucide-react";

const Landing = () => {
  return (
    <main className="min-h-screen">
      {/* Outer Glass Container Border */}
      <div className="fixed inset-0 m-6 md:m-10 rounded-[56px] border border-white/30 pointer-events-none z-0 shadow-glow" />

      {/* Header */}
      <header className="relative z-50 border-b border-white/20 backdrop-blur-xl bg-white/10 sticky top-0">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-8 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-royal/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
              <Users className="text-royal" size={16} />
            </div>
            <span className="text-base font-semibold text-navy">Mentor Circle</span>
          </div>
          <div className="hidden gap-8 text-sm text-textsecondary font-medium md:flex">
            <Link to="/circles" className="hover:text-navy transition-colors duration-200">Circles</Link>
            <a href="#how-it-works" className="hover:text-navy transition-colors duration-200">How It Works</a>
            <Link to="/mentors" className="hover:text-navy transition-colors duration-200">Mentors</Link>
            <a href="#resources" className="hover:text-navy transition-colors duration-200">Resources</a>
          </div>
          <Link
            to="/circles"
            className="px-6 py-2 rounded-full bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-all shadow-soft"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
            style={{ maxWidth: '700px' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 text-xs">
              <span className="text-royal font-semibold">✨ Mentor-led learning circles</span>
            </div>
            <h1 className="hero-title text-[48px] md:text-[72px] lg:text-[88px] text-[#111827]" style={{ lineHeight: '0.9', letterSpacing: '-0.04em', maxWidth: '700px' }}>
              Find Your Circle.
              <br />
              Learn Together.
              <br />
              <span style={{ background: 'linear-gradient(135deg, #7C6CFF 0%, #9F8CFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Grow Faster.
              </span>
            </h1>
            <p className="text-[20px] text-[#6B7280] leading-[1.7] font-normal" style={{ maxWidth: '650px', marginTop: '32px' }}>
              Join mentor-led circles for collaborative learning, discussions, and meaningful connections.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/circles"
                className="inline-flex items-center gap-2 rounded-full bg-royal px-7 py-2.5 text-sm font-semibold text-white hover:bg-darkpurple transition-all shadow-soft primary-btn"
              >
                Explore Circles
                <ArrowRight size={16} />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/90 px-7 py-2.5 text-sm font-semibold text-navy hover:bg-white/80 transition-all secondary-btn">
                Become a Mentor
              </button>
            </div>
          </motion.div>

          {/* Right Content - Laptop Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="relative">
              {/* Laptop frame - glassmorphism */}
              <div className="rounded-3xl glass-card overflow-hidden shadow-glow">
                <div className="bg-gradient-to-br from-white/30 via-white/20 to-white/10 p-6 space-y-4">
                  {/* Top bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-royal/30 backdrop-blur-sm flex items-center justify-center">
                        <Users size={14} className="text-royal" />
                      </div>
                      <span className="font-semibold text-sm text-navy">Mentor Circle</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                  </div>

                  {/* Header with title */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-navy">Discover Circles</h3>
                    <p className="text-xs text-textsecondary">Build the right circle for your learning journey.</p>
                  </div>

                  {/* Navigation tabs */}
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-full bg-royal text-white text-xs font-semibold">All</button>
                    <button className="px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm text-navy text-xs font-medium">Technology</button>
                    <button className="px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm text-navy text-xs font-medium">Design</button>
                    <button className="px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm text-navy text-xs font-medium">Business</button>
                  </div>

                  {/* Community cards grid */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {/* Card 1 - AI/Machine Learning */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/90 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-lg">🤖</div>
                      <div>
                        <h4 className="text-xs font-bold text-navy">AI/ML Experts</h4>
                        <p className="text-[10px] text-textsecondary">Machine learning enthusiasts</p>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-blue-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-purple-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-green-400 border-2 border-white"></div>
                      </div>
                    </div>

                    {/* Card 2 - Frontend Developers */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/90 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-lg">💻</div>
                      <div>
                        <h4 className="text-xs font-bold text-navy">Frontend Devs</h4>
                        <p className="text-[10px] text-textsecondary">Build modern apps</p>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-purple-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-orange-400 border-2 border-white"></div>
                      </div>
                    </div>

                    {/* Card 3 - Startup Founders */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/90 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-lg">🚀</div>
                      <div>
                        <h4 className="text-xs font-bold text-navy">Founders</h4>
                        <p className="text-[10px] text-textsecondary">Connect with builders</p>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-orange-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-red-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-white"></div>
                        <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-white"></div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended section */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold text-navy">Recommended for you</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/80">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-xs">🎯</div>
                          <span className="text-[10px] font-bold text-navy">Data Science</span>
                        </div>
                        <p className="text-[9px] text-textsecondary">Master data skills</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/80">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded bg-pink-100 flex items-center justify-center text-xs">🎨</div>
                          <span className="text-[10px] font-bold text-navy">Career Growth</span>
                        </div>
                        <p className="text-[9px] text-textsecondary">Advance your career</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/80">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center text-xs">📊</div>
                          <span className="text-[10px] font-bold text-navy">Leadership</span>
                        </div>
                        <p className="text-[9px] text-textsecondary">Lead with confidence</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative blur */}
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-royal/20 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Are Mentor Circles Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 py-16">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h2 className="hero-title text-[40px] md:text-[52px] text-[#111827] mb-3" style={{ lineHeight: '0.9', letterSpacing: '-0.04em' }}>
            What Are Mentor Circles?
          </h2>
          <p className="text-[#6B7280] leading-[1.7] text-base font-normal">
            Focused learning circles where mentors and peers come together to share knowledge and grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: MessageSquare,
              title: "Mentor-Led Discussions",
              description: "Learn from experienced mentors through focused conversations.",
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600",
            },
            {
              icon: Users,
              title: "Collaborative Learning",
              description: "Learn alongside peers with similar interests.",
              iconBg: "bg-pink-100",
              iconColor: "text-pink-600",
            },
            {
              icon: Heart,
              title: "Meaningful Connections",
              description: "Build lasting professional relationships.",
              iconBg: "bg-green-100",
              iconColor: "text-green-600",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} backdrop-blur-sm border border-white/60 flex items-center justify-center mb-4`}>
                <card.icon size={20} className={card.iconColor} />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">{card.title}</h3>
              <p className="text-textsecondary text-sm leading-relaxed font-light">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Explore Popular Circles Section */}
      <section id="circles" className="relative z-10 mx-auto max-w-7xl px-8 py-16">
        <div className="mb-10 text-center">
          <h2 className="hero-title text-[40px] md:text-[52px] text-[#111827] mb-3" style={{ lineHeight: '0.9', letterSpacing: '-0.04em' }}>
            Explore Popular Circles
          </h2>
          <p className="text-[#6B7280] leading-[1.7] text-base font-normal max-w-2xl mx-auto">
            Join circles focused on the topics that matter to you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: "🤖",
              title: "Machine Learning Circle",
              topics: ["Python", "Machine Learning", "AI"],
              iconBg: "bg-blue-100",
            },
            {
              icon: "💻",
              title: "Web Development Circle",
              topics: ["React", "JavaScript", "Node.js"],
              iconBg: "bg-purple-100",
            },
            {
              icon: "📊",
              title: "Data Science Circle",
              topics: ["Analytics", "Visualization", "Pandas"],
              iconBg: "bg-green-100",
            },
          ].map((circle, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${circle.iconBg} backdrop-blur-sm border border-white/60 flex items-center justify-center text-2xl mb-4`}>
                {circle.icon}
              </div>
              <h3 className="font-bold text-navy text-lg mb-4">{circle.title}</h3>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-navy mb-2">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {circle.topics.map((topic, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white/60 backdrop-blur-sm border border-white/80 text-navy text-xs font-medium rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="hero-title text-[40px] md:text-[52px] text-[#111827] mb-3" style={{ lineHeight: '0.9', letterSpacing: '-0.04em' }}>
            How It Works
          </h2>
          <p className="text-[#6B7280] leading-[1.7] text-base font-normal max-w-2xl mx-auto">
            Get started with Mentor Circle in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              number: "1",
              icon: Search,
              title: "Discover",
              description: "Find circles matching your interests.",
              bgColor: "bg-purple-500",
              iconColor: "text-purple-600",
              iconBg: "bg-purple-100",
            },
            {
              number: "2",
              icon: Users,
              title: "Connect",
              description: "Join discussions and interact with mentors.",
              bgColor: "bg-purple-500",
              iconColor: "text-pink-600",
              iconBg: "bg-pink-100",
            },
            {
              number: "3",
              icon: TrendingUp,
              title: "Grow",
              description: "Learn consistently and achieve your goals.",
              bgColor: "bg-purple-500",
              iconColor: "text-green-600",
              iconBg: "bg-green-100",
            },
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connecting dotted arrow */}
              {idx < 2 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 z-10">
                  <svg className="w-full h-full" viewBox="0 0 100 2" fill="none" preserveAspectRatio="none">
                    <line x1="0" y1="1" x2="95" y2="1" stroke="rgba(124, 58, 237, 0.25)" strokeDasharray="6,6" strokeWidth="2" />
                    <polygon points="95,0 100,1 95,2" fill="rgba(124, 58, 237, 0.25)" />
                  </svg>
                </div>
              )}

              <div className="glass-card rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform duration-300">
                <div className={`w-10 h-10 rounded-full ${step.bgColor} text-white flex items-center justify-center mx-auto mb-4 font-bold text-base shadow-soft`}>
                  {step.number}
                </div>
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${step.iconBg} backdrop-blur-sm border border-white/80 flex items-center justify-center`}>
                  <step.icon size={24} className={step.iconColor} />
                </div>
                <h3 className="font-bold text-navy text-lg mb-2">{step.title}</h3>
                <p className="text-textsecondary text-sm leading-relaxed font-light">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-8 py-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-card rounded-[40px] p-12 md:p-14 text-center relative overflow-hidden"
        >
          {/* Decorative blurs */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-purple-300/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-pink-300/15 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            <h2 className="hero-title text-[40px] md:text-[52px] text-[#111827] leading-tight max-w-3xl mx-auto" style={{ lineHeight: '0.9', letterSpacing: '-0.04em' }}>
              Learning is better when we do it together.
            </h2>
            <p className="text-[#6B7280] leading-[1.7] text-base font-normal max-w-2xl mx-auto">
              Join a circle and accelerate your growth.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Link
                to="/circles"
                className="inline-flex items-center gap-2 rounded-full bg-royal px-7 py-2.5 text-sm font-semibold text-white hover:bg-darkpurple transition-all shadow-soft primary-btn"
              >
                Explore Circles
                <ArrowRight size={16} />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/90 px-7 py-2.5 text-sm font-semibold text-navy hover:bg-white/80 transition-all secondary-btn">
                Become a Mentor
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 backdrop-blur-xl bg-white/10 py-10">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-royal/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                <Users className="text-royal" size={16} />
              </div>
              <span className="font-semibold text-navy text-sm">Mentor Circle</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-textsecondary font-medium">
              <Link to="/circles" className="hover:text-navy transition-colors">Circles</Link>
              <a href="#how-it-works" className="hover:text-navy transition-colors">How It Works</a>
              <Link to="/mentors" className="hover:text-navy transition-colors">Mentors</Link>
              <a href="#resources" className="hover:text-navy transition-colors">Resources</a>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-xs text-textsecondary">
            <p className="font-light">© 2025 Mentor Circle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
