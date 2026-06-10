import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Bookmark } from "lucide-react";
import { PeerDetailsModal } from "../components/peers/PeerDetailsModal";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/common/Avatar";

// Icons matching the design
const PeopleIcon = ({ className = "", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CircleTargetIcon = ({ className = "", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const StarOutlineIcon = ({ className = "", size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const NetworkIcon = ({ className = "", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const HeartOutlineIcon = ({ className = "", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SkillsIcon = ({ className = "", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const CirclesIcon = ({ className = "", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export function PeerDiscovery() {
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [stats, setStats] = useState({
    totalPeers: 0,
    sharedCircles: 0,
    commonInterests: 0,
    newConnections: 0,
  });

  const [skillsFilter, setSkillsFilter] = useState("");
  const [interestsFilter, setInterestsFilter] = useState("");
  const [circlesFilter, setCirclesFilter] = useState("");
  const [sortBy, setSortBy] = useState("most_relevant");

  // Dropdown open states
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);
  const [circlesOpen, setCirclesOpen] = useState(false);

  const PAGE_SIZE = 2;

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/peers/stats/`);
      setStats({
        totalPeers: response.data.total_peers,
        sharedCircles: response.data.shared_circles,
        commonInterests: response.data.common_interests,
        newConnections: response.data.new_connections,
      });
    } catch (err) {
      console.error("Error fetching peer stats:", err);
    }
  };

  const fetchPeers = async (search = "", page = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = { search, page, page_size: PAGE_SIZE };
      if (filters.skills) params.skills = filters.skills;
      if (filters.interests) params.interests = filters.interests;
      if (filters.circles) params.circles = filters.circles;

      const response = await axios.get(`/peers/`, { params });
      const results = response.data.results || response.data;
      setPeers(Array.isArray(results) ? results : []);

      if (response.data.count !== undefined) {
        setTotalCount(response.data.count);
        setTotalPages(Math.ceil(response.data.count / PAGE_SIZE));
      }
    } catch (err) {
      console.error("Error fetching peers:", err);
      toast.error("Failed to load peers");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPeers(searchQuery, 1, {
      skills: skillsFilter,
      interests: interestsFilter,
      circles: circlesFilter,
    });
  };

  const resetFilters = () => {
    setSkillsFilter("");
    setInterestsFilter("");
    setCirclesFilter("");
    setCurrentPage(1);
    fetchPeers(searchQuery, 1, {});
  };

  useEffect(() => {
    // Fetch real stats once on mount — independent of pagination
    fetchStats();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchPeers(searchQuery, 1, {
        skills: skillsFilter,
        interests: interestsFilter,
        circles: circlesFilter,
      });
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    fetchPeers(searchQuery, currentPage, {
      skills: skillsFilter,
      interests: interestsFilter,
      circles: circlesFilter,
    });
  }, [currentPage]);

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
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  };

  const getConnectLabel = (peer) => {
    switch (peer.collaboration_status) {
      case "request_sent": return "Send Request";
      case "request_received": return "Invite to Connect";
      case "collaborators": return "Collaborating";
      default: return "Collaborate";
    }
  };

  const getAvailabilityBadge = (availability) => {
    if (!availability || availability === "unavailable") return null;
    const isActive = availability === "available";
    return (
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded ${
          isActive
            ? "bg-blue-100 text-blue-600"
            : "bg-orange-100 text-orange-500"
        }`}
      >
        {isActive ? "Active" : "Away"}
      </span>
    );
  };

  return (
    <div className="bg-gray-50">
      <div>
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-navy">Peers</h1>
          <p className="text-sm text-textsecondary mt-0.5">
            Discover and connect with learners
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-3">
          {/* Total Peers */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <PeopleIcon className="text-blue-500" size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-navy leading-tight">{stats.totalPeers}</p>
              <p className="text-xs text-textsecondary">Total Peers</p>
            </div>
          </div>

          {/* Shared Circles */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <CircleTargetIcon className="text-green-500" size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-navy leading-tight">{stats.sharedCircles}</p>
              <p className="text-xs text-textsecondary">Shared Circles</p>
            </div>
          </div>

          {/* Common Interests */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
              <StarOutlineIcon className="text-yellow-500" size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-navy leading-tight">{stats.commonInterests}</p>
              <p className="text-xs text-textsecondary">Common Interests</p>
            </div>
          </div>

          {/* New Connections */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <NetworkIcon className="text-purple-500" size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-navy leading-tight">{stats.newConnections}</p>
              <p className="text-xs text-textsecondary">New Collaborations</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, skills or interests..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-textsecondary font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-semibold text-navy border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="most_relevant">Most Relevant</option>
              <option value="recent">Most Recent</option>
              <option value="circles">Most Shared Circles</option>
            </select>
          </div>
        </div>

        <div className="flex gap-5 items-stretch">
          {/* Filters Sidebar */}
          <div className="w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-navy">Filters</h3>
                <button onClick={resetFilters} className="text-sm text-blue-600 font-semibold hover:text-blue-800">
                  Reset
                </button>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
                  <SkillsIcon className="text-gray-500" size={14} />
                  Skills
                </label>
                <div className="relative">
                  <button
                    onClick={() => { setSkillsOpen(!skillsOpen); setInterestsOpen(false); setCirclesOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg bg-white hover:border-blue-400 focus:outline-none"
                  >
                    <span>{skillsFilter || "Select skills"}</span>
                    <ChevronDown size={14} className={`transition-transform ${skillsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {skillsOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                      <input
                        autoFocus
                        type="text"
                        value={skillsFilter}
                        onChange={(e) => setSkillsFilter(e.target.value)}
                        placeholder="Type a skill..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                        onKeyDown={(e) => { if (e.key === "Enter") setSkillsOpen(false); }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
                  <HeartOutlineIcon className="text-red-400" size={14} />
                  Interests
                </label>
                <div className="relative">
                  <button
                    onClick={() => { setInterestsOpen(!interestsOpen); setSkillsOpen(false); setCirclesOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg bg-white hover:border-blue-400 focus:outline-none"
                  >
                    <span>{interestsFilter || "Select interests"}</span>
                    <ChevronDown size={14} className={`transition-transform ${interestsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {interestsOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                      <input
                        autoFocus
                        type="text"
                        value={interestsFilter}
                        onChange={(e) => setInterestsFilter(e.target.value)}
                        placeholder="Type an interest..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                        onKeyDown={(e) => { if (e.key === "Enter") setInterestsOpen(false); }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Circles */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-navy mb-2">
                  <CirclesIcon className="text-blue-500" size={14} />
                  Circles
                </label>
                <div className="relative">
                  <button
                    onClick={() => { setCirclesOpen(!circlesOpen); setSkillsOpen(false); setInterestsOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg bg-white hover:border-blue-400 focus:outline-none"
                  >
                    <span>{circlesFilter || "Select circles"}</span>
                    <ChevronDown size={14} className={`transition-transform ${circlesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {circlesOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                      <input
                        autoFocus
                        type="text"
                        value={circlesFilter}
                        onChange={(e) => setCirclesFilter(e.target.value)}
                        placeholder="Type a circle..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                        onKeyDown={(e) => { if (e.key === "Enter") setCirclesOpen(false); }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Peers List */}
          <div className="flex-1 min-w-0">
            {/* Single white box containing results row + peers + bottom pagination */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {[1, 2, 3].map((i, idx) => (
                  <div key={i}>
                    {idx > 0 && <hr className="border-gray-100" />}
                    <div className="p-6 animate-pulse">
                      <div className="flex gap-5">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                          <div className="h-3 bg-gray-200 rounded w-full" />
                          <div className="flex gap-2 pt-1">
                            <div className="h-6 bg-gray-200 rounded-full w-16" />
                            <div className="h-6 bg-gray-200 rounded-full w-16" />
                            <div className="h-6 bg-gray-200 rounded-full w-16" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : peers.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Results count + top pagination inside the box */}
                {totalCount > 0 && (
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                    <p className="text-sm text-textsecondary">
                      Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} peers
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      {renderPageNumbers().map((page, idx) =>
                        page === "..." ? (
                          <span key={idx} className="px-1 text-sm text-textsecondary">...</span>
                        ) : (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(page)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
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
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Peer rows */}
                {peers.map((peer, index) => (
                  <div key={peer.id}>
                    {index > 0 && (
                      <div className="mx-6 h-px bg-gray-200" />
                    )}
                    <div className="flex items-start p-6 gap-6 group transition-all duration-200 hover:bg-blue-50/40 hover:backdrop-blur-sm relative">
                      {/* Glass overlay on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-sm"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(219,234,254,0.3) 100%)', backdropFilter: 'blur(4px)' }}
                      />

                      {/* Avatar */}
                      <div className="flex-shrink-0 relative z-10">
                        <Avatar user={peer} size="w-20 h-20" />
                      </div>

                      {/* Left: Name, role, bio, skills */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-base font-bold text-navy">
                            {peer.first_name || peer.last_name
                              ? `${peer.first_name || ""} ${peer.last_name || ""}`.trim()
                              : peer.username}
                          </h3>
                          {getAvailabilityBadge(peer.profile?.availability)}
                        </div>

                        {peer.profile?.domain && (
                          <p className="text-sm text-gray-500 font-medium mb-2">
                            {peer.profile.domain}
                          </p>
                        )}

                        {peer.profile?.bio ? (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed max-w-xs">
                            {peer.profile.bio}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 mb-3 italic">No bio available</p>
                        )}

                        {/* Skill pills */}
                        <div className="flex flex-wrap gap-2">
                          {peer.profile?.skills && peer.profile.skills.length > 0 ? (
                            <>
                              {peer.profile.skills.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                                  {skill}
                                </span>
                              ))}
                              {peer.profile.skills.length > 4 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                  +{peer.profile.skills.length - 4}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">No skills listed</span>
                          )}
                        </div>
                      </div>

                      {/* Right: meta + actions */}
                      <div className="flex items-start gap-8 flex-shrink-0 relative z-10">
                        {/* Meta column */}
                        <div className="space-y-3 w-56">
                          <div className="flex items-start gap-2.5">
                            <PeopleIcon className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-sm font-semibold text-navy leading-tight">
                                {peer.common_circles_count || 0} Shared Circle{(peer.common_circles_count || 0) !== 1 ? "s" : ""}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {peer.common_circles && peer.common_circles.length > 0
                                  ? (() => {
                                      const names = peer.common_circles.map((c) => c.name);
                                      const first2 = names.slice(0, 2).join(", ");
                                      return names.length > 2 ? `${first2} +${names.length - 2}` : first2;
                                    })()
                                  : "No shared circles"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <HeartOutlineIcon className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-sm font-semibold text-navy leading-tight">
                                {peer.profile?.common_interests?.length || 0} Common Interest{(peer.profile?.common_interests?.length || 0) !== 1 ? "s" : ""}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {peer.profile?.common_interests && peer.profile.common_interests.length > 0
                                  ? (() => {
                                      const first3 = peer.profile.common_interests.slice(0, 3).join(", ");
                                      return peer.profile.common_interests.length > 3
                                        ? `${first3} +${peer.profile.common_interests.length - 3}`
                                        : first3;
                                    })()
                                  : "No shared interests yet"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <StarOutlineIcon className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                              <p className="text-sm font-semibold text-navy leading-tight">Recommended because</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {peer.common_circles_count >= 2
                                  ? `You both are in ${peer.common_circles_count} same circles`
                                  : (peer.profile?.common_interests?.length || 0) >= 1
                                  ? `You both are interested in ${peer.profile.common_interests[0]}`
                                  : peer.common_circles_count === 1 && peer.common_circles?.length > 0
                                  ? `You both are in ${peer.common_circles[0].name} circle`
                                  : "You share similar learning goals"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col items-stretch gap-2 w-36">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPeer(peer); }}
                            className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold text-navy hover:bg-gray-50 transition-colors"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toast.info("Coming soon!"); }}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            {getConnectLabel(peer)}
                          </button>
                          <button className="w-full flex items-center justify-center py-1.5 rounded-lg hover:bg-gray-50 transition-colors mt-1">
                            <Bookmark size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bottom pagination inside the box */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 px-6 py-3 border-t border-gray-200">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {renderPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={idx} className="px-2 text-sm text-textsecondary">...</span>
                      ) : (
                        <button
                          key={idx}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[32px] py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <PeopleIcon className="text-blue-500" size={28} />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">No Peers Found</h3>
                <p className="text-sm text-textsecondary mb-5 max-w-xs mx-auto">
                  Join circles to meet learners with similar interests.
                </p>
                <button
                  onClick={() => navigate("/circles")}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Circles
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Peer Details Modal */}
        {selectedPeer && (
          <PeerDetailsModal
            peer={selectedPeer}
            isOpen={!!selectedPeer}
            onClose={() => setSelectedPeer(null)}
            onSuccess={() => fetchPeers(searchQuery, currentPage)}
          />
        )}
      </div>
    </div>
  );
}
