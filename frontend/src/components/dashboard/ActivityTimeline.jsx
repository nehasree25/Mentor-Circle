import React from "react";

const ActivityItem = ({ icon: Icon, text, time, color = "text-royal", bgColor = "bg-softblue" }) => (
  <div className="relative pl-8 pb-8 last:pb-0">
    {/* Timeline Dot */}
    <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10" style={{ backgroundColor: 'var(--royal)' }}>
      <div className={`w-full h-full rounded-full ${bgColor} opacity-50`} />
    </div>
    {/* Timeline Line */}
    <div className="absolute left-[7px] top-4 w-0.5 h-full bg-borderline last:hidden" />

    <div className="flex gap-3 items-start">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center ${color} shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-navy font-medium">{text}</p>
        <p className="text-[11px] text-textsecondary">{time}</p>
      </div>
    </div>
  </div>
);

const ActivityTimeline = ({ activities }) => {
  return (
    <div className="space-y-0">
      {activities.map((item, idx) => (
        <ActivityItem key={idx} {...item} />
      ))}
    </div>
  );
};

export default ActivityTimeline;
