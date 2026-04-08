import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  FiSearch, FiUser, FiCalendar, FiBarChart2, FiPrinter, FiMenu, 
  FiCpu, FiFilter, FiCheckCircle, FiDownload 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

// 🎨 Subject Badge Helper
const getSubjectColor = (subject) => {
    const colors = {
        Maths: "bg-blue-50 text-blue-700",
        Science: "bg-green-50 text-green-700",
        English: "bg-pink-50 text-pink-700",
        History: "bg-orange-50 text-orange-700",
        default: "bg-gray-50 text-gray-700"
    };
    return colors[Object.keys(colors).find(k => subject?.includes(k))] || colors.default;
};

const AdminReportPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- FILTERS ---
  const [selectedBoard, setSelectedBoard] = useState('SSC');
  const [selectedStandard, setSelectedStandard] = useState('10th');
  const [searchTerm, setSearchTerm] = useState('');

  // --- DATA STATE ---
  const [studentList, setStudentList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState({ marks: [], attendance: {} });
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // --- AI STATE ---
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  const [activeTab, setActiveTab] = useState('Academic Report'); 
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 1. FETCH STUDENT LIST
  useEffect(() => {
    const fetchStudents = async () => {
        setLoadingList(true);
        setStudentList([]);
        setSelectedStudent(null);
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/faculty/class-students', { 
                params: { class: selectedStandard, board: selectedBoard },
                headers: { 'x-auth-token': token } 
            });
            setStudentList(res.data);
        } catch (err) {
            toast.error("Could not load student list");
        } finally {
            setLoadingList(false);
        }
    };
    fetchStudents();
  }, [selectedBoard, selectedStandard]);

  // 2. FETCH STUDENT DETAILS
  const handleStudentSelect = async (student) => {
      setSelectedStudent(student);
      setLoadingProfile(true);
      setAiReport(null);
      try {
          const token = localStorage.getItem('token');

          // Parallel Fetch: Marks & Attendance
          const [resultsRes, attendanceRes] = await Promise.all([
              // Note: We fetch results based on Class/Board. 
              // The backend filters to include ALL subjects if subject param is empty.
              api.get('/results/view', { 
                  params: { standard: selectedStandard, board: selectedBoard },
                  headers: { 'x-auth-token': token } 
              }),
              api.get(`/attendance/student/history/${student._id}`, { headers: { 'x-auth-token': token } })
          ]);

          // Filter for specific student (Double check safety)
          const myResults = resultsRes.data.filter(r => {
             const rStudentId = typeof r.student === 'object' ? r.student._id : r.student;
             return String(rStudentId) === String(student._id);
          });
          
          setStudentData({
              marks: myResults,
              attendance: attendanceRes.data || {}
          });

      } catch (err) {
          toast.error("Failed to load profile");
      } finally {
          setLoadingProfile(false);
      }
  };

  // 3. GENERATE AI REPORT (DATA AGGREGATION)
  const handleGenerateReport = async () => {
      setGeneratingAI(true);

      // --- A. CALCULATE ATTENDANCE STATS ---
      const totalDays = Object.keys(studentData.attendance).length;
      const presentDays = Object.values(studentData.attendance).filter(status => status === 'Present').length;
      const attendancePerc = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

      // --- B. PREPARE THE FULL PAYLOAD FOR AI ---
      const textPayload = `
      STUDENT PROFILE:
      Name: ${selectedStudent.name}
      Roll No: ${selectedStudent.rollNumber || 'N/A'}
      Class: ${selectedStandard} (${selectedBoard})
      Email: ${selectedStudent.email}
      Contact: ${selectedStudent.mobile || 'N/A'}
      Address: ${selectedStudent.address || 'N/A'}
      DOB: ${selectedStudent.dob || 'N/A'}

      ATTENDANCE:
      Total Days: ${totalDays}
      Present: ${presentDays}
      Percentage: ${attendancePerc}%

      ACADEMIC PERFORMANCE & TEACHER REMARKS:
      ${studentData.marks.map(m => 
        `- Subject: ${m.subject} | Marks: ${m.marksObtained}/${m.totalMarks || 100} | Remark: "${m.remarks || 'No remark'}"`
      ).join('\n')}
      `;

      console.log("🚀 SENDING TO AI MODEL:", textPayload);

      // --- C. SIMULATE API CALL (Replace with real API later) ---
      // const response = await api.post('/ai/generate-report', { prompt: textPayload });
      
      setTimeout(() => {
          setGeneratingAI(false);
          setAiReport({
              summary: `${selectedStudent.name} has secured an overall strong performance. With ${attendancePerc}% attendance, consistency is key. Strongest in Science, but needs focus in Languages.`,
              recommendation: "Suggested Action: Advanced Physics workshops and daily creative writing practice.",
              generatedAt: new Date()
          });
          toast.success("AI Analysis Complete!");
      }, 2000);
  };

  const filteredList = studentList.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Toaster position="top-right" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all w-full flex flex-col h-screen overflow-hidden">
        
        {/* --- HEADER --- */}
        <header className="bg-white px-6 py-4 shadow-sm border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
            <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="md:hidden text-slate-500" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                <div className="flex items-center gap-2">
                    <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><FiBarChart2 /></span>
                    <h1 className="text-lg font-bold text-slate-800">Student Reports</h1>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <div className="flex items-center px-3 gap-2 text-slate-400">
                    <FiFilter size={14} />
                    <span className="text-xs font-bold uppercase">Filter:</span>
                </div>
                <select 
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="CBSE">CBSE</option>
                    <option value="SSC">SSC</option>
                    <option value="ICSE">ICSE</option>
                </select>
                <select 
                    value={selectedStandard}
                    onChange={(e) => setSelectedStandard(e.target.value)}
                    className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="8th">Class 8</option>
                    <option value="9th">Class 9</option>
                    <option value="10th">Class 10</option>
                </select>
            </div>
        </header>

        {/* --- MAIN LAYOUT --- */}
        <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
            
            {/* LEFT: LIST */}
            <div className="md:col-span-3 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search student..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loadingList ? (
                        <div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div></div>
                    ) : filteredList.length === 0 ? (
                        <div className="text-center py-10 px-4 text-slate-400 text-sm">No students found.</div>
                    ) : (
                        filteredList.map(student => (
                            <div 
                                key={student._id}
                                onClick={() => handleStudentSelect(student)}
                                className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition flex items-center gap-3 hover:bg-slate-50 ${selectedStudent?._id === student._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                            >
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedStudent?._id === student._id ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {student.name.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className={`font-bold text-sm truncate ${selectedStudent?._id === student._id ? 'text-blue-900' : 'text-slate-700'}`}>{student.name}</h4>
                                    <p className="text-xs text-slate-400">Roll: {student.rollNumber || 'N/A'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: DETAILS */}
            <div className="md:col-span-9 bg-slate-50 h-full overflow-y-auto p-4 md:p-8">
                {!selectedStudent ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-4"><FiUser size={48} className="opacity-20"/></div>
                        <h2 className="text-xl font-bold text-slate-500">Select a Student</h2>
                    </div>
                ) : loadingProfile ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
                        
                        {/* 1. PROFILE CARD */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-5">
                                <div className="h-24 w-24 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden">
                                    {selectedStudent.profilePic ? (
                                        <img src={selectedStudent.profilePic} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-slate-300">{selectedStudent.name.charAt(0)}</div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-slate-800">{selectedStudent.name}</h1>
                                    <div className="flex gap-2 mt-2">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">
                                            {selectedStandard}
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">
                                            {selectedBoard}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-mono">Roll No: {selectedStudent.rollNumber || 'N/A'}</p>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerateReport}
                                disabled={generatingAI}
                                className={`
                                    relative overflow-hidden group px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                                    ${generatingAI ? 'bg-slate-800 cursor-wait' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-indigo-200 hover:scale-105'}
                                `}
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    {generatingAI ? (
                                        <><div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> Generating Report...</>
                                    ) : (
                                        <><FiCpu size={18} /> Generate AI Report</>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* 2. AI REPORT BOX */}
                        {aiReport && (
                            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden animate-fade-in-up">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><FiCpu size={100} className="text-indigo-600"/></div>
                                <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                    <FiCheckCircle className="text-indigo-600"/> AI Performance Analysis
                                </h3>
                                <p className="text-indigo-800 text-sm leading-relaxed mb-4">{aiReport.summary}</p>
                                <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                                    <p className="text-xs font-bold text-indigo-900 uppercase mb-1">Recommendation:</p>
                                    <p className="text-indigo-700 text-sm italic">"{aiReport.recommendation}"</p>
                                </div>
                            </div>
                        )}

                        {/* 3. TABS */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
                            <div className="flex border-b border-slate-100 px-6 gap-8">
                                {['Academic Report', 'Attendance'].map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 text-sm font-bold transition relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab}
                                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {/* TAB: ACADEMIC & REMARKS MERGED */}
                                {activeTab === 'Academic Report' && (
                                    studentData.marks.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400">No marks entered for this student yet.</div>
                                    ) : (
                                        <div className="overflow-hidden rounded-xl border border-slate-100">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr className="text-xs font-bold text-slate-500 uppercase">
                                                        <th className="px-6 py-4">Subject</th>
                                                        <th className="px-6 py-4 text-center">Marks</th>
                                                        <th className="px-6 py-4 text-center">Total</th>
                                                        <th className="px-6 py-4 text-center">Percentage</th>
                                                        <th className="px-6 py-4">Teacher's Remark</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {studentData.marks.map((res, i) => {
                                                        const total = res.totalMarks || 100;
                                                        const perc = ((res.marksObtained / total) * 100).toFixed(1);
                                                        return (
                                                            <tr key={i} className="hover:bg-slate-50/50 transition">
                                                                <td className="px-6 py-4">
                                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getSubjectColor(res.subject)}`}>{res.subject}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center font-bold text-slate-700">{res.marksObtained}</td>
                                                                <td className="px-6 py-4 text-center text-slate-400 text-sm">{total}</td>
                                                                <td className="px-6 py-4 text-center font-bold text-slate-600">{perc}%</td>
                                                                <td className="px-6 py-4 text-sm text-slate-600 italic">
                                                                    {res.remarks ? (
                                                                        `"${res.remarks}"`
                                                                    ) : (
                                                                        <span className="text-slate-300">No remarks</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )}

                                {/* TAB: ATTENDANCE */}
                                {activeTab === 'Attendance' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-slate-700">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 text-xs font-bold">Prev</button>
                                                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 text-xs font-bold">Next</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-7 gap-2">
                                            {Array.from({ length: 31 }, (_, i) => {
                                                const day = i + 1;
                                                const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const status = studentData.attendance[dateKey];
                                                
                                                let bg = "bg-slate-50 text-slate-300"; 
                                                if (status === 'Present') bg = "bg-green-100 text-green-700 border border-green-200";
                                                if (status === 'Absent') bg = "bg-red-100 text-red-700 border border-red-200";

                                                return (
                                                    <div key={day} className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold ${bg}`}>
                                                        {day}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-4 flex gap-4 text-xs font-bold text-slate-500 justify-center">
                                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Present</span>
                                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReportPage;