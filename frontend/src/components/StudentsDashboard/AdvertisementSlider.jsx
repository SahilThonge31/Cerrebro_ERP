import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiExternalLink, FiInfo } from 'react-icons/fi';
import api from '../../api';

const AdvertisementSlider = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Fetch Ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get('/ads');
        if (res.data.length > 0) {
          setAds(res.data);
        } else {
          // FALLBACK DATA
          setAds([
            { _id: 1, title: "Scholarship Test 2026", imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop", link: "/exams" },
            { _id: 2, title: "Annual Science Fair", imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000&auto=format&fit=crop", link: "/gallery" },
          ]);
        }
      } catch (error) {
        console.error("Failed to load ads", error);
      }
    };
    fetchAds();
  }, []);

  // 2. Auto-Slide Logic (Only runs if more than 1 ad exists)
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === ads.length - 1 ? 0 : prevIndex + 1));
    }, 5000); // 5 seconds is standard for professional readability

    return () => clearInterval(interval);
  }, [ads.length]);

  // 3. Handlers
  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(currentIndex === 0 ? ads.length - 1 : currentIndex - 1);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex(currentIndex === ads.length - 1 ? 0 : currentIndex + 1);
  };

  const handleAdClick = () => {
    const currentAd = ads[currentIndex];
    if (currentAd?.link) {
        if (currentAd.link.startsWith('http')) {
            window.open(currentAd.link, '_blank');
        } else {
            navigate(currentAd.link);
        }
    }
  };

  if (ads.length === 0) return null;

  return (
    <div 
      className="relative w-full mt-6 overflow-hidden rounded-[2rem] shadow-2xl shadow-[#1E293B]/10 group cursor-pointer bg-[#0F172A]"
      onClick={handleAdClick}
    >
      {/* Responsive Aspect Ratio Container (16:9 on mobile, ultra-wide 21:9 on desktop) */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:h-[400px]">
        
        {/* --- SMOOTH IMAGE TRANSITION --- */}
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            src={ads[currentIndex].imageUrl}
            alt={ads[currentIndex].title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* --- PREMIUM GRADIENT OVERLAY --- */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent flex items-end">
          <motion.div 
            key={`text-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 md:p-10 w-full"
          >
            <div className="flex justify-between items-end">
              <div className="max-w-2xl">
                {/* Small Badge */}
                <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#6FCB6C] mb-3 bg-[#6FCB6C]/10 w-max px-3 py-1 rounded-full backdrop-blur-md border border-[#6FCB6C]/20">
                  <FiInfo size={12} /> Featured Announcement
                </span>
                
                {/* Title */}
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-md">
                  {ads[currentIndex].title}
                </h2>
                
                {/* Subtitle */}
                <p className="text-sm md:text-base text-slate-300 font-medium mt-2 flex items-center gap-2">
                  {ads[currentIndex].link ? "Click to view details" : "Latest Updates"}
                </p>
              </div>

              {/* External Link Icon */}
              {ads[currentIndex].link && (
                <div className="hidden md:flex h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white group-hover:bg-[#6FCB6C] group-hover:border-[#6FCB6C] group-hover:text-[#0F172A] transition-all duration-300 transform group-hover:-translate-y-1">
                  <FiExternalLink size={20} />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* --- NAVIGATION ARROWS (Hidden on mobile, appear on hover on desktop) --- */}
        {ads.length > 1 && (
          <div className="absolute inset-0 hidden md:flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button 
              onClick={prevSlide} 
              className="pointer-events-auto h-12 w-12 rounded-full bg-[#0F172A]/50 border border-white/10 text-white flex items-center justify-center hover:bg-[#6FCB6C] hover:text-[#0F172A] hover:scale-110 backdrop-blur-md transition-all"
            >
              <FiChevronLeft size={24} />
            </button>
            <button 
              onClick={nextSlide} 
              className="pointer-events-auto h-12 w-12 rounded-full bg-[#0F172A]/50 border border-white/10 text-white flex items-center justify-center hover:bg-[#6FCB6C] hover:text-[#0F172A] hover:scale-110 backdrop-blur-md transition-all"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        )}

        {/* --- PAGINATION DOTS --- */}
        {ads.length > 1 && (
          <div className="absolute bottom-6 right-6 md:right-10 flex gap-2 z-20">
            {ads.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentIndex === index 
                    ? 'w-8 bg-[#6FCB6C] shadow-[0_0_10px_rgba(111,203,108,0.5)]' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvertisementSlider;