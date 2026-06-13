import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  UserCheck,
  MessageSquare,
  BookOpen,
  Globe,
  Lock,
  MapPin,
  Calendar,
  Plus,
  X,
  User,
} from "lucide-react";
import { circleService } from "../services/circleService";
import { mentorService } from "../services/mentorService";
import { useAuth } from "../context/AuthContext";
import ResourcesTab from "../components/circle/ResourcesTab";
import { PeerDetailsModal } from "../components/peers/PeerDetailsModal";

const CircleDetail = () => {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [availableMentors, setAvailableMentors] = useState([]);
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const messagesEndRef = useRef(null);

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "mentors", label: "Mentors", icon: UserCheck },
    { id: "peers", label: "Peers", icon: Users },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: BookOpen },
  ];

  const fetchCircle = async () => {
    setLoading(true);
    try {
      const data = await circleService.getCircleDetail(circleId);
      console.log("CIRCLE DATA:", data);
      console.log("MENTORS LIST:", data.mentors_list);
      console.log("MEMBERS LIST:", data.members_list);
      console.log("PEERS LIST:", data.peers_list);
      setCircle(data);
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.error("Circle not found or deleted");
        navigate("/circles");
      } else {
        toast.error("Failed to load circle");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCircle = async () => {
    try {
      await circleService.deleteCircle(circleId);
      toast.success("Circle deleted successfully!");
      navigate("/circles");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete circle");
    }
  };

  const fetchAvailableMentors = async () => {
    try {
      const data = await mentorService.getMentors();
      setAvailableMentors(data.results || []);
    } catch (error) {
      toast.error("Failed to load mentors");
    }
  };

  const handleAddMentor = async (mentorId) => {
    try {
      const data = await circleService.addMentor(circleId, mentorId);
      setCircle(data.circle);
      setShowAddMentorModal(false);
      toast.success("Mentor added successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to add mentor");
    }
  };

  const handleRemoveMentor = async (mentorId) => {
    try {
      const data = await circleService.removeMentor(circleId, mentorId);
      setCircle(data.circle);
      toast.success("Mentor removed successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to remove mentor");
    }
  };

  const fetchDiscussions = async () => {
    try {
      const data = await circleService.getDiscussions(circleId, currentCategory);
      setDiscussions(data.discussions);
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSending(true);

    try {
      // Default to 'general' if category is empty string
      const category = currentCategory || 'general';
      const data = await circleService.createDiscussion(circleId, newMessage.trim(), category);
      setNewMessage('');
      setDiscussions(prev => [...prev, data.discussion]);
      toast.success("Message sent!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const isUserMentor = (user) => {
    return user?.profile?.role === 'mentor' || circle.mentors_list?.some(m => m.id === user.id);
  };

  const fetchPendingRequests = async () => {
    if (!circle || !circle.is_creator) return;
    try {
      const data = await circleService.getPendingRequests(circleId);
      setPendingRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch pending requests', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await circleService.approveJoinRequest(requestId);
      toast.success('Request approved!');
      fetchCircle();
      fetchPendingRequests();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await circleService.rejectJoinRequest(requestId);
      toast.success('Request rejected!');
      fetchPendingRequests();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to reject request');
    }
  };

  useEffect(() => {
    fetchCircle();
  }, [circleId]);

  useEffect(() => {
    if (circle && circle.is_creator) {
      fetchAvailableMentors();
      fetchPendingRequests();
    }
  }, [circle]);

  useEffect(() => {
    if (activeTab === "discussions") {
      fetchDiscussions();
      
      const interval = setInterval(() => {
        fetchDiscussions();
      }, 30000); // Poll every 30 seconds
      setPollingInterval(interval);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [activeTab, circleId, currentCategory]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discussions]);

  const handleJoinCircle = async () => {
    try {
      if (circle.is_private) {
        await circleService.requestJoinCircle(circleId);
        toast.success("Join request submitted!");
      } else {
        await circleService.joinCircle(circleId);
        toast.success("Successfully joined circle!");
      }
      fetchCircle();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to join");
    }
  };

  const handleLeaveCircle = async () => {
    try {
      await circleService.leaveCircle(circleId);
      toast.success("Left circle successfully");
      navigate("/circles");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to leave");
    }
  };

  const getDomainLabel = (value) => {
    const domains = {
      mathematics: "Mathematics",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology",
      computer_science: "Computer Science",
      engineering: "Engineering",
      data_science: "Data Science",
      robotics: "Robotics",
      astronomy: "Astronomy",
      other: "Other STEM",
    };
    return domains[value] || value;
  };

  const getSkillLabel = (value) => {
    const levels = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
    return levels[value] || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-textsecondary text-lg">Loading circle...</p>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-navy mb-2">Circle Not Found</h2>
        <button onClick={() => navigate("/circles")} className="text-royal font-semibold mt-4">
          Go back to Circles
        </button>
      </div>
    );
  }

  // Use backend-provided peers list
  const peers_list = circle.peers_list || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => navigate("/circles")} className="flex items-center gap-2 text-navy font-semibold hover:text-royal">
          <ArrowLeft size={20} />
          Back to Circles
        </button>
        <div className="flex items-center gap-3">
          {!circle.is_member && !circle.is_creator && !circle.is_mentor && !circle.pending_request ? (
            <button
              onClick={handleJoinCircle}
              disabled={circle.is_full}
              className="bg-royal text-white px-6 py-2 rounded-xl font-semibold hover:bg-darkblue transition-all disabled:opacity-50"
            >
              {circle.is_private ? "Request to Join" : "Join Circle"}
            </button>
          ) : null}
          {(circle.is_member || circle.is_mentor) && !circle.is_creator && (
            <button onClick={handleLeaveCircle} className="border border-borderline text-navy px-6 py-2 rounded-xl font-semibold hover:bg-appbg transition-all">
              Leave Circle
            </button>
          )}
          {circle.is_creator && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              Delete Circle
            </button>
          )}
          <div className="text-navy text-sm font-medium">
            {circle.is_creator && "Creator"}
            {circle.is_mentor && !circle.is_creator && "Mentor"}
            {circle.is_member && !circle.is_creator && !circle.is_mentor && "Member"}
            {circle.pending_request && "Request Pending"}
          </div>
        </div>
      </div>

      {/* Circle Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-softblue to-white p-8 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-navy">{circle.name}</h1>
              {circle.is_private ? <Lock size={24} className="text-navy" /> : <Globe size={24} className="text-navy" />}
              <span className="text-xs font-semibold text-white bg-royal px-3 py-1 rounded-full">Owner</span>
            </div>
            <p className="text-textsecondary text-lg max-w-2xl">{circle.description || "No description provided"}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-navy font-semibold shadow-soft">
                <BookOpen size={16} />
                {getDomainLabel(circle.domain)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-textsecondary font-semibold shadow-soft">
                {getSkillLabel(circle.skill_level)}
              </span>
              {circle.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-textsecondary font-semibold shadow-soft">
                  <MapPin size={16} />
                  {circle.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-textsecondary font-semibold shadow-soft">
                <Calendar size={16} />
                {new Date(circle.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-3xl font-bold text-navy">{circle.member_count}</div>
            <div className="text-textsecondary text-sm">Members</div>
            <div className="text-xl font-bold text-royal mt-4">{circle.mentor_count}</div>
            <div className="text-textsecondary text-sm">Mentors</div>
            <div className="text-xl font-bold text-green-600 mt-4">{circle.peer_count}</div>
            <div className="text-textsecondary text-sm">Peers</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border border-borderline bg-white shadow-soft">
        <div className="border-b border-borderline overflow-x-auto">
          <nav className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2
                    ${activeTab === tab.id ? "border-royal text-royal" : "border-transparent text-textsecondary hover:text-navy"}
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy">About This Circle</h2>
              <p className="text-textsecondary">{circle.description || "No description yet"}</p>
              
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-appbg p-6">
                  <h3 className="font-semibold text-navy mb-1">Total Members</h3>
                  <p className="text-3xl font-bold text-royal">{circle.member_count}</p>
                </div>
                <div className="rounded-2xl bg-appbg p-6">
                  <h3 className="font-semibold text-navy mb-1">Mentors</h3>
                  <p className="text-3xl font-bold text-darkblue">{circle.mentor_count}</p>
                </div>
                <div className="rounded-2xl bg-appbg p-6">
                  <h3 className="font-semibold text-navy mb-1">Peers</h3>
                  <p className="text-3xl font-bold text-green-600">{circle.peer_count}</p>
                </div>
                <div className="rounded-2xl bg-appbg p-6">
                  <h3 className="font-semibold text-navy mb-1">Maximum</h3>
                  <p className="text-3xl font-bold text-navy">{circle.max_members}</p>
                </div>
              </div>

              {circle.is_creator && pendingRequests.length > 0 && (
                <div className="rounded-2xl border border-borderline bg-white p-6">
                  <h2 className="text-2xl font-bold text-navy mb-4">Pending Join Requests</h2>
                  <div className="space-y-4">
                    {pendingRequests.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 rounded-xl border border-borderline">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-softblue flex items-center justify-center">
                            <User size={18} className="text-royal" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy">
                              {request.user?.first_name} {request.user?.last_name}
                            </p>
                            <p className="text-sm text-textsecondary">@{request.user?.username}</p>
                            <p className="text-xs text-textsecondary">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-all"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "mentors" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-navy">Mentors in this Circle</h2>
                {circle.is_creator && (
                  <button
                    onClick={() => setShowAddMentorModal(true)}
                    className="bg-royal text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-darkblue transition-all"
                  >
                    <Plus size={18} />
                    Add Mentor
                  </button>
                )}
              </div>

              {(() => {
                const filteredMentors = circle.mentors_list?.filter(mentor => mentor.id !== user?.id) || [];
                const isUserMentor = circle.mentors_list?.some(mentor => mentor.id === user?.id);

                return (
                  <>
                    {isUserMentor && (
                      <div className="rounded-xl bg-softblue p-4 text-navy font-medium">
                        You are a mentor in this circle
                      </div>
                    )}
                    {filteredMentors.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredMentors.map((mentor) => (
                          <div key={mentor.id} className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
                            <div className="w-14 h-14 rounded-full bg-softblue flex items-center justify-center mb-4">
                              <User size={24} className="text-royal" />
                            </div>
                            <h3 className="font-bold text-navy">
                              {mentor.first_name} {mentor.last_name}
                            </h3>
                            <p className="text-sm text-textsecondary">@{mentor.username}</p>
                            <p className="text-sm font-medium text-gray-600 mt-1">
                              Mentor{circle.creator?.id === mentor.id ? ' • Owner' : ''}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <button className="flex-1 bg-softblue text-royal rounded-xl px-4 py-2 font-semibold hover:bg-royal hover:text-white transition-all">
                                Request Guidance
                              </button>
                              {circle.is_creator && (
                                <button
                                  onClick={() => handleRemoveMentor(mentor.id)}
                                  className="bg-red-100 text-red-600 rounded-xl px-4 py-2 font-semibold hover:bg-red-200 transition-all"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !isUserMentor && (
                        <div className="text-center py-12 rounded-2xl bg-appbg md:col-span-2 lg:col-span-3">
                          <UserCheck className="w-12 h-12 mx-auto mb-4 text-textsecondary" />
                          <h3 className="font-semibold text-navy mb-2">No mentors yet</h3>
                          <p className="text-textsecondary">Be the first mentor to join!</p>
                        </div>
                      )
                    )}
                  </>
                );
              })()}

              {/* Add Mentor Modal */}
              {showAddMentorModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-navy">Add Mentor</h3>
                      <button
                        onClick={() => setShowAddMentorModal(false)}
                        className="text-textsecondary hover:text-navy"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableMentors.filter(m => !circle.mentors_list?.some(cm => cm.id === m.id)).length > 0 ? (
                        availableMentors.filter(m => !circle.mentors_list?.some(cm => cm.id === m.id)).map((mentor) => (
                          <div
                            key={mentor.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-borderline hover:bg-appbg transition-all cursor-pointer"
                            onClick={() => handleAddMentor(mentor.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-softblue flex items-center justify-center">
                                <User size={18} className="text-royal" />
                              </div>
                              <div>
                                <p className="font-semibold text-navy">
                                  {mentor.first_name} {mentor.last_name}
                                </p>
                                <p className="text-sm text-textsecondary">@{mentor.username}</p>
                              </div>
                            </div>
                            <Plus size={20} className="text-royal" />
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-textsecondary py-8">No available mentors to add</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "peers" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-navy">Fellow Learners</h2>
              {(() => {
                const filteredPeers = peers_list?.filter(peer => peer.id !== user?.id) || [];
                const isUserPeer = peers_list?.some(peer => peer.id === user?.id);

                return (
                  <>
                    {isUserPeer && (
                      <div className="rounded-xl bg-softblue p-4 text-navy font-medium">
                        You are a member of this circle
                      </div>
                    )}
                    {filteredPeers.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPeers.map((peer) => (
                          <div key={peer.id} className="rounded-2xl border border-borderline bg-white p-6 shadow-soft">
                            <div className="w-14 h-14 rounded-full bg-softblue flex items-center justify-center mb-4">
                              <User size={24} className="text-royal" />
                            </div>
                            <h3 className="font-bold text-navy">
                              {peer.first_name} {peer.last_name}
                            </h3>
                            <p className="text-sm text-textsecondary">@{peer.username}</p>
                            <p className="text-sm font-medium text-gray-600 mt-1">
                              Member{circle.creator?.id === peer.id ? ' • Owner' : ''}
                            </p>
                            <button onClick={() => setSelectedPeer(peer)} className="mt-4 w-full bg-appbg text-navy rounded-xl px-4 py-2 font-semibold hover:bg-softblue transition-all">
                              View Profile
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !isUserPeer && (
                        <div className="text-center py-12 rounded-2xl bg-appbg">
                          <Users className="w-12 h-12 mx-auto mb-4 text-textsecondary" />
                          <h3 className="font-semibold text-navy mb-2">No peers yet</h3>
                          <p className="text-textsecondary">Invite friends to join!</p>
                        </div>
                      )
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === "discussions" && (
            <div className="flex flex-col h-[60vh]">
              {/* Category Selector */}
              <div className="flex flex-wrap gap-2 mb-4 p-4 bg-appbg rounded-xl">
                {['', 'general', 'doubts', 'announcements', 'resources', 'projects'].map(category => (
                  <button
                    key={category}
                    onClick={() => setCurrentCategory(category)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      (currentCategory === category) 
                        ? 'bg-royal text-white' 
                        : 'bg-white text-navy border border-borderline hover:bg-softblue'
                    }`}
                  >
                    {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All'}
                  </button>
                ))}
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-xl border border-borderline">
                {discussions.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-textsecondary" />
                    <h3 className="font-semibold text-navy mb-2">No discussions yet</h3>
                    <p className="text-textsecondary">Start the conversation by sending a message!</p>
                  </div>
                ) : (
                  discussions.map(msg => (
                    <div
                      key={msg.id}
                      className="flex gap-3 items-start"
                    >
                      {/* Avatar placeholder */}
                      <div className="w-10 h-10 rounded-full bg-softblue flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-royal" />
                      </div>

                      {/* Message Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-navy">
                            {msg.user?.first_name} {msg.user?.last_name}
                          </span>
                          {isUserMentor(msg.user) && (
                            <span className="bg-softblue text-royal px-2 py-0.5 rounded-full text-xs font-bold">
                              Mentor
                            </span>
                          )}
                          <span className="text-textsecondary text-sm">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-appbg rounded-2xl px-4 py-3 text-navy">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message Input */}
              {(circle.is_member || circle.is_mentor || circle.is_creator) && (
                <div className="mt-4 p-4 bg-appbg rounded-xl">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 px-4 py-3 rounded-lg border border-borderline focus:outline-none focus:ring-2 focus:ring-royal"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                      className="bg-royal text-white px-6 py-3 rounded-lg font-semibold hover:bg-darkblue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === "resources" && (
            <ResourcesTab circle={circle} user={user} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-navy mb-4">Delete Circle?</h3>
            <p className="text-textsecondary mb-6">This will archive the circle. It will no longer be visible to members, and new join requests will not be accepted.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl font-semibold border border-borderline text-navy hover:bg-appbg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCircle}
                className="px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Peer Details Modal */}
      {selectedPeer && (
        <PeerDetailsModal
          peer={selectedPeer}
          isOpen={!!selectedPeer}
          onClose={() => setSelectedPeer(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default CircleDetail;
