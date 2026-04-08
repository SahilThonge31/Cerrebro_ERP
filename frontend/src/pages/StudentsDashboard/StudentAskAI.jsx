import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';
import { FiSend, FiUser, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const StudentAskAI = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your Cerrebro AI Tutor. What subject are we studying today?", sender: 'ai' }
  ]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => { 
    scrollToBottom(); 
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/ai/ask', { prompt: userMessage }, {
        headers: { 'x-auth-token': token }
      });

      setMessages(prev => [...prev, { text: res.data.answer, sender: 'ai' }]);
    } catch (err) {
      console.error("Full Error:", err.response || err);
      const errorMsg = err.response?.data?.msg || "Sorry, I'm having trouble connecting to the Cerrebro servers right now! Please try again.";
      setMessages(prev => [...prev, { text: errorMsg, sender: 'ai', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden">
      
      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src={logo} alt="Background Watermark" className="w-[80%] max-w-lg object-contain" />
      </div>

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-3 md:p-4 flex items-center gap-3 md:gap-4 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 border border-gray-200">
          <FiArrowLeft className="text-gray-600" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 p-1 shrink-0">
            <img src={logo} alt="Cerrebro" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-green-600 tracking-tight text-lg md:text-xl">CERREBRO-AI</h1>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full custom-scrollbar relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-end gap-2 md:gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {/* AI Avatar */}
            {msg.sender === 'ai' && (
               <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-100 shadow-sm p-1">
                  <img src={logo} alt="AI" className="h-full w-full object-contain" />
               </div>
            )}

            {/* Message Bubble */}
            <div className={`p-3 md:p-4 max-w-[85%] md:max-w-[75%] rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap
              ${msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none border border-blue-700' 
                : msg.isError 
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
            
            {/* User Avatar */}
            {msg.sender === 'user' && (
               <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
                  <FiUser className="text-blue-600 text-sm md:text-base" />
               </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-end gap-2 md:gap-3 justify-start">
            <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-blue-100 shadow-sm p-1">
               <img src={logo} alt="AI" className="h-full w-full object-contain opacity-50" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
              <span className="text-sm font-bold text-blue-600 tracking-wide">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </main>

      {/* INPUT AREA */}
      <footer className="bg-white border-t border-gray-200 p-3 md:p-6 relative z-20">
        <form onSubmit={handleSend} className="max-w-5xl mx-auto relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your Cerrebro Tutor..." 
            className="w-full bg-gray-50 border border-gray-300 rounded-full py-3 md:py-4 pl-5 md:pl-6 pr-14 md:pr-16 text-gray-800 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-blue-600 text-sm md:text-base"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-1.5 md:right-2 p-2.5 md:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:bg-gray-400"
          >
            <FiSend size={18} className="ml-0.5 mt-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default StudentAskAI;