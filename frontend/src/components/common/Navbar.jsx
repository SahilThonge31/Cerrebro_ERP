import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiX, FiBell, FiUser, FiSettings, 
  FiLogOut, FiGrid, FiChevronRight, FiBookOpen,
  FiInfo, FiCalendar, FiClock, FiMessageCircle
} from 'react-icons/fi';
import logo from '../../assets/logo.png';
import Button from '../common/button';
import api from '../../api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ name: '', role: 'student', profilePic: null });
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null); 

  // Chat Notification State
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // UI Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // --- 1. INITIALIZATION & DATA FETCHING ---
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('name');
      
      if (token && name) {
        setIsLoggedIn(true);
        setUserData({ name: name, role: 'student', profilePic: null }); // Initial fast load

        try {
            // Fetch precise user data for the Profile Picture
            const userRes = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
            setUserData({ name: userRes.data.name, role: 'student', profilePic: userRes.data.profilePic });

            // Fetch initial Chat Unread Count
            const chatRes = await api.get('/chat/unread', { headers: { 'x-auth-token': token } });
            const totalUnreadChat = Object.values(chatRes.data).reduce((acc, count) => acc + count, 0);
            setChatUnreadCount(totalUnreadChat);

        } catch (error) {
            console.error("Failed to fetch extended user data");
        }

        fetchNotifications(); 
      } else {
        setIsLoggedIn(false);
        setUserData({ name: '', role: '', profilePic: null });
      }
    };

    checkLoginStatus();
    
    // Listen for real-time chat updates emitted from the Chat Component
    const handleChatUpdate = (e) => setChatUnreadCount(e.detail);
    window.addEventListener('unread_messages_update', handleChatUpdate);

    window.addEventListener('storage', checkLoginStatus);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Click Outside to Close Notification Dropdown
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsNotifOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('unread_messages_update', handleChatUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location]);

  // --- 2. SYSTEM NOTIFICATION LOGIC ---
  const fetchNotifications = async () => {
      if (!localStorage.getItem('token')) return;
      try {
          const token = localStorage.getItem('token');
          const res = await api.get('/notifications', { headers: { 'x-auth-token': token } });
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch (err) { }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleNotificationClick = (notif) => {
      setSelectedNotif(notif); 
      setIsNotifOpen(false); 
      
      if (!notif.isRead) {
          const updated = notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n);
          setNotifications(updated);
          setUnreadCount(updated.filter(n => !n.isRead).length);
      }
  };

  const handleMarkAllRead = async () => {
      try {
          const token = localStorage.getItem('token');
          await api.put('/notifications/read-all', {}, { headers: { 'x-auth-token': token } });
          
          // Instantly update UI to reflect all are read
          const updated = notifications.map(n => ({ ...n, isRead: true }));
          setNotifications(updated);
          setUnreadCount(0);
      } catch (err) {
          console.error("Failed to mark all as read", err);
      }
  };

  // --- 3. HANDLERS ---
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsSidebarOpen(false);
    navigate('/');
  };

  // 🚨 STRICTLY STUDENT ROUTES ONLY 🚨
  const menuItems = [
    { name: 'Dashboard', icon: FiGrid, path: '/studentdashboard' },
    { name: 'My Profile', icon: FiUser, path: '/student/profile' },
    { name: 'My Courses', icon: FiBookOpen, path: '/courses' },
    { name: 'Settings', icon: FiSettings, path: '/student/settings' },
    { name: 'Ask Teachers', icon: FiMessageCircle, path: '/student/chat' },
  ];

  // --- 4. SIDEBAR DRAWER ---
  const SidebarDrawer = () => (
    <>
      <div 
        className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-500"
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <div className="fixed right-0 top-0 z-50 h-full w-[300px] transform bg-white shadow-2xl transition-transform duration-300 ease-out animate-slide-in-right overflow-y-auto custom-scrollbar">
        
        {/* 👇 --- PROFESSIONAL REDESIGNED PROFILE HEADER --- 👇 */}
        <div className="relative overflow-hidden bg-[#0F172A] p-6 pb-8 shadow-md">
          {/* Decorative Background Elements */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>

          {/* Close Button */}
          <div className="relative z-10 flex justify-end mb-4">
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="rounded-full bg-white/5 p-2 text-gray-400 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white active:scale-95"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Centered Premium Profile Info */}
          <div className="relative z-10 flex flex-col items-center text-center mt-2">
            <div className="relative group">
              {/* Glowing Animated Ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
              
              {/* Avatar */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/10 bg-slate-800 text-2xl font-black text-white shadow-xl overflow-hidden shrink-0">
                {userData.profilePic ? (
                  <img src={userData.profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  userData.name ? userData.name.charAt(0).toUpperCase() : 'S'
                )}
              </div>
              
              {/* Online Status Badge */}
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#0F172A] bg-green-500 shadow-sm"></div>
            </div>

            <div className="mt-4 w-full min-w-0">
              <h2 className="text-xl font-extrabold tracking-tight text-white truncate px-2">
                {userData.name || 'Student Name'}
              </h2>
              {/* Modern Glassmorphic Role Badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 shadow-inner">
                <FiUser size={12} className="text-blue-400" />
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                  {userData.role || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* 👆 --- END REDESIGNED HEADER --- 👆 */}

        {/* Navigation Links */}
        <div className="flex flex-col justify-between min-h-[calc(100%-240px)] p-6 bg-white">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon 
                      size={20}
                      className={`transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                    />
                    {item.name}
                  </div>

                  {/* 💬 CHAT BADGE INSIDE DRAWER */}
                  {item.name === 'Ask Teachers' && chatUnreadCount > 0 ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm mr-2 z-10">
                          {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                      </span>
                  ) : (
                      <FiChevronRight 
                        className={`transition-transform duration-300 ${isActive ? 'text-blue-600' : 'text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} 
                      />
                  )}
                  {isActive && <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-600"></div>}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-gray-100 pt-6 mt-6">
            <button 
              onClick={handleLogout}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-red-50 bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200"
            >
              <FiLogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <nav className={`fixed top-0 z-30 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 shadow-md backdrop-blur-md' : 'bg-white shadow-sm'}`}>
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          
          {/* Logo Section */}
          <div className="flex cursor-pointer items-center gap-3" onClick={() => navigate('/')}>
            <img src={logo} alt="Cerrebro Logo" className="h-10 w-auto transition-transform hover:scale-105" />
            <span className="hidden md:block font-heading text-xl font-bold tracking-tight text-gray-800">
              CERREBRO <span className="text-blue-600">TUTORIALS</span>
            </span>
            <span className="md:hidden font-heading text-lg font-bold text-gray-800">CERREBRO</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {isLoggedIn ? (
              <>
                {/* 🔔 SYSTEM NOTIFICATIONS */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)} 
                        className={`relative p-2.5 transition-all duration-300 rounded-full flex items-center justify-center
                            ${isNotifOpen ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}
                        `}
                    >
                        <FiBell size={22} className={unreadCount > 0 && !isNotifOpen ? 'animate-wiggle' : ''} />
                        
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* 🔽 MODERN DROPDOWN MENU 🔽 */}
                    {isNotifOpen && (
                        <div className="absolute right-0 top-14 w-[320px] md:w-[400px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100/50 overflow-hidden animate-fade-in-up origin-top-right z-50 flex flex-col">
                            
                            <div className="px-5 py-4 border-b border-gray-100/80 bg-gray-50/50 flex justify-between items-center backdrop-blur-md shrink-0">
                                <h3 className="font-black text-gray-800 text-base tracking-tight">Notifications</h3>
                                {unreadCount > 0 ? (
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={handleMarkAllRead}
                                            className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-wider transition"
                                        >
                                            Mark all read
                                        </button>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100/80 border border-blue-200 px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                                            {unreadCount} New
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">All Caught Up</span>
                                )}
                            </div>
                            
                            <div className="max-h-[420px] overflow-y-auto custom-scrollbar bg-white">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <FiBell size={30} className="mx-auto mb-2 opacity-20"/>
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div 
                                            key={notif._id} 
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 flex gap-3
                                                ${!notif.isRead ? 'bg-blue-50/40' : 'bg-white'}
                                            `}
                                        >
                                            <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!notif.isRead ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                            <div>
                                                <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                                <span className="text-[10px] text-gray-400 mt-2 block">
                                                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Toggle (Hamburger Menu) */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-full p-2.5 text-gray-700 transition hover:bg-gray-100 hover:text-blue-600 active:scale-95 relative"
                >
                  <FiMenu size={26} />
                  
                  {/* 🔴 CHAT UNREAD BADGE ON HAMBURGER ICON */}
                  {chatUnreadCount > 0 && !isSidebarOpen && (
                      <span className="absolute top-2 right-2 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>
              </>
            ) : (
              // Logged Out State
              <>
                <div className="hidden md:flex items-center gap-4">
                   <Button className="px-6 py-2.5 shadow-lg shadow-blue-200" onClick={() => navigate('/login')}>Login</Button>
                   <Button variant="outline" className="px-6 py-2.5" onClick={() => navigate('/enroll')}>Enroll Now</Button>
                </div>
                <button className="text-gray-600 md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Dropdown (Logged Out Only) */}
        {!isLoggedIn && isSidebarOpen && (
          <div className="absolute top-20 left-0 w-full animate-fade-in-down border-t bg-white p-4 shadow-lg md:hidden">
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/login')}>Login</Button>
              <Button className="w-full justify-center" onClick={() => navigate('/enroll')}>Enroll Now</Button>
            </div>
          </div>
        )}
      </nav>

      {/* RENDER SIDEBAR (LOGGED IN) */}
      {isLoggedIn && isSidebarOpen && <SidebarDrawer />}

      {/* --- 📄 NEW PROFESSIONAL NOTIFICATION MODAL --- */}
      {selectedNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-white/20">
                  <div className="p-8">
                      {/* Top row: Category & Close */}
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-2">
                              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                  <FiInfo size={20} />
                              </div>
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                  {selectedNotif.type || 'System Notice'}
                              </span>
                          </div>
                          <button 
                              onClick={() => setSelectedNotif(null)} 
                              className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                          >
                              <FiX size={20}/>
                          </button>
                      </div>

                      {/* Title & Meta */}
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                          {selectedNotif.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400 mb-6">
                          <span className="flex items-center gap-1.5"><FiCalendar className="text-gray-300"/> {new Date(selectedNotif.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          <span className="flex items-center gap-1.5"><FiClock className="text-gray-300"/> {new Date(selectedNotif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {/* Body */}
                      <div className="text-gray-600 leading-relaxed text-sm font-medium bg-gray-50/50 p-5 rounded-2xl border border-gray-50 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {selectedNotif.message}
                      </div>

                      {/* Action */}
                      <button 
                          onClick={() => setSelectedNotif(null)}
                          className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 active:scale-[0.98] transition-all"
                      >
                          Acknowledge & Close
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;