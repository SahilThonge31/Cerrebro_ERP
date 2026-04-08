import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiCheckCircle, FiXCircle, FiCalendar, FiSave, FiUsers, FiMenu, FiFilter } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const AdminAttendancePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- FILTERS ---
  const [userType, setUserType] = useState('student'); // 'student' or 'teacher'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
  
  // Student Specific Filters
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedBoard, setSelectedBoard] = useState('CBSE');

  // --- DATA ---
  const [attendanceList, setAttendanceList] = useState([]); // Stores { name, id, status }
  const [isRecordExisting, setIsRecordExisting] = useState(false); // Did we fetch db data or is this fresh?

  // Fetch Data when filters change
  useEffect(() => {
    fetchAttendance();
  }, [userType, selectedDate, selectedClass, selectedBoard]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        let res;

        if (userType === 'student') {
            res = await api.get(`/attendance/student/view?date=${selectedDate}&standard=${selectedClass}&board=${selectedBoard}`, {
                headers: { 'x-auth-token': token }
            });
        } else {
            res = await api.get(`/attendance/teacher/view?date=${selectedDate}`, {
                headers: { 'x-auth-token': token }
            });
        }
        
        setAttendanceList(res.data.attendanceList);
        setIsRecordExisting(res.data.recordExists);
    } catch (err) {
        toast.error("Failed to fetch data");
    } finally {
        setLoading(false);
    }
  };

  // Toggle Present/Absent locally
  const toggleStatus = (id) => {
    const updatedList = attendanceList.map(item => {
        if (item._id === id) {
            return { ...item, status: item.status === 'Present' ? 'Absent' : 'Present' };
        }
        return item;
    });
    setAttendanceList(updatedList);
  };

  // Save to Backend
  const saveAttendance = async () => {
      try {
          const token = localStorage.getItem('token');
          
          // Filter out who is ABSENT (Since backend only stores absent IDs)
          const absentIds = attendanceList
              .filter(item => item.status === 'Absent')
              .map(item => item._id);

          if (userType === 'student') {
              await api.post('/attendance/student/mark', {
                  date: selectedDate,
                  standard: selectedClass,
                  board: selectedBoard,
                  absentStudentIds: absentIds
              }, { headers: { 'x-auth-token': token } });
          } else {
              await api.post('/attendance/teacher/mark', {
                  date: selectedDate,
                  absentTeacherIds: absentIds
              }, { headers: { 'x-auth-token': token } });
          }

          toast.success(`${userType === 'student' ? 'Student' : 'Staff'} Attendance Updated!`);
          setIsRecordExisting(true); // Now it definitely exists
      } catch (err) {
          toast.error("Save Failed");
      }
  };

  // Helper Stats
  const total = attendanceList.length;
  const presentCount = attendanceList.filter(a => a.status === 'Present').length;
  const absentCount = total - presentCount;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-center" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all">
        
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   <FiCheckCircle className="text-green-600" /> Attendance Manager
                </h1>
            </div>
            
            {/* Toggle Student / Teacher */}
            <div className="bg-gray-100 p-1 rounded-xl flex">
                <button 
                    onClick={() => setUserType('student')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userType === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                    Students
                </button>
                <button 
                    onClick={() => setUserType('teacher')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userType === 'teacher' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                    Teachers
                </button>
            </div>
        </header>

        <main className="p-6 md:p-8 max-w-5xl mx-auto">
            
            {/* FILTERS BAR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid md:grid-cols-4 gap-6 items-end">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Date</label>
                    <input type="date" className="w-full p-3 rounded-xl border font-bold bg-white outline-none focus:border-blue-500"
                        value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>

                {userType === 'student' && (
                    <>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Class</label>
                            <select className="w-full p-3 rounded-xl border font-bold bg-white outline-none"
                                value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                {['8th','9th','10th','11th','12th'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Board</label>
                            <select className="w-full p-3 rounded-xl border font-bold bg-white outline-none"
                                value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)}>
                                {['CBSE','ICSE','SSC'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {/* Quick Stats Widget */}
                <div className={`flex flex-col justify-center items-center p-2 rounded-xl border-2 border-dashed
                    ${userType === 'teacher' ? 'md:col-span-3 flex-row gap-8' : ''}
                `}>
                    <div className="flex gap-6 text-sm">
                        <div className="text-center">
                            <span className="block font-bold text-gray-400 text-xs">TOTAL</span>
                            <span className="font-bold text-lg">{total}</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-green-500 text-xs">PRESENT</span>
                            <span className="font-bold text-lg text-green-600">{presentCount}</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-red-500 text-xs">ABSENT</span>
                            <span className="font-bold text-lg text-red-600">{absentCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ATTENDANCE LIST */}
            {loading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse">Loading Attendance Data...</div>
            ) : attendanceList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <FiUsers size={40} className="mx-auto text-gray-300 mb-2"/>
                    <p className="text-gray-400 font-bold">No users found for this selection.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">
                            {isRecordExisting ? "Editing Existing Record" : "Creating New Record"}
                        </h3>
                        <span className="text-xs text-gray-500 italic">Click on a user to toggle status</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {attendanceList.map(person => (
                            <div 
                                key={person._id} 
                                onClick={() => toggleStatus(person._id)}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between group
                                    ${person.status === 'Absent' 
                                        ? 'border-red-100 bg-red-50 hover:border-red-300' 
                                        : 'border-green-100 bg-green-50 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                                        ${person.status === 'Absent' ? 'bg-red-500' : 'bg-green-500'}
                                    `}>
                                        {person.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={`font-bold ${person.status === 'Absent' ? 'text-red-700' : 'text-green-800'}`}>
                                            {person.name}
                                        </p>
                                        <p className="text-xs text-gray-500 font-bold">
                                            {person.rollNumber ? `Roll: ${person.rollNumber}` : person.subject || 'Faculty'}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-2xl transition-transform group-hover:scale-110">
                                    {person.status === 'Absent' ? <FiXCircle className="text-red-500"/> : <FiCheckCircle className="text-green-500"/>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0 z-10">
                        <button 
                            onClick={saveAttendance}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition active:scale-95"
                        >
                            <FiSave size={20} /> Save Changes
                        </button>
                    </div>
                </div>
            )}

        </main>
      </div>
    </div>
  );
};

export default AdminAttendancePage;