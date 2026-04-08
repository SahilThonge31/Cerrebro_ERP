import React from 'react';
import { FiBook, FiLayers, FiClock } from 'react-icons/fi';

const TeacherInfoCard = ({ teacher }) => {
  // Skeleton Loader
  if (!teacher || !teacher.name) {
      return <div className="h-48 bg-gray-100 rounded-2xl animate-pulse w-full shadow-sm"></div>;
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all w-full">
      
      {/* Decorative Blob - Auto adjusts size based on screen */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-teal-50 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 group-hover:bg-teal-100 transition-colors z-0"></div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
        
        {/* 1. Profile Image - Centered on mobile, Left on desktop */}
        <div className="shrink-0">
            <div className="h-24 w-24 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-0.5 shadow-lg">
                <div className="h-full w-full bg-white rounded-2xl overflow-hidden flex items-center justify-center">
                    {teacher.profilePic ? (
                        <img src={teacher.profilePic} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-3xl sm:text-2xl font-bold text-teal-600">
                            {teacher.name?.charAt(0)}
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* 2. Info Content - Center text on mobile, Left on desktop */}
        <div className="flex-1 min-w-0 text-center sm:text-left w-full">
            
            {/* Header Section */}
            <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {teacher.name}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 text-sm text-gray-500 font-medium">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                        {teacher.qualification || 'Faculty'}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                        <FiClock size={12}/> {teacher.experience || '0 Years'} Experience
                    </span>
                </div>
            </div>

            {/* Separator for mobile only */}
            <div className="h-px w-full bg-gray-100 my-4 sm:hidden"></div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Subjects Section */}
                <div className="flex flex-col sm:items-start items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FiBook size={10}/> Expert In
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                            teacher.subjects.map((sub, idx) => (
                                <span key={idx} className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                                    {sub}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400 italic">General Subjects</span>
                        )}
                    </div>
                </div>

                {/* Classes Section (Improved Layout) */}
<div className="flex flex-col sm:items-start items-center">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
        <FiLayers size={10}/> Assigned Classes
    </p>
    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
        {teacher.classes && teacher.classes.length > 0 ? (
            teacher.classes.map((cls, idx) => (
                <span key={idx} className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg">
                    {/* 👇 THE FIX: Access object properties instead of the whole object */}
                    {typeof cls === 'string' 
                        ? cls 
                        : `${cls.standard} (${cls.board})`
                    }
                </span>
            ))
        ) : (
            <span className="text-xs text-gray-400 italic">No classes assigned</span>
        )}
    </div>
</div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherInfoCard;