
import React from 'react';

export const ListSkeleton: React.FC = () => (
  <div className="divide-y divide-border">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-8 space-y-4">
        <div className="flex justify-between items-center">
          <div className="skeleton h-3 w-20"></div>
          <div className="skeleton h-2 w-12"></div>
        </div>
        <div className="skeleton h-6 w-3/4"></div>
        <div className="skeleton h-3 w-full"></div>
      </div>
    ))}
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-10 py-16 animate-pulse">
    <div className="w-full aspect-[21/9] mb-16 bg-slate-100"></div>
    <div className="space-y-8">
      <div className="flex gap-6 border-b border-border pb-6">
        <div className="h-4 w-24 bg-slate-100"></div>
        <div className="h-4 w-12 bg-slate-100"></div>
      </div>
      <div className="h-16 w-3/4 bg-slate-100"></div>
      <div className="space-y-4 pt-8">
        <div className="h-4 w-full bg-slate-100"></div>
        <div className="h-4 w-11/12 bg-slate-100"></div>
        <div className="h-4 w-4/5 bg-slate-100"></div>
      </div>
    </div>
  </div>
);
