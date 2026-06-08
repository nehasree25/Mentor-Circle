import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

const PersonCard = ({ avatar, name, detail, actionLabel, actionLink, isCompact = false }) => {
  return (
    <div className={`bg-white border border-borderline rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${isCompact ? 'flex items-center gap-4' : 'text-center space-y-3'}`}>
      <div className={`relative ${isCompact ? 'w-12 h-12' : 'w-16 h-16 mx-auto'}`}>
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover border-2 border-softblue" />
        ) : (
          <div className="w-full h-full rounded-full bg-softblue flex items-center justify-center text-royal">
            <User size={isCompact ? 20 : 24} />
          </div>
        )}
      </div>

      <div className={isCompact ? 'flex-1' : 'space-y-1'}>
        <h4 className={`font-bold text-navy ${isCompact ? 'text-sm' : 'text-base'}`}>{name}</h4>
        <p className="text-xs text-textsecondary line-clamp-1">{detail}</p>
      </div>

      {!isCompact && (
        <Link
          to={actionLink}
          className="inline-block w-full py-2 text-sm font-semibold text-royal bg-softblue rounded-xl hover:bg-royal hover:text-white transition-colors"
        >
          {actionLabel}
        </Link>
      )}

      {isCompact && (
        <Link
          to={actionLink}
          className="p-2 text-royal hover:text-darkblue transition-colors"
        >
          <span className="text-xs font-bold">View</span>
        </Link>
      )}
    </div>
  );
};

export default PersonCard;
