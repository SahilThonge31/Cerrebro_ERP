import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const DashboardCard = ({ icon, title, description, linkTo }) => {
  return (
    <Link 
      to={linkTo} 
      className="group block rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 
                 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6FCB6C]/40
                 active:-translate-y-2 active:shadow-2xl active:shadow-[#6FCB6C]/40"
    >
      <div className="flex items-center gap-4">
        {/* Icon with a new gradient background and hover effect */}
        <div className="rounded-full bg-gradient-to-br from-green-100 to-cyan-100 p-4 text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-secondary">{title}</h3>
        
        {/* Arrow Icon */}
        <FiArrowRight 
          className="ml-auto text-gray-300 opacity-0 transition-all duration-300 
                     group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100 
                     group-active:translate-x-1 group-active:text-primary group-active:opacity-100" />
      </div>
      
      {/* Description */}
      <p className="mt-4 text-gray-600">{description}</p>
    </Link>
  );
};

export default DashboardCard;