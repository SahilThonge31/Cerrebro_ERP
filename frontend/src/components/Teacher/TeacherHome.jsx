import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiUsers, FiFileText, FiBell, FiClock, FiCheckCircle 
} from 'react-icons/fi';

const TeacherHome = ({ setTab, selectedClass, teacherData }) => {
  const [stats, setStats] = useState({
      studentCount: 0,
      assignmentCount: 0,
      notices: [],
      teacherName: teacherData?.name || 'Teacher',
  });
  
  const [loading, setLoading] = useState(false);

  // --- 1. FETCH DYNAMIC STATS BASED ON FILTER ---
  useEffect(() => {
    const fetchDynamicStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            let count = 0;
            let assigns = 0;

            // A. If a specific class is selected, fetch data for THAT class
            if (selectedClass !== 'all') {
                
                // 👇 THE FIX: Safely split the combined string from the Header
                let queryStandard = selectedClass;
                let queryBoard = ''; // Default fallback if no board exists

                const parts = selectedClass.split(' ');
                queryStandard = parts[0]; // Grabs the "10th"
                if (parts.length > 1) {
                    queryBoard = parts[1]; // Grabs the "CBSE"
                } else {
                    // Fallback to teacherData if the string wasn't combined properly for some reason
                    const clsObj = teacherData.classes.find(c => (typeof c === 'object' ? c.standard : c) === selectedClass);
                    queryBoard = clsObj?.board || 'SSC';
                }

                // 1. Fetch Students Count (Using the split variables!)
                const stdRes = await api.get('/faculty/class-students', { 
                    params: { class: queryStandard, board: queryBoard },
                    headers: { 'x-auth-token': token } 
                });
                count = stdRes.data.length;

                // 2. Fetch Assignments Count (Using the split variables!)
                const assignRes = await api.get('/assignments/view', {
                    params: { standard: queryStandard, board: queryBoard },
                    headers: { 'x-auth-token': token }
                });
                assigns = assignRes.data.length;
            } 
            // B. If "All" is selected, we might show total or 0 (User asked for "Please Select")
            else {
                // We keep count as 0 or handle UI state below
            }

            // 3. Fetch Notices (Always Global)
            const noticeRes = await api.get('/faculty/stats', { headers: { 'x-auth-token': token } });

            setStats({
                studentCount: count,
                assignmentCount: assigns,
                notices: noticeRes.data.notices || [],
                teacherName: teacherData?.name
            });

        } catch (err) {
            console.error("Stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchDynamicStats();
  }, [selectedClass, teacherData]); // 👈 Re-run when filter changes

  const getCurrentDate = () => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="animate-fade-in-up">
        {/* HEADER */}
        <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Welcome back, <span className="text-teal-600">{stats.teacherName}</span>! 👋
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-2 flex items-center gap-2">
                <FiClock /> {getCurrentDate()}
            </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* --- WIDGET 1: STUDENTS (DYNAMIC) --- */}
            <div 
                onClick={() => selectedClass !== 'all' && setTab('students')}
                className={`
                    rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group transition-all
                    ${selectedClass === 'all' 
                        ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' // Gray if disabled
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 cursor-pointer shadow-blue-200'} // Blue if active
                `}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                    <FiUsers size={80} />
                </div>
                <div className="relative z-10">
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${selectedClass === 'all' ? 'text-slate-200' : 'text-blue-100'}`}>
                        Total Students
                    </h3>
                    
                    {loading ? (
                        <div className="h-8 w-8 mt-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : selectedClass === 'all' ? (
                        <div className="mt-2">
                            <p className="text-xl font-bold opacity-90">Select Class</p>
                            <p className="text-xs text-slate-200 mt-1">Select from header filter</p>
                        </div>
                    ) : (
                        <div className="mt-1">
                            <p className="text-3xl font-extrabold">{stats.studentCount}</p>
                            <p className="text-blue-200 text-xs mt-1">Class {selectedClass}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- WIDGET 2: ASSIGNMENTS (DYNAMIC) --- */}
            <div 
                onClick={() => selectedClass !== 'all' && setTab('assignments')}
                className={`
                    rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group transition-all
                    ${selectedClass === 'all' 
                        ? 'bg-slate-400 cursor-not-allowed shadow-slate-200' 
                        : 'bg-gradient-to-br from-teal-500 to-teal-600 cursor-pointer shadow-teal-200'}
                `}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                    <FiFileText size={80} />
                </div>
                <div className="relative z-10">
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${selectedClass === 'all' ? 'text-slate-200' : 'text-teal-100'}`}>
                        Active Assignments
                    </h3>

                    {loading ? (
                        <div className="h-8 w-8 mt-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : selectedClass === 'all' ? (
                        <div className="mt-2">
                            <p className="text-xl font-bold opacity-90">Select Class</p>
                            <p className="text-xs text-slate-200 mt-1">To view assignments</p>
                        </div>
                    ) : (
                        <div className="mt-1">
                            <p className="text-3xl font-extrabold">{stats.assignmentCount}</p>
                            <p className="text-teal-200 text-xs mt-1">For Class {selectedClass}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- WIDGET 3: NOTICES (ALWAYS ACTIVE) --- */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                        <FiBell /> Latest Notice
                    </div>
                    {stats.notices && stats.notices.length > 0 ? (
                        <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1 text-sm">{stats.notices[0].title}</h4>
                            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{stats.notices[0].message}</p>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-xs italic">No new notices.</p>
                    )}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                     <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        {stats.notices ? stats.notices.length : 0} Unread
                     </span>
                </div>
            </div>
        </div>

        {/* BOTTOM LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FiBell className="text-teal-500"/> Notice Board
                </h3>
                <div className="space-y-3">
                    {!stats.notices || stats.notices.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-4">All caught up!</p>
                    ) : (
                        stats.notices.slice(0,3).map((notice, idx) => (
                            <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl">
                                <div className="h-8 w-8 rounded-full bg-white text-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <FiBell size={14} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{notice.title}</h4>
                                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{notice.message}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FiCheckCircle className="text-teal-500"/> Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setTab('attendance')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition text-left group">
                        <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition"><FiUsers /></span>
                        <h4 className="font-bold text-slate-700 text-xs">Mark Attendance</h4>
                    </button>
                    <button onClick={() => setTab('marks')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition text-left group">
                        <span className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition"><FiFileText /></span>
                        <h4 className="font-bold text-slate-700 text-xs">Enter Marks</h4>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TeacherHome;