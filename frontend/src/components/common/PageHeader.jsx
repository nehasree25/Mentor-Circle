
import React from "react";

export function PageHeader({ title, subtitle = null, actions = null }) {
  return (
    <div className="bg-white rounded-2xl border border-borderline shadow-sm px-8 py-6 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-1">{title}</h1>
        {subtitle && <p className="text-textsecondary text-[14px]">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
