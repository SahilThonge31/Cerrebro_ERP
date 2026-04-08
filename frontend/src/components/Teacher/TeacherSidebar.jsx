import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiGrid, FiCheckSquare, FiBookOpen, FiFileText, FiBell, 
  FiCalendar, FiMessageSquare, FiSettings, FiLogOut, FiX, FiUsers, FiEdit3,
  FiHome
} from 'react-icons/fi';
import logo from '../../assets/logo.png'; 
import api from '../../api'; // 👇 Added API import

const TeacherSidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  
  // 👇 NEW: State to track total unread messages
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = [
    { name: 'Dashboard', icon: FiGrid, key: 'dashboard' },
    { name: 'My Students', icon: FiUsers, key: 'students' }, 
    { name: 'Attendance', icon: FiCheckSquare, key: 'attendance' },
    { name: 'Study Material', icon: FiBookOpen, key: 'material' },
    { name: 'Assignments', icon: FiFileText, key: 'assignments' },
    { name: 'Schedule', icon: FiCalendar, key: 'schedule' },
    { name: 'Enter Marks', icon: FiEdit3, key: 'marks' },
    { name: 'Notice', icon: FiBell, key:'notices'}, 
    { name: 'Messages', icon: FiMessageSquare, key: 'chat' },
    { name: 'Leave Application', icon: FiHome, key: 'leaves' }
  ];

  // 👇 NEW: Fetch initial unread count & listen for real-time updates from Chat
  useEffect(() => {
    const fetchInitialUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/chat/unread', { headers: { 'x-auth-token': token } });
        // Sum up all unread counts from different users
        const total = Object.values(res.data).reduce((acc, count) => acc + count, 0);
        setUnreadCount(total);
      } catch (error) {
        console.error("Failed to load unread count");
      }
    };

    fetchInitialUnread();

    // Listen for custom event emitted by TeacherChat.jsx
    const handleUnreadUpdate = (e) => setUnreadCount(e.detail);
    window.addEventListener('unread_messages_update', handleUnreadUpdate);

    return () => window.removeEventListener('unread_messages_update', handleUnreadUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-50 transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-2xl md:shadow-none`}>
        
        <div className="p-4 flex justify-between items-center border-b border-slate-100">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
                         <div className="flex flex-col pr-6">
                             <span className="font-heading text-[20px] font-bold tracking-wide leading-tight">CERREBRO</span>
                             <span className="text-[12px] font-medium text-blue-400 tracking-wider">TUTORIALS</span>
                         </div>
          <button className="md:hidden text-slate-400 hover:text-red-500 transition" onClick={toggleSidebar}><FiX size={24}/></button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => {
                    setActiveTab(item.key);
                    if (window.innerWidth < 768) toggleSidebar(); 
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
                  isActive 
                  ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon 
                    size={20} 
                    className={`transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                />
                {item.name}
                
                {/* 👇 NEW: Unread Badge Logic */}
                {item.key === 'chat' && unreadCount > 0 ? (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                ) : (
                    isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
           <button 
             onClick={() => setActiveTab('settings')}
             className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl transition-all mb-2 ${
                activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-700'
             }`}
           >
             <FiSettings size={18} /> Settings
           </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;