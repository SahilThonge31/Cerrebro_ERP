import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiSend, FiTrash2, FiAlertTriangle, FiInfo, FiCalendar, FiBell, FiFilter 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const TeacherNotices = ({ selectedClass, teacherData }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('notice'); 

  // 👇 THE FIX: Smart Helper to get pure standard and board from "9th SSC"
  const getExactClassDetails = () => {
      let exactStandard = selectedClass;
      let exactBoard = '';

      if (selectedClass && selectedClass !== 'all') {
          const parts = selectedClass.split(' ');
          exactStandard = parts[0]; // Grabs "9th"
          if (parts.length > 1) {
              exactBoard = parts[1]; // Grabs "SSC"
          }
      }
      return { exactStandard, exactBoard };
  };

  const { exactStandard, exactBoard } = getExactClassDetails();

  // 1. Fetch History (Refresh when class changes)
  useEffect(() => {
    fetchHistory();
  }, [selectedClass]);

  const fetchHistory = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await api.get('/notifications/history', { headers: { 'x-auth-token': token } });
          setHistory(res.data); 
      } catch (err) { console.error(err); }
  };

  // 2. Publish Notice
  const handlePublish = async (e) => {
      e.preventDefault();
      
      // Safety Check: Must select a class
      if (selectedClass === 'all') {
          return toast.error("Please select a specific class from the header first.");
      }
      if (!title || !message) return toast.error("Title and Message are required");

      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          
          // 👇 THE FIX: Send split values so the student's query finds the record
          await api.post('/notifications/create', {
              title, 
              message, 
              type,
              recipient: 'student', 
              target: 'specific',   
              standard: exactStandard, // Sends "9th"
              board: exactBoard      // Sends "SSC"
          }, { headers: { 'x-auth-token': token } });

          toast.success("Notice Posted Successfully!");
          setTitle(''); 
          setMessage(''); 
          fetchHistory(); 
      } catch (err) {
          toast.error("Failed to post notice");
      } finally {
          setLoading(false);
      }
  };

  // 3. Delete Notice
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

  // --- EMPTY STATE (If 'All Classes' is selected) ---
  if (selectedClass === 'all') {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] bg-slate-50/50 rounded-3xl border border-dashed border-gray-200 animate-fade-in-up">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FiFilter size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-600">Select a Class</h3>
              <p className="text-slate-400 text-sm">Please select a class from the header to post a notice.</p>
          </div>
      );
  }

  return (
    <div className="animate-fade-in-up p-4 md:p-8 min-h-[80vh]">
        <Toaster position="top-right" />
        
        <div className="max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FiBell size={28}/></span>
                    Class Notice Board
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Posting for <span className="text-indigo-600 font-bold">Class {exactStandard} ({exactBoard || 'General'})</span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT: COMPOSE FORM --- */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
                            <FiSend className="text-indigo-500"/> Compose Notice
                        </h2>

                        <form onSubmit={handlePublish} className="space-y-5">
                            
                            {/* Type Selector */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Notice Type</label>
                                <div className="flex gap-2">
                                    {['notice', 'urgent', 'event'].map(t => (
                                        <button key={t} type="button" onClick={() => setType(t)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all flex-1 ${type === t ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Title</label>
                                <input type="text" placeholder="e.g. Science Test on Monday" 
                                    className="w-full p-3 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                                    value={title} onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Message</label>
                                <textarea placeholder="Type your message details here..." rows="5"
                                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-600 text-sm focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                                    value={message} onChange={e => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <button type="submit" disabled={loading} 
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition active:scale-95 flex justify-center items-center gap-2">
                                {loading ? 'Posting...' : <><FiSend/> Post to Class {selectedClass}</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT: HISTORY --- */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                        <h2 className="font-bold text-lg mb-6 text-slate-800 flex justify-between items-center">
                            <span>Notice History</span>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                Class {selectedClass}
                            </span>
                        </h2>
                        
                        <div className="space-y-4">
                            {/* 👇 UPDATED FILTER: Check both combined and split formats for history visibility */}
                            {history.filter(n => n.standard === exactStandard || n.standard === selectedClass).length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <FiBell className="text-slate-300 mx-auto mb-3" size={32}/>
                                    <p className="text-slate-400 font-medium">No notices found for this class.</p>
                                </div>
                            ) : history.filter(n => n.standard === exactStandard || n.standard === selectedClass).map((notice) => (
                                <div key={notice._id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition flex gap-4 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-lg shadow-sm
                                        ${notice.type === 'urgent' ? 'bg-red-50 text-red-500' : 
                                          notice.type === 'event' ? 'bg-green-50 text-green-500' : 
                                          'bg-blue-50 text-blue-50'}`}>
                                        {getTypeIcon(notice.type)}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-800 text-base">{notice.title}</h3>
                                            <button onClick={() => handleDelete(notice._id)} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1">
                                                <FiTrash2 size={16}/>
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 mb-3 leading-relaxed">{notice.message}</p>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">
                                                {new Date(notice.createdAt).toLocaleDateString()}
                                            </span>
                                            {notice.senderRole === 'teacher' && (
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                                    Teacher's Notice
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TeacherNotices;