import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'; 
import api from '../../api';
import { 
    FiSend, FiUser, FiMoreVertical, FiSearch, 
    FiArrowLeft, FiLoader, FiMessageSquare, FiClock, FiBell 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ENDPOINT = "http://localhost:5000"; 

const TeacherChat = ({ teacherData }) => {
  // --- UI STATES ---
  const [activeTab, setActiveTab] = useState('recents'); 
  const [selectedClass, setSelectedClass] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // --- DATA STATES ---
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);

  // --- PAGINATION STATES ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [teacherUser, setTeacherUser] = useState(null);

  // --- REAL-TIME STATES ---
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({}); 
  const [unreadCounts, setUnreadCounts] = useState({}); 

  const socket = useRef(null); 
  const currentChatRef = useRef(null); 
  const scrollRef = useRef();
  const messagesContainerRef = useRef(null); 

  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);

  // 0. Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const userRes = await api.get('/auth/user', { headers: { 'x-auth-token': token } });
            setTeacherUser(userRes.data);
            
            const unreadRes = await api.get('/chat/unread', { headers: { 'x-auth-token': token } });
            setUnreadCounts(unreadRes.data);
        } catch(err) { console.error("Initialization failed", err); }
    };
    fetchInitialData();

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 1. SOCKET CONNECTION ---
  useEffect(() => {
    if (!teacherUser?._id) return; 

    socket.current = io(ENDPOINT);
    socket.current.emit('join', teacherUser._id);

    socket.current.on('initial_online_users', (userIds) => {
        const onlineObj = {};
        userIds.forEach(id => { onlineObj[String(id)] = 'online'; });
        setOnlineUsers(prev => ({ ...prev, ...onlineObj }));
    });

    socket.current.on('receive_message', (data) => {
        const activeChatId = currentChatRef.current?._id;
        
        if (activeChatId && (data.senderId === activeChatId || data.senderId === teacherUser._id)) {
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

            setUnreadCounts(prev => ({
                ...prev,
                [data.senderId]: (prev[data.senderId] || 0) + 1
            }));
        }

        if (activeTab === 'recents') {
            fetchContactsData();
        }
    });

    socket.current.on('display_typing', (data) => {
        if (currentChatRef.current && data.senderId === currentChatRef.current._id) setIsTyping(true);
    });

    socket.current.on('hide_typing', (data) => {
        if (currentChatRef.current && data.senderId === currentChatRef.current._id) setIsTyping(false);
    });

    socket.current.on('user_status', (data) => {
        setOnlineUsers(prev => ({ ...prev, [String(data.userId)]: data.status }));
    });

    return () => { if(socket.current) socket.current.disconnect(); };
  }, [teacherUser?._id, activeTab]); 

  // --- 2. FETCH CONTACTS DATA FUNCTION ---
  const fetchContactsData = async () => {
        setContactsLoading(true);
        try {
            const token = localStorage.getItem('token');
            let res;
            
            if (activeTab === 'recents') {
                res = await api.get(`/chat/recent`, { headers: { 'x-auth-token': token } });
            } else {
                if (activeTab === 'students' && !selectedClass) {
                    setContactsLoading(false);
                    return; 
                }

                // 👇 THE FIX: Splitting logic before the API call
                let queryStandard = selectedClass;
                let queryBoard = '';
                if (selectedClass && selectedClass !== 'all') {
                    const parts = selectedClass.split(' ');
                    queryStandard = parts[0]; 
                    if (parts.length > 1) {
                        queryBoard = parts[1];
                    }
                }

                // Updated API call to include board parameter
                res = await api.get(`/chat/contacts?type=${activeTab}&class=${queryStandard}&board=${queryBoard}`, { 
                    headers: { 'x-auth-token': token } 
                });
            }

            setContacts(res.data);
            setFilteredContacts(res.data);
        } catch (err) { 
            toast.error("Failed to load contacts");
        } finally {
            setContactsLoading(false);
        }
  };

  useEffect(() => {
        setContacts([]);
        setFilteredContacts([]);
        if(!isMobileView) setCurrentChat(null); 
        fetchContactsData();
  }, [activeTab, selectedClass]);

  useEffect(() => {
      if(!searchQuery) setFilteredContacts(contacts);
      else setFilteredContacts(contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, contacts]);

  // --- 4. LOAD HISTORY (WITH PAGINATION) ---
  const loadChat = async (person) => {
      setCurrentChat(person);
      setMessages([]);
      setPage(1); 
      setHasMore(true); 
      
      try {
          const token = localStorage.getItem('token');
          const res = await api.get(`/chat/history/${person._id}?page=1&limit=20`, { headers: { 'x-auth-token': token } });
          
          if (Array.isArray(res.data)) {
              setMessages(res.data);
              if(res.data.length < 20) setHasMore(false); 
          }

          if (unreadCounts[person._id] > 0) {
              setUnreadCounts(prev => ({ ...prev, [person._id]: 0 }));
              await api.put('/chat/mark-read', { senderId: person._id }, { headers: { 'x-auth-token': token } });
          }

          scrollToBottom();
      } catch (err) { console.error(err); }
  };

  // --- 4.b LOAD OLDER MESSAGES ON SCROLL ---
  const loadMoreMessages = async () => {
      if (loadingHistory || !hasMore || !currentChat) return;
      setLoadingHistory(true);

      try {
          const nextPage = page + 1;
          const token = localStorage.getItem('token');
          const res = await api.get(`/chat/history/${currentChat._id}?page=${nextPage}&limit=20`, { headers: { 'x-auth-token': token } });

          if (Array.isArray(res.data)) {
              if (res.data.length < 20) setHasMore(false);

              if (res.data.length > 0) {
                  const scrollContainer = messagesContainerRef.current;
                  const previousScrollHeight = scrollContainer.scrollHeight;

                  setMessages(prev => [...res.data, ...prev]);
                  setPage(nextPage);

                  setTimeout(() => {
                      if (scrollContainer) {
                          scrollContainer.scrollTop = scrollContainer.scrollHeight - previousScrollHeight;
                      }
                  }, 0);
              }
          }
      } catch (err) { console.error("Error loading older messages", err); }
      
      setLoadingHistory(false);
  };

  const handleScroll = (e) => {
      if (e.target.scrollTop === 0) {
          loadMoreMessages();
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- 5. SEND MESSAGE ---
  const sendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !socket.current || !teacherUser) return;

      const messageData = {
          senderId: teacherUser._id, 
          senderRole: 'teacher',
          receiverId: currentChat._id,
          receiverRole: currentChat.role || (activeTab === 'admins' ? 'admin' : 'student'),
          message: newMessage,
          createdAt: new Date().toISOString()
      };

      socket.current.emit('send_message', messageData);
      socket.current.emit('stop_typing', { receiverId: currentChat._id, senderId: teacherUser._id });

      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      scrollToBottom();
      
      if (activeTab === 'recents') fetchContactsData();
  };

  const handleTyping = (e) => {
      setNewMessage(e.target.value);
      if (!socket.current || !currentChat || !teacherUser) return;
      
      socket.current.emit('typing', { receiverId: currentChat._id, senderId: teacherUser._id });
      setTimeout(() => {
          socket.current.emit('stop_typing', { receiverId: currentChat._id, senderId: teacherUser._id });
      }, 2000);
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

  if (!teacherUser) return <div className="flex justify-center py-20"><FiLoader className="animate-spin text-indigo-500 text-3xl"/></div>;

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-200 flex overflow-hidden animate-fade-in-up relative">
        
        {/* LEFT SIDEBAR (Contacts) */}
        <div className={`
            w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col transition-all duration-300
            ${isMobileView && currentChat ? 'hidden' : 'flex'}
        `}>
            <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
                    <button 
                        onClick={() => { setActiveTab('recents'); setSearchQuery(''); }}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-1 ${activeTab === 'recents' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FiClock size={12}/> Recents
                    </button>
                    <button 
                        onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition ${activeTab === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Directory
                    </button>
                    <button 
                        onClick={() => { setActiveTab('admins'); setSearchQuery(''); }}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition ${activeTab === 'admins' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Admins
                    </button>
                </div>

                <div className="space-y-3">
                    {activeTab === 'students' && (
                        <select 
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 bg-slate-50"
                            onChange={(e) => setSelectedClass(e.target.value)}
                            value={selectedClass}
                        >
                            <option value="">Select Class Directory...</option>
                            {teacherData?.classes?.map((cls, i) => {
                                // 👇 THE FIX: Preserve board in select value
                                const combinedValue = typeof cls === 'string' ? cls : `${cls.standard} ${cls.board}`;
                                return (
                                    <option key={i} value={combinedValue}>
                                        Class {typeof cls === 'string' ? cls : `${cls.standard} (${cls.board})`}
                                    </option>
                                );
                            })}
                        </select>
                    )}

                    <div className="relative">
                        <FiSearch className="absolute top-3 left-3 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search name..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-slate-50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {contactsLoading ? (
                    <div className="flex justify-center py-10"><FiLoader className="animate-spin text-indigo-500"/></div>
                ) : filteredContacts.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm mt-10 p-4">
                        {activeTab === 'students' && !selectedClass 
                            ? <div className="flex flex-col items-center gap-2"><FiUser size={24}/><span>Select a class above</span></div>
                            : activeTab === 'recents' ? "No recent chats." : "No contacts found"
                        }
                    </div>
                ) : (
                    filteredContacts.map(contact => (
                        <div 
                            key={contact._id} 
                            onClick={() => loadChat(contact)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border border-transparent
                                ${currentChat?._id === contact._id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-white hover:border-slate-200 hover:shadow-sm'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-100">
                                        {contact.profilePic ? <img src={contact.profilePic} className="h-full w-full object-cover" /> : <FiUser className="text-slate-400"/>}
                                    </div>
                                    {onlineUsers[String(contact._id)] === 'online' && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-700 truncate">{contact.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium capitalize">
                                        {contact.role && activeTab === 'recents' ? `${contact.role} ` : ''} 
                                        {contact.standard ? `(Class ${contact.standard})` : ''}
                                    </p>
                                </div>
                            </div>
                            
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
                    <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-6 bg-white z-10 sticky top-0">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setCurrentChat(null)} 
                                className="md:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-50"
                            >
                                <FiArrowLeft size={20}/>
                            </button>

                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-indigo-100">
                                {currentChat.profilePic ? <img src={currentChat.profilePic} className="h-full w-full object-cover"/> : currentChat.name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm md:text-base">{currentChat.name}</h3>
                                {isTyping ? (
                                    <p className="text-xs text-indigo-500 font-bold animate-pulse">typing...</p>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <div className={`h-2 w-2 rounded-full ${onlineUsers[String(currentChat._id)] === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                        <span className="text-xs text-slate-400">{onlineUsers[String(currentChat._id)] === 'online' ? 'Online' : 'Offline'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div 
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 space-y-4 relative"
                    >
                        {loadingHistory && (
                            <div className="flex justify-center py-2"><FiLoader className="animate-spin text-indigo-400" /></div>
                        )}

                        {messages.length === 0 && !loadingHistory && (
                            <div className="text-center py-10 opacity-50">
                                <p className="text-xs font-bold text-slate-400">No messages yet. Say Hi! 👋</p>
                            </div>
                        )}

                        {messages.map((msg, index) => {
                            const isMe = msg.senderId === teacherUser._id;
                            return (
                                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] md:max-w-[60%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                                        ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}
                                    `}>
                                        <p>{msg.message}</p>
                                        <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {formatMessageTime(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start animate-fade-in-up">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 w-14 h-9 flex items-center gap-1 shadow-sm">
                                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef}></div>
                    </div>

                    <form onSubmit={sendMessage} className="p-3 md:p-4 border-t border-slate-100 flex gap-2 md:gap-3 bg-white">
                        <input 
                            type="text" 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={handleTyping}
                        />
                        <button type="submit" disabled={!newMessage.trim()} 
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl shadow-lg shadow-indigo-200 transition active:scale-95 flex items-center justify-center aspect-square">
                            <FiSend size={20} />
                        </button>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                    <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                        <FiMessageSquare size={36} className="text-indigo-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600">Select a Conversation</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-xs text-center">Select someone to chat with or check your recent messages.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default TeacherChat;