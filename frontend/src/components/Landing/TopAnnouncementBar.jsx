import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar } from 'react-icons/fi';

const TopAnnouncementBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Date and Time (Using 'long' for a more formal, professional look)
  const formattedDate = currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit'
  });

  return (
    <motion.div 
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#0F172A] border-b border-white/5 text-slate-300 relative z-[40]" // Deep premium slate
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 text-[11px] md:text-xs font-medium">
        
        {/* Left Side: Elegant Date & Time */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
            <FiCalendar className="text-indigo-400" size={14} />
            <span className="tracking-wide">{formattedDate}</span>
          </div>
          
          <span className="hidden md:block text-slate-700">|</span>
          
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default w-[90px]">
            <FiClock className="text-indigo-400" size={14} />
            <span className="font-mono tabular-nums tracking-wider">{formattedTime}</span>
          </div>
        </div>

        {/* Right Side: Sophisticated Quote */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex items-center gap-2.5 text-slate-300 cursor-default"
        >
          {/* Subtle glowing indicator instead of cartoonish stars */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          
          <span className="uppercase tracking-[0.15em] font-semibold text-[14px] md:text-[21px] text-slate-200">
            "Today is never too late to start."
          </span>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default TopAnnouncementBar;