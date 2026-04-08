import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiCheckCircle, FiXCircle, FiMapPin, FiClock, FiAlertCircle } from 'react-icons/fi';

const AttendanceCard = () => {
  const [status, setStatus] = useState('Loading...');
  const [loading, setLoading] = useState(true);

  // 1. Get Today's Date for Display (e.g., "Friday, Feb 13")
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  // 2. 🟢 FIX: Generate Local YYYY-MM-DD Key (Matches Admin Input)
  // We do NOT use toISOString() because it shifts to UTC (often yesterday).
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  const apiDateKey = `${year}-${month}-${day}`; // Result: "2026-02-13" (Local)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch full history
        const res = await api.get('/attendance/student/my-history', { headers: { 'x-auth-token': token } });
        const history = res.data;

        console.log("Looking for Date:", apiDateKey); // Debug Log
        console.log("Available Data:", history);      // Debug Log

        // Check exact match
        if (history[apiDateKey]) {
            setStatus(history[apiDateKey]);
        } else {
            setStatus('Not Marked'); // Admin hasn't submitted today yet
        }
      } catch (err) {
        console.error(err);
        setStatus('Error');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [apiDateKey]);

  // Determine Styles based on Status
  let statusColor = "bg-gray-100 text-gray-500";
  let Icon = FiClock; // Default icon for "Not Marked"

  if (status === 'Present') {
      statusColor = "bg-green-100 text-green-700 border border-green-200";
      Icon = FiCheckCircle;
  } else if (status === 'Absent') {
      statusColor = "bg-red-100 text-red-700 border border-red-200";
      Icon = FiXCircle;
  } else if (status === 'Not Marked') {
      statusColor = "bg-yellow-50 text-yellow-600 border border-yellow-200";
      Icon = FiAlertCircle;
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition hover:shadow-md">
      <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-2">
        <h3 className="font-heading text-sm font-bold text-gray-700">Today's Attendance</h3>
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{dateString}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${status === 'Present' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
             <FiMapPin size={20} />
           </div>
           <div>
               <span className="block font-bold text-gray-700 text-sm">School Campus</span>
               <span className="text-xs text-gray-400">Daily Check-in</span>
           </div>
        </div>

        <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition-all ${statusColor}`}>
          <Icon size={16} />
          {loading ? 'Checking...' : status}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;