import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
    FiBell, FiSend, FiTrash2, FiUsers, FiTarget, 
    FiAlertTriangle, FiInfo, FiCalendar, FiMenu, FiUser, FiBriefcase, FiLayers 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const AdminNoticePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('notice'); 
  
  // Logic States
  const [recipient, setRecipient] = useState('student'); // 'student', 'teacher', 'all'
  const [target, setTarget] = useState('all'); // 'all' (Global), 'specific' (Class)
  const [standard, setStandard] = useState('10th');
  const [board, setBoard] = useState('CBSE');

  // Fetch History on Load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await api.get('/notifications/history', { headers: { 'x-auth-token': token } });
          setHistory(res.data);
      } catch (err) { console.error(err); }
  };

  const handlePublish = async (e) => {
      e.preventDefault();
      if(!title || !message) return toast.error("Title and Message are required");

      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          await api.post('/notifications/create', {
              title, message, type,
              recipient, // Who?
              target,    // Where?
              standard, board // Details
          }, { headers: { 'x-auth-token': token } });

          toast.success("Notice Published Successfully!");
          setTitle(''); setMessage(''); 
          fetchHistory(); 
      } catch (err) {
          toast.error("Failed to publish notice");
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this notice?")) return;
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/notifications/${id}`, { headers: { 'x-auth-token': token } });
          setHistory(history.filter(n => n._id !== id));
          toast.success("Notice Deleted");
      } catch (err) { toast.error("Failed to delete"); }
  };

  const getTypeIcon = (t) => {
      if(t === 'urgent') return <FiAlertTriangle className="text-red-500"/>;
      if(t === 'event') return <FiCalendar className="text-green-500"/>;
      return <FiInfo className="text-blue-500"/>;
  };

  // Helper for history display
  const getRecipientLabel = (n) => {
      let who = n.recipientRole === 'all' ? 'Everyone' : n.recipientRole === 'teacher' ? 'Teachers' : 'Students';
      let where = n.standard ? `${n.standard} (${n.board})` : 'All Classes';
      return `${who} - ${where}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-right"/>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all relative">
        {/* Header */}
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiBell className="text-blue-600" /> Digital Notice Board
                </h1>
            </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT: COMPOSE NOTICE --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <FiSend className="text-blue-600"/> Compose Notice
                        </h2>

                        <form onSubmit={handlePublish} className="space-y-5">
                            
                            {/* 1. WHO is this for? (Recipient) */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">1. Who is this for?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['student', 'teacher', 'all'].map(role => (
                                        <button key={role} type="button" onClick={() => setRecipient(role)}
                                            className={`py-2 px-1 text-xs font-bold rounded-lg border capitalize transition flex flex-col items-center gap-1
                                                ${recipient === role ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                            {role === 'student' && <FiUsers size={14}/>}
                                            {role === 'teacher' && <FiBriefcase size={14}/>}
                                            {role === 'all' && <FiLayers size={14}/>}
                                            {role === 'all' ? 'Everyone' : role + 's'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. WHERE to send? (Target) */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">2. Select Target Scope</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                                    <button type="button" onClick={() => setTarget('all')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${target === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
                                        Global (All Classes)
                                    </button>
                                    <button type="button" onClick={() => setTarget('specific')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${target === 'specific' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}>
                                        Specific Class
                                    </button>
                                </div>

                                {/* Class Selectors */}
                                {target === 'specific' && (
                                    <div className="grid grid-cols-2 gap-3 animate-fade-in-down">
                                        <select className="p-2.5 border rounded-xl bg-gray-50 font-bold text-sm outline-none focus:ring-2 focus:ring-purple-100"
                                            value={standard} onChange={e => setStandard(e.target.value)}>
                                            {['8th','9th','10th','11th','12th'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                        <select className="p-2.5 border rounded-xl bg-gray-50 font-bold text-sm outline-none focus:ring-2 focus:ring-purple-100"
                                            value={board} onChange={e => setBoard(e.target.value)}>
                                            {['CBSE','SSC'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* 3. DETAILS */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">3. Message Details</label>
                                
                                {/* Type Selector */}
                                <div className="flex gap-2 mb-3">
                                    {['notice', 'urgent', 'event'].map(t => (
                                        <button key={t} type="button" onClick={() => setType(t)}
                                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border transition ${type === t ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <input type="text" placeholder="Title / Headline" 
                                    className="w-full p-3 mb-3 border rounded-xl font-bold focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                    value={title} onChange={e => setTitle(e.target.value)}
                                />
                                <textarea placeholder="Type your message here..." rows="4"
                                    className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                    value={message} onChange={e => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <button type="submit" disabled={loading} 
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition active:scale-95 flex justify-center items-center gap-2">
                                {loading ? 'Publishing...' : <><FiSend/> Publish Notice</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT: HISTORY --- */}
                <div className="lg:col-span-2">
                    <h2 className="font-bold text-lg mb-6 text-gray-700">Notice History</h2>
                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <p className="text-gray-400 text-center py-10">No notices sent yet.</p>
                        ) : history.map((notice) => (
                            <div key={notice._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transition hover:shadow-md group">
                                <div className={`p-3 rounded-full shrink-0 
                                    ${notice.type === 'urgent' ? 'bg-red-100 text-red-600' : 
                                      notice.type === 'event' ? 'bg-green-100 text-green-600' : 
                                      'bg-blue-100 text-blue-600'}`}>
                                    {getTypeIcon(notice.type)}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800">{notice.title}</h3>
                                        <button onClick={() => handleDelete(notice._id)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 mb-3">{notice.message}</p>
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Date Badge */}
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </span>
                                        
                                        {/* Target Badge */}
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                            {getRecipientLabel(notice)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNoticePage;