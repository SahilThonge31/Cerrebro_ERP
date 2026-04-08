import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { FiCalendar, FiUser, FiClock, FiDownload, FiFilter, FiArrowLeft, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const AssignmentListPage = () => {
  const { subject } = useParams(); // Get subject from URL (e.g., "Maths")
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth()); // Default to current month
  const [loading, setLoading] = useState(true);

  // Helper: Month Names
  const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
  ];

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // A. Get Profile first (to know Class & Board)
        const profileRes = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
        setStudentProfile(profileRes.data);

        // B. Get Assignments for this specific Subject
        const res = await api.get('/assignments/view', { 
            params: { 
                standard: profileRes.data.standard, 
                board: profileRes.data.board,
                subject: subject // Filter by the URL param
            },
            headers: { 'x-auth-token': token } 
        });
        setAssignments(res.data);
      } catch (error) {
        console.error("Failed to load assignments");
        toast.error("Could not load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subject]);

  // 2. Filter Logic (By Month)
  const filteredAssignments = assignments.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === parseInt(filterMonth);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-fade-in-up font-sans text-slate-800">
      
      {/* --- HEADER --- */}
      <div className="bg-white px-6 py-8 shadow-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl">
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors"
            >
                <FiArrowLeft /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Class {studentProfile?.standard}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{subject} Assignments</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your coursework and submissions.</p>
                </div>
                
                {/* Month Filter Dropdown */}
                <div className="relative group">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    <select 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 hover:bg-white transition-all cursor-pointer appearance-none min-w-[160px]"
                    >
                        {months.map((m, index) => (
                            <option key={index} value={index}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENT LIST --- */}
      <div className="mx-auto max-w-5xl px-6 mt-8">
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
            </div>
        ) : filteredAssignments.length > 0 ? (
            <div className="space-y-5">
                {filteredAssignments.map((asn, index) => {
                    const isOverdue = new Date(asn.dueDate) < new Date();
                    return (
                        <div 
                            key={asn._id} 
                            className="group flex flex-col md:flex-row md:items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:border-teal-200 relative overflow-hidden"
                        >
                            {/* Left Decoration */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-red-400' : 'bg-teal-500'}`}></div>

                            <div className="flex gap-5 pl-2">
                                {/* Number Badge */}
                                <div className="hidden md:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 font-extrabold text-lg border border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                    #{index + 1}
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                                        {asn.title}
                                    </h3>
                                    
                                    {/* Meta Tags */}
                                    <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                            <FiUser size={12} className="text-teal-500" />
                                            <span>{asn.teacherName || "Faculty"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                            <FiCalendar size={12} className="text-teal-500" />
                                            <span>Posted: {new Date(asn.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <FiClock size={12} />
                                            <span>Due: {new Date(asn.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Description/Instructions */}
                                    {asn.description && (
                                        <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-2xl">
                                            {asn.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            {asn.fileUrl ? (
                                <div className="mt-5 md:mt-0 md:ml-6 shrink-0">
                                    <a 
                                        href={asn.fileUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95 shadow-lg shadow-slate-200 hover:bg-slate-800"
                                    >
                                        <FiDownload size={16} /> Download Resource
                                    </a>
                                </div>
                            ) : (
                                <div className="mt-5 md:mt-0 md:ml-6 shrink-0 opacity-50 cursor-not-allowed flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-400">
                                    <FiFileText /> No File
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <FiCheckCircle size={40} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
                <p className="text-slate-400 text-sm mt-1">No assignments found for {months[filterMonth]}.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentListPage;