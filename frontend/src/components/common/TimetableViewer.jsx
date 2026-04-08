import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiCalendar, FiDownload } from 'react-icons/fi';

const TimetableViewer = ({ userRole, userDetails }) => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For Students: Use their specific class
        // For Teachers: They might need to select a class, or view a general one. 
        // Assuming Teachers want to see a specific class schedule here:
        if (userDetails && userDetails.standard && userDetails.board) {
            fetchTimetable(userDetails.standard, userDetails.board);
        } else if (userRole === 'teacher') {
            // If teacher, maybe default to 10th CBSE or provide a dropdown (Simpler version here)
            fetchTimetable('10th', 'CBSE'); 
        }
    }, [userDetails]);

    const fetchTimetable = async (std, brd) => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/timetable/fetch?standard=${std}&board=${brd}`, {
                headers: { 'x-auth-token': token }
            });
            setTimetable(res.data);
        } catch (err) {
            console.log("No timetable found");
        } finally {
            setLoading(false);
        }
    };

    const getFileUrl = (path) => `http://localhost:5000${path}`;

    if (loading) return <div className="p-4 text-gray-500">Loading Schedule...</div>;

    if (!timetable) return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center">
            <FiCalendar className="mx-auto text-gray-300 mb-2" size={30}/>
            <p className="text-gray-400 font-bold text-sm">No Timetable Uploaded Yet.</p>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FiCalendar className="text-blue-600"/> Class Timetable
                </h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">
                    {timetable.standard} - {timetable.board}
                </span>
            </div>
            
            {/* PDF Preview / Download Button */}
            <div className="flex flex-col gap-3">
                <a 
                    href={getFileUrl(timetable.pdfUrl)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full block text-center bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                    <FiDownload className="inline mr-2"/> View / Download PDF
                </a>
                <p className="text-xs text-center text-gray-400">
                    Uploaded on: {new Date(timetable.updatedAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default TimetableViewer;