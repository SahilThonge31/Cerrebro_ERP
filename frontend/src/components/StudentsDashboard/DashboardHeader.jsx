import React from 'react';
import { FiCalendar } from 'react-icons/fi';

const DashboardHeader = ({ user }) => {
  // Get and format the current date for the Indian locale
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Safely access data (Updated for Flat Structure)
  const name = user?.name || "Student";
  
  // FIX: Access standard/board directly from root, NOT studentDetails
  const standard = user?.standard || "--"; 
  const board = user?.board || "--";

  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-white p-6 shadow-lg md:flex-row md:items-center">
      
      {/* Welcome Message Section */}
      <div>
        <h1 className="text-3xl font-bold text-secondary">
          Welcome <span className="text-primary">{name}</span>!
        </h1>
        
        {/* Dynamic Data: Standard & Board */}
        <div className="mt-3 flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 shadow-sm">
                Std: {standard}
            </span>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700 shadow-sm">
                Board: {board}
            </span>
        </div>
      </div>

      {/* Date Section (Your Custom Theme) */}
      <div className="group flex items-center gap-3 rounded-2xl bg-white p-4 px-6 shadow-lg transition-all duration-300 
                      hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6FCB6C]/40
                      active:-translate-y-2 active:shadow-2xl active:shadow-[#6FCB6C]/40 border border-gray-50">
        <div className="rounded-full bg-green-100 p-2 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <FiCalendar size={20} />
        </div>
        <span className="font-semibold text-secondary">{currentDate}</span>
      </div>
      
    </div>
  );
};

export default DashboardHeader;