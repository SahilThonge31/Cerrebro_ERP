import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiFileText, FiClock, FiCheckCircle, FiDownload, FiFilter, FiUser, FiCalendar 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

// 🎨 Subject Badge Component (Auto-colors based on subject name)
const SubjectBadge = ({ subject }) => {
    const colors = {
        Maths: "bg-blue-50 text-blue-700 border-blue-100",
        Mathematics: "bg-blue-50 text-blue-700 border-blue-100",
        Science: "bg-emerald-50 text-emerald-700 border-emerald-100",
        Physics: "bg-violet-50 text-violet-700 border-violet-100",
        Chemistry: "bg-cyan-50 text-cyan-700 border-cyan-100",
        Biology: "bg-green-50 text-green-700 border-green-100",
        English: "bg-rose-50 text-rose-700 border-rose-100",
        History: "bg-amber-50 text-amber-700 border-amber-100",
        Geography: "bg-orange-50 text-orange-700 border-orange-100",
        default: "bg-slate-100 text-slate-700 border-slate-200"
    };

    // Find color or use default
    const style = Object.keys(colors).find(key => subject?.includes(key)) 
        ? colors[Object.keys(colors).find(key => subject?.includes(key))] 
        : colors.default;

    return (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${style}`}>
            {subject}
        </span>
    );
};

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [selectedSubject, setSelectedSubject] = useState('All');

  const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
  ];

  // 1. Fetch Data (Profile + All Assignments)
  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // A. Get Profile (to know Class/Board)
            const profileRes = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
            setStudentProfile(profileRes.data);

            // B. Get ALL Assignments for this Class (No Subject Filter sent to API)
            const assignRes = await api.get('/assignments/view', { 
                params: { 
                    standard: profileRes.data.standard, 
                    board: profileRes.data.board 
                },
                headers: { 'x-auth-token': token } 
            });
            setAssignments(assignRes.data);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // 2. Filter Logic (Month + Subject Dropdown)
  const uniqueSubjects = ['All', ...new Set(assignments.map(a => a.subject))];

  const filteredList = assignments.filter((item) => {
      const itemDate = new Date(item.createdAt);
      const matchMonth = itemDate.getMonth() === parseInt(filterMonth);
      const matchSubject = selectedSubject === 'All' || item.subject === selectedSubject;
      return matchMonth && matchSubject;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans text-slate-800 animate-fade-in-up">
        <Toaster position="top-right" />

        {/* --- HEADER --- */}
        <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Assignment Hub
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    You have <span className="text-teal-600 font-bold">{filteredList.length} assignments</span> for {months[filterMonth]}.
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                {/* Subject Filter */}
                <div className="relative group">
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer min-w-[140px]"
                    >
                        {uniqueSubjects.map((sub, i) => (
                            <option key={i} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>

                {/* Month Filter */}
                <div className="relative group">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer min-w-[160px]"
                    >
                        {months.map((m, index) => (
                            <option key={index} value={index}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* --- GRID CONTENT --- */}
        <div className="max-w-6xl mx-auto">
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">All Clear!</h3>
                    <p className="text-slate-400 text-sm mt-1">No assignments found for this filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredList.map((assign) => {
                        const isOverdue = new Date(assign.dueDate) < new Date();
                        
                        return (
                            <div key={assign._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                                
                                {/* Color Stripe */}
                                <div className={`h-1.5 w-full ${isOverdue ? 'bg-red-500' : 'bg-teal-500'}`}></div>

                                <div className="p-6 flex-1">
                                    {/* Header: Badge & Date */}
                                    <div className="flex justify-between items-start mb-4">
                                        <SubjectBadge subject={assign.subject} />
                                        {isOverdue && (
                                            <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-md border border-red-100">
                                                Overdue
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-teal-700 transition-colors">
                                        {assign.title}
                                    </h3>
                                    
                                    {/* Teacher & Posted Date */}
                                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mb-4">
                                        <span className="flex items-center gap-1">
                                            <FiUser /> {assign.teacherName || "Faculty"}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        <span className="flex items-center gap-1">
                                            <FiCalendar /> {new Date(assign.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Instructions Box */}
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                                            {assign.description || "No specific instructions provided."}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <FiClock size={14} className={isOverdue ? "text-red-500" : "text-slate-400"}/>
                                        <span className={`text-xs font-bold ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
                                            Due: {new Date(assign.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {assign.fileUrl ? (
                                        <a 
                                            href={assign.fileUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-teal-600 transition shadow-sm"
                                        >
                                            <FiDownload /> View
                                        </a>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                            <FiFileText /> No File
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default StudentAssignments;