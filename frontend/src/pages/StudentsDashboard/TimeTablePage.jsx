import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiClock, FiDownload, FiAlertCircle } from 'react-icons/fi';

const TimeTablePage = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem('token');
        // This will now work because we added the route!
        const res = await api.get('/timetable/my-timetable', { 
            headers: { 'x-auth-token': token } 
        });
        setTimetable(res.data);
      } catch (err) {
        setError("Timetable has not been uploaded for your class yet.");
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  // 🟢 HELPER TO FIX URL PATHS 🟢
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up">
      
      {/* 1. Header */}
      <div className="bg-white px-6 py-8 shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-5xl flex justify-between items-center">
            <div>
                <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-800">
                    <span className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                        <FiClock />
                    </span>
                    Weekly Timetable
                </h1>
                <p className="mt-2 text-gray-500">Check your class schedule and timings.</p>
            </div>
            
            {/* Download Button */}
            {timetable && (
                <a 
                    href={getFileUrl(timetable.pdfUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hidden md:flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-transform hover:scale-105 active:scale-95"
                >
                    <FiDownload /> Download PDF
                </a>
            )}
        </div>
      </div>

      {/* 2. PDF Viewer Content */}
      <div className="mx-auto max-w-5xl px-4 mt-8">
        {loading ? (
            <div className="h-96 w-full animate-pulse rounded-2xl bg-gray-200"></div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 text-center">
                <FiAlertCircle size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Not Found</h3>
                <p className="text-gray-400">{error}</p>
            </div>
        ) : (
            <div className="rounded-2xl bg-white p-2 shadow-lg border border-gray-100 h-[80vh]">
                <iframe 
                    src={getFileUrl(timetable.pdfUrl)} 
                    className="w-full h-full rounded-xl"
                    title="Timetable PDF"
                />
            </div>
        )}

        {/* Mobile Download Button */}
        {timetable && (
            <div className="mt-6 md:hidden">
                <a 
                    href={getFileUrl(timetable.pdfUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg"
                >
                    <FiDownload /> Download Timetable
                </a>
            </div>
        )}
      </div>

    </div>
  );
};

export default TimeTablePage;