import React, { useEffect, useState } from 'react';
import { 
  FiTrendingUp, FiTrendingDown, FiDownload, FiCalendar, FiActivity, FiStar, FiFileText, FiCheckCircle, FiAlertTriangle 
} from 'react-icons/fi';
import api from '../../api';

const StudentReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'History' | 'Attendance'
  const [attendanceHistory, setAttendanceHistory] = useState({});
  
  // Data State
  const [studentStats, setStudentStats] = useState({ avgScore: 0, grade: 'N/A', attendancePct: 0 });
  const [examResults, setExamResults] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [remarks, setRemarks] = useState([]);

  useEffect(() => {
    fetchStudentReport();
  }, []);

  const fetchStudentReport = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Get My ID
      const userRes = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
      const studentId = userRes.data._id;

      // 2. Get My Academic Report
      const res = await api.get(`/exams/report/${studentId}`, { headers: { 'x-auth-token': token } });
      
      const results = res.data.results || [];
      
      // Calculate Stats
      const totalMarks = results.reduce((acc, curr) => acc + parseFloat(curr.marks), 0);
      const avg = results.length ? (totalMarks / results.length).toFixed(1) : 0;
      let grade = 'F';
      if(avg >= 90) grade = 'A+';
      else if(avg >= 80) grade = 'A';
      else if(avg >= 70) grade = 'B';
      else if(avg >= 60) grade = 'C';
      else if(avg >= 40) grade = 'D';

      setStudentStats({ avgScore: avg, grade, attendancePct: 88 }); // Mock attendance for now
      setExamResults(results.reverse()); // Newest first
      
      // Mock Attendance & Remarks
      setAttendanceData({ "2025-02-01": "Present", "2025-02-03": "Absent", "2025-02-04": "Present" });
      setRemarks([
        { subject: 'Math', text: 'Good problem solving skills, needs speed improvement.', date: new Date() },
        { subject: 'Physics', text: 'Excellent grasp of concepts.', date: new Date() }
      ]);

    } catch (err) {
      console.error("Failed to load report", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/attendance/student/my-history', { headers: { 'x-auth-token': token } });
            setAttendanceHistory(res.data);
        } catch (err) {}
    };
    fetchHistory();
}, []);

  const downloadReport = (examTitle) => {
    alert(`Downloading Report for: ${examTitle}... 📄`);
    // In real backend: window.open(`http://localhost:5000/api/exams/download/${examId}`)
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Academic Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up font-sans">
      
      {/* HEADER HERO */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Academic Performance</h1>
          <p className="text-gray-500 mt-2">Track your grades, attendance, and teacher feedback.</p>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            
            {/* Avg Score */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Average Score</p>
                  <h2 className="text-4xl font-bold mt-1">{studentStats.avgScore}%</h2>
                </div>
                <div className="p-2 bg-white/20 rounded-lg"><FiActivity size={24}/></div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
                <FiTrendingUp /> Top 15% of class
              </div>
            </div>

            {/* Grade */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Overall Grade</p>
                <h2 className={`text-4xl font-bold mt-1 ${studentStats.grade === 'A+' ? 'text-green-500' : 'text-gray-800'}`}>
                    {studentStats.grade}
                </h2>
              </div>
              <div className="h-16 w-16 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                <FiStar size={32} fill="currentColor" />
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Attendance</p>
                <h2 className={`text-4xl font-bold mt-1 ${studentStats.attendancePct < 75 ? 'text-red-500' : 'text-gray-800'}`}>
                    {studentStats.attendancePct}%
                </h2>
                {studentStats.attendancePct < 75 && <span className="text-xs text-red-500 font-bold">Low Attendance!</span>}
              </div>
              <div className="relative h-16 w-16">
                 <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className={studentStats.attendancePct < 75 ? 'text-red-500' : 'text-green-500'} strokeDasharray={`${studentStats.attendancePct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        
        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-6">
            {['Overview', 'History', 'Attendance'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 pr-6 text-sm font-bold transition border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* --- TAB 1: OVERVIEW (Charts & Remarks) --- */}
        {activeTab === 'Overview' && (
            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Subject Performance Graph (CSS Bar Chart) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6">Subject Performance</h3>
                    <div className="flex items-end justify-between h-48 px-2 gap-2">
                        {examResults.slice(0, 5).map((res, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group w-full">
                                <div className="w-full bg-gray-100 rounded-t-lg h-full relative overflow-hidden">
                                    <div 
                                        className="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000 group-hover:bg-blue-600"
                                        style={{ height: res.percentage }} 
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase truncate w-full text-center">
                                    {res.subject.substring(0, 3)}
                                </span>
                            </div>
                        ))}
                        {examResults.length === 0 && <div className="w-full text-center text-gray-400 text-sm mt-10">No exam data yet.</div>}
                    </div>
                </div>

                {/* Teacher Remarks */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Teacher Feedback</h3>
                    <div className="space-y-4 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                        {remarks.map((r, i) => (
                            <div key={i} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-blue-700 uppercase bg-white px-2 py-0.5 rounded">{r.subject}</span>
                                    <span className="text-[10px] text-blue-400">{new Date(r.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-700">{r.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: EXAM HISTORY (Downloadable) --- */}
        {activeTab === 'History' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold">
                        <tr>
                            <th className="p-4">Exam Title</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">Marks</th>
                            <th className="p-4 text-right">Download</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {examResults.map((res, i) => (
                            <tr key={i} className="hover:bg-gray-50 group transition">
                                <td className="p-4 font-bold text-gray-800">
                                    {res.exam}
                                    <span className="block text-xs text-gray-400 font-normal mt-1">Date: 12 Feb 2025</span>
                                </td>
                                <td className="p-4 text-gray-600">{res.subject}</td>
                                <td className="p-4">
                                    <span className={`font-bold ${parseFloat(res.percentage) < 35 ? 'text-red-500' : 'text-green-600'}`}>
                                        {res.marks} <span className="text-xs text-gray-400 font-normal">({res.percentage})</span>
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => downloadReport(res.exam)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white rounded-lg transition text-xs font-bold"
                                    >
                                        <FiDownload /> Report
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {examResults.length === 0 && <div className="p-10 text-center text-gray-400">No exams taken yet.</div>}
            </div>
        )}

        {/* --- TAB 3: ATTENDANCE CALENDAR --- */}
{activeTab === 'Attendance' && (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Attendance Log (Current Month)</h3>
            <div className="flex gap-4 text-xs font-bold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Present</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Absent</span>
            </div>
        </div>

        <div className="grid grid-cols-7 gap-2 max-w-lg mx-auto">
             {/* Days Header */}
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase mb-2">{d}</div>
             ))}

             {/* Dynamic Calendar Days */}
             {(() => {
                 const today = new Date();
                 const year = today.getFullYear();
                 const month = today.getMonth(); // 0-indexed
                 const daysInMonth = new Date(year, month + 1, 0).getDate();
                 const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
                 
                 const days = [];
                 
                 // Empty slots for start of month
                 for(let i=0; i<firstDayIndex; i++) {
                     days.push(<div key={`empty-${i}`}></div>);
                 }

                 // Actual Days
                 for(let d=1; d<=daysInMonth; d++) {
                     // Construct YYYY-MM-DD key using local time parts to avoid timezone shifts
                     const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                     const status = attendanceHistory[dateKey];

                     let bg = "bg-gray-50 text-gray-400"; // Default / Holiday / No Record
                     if(status === 'Present') bg = "bg-green-100 text-green-700 font-bold border border-green-200";
                     if(status === 'Absent') bg = "bg-red-100 text-red-600 font-bold border border-red-200";

                     days.push(
                         <div key={d} className={`h-10 rounded-lg flex items-center justify-center text-sm ${bg} transition hover:scale-105`}>
                             {d}
                         </div>
                     );
                 }
                 return days;
             })()}
        </div>
    </div>
)}
      </div>
    </div>
  );
};

export default StudentReportPage;