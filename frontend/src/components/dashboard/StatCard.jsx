import React from "react";

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white border border-borderline rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-default group">
      <div className="w-12 h-12 bg-softblue rounded-xl flex items-center justify-center text-royal group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-textsecondary">{label}</p>
        <p className="text-2xl font-bold text-navy">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
