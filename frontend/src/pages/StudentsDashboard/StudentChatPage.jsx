import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'; 
import api from '../../api';
import Navbar from '../../components/common/Navbar';
import { 
    FiSend, FiMoreVertical, FiSearch, 
    FiArrowLeft, FiLoader, FiMessageCircle, FiMenu, FiUser, FiBell 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const ENDPOINT = "http://localhost:5000"; 

const StudentChatPage = () => {
  // --- UI STATES ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // --- DATA STATES ---
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);
  
  // Student Profile
  const [studentData, setStudentData] = useState(null);

  // --- REAL-TIME & NOTIFICATION STATES ---
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({}); 
  const [unreadCounts, setUnreadCounts] = useState({});

  const socket = useRef(null);
  const currentChatRef = useRef(null);
  const scrollRef = useRef();

  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);

  // 0. Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/auth/user', { headers: { 'x-auth-token': token } });
            setStudentData(res.data);

            const unreadRes = await api.get('/chat/unread', { headers: { 'x-auth-token': token } });
            setUnreadCounts(unreadRes.data);
        } catch(err) { console.error("Failed to load initial data", err); }
    };
    fetchInitialData();

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 1. SOCKET CONNECTION ---
  useEffect(() => {
    if(!studentData?._id) return;

    socket.current = io(ENDPOINT);
    socket.current.emit('join', studentData._id);

    socket.current.on('initial_online_users', (userIds) => {
        const onlineObj = {};
        userIds.forEach(id => { onlineObj[id] = 'online'; });
        setOnlineUsers(prev => ({ ...prev, ...onlineObj }));
    });

    socket.current.on('receive_message', (data) => {
        const activeChatId = currentChatRef.current?._id;

        if (activeChatId && (data.senderId === activeChatId || data.senderId === studentData._id)) {
            setMessages(prev => {
                if (prev.some(m => m._id === data._id)) return prev;
                return [...prev, data];
            });
            scrollToBottom();

            const token = localStorage.getItem('token');
            api.put('/chat/mark-read', { senderId: data.senderId }, { headers: { 'x-auth-token': token } });
        } else {
            toast.custom((t) => (
                <div className="bg-white border-l-4 border-indigo-500 p-4 rounded shadow-lg flex items-center gap-3">
                    <FiBell className="text-indigo-500 text-xl animate-bounce" />
                    <div>
                        <p className="font-bold text-sm text-slate-800">New Message</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{data.message}</p>
                    </div>
                </div>
            ), { duration: 4000 });

            setUnreadCounts(prev => ({ ...prev, [data.senderId]: (prev[data.senderId] || 0) + 1 }));
        }
    });

    socket.current.on('display_typing', (data) => {
        if (currentChatRef.current && data.senderId === currentChatRef.current._id) setIsTyping(true);
    });

    socket.current.on('hide_typing', (data) => {
        if (currentChatRef.current && data.senderId === currentChatRef.current._id) setIsTyping(false);
    });

    socket.current.on('user_status', (data) => {
        setOnlineUsers(prev => ({ ...prev, [data.userId]: data.status }));
    });

    return () => { if(socket.current) socket.current.disconnect(); };
  }, [studentData]);

  // --- 2. FETCH CONTACTS (Teachers for this student) ---
  useEffect(() => {
    const fetchContacts = async () => {
        setContactsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/chat/contacts/student`, { headers: { 'x-auth-token': token } });
            setContacts(res.data);
            setFilteredContacts(res.data);
        } catch (err) { toast.error("Failed to load teachers"); } 
        finally { setContactsLoading(false); }
    };
    fetchContacts();
  }, []);

  // --- 3. FILTER CONTACTS ---
  useEffect(() => {
      if(!searchQuery) setFilteredContacts(contacts);
      else setFilteredContacts(contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, contacts]);

  // --- 4. LOAD HISTORY & CLEAR UNREAD ---
  const loadChat = async (person) => {
      setCurrentChat(person);
      setMessages([]);
      try {
          const token = localStorage.getItem('token');
          const res = await api.get(`/chat/history/${person._id}`, { headers: { 'x-auth-token': token } });
          if (Array.isArray(res.data)) setMessages(res.data);

          if (unreadCounts[person._id] > 0) {
              setUnreadCounts(prev => ({ ...prev, [person._id]: 0 }));
              await api.put('/chat/mark-read', { senderId: person._id }, { headers: { 'x-auth-token': token } });
          }
          scrollToBottom();
      } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- 5. SEND MESSAGE ---
  const sendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !studentData || !socket.current) return;

      const messageData = {
          senderId: studentData._id,
          senderRole: 'student',
          receiverId: currentChat._id,
          receiverRole: 'teacher',
          message: newMessage,
          createdAt: new Date().toISOString()
      };

      socket.current.emit('send_message', messageData);
      socket.current.emit('stop_typing', { receiverId: currentChat._id, senderId: studentData._id });

      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      scrollToBottom();
  };

  const formatMessageTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isToday) return `Today, ${time}`;
      if (isYesterday) return `Yesterday, ${time}`;
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`;
  };

  const handleTyping = (e) => {
      setNewMessage(e.target.value);
      if (!socket.current || !currentChat) return;
      socket.current.emit('typing', { receiverId: currentChat._id, senderId: studentData._id });
      setTimeout(() => {
          socket.current.emit('stop_typing', { receiverId: currentChat._id, senderId: studentData._id });
      }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800" >
      <Toaster position="top-right" />
      <Navbar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all w-full flex flex-col h-screen">
        
        {/* Header */}
        <header className="bg-white px-6 py-6 shadow-sm flex justify-between items-center z-20 shrink-0">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-slate-500" onClick={() => setIsSidebarOpen(true)}>
                    <FiMenu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FiMessageCircle className="text-indigo-600"/> Ask Teachers
                </h1>
            </div>
        </header>

        {/* --- MAIN CHAT LAYOUT --- */}
        <div className="flex-1 flex overflow-hidden p-0 md:p-6 max-w-7xl mx-auto w-full">
            
            {/* CONTAINER FOR BORDER RADIUS ON DESKTOP */}
            <div className="flex-1 flex w-full bg-white md:rounded-3xl md:shadow-sm md:border border-slate-200 overflow-hidden relative">
                
                {/* LEFT SIDEBAR (My Teachers) */}
                <div className={`
                    w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300
                    ${isMobileView && currentChat ? 'hidden' : 'flex'}
                `}>
                    <div className="p-5 border-b border-slate-200 bg-white">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                            My Teachers
                        </h2>
                        {/* Search */}
                        <div className="relative">
                            <FiSearch className="absolute top-3.5 left-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search teacher..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 transition"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {contactsLoading ? (
                            <div className="flex justify-center py-10"><FiLoader className="animate-spin text-indigo-500"/></div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm mt-10 p-4 border border-dashed border-slate-200 rounded-2xl mx-2">
                                No teachers assigned to your class yet.
                            </div>
                        ) : (
                            filteredContacts.map(contact => (
                                <div 
                                    key={contact._id} 
                                    onClick={() => loadChat(contact)}
                                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition border border-transparent
                                        ${currentChat?._id === contact._id ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'hover:bg-white hover:border-slate-200 hover:shadow-sm'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                                {contact.profilePic ? <img src={contact.profilePic} className="h-full w-full object-cover" /> : <FiUser className="text-slate-400"/>}
                                            </div>
                                            {onlineUsers[contact._id] === 'online' && (
                                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{contact.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {contact.subjects && contact.subjects.length > 0 ? contact.subjects.join(', ') : 'Teacher'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* UNREAD BADGE */}
                                    {unreadCounts[contact._id] > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                            {unreadCounts[contact._id]}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE (Chat Window) */}
                <div className={`
                    flex-1 flex flex-col bg-white transition-all duration-300
                    ${isMobileView && !currentChat ? 'hidden' : 'flex'}
                `}>
                    {currentChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-20 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0 z-10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setCurrentChat(null)} className="md:hidden text-slate-500 bg-slate-50 p-2 rounded-full"><FiArrowLeft size={20}/></button>
                                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 shadow-sm">
                                        {currentChat.profilePic ? <img src={currentChat.profilePic} className="h-full w-full object-cover"/> : <span className="text-indigo-600 font-bold">{currentChat.name[0]}</span>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base">{currentChat.name}</h3>
                                        {isTyping ? (
                                            <p className="text-xs text-indigo-500 font-bold animate-pulse">typing...</p>
                                        ) : (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className={`h-2 w-2 rounded-full ${onlineUsers[currentChat._id] === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                <span className="text-xs text-slate-500 font-medium">{onlineUsers[currentChat._id] === 'online' ? 'Active Now' : 'Offline'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                                        <FiMessageCircle size={40} className="text-slate-300 mb-3" />
                                        <p className="text-sm font-bold text-slate-400">Got a question? Ask your teacher!</p>
                                    </div>
                                )}
                                
                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === studentData._id;
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                                                ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'}
                                            `}>
                                                <p>{msg.message}</p>
                                                <span className={`text-[10px] block mt-1.5 font-medium ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
                                                   {formatMessageTime(msg.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Typing Bubble */}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white p-3 rounded-2xl rounded-bl-sm border border-slate-100 w-16 h-10 flex items-center justify-center gap-1 shadow-sm">
                                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef}></div>
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-white shrink-0 flex gap-3">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={handleTyping}
                                />
                                <button type="submit" disabled={!newMessage.trim()} 
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition active:scale-95 aspect-square flex items-center justify-center">
                                    <FiSend size={20} className="ml-1" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <FiMessageCircle size={40} className="text-indigo-200"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-600">Need Help?</h3>
                            <p className="text-sm mt-2 max-w-xs text-center text-slate-400">Select a teacher from the list to clear your doubts and ask questions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentChatPage;