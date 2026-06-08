import React from "react";
import { Link } from "react-router-dom";
import { Users, MessageSquare, ExternalLink } from "lucide-react";

const CircleCard = ({ title, memberCount, discussionCount, id }) => {
  return (
    <div className="bg-white border border-borderline rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-bold text-navy text-lg line-clamp-1 group-hover:text-royal transition-colors">{title}</h4>
        <Link
          to={`/circles/${id}`}
          className="p-2 bg-softblue text-royal rounded-lg hover:bg-royal hover:text-white transition-all"
        >
          <ExternalLink size={16} />
        </Link>
      </div>

      <div className="flex items-center gap-4 text-textsecondary">
        <div className="flex items-center gap-1.5 text-xs">
          <Users size={14} />
          <span>{memberCount} members</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <MessageSquare size={14} />
          <span>{discussionCount} new</span>
        </div>
      </div>
    </div>
  );
};

export default CircleCard;
