import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Sparkles, CheckCircle2, Target, Code, Clock, AlertCircle, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axios";
import { PageHeader } from "../components/common/PageHeader";

const AIRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
    fetchLatestRoadmap();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get("auth/userprofile/");
      setUserProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchLatestRoadmap = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("ai/roadmap/latest/");
      setCurrentRoadmap(response.data);
      setErrorDetails(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setCurrentRoadmap(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmapHistory = async () => {
    try {
      const response = await axiosInstance.get("ai/roadmap/history/");
      setHistory(response.data.roadmaps || []);
      setShowHistory(true);
    } catch (error) {
      handleError(error, "Failed to fetch roadmap history");
    }
  };

  const handleError = (error, defaultMessage) => {
    const errorData = {
      message: error.response?.data?.error || error.response?.data?.message || defaultMessage,
      details: error.response?.data?.details || error.message,
      status: error.response?.status,
      timestamp: new Date().toLocaleString()
    };
    setErrorDetails(errorData);
    console.error("API Error:", errorData);
    toast.error(errorData.message);
  };

  const generateRoadmap = async () => {
    try {
      setGenerating(true);
      setErrorDetails(null);
      setShowLogs(true);

      // Validate profile
      if (!userProfile?.interests || !userProfile?.learning_goals) {
        const error = {
          message: "Please complete your profile (interests & learning goals) before generating a roadmap.",
          details: "Missing required profile fields",
          timestamp: new Date().toLocaleString()
        };
        setErrorDetails(error);
        toast.error(error.message);
        setGenerating(false);
        return;
      }

      const response = await axiosInstance.post("ai/roadmap/generate/", {});

      setCurrentRoadmap(response.data);
      toast.success("Roadmap generated successfully!");
      setShowLogs(false);
    } catch (error) {
      handleError(error, "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  const loadRoadmapFromHistory = (roadmap) => {
    setCurrentRoadmap(roadmap);
    setShowHistory(false);
    setErrorDetails(null);
    toast.success("Roadmap loaded");
  };

  const clearError = () => {
    setErrorDetails(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-royal animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader 
        title="AI Learning Roadmap"
        subtitle="Generate a personalized STEM learning pathway based on your goals and experience." 
      />

      {/* Profile Summary Card */}
      {userProfile && (
        <div className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-navy mb-4">Your Profile Summary</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-textsecondary mb-1">Role</p>
              <p className="font-semibold text-navy capitalize">{userProfile.role}</p>
            </div>
            <div>
              <p className="text-sm text-textsecondary mb-1">Experience Level</p>
              <p className="font-semibold text-navy capitalize">
                {userProfile.experience_level}
              </p>
            </div>
            <div>
              <p className="text-sm text-textsecondary mb-1">Domain</p>
              <p className="font-semibold text-navy">{userProfile.domain || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-textsecondary mb-1">Status</p>
              {userProfile.interests && userProfile.learning_goals ? (
                <p className="font-semibold text-green-600">Profile Complete</p>
              ) : (
                <p className="font-semibold text-amber-500">Incomplete — add interests &amp; goals</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-borderline space-y-3">
            <div>
              <p className="text-sm text-textsecondary mb-1">Interests</p>
              <div className="flex flex-wrap gap-2">
                {(userProfile.interests || "").split(",").filter(i => i.trim()).map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-softblue text-royal text-sm rounded-full"
                  >
                    {interest.trim()}
                  </span>
                ))}
                {!(userProfile.interests || "").trim() && (
                  <p className="text-textsecondary text-sm">No interests listed yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-textsecondary mb-1">Learning Goals</p>
              <p className="text-navy">{userProfile.learning_goals}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Roadmap Button */}
      <div className="text-center space-y-4">
        <button
          onClick={generateRoadmap}
          disabled={generating}
          className="px-8 py-4 bg-royal text-white text-lg font-semibold rounded-lg hover:bg-darkblue transition-all flex items-center gap-3 mx-auto disabled:opacity-70 shadow-lg shadow-royal/30"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI is creating your roadmap...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Roadmap
            </>
          )}
        </button>

        {errorDetails && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-royal hover:underline font-semibold text-sm flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              {showLogs ? "Hide Details" : "Show Error Details"}
            </button>
          </div>
        )}
      </div>

      {/* Error Details */}
      <AnimatePresence>
        {errorDetails && showLogs && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-soft"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-red-800">Error Occurred</h3>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
                <p className="text-red-800 font-semibold mb-2">{errorDetails.message}</p>
                {errorDetails.status && (
                  <p className="text-sm text-red-700 mb-2">Status Code: {errorDetails.status}</p>
                )}
                {errorDetails.timestamp && (
                  <p className="text-xs text-red-600 mb-3">{errorDetails.timestamp}</p>
                )}
                {errorDetails.details && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="text-sm font-bold text-red-800 mb-2">Details:</h4>
                    <p className="text-sm text-red-700 whitespace-pre-wrap font-mono">{errorDetails.details}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Roadmap */}
      {currentRoadmap && !errorDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Roadmap Title */}
          <div className="rounded-2xl border border-softblue bg-white bg-opacity-50 backdrop-blur-md p-8 shadow-soft">
            <h2 className="text-3xl font-bold text-navy">{currentRoadmap.roadmap_title}</h2>
            <p className="text-textsecondary mt-2">
              Created on {new Date(currentRoadmap.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Learning Phases */}
          {currentRoadmap.roadmap_content?.learning_phases && (
            <div className="rounded-2xl border border-borderline bg-white p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-royal" />
                Learning Phases
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {currentRoadmap.roadmap_content.learning_phases.map((phase, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-lg bg-gradient-to-br from-softblue to-blue-50 border border-softblue"
                  >
                    <h4 className="font-bold text-navy text-lg mb-2">{phase.phase}</h4>
                    <p className="text-textsecondary text-sm mb-3">{phase.description}</p>
                    <p className="text-royal font-semibold text-sm">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {phase.duration}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {currentRoadmap.roadmap_content?.milestones && (
            <div className="rounded-2xl border border-borderline bg-white p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Milestones
              </h3>
              <ul className="space-y-3">
                {currentRoadmap.roadmap_content.milestones.map((milestone, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-navy">{milestone}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Projects */}
          {currentRoadmap.roadmap_content?.suggested_projects && (
            <div className="rounded-2xl border border-borderline bg-white p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
                <Code className="w-6 h-6 text-royal" />
                Suggested Projects
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {currentRoadmap.roadmap_content.suggested_projects.map((project, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-lg border border-borderline bg-appbg hover:shadow-soft transition-all"
                  >
                    <h4 className="font-bold text-navy text-lg mb-2">{project.title}</h4>
                    <p className="text-textsecondary mb-4">{project.description}</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        project.difficulty === "Beginner"
                          ? "bg-green-100 text-green-700"
                          : project.difficulty === "Intermediate"
                          ? "bg-yellow-100 text-yellow-700"
                          : project.difficulty === "Advanced"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {project.difficulty}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Technologies */}
          {currentRoadmap.roadmap_content?.recommended_technologies && (
            <div className="rounded-2xl border border-borderline bg-white p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-600" />
                Recommended Technologies
              </h3>
              <div className="flex flex-wrap gap-3">
                {currentRoadmap.roadmap_content.recommended_technologies.map((tech, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm hover:shadow-soft transition-all cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Timeline */}
          {currentRoadmap.roadmap_content?.estimated_timeline && (
            <div className="rounded-2xl border border-borderline bg-white p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-navy mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-royal" />
                Estimated Timeline
              </h3>
              <p className="text-lg text-navy">{currentRoadmap.roadmap_content.estimated_timeline}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* No Roadmap Message */}
      {!currentRoadmap && !generating && !errorDetails && (
        <div className="rounded-2xl border border-borderline bg-appbg p-12 text-center">
          <Sparkles className="w-12 h-12 text-royal mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-navy mb-2">No Roadmap Generated Yet</h3>
          <p className="text-textsecondary">
            Click the button above to generate your personalized AI learning roadmap.
          </p>
        </div>
      )}

      {/* Roadmap History Button */}
      {!showHistory && !errorDetails && (
        <div className="text-center">
          <button
            onClick={fetchRoadmapHistory}
            className="text-royal hover:underline font-semibold"
          >
            View Roadmap History
          </button>
        </div>
      )}

      {/* Roadmap History */}
      {showHistory && (
        <div className="rounded-2xl border border-borderline bg-white p-8 shadow-soft">
          <h3 className="text-2xl font-bold text-navy mb-6">Previous Roadmaps</h3>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((roadmap) => (
                <motion.button
                  key={roadmap.id}
                  onClick={() => loadRoadmapFromHistory(roadmap)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full text-left p-4 rounded-lg border border-borderline hover:bg-appbg hover:border-royal transition-all"
                >
                  <p className="font-bold text-navy">{roadmap.roadmap_title}</p>
                  <p className="text-sm text-textsecondary">
                    {new Date(roadmap.created_at).toLocaleDateString()}
                  </p>
                </motion.button>
              ))}
            </div>
          ) : (
            <p className="text-textsecondary">No previous roadmaps found.</p>
          )}
          <button
            onClick={() => setShowHistory(false)}
            className="mt-4 text-royal hover:underline font-semibold text-sm"
          >
            Hide History
          </button>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
