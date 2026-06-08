import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight, BookOpen, UserCheck, Users,
  Trophy, MessageSquare, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import ProgressPanel from "../components/dashboard/ProgressPanel";
import Avatar from "../components/common/Avatar";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});
  const [stats, setStats] = useState({});
  const [expandedActivity, setExpandedActivity] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, statsRes] = await Promise.all([
          api.get("dashboard/"),
          api.get("profile/stats/")
        ]);
        setDashboard(dashRes.data || {});
        setStats(statsRes.data || {});
      } catch (error) {
        toast.error(error?.response?.data?.detail || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const joinedCircles = useMemo(() => {
    return dashboard.joined_circles || [];
  }, [dashboard]);

  const availableMentors = useMemo(() => {
    return dashboard.available_mentors || [];
  }, [dashboard]);

  const sharedPeers = useMemo(() => {
    return dashboard.shared_peers || [];
  }, [dashboard]);

  const recentActivity = useMemo(() => {
    return dashboard.recent_activity || [];
  }, [dashboard]);

  const visibleActivities = useMemo(() => {
    return recentActivity.slice(0, 4);
  }, [recentActivity]);

  const hasMoreActivities = useMemo(() => {
    return recentActivity.length > 4;
  }, [recentActivity]);

  const allActivities = useMemo(() => {
    return expandedActivity ? recentActivity : visibleActivities;
  }, [expandedActivity, recentActivity, visibleActivities]);

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
      {/* 1. Welcome Section */}
      <div className="rounded-3xl bg-gradient-to-r from-softblue to-white p-6 md:p-10 shadow-sm border border-borderline flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-darkblue opacity-80">
            Welcome back, {user?.first_name}! 👋
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-navy">
            Ready to excel today?
          </h1>
          <p className="text-textsecondary max-w-md">
            Continue your learning journey, connect with mentors, and grow with your peers.
          </p>
        </div>
        <Link
          to="/circles"
          className="inline-flex items-center gap-2 rounded-2xl bg-royal px-6 py-3 font-semibold text-white hover:bg-darkblue transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          Browse Circles
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* 2. Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen size={22} />}
          label="Active Circles"
          value={stats.joined_circles || joinedCircles.length}
        />
        <StatCard
          icon={<UserCheck size={22} />}
          label="Mentor Circles"
          value={stats.mentor_circles || 0}
        />
        <StatCard
          icon={<Users size={22} />}
          label="Shared Peers"
          value={stats.peer_collaborations || sharedPeers.length}
        />
        <StatCard
          icon={<Trophy size={22} />}
          label="Completion"
          value="0%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">

          {/* 3. My Circles Section */}
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
                  You haven't joined any circles yet. <Link to="/circles" className="text-royal font-semibold">Browse circles</Link> to get started.
                </div>
              ) : (
                joinedCircles.map((circle) => (
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

          {/* 5. Available Mentors Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-bold text-navy">Available Mentors</h3>
            </div>
            <div className="space-y-4">
              {availableMentors.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {availableMentors.map(mentor => (
                      <div key={mentor.id} className="rounded-2xl border border-borderline bg-white p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <Avatar user={mentor} size="w-16 h-16" />
                          <div>
                            <h4 className="font-bold text-navy">{mentor.first_name} {mentor.last_name}</h4>
                            <p className="text-xs text-textsecondary">{mentor.profile?.mentorship_expertise || "Mentor"}</p>
                            {mentor.profile?.years_of_experience && (
                              <p className="text-xs text-royal font-semibold mt-1">{mentor.profile.years_of_experience} years exp</p>
                            )}
                          </div>
                          <Link
                            to={`/profile/${mentor.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-royal hover:text-darkblue transition-colors"
                          >
                            View Profile
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {availableMentors.length > 0 && (
                    <Link
                      to="/mentors"
                      className="block text-center py-4 rounded-2xl border border-borderline text-royal font-semibold hover:bg-softblue transition-all"
                    >
                      Explore More Mentors
                    </Link>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-borderline p-8 text-center text-textsecondary">
                  No mentors available yet. <Link to="/mentors" className="text-royal font-semibold">Browse mentors</Link> to find guidance.
                </div>
              )}
            </div>
          </section>

          {/* 7. Recent Activity Section */}
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
                        <>
                          <ChevronUp size={18} />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown size={18} />
                          Show More ({recentActivity.length - 4} more)
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-textsecondary">
                  No recent activity to show.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-8">
          {/* 4. Learning Progress Section */}
          <ProgressPanel data={null} />

          {/* 6. Shared Peers Section */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-bold text-navy">Shared Peers</h3>
            </div>
            <div className="space-y-3">
              {sharedPeers.length > 0 ? (
                <>
                  {sharedPeers.map(peer => (
                    <Link key={peer.id} to={`/profile/${peer.id}`}>
                      <div className="rounded-xl border border-borderline bg-white p-4 shadow-sm hover:shadow-md hover:border-royal transition-all flex items-center gap-3">
                        <Avatar user={peer} size="w-12 h-12" />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-navy text-sm truncate">{peer.first_name} {peer.last_name}</h4>
                          <p className="text-xs text-textsecondary">{peer.profile?.shared_circles_count || 0} shared circles</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {sharedPeers.length > 0 && (
                    <Link
                      to="/peers"
                      className="block text-center py-3 rounded-xl border border-borderline text-royal font-semibold hover:bg-softblue transition-all text-sm"
                    >
                      Explore More Peers
                    </Link>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-borderline p-6 text-center text-textsecondary text-sm">
                  No shared peers found. <Link to="/peers" className="text-royal font-semibold">Find peers</Link> to collaborate.
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
