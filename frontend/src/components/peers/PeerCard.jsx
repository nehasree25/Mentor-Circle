import React from "react";
import { Users, Zap } from "lucide-react";
import Avatar from "../common/Avatar";
import { motion } from "framer-motion";

export function PeerCard({ peer, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-borderline shadow-soft hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <Avatar user={peer} size="w-14 h-14" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-navy">
            {peer.first_name || peer.last_name
              ? `${peer.first_name || ""} ${peer.last_name || ""}`.trim()
              : peer.username}
          </h3>
          <p className="text-sm text-textsecondary mt-1 line-clamp-2">
            {peer.profile?.bio || "No bio available"}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {peer.profile?.skills?.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-softblue text-darkblue text-xs rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-borderline">
        <div className="flex items-center gap-2 text-sm text-textsecondary">
          <Users size={16} />
          <span>{peer.common_circles_count} common circles</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-500" />
          <span className="text-sm font-bold text-royal">
            {peer.compatibility_score}% match
          </span>
        </div>
      </div>
    </motion.div>
  );
}
