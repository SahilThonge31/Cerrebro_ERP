import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiArrowRight } from 'react-icons/fi';
import api from '../../api';

const GalleryShowcase = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to resolve backend image paths
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  // Helper to randomly shuffle an array
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchAndProcessGallery = async () => {
      try {
        // Use your public endpoint if you have one, or fallback to the standard one
        const res = await api.get('/public/gallery').catch(() => api.get('/gallery'));
        
        // 1. Extract every single image from all albums
        let allPhotos = [];
        res.data.forEach(album => {
          if (album.coverImage) allPhotos.push(album.coverImage);
          if (album.media && Array.isArray(album.media)) {
            album.media.forEach(m => {
              // Handle if media is stored as a string or an object { url: ... }
              if (typeof m === 'string') allPhotos.push(m);
              else if (m.url || m.fileUrl) allPhotos.push(m.url || m.fileUrl);
            });
          }
        });

        // Remove exact duplicates
        allPhotos = [...new Set(allPhotos)];

        // 2. Shuffle the photos so it changes on every refresh!
        let randomizedPhotos = shuffleArray(allPhotos);

        // 3. Ensure we have a minimum of 10 photos for the slider to work smoothly
        // If we only have 4 photos in the DB, we duplicate them until we hit 10+
        while (randomizedPhotos.length > 0 && randomizedPhotos.length < 10) {
          randomizedPhotos = [...randomizedPhotos, ...randomizedPhotos];
        }

        // Slice to a maximum of 15 unique photos to keep browser performance fast
        setImages(randomizedPhotos.slice(0, 15));

      } catch (err) {
        console.error("Failed to load gallery images", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessGallery();
  }, []);

  if (!loading && images.length === 0) return null;

  return (
    <section className="py-20 bg-white overflow-hidden relative">
      
      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <FiCamera className="text-[#6FCB6C]" size={20} />
            <h2 className="text-sm font-bold text-[#6FCB6C] tracking-widest uppercase">Life at Cerrebro</h2>
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-[#1E293B] tracking-tight">
            Moments of Excellence
          </h3>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => navigate('/login')} // Or wherever public users can view the full gallery
          className="group flex items-center justify-center gap-2 text-[#1E293B] font-bold hover:text-[#6FCB6C] transition-colors"
        >
          View Full Gallery 
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* --- SLIDING MARQUEE --- */}
      {loading ? (
        <div className="flex gap-4 px-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="min-w-[250px] md:min-w-[350px] h-64 bg-slate-100 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="relative w-full flex overflow-hidden group">
          
          {/* Left/Right Fade Overlays for smooth entry/exit */}
          <div className="absolute left-0 top-0 w-16 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-16 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* Framer Motion Infinite Slide 
            We duplicate the images array [...images, ...images] so when it reaches the end, it seamlessly loops back to the start!
          */}
          <motion.div 
            className="flex gap-4 md:gap-6 px-4 cursor-grab active:cursor-grabbing w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 35 // Increase this to slow down the slide, decrease to speed up
            }}
          >
            {[...images, ...images].map((img, index) => (
              <motion.div
                key={index}
                // --- THE POPPING EFFECT ---
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "50px" }}
                transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
                // --- HOVER PHYSICS ---
                className="relative min-w-[200px] h-[250px] sm:min-w-[280px] sm:h-[300px] md:min-w-[350px] md:h-[400px] rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2 hover:z-20 hover:shadow-2xl transition-all duration-300"
              >
                <img 
                  src={getFileUrl(img)} 
                  alt="Gallery Moment" 
                  className="w-full h-full object-cover filter brightness-95 hover:brightness-105 transition-all duration-300"
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Cerrebro+Gallery&background=f8fafc&color=94a3b8' }}
                />
              </motion.div>
            ))}
          </motion.div>

        </div>
      )}
    </section>
  );
};

export default GalleryShowcase;