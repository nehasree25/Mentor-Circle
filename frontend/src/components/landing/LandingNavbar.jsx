import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const LandingNavbar = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Why MentorCircle", href: "#why" },
    { label: "How It Works", href: "#how" },
    { label: "Circles", href: "#circles" },
    { label: "For Mentors", href: "#mentors" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/98 backdrop-blur-xl shadow-[0_1px_0_0_#E2E8F0]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-[68px]">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
            >
              <img src="/logo.png" alt="MentorCircle" className="h-8" />
              <span className="text-[15px] font-semibold text-[#0F172A] tracking-tight">
                MentorCircle
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-[13.5px] font-medium text-[#475569] hover:text-[#0F172A] rounded-md hover:bg-slate-50 transition-all duration-150"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-[#1a56db] hover:bg-[#1648c4] text-white text-[13.5px] font-semibold rounded-lg transition-all duration-150 shadow-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-[13.5px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors duration-150"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-[#1a56db] hover:bg-[#1648c4] text-white text-[13.5px] font-semibold rounded-lg transition-all duration-150 shadow-sm"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-md text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-[14px] font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 px-4 bg-[#1a56db] text-white text-[14px] font-semibold rounded-lg text-center"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="py-2.5 text-[14px] font-medium text-[#475569] hover:text-[#0F172A]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 px-4 bg-[#1a56db] text-white text-[14px] font-semibold rounded-lg text-center"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default LandingNavbar;
