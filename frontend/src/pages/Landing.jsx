import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "../assets/hero.png";

const Landing = () => {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch circles from backend
    const fetchCircles = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/circles/');
        const data = await response.json();
        setCircles(data.slice(0, 3)); // Get first 3 circles
        setLoading(false);
      } catch (error) {
        console.error('Error fetching circles:', error);
        setLoading(false);
      }
    };

    fetchCircles();
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #F8FAFC 0%, #F8FAFC 50%, #F8FAFC 100%)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating orb 1 */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-200 to-purple-100 rounded-full blur-3xl opacity-20"
          style={{ top: '10%', left: '10%' }}
          animate={{ 
            y: [0, 50, 0],
            x: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating orb 2 */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-200 to-blue-100 rounded-full blur-3xl opacity-20"
          style={{ top: '50%', right: '10%' }}
          animate={{ 
            y: [0, -50, 0],
            x: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating orb 3 */}
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-indigo-200 to-indigo-100 rounded-full blur-3xl opacity-15"
          style={{ bottom: '10%', left: '30%' }}
          animate={{ 
            y: [0, 40, 0],
            x: [0, -40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Sticky Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white bg-opacity-30 border-b border-white border-opacity-50">
        <div className="mx-auto max-w-full px-8 md:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mentor Circle" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-[#0F172A]">Mentor Circle</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            <a href="#home" className="text-[14px] text-[#475569] hover:text-[#0F172A] transition">Home</a>
            <a href="#circles" className="text-[14px] text-[#475569] hover:text-[#0F172A] transition">Circles</a>
            <a href="#how" className="text-[14px] text-[#475569] hover:text-[#0F172A] transition">How It Works</a>
            <a href="#mentors" className="text-[14px] text-[#475569] hover:text-[#0F172A] transition">Mentors</a>
            <a href="#resources" className="text-[14px] text-[#475569] hover:text-[#0F172A] transition">Resources</a>
          </div>

          <Link to="/login" className="px-6 py-2.5 bg-[#0F172A] text-white text-[13px] font-semibold rounded-full hover:bg-black transition inline-block">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative pt-24 md:pt-28 z-10">
        
        {/* Hero Section with Glass Box */}
        <section id="home" className="w-full px-8 md:px-20 py-2 md:py-4">
          <div className="mx-auto max-w-full rounded-[40px] border-2 border-white bg-white bg-opacity-20 backdrop-blur-lg p-8 md:p-16 shadow-lg min-h-auto" 
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <div className="grid md:grid-cols-2 gap-16 items-center h-full">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <h1 className="text-[40px] md:text-[48px] text-[#0F172A]" 
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1.05, wordSpacing: '0.12em' }}>
                  Find Your Circle
                  <br />
                  Learn Together
                  <br />
                  <span className="text-[#2563EB]">Grow Faster</span>
                </h1>

                <p className="text-[15px] text-[#475569] leading-[1.7] font-normal max-w-md"
                  style={{ letterSpacing: '0.002em' }}>
                  Join mentor-led circles for collaborative learning, discussions, and meaningful connections.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link to="/login" className="px-8 py-3 bg-[#2563EB] text-white text-[14px] font-semibold rounded-full hover:bg-blue-600 transition flex items-center gap-2">
                    Explore Circles
                    <ArrowRight size={16} />
                  </Link>
                  <button className="px-8 py-3 border-2 border-[#0F172A] text-[#0F172A] text-[14px] font-semibold rounded-full hover:bg-gray-50 transition">
                    Become a Mentor
                  </button>
                </div>
              </motion.div>

              {/* Right Content - Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden md:block"
              >
                <img 
                  src={heroImage} 
                  alt="Mentor Circle Interface" 
                  className="w-full h-auto rounded-3xl scale-150"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* What Are Mentor Circles Section */}
        <section id="about" className="w-full px-8 md:px-20 py-2 md:py-4">
          <div className="mx-auto max-w-full rounded-[40px] border-2 border-white bg-white bg-opacity-20 backdrop-blur-lg p-8 md:p-16 shadow-lg"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-[36px] md:text-[44px] text-[#0F172A]" 
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  What Are Mentor Circles?
                </h2>
                <p className="text-[15px] text-[#475569] leading-[1.7] mt-6" style={{ letterSpacing: '0.002em' }}>
                  Mentor Circles are focused communities where mentors and learners come together to share knowledge, solve problems, and support each other's growth.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Card 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="p-6 rounded-2xl border border-white bg-white bg-opacity-40 backdrop-blur-md text-center"
                >
                  <div className="text-[32px] mb-3">💬</div>
                  <h3 className="text-[16px] text-[#0F172A] font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Mentor-Led Discussions
                  </h3>
                  <p className="text-[12px] text-[#475569]" style={{ letterSpacing: '0.002em' }}>
                    Learn from experienced mentors
                  </p>
                </motion.div>

                {/* Card 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="p-6 rounded-2xl border border-white bg-white bg-opacity-40 backdrop-blur-md text-center"
                >
                  <div className="text-[32px] mb-3">👥</div>
                  <h3 className="text-[16px] text-[#0F172A] font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Collaborative Learning
                  </h3>
                  <p className="text-[12px] text-[#475569]" style={{ letterSpacing: '0.002em' }}>
                    Learn with peers
                  </p>
                </motion.div>

                {/* Card 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-6 rounded-2xl border border-white bg-white bg-opacity-40 backdrop-blur-md text-center"
                >
                  <div className="text-[32px] mb-3">❤️</div>
                  <h3 className="text-[16px] text-[#0F172A] font-semibold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Meaningful Connections
                  </h3>
                  <p className="text-[12px] text-[#475569]" style={{ letterSpacing: '0.002em' }}>
                    Build relationships
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Top Circles Section */}
        <section id="circles" className="w-full px-8 md:px-20 py-2 md:py-4">
          <div className="mx-auto max-w-full rounded-[40px] border-2 border-white bg-white bg-opacity-20 backdrop-blur-lg p-8 md:p-16 shadow-lg"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <div className="mb-12">
              <h2 className="text-[36px] md:text-[44px] text-[#0F172A]" 
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Explore Top Circles
              </h2>
              <p className="text-[15px] text-[#475569] leading-[1.7] mt-4" style={{ letterSpacing: '0.002em' }}>
                Join circles focused on the topics that matter to you.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-[#475569]">Loading circles...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {circles.map((circle, index) => (
                  <motion.div
                    key={circle.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-8 rounded-2xl border border-white bg-white bg-opacity-40 backdrop-blur-md"
                  >
                    <h3 className="text-[20px] text-[#0F172A] font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {circle.name}
                    </h3>
                    {circle.description && (
                      <p className="text-[14px] text-[#475569] leading-relaxed mb-6" style={{ letterSpacing: '0.002em' }}>
                        {circle.description.substring(0, 100)}...
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] text-[#475569]">
                        {circle.members_count || 0} members
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="text-[#2563EB] hover:text-blue-600 transition"
                      >
                        →
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link to="/circles" className="inline-block px-8 py-3 bg-white bg-opacity-40 border border-white text-[#2563EB] text-[14px] font-semibold rounded-full hover:bg-opacity-60 transition">
                Explore All Circles →
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" className="w-full px-8 md:px-20 py-2 md:py-4">
          <div className="mx-auto max-w-full rounded-[40px] border-2 border-white bg-white bg-opacity-20 backdrop-blur-lg p-8 md:p-16 shadow-lg"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <div className="text-center mb-16">
              <h2 className="text-[36px] md:text-[44px] text-[#0F172A]" 
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                How It Works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-8 rounded-2xl border border-white bg-white bg-opacity-40 backdrop-blur-md text-center"
              >
                <div className="text-[48px] mb-4 font-bold text-[#2563EB]">1</div>
                <h3 className="text-[20px] text-[#0F172A] font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Discover
                </h3>
                <p className="text-[14px] text-[#475569] leading-relaxed" style={{ letterSpacing: '0.002em' }}>
                  Find circles that match your interests and goals
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="p-8 rounded-2xl border border-white bg-white bg-opacity-40 backdrop-blur-md text-center"
              >
                <div className="text-[48px] mb-4 font-bold text-[#2563EB]">2</div>
                <h3 className="text-[20px] text-[#0F172A] font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Connect
                </h3>
                <p className="text-[14px] text-[#475569] leading-relaxed" style={{ letterSpacing: '0.002em' }}>
                  Join discussions and interact with mentors
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="p-8 rounded-2xl border border-white bg-white bg-opacity-40 backdrop-blur-md text-center"
              >
                <div className="text-[48px] mb-4 font-bold text-[#2563EB]">3</div>
                <h3 className="text-[20px] text-[#0F172A] font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Grow
                </h3>
                <p className="text-[14px] text-[#475569] leading-relaxed" style={{ letterSpacing: '0.002em' }}>
                  Learn and achieve your goals together
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full px-8 md:px-20 py-2 md:py-4">
          <div className="mx-auto max-w-full rounded-[40px] border-2 border-white bg-white bg-opacity-20 backdrop-blur-lg p-8 md:p-16 shadow-lg text-center"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <h2 className="text-[36px] md:text-[44px] text-[#0F172A] mb-4" 
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Learning is better when we do it together
            </h2>
            <p className="text-[16px] text-[#475569] mb-8 max-w-2xl mx-auto" style={{ letterSpacing: '0.002em' }}>
              Be part of a super-circle community that helps you learn, share, and grow together.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/circles" className="px-8 py-3 bg-[#2563EB] text-white text-[14px] font-semibold rounded-full hover:bg-blue-600 transition flex items-center gap-2">
                Explore Circles
                <ArrowRight size={16} />
              </Link>
              <button className="px-8 py-3 border-2 border-[#2563EB] text-[#2563EB] text-[14px] font-semibold rounded-full hover:bg-blue-50 transition">
                Become a Mentor
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-12 mb-6 px-8 md:px-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.png" alt="Mentor Circle" className="h-6 w-auto" />
          <span className="text-sm font-semibold text-[#0F172A]">Mentor Circle</span>
        </div>
        <div className="flex justify-center gap-8 mb-4 text-[13px]">
          <a href="#circles" className="text-[#475569] hover:text-[#0F172A]">Circles</a>
          <a href="#how" className="text-[#475569] hover:text-[#0F172A]">How It Works</a>
          <a href="#mentors" className="text-[#475569] hover:text-[#0F172A]">Mentors</a>
          <a href="#resources" className="text-[#475569] hover:text-[#0F172A]">Resources</a>
        </div>
        <p className="text-[12px] text-[#475569]">© 2024 Mentor Circle. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default Landing;







