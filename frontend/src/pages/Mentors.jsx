import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { mentorService } from "../services/mentorService";
import { User, Sparkles, Briefcase, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import Pagination from "../components/common/Pagination";

const normalize = (data) => (Array.isArray(data) ? data : data?.results || []);

const Mentors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMentors = async (params = {}) => {
    setLoading(true);
    try {
      const data = await mentorService.getMentors({ ...params, page: currentPage });
      setMentors(normalize(data));
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 20));
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to load mentors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [currentPage]);

  const onFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMentors({ search, expertise });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-navy">Discover Mentors</h1>
        <p className="text-textsecondary text-lg">
          Connect with mentors aligned to your learning journey.
        </p>
      </div>

      {/* Filters */}
      <form
        onSubmit={onFilter}
        className="rounded-3xl border border-borderline bg-white p-6 shadow-soft"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-borderline p-4 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            className="rounded-xl border border-borderline p-4 focus:border-royal focus:ring-2 focus:ring-softblue outline-none"
            placeholder="Filter by expertise"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          />
          <button className="rounded-xl bg-royal p-4 font-semibold text-white hover:bg-darkblue transition-all">
            Apply Filters
          </button>
        </div>
      </form>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="rounded-3xl border border-borderline bg-white p-8 shadow-soft md:col-span-3">
            Loading mentors...
          </div>
        )}
        {!loading && mentors.length === 0 && (
          <div className="rounded-3xl border border-borderline bg-white p-10 shadow-soft text-center md:col-span-3">
            <h3 className="text-xl font-semibold text-navy">
              No mentors are available yet
            </h3>
          </div>
        )}
        {!loading &&
          mentors.map((mentor) => {
            const isCurrentUser = user && mentor.id === user.id;
            return (
              <motion.article
                whileHover={{ y: -4 }}
                key={mentor.id}
                className="rounded-3xl border border-borderline bg-white p-7 shadow-soft hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-5">
                  <Avatar user={mentor} size="w-14 h-14" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-navy">
                      {mentor.first_name} {mentor.last_name || ""}
                    </h3>
                    <p className="text-sm text-textsecondary">
                      @{mentor.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {mentor.profile?.mentorship_expertise && (
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-royal w-5 h-5 mt-0.5 shrink-0" />
                      <p className="text-sm text-textsecondary">
                        <span className="font-medium text-navy">Mentor Expertise:</span>{" "}
                        {mentor.profile.mentorship_expertise}
                      </p>
                    </div>
                  )}
                  {mentor.profile?.skills && (
                    <div className="flex items-start gap-3">
                      <BookOpen className="text-royal w-5 h-5 mt-0.5 shrink-0" />
                      <p className="text-sm text-textsecondary">
                        <span className="font-medium text-navy">Skills:</span>{" "}
                        {mentor.profile.skills}
                      </p>
                    </div>
                  )}
                  {mentor.profile?.years_of_experience !== undefined && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="text-royal w-5 h-5 mt-0.5 shrink-0" />
                      <p className="text-sm text-textsecondary">
                        <span className="font-medium text-navy">Skill Experience:</span>{" "}
                        {mentor.profile.years_of_experience} years
                      </p>
                    </div>
                  )}
                  {mentor.profile?.bio && (
                    <p className="text-sm text-textsecondary mt-4 pt-4 border-t border-borderline">
                      {mentor.profile.bio}
                    </p>
                  )}
                </div>

                {isCurrentUser ? (
                  <button
                    onClick={() => navigate("/profile")}
                    className="mt-4 w-full rounded-xl bg-appbg px-4 py-3 text-sm font-semibold text-navy text-center hover:bg-softblue transition-all"
                  >
                    Your Profile
                  </button>
                ) : (
                  <button
                    onClick={() => toast("Connection requests coming soon!")}
                    className="mt-4 w-full rounded-xl bg-royal px-4 py-3 text-sm font-semibold text-white hover:bg-darkblue transition-all"
                  >
                    Request Guidance
                  </button>
                )}
              </motion.article>
            );
          })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />
    </div>
  );
};

export default Mentors;
