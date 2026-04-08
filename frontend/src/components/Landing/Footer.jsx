import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FiX, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import logo from '../../assets/logo.png'; 

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  // Updated link styles for light theme with a premium sliding hover effect
  const linkStyles = "text-slate-500 hover:text-[#6FCB6C] inline-block hover:translate-x-1 transition-all duration-300 cursor-pointer text-sm font-medium";

  const modalContent = {
    privacy: {
      title: "🔒 Privacy Policy",
      updated: "March 2026",
      sections: [
        { title: "Information We Collect", text: "Student Name, Class, School details. Parent contact number & address. Academic records, test results, attendance. Payment and fee details." },
        { title: "How We Use Information", text: "To manage admissions and batches. To track academic performance. To communicate with students/parents. To improve teaching and services." },
        { title: "Data Protection", text: "Student data is kept secure and confidential. Information is not shared with third parties without permission. Only authorized staff can access data." },
        { title: "Media Usage", text: "Photos/videos taken during classes/events may be used for educational or promotional purposes." },
        { title: "Consent", text: "By enrolling in CERREBRO Tutorials, students and parents agree to this privacy policy." }
      ]
    },
    terms: {
      title: "📜 Terms & Conditions",
      updated: "March 2026",
      sections: [
        { title: "1. Admission Rules", text: "Admission is confirmed only after fee payment. Seats are limited and allotted on first-come basis." },
        { title: "2. Fee Policy", text: "Fees must be paid on time as per given date. No refund will be provided once admission is confirmed. Delay in payment may lead to suspension or cancellation." },
        { title: "3. Attendance", text: "Attendance is compulsory for all classes. Regular absence may affect performance, and management will not be responsible." },
        { title: "4. Discipline", text: "Students must maintain proper discipline inside and outside the class. Misbehavior, disobedience, or disturbance will lead to strict action." },
        { title: "5. Academic Responsibility", text: "CERREBRO provides full support, but student effort is equally important. The institute is not responsible for poor results due to negligence." },
        { title: "6. Study Material & Tests", text: "Students must complete all assignments, homework, and tests. Regular tests and evaluations are compulsory." },
        { title: "7. Mobile Usage", text: "Excessive use of mobile phones is discouraged. Students must follow instructions regarding phone usage." },
        { title: "8. Safety & Conduct", text: "Students should leave the premises immediately after class. Hanging around or creating disturbance outside is not allowed." },
        { title: "9. Communication", text: "All important updates will be shared via WhatsApp or notice. Students/parents must stay updated." },
        { title: "10. Management Rights", text: "CERREBRO Tutorials reserves the right to change rules, schedule, or policies anytime. Final decisions of management will be binding." }
      ]
    }
  };

  return (
    <>
      <footer className="bg-white text-slate-600 border-t border-slate-100 relative z-10 overflow-hidden">
        
        {/* Subtle Background Accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#6FCB6C]/5 to-transparent rounded-t-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 gap-10 lg:gap-12 lg:grid-cols-12">
            
            {/* Column 1: Branding and Socials */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Cerrebro" className="h-10 w-auto" onError={(e) => e.target.style.display='none'} />
                <span className="text-2xl font-black text-[#1E293B] tracking-tight">CERREBRO</span>
              </div>
              <p className="text-slate-500 leading-relaxed mb-6 font-medium text-sm sm:pr-8">
                Empowering students with quality education, strict discipline, and expert guidance to build a brighter, successful future.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center rounded-xl hover:bg-[#6FCB6C] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6FCB6C]/30 transition-all duration-300"><FaFacebook size={18} /></a>
                <a href="#" className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center rounded-xl hover:bg-[#6FCB6C] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6FCB6C]/30 transition-all duration-300"><FaTwitter size={18} /></a>
                <a href="#" className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center rounded-xl hover:bg-[#6FCB6C] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6FCB6C]/30 transition-all duration-300"><FaInstagram size={18} /></a>
                <a href="#" className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center rounded-xl hover:bg-[#6FCB6C] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-[#6FCB6C]/30 transition-all duration-300"><FaLinkedin size={18} /></a>
              </div>
            </div>

            {/* Mobile Optimizer: Group Links Side-by-Side on Small Screens */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-8">
              {/* Column 2: Quick Links */}
              <div>
                <h3 className="text-sm font-bold text-[#1E293B] mb-5 uppercase tracking-wider">Explore</h3>
                <ul className="space-y-3">
                  <li><a href="#hero" className={linkStyles}>Home</a></li>
                  <li><a href="#courses" className={linkStyles}>Courses</a></li>
                  <li><a href="#achievers" className={linkStyles}>Achievers</a></li>
                  <li><a href="#gallery" className={linkStyles}>Gallery</a></li>
                  <li><a href="#contact" className={linkStyles}>Contact Us</a></li>
                </ul>
              </div>

              {/* Column 3: Legal */}
              <div>
                <h3 className="text-sm font-bold text-[#1E293B] mb-5 uppercase tracking-wider">Legal</h3>
                <ul className="space-y-3">
                  <li><button onClick={() => setActiveModal('privacy')} className={linkStyles}>Privacy Policy</button></li>
                  <li><button onClick={() => setActiveModal('terms')} className={linkStyles}>Terms & Conditions</button></li>
                </ul>
              </div>
            </div>

            {/* Column 4: Contact Us */}
            <div className="lg:col-span-4 lg:pl-4">
              <h3 className="text-sm font-bold text-[#1E293B] mb-5 uppercase tracking-wider">Get in Touch</h3>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li className="flex items-start gap-3 group cursor-default">
                  <div className="p-2 bg-slate-50 rounded-lg text-[#6FCB6C] group-hover:bg-[#6FCB6C] group-hover:text-white transition-colors">
                    <FiMapPin size={16} />
                  </div>
                  <span className="mt-1 leading-relaxed">Balkrushna kunj, Manjri Rd, Takle Nagar, Gopalpatti, Pune, Maharashtra 412307</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-slate-50 rounded-lg text-[#6FCB6C] group-hover:bg-[#6FCB6C] group-hover:text-white transition-colors">
                    <FiPhone size={16} />
                  </div>
                  <a href="tel:+917058161172" className="hover:text-[#6FCB6C] transition-colors">+91 7058161172</a>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="p-2 bg-slate-50 rounded-lg text-[#6FCB6C] group-hover:bg-[#6FCB6C] group-hover:text-white transition-colors">
                    <FiMail size={16} />
                  </div>
                  <a href="mailto:cerrebrotutorials@gmail.com" className="hover:text-[#6FCB6C] transition-colors truncate">cerrebrotutorials@gmail.com</a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} CERREBRO Tutorials. All Rights Reserved.
            </p>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              Designed & Developed with <span className="text-rose-500">Xpertuse</span>
            </p>
          </div>
        </div>
      </footer>

      {/* =========================================
          MODAL OVERLAY FOR PRIVACY & TERMS
      ========================================= */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-5 md:px-8 py-5 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-[#1E293B]">{modalContent[activeModal].title}</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Last Updated: {modalContent[activeModal].updated}</p>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all shrink-0 ml-4"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 md:p-8 overflow-y-auto">
                {activeModal === 'privacy' && <p className="text-slate-500 mb-6 font-medium text-sm md:text-base">At CERREBRO Tutorials, we respect and protect the privacy of our students and parents.</p>}
                
                <div className="space-y-6 md:space-y-8">
                  {modalContent[activeModal].sections.map((sec, idx) => (
                    <div key={idx}>
                      <h3 className="flex items-center gap-2 text-base md:text-lg font-bold text-[#1E293B] mb-2 md:mb-3">
                        <span className="text-[#6FCB6C]">📌</span> {sec.title}
                      </h3>
                      <ul className="space-y-2 pl-6 md:pl-7">
                        {sec.text.split('. ').map((sentence, sIdx) => {
                          if (!sentence) return null;
                          return (
                            <li key={sIdx} className="text-slate-600 font-medium text-sm md:text-base leading-relaxed relative before:content-[''] before:absolute before:left-[-16px] before:top-[8px] md:before:top-[10px] before:w-1.5 before:h-1.5 before:bg-[#6FCB6C] before:rounded-full">
                                {sentence.replace('.', '')}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 md:px-8 py-4 flex justify-end">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="bg-[#6FCB6C] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#5bb858] transition-colors w-full sm:w-auto"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;