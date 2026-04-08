import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMessageCircle, FiCpu } from 'react-icons/fi';

const FloatingChatWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Optional: Hide the widget if the user is ALREADY on the chat or AI page
  // so it doesn't get in the way of the actual typing areas.
  const isHidden = location.pathname.includes('/chat') || location.pathname.includes('/ask-ai');

  if (isHidden) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[100%] md:w-auto max-w-sm animate-fade-in-up">
      {/*Glassmorphism Capsule 
        bg-white/70 and backdrop-blur-xl create the frosted glass effect
      */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full p-2 gap-2">
        
        {/* --- ROUTE 1: ASK TEACHER --- */}
        <button 
          onClick={() => navigate('/student/chat')} // Update with your actual teacher chat route
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full hover:bg-blue-50/80 transition-all active:scale-95 group"
        >
          <div className="relative">
            <FiMessageCircle className="text-blue-600 text-xl group-hover:scale-110 transition-transform" />
            {/* Notification Dot (Optional) */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border-2 border-white"></span>
            </span>
          </div>
          <span className="font-bold text-blue-800 text-sm md:text-base tracking-wide">
            Ask Teacher
          </span>
        </button>

        {/* Divider */}
        <div className="w-[2px] h-8 bg-gradient-to-b from-transparent via-slate-200 to-transparent rounded-full opacity-50"></div>

        {/* --- ROUTE 2: ASK AI --- */}
        <button 
          onClick={() => navigate('/student/ask-ai')} // Update with your actual AI route
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-50/50 to-purple-50/50 hover:from-indigo-100/80 hover:to-purple-100/80 transition-all active:scale-95 group"
        >
          <div className="relative flex items-center justify-center">
            {/* Animative Logo for AI */}
            <FiCpu className="text-indigo-600 text-xl relative z-10 group-hover:rotate-12 transition-transform" />
            {/* Glowing background behind the AI icon */}
            <div className="absolute inset-0 bg-purple-400 blur-md rounded-full opacity-40 animate-pulse"></div>
          </div>
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-sm md:text-base tracking-wide">
            CERREBRO-AI
          </span>
        </button>

      </div>
    </div>
  );
};

export default FloatingChatWidget;