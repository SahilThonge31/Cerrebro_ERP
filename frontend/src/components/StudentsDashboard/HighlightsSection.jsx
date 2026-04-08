import React, { useState, useEffect } from 'react';
import { FiBell, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import api from '../../api'; // Make sure this path matches your project structure

const HighlightsSection = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Array of vibrant gradients to cycle through for the cards
  const cardGradients = [
    "bg-gradient-to-br from-blue-500 to-cyan-400",
    "bg-gradient-to-br from-orange-400 to-red-500",
    "bg-gradient-to-br from-purple-500 to-pink-500",
    "bg-gradient-to-br from-emerald-400 to-teal-500"
  ];

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const token = localStorage.getItem('token');
        // Adjust the endpoint route below if your router path is different (e.g., '/api/notifications/my')
        const res = await api.get('/notifications', { 
            headers: { 'x-auth-token': token } 
        });
        
        // Take only the latest 4 notifications
        const latestNotices = res.data.slice(0, 4);
        setHighlights(latestNotices);
      } catch (err) {
        console.error("Error fetching highlights:", err);
        setError("Could not load latest updates.");
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  if (loading) {
    return (
        <div className="mt-8 mb-8 animate-pulse">
            <h3 className="mb-4 font-heading text-lg font-bold text-gray-800">Highlights</h3>
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="min-w-[280px] h-32 bg-gray-200 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="mt-8 mb-8 p-4 bg-red-50 text-red-500 rounded-xl flex items-center gap-2">
            <FiAlertCircle />
            <span className="text-sm font-medium">{error}</span>
        </div>
    );
  }

  if (highlights.length === 0) {
      return null; // Don't show the section at all if there are no notices
  }

  return (
    <div className="mt-8 mb-10 sm:mb-16">
      <div className="flex items-center gap-2 mb-4">
          <FiBell className="text-blue-600 text-xl" />
          <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
              Latest Highlights
          </h3>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {highlights.map((notice, index) => {
          // Assign a color based on the index (loops back if more than 4 items somehow)
          const colorClass = cardGradients[index % cardGradients.length];
          
          return (
            <div 
              key={notice._id}
              className={`min-w-[280px] sm:min-w-[320px] w-[280px] sm:w-[320px] flex-shrink-0 cursor-pointer rounded-2xl p-5 sm:p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colorClass}`}
            >
              <div className="flex justify-between items-start mb-2">
                  <h4 className="text-base sm:text-lg font-bold line-clamp-1 pr-2">
                      {notice.title}
                  </h4>
                  {notice.type === 'alert' && (
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-white/20 rounded-full animate-pulse">
                          ⚠️
                      </span>
                  )}
              </div>
              
              <p className="mt-1 text-sm sm:text-base opacity-95 line-clamp-2 leading-snug h-10 sm:h-12 mb-4 text-white/90">
                {notice.message}
              </p>
              
              <div className="flex justify-between items-center mt-auto border-t border-white/20 pt-3">
                  <span className="text-[10px] sm:text-xs font-medium flex items-center gap-1.5 opacity-80 backdrop-blur-sm bg-black/10 px-2 py-1 rounded-md">
                      <FiCalendar />
                      {new Date(notice.createdAt).toLocaleDateString('en-GB', { 
                          day: 'numeric', month: 'short' 
                      })}
                  </span>
                  
                  <button className="rounded-lg bg-white text-gray-900 px-3 py-1.5 text-[10px] sm:text-xs font-bold shadow-sm transition-transform hover:scale-105 active:scale-95">
                   "Follow this STRICTLY...!"
                  </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HighlightsSection;