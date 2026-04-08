import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'; 
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
    FiSend, FiMoreVertical, FiSearch, 
    FiArrowLeft, FiLoader, FiMessageSquare, FiMenu, FiUser, FiBell 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const ENDPOINT = "http://localhost:5000"; 

const AdminChatPage = () => {
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
  
  // Admin Profile
  const [adminData, setAdminData] = useState(null);

  // --- REAL-TIME & NOTIFICATION STATES ---
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({}); 
  const [unreadCounts, setUnreadCounts] = useState({}); // { contactId: count }

  const socket = useRef(null);
  const currentChatRef = useRef(null);
  const scrollRef = useRef();

  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);

  // 👇 NEW: Broadcast unread count changes to the Sidebar
  useEffect(() => {
      const totalUnread = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);
      window.dispatchEvent(new CustomEvent('unread_messages_update', { detail: totalUnread }));
  }, [unreadCounts]);

  // 0. Fetch Initial Data (Profile + Unread Counts) & Handle Resize
  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch Admin ID
            const res = await api.get('/auth/user', { headers: { 'x-auth-token': token } });
            setAdminData(res.data);

            // Fetch Unread Counts
            const unreadRes = await api.get('/chat/unread', { headers: { 'x-auth-token': token } });
            setUnreadCounts(unreadRes.data);
        } catch(err) { 
            console.error("Failed to load initial data", err); 
        }
    };
    fetchInitialData();

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 1. SOCKET CONNECTION ---
  useEffect(() => {
    if(!adminData?._id) return;

    socket.current = io(ENDPOINT);
    socket.current.emit('join', adminData._id);

    // Get list of users already online
    socket.current.on('initial_online_users', (userIds) => {
        const onlineObj = {};
        userIds.forEach(id => { onlineObj[id] = 'online'; });
        setOnlineUsers(prev => ({ ...prev, ...onlineObj }));
    });

    socket.current.on('receive_message', (data) => {
        const activeChatId = currentChatRef.current?._id;

        // Check if the message belongs to the OPEN conversation
        if (activeChatId && (data.senderId === activeChatId || data.senderId === adminData._id)) {
            setMessages(prev => {
                if (prev.some(m => m._id === data._id)) return prev;
                return [...prev, data];
            });
            scrollToBottom();

            // Tell backend we read it immediately
            const token = localStorage.getItem('token');
            api.put('/chat/mark-read', { senderId: data.senderId }, { headers: { 'x-auth-token': token } });
        } else {
            // Chat is CLOSED: Show Toast & Increment Unread Badge
            toast.custom((t) => (
                <div className="bg-white border-l-4 border-blue-500 p-4 rounded shadow-lg flex items-center gap-3">
                    <FiBell className="text-blue-500 text-xl animate-bounce" />
                    <div>
                        <p className="font-bold text-sm text-gray-800">New Message</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{data.message}</p>
                    </div>
                </div>
            ), { duration: 4000 });

            setUnreadCounts(prev => ({
                ...prev,
                [data.senderId]: (prev[data.senderId] || 0) + 1
            }));
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

    return () => {
        if(socket.current) socket.current.disconnect();
    };
  }, [adminData]);

  // --- 2. FETCH CONTACTS (Only Teachers) ---
  useEffect(() => {
    const fetchContacts = async () => {
        setContactsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/chat/contacts/admin?type=teachers`, { 
                headers: { 'x-auth-token': token } 
            });
            setContacts(res.data);
            setFilteredContacts(res.data);
        } catch (err) { 
            console.error(err); 
            toast.error("Failed to load teachers");
        } finally {
            setContactsLoading(false);
        }
    };

    fetchContacts();
  }, []);

  // --- 3. FILTER CONTACTS ---
  useEffect(() => {
      if(!searchQuery) {
          setFilteredContacts(contacts);
      } else {
          setFilteredContacts(contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())));
      }
  }, [searchQuery, contacts]);

  // --- 4. LOAD HISTORY & CLEAR UNREAD ---
  const loadChat = async (person) => {
      setCurrentChat(person);
      setMessages([]);
      try {
          const token = localStorage.getItem('token');
          const res = await api.get(`/chat/history/${person._id}`, { headers: { 'x-auth-token': token } });
          
          if (Array.isArray(res.data)) {
              setMessages(res.data);
          }

          // Clear Unread Count locally and on Server
          if (unreadCounts[person._id] > 0) {
              setUnreadCounts(prev => ({ ...prev, [person._id]: 0 }));
              await api.put('/chat/mark-read', { senderId: person._id }, { headers: { 'x-auth-token': token } });
          }

          scrollToBottom();
      } catch (err) { 
          console.error("Failed to load chat history", err);
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- 5. SEND MESSAGE ---
  const sendMessage = async (e) => {
      e.preventDefault();
      if (!newMessage.trim() || !adminData || !socket.current) return;

      const messageData = {
          senderId: adminData._id,
          senderRole: 'admin',
          receiverId: currentChat._id,
          receiverRole: 'teacher',
          message: newMessage,
          createdAt: new Date().toISOString()
      };

      socket.current.emit('send_message', messageData);
      socket.current.emit('stop_typing', { receiverId: currentChat._id, senderId: adminData._id });

      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      scrollToBottom();
  };

  const handleTyping = (e) => {
      setNewMessage(e.target.value);
      if (!socket.current || !currentChat) return;
      socket.current.emit('typing', { receiverId: currentChat._id, senderId: adminData._id });
      setTimeout(() => {
          socket.current.emit('stop_typing', { receiverId: currentChat._id, senderId: adminData._id });
      }, 2000);
  };

  // 👇 NEW: Smart WhatsApp-style Date Formatter
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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-right" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all w-full flex flex-col h-screen">
        
        {/* Header */}
        <header className="bg-white px-6 py-3 shadow-sm flex justify-between items-center z-20 shrink-0">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>
                    <FiMenu size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiMessageSquare className="text-blue-600"/> Faculty Chat
                </h1>
            </div>
        </header>

        {/* --- MAIN CHAT LAYOUT --- */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT SIDEBAR (Contacts - Teachers Only) */}
            <div className={`
                w-full md:w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300
                ${isMobileView && currentChat ? 'hidden' : 'flex'}
            `}>
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        All Faculty Members
                    </h2>

                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute top-3 left-3 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search teacher..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {contactsLoading ? (
                        <div className="flex justify-center py-10"><FiLoader className="animate-spin text-blue-500"/></div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm mt-10 p-4">
                            No teachers found.
                        </div>
                    ) : (
                        filteredContacts.map(contact => (
                            <div 
                                key={contact._id} 
                                onClick={() => loadChat(contact)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border border-transparent
                                    ${currentChat?._id === contact._id ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {contact.profilePic ? <img src={contact.profilePic} className="h-full w-full object-cover" /> : <FiUser className="text-gray-400"/>}
                                        </div>
                                        {onlineUsers[contact._id] === 'online' && (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-gray-700 truncate">{contact.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {onlineUsers[contact._id] === 'online' ? 'Online' : 'Offline'}
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
                flex-1 flex flex-col bg-gray-50/50 transition-all duration-300
                ${isMobileView && !currentChat ? 'hidden' : 'flex'}
            `}>
                {currentChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setCurrentChat(null)} className="md:hidden text-gray-500"><FiArrowLeft size={20}/></button>
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                                    {currentChat.profilePic ? <img src={currentChat.profilePic} className="h-full w-full object-cover"/> : currentChat.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{currentChat.name}</h3>
                                    {isTyping ? (
                                        <p className="text-xs text-blue-500 font-bold animate-pulse">typing...</p>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <div className={`h-2 w-2 rounded-full ${onlineUsers[currentChat._id] === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span className="text-xs text-gray-400">{onlineUsers[currentChat._id] === 'online' ? 'Online' : 'Offline'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-xs font-bold text-slate-400">No messages yet.</p>
                                </div>
                            )}
                            
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === adminData._id;
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                            ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'}
                                        `}>
                                            <p>{msg.message}</p>
                                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-right text-blue-200' : 'text-right text-gray-400'}`}>
                                                {/* 👇 SMART DATE IMPLEMENTED HERE */}
                                                {formatMessageTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Typing Bubble */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 w-14 h-9 flex items-center gap-1 shadow-sm">
                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef}></div>
                        </div>

                        {/* Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white shrink-0 flex gap-3">
                            <input 
                                type="text" 
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleTyping}
                            />
                            <button type="submit" disabled={!newMessage.trim()} 
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl shadow-lg shadow-blue-200 transition active:scale-95 aspect-square flex items-center justify-center">
                                <FiSend size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                        <FiMessageSquare size={48} className="mb-4 text-gray-200"/>
                        <p className="font-bold text-gray-400">Select a faculty member to chat</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;