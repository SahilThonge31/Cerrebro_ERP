import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiTarget, 
  FiCheckCircle, 
  FiBookOpen, 
  FiMessageCircle 
} from 'react-icons/fi';

const features = [
  { icon: <FiBookOpen size={28} />, title: "Concept-Driven Learning", desc: "We focus strongly on the basics of Math and Science, ensuring students actually understand rather than just memorize." },
  { icon: <FiUsers size={28} />, title: "Personalized Attention", desc: "Small batches allow our teachers to focus on every student. Even weaker students get proper, step-by-step guidance." },
  { icon: <FiTrendingUp size={28} />, title: "Continuous Evaluation", desc: "Regular tests and daily practice sessions keep students sharp, with transparent progress feedback provided directly to parents." },
  { icon: <FiTarget size={28} />, title: "Exam-Oriented Prep", desc: "Our highly effective revision lectures and IMP question series give students a massive advantage right before board exams." },
  { icon: <FiMessageCircle size={28} />, title: "Expert Doubt Resolution", desc: "Supportive and approachable faculty patiently clear every doubt, creating a friendly environment where students hesitate less." },
  { icon: <FiCheckCircle size={28} />, title: "Discipline & Monitoring", desc: "We maintain a strict yet caring environment with regular homework checking and continuous monitoring to build student discipline." }
];

const WhyChooseUs = () => {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to track which card the user has swiped to on mobile
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollPosition = sliderRef.current.scrollLeft;
    const itemWidth = sliderRef.current.clientWidth;
    // Calculate the closest index based on scroll position
    const newIndex = Math.round(scrollPosition / itemWidth);
    setActiveIndex(newIndex);
  };

  return (
    <section className="py-20 md:py-24 bg-[#F8FAFC] relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-[#6FCB6C]/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-0 md:px-6 relative z-10 text-center">
        
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-3xl mx-auto mb-12 md:mb-20 px-6 md:px-0"
        >
          <span className="inline-block py-1.5 px-4 bg-white border border-slate-200 text-[#6FCB6C] font-extrabold text-xs tracking-widest uppercase rounded-full mb-6 shadow-sm">
            The Cerrebro Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E293B] mb-4 md:mb-6 tracking-tight leading-tight">
            Why Students & Parents <br className="hidden sm:block"/> Trust Us.
          </h2>
          <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">
            We don't just complete the syllabus; we build confidence, discipline, and deep subject knowledge to ensure lasting academic success.
          </p>
        </motion.div>

        {/* HYBRID LAYOUT: Slider on Mobile, Grid on Desktop */}
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex md:grid flex-nowrap md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none px-6 md:px-0 pb-8 md:pb-0 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        >
          {features.map((feat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }} 
              transition={{ duration: 0.5, delay: i * 0.1 }}
              // Responsive widths: Takes up 85% of screen on mobile to hint the next card, auto on desktop
              className="w-[85vw] sm:w-[350px] md:w-auto flex-shrink-0 snap-center md:snap-align-none p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left group relative overflow-hidden"
            >
              {/* Subtle hover gradient inside the card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6FCB6C]/0 to-[#6FCB6C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {/* Icon */}
              <div className="h-14 w-14 md:h-16 md:w-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#6FCB6C] mb-6 group-hover:bg-[#6FCB6C] group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-[#6FCB6C] relative z-10">
                {feat.icon}
              </div>
              
              {/* Text */}
              <h4 className="text-lg md:text-xl font-bold text-[#1E293B] mb-2 md:mb-3 relative z-10 tracking-tight">
                {feat.title}
              </h4>
              <p className="text-slate-500 font-medium leading-relaxed text-sm relative z-10">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* MOBILE DOT INDICATORS (Hidden on Desktop) */}
        <div className="flex md:hidden justify-center items-center gap-2 mt-2">
          {features.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? 'w-8 bg-[#6FCB6C]' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;