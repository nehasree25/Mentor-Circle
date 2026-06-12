import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  UserCheck,
  Sparkles,
  User,
  X,
  Menu,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "./Avatar";

const Navbar = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", path: "/dashboard", icon: Home },
    { id: "circles", label: "Circles", path: "/circles", icon: BookOpen },
    { id: "mentors", label: "Mentors", path: "/mentors", icon: UserCheck },
    { id: "peers", label: "Peers", path: "/peers", icon: Users },
    { id: "ai", label: "AI Recommendations", path: "/ai", icon: Sparkles },
  ];

  return (
    <>
      {/* Horizontal Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-borderline shadow-soft">
        <div className="max-w-full px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Branding - Left */}
            <div className="flex items-center gap-3 min-w-fit">
              <img src="/logo.png" alt="MentorCircle Logo" className="w-9 h-9 object-contain" />
              <div className="hidden md:block">
                <h2 className="text-lg font-bold text-navy">MentorCircle</h2>
              </div>
            </div>

            {/* Desktop Navigation Menu - Right */}
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                      ${
                        isActive
                          ? "bg-royal text-white font-semibold"
                          : "text-textsecondary hover:bg-softblue hover:text-navy"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Profile Avatar - Right */}
              <div className="flex items-center gap-3 pl-4 border-l border-borderline ml-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-softblue transition-all duration-200"
                >
                  <Avatar 
                    user={{
                      ...user,
                      profile: profile
                    }} 
                    size="w-9 h-9" 
                  />
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-navy hover:bg-softblue rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-borderline">
              <div className="flex flex-col gap-2 pt-4">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "bg-royal text-white font-semibold"
                            : "text-textsecondary hover:bg-softblue hover:text-navy"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Profile Section */}
                <div className="px-4 py-3 border-t border-borderline mt-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar 
                      user={{
                        ...user,
                        profile: profile
                      }} 
                      size="w-10 h-10" 
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy">
                        {user?.first_name} {user?.last_name || ""}
                      </p>
                      <p className="text-xs text-textsecondary">
                        @{user?.username}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-textsecondary hover:bg-softblue hover:text-navy transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span>View Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
