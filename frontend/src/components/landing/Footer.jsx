import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#1a56db] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="7" r="3" stroke="white" strokeWidth="1.8"/>
                <circle cx="13" cy="7" r="3" stroke="white" strokeWidth="1.8"/>
                <circle cx="10" cy="13" r="3" stroke="white" strokeWidth="1.8"/>
                <line x1="7" y1="10" x2="10" y2="10" stroke="white" strokeWidth="1.4"/>
                <line x1="13" y1="10" x2="10" y2="10" stroke="white" strokeWidth="1.4"/>
              </svg>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">MentorCircle</span>
          </Link>

          <p className="text-[12px] text-slate-500">
            © {new Date().getFullYear()} MentorCircle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
