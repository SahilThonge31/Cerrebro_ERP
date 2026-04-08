import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';

const SubjectCard = ({ subjectName, linkPrefix = "/student/courses" }) => {
  // Use subjectName in URL. Encode it to handle spaces
  const linkUrl = `${linkPrefix}/${encodeURIComponent(subjectName)}`;
  
  // Get the first letter for the decorative avatar
  const initial = subjectName ? subjectName.charAt(0).toUpperCase() : <FiBookOpen />;

  return (
    <Link 
      to={linkUrl} 
      state={{ name: subjectName }} 
      className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-300 
                 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#6FCB6C]/20 hover:border-[#6FCB6C]/30
                 active:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        {/* Decorative Initial Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 font-extrabold text-xl shadow-inner group-hover:from-[#6FCB6C]/10 group-hover:to-[#6FCB6C]/20 group-hover:text-[#55a852] transition-colors duration-300">
          {initial}
        </div>
        
        {/* Subject Title */}
        <div className="pt-1">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#55a852] transition-colors duration-300">
                {subjectName}
            </h3>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
        <span className="text-sm font-semibold text-gray-400 group-hover:text-[#55a852] transition-colors duration-300">
            Open Course
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 group-hover:bg-[#6FCB6C]/10 transition-colors duration-300">
            <FiArrowRight className="text-gray-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#55a852]" />
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard;