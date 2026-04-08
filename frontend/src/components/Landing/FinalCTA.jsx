import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiZap } from 'react-icons/fi';

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-32 bg-[#0F172A] overflow-hidden flex items-center justify-center">
      
      {/* --- BACKGROUND ANIMATIONS & GLOW --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Left Green Glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-[#6FCB6C]/20 rounded-full blur-[120px]"
        />
        {/* Bottom Right Blue Glow */}
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]"
        />
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        
        {/* Small Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-6"
        >
          <span className="flex items-center gap-2 py-1.5 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-[#6FCB6C] font-extrabold text-xs md:text-sm tracking-widest uppercase rounded-full shadow-sm">
            <FiZap className="text-[#6FCB6C]" fill="currentColor" /> Your Journey Starts Here
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Step Into the New <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6FCB6C] to-[#4a9648]">
              Dimension of Learning.
            </span>
          </h2>
          <p className="text-lg md:text-2xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who have already transformed their academic careers with Cerrebro.
          </p>
        </motion.div>

        {/* Animated Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", bounce: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => navigate('/enquiry')}
            className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-[#6FCB6C] text-[#0F172A] font-black text-xl rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(111,203,108,0.5)] active:scale-95"
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
            
            <span className="relative z-10 tracking-wide uppercase">BE THE PART</span>
            <FiArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
          
          <p className="text-sm text-slate-500 font-medium sm:hidden mt-4">
            Seats fill up fast for upcoming batches.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default FinalCTA;    