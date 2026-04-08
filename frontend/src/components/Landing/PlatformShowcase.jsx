import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiTarget, FiHeart, FiTrendingUp } from 'react-icons/fi';
import logo from '../../assets/logo.png';

const content = {
  en: {
    badge: "Our Journey",
    title: "The Genesis of CERREBRO",
    p1: "CERREBRO Tutorials started with a simple aim — to help students who were struggling with basics and lacked confidence in studies. With just a few students and strong dedication, we focused on concept clarity, personal attention, and regular practice instead of only finishing the syllabus.",
    p2: "Slowly, students began improving not only in marks but also in confidence, discipline, and study habits. Parents started trusting the system because they could actually see the change in their children. Regular tests, doubt-solving sessions, and continuous guidance became the identity of CERREBRO.",
    p3: "Today, CERREBRO Tutorials is not just a coaching class — it is a learning family where every student is guided personally, motivated regularly, and prepared not only for exams but also for their future education. Our goal is simple: build strong basics, create confidence, and help every student realize their true potential.",
    sloganTop: "At CERREBRO, we don’t just teach subjects...",
    sloganBottom: "we build students.",
    logoMeaningTitle: "Meaning behind 'Cerrebro'",
    logoMeaningDesc: "Derived from 'Cerebrum' (the largest part of the brain). It represents intellect, continuous learning, and unlocking infinite human potential."
  },
  mr: {
    badge: "आमचा प्रवास",
    title: "सेरेब्रो ट्युटोरियल्सची सुरुवात",
    p1: "सेरेब्रो ट्युटोरियल्सची सुरुवात एका साध्या उद्देशाने झाली — ज्या विद्यार्थ्यांना अभ्यासात मूलभूत गोष्टी समजण्यात अडचण येत होती आणि आत्मविश्वासाची कमतरता होती त्यांना मदत करणे. मोजक्याच विद्यार्थ्यांसह आणि दृढ निष्ठेने, आम्ही फक्त अभ्यासक्रम पूर्ण करण्यावर भर न देता संकल्पना स्पष्ट करणे, वैयक्तिक लक्ष देणे आणि नियमित सराव यावर लक्ष केंद्रित केले.",
    p2: "हळूहळू, विद्यार्थ्यांच्या केवळ गुणांमध्येच नव्हे तर त्यांच्या आत्मविश्वासात, शिस्तीत आणि अभ्यासाच्या सवयींमध्येही सुधारणा होऊ लागली. पालकांनी आमच्या प्रणालीवर विश्वास ठेवायला सुरुवात केली कारण ते त्यांच्या मुलांमधील बदल प्रत्यक्ष पाहू शकत होते. नियमित चाचण्या, शंका निरसन सत्रे आणि सतत मार्गदर्शन ही सेरेब्रोची ओळख बनली.",
    p3: "आज, सेरेब्रो ट्युटोरियल्स हा केवळ एक कोचिंग क्लास नाही — तर तो एक शिकणारा परिवार आहे जिथे प्रत्येक विद्यार्थ्याला वैयक्तिक मार्गदर्शन मिळते, नियमितपणे प्रेरित केले जाते आणि केवळ परीक्षांसाठीच नव्हे तर त्यांच्या भविष्यातील शिक्षणासाठीही तयार केले जाते. आमचे ध्येय सोपे आहे: भक्कम पाया तयार करणे, आत्मविश्वास निर्माण करणे आणि प्रत्येक विद्यार्थ्याला त्यांच्या खऱ्या क्षमतेची जाणीव करून देण्यास मदत करणे.",
    sloganTop: "सेरेब्रोमध्ये, आम्ही फक्त विषय शिकवत नाही...",
    sloganBottom: "तर आम्ही विद्यार्थी घडवतो.",
    logoMeaningTitle: "'सेरेब्रो' या नावामागील अर्थ",
    logoMeaningDesc: "'सेरेब्रम' (मेंदूचा सर्वात मोठा भाग) या शब्दावरून प्रेरित. हे बुद्धिमत्ता, सतत शिकण्याची वृत्ती आणि मानवी क्षमतेचा अमर्याद विकास दर्शवते."
  }
};

