import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight, BookOpen, UserCheck, Users,
  Sparkles, MessageSquare, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import Avatar from "../components/common/Avatar";
import ProfileDrawer from "../components/common/ProfileDrawer";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});
  const [stats, setStats] = useState({});
  const [peersStats, setPeersStats] = useState({});
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [sharedPeers, setSharedPeers] = useState([]);
  const [expandedActivity, setExpandedActivity] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Load dashboard core data first
        const [dashRes, statsRes, peersRes] = await Promise.all([
          api.get("dashboard/"),
          api.get("profile/stats/"),
          api.get("peers/?limit=3"),
        ]);
        setDashboard(dashRes.data || {});
        setStats(statsRes.data || {});

        // peers/ uses PeerSerializer which has correct common_circles_count
        const peersData = peersRes.data?.results ?? peersRes.data ?? [];
        setSharedPeers(Array.isArray(peersData) ? peersData.slice(0, 3) : []);

        // Load optional stats separately (don't fail whole dashboard)
        try {
          const peersStatsRes = await api.get("peers/stats/");
          setPeersStats(peersStatsRes.data || {});
        } catch (e) {
          console.log("Could not load peers stats", e);
          setPeersStats({});
        }

        // fetch AI roadmap count separately — don't block dashboard if it fails
        try {
          const aiRes = await api.get("ai/roadmap/history/");
          setRoadmapCount((aiRes.data?.roadmaps || []).length);
        } catch {
          setRoadmapCount(0);
        }
      } catch (error) {
        toast.error(error?.response?.data?.detail || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const joinedCircles = useMemo(() => dashboard.joined_circles || [], [dashboard]);
  const availableMentors = useMemo(() => dashboard.available_mentors || [], [dashboard]);
  const recentActivity = useMemo(() => dashboard.recent_activity || [], [dashboard]);

  const visibleActivities = useMemo(() => recentActivity.slice(0, 4), [recentActivity]);
  const hasMoreActivities = useMemo(() => recentActivity.length > 4, [recentActivity]);
  const allActivities = useMemo(
    () => (expandedActivity ? recentActivity : visibleActivities),
    [expandedActivity, recentActivity, visibleActivities]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-softblue border-t-royal rounded-full animate-spin" />
          <p className="text-textsecondary font-medium">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8">

      {/* 1. Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy">
          Welcome back, {user?.first_name || user?.username}! 👋
        </h1>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen size={22} />}
          label="My Circles"
          value={joinedCircles.length}
        />
        <StatCard
          icon={<UserCheck size={22} />}
          label="Mentors"
          value={stats.mentor_circles ?? availableMentors.length}
        />
        <StatCard
          icon={<Users size={22} />}
          label="Peers"
          value={peersStats.total_peers ?? sharedPeers.length}
        />
        <StatCard
          icon={<Sparkles size={22} />}
          label="AI Roadmaps"
          value={roadmapCount}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* 3. My Circles */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-bold text-navy">My Circles</h3>
              <Link to="/circles" className="text-sm font-bold text-royal hover:text-darkblue transition-colors">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {joinedCircles.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-borderline p-8 text-center text-textsecondary">
                  You haven't joined any circles yet.{" "}
                  <Link to="/circles" className="text-royal font-semibold">Browse circles</Link> to get started.
                </div>
              ) : (
                joinedCircles.slice(0, 4).map((circle) => (
                  <Link key={circle.id} to={`/circles/${circle.id}`}>
                    <div className="rounded-2xl border border-borderline bg-white p-6 shadow-sm hover:shadow-md hover:border-royal transition-all h-full">
                      <h4 className="text-lg font-bold text-navy mb-3">{circle.name}</h4>
                      <p className="text-sm text-textsecondary mb-4 line-clamp-2">{circle.description}</p>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1 text-textsecondary">
                          <Users size={16} />
                          <span>{circle.members_count} members</span>
                        </div>
                        <div className="flex items-center gap-1 text-textsecondary">
                          <MessageSquare size={16} />
                          <span>{circle.discussion_count} discussions</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* 4. Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-bold text-navy">Recent Activity</h3>
            </div>
            <div className="bg-white rounded-2xl border border-borderline p-6 shadow-sm space-y-4">
              {allActivities.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {allActivities.map((activity, idx) => (
                      <div key={activity.id || idx} className="flex gap-4 pb-4 border-b border-borderline last:border-b-0">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-softblue flex items-center justify-center">
                            <MessageSquare size={18} className="text-royal" />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-navy font-medium">{activity.description}</p>
                          <p className="text-xs text-textsecondary mt-1">
                            {activity.created_at && new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hasMoreActivities && (
                    <button
                      onClick={() => setExpandedActivity(!expandedActivity)}
                      className="w-full py-3 flex items-center justify-center gap-2 text-royal font-semibold hover:bg-softblue transition-all rounded-xl"
                    >
                      {expandedActivity ? (
                        <><ChevronUp size={18} />Collapse</>
                      ) : (
                        <><ChevronDown size={18} />Show More ({recentActivity.length - 4} more)</>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-textsecondary">
                  No recent activity to show yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Sidebar (1/3) ── */}
        <div className="space-y-8">

          {/* Mentors */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-bold text-navy">Available Mentors</h3>
            </div>
            <div className="space-y-3">
              {availableMentors.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {availableMentors.slice(0, 3).map((mentor) => (
                      <div key={mentor.id} className="rounded-2xl border border-borderline bg-white p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                        <Avatar user={mentor} size="w-12 h-12" />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-navy text-sm truncate">
                            {mentor.first_name} {mentor.last_name}
                          </h4>
                          <p className="text-xs text-textsecondary mt-0.5 truncate">
                            {mentor.profile?.mentorship_expertise || mentor.profile?.current_role || "Mentor"}
                          </p>
                          {mentor.profile?.years_of_experience && (
                            <p className="text-xs text-royal font-semibold mt-0.5">
                              {mentor.profile.years_of_experience} yrs exp
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/profile/${mentor.id}`}
                          className="shrink-0 text-textsecondary hover:text-royal transition-colors"
                          title="View Profile"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/mentors"
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-borderline text-royal font-semibold hover:bg-softblue transition-all text-sm"
                  >
                    Explore more mentors
                    <ArrowRight size={15} />
                  </Link>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-borderline p-6 text-center text-textsecondary text-sm">
                  No mentors available yet.{" "}
                  <Link to="/mentors" className="text-royal font-semibold">Browse mentors</Link>.
                </div>
              )}
            </div>
          </section>

          {/* Peers */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-bold text-navy">Shared Peers</h3>
            </div>
            <div className="space-y-4">
              {sharedPeers.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {sharedPeers.slice(0, 3).map((peer) => (
                      <Link key={peer.id} to={`/profile/${peer.id}`}>
                        <div className="rounded-2xl border border-borderline bg-white p-4 shadow-sm hover:shadow-md hover:border-royal transition-all flex items-center gap-4">
                          <Avatar user={peer} size="w-12 h-12" />
                          <div className="flex-grow min-w-0">
                            <h4 className="font-semibold text-navy text-sm truncate">
                              {peer.first_name} {peer.last_name}
                            </h4>
                            <p className="text-xs text-textsecondary mt-0.5">
                              {peer.common_circles_count ?? 0} shared circle{(peer.common_circles_count ?? 0) !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/peers"
                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-borderline text-royal font-semibold hover:bg-softblue transition-all text-sm"
                  >
                    Explore more peers
                    <ArrowRight size={15} />
                  </Link>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-borderline p-6 text-center text-textsecondary text-sm">
                  No shared peers found yet.{" "}
                  <Link to="/peers" className="text-royal font-semibold">Find peers</Link> to collaborate.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
