import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Send, User } from "lucide-react";
import { mentorshipService } from "../services/mentorshipService";
import { useAuth } from "../context/AuthContext";

const Discussion = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    setLoading(true);
    try {
      const convoData = await mentorshipService.getConversation(conversationId);
      setConversation(convoData);

      const messagesData = await mentorshipService.getMessages(conversationId);
      const msgArray = Array.isArray(messagesData) ? messagesData : messagesData.results || [];
      setMessages(msgArray);
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      toast.error("Failed to load conversation");
      navigate("/conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await mentorshipService.sendMessage(conversationId, newMessage);
      setMessages([...messages, response.message]);
      setNewMessage("");
      toast.success("Message sent");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-textsecondary">Loading discussion...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-navy mb-2">Conversation Not Found</h2>
        <button
          onClick={() => navigate("/conversations")}
          className="text-royal font-semibold mt-4"
        >
          Back to Conversations
        </button>
      </div>
    );
  }

  // Get other participant
  const otherParticipant = conversation.participants?.find(p => p.id !== user?.id);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl border border-borderline shadow-soft">
      {/* Header */}
      <div className="border-b border-borderline p-6 flex items-start justify-between">
        <button
          onClick={() => navigate("/conversations")}
          className="flex items-center gap-2 text-navy hover:text-royal transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="flex-1 ml-4">
          <div className="flex items-center gap-3 mb-3">
            {otherParticipant && (
              <div className="w-10 h-10 rounded-full bg-softblue flex items-center justify-center">
                <User size={18} className="text-royal" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-navy">
                {otherParticipant?.first_name} {otherParticipant?.last_name}
              </h2>
              <p className="text-sm text-textsecondary">@{otherParticipant?.username}</p>
            </div>
          </div>

          {/* Conversation Info */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs font-semibold text-navy">Circle</p>
              <p className="text-sm text-textsecondary">{conversation.circle?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-navy">Type</p>
              <p className="text-sm text-textsecondary capitalize">
                {conversation.conversation_type === 'guidance' ? 'Mentorship' : 'Collaboration'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-navy">Topic</p>
              <p className="text-sm text-textsecondary truncate">
                {conversation.guidance_request?.subject || conversation.collaboration_request?.project_topic || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-textsecondary">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender.id === user?.id ? "flex-row-reverse" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-softblue flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-royal" />
              </div>
              <div
                className={`flex-1 max-w-md ${
                  msg.sender.id === user?.id
                    ? "bg-royal text-white rounded-2xl rounded-tr-none"
                    : "bg-appbg text-navy rounded-2xl rounded-tl-none"
                } px-4 py-3`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender.id === user?.id ? "text-blue-100" : "text-textsecondary"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-borderline p-6 bg-appbg">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl border border-borderline focus:outline-none focus:ring-2 focus:ring-royal bg-white"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-royal text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkblue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Discussion;
