import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { 
  FiGrid, FiUsers, FiBriefcase, FiDollarSign, FiCalendar, FiMessageSquare, FiSpeaker, 
  FiSettings, FiLogOut, FiPieChart, FiImage, FiClock, 
  FiCheckSquare, FiBell, FiAward, FiBook
} from 'react-icons/fi';
import logo from '../../assets/logo.png'; 
import api from '../../api'; // 👇 Added API import

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 NEW: State to track total unread messages
  const [unreadCount, setUnreadCount] = useState(0);

  // --- MENU CONFIGURATION ---
  const menuItems = [
    { name: 'Dashboard', icon: FiGrid, path: '/admin/dashboard', relatedPaths: [] },
    { name: 'Students', icon: FiUsers, path: '/admin/students', relatedPaths: ['/admin/add-student', '/admin/student/edit'] },
    { name: 'Faculty', icon: FiBriefcase, path: '/admin/teachers', relatedPaths: ['/admin/add-teacher', '/admin/teacher/edit'] },
    { name: 'Attendance', icon: FiCheckSquare, path: '/admin/attendance', relatedPaths: [] },
    { name: 'Time Table', icon: FiClock, path: '/admin/timetable', relatedPaths: [] },
    { name: 'Exams', icon: FiAward, path: '/admin/exams', relatedPaths: [] },
    { name: 'Add Notes', icon: FiBook, path: '/admin/academic', relatedPaths: ['/admin/academic/view/:board/:className/:subject'] },
    { name: 'Finance', icon: FiDollarSign, path: '/admin/finance', relatedPaths: [] },
    { name: 'Gallery', icon: FiImage, path: '/admin/gallery', relatedPaths: [] },
    { name: 'Notices', icon: FiBell, path: '/admin/notices', relatedPaths: [] },
    { name: 'Reports', icon: FiPieChart, path: '/admin/reports', relatedPaths: [] },
    { name: 'Manage Achievers', icon: FiAward, path: '/admin/achievers', relatedPaths: [] },
    { name: 'Add Ads', icon: FiSpeaker, path: '/admin/ads', relatedPaths: [] },
    { name: 'Leave Requests', icon: FiClock, path: '/admin/leaves', relatedPaths: [] },
    { name: 'Live Chat', icon: FiMessageSquare, path: '/admin/chat', relatedPaths: [] }, // We will attach the badge here
    { name: 'Settings', icon: FiSettings, path: '/admin/settings', relatedPaths: [] },
  ];

  // 👇 NEW: Fetch initial unread count & listen for real-time updates from Chat
  useEffect(() => {
    const fetchInitialUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/chat/unread', { headers: { 'x-auth-token': token } });
        // Sum up all unread counts
        const total = Object.values(res.data).reduce((acc, count) => acc + count, 0);
        setUnreadCount(total);
      } catch (error) {
        console.error("Failed to load admin unread count");
      }
    };

    fetchInitialUnread();

    // Listen for custom event emitted by the Chat component
    const handleUnreadUpdate = (e) => setUnreadCount(e.detail);
    window.addEventListener('unread_messages_update', handleUnreadUpdate);

    return () => window.removeEventListener('unread_messages_update', handleUnreadUpdate);
  }, []);

  // --- SMART ACTIVE STATE CHECKER ---
  const isItemActive = (item) => {
    // 1. Exact match
    if (location.pathname === item.path) return true;
    
    // 2. Check if current URL matches any of the related dynamic paths
    return item.relatedPaths.some(path => 
      matchPath({ path: path, end: false }, location.pathname) !== null
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 z-50 h-full w-64 bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto custom-scrollbar`}>
        
        {/* --- LOGO HEADER --- */}
        <div className="flex h-24 flex-col justify-center border-b border-gray-800 px-6">
           <div className="flex items-center gap-3">
               <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
               <div className="flex flex-col">
                   <span className="font-heading text-lg font-bold tracking-wide leading-tight">CERREBRO</span>
                   <span className="text-[10px] font-medium text-blue-400 tracking-wider">TUTORIALS</span>
               </div>
           </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col justify-between min-h-[calc(100%-96px)] p-4">
            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = isItemActive(item);

                    return (
                        <button
                            key={item.name}
                            onClick={() => { navigate(item.path); toggleSidebar(); }}
                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                                ${isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 relative overflow-hidden' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            {/* Active Indicator Strip */}
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-300"></div>}
                            
                            <item.icon className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} size={20} />
                            {item.name}

                            {/* 👇 NEW: Unread Badge Logic specifically for the Live Chat tab */}
                            {item.name === 'Live Chat' && unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Sign Out */}
            <div className="pt-8 mt-4 border-t border-gray-800">
                <button 
                    onClick={() => { localStorage.clear(); navigate('/'); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-600 hover:text-white"
                >
                    <FiLogOut size={20} />
                    Sign Out
                </button>
                <p className="text-center text-[10px] text-gray-600 mt-4">v1.0.0 &copy; 2026 Cerrebro</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;