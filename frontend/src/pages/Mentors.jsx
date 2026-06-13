import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { mentorService } from "../services/mentorService";
import { mentorshipService } from "../services/mentorshipService";
import { useAuth } from "../context/AuthContext";
import ProfileDrawer from "../components/common/ProfileDrawer";
import axios from "../api/axios";
import { Search, ChevronLeft, ChevronRight, X, Loader2, Check } from "lucide-react";

const normalize = (data) => (Array.isArray(data) ? data : data?.results || []);

// ========================================================================
// Icons
// ========================================================================
const MentorGroupIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const AvailableIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);
const DomainIcon = ({ size = 28, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const BriefcaseIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

// ========================================================================
// Domain options
// ========================================================================
const DOMAIN_OPTIONS = [
  { value: "", label: "All Domains" },
  { value: "math", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "cs", label: "Computer Science" },
  { value: "engineering", label: "Engineering" },
  { value: "other", label: "Other STEM" },
];

const EXPERIENCE_OPTIONS = [
  { value: "", label: "All Experience" },
  { value: "1", label: "1+ Years" },
  { value: "3", label: "3+ Years" },
  { value: "5", label: "5+ Years" },
  { value: "10", label: "10+ Years" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "All Availability" },
  { value: "available", label: "Available" },
  { value: "away", label: "Away" },
  { value: "unavailable", label: "Unavailable" },
];

const PAGE_SIZE = 6;

// ========================================================================
// Request Guidance Modal
// ========================================================================
const RequestGuidanceModal = ({ mentor, onClose }) => {
  const [circles, setCircles] = useState([]);
  const [loadingCircles, setLoadingCircles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState("");
  const [subject, setSubject] = useState("");
  const [guidanceTopic, setGuidanceTopic] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const { data } = await axios.get("dashboard/");
        setCircles(data.joined_circles || []);
      } catch (e) {
        toast.error("Failed to load your circles");
      } finally {
        setLoadingCircles(false);
      }
    };
    fetchCircles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCircle || !subject || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await mentorshipService.createGuidanceRequest(selectedCircle, mentor.id, {
        subject,
        guidance_topic: guidanceTopic,
        message,
      });
      toast.success("Guidance request sent successfully!");
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const mentorName = mentor.first_name || mentor.last_name
    ? `${mentor.first_name || ""} ${mentor.last_name || ""}`.trim()
    : mentor.username;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-navy">Request Guidance from {mentorName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Circle Select */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Choose a Circle <span className="text-red-500">*</span>
            </label>
            {loadingCircles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-blue-600" />
              </div>
            ) : circles.length === 0 ? (
              <p className="text-sm text-gray-500">
                You need to join a circle first before requesting guidance.
              </p>
            ) : (
              <select
                value={selectedCircle}
                onChange={(e) => setSelectedCircle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select a circle...</option>
                {circles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Calculus, Machine Learning"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50"
            />
          </div>

          {/* Guidance Topic */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Specific Topic
            </label>
            <input
              type="text"
              value={guidanceTopic}
              onChange={(e) => setGuidanceTopic(e.target.value)}
              placeholder="e.g., Chain Rule, Neural Network Basics"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain what you need help with..."
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedCircle || !subject || !message}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Mentors = () => {
  const { user } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestModalMentor, setRequestModalMentor] = useState(null);

  const [stats, setStats] = useState({ total_mentors: 0, available_mentors: 0, domains_covered: 0 });

  // Filter state
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [experience, setExperience] = useState("");
  const [expertise, setExpertise] = useState("");
  const [availability, setAvailability] = useState("");

  // Applied filters (only update on Apply click)
  const [applied, setApplied] = useState({});

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("mentors/stats/");
      setStats(data);
    } catch (_) {}
  };

  const fetchMentors = async (params = {}, page = 1) => {
    setLoading(true);
    try {
      const data = await mentorService.getMentors({ ...params, page, page_size: PAGE_SIZE });
      setMentors(normalize(data));
      if (data.count !== undefined) {
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to load mentors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMentors({}, 1);
  }, []);

  useEffect(() => {
    fetchMentors(applied, currentPage);
  }, [currentPage]);

  const handleApply = (e) => {
    e.preventDefault();
    const filters = {};
    if (search) filters.search = search;
    if (domain) filters.domain = domain;
    if (experience) filters.experience = experience;
    if (expertise) filters.expertise = expertise;
    if (availability) filters.availability = availability;
    setApplied(filters);
    setCurrentPage(1);
    fetchMentors(filters, 1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }
    return pages;
  };

  const getSkills = (mentor) => {
    const raw = mentor.profile?.skills || mentor.profile?.mentorship_expertise || "";
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  };

  return (
    <div>
      {/* ========================================================================
            Hero
      ======================================================================== */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6 overflow-hidden relative">
        <div className="z-10">
          <h1 className="text-3xl font-bold text-navy mb-1">Discover Mentors</h1>
          <p className="text-gray-500 text-sm max-w-sm">
            Learn from experienced mentors and accelerate your growth.
          </p>
        </div>
        {/* Decorative illustration */}
        <div className="hidden md:flex items-center gap-2 opacity-80">
          <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
            <circle cx="60" cy="50" r="38" fill="#EFF6FF"/>
            <circle cx="130" cy="50" r="30" fill="#DBEAFE"/>
            {/* Person 1 */}
            <circle cx="55" cy="34" r="10" fill="#93C5FD"/>
            <rect x="40" y="46" width="30" height="22" rx="8" fill="#3B82F6"/>
            {/* Laptop */}
            <rect x="44" y="58" width="22" height="12" rx="2" fill="#1D4ED8"/>
            <rect x="42" y="69" width="26" height="2" rx="1" fill="#93C5FD"/>
            {/* Person 2 */}
            <circle cx="132" cy="36" r="9" fill="#BFDBFE"/>
            <rect x="118" y="47" width="28" height="20" rx="7" fill="#60A5FA"/>
            {/* Star */}
            <polygon points="160,15 162,21 168,21 163,25 165,31 160,27 155,31 157,25 152,21 158,21" fill="#3B82F6"/>
            {/* Lines */}
            <line x1="80" y1="38" x2="105" y2="30" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3,2"/>
            <line x1="80" y1="48" x2="105" y2="52" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3,2"/>
            {/* Plant */}
            <rect x="162" y="72" width="4" height="16" rx="2" fill="#86EFAC"/>
            <ellipse cx="159" cy="68" rx="6" ry="8" fill="#4ADE80" transform="rotate(-20 159 68)"/>
            <ellipse cx="169" cy="65" rx="5" ry="7" fill="#22C55E" transform="rotate(20 169 65)"/>
          </svg>
        </div>
      </div>

      {/* ========================================================================
            Filters
      ======================================================================== */}
      <form onSubmit={handleApply} className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 mb-5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentors by name, skills or domain"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-gray-50"
          />
        </div>

        {/* Domain */}
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white text-gray-600 min-w-36"
        >
          {DOMAIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Experience */}
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white text-gray-600 min-w-36"
        >
          {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Expertise */}
        <input
          type="text"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          placeholder="All Expertise"
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white text-gray-600 min-w-36"
        />

        {/* Availability */}
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white text-gray-600 min-w-36"
        >
          {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Apply Filters
        </button>
      </form>

      {/* ========================================================================
            Stats
      ======================================================================== */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <MentorGroupIcon size={22} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-navy leading-tight">{stats.total_mentors}</p>
            <p className="text-xs text-gray-400">Total Mentors</p>
            <p className="text-xs text-gray-400">Across all domains</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <AvailableIcon size={22} className="text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-navy leading-tight">{stats.available_mentors}</p>
            <p className="text-xs text-gray-400">Available Mentors</p>
            <p className="text-xs text-gray-400">Available for guidance</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <DomainIcon size={22} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-navy leading-tight">{stats.domains_covered}</p>
            <p className="text-xs text-gray-400">Domains Covered</p>
            <p className="text-xs text-gray-400">STEM & Beyond</p>
          </div>
        </div>
      </div>

      {/* ========================================================================
            Results Header
      ======================================================================== */}
      {!loading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-navy">
            {totalCount} Mentor{totalCount !== 1 ? "s" : ""} Found
          </p>
        </div>
      )}

      {/* ========================================================================
            Mentor Cards
      ======================================================================== */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {[1,2,3].map(j => <div key={j} className="h-6 bg-gray-200 rounded-full w-16" />)}
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <MentorGroupIcon size={28} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-navy mb-2">No Mentors Found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {mentors.map((mentor) => {
            const isCurrentUser = user && mentor.id === user.id;
            const skills = getSkills(mentor);
            const name = mentor.first_name || mentor.last_name
              ? `${mentor.first_name || ""} ${mentor.last_name || ""}`.trim()
              : mentor.username;
            const domainLabel = DOMAIN_OPTIONS.find(d => d.value === mentor.profile?.domain)?.label || mentor.profile?.domain || "";

            return (
              <div
                key={mentor.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex gap-4"
              >
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name + verification icon */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-sm font-bold text-navy">{name}</h3>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6" className="flex-shrink-0">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" fill="#3B82F6"/>
                    </svg>
                  </div>

                  {/* Role/domain */}
                  {domainLabel && (
                    <p className="text-xs text-gray-500 mb-1">{domainLabel}</p>
                  )}

                  {/* Experience */}
                  {mentor.profile?.years_of_experience !== undefined && mentor.profile.years_of_experience > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <BriefcaseIcon size={12} className="text-gray-400" />
                      <span>{mentor.profile.years_of_experience}+ Years Experience</span>
                    </div>
                  )}

                  {/* Skill chips */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
                          {s}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                          +{skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {mentor.profile?.bio && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {mentor.profile.bio}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-auto">
                    {isCurrentUser ? (
                      <button
                        onClick={() => window.location.href = "/profile"}
                        className="px-4 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg text-navy hover:bg-gray-50 transition-colors"
                      >
                        Your Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedMentor(mentor)}
                          className="px-4 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg text-navy hover:bg-gray-50 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => setRequestModalMentor(mentor)}
                          className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Request Guidance
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================
            Pagination
      ======================================================================== */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          {renderPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={idx} className="px-1 text-sm text-gray-400">...</span>
            ) : (
              <button
                key={idx}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 hover:bg-gray-100 text-navy"
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ========================================================================
            Profile Drawer
      ======================================================================== */}
      {selectedMentor && (
        <ProfileDrawer
          person={selectedMentor}
          onClose={() => setSelectedMentor(null)}
        />
      )}

      {/* ========================================================================
            Request Guidance Modal
      ======================================================================== */}
      {requestModalMentor && (
        <RequestGuidanceModal
          mentor={requestModalMentor}
          onClose={() => setRequestModalMentor(null)}
        />
      )}
    </div>
  );
};

export default Mentors;
