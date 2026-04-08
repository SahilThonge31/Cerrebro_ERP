import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import logo from '../../assets/logo.png'; 
import Button from '../common/button'; 

const PublicNavbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add scroll effect for a nice glass-morphism background when scrolling down
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      // 👇 CHANGED HERE: sticky, top-0, and z-[999] ensures it overlays EVERYTHING
      className={`sticky top-0 left-0 w-full z-[999] transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 pb h-20 flex items-center justify-between relative z-[1000]">
        
        {/* --- Logo Section --- */}
        <div className="flex cursor-pointer items-center gap-3" onClick={() => navigate('/')}>
          <img 
            src={logo} 
            alt="Cerrebro Logo" 
            className="h-10 w-auto transition-transform hover:scale-105" 
            onError={(e) => e.target.style.display='none'} 
          />
          <span className="hidden md:block font-heading text-xl font-bold tracking-tight text-gray-800">
            CERREBRO <span className="text-[#6FCB6C]">TUTORIALS</span>
          </span>
          <span className="md:hidden font-heading text-lg font-bold text-gray-800">CERREBRO</span>
        </div>

        {/* --- Desktop Buttons --- */}
        <div className="hidden md:flex items-center gap-4">
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
          
          <Button 
            onClick={() => navigate('/enquiry')} 
            className="!bg-[#6FCB6C] !text-white hover:!bg-[#5bb858] shadow-lg shadow-[#6FCB6C]/30"
          >
            Enquire Now
          </Button>
        </div>

        {/* --- Mobile Menu Toggle --- */}
        <button 
          className="text-gray-600 md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>

      </div>

      {/* --- Mobile Dropdown Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            // 👇 Ensure mobile dropdown also has a massive z-index
            className="absolute top-20 left-0 w-full border-t border-gray-100 bg-white px-6 py-4 shadow-2xl md:hidden overflow-hidden z-[999]"
          >
            <div className="flex flex-col gap-4">
              <Button 
                className="w-full justify-center py-3" 
                onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
              >
                Login
              </Button>
              <Button 
                className="w-full justify-center py-3 !bg-[#6FCB6C] !text-white hover:!bg-[#5bb858]" 
                onClick={() => { navigate('/enquiry'); setIsMobileMenuOpen(false); }}
              >
                Enquire Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default PublicNavbar;