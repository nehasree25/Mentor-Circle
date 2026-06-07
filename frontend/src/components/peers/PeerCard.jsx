import React from "react";
import { Users } from "lucide-react";
import Avatar from "../common/Avatar";
import { motion } from "framer-motion";

export function PeerCard({ peer, onClick }) {
  const fullName = peer.first_name || peer.last_name
    ? `${peer.first_name || ""} ${peer.last_name || ""}`.trim()
    : peer.username;

  const skills = peer.profile?.skills || [];
  const interests = peer.profile?.interests || [];

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-borderline shadow-soft transition-all cursor-pointer"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <Avatar user={peer} size="w-20 h-20" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Name & Role */}
          <div>
            <h3 className="text-xl font-bold text-navy">{fullName}</h3>
            {peer.profile?.role && (
              <p className="text-sm text-textsecondary mt-1">
                {peer.profile.role.charAt(0).toUpperCase() + peer.profile.role.slice(1)}
              </p>
            )}
          </div>

          {/* Bio */}
          {peer.profile?.bio && (
            <p className="text-sm text-textsecondary line-clamp-2">
              {peer.profile.bio}
            </p>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-softblue text-darkblue text-xs rounded-full font-semibold"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="px-3 py-1 bg-appbg text-navy text-xs rounded-full font-medium border border-borderline">
                  +{skills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Common Circles */}
          {typeof peer.common_circles_count === "number" && peer.common_circles_count > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Users size={16} className="text-royal" />
              <span className="text-sm text-textsecondary">
                {peer.common_circles_count} {peer.common_circles_count === 1 ? "Shared Circle" : "Shared Circles"}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex md:flex-col items-center gap-3 md:justify-center md:min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="px-4 py-2 border border-borderline rounded-xl font-semibold text-navy hover:bg-appbg transition-colors w-full text-sm"
          >
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}
