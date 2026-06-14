import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MapPin,
  BookOpen,
  Plus,
  Search,
  Filter,
  X,
  Lock,
  Globe,
} from "lucide-react";
import { circleService } from "../services/circleService";
import CreateCircleModal from "../components/CreateCircleModal";
import Pagination from "../components/common/Pagination";
import { PageHeader } from "../components/common/PageHeader";

const Circles = () => {
  const navigate = useNavigate();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [isPrivate, setIsPrivate] = useState("");

  const domainOptions = [
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "computer_science", label: "Computer Science" },
    { value: "engineering", label: "Engineering" },
    { value: "data_science", label: "Data Science" },
    { value: "robotics", label: "Robotics" },
    { value: "astronomy", label: "Astronomy" },
    { value: "other", label: "Other STEM" },
  ];

  const skillLevelOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const fetchCircles = async (params = {}) => {
    setLoading(true);
    try {
      const data = await circleService.searchCircles({
        ...params,
        page: currentPage
      });
      setCircles(data.results || data);
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 20)); // 20 per page as default
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to load circles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, [currentPage]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    const params = {};
    if (search) params.search = search;
    if (domain) params.domain = domain;
    if (skillLevel) params.skill_level = skillLevel;
    fetchCircles(params);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDomain("");
    setSkillLevel("");
    setIsPrivate("");
    fetchCircles();
  };

  const handleJoinCircle = async (circleId, isPrivate) => {
    try {
      if (isPrivate) {
        await circleService.requestJoinCircle(circleId);
        toast.success("Join request submitted! Awaiting approval");
      } else {
        await circleService.joinCircle(circleId);
        toast.success("Successfully joined circle!");
      }
      fetchCircles();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to join circle");
    }
  };

  const handleCircleCreated = () => {
    setShowCreateModal(false);
    fetchCircles();
  };

  const getDomainLabel = (value) => domainOptions.find(d => d.value === value)?.label || value;
  const getSkillLabel = (value) => skillLevelOptions.find(s => s.value === value)?.label || value;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="Learning Circles" 
        subtitle="Join collaborative STEM learning communities"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all shadow-soft"
          >
            <Plus size={20} />
            Create Circle
          </button>
        }
      />

      {/* Filters */}
      <div className="rounded-3xl border border-borderline bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-navy font-semibold">
            <Filter size={20} />
            <span>Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-sm text-textsecondary hover:text-royal"
          >
            Reset
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-textsecondary">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textsecondary" size={18} />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-borderline focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
                placeholder="Search circles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-textsecondary">STEM Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-borderline focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white"
            >
              <option value="">All Domains</option>
              {domainOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-textsecondary">Skill Level</label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-borderline focus:border-royal focus:ring-2 focus:ring-softblue outline-none bg-white"
            >
              <option value="">All Levels</option>
              {skillLevelOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:pt-6">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Circles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-borderline bg-white p-10 shadow-soft text-center">
            <p className="text-textsecondary text-lg">Loading circles...</p>
          </div>
        )}

        {!loading && circles.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-borderline bg-white p-10 shadow-soft text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-textsecondary" />
            <h3 className="text-xl font-semibold text-navy mb-2">No circles found</h3>
            <p className="text-textsecondary mb-6">
              Create the first learning circle!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all"
            >
              Create Circle
            </button>
          </div>
        )}

        {!loading && circles.map((circle) => (
          <motion.div
            key={circle.id}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-borderline bg-white p-6 shadow-soft hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-navy truncate">{circle.name}</h3>
                  {circle.is_private ? (
                    <Lock size={16} className="text-textsecondary" />
                  ) : (
                    <Globe size={16} className="text-textsecondary" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-softblue px-3 py-1 text-xs font-semibold text-royal">
                    <BookOpen size={12} />
                    {getDomainLabel(circle.domain)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-appbg px-3 py-1 text-xs font-semibold text-textsecondary">
                    {getSkillLabel(circle.skill_level)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-textsecondary text-sm mb-4 line-clamp-3">
              {circle.description || "No description provided"}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
              {circle.location && (
                <div className="flex items-center gap-1 text-textsecondary">
                  <MapPin size={14} />
                  <span>{circle.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-textsecondary">
                <Users size={14} />
                <span>
                  {circle.member_count} members · {circle.mentor_count} mentors
                </span>
              </div>
              {circle.is_full && (
                <span className="text-orange-600 text-xs font-semibold">Full</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/circles/${circle.id}`)}
                className="rounded-xl border border-borderline px-4 py-2 text-sm font-semibold text-navy hover:bg-appbg transition-all whitespace-nowrap"
              >
                View Details
              </button>
              {!circle.is_member && !circle.is_creator && !circle.is_mentor && !circle.pending_request ? (
                <button
                  onClick={() => handleJoinCircle(circle.id, circle.is_private)}
                  disabled={circle.is_full}
                  className="rounded-xl bg-royal px-4 py-2 text-sm font-semibold text-white hover:bg-darkblue transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {circle.is_private ? "Request to Join" : "Join Circle"}
                </button>
              ) : (
                <span className="px-4 py-2 text-sm font-semibold text-navy">
                  {circle.is_creator && "Creator"}
                  {circle.is_mentor && !circle.is_creator && "Mentor"}
                  {circle.is_member && !circle.is_creator && !circle.is_mentor && "Member"}
                  {circle.pending_request && "Pending"}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Create Circle Modal */}
      {showCreateModal && (
        <CreateCircleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCircleCreated}
        />
      )}
    </div>
  );
};

export default Circles;
