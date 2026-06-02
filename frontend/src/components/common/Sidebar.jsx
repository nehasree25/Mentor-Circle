import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  UserCheck,
  Sparkles,
  User,
  LogOut,
  X,
  Menu,
  BookOpen,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "./Avatar";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearSession, user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", path: "/dashboard", icon: Home },
    { id: "circles", label: "Circles", path: "/circles", icon: BookOpen },
    { id: "mentors", label: "Mentors", path: "/mentors", icon: UserCheck },
    { id: "peers", label: "Peers", path: "/peers", icon: Users },
    { id: "ai", label: "AI Recommendations", path: "/ai", icon: Sparkles },
    { id: "profile", label: "Profile", path: "/profile", icon: User },
  ];

  const onLogout = () => {
    clearSession();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-borderline">
      {/* Branding Section */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-royal to-darkblue rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy">MentorCircle</h2>
            <p className="text-xs text-textsecondary">AI Learning Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-royal text-white font-semibold shadow-soft"
                    : "text-textsecondary hover:bg-softblue hover:text-navy"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile & Logout */}
      <div className="mt-auto p-6 border-t border-borderline">
        <div className="rounded-2xl border border-borderline bg-appbg p-5 mb-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Avatar 
              user={{
                ...user,
                profile: profile
              }} 
              size="w-12 h-12" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy truncate">
                {user?.first_name} {user?.last_name || ""}
              </p>
              <p className="text-xs text-textsecondary truncate">
                @{user?.username}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-textsecondary hover:bg-softblue hover:text-navy transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-borderline p-4 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-royal to-darkblue rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-navy">MentorCircle</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-navy hover:bg-softblue rounded-xl"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-72 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/20">
          <aside className="w-72 h-full">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
