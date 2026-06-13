import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MessageSquare, Users, BookOpen } from "lucide-react";
import { mentorshipService } from "../services/mentorshipService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";

const Conversations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [guidanceConversations, setGuidanceConversations] = useState([]);
  const [collaborationConversations, setCollaborationConversations] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Fetch guidance requests (mentorship)
      const guidanceData = await mentorshipService.getMyGuidanceRequests({ status: 'accepted' });
      const guidanceRequests = Array.isArray(guidanceData) ? guidanceData : guidanceData.results || [];
      
      // Fetch collaboration requests (peer)
      const collaborationData = await mentorshipService.getMyCollaborationRequests({ status: 'accepted' });
      const collaborationRequests = Array.isArray(collaborationData) ? collaborationData : collaborationData.results || [];

      // Fetch conversations
      const conversationsData = await mentorshipService.getMyConversations();
      const conversations = Array.isArray(conversationsData) ? conversationsData : conversationsData.results || [];

      // Map guidance requests to conversations
      const guidanceConvos = guidanceRequests
        .filter(req => req.conversation)
        .map(req => ({
          id: req.conversation.id,
          type: 'guidance',
          participantName: req.mentor.first_name + ' ' + req.mentor.last_name,
          participantAvatar: req.mentor,
          circleName: req.circle.name,
          topic: req.subject,
          lastMessage: req.conversation.last_message || 'No messages yet',
          lastActivityDate: req.conversation.updated_at || req.updated_at,
          conversation: req.conversation,
        }));

      // Map collaboration requests to conversations
      const collabConvos = collaborationRequests
        .filter(req => req.conversation)
        .map(req => ({
          id: req.conversation.id,
          type: 'collaboration',
          participantName: req.receiver.first_name + ' ' + req.receiver.last_name,
          participantAvatar: req.receiver,
          circleName: req.circle.name,
          topic: req.project_topic,
          lastMessage: req.conversation.last_message || 'No messages yet',
          lastActivityDate: req.conversation.updated_at || req.updated_at,
          conversation: req.conversation,
        }));

      setGuidanceConversations(guidanceConvos);
      setCollaborationConversations(collabConvos);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = (conversationId) => {
    navigate(`/conversations/${conversationId}`);
  };

  const ConversationCard = ({ conversation }) => {
    const formattedDate = new Date(conversation.lastActivityDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        onClick={() => handleOpenConversation(conversation.id)}
        className="bg-white rounded-2xl border border-borderline shadow-soft hover:shadow-md transition-all duration-200 p-5 cursor-pointer group"
      >
        {/* Header with avatar and name */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar user={conversation.participantAvatar} size="w-12 h-12" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-navy truncate group-hover:text-royal transition-colors">
              {conversation.participantName}
            </h3>
            <p className="text-xs text-textsecondary truncate">
              {conversation.circleName}
            </p>
          </div>
        </div>

        {/* Topic */}
        <div className="mb-3">
          <p className="text-sm font-semibold text-navy mb-1">
            {conversation.type === 'guidance' ? 'Subject' : 'Project Topic'}
          </p>
          <p className="text-sm text-textsecondary truncate">
            {conversation.topic}
          </p>
        </div>

        {/* Last message preview */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-navy mb-1">Last Message</p>
          <p className="text-xs text-textsecondary line-clamp-2">
            {conversation.lastMessage}
          </p>
        </div>

        {/* Last activity date */}
        <div className="pt-3 border-t border-borderline">
          <p className="text-xs text-textsecondary">
            {formattedDate}
          </p>
        </div>
      </div>
    );
  };

  const EmptyState = ({ title }) => (
    <div className="text-center py-16 rounded-2xl bg-appbg">
      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-7 h-7 text-textsecondary" />
      </div>
      <h3 className="font-semibold text-navy mb-2">No active {title.toLowerCase()} yet</h3>
      <p className="text-sm text-textsecondary">
        {title === 'mentorship discussions'
          ? 'Accept a guidance request to start mentorship.'
          : 'Accept a collaboration request to start collaborating.'}
      </p>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6">
        <h1 className="text-3xl font-bold text-navy mb-1">Conversations</h1>
        <p className="text-gray-500 text-sm max-w-2xl">
          Access your active mentorship discussions and peer collaborations in one place.
        </p>
      </div>

      {/* Two-Panel Layout */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Panel - Mentor Guidance */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-softblue flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-royal" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy">Mentor Guidance</h2>
                <p className="text-xs text-textsecondary">Active mentorship discussions</p>
              </div>
            </div>

            {guidanceConversations.length > 0 ? (
              <div className="space-y-4">
                {guidanceConversations.map(conversation => (
                  <ConversationCard key={conversation.id} conversation={conversation} />
                ))}
              </div>
            ) : (
              <EmptyState title="mentorship discussions" />
            )}
          </div>

          {/* Right Panel - Peer Collaborations */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy">Peer Collaborations</h2>
                <p className="text-xs text-textsecondary">Active collaboration discussions</p>
              </div>
            </div>

            {collaborationConversations.length > 0 ? (
              <div className="space-y-4">
                {collaborationConversations.map(conversation => (
                  <ConversationCard key={conversation.id} conversation={conversation} />
                ))}
              </div>
            ) : (
              <EmptyState title="collaborations" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
