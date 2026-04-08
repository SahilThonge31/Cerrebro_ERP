import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhoneCall, FiMail, FiClock, FiNavigation, FiMap } from 'react-icons/fi';

const contactDetails = [
  {
    icon: <FiMapPin size={24} />,
    title: "Visit Our Campus",
    content: "Balkrushna kunj, Manjri Rd, Takle Nagar, Gopalpatti, Pune, Maharashtra 412307", // Swap with your actual address
    link: null
  },
  {
    icon: <FiPhoneCall size={24} />,
    title: "Call Us",
    content: "+91 7058161172 ",
    link: "tel:+917058161172"
  },
  {
    icon: <FiMail size={24} />,
    title: "Email Us",
    content: "cerrebrotutorials@gmail.com",
    link: "mailto:cerrebrotutorials@gmail.com"
  },
  {
    icon: <FiClock size={24} />,
    title: "Operating Hours",
    content: "Mon - Sat: 07:30 AM - 09:00 PM \n Sunday: Special Doubt Sessions Only",
    link: null
  }
];

const LocationContact = () => {
  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6FCB6C]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <motion.div 
            className="text-center md:text-left mb-16"
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 py-1.5 px-4 bg-[#F8FAFC] border border-slate-200 text-[#6FCB6C] font-extrabold text-xs tracking-widest uppercase rounded-full mb-6 shadow-sm">
            <FiMap size={14} /> Find Us Here
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1E293B] tracking-tight mb-4">
            Let's Connect & Grow.
          </h2>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl">
            Whether you have a question about our courses, fees, or just want to see the campus, our doors are always open for you.
          </p>
        </motion.div>

        {/* --- MAIN GRID --- */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* LEFT: Contact Cards (Takes up 5 columns on desktop) */}
          <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {contactDetails.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#F8FAFC] p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl shadow-slate-200/40 transition-all duration-300 flex items-start gap-5 group"
              >
                {/* Icon Container */}
                <div className="shrink-0 h-14 w-14 bg-white text-[#6FCB6C] rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-[#6FCB6C] group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
                
                {/* Text Content */}
                <div>
                  <h4 className="text-[#1E293B] font-bold text-lg mb-2 tracking-tight">{item.title}</h4>
                  {item.link ? (
                    <a href={item.link} className="text-slate-500 font-medium whitespace-pre-line hover:text-[#6FCB6C] transition-colors leading-relaxed block">
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-slate-500 font-medium whitespace-pre-line leading-relaxed text-sm md:text-base">
                      {item.content}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* RIGHT: The Map (Takes up 7 columns on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative h-[400px] sm:h-[500px] lg:h-full min-h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 group"
          >
            {/* Google Maps Iframe: 
              To get YOUR exact map: Go to Google Maps -> Search your business -> Click "Share" -> "Embed a map" -> Copy the src link and replace the one below! 
            */}
            <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30268.09781571775!2d73.97452445720491!3d18.50574082026581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c39d3267506d%3A0x30a4bbe4b62abfcc!2sCerrebro%20Tutorials!5e0!3m2!1sen!2sin!4v1774505431033!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'contrast(1.05) opacity(0.95)' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
            ></iframe>

            {/* Floating "Get Directions" Button overlayed on the map */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6 sm:bottom-6 z-10 w-[90%] sm:w-auto">
              <a 
                href="https://www.google.com/maps/place/Cerrebro+Tutorials/@18.5052187,73.9712484,15z/data=!4m6!3m5!1s0x3bc2c39d3267506d:0x30a4bbe4b62abfcc!8m2!3d18.5119252!4d73.9659086!16s%2Fg%2F11xnggzlnd?entry=ttu&g_ep=EgoyMDI2MDMyMy4xIKXMDSoASAFQAw%3D%3D" // Replace with your actual Google Maps URL
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#0F172A] text-white px-6 py-4 rounded-2xl shadow-2xl hover:bg-[#6FCB6C] hover:text-[#0F172A] hover:-translate-y-1 transition-all duration-300 font-black tracking-wide uppercase text-sm"
              >
                <FiNavigation size={18} /> Get Directions
              </a>
            </div>
            
            {/* Top Gradient Shadow for depth */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LocationContact;