const OurJourney = () => {
  const [lang, setLang] = useState('en'); // 'en' or 'mr'
  const t = content[lang];

  return (
    <section className="py-20 md:py-32 bg-[#0F172A] text-white overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6FCB6C]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/3"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
        
        {/* --- LEFT TEXT SECTION --- */}
        <div className="lg:col-span-7 flex flex-col items-start">
          
          {/* Header & Language Toggle */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block py-1.5 px-4 bg-[#6FCB6C]/10 border border-[#6FCB6C]/30 text-[#6FCB6C] font-extrabold text-xs tracking-widest uppercase rounded-full shadow-sm mb-4">
                {t.badge}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {t.title}
              </h2>
            </motion.div>

            {/* Premium Language Toggle */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-xl border border-slate-700/50 shadow-inner self-start sm:self-auto"
            >
              <button 
                onClick={() => setLang('en')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${lang === 'en' ? 'bg-[#6FCB6C] text-[#0F172A] shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                <FiGlobe className={lang === 'en' ? 'animate-spin-slow' : ''} /> EN
              </button>
              <button 
                onClick={() => setLang('mr')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${lang === 'mr' ? 'bg-[#6FCB6C] text-[#0F172A] shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                मराठी
              </button>
            </motion.div>
          </div>

          {/* Animated Story Paragraphs */}
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={lang} // Changing the key triggers the unmount/mount animation when language swaps
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
                className="space-y-6 text-slate-300 md:text-lg leading-relaxed font-medium"
              >
                <p className="flex gap-4">
                  <FiTarget className="text-[#6FCB6C] shrink-0 mt-1.5" size={20}/>
                  <span>{t.p1}</span>
                </p>
                <p className="flex gap-4">
                  <FiTrendingUp className="text-blue-400 shrink-0 mt-1.5" size={20}/>
                  <span>{t.p2}</span>
                </p>
                <p className="flex gap-4">
                  <FiHeart className="text-rose-400 shrink-0 mt-1.5" size={20}/>
                  <span>{t.p3}</span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* --- RIGHT LOGO & SLOGAN SECTION --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }}
          className="lg:col-span-5 relative flex flex-col items-center justify-center mt-8 lg:mt-0"
        >
            
          {/* Animated Logo Container */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
            
            {/* Pulsing Aura Rings */}
            <div className="absolute inset-0 bg-[#6FCB6C]/20 rounded-full blur-2xl animate-pulse"></div>
            
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border-2 border-dashed border-[#6FCB6C]/30"
            ></motion.div>
            
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-10 rounded-full border border-blue-400/20"
            ></motion.div>

            {/* The Logo (Floating Effect) */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-40 h-40 md:w-48 md:h-48 bg-white rounded-full p-4 shadow-[0_0_50px_rgba(111,203,108,0.3)] flex items-center justify-center"
            >
              {/* REPLACE THIS WITH YOUR ACTUAL LOGO */}
              <img 
                src={logo} // Update this path to your actual logo
                alt="Cerrebro Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Logo Meaning Floating Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 -right-4 md:-right-12 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl w-56 z-20"
            >
              <h5 className="text-[#6FCB6C] font-bold text-sm mb-1">{t.logoMeaningTitle}</h5>
              <p className="text-slate-300 text-xs leading-relaxed">{t.logoMeaningDesc}</p>
            </motion.div>
          </div>

          {/* Slogan Banner */}
          <div className="text-center w-full relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={lang}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-slate-400 text-lg md:text-xl font-medium mb-2 italic">
                  "{t.sloganTop}"
                </p>
                <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6FCB6C] to-[#4a9648] tracking-tight">
                  {t.sloganBottom} ✨
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default OurJourney;