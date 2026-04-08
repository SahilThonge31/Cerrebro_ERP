import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api'; 
import { FiBookOpen, FiAward, FiCheckCircle, FiChevronRight, FiLayers } from 'react-icons/fi';

const ClassesOffered = () => {
  const [groupedClasses, setGroupedClasses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/classes') 
       .then(res => {
           const data = res.data;
           
           // 1. Group the classes by their Board
           const grouped = data.reduce((acc, currentClass) => {
               const boardName = currentClass.board ? currentClass.board.toUpperCase() : 'OTHER';
               if (!acc[boardName]) acc[boardName] = [];
               acc[boardName].push(currentClass);
               return acc;
           }, {});

           // 2. Sort the classes numerically within each group
           Object.keys(grouped).forEach(board => {
               grouped[board].sort((a, b) => {
                   const numA = parseInt(a.standard.replace(/\D/g, '')) || 0;
                   const numB = parseInt(b.standard.replace(/\D/g, '')) || 0;
                   return numA - numB;
               });
           });
           
           setGroupedClasses(grouped);
       })
       .catch(err => console.error("Failed to load classes", err))
       .finally(() => setLoading(false));
  }, []);

  // Helper to format "8" into "8th"
  const formatStandard = (std) => {
      return /^\d+$/.test(std) ? `${std}th` : std;
  };

  return (
    <section className="py-20 md:py-32 bg-[#F8FAFC] relative overflow-hidden">
      
      {/* --- DECORATIVE BACKGROUND ELEMENTS --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6FCB6C]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* --- HEADER SECTION --- */}
        <motion.div 
            className="text-center mb-16 md:mb-24"
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 py-1.5 px-4 bg-white border border-slate-200 text-[#6FCB6C] font-extrabold text-xs tracking-widest uppercase rounded-full mb-6 shadow-sm">
            <FiBookOpen size={14} /> Academics
          </span>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1E293B] tracking-tight mb-4">
            Curriculum We Offer
          </h3>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Structured, comprehensive, and exam-oriented coaching tailored specifically for your board requirements.
          </p>
        </motion.div>

        {/* --- CONTENT SECTION --- */}
        {loading ? (
            // Premium Skeleton Loader
            <div className="grid lg:grid-cols-2 gap-8">
                {[1, 2].map(i => (
                    <div key={i} className="h-80 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-pulse flex flex-col p-8">
                        <div className="flex gap-4 items-center mb-8 border-b border-slate-100 pb-6">
                            <div className="h-16 w-16 bg-slate-200 rounded-2xl"></div>
                            <div className="space-y-3 flex-1">
                                <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
                                <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(j => <div key={j} className="h-12 bg-slate-200 rounded-xl"></div>)}
                        </div>
                    </div>
                ))}
            </div>
        ) : Object.keys(groupedClasses).length === 0 ? (
            // Empty State
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <FiLayers className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <p className="text-xl text-slate-500 font-bold">No courses are currently published.</p>
            </div>
        ) : (
            // --- DYNAMIC CARDS GRID ---
            <div className="grid lg:grid-cols-2 gap-8 md:gap-10 items-start">
                {Object.entries(groupedClasses).map(([board, classesArray], index) => (
                    <motion.div 
                        key={board}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group relative"
                    >
                        {/* Card Header Gradient Banner */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6FCB6C] to-[#4a9648]"></div>
                        
                        <div className="p-6 md:p-8 md:pb-10">
                            {/* Board Info */}
                            <div className="flex items-center gap-5 mb-8 border-b border-slate-100 pb-8">
                                <div className="h-16 w-16 bg-[#6FCB6C]/10 text-[#6FCB6C] rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#6FCB6C] group-hover:text-white transition-all duration-500 shadow-inner">
                                    <FiAward size={32} />
                                </div>
                                <div>
                                    <h4 className="text-2xl md:text-3xl font-black text-[#1E293B] tracking-tight">
                                        {board} Board
                                    </h4>
                                    <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
                                        {classesArray.length} Standards Available
                                    </p>
                                </div>
                            </div>

                            {/* Classes Grid (Responsive: 1 col tiny, 2 col mobile/tablet, 2 col desktop) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {classesArray.map((cls, i) => (
                                    <div 
                                        key={cls._id || i}
                                        className="flex items-center justify-between p-3.5 md:p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#6FCB6C]/5 hover:border-[#6FCB6C]/50 hover:text-[#1E293B] transition-all duration-300 cursor-default group/item shadow-sm hover:shadow"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiCheckCircle className="text-[#6FCB6C]" size={18} />
                                            <span className="font-bold text-sm md:text-base">
                                                {formatStandard(cls.standard)} Standard
                                            </span>
                                        </div>
                                        <FiChevronRight className="text-slate-300 group-hover/item:text-[#6FCB6C] group-hover/item:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>
    </section>
  );
};

export default ClassesOffered;      