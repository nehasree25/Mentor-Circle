import React from "react";
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

const ProgressPanel = ({ data }) => {
  // Use real data if available and is an array/object; otherwise, handle empty state
  const hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl border border-borderline p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
        <div className="w-12 h-12 bg-appbg rounded-full flex items-center justify-center text-textsecondary">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="font-bold text-navy">No Progress Data</h3>
          <p className="text-sm text-textsecondary">Start completing your profile and joining circles to track your learning journey.</p>
        </div>
        <Link to="/profile" className="text-xs font-bold text-royal hover:underline">Complete Profile</Link>
      </div>
    );
  }

  const progress = data?.completionPercentage || 0;
  const level = data?.experienceLevel || "Beginner";
  const goals = data?.goals || [];

  // SVG Ring calculation
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-borderline p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy text-lg">Learning Progress</h3>
        <span className="px-3 py-1 rounded-full bg-softblue text-royal text-xs font-bold">
          {level}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-appbg"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="text-royal transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-navy">{progress}%</span>
            <span className="text-[10px] text-textsecondary uppercase font-semibold">Profile</span>
          </div>
        </div>
        <p className="text-sm text-textsecondary text-center">
          Your profile is {progress}% complete. Add your expertise to reach 100%.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-navy mb-2">Learning Goals</p>
        {goals.map((goal, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-textsecondary truncate mr-2">{goal.name}</span>
              <span className="font-bold text-navy">{goal.value}%</span>
            </div>
            <div className="w-full h-2 bg-appbg rounded-full overflow-hidden">
              <div
                className="h-full bg-royal rounded-full transition-all duration-500"
                style={{ width: `${goal.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressPanel;
