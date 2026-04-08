import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { FiBell, FiCheck, FiCalendar, FiClock, FiFileText, FiImage, FiAward } from 'react-icons/fi';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/notifications', { headers: { 'x-auth-token': token } });
      setNotifications(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
      try {
          const token = localStorage.getItem('token');
          await api.put('/notifications/read-all', {}, { headers: { 'x-auth-token': token } });
          // Update local state to remove blue dots
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) { console.error(err); }
  };

  const handleClick = async (notif) => {
      // Mark specific one as read (optional logic here)
      if (notif.link) navigate(notif.link);
  };

  // Helper: Group by Date
  const grouped = { Today: [], Yesterday: [], Earlier: [] };
  
  notifications.forEach(n => {
      const d = new Date(n.createdAt);
      const today = new Date();
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
      const isYesterday = d.getDate() === today.getDate() - 1 && d.getMonth() === today.getMonth();

      if (isToday) grouped.Today.push(n);
      else if (isYesterday) grouped.Yesterday.push(n);
      else grouped.Earlier.push(n);
  });

  // Helper: Icons
  const getIcon = (type) => {
      switch(type) {
          case 'exam': return <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><FiAward/></div>;
          case 'gallery': return <div className="p-3 bg-pink-100 text-pink-600 rounded-full"><FiImage/></div>;
          case 'timetable': return <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full"><FiClock/></div>;
          default: return <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><FiFileText/></div>;
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm border-b border-gray-100 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <FiBell className="text-blue-600"/> Notifications
          </h1>
          <button onClick={markAllRead} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <FiCheck /> Mark all as read
          </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
          {loading && <p className="text-center text-gray-400 py-10">Loading alerts...</p>}
          
          {Object.entries(grouped).map(([label, list]) => list.length > 0 && (
              <div key={label}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-2">{label}</h3>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {list.map((n, i) => (
                          <div key={n._id} onClick={() => handleClick(n)}
                              className={`p-4 flex gap-4 hover:bg-gray-50 cursor-pointer transition relative
                                  ${i !== list.length - 1 ? 'border-b border-gray-50' : ''}
                                  ${!n.isRead ? 'bg-blue-50/30' : ''}
                              `}
                          >
                              {getIcon(n.type)}
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <h4 className={`text-sm ${!n.isRead ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                          {n.title}
                                      </h4>
                                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                          {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                              </div>
                              {!n.isRead && <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600"></div>}
                          </div>
                      ))}
                  </div>
              </div>
          ))}

          {!loading && notifications.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                  <FiBell size={40} className="mx-auto mb-2 opacity-20"/>
                  <p>No new notifications</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default NotificationPage;