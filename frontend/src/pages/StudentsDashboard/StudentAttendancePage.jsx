import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiCalendar, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const StudentAttendancePage = () => {
  const [history, setHistory] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date()); // For navigation
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await api.get('/attendance/student/my-history', { headers: { 'x-auth-token': token } });
        setHistory(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calculate Stats for THIS month
  const getMonthlyStats = () => {
      let present = 0, absent = 0;
      for (let d = 1; d <= daysInMonth; d++) {
          const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          if (history[key] === 'Present') present++;
          if (history[key] === 'Absent') absent++;
      }
      return { present, absent };
  };

  const stats = getMonthlyStats();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="bg-white px-6 py-8 shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FiCalendar className="text-blue-600"/> Attendance History
            </h1>
            <p className="text-gray-500 mt-2">Track your daily presence and consistency.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 mt-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-green-200 rounded-full text-green-700"><FiCheckCircle size={24}/></div>
                <div>
                    <h3 className="text-2xl font-bold text-green-800">{stats.present}</h3>
                    <p className="text-sm text-green-600 font-bold">Days Present</p>
                </div>
            </div>
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-red-200 rounded-full text-red-700"><FiXCircle size={24}/></div>
                <div>
                    <h3 className="text-2xl font-bold text-red-800">{stats.absent}</h3>
                    <p className="text-sm text-red-600 font-bold">Days Absent</p>
                </div>
            </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition shadow-sm border"><FiChevronLeft/></button>
                <h2 className="text-xl font-bold text-gray-700">{monthName} {year}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition shadow-sm border"><FiChevronRight/></button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center font-bold text-gray-400 text-sm uppercase">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                    {/* Empty Slots */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`}></div>
                    ))}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                        const status = history[dateKey];

                        let styles = "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100";
                        if (status === 'Present') styles = "bg-green-500 text-white shadow-md shadow-green-200 border-transparent";
                        if (status === 'Absent') styles = "bg-red-500 text-white shadow-md shadow-red-200 border-transparent";

                        return (
                            <div key={day} className={`h-14 md:h-20 rounded-xl flex flex-col items-center justify-center transition ${styles}`}>
                                <span className="font-bold text-sm md:text-lg">{day}</span>
                                {status && <span className="text-[10px] md:text-xs font-medium opacity-90">{status}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StudentAttendancePage;