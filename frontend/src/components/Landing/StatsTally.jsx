import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { FiUsers, FiBookOpen, FiHeart, FiAward } from 'react-icons/fi';

// Custom component to handle the "counting up" animation smoothly
const AnimatedCounter = ({ from = 0, to, duration = 2 }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration: duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, count, to, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

const StatsTally = () => {
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = currentYear - 2021;

  const stats = [
    { 
        id: 1, 
        label: "Active Students", 
        value: 150, 
        suffix: "+", 
        icon: <FiUsers className="w-5 h-5 md:w-7 md:h-7" />, 
        desc: "Learning with us" 
    },
    { 
        id: 2, 
        label: "Expert Teachers", 
        value: 5, 
        suffix: "+", 
        icon: <FiBookOpen className="w-5 h-5 md:w-7 md:h-7" />, 
        desc: "Highly qualified" 
    },
    { 
        id: 3, 
        label: "Satisfied Parents", 
        value: 97.8, 
        suffix: "%", 
        icon: <FiHeart className="w-5 h-5 md:w-7 md:h-7" />, 
        desc: "Trust our methods" 
    },
    { 
        id: 4, 
        label: "Years Excellence", 
        value: yearsOfExperience, 
        suffix: "+", 
        icon: <FiAward className="w-5 h-5 md:w-7 md:h-7" />, 
        desc: "Since 2021" 
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-[#0F172A] relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-[#6FCB6C]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* 👇 CHANGED: grid-cols-2 for mobile, tight gap on mobile, wide gap on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              // 👇 CHANGED: Reduced padding and rounded corners on mobile (p-4 vs p-8)
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center text-center hover:bg-white/10 hover:border-[#6FCB6C]/50 transition-all duration-300 group"
            >
              {/* Icon */}
              {/* 👇 CHANGED: Smaller icon box on mobile (h-10 w-10 vs h-16 w-16) */}
              <div className="h-10 w-10 md:h-16 md:w-16 bg-[#6FCB6C]/10 text-[#6FCB6C] rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 group-hover:bg-[#6FCB6C] group-hover:text-[#0F172A] transition-all duration-300">
                {stat.icon}
              </div>
              
              {/* Animated Number */}
              {/* 👇 CHANGED: Text scales perfectly from text-2xl on phones up to text-5xl on desktops */}
              <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-1 md:mb-2 tracking-tight flex items-center justify-center">
                <AnimatedCounter to={stat.value} />
                <span className="text-[#6FCB6C] ml-0.5 md:ml-1">{stat.suffix}</span>
              </h3>
              
              {/* Label & Description */}
              {/* 👇 CHANGED: Tighter text formatting to prevent awkward wrapping on small screens */}
              <h4 className="text-[11px] sm:text-sm md:text-lg font-bold text-slate-200 mb-0.5 md:mb-1 leading-tight">{stat.label}</h4>
              <p className="text-[9px] sm:text-xs md:text-sm text-slate-400 font-medium leading-tight">{stat.desc}</p>
              
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default StatsTally;