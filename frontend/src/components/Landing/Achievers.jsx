import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiStar } from 'react-icons/fi';
import api from '../../api';

const Achievers = () => {
  const [achievers, setAchievers] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = 'http://localhost:5000'; 

  useEffect(() => {
    api.get('/public/achievers')
      .then(res => setAchievers(res.data))
      .catch(err => console.error("Failed to load achievers", err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && achievers.length === 0) return null;

  const getImageUrl = (url) => {
      if (!url) return `https://ui-avatars.com/api/?name=Achiever&background=f1f5f9&color=64748b`;
      if (url.startsWith('http')) return url; 
      return `${backendUrl}${url}`; 
  };

  // Helper to ensure we have enough items to create a smooth infinite loop on mobile
  let infiniteAchievers = [...achievers];
  if (infiniteAchievers.length > 0) {
      while (infiniteAchievers.length < 6) {
          infiniteAchievers = [...infiniteAchievers, ...achievers];
      }
      infiniteAchievers = [...infiniteAchievers, ...infiniteAchievers]; // Double it for the slide loop
  }

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[#6FCB6C]/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-0 md:px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
            className="text-center mb-10 md:mb-16 px-4"
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
            <FiStar className="text-amber-400 w-3 h-3 md:w-4 md:h-4" fill="currentColor" />
            <h2 className="text-xs md:text-sm font-bold text-[#6FCB6C] tracking-widest uppercase">Hall of Fame</h2>
            <FiStar className="text-amber-400 w-3 h-3 md:w-4 md:h-4" fill="currentColor" />
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E293B] tracking-tight px-2">
            Our Top Achievers
          </h3>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium mt-3 md:mt-4 max-w-2xl mx-auto">
            Consistent excellence, year after year.
          </p>
        </motion.div>

        {loading ? (
            <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-48 md:h-80 bg-slate-100 rounded-[2rem] animate-pulse"></div>)}
            </div>
        ) : (
            <>
                {/* =========================================
                    1. MOBILE VIEW (Infinite Auto-Slider)
                ========================================= */}
                <div className="md:hidden relative w-full overflow-hidden py-4">
                    {/* Fade Out Edges for premium look */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                    
                    <motion.div 
                        className="flex gap-4 w-max px-4"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 25 }} // Adjust duration to change slide speed
                    >
                        {infiniteAchievers.map((student, index) => (
                            <div 
                                key={index} 
                                className="w-[180px] bg-[#F8FAFC] rounded-[2rem] p-5 flex flex-col items-center text-center border border-slate-100 shadow-lg shadow-slate-200/40 shrink-0"
                            >
                                {/* Circular Avatar */}
                                <div className="relative w-20 h-20 mb-5">
                                    <div className="w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-200">
                                        <img 
                                            src={getImageUrl(student.photoUrl)} 
                                            alt={student.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=f1f5f9&color=64748b` }} 
                                        />
                                    </div>
                                    {/* Pill Badge at bottom of circle */}
                                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#6FCB6C] text-white px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center justify-center gap-1">
                                        <span className="font-black text-sm tracking-tight">{student.percentage}</span>
                                    </div>
                                </div>

                                {/* Text Details */}
                                <h4 className="text-base font-bold text-[#1E293B] truncate w-full mb-1">
                                    {student.name}
                                </h4>
                                <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 font-bold text-[9px] uppercase tracking-wide rounded border border-blue-100 truncate w-full">
                                    {student.examName} • {student.year}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* =========================================
                    2. DESKTOP VIEW (The Original Grid)
                ========================================= */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 px-4 sm:px-0">
                    {achievers.map((student, index) => (
                        <motion.div 
                            key={student._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-[#F8FAFC] rounded-[2rem] p-4 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group"
                        >
                            {/* Desktop Image Container (Rectangle) */}
                            <div className="relative h-64 w-full rounded-[1.5rem] overflow-hidden bg-slate-200 mb-6">
                                <img 
                                    src={getImageUrl(student.photoUrl)} 
                                    alt={student.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=f1f5f9&color=64748b` }} 
                                />
                                
                                {/* Desktop Absolute Percentage Badge */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#6FCB6C] text-white px-5 py-2 rounded-full shadow-lg shadow-[#6FCB6C]/40 border-2 border-white flex items-center gap-2 whitespace-nowrap">
                                    <FiAward className="w-5 h-5" />
                                    <span className="font-black text-xl tracking-tight">{student.percentage}</span>
                                </div>
                            </div>

                            {/* Desktop Student Details */}
                            <div className="text-center pb-2">
                                <h4 className="text-xl font-bold text-[#1E293B] mb-1 truncate px-2">
                                    {student.name}
                                </h4>
                                <div className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wide rounded-lg border border-blue-100 truncate max-w-full">
                                    {student.examName} • {student.year}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </>
        )}
      </div>
    </section>
  );
};

export default Achievers;