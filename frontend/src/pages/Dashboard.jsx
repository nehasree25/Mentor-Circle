import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, BookOpen, UserCheck, Sparkles } from "lucide-react";

const normalize = (value) => (Array.isArray(value) ? value : value?.results || []);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("dashboard/");
        setDashboard(data || {});
      } catch (error) {
        toast.error(error?.response?.data?.detail || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sections = useMemo(() => {
    return {
      circles: normalize(dashboard.joined_circles),
      sessions: normalize(dashboard.mentor_sessions),
      recommendations: normalize(dashboard.recommendations),
      progress: normalize(dashboard.learning_progress),
      discussions: normalize(dashboard.discussion_activity),
    };
  }, [dashboard]);

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-softblue to-white p-8 md:p-12 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-darkblue mb-2">
              Welcome back
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-navy">
              {user?.first_name} {user?.last_name || ""}
            </h1>
            <p className="text-textsecondary mt-3 text-lg">
              Continue your learning journey today!
            </p>
          </div>
          <Link
            to="/circles"
            className="inline-flex items-center gap-2 rounded-xl bg-royal px-6 py-3 font-semibold text-white hover:bg-darkblue transition-all"
          >
            Browse Circles
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-borderline bg-white p-8 shadow-soft">
          Loading dashboard...
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Your Circles Card */}
          <section className="rounded-3xl border border-borderline bg-white p-7 shadow-soft hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-softblue rounded-xl flex items-center justify-center">
                  <BookOpen className="text-royal w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-navy">Your Circles</h2>
              </div>
              <Link
                to="/circles"
                className="text-sm font-semibold text-royal hover:text-darkblue"
              >
                Find circles
              </Link>
            </div>
            {sections.circles.length === 0 ? (
              <div className="rounded-2xl bg-appbg p-5 text-sm text-textsecondary">
                No circles joined yet
              </div>
            ) : (
              <ul className="space-y-3">
                {sections.circles.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="rounded-2xl bg-appbg p-4 border border-borderline"
                  >
                    {item.title || item.name || item.description || "Untitled item"}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Mentor Sessions Card */}
          <section className="rounded-3xl border border-borderline bg-white p-7 shadow-soft hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-softblue rounded-xl flex items-center justify-center">
                  <UserCheck className="text-royal w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-navy">Mentor Sessions</h2>
              </div>
              <Link
                to="/mentors"
                className="text-sm font-semibold text-royal hover:text-darkblue"
              >
                Find mentors
              </Link>
            </div>
            {sections.sessions.length === 0 ? (
              <div className="rounded-2xl bg-appbg p-5 text-sm text-textsecondary">
                No sessions scheduled
              </div>
            ) : (
              <ul className="space-y-3">
                {sections.sessions.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="rounded-2xl bg-appbg p-4 border border-borderline"
                  >
                    {item.title || item.name || item.description || "Untitled item"}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* AI Recommendations Card */}
          <section className="rounded-3xl border border-borderline bg-white p-7 shadow-soft hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-softblue rounded-xl flex items-center justify-center">
                  <Sparkles className="text-royal w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-navy">AI Recommendations</h2>
              </div>
              <Link
                to="/ai"
                className="text-sm font-semibold text-royal hover:text-darkblue"
              >
                See all
              </Link>
            </div>
            {sections.recommendations.length === 0 ? (
              <div className="rounded-2xl bg-appbg p-5 text-sm text-textsecondary">
                No recommendations yet
              </div>
            ) : (
              <ul className="space-y-3">
                {sections.recommendations.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="rounded-2xl bg-appbg p-4 border border-borderline"
                  >
                    {item.title || item.name || item.description || "Untitled item"}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Learning Progress Card */}
          <section className="rounded-3xl border border-borderline bg-white p-7 shadow-soft hover:shadow-lg transition-shadow lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-softblue rounded-xl flex items-center justify-center">
                  <BookOpen className="text-royal w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-navy">Learning Progress</h2>
              </div>
              <Link
                to="/profile"
                className="text-sm font-semibold text-royal hover:text-darkblue"
              >
                Go to profile
              </Link>
            </div>
            {sections.progress.length === 0 ? (
              <div className="rounded-2xl bg-appbg p-5 text-sm text-textsecondary">
                Start learning to track progress
              </div>
            ) : (
              <ul className="space-y-3">
                {sections.progress.map((item, idx) => (
                  <li
                    key={item.id || idx}
                    className="rounded-2xl bg-appbg p-4 border border-borderline"
                  >
                    {item.title || item.name || item.description || "Untitled item"}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
