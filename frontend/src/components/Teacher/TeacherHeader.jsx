import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { FiMenu, FiBell, FiChevronDown, FiCalendar, FiFilter } from 'react-icons/fi';

const TeacherHeader = ({ 
    teacher, 
    toggleSidebar, 
    selectedClass, 
    onClassChange,
    onProfileClick 
}) => {
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
  
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/faculty/notifications', { headers: { 'x-auth-token': token } });
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications");
        }
    };
    fetchNotifications();

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsNotifOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
      if (!notif.isRead) {
          try {
              const token = localStorage.getItem('token');
              await api.put(`/faculty/notifications/${notif._id}/read`, {}, { headers: { 'x-auth-token': token } });
              setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
          } catch (err) {
              console.error("Failed to mark read");
          }
      }
  };

  const getImgSrc = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; 
    return `http://localhost:5000${path}`; 
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100 transition-all">
        <div className="px-6 py-4 flex items-center justify-between">
            
            {/* --- LEFT: LOGO & MENU --- */}
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-500 hover:text-teal-600 transition p-1" onClick={toggleSidebar}>
                    <FiMenu size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-extrabold text-gray-800 tracking-tight leading-none">
                        TEACHERS  <span className="text-teal-600">DASHBOARD</span>
                    </h1>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                        <FiCalendar size={10}/> {today}
                    </p>
                </div>
            </div>

            {/* --- CENTER: CLASS SWITCHER (DESKTOP) --- */}
            <div className="hidden md:block flex-1 max-w-sm mx-10">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiFilter className="text-teal-500" />
                    </div>
                    <select 
                        value={selectedClass} 
                        onChange={(e) => onClassChange(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer appearance-none transition-all shadow-inner hover:bg-white"
                    >
                        <option value="all">Overview (All Classes)</option>
                        {teacher?.classes && teacher.classes.length > 0 ? (
                            teacher.classes.map((cls, idx) => {
                                const standard = typeof cls === 'string' ? cls : cls.standard;
                                const board = typeof cls === 'string' ? '' : ` (${cls.board})`;
                                
                                // 👇 THE FIX: Create a combined string (e.g. "10th CBSE") for the value
                                const combinedValue = typeof cls === 'string' ? cls : `${cls.standard} ${cls.board}`;
                                
                                return (
                                    <option key={idx} value={combinedValue}>
                                        Class {standard}{board}
                                    </option>
                                );
                            })
                        ) : (
                            <option disabled>No Classes Found</option>
                        )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                        <FiChevronDown />
                    </div>
                </div>
            </div>

            {/* --- RIGHT: NOTIFICATIONS & PROFILE --- */}
            <div className="flex items-center gap-3 md:gap-4">
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)} 
                        className={`p-2 transition rounded-full relative ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <FiBell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-14 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up origin-top-right z-50">
                            <div className="p-4 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{unreadCount} New</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div 
                                            key={notif._id} 
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`p-4 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 flex gap-3 ${!notif.isRead ? 'bg-blue-50/40' : 'bg-white'}`}
                                        >
                                            <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!notif.isRead ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                                            <div>
                                                <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Picture (Click to View Profile) */}
                <div 
                    onClick={onProfileClick} 
                    className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 p-0.5 cursor-pointer hover:scale-105 transition shadow-sm"
                    title="View Profile"
                >
                    <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-teal-700 font-bold overflow-hidden text-sm">
                        {teacher?.profilePic ? (
                            <img src={getImgSrc(teacher.profilePic)}alt="" className="h-full w-full object-cover"/>
                        ) : (
                            teacher?.name?.charAt(0)
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- MOBILE CLASS SWITCHER --- */}
        <div className="md:hidden px-6 pb-4">
            <div className="relative">
                <select 
                    value={selectedClass} 
                    onChange={(e) => onClassChange(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 rounded-xl outline-none appearance-none"
                >
                    <option value="all">Overview (All Classes)</option>
                    {teacher?.classes?.map((cls, idx) => {
                        // 👇 THE FIX: Create a combined string (e.g. "10th CBSE") for the value
                        const combinedValue = typeof cls === 'string' ? cls : `${cls.standard} ${cls.board}`;
                        
                        return (
                            <option key={idx} value={combinedValue}>
                                Class {typeof cls === 'string' ? cls : `${cls.standard} (${cls.board})`}
                            </option>
                        );
                    })}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <FiChevronDown />
                </div>
            </div>
        </div>
    </header>
  );
};

export default TeacherHeader;