import React from 'react';
import { motion } from 'framer-motion';
import ceoImage from '../../assets/ceo.jpeg';

const CeoMessage = () => {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* --- LEFT: CEO IMAGE & ANIMATED SHAPES --- */}
        <div className="relative flex justify-center lg:justify-start">
          
          {/* Abstract Background Shapes (Matching your reference image) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center lg:justify-start">
            <motion.div 
                animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-0 md:-left-10 w-48 md:w-64 h-20 md:h-24 bg-indigo-400 rounded-full"
            ></motion.div>
            
            <motion.div 
                animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/3 left-10 md:left-20 w-64 md:w-96 h-32 md:h-48 bg-indigo-500 rounded-full"
            ></motion.div>
            
            <motion.div 
                animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-10 right-0 md:right-10 w-32 md:w-48 h-12 md:h-16 bg-indigo-400 rounded-full"
            ></motion.div>
            
            <motion.div 
                animate={{ x: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-24 -left-5 w-20 md:w-32 h-10 bg-indigo-500 rounded-full"
            ></motion.div>
          </div>

          {/* CEO Portrait */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm md:max-w-md"
          >
            {/* Replace this src with your actual cut-out image of Mr. Sahil */}
            <img 
              src={ceoImage}
              alt="Mr. Sahil Thonge - CEO" 
              className="w-full h-auto object-cover drop-shadow-2xl rounded-b-full"
              style={{ maskImage: 'linear-gradient(to top, transparent 0%, black 15%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)' }}
            />
          </motion.div>
        </div>

        {/* --- RIGHT: TEXT & MESSAGE --- */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative z-10"
        >
          {/* Cursive Heading matching the reference */}
          <h2 
            className="text-5xl md:text-6xl text-indigo-900 mb-4" 
            style={{ fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}
          >
            CEO Message
          </h2>
          
          {/* Small squiggly divider */}
          <div className="w-16 h-1 bg-indigo-500 rounded-full mb-8"></div>

          {/* The Devotional Story */}
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg text-justify md:text-left">
            <p>
              "For me, education has never been just a profession—it is a lifelong devotion. When I completed my engineering degree, I realized that true technological progress is meaningless if it does not uplift human potential and ignite young minds."
            </p>
            <p>
              Cerrebro was founded on a simple, sacred belief: <strong className="text-indigo-900">every student holds infinite promise.</strong> We are not here merely to teach syllabus; we are here to mentor, nurture, and build the leaders of tomorrow. 
            </p>
            <p className="italic font-medium border-l-4 border-indigo-400 pl-4 py-1 text-gray-700 bg-indigo-50/50 rounded-r-lg">
              "When you trust us with your educational journey, you become part of our family. Your growth, your dreams, and your success become our ultimate purpose."
            </p>
          </div>

          {/* Profile Details */}
          <div className="mt-10 flex items-center gap-4">
            <div className="h-14 w-1 bg-teal-500 rounded-full"></div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">Mr. Sahil Thonge</h3>
              <p className="text-sm font-bold text-teal-600 uppercase tracking-widest mt-1">
                Founder & CEO • B.Tech (Comp)
              </p>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default CeoMessage;