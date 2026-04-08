import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBook, FiBarChart2, FiCalendar, FiDollarSign, 
  FiImage, FiHeadphones, FiClock, FiFileText, FiArrowRight,
  FiCheckCircle // <--- New Icon for Attendance
} from 'react-icons/fi';

const QuickLinks = () => {
  const navigate = useNavigate();

  const links = [
    { name: 'My Courses', icon: FiBook, color: 'bg-blue-100 text-blue-600', path: '/courses' },
    { name: 'Report Card', icon: FiBarChart2, color: 'bg-purple-100 text-purple-600', path: '/student/report' },
    { name: 'Attendance', icon: FiCheckCircle, color: 'bg-teal-100 text-teal-600', path: '/student/attendance' }, // <--- ADDED HERE
    { name: 'Calendar', icon: FiCalendar, color: 'bg-red-100 text-red-600', path: '/calendar' },
    { name: 'Fee Details', icon: FiDollarSign, color: 'bg-green-100 text-green-600', path: '/fees' },
    { name: 'Assignments', icon: FiFileText, color: 'bg-yellow-100 text-yellow-600', path: '/assignments' },
    { name: 'Timetable', icon: FiClock, color: 'bg-indigo-100 text-indigo-600', path: '/timetable' },
    { name: 'Gallery', icon: FiImage, color: 'bg-pink-100 text-pink-600', path: '/gallery' },
    { name: 'Support', icon: FiHeadphones, color: 'bg-gray-100 text-gray-600', path: '/support' },
  ];

  return (
    <div className="mt-8">
      <h3 className="mb-4 font-heading text-lg font-bold text-gray-800">Quick Links</h3>
      
      {/* Responsive Grid:
          - Mobile: 4 columns (Tight, icon-focused)
          - Desktop (md+): 4 columns (Wide, card-focused)
      */}
      <div className="grid grid-cols-4 gap-y-6 gap-x-4 md:gap-6">
        {links.map((link, index) => (
          <div 
            key={index} 
            onClick={() => navigate(link.path)}
            className="group cursor-pointer 
                       /* Mobile Layout: Stacked (Icon Top, Text Bottom) */
                       flex flex-col items-center gap-2
                       /* Desktop Layout: Row (Card style) */
                       md:flex-row md:items-center md:justify-between md:p-4 
                       md:rounded-2xl md:bg-white md:border md:border-gray-100 md:shadow-sm
                       /* Desktop Hover Effects */
                       md:hover:shadow-lg md:hover:-translate-y-1 md:hover:border-blue-500/20
                       md:transition-all md:duration-300"
          >
            {/* Left Side: Icon & Text Wrapper (Desktop) */}
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
              
              {/* Icon Container */}
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform 
                              group-hover:-translate-y-1 md:group-hover:translate-y-0 /* Reset mobile animation on desktop */
                              md:h-12 md:w-12 md:rounded-xl /* Square-ish on desktop for professional look */
                              ${link.color}`}>
                <link.icon size={24} />
              </div>

              {/* Label */}
              <span className="text-center text-[11px] font-semibold text-gray-600 leading-tight
                               group-hover:text-blue-600 
                               md:text-left md:text-sm md:font-bold md:text-gray-700">
                {link.name}
              </span>
            </div>

            {/* Desktop Only: Arrow Icon that appears on hover */}
            <div className="hidden opacity-0 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 md:block text-gray-400">
              <FiArrowRight size={18} />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;