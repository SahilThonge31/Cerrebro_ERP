import React, { useState, useEffect } from 'react';
    import api from '../../api';
    import { FiClock, FiDownload, FiAlertCircle, FiCalendar, FiExternalLink, FiMaximize2 } from 'react-icons/fi';

    const TeacherSchedule = ({ selectedClass, teacherData }) => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);

    // 👇 THE PROVEN FIX: Safely extract standard and board from the combined string
    const getExactClassDetails = () => {
        let exactStandard = selectedClass;
        let exactBoard = '';

        if (selectedClass && selectedClass !== 'all') {
            const parts = selectedClass.split(' ');
            exactStandard = parts[0]; // Grabs the "10th"
            if (parts.length > 1) {
                exactBoard = parts[1]; // Grabs the "CBSE"
            }
        }
        return { exactStandard, exactBoard };
    };

    const { exactStandard, exactBoard } = getExactClassDetails();

    // Helper: Fix PDF URL
    const getFileUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    // Fetch Data
    useEffect(() => {
        if (selectedClass === 'all') {
            setTimetable(null);
            return;
        }

        const fetchTimetable = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // 👇 Send the perfectly split standard and board to the backend
            const res = await api.get('/timetable/view', { 
                params: { standard: exactStandard, board: exactBoard },
                headers: { 'x-auth-token': token } 
            });
            setTimetable(res.data);
        } catch (err) {
            setTimetable(null);
        } finally {
            setLoading(false);
        }
        };

        fetchTimetable();
    }, [exactStandard, exactBoard, selectedClass]);

    // --- EMPTY STATE (Select Class) ---
    if (selectedClass === 'all') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-3xl border border-dashed border-gray-200 animate-fade-in-up p-6 text-center">
                <div className="bg-teal-50 p-4 rounded-full mb-4 shadow-sm">
                    <FiCalendar size={32} className="text-teal-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Select a Class</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-xs">
                    Please select a class from the header dropdown to view its schedule.
                </p>
            </div>
        );
    }

    const pdfUrl = timetable ? getFileUrl(timetable.pdfUrl) : '';

    return (
        <div className="animate-fade-in-up font-sans text-slate-800 pb-10">
            
            {/* --- 1. HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider border border-teal-200">
                            {exactBoard || 'SSC'} Board
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                            Class {exactStandard}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                        <FiClock className="text-teal-500" /> Class Schedule
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Manage and view the weekly timetable.
                    </p>
                </div>

                {/* Desktop Actions */}
                {timetable && (
                    <div className="hidden md:flex gap-3">
                        <a 
                            href={pdfUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm"
                        >
                            <FiExternalLink /> Open New Tab
                        </a>
                        <a 
                            href={pdfUrl} 
                            download
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition active:scale-95"
                        >
                            <FiDownload /> Download
                        </a>
                    </div>
                )}
            </div>

            {/* --- 2. DOCUMENT VIEWER --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-[400px]">
                
                {/* Toolbar (Visible on all screens) */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {timetable ? 'Document Preview' : 'Status'}
                    </span>
                    
                    {/* Mobile Actions (Icon only) */}
                    {timetable && (
                        <div className="flex md:hidden gap-3">
                            <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-teal-600">
                                <FiMaximize2 size={18} />
                            </a>
                            <a href={pdfUrl} download className="text-slate-500 hover:text-teal-600">
                                <FiDownload size={18} />
                            </a>
                        </div>
                    )}
                </div>

                {/* Content Body */}
                <div className="relative bg-slate-100/50 min-h-[500px] md:min-h-[750px]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                            <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full mb-3"></div>
                            <span className="text-sm font-bold text-slate-400">Loading Schedule...</span>
                        </div>
                    ) : timetable ? (
                        <>
                            {/* Desktop: Iframe */}
                            <iframe 
                                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-[500px] md:h-[750px] border-none hidden md:block"
                                title="Timetable Viewer"
                            />

                            {/* Mobile: Placeholder Card (Better UX than tiny iframe) */}
                            <div className="md:hidden flex flex-col items-center justify-center h-[400px] p-6 text-center">
                                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                                    <FiFileText size={48} className="text-red-500" /> {/* Changed Icon to FileText if imported, or keep Clock */}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Timetable PDF</h3>
                                <p className="text-slate-500 text-sm mb-6 max-w-[200px]">
                                    This file is best viewed in full screen on mobile devices.
                                </p>
                                <a 
                                    href={pdfUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full max-w-xs bg-teal-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-200 flex items-center justify-center gap-2 active:scale-95 transition"
                                >
                                    <FiMaximize2 /> View Full Screen
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] md:h-[600px] px-6 text-center">
                            <div className="bg-red-50 p-5 rounded-full mb-4">
                                <FiAlertCircle size={40} className="text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">No Timetable Found</h3>
                            <p className="text-slate-400 text-sm mt-2 max-w-md">
                                The admin hasn't uploaded the schedule for <strong>Class {exactStandard} ({exactBoard || 'SSC'})</strong> yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    };

    // Simple icon replacement if needed
    const FiFileText = ({ size, className }) => (
        <svg 
            stroke="currentColor" 
            fill="none" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            height={size} 
            width={size} 
            className={className} 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    );

    export default TeacherSchedule;