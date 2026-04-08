import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiCheckCircle, FiXCircle, FiCalendar, FiSave, FiUsers, 
    FiAlertCircle, FiChevronLeft, FiChevronRight, FiClock 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const API_BASE_URL = "http://localhost:5000"; 

const TeacherAttendance = ({ selectedClass, teacherData }) => {
  // ==========================================
  // 1. STUDENT ATTENDANCE STATES (Existing)
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState([]); 
  const [isRecordExisting, setIsRecordExisting] = useState(false); 
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });

  // ==========================================
  // 2. TEACHER PERSONAL ATTENDANCE STATES (New)
  // ==========================================
  const [myHistory, setMyHistory] = useState({});
  const [calendarDate, setCalendarDate] = useState(new Date()); 
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  // --- HELPER: Extract standard and board securely ---
  const getExactClassDetails = () => {
      let exactStandard = selectedClass;
      let exactBoard = '';

      if (teacherData && teacherData.classes) {
          const matchedClass = teacherData.classes.find(c => {
              const combined = typeof c === 'string' ? c : `${c.standard} ${c.board}`;
              return combined === selectedClass;
          });

          if (matchedClass && typeof matchedClass === 'object') {
              exactStandard = matchedClass.standard; 
              exactBoard = matchedClass.board;       
          } else if (selectedClass && selectedClass !== 'all') {
              const parts = selectedClass.split(' ');
              exactStandard = parts[0];
              if (parts.length > 1) exactBoard = parts.slice(1).join(' ');
          }
      }
      return { exactStandard, exactBoard };
  };

  // ==========================================
  // 3. FETCH TEACHER'S OWN HISTORY (Once on mount)
  // ==========================================
  useEffect(() => {
      const fetchMyHistory = async () => {
          try {
              const token = localStorage.getItem('token');
              const res = await api.get('/attendance/teacher/my-history', { headers: { 'x-auth-token': token } });
              setMyHistory(res.data);
          } catch (err) {
              console.error(err);
          } finally {
              setLoadingCalendar(false);
          }
      };
      fetchMyHistory();
  }, []);

  // ==========================================
  // 4. FETCH STUDENT DATA (When class is selected)
  // ==========================================
  useEffect(() => {
    if (!selectedClass || selectedClass === 'all') return;
    fetchAttendanceData();
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    const total = attendanceList.length;
    const present = attendanceList.filter(a => a.status === 'Present').length;
    setStats({ total, present, absent: total - present });
  }, [attendanceList]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const { exactStandard, exactBoard } = getExactClassDetails();

        const res = await api.get(`/attendance/student/view`, {
            params: { date: selectedDate, standard: exactStandard, board: exactBoard },
            headers: { 'x-auth-token': token }
        });
        
        setAttendanceList(res.data.attendanceList);
        setIsRecordExisting(res.data.recordExists);
    } catch (err) {
        console.error(err);
        toast.error("Could not load attendance data.");
    } finally {
        setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendanceList(prev => prev.map(item => {
        if (item._id === studentId) {
            return { ...item, status: item.status === 'Present' ? 'Absent' : 'Present' };
        }
        return item;
    }));
  };

  const bulkAction = (status) => {
      setAttendanceList(prev => prev.map(item => ({ ...item, status })));
  };

  const saveAttendance = async () => {
      try {
          const token = localStorage.getItem('token');
          const { exactStandard, exactBoard } = getExactClassDetails();
          
          const absentIds = attendanceList
              .filter(item => item.status === 'Absent')
              .map(item => item._id);

          await api.post('/attendance/student/mark', {
              date: selectedDate,
              standard: exactStandard, 
              board: exactBoard, 
              absentStudentIds: absentIds
          }, { headers: { 'x-auth-token': token } });

          toast.success(`Attendance for Class ${selectedClass} Saved!`);
          setIsRecordExisting(true);
      } catch (err) {
          console.error(err);
          toast.error("Failed to save attendance.");
      }
  };

  const getImgSrc = (path) => path ? (path.startsWith('http') ? path : `${API_BASE_URL}${path}`) : null;

  // ==========================================
  // CALENDAR LOGIC (For Teacher's Own View)
  // ==========================================
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  const getMyMonthlyStats = () => {
      let present = 0, absent = 0;
      for (let d = 1; d <= daysInMonth; d++) {
          const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          if (myHistory[key] === 'Present') present++;
          if (myHistory[key] === 'Absent') absent++;
      }
      return { present, absent };
  };

  const myStats = getMyMonthlyStats();

  // ============================================================================
  // RENDER 1: TEACHER'S PERSONAL CALENDAR (If no class is selected)
  // ============================================================================
  if (!selectedClass || selectedClass === 'all') {
      return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2 bg-teal-50 text-teal-600 rounded-xl"><FiClock size={28}/></span>
                    My Attendance History
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                    Review your personal monthly presence and leave records. (Select a class from the header to mark student attendance).
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
                    <div className="p-4 bg-teal-50 rounded-full text-teal-600"><FiCheckCircle size={28}/></div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800">{myStats.present}</h3>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Days Present</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
                    <div className="p-4 bg-red-50 rounded-full text-red-500"><FiXCircle size={28}/></div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800">{myStats.absent}</h3>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Days Absent</p>
                    </div>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <button onClick={prevMonth} className="p-2.5 hover:bg-white text-slate-500 hover:text-teal-600 rounded-full transition shadow-sm border border-slate-200 bg-white">
                        <FiChevronLeft size={20}/>
                    </button>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-wide">{monthName} {year}</h2>
                    <button onClick={nextMonth} className="p-2.5 hover:bg-white text-slate-500 hover:text-teal-600 rounded-full transition shadow-sm border border-slate-200 bg-white">
                        <FiChevronRight size={20}/>
                    </button>
                </div>

                <div className="p-6">
                    {loadingCalendar ? (
                        <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading calendar data...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-center font-bold text-slate-400 text-xs md:text-sm uppercase tracking-wider">{d}</div>
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-7 gap-2 md:gap-3 pb-4">
                                {Array.from({ length: firstDayIndex }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-14 md:h-24 rounded-2xl bg-slate-50/50"></div>
                                ))}

                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                    const status = myHistory[dateKey];
                                    
                                    const isPresent = status === 'Present';
                                    const isAbsent = status === 'Absent';
                                    const isFuture = new Date(dateKey) > new Date();

                                    let styles = "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100";
                                    if (isPresent) styles = "bg-teal-500 text-white shadow-lg shadow-teal-200 border-transparent";
                                    if (isAbsent) styles = "bg-red-500 text-white shadow-lg shadow-red-200 border-transparent";
                                    if (isFuture) styles += " opacity-40 bg-slate-50/30";

                                    return (
                                        <div key={day} className={`relative h-14 md:h-24 p-2 flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 ${styles}`}>
                                            <span className="font-extrabold text-sm md:text-xl">{day}</span>
                                            {status && (
                                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90 mt-1 hidden md:block">
                                                    {status}
                                                </span>
                                            )}
                                            {isPresent && <FiCheckCircle className="text-teal-50 md:hidden mt-1" size={16}/>}
                                            {isAbsent && <FiXCircle className="text-red-50 md:hidden mt-1" size={16}/>}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // ============================================================================
  // RENDER 2: STUDENT ATTENDANCE MARKING (If a class IS selected)
  // ============================================================================
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans animate-fade-in-up">
      <Toaster position="top-center" />

      {/* --- CONTROL BAR --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
              <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                  Attendance Sheet <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs border border-teal-100">Class {selectedClass}</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                  {isRecordExisting ? "Editing saved record" : "Creating new record"} for this date.
              </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative group w-full md:w-auto">
                   <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500"/>
                   <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 transition w-full"
                   />
              </div>
          </div>
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Total</p>
                  <p className="text-2xl font-extrabold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><FiUsers size={20}/></div>
          </div>
          <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-xs font-bold text-teal-600 uppercase">Present</p>
                  <p className="text-2xl font-extrabold text-teal-700">{stats.present}</p>
              </div>
              <button onClick={() => bulkAction('Present')} className="text-xs font-bold underline text-teal-600 hover:text-teal-800">Mark All</button>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-xs font-bold text-red-600 uppercase">Absent</p>
                  <p className="text-2xl font-extrabold text-red-700">{stats.absent}</p>
              </div>
              <button onClick={() => bulkAction('Absent')} className="text-xs font-bold underline text-red-600 hover:text-red-800">Mark All</button>
          </div>
          <div className="hidden md:flex items-center">
               <button 
                  onClick={saveAttendance}
                  className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg shadow-gray-300 transition-transform active:scale-95 flex items-center justify-center gap-2"
               >
                  <FiSave size={20}/> Save Record
               </button>
          </div>
      </div>

      {/* --- GRID --- */}
      {loading ? (
          <div className="py-20 text-center text-gray-400">Loading class list...</div>
      ) : stats.total === 0 ? (
          <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
              No students found for this Class & Board.
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
              {attendanceList.map((student) => {
                  const isPresent = student.status === 'Present';
                  return (
                      <div 
                          key={student._id}
                          onClick={() => toggleStatus(student._id)}
                          className={`
                              relative cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 group
                              ${isPresent 
                                  ? 'bg-white border-gray-100 hover:border-teal-400 hover:shadow-md' 
                                  : 'bg-red-50/50 border-red-100 hover:border-red-400 hover:shadow-md'
                              }
                          `}
                      >
                          <div className="flex items-center gap-4">
                              <div className={`
                                  h-12 w-12 rounded-full shrink-0 flex items-center justify-center font-bold text-sm border-2 overflow-hidden
                                  ${isPresent ? 'border-teal-100 bg-teal-50 text-teal-700' : 'border-red-200 bg-red-100 text-red-700'}
                              `}>
                                  {student.profilePic ? (
                                      <img src={getImgSrc(student.profilePic)} className="h-full w-full object-cover" />
                                  ) : (
                                      student.name.charAt(0)
                                  )}
                              </div>
                              <div className="overflow-hidden">
                                  <h4 className={`font-bold truncate ${isPresent ? 'text-gray-700' : 'text-red-700'}`}>
                                      {student.name}
                                  </h4>
                                  <p className="text-xs font-bold text-gray-400">
                                      Roll: {student.rollNumber || student.rollNum || 'N/A'}
                                  </p>
                              </div>
                          </div>
                          <div className="absolute top-4 right-4 text-xl transition-transform duration-300 group-hover:scale-110">
                              {isPresent 
                                  ? <FiCheckCircle className="text-teal-500 opacity-20 group-hover:opacity-100" />
                                  : <FiXCircle className="text-red-500" />
                              }
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      {/* Floating Save Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 left-6 z-30">
          <button 
              onClick={saveAttendance}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-400/50 flex items-center justify-center gap-2"
          >
              <FiSave size={20}/> Save
          </button>
      </div>

    </div>
  );
};

export default TeacherAttendance;