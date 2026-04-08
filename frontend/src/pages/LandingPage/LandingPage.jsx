import React from 'react';
import PublicNavbar from '../../components/Landing/PublicNavbar';
// import HeroSlider from '../components/Landing/HeroSlider'; // Assume you have this
import AdvertisementSlider from '../../components/StudentsDashboard/AdvertisementSlider';
import StatsTally from '../../components/Landing/StatsTally';
import ClassesOffered from '../../components/Landing/ClassesOffered';
import WhyChooseUs from '../../components/Landing/WhyChooseUs';
import Achievers from '../../components/Landing/Achievers';
import GalleryShowcase from '../../components/Landing/GalleryShowcase';
import PlatformShowcase from '../../components/Landing/PlatformShowcase'; // (This holds the 'Our Journey' component)
import CeoMessage from '../../components/Landing/CeoMessage';
import Testimonials from '../../components/Landing/Testimonials';
import LocationContact from '../../components/Landing/LocationContact';
import FinalCTA from '../../components/Landing/FinalCTA';
import Footer from '../../components/Landing/Footer';
import TopAnnouncementBar from '../../components/Landing/TopAnnouncementBar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#6FCB6C] selection:text-white overflow-x-hidden">
      
      {/* =========================================
          1. TOP NAVIGATION
      ========================================= */}
      <TopAnnouncementBar />
      <PublicNavbar />
      
      <main>
        {/* =========================================
            2. THE HOOK & CREDIBILITY
            Show them who you are and your scale instantly.
        ========================================= */}
        <div id="hero" className="max-w-7xl mx-auto px-4 md:px-6 mt-4">
            <AdvertisementSlider />
        </div>
        

        {/* =========================================
            3. THE OFFERING & THE "WHY"
            What do you teach, and why are you the best choice?
        ========================================= */}
        <div id="courses">
            <ClassesOffered />
        </div>
        
        <StatsTally />

        {/* =========================================
            4. THE PROOF & THE CULTURE
            Show the results (Achievers) and the environment (Gallery).
        ========================================= */}
        <div id="achievers">
            <Achievers />
        </div>
        <div id="gallery">
            <GalleryShowcase />
        </div>

        {/* =========================================
            5. TRUST & AUTHORITY
            The history, the leadership, and word-of-mouth.
        ========================================= */}
        <PlatformShowcase /> 
        {/*<CeoMessage />*/}
        <Testimonials />

        {/* =========================================
            6. LOGISTICS & ACTION
            Where are you located, and how do they join?
        ========================================= */}
        <div id="contact">
            <LocationContact />
        </div>
        <WhyChooseUs />
        <FinalCTA />
        
      </main>

      {/* =========================================
          7. FOOTER
      ========================================= */}
      <Footer />
      
    </div>
  );
};

export default LandingPage;