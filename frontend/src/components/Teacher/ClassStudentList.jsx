import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiSearch, FiHash, FiX, FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// 👇 CHANGE THIS TO MATCH YOUR BACKEND PORT
const API_BASE_URL = "http://localhost:5000"; 

const ClassStudentList = ({ selectedClass }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (selectedClass === 'all') {
        setStudents([]); 
        return;
    }

const fetchStudents = async () => {
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          
          let queryStandard = selectedClass;
          let queryBoard = '';

          // 👇 Splitting "10th CBSE" into two variables
          if (selectedClass && selectedClass !== 'all') {
              const parts = selectedClass.split(' ');
              queryStandard = parts[0]; // Grabs "10th"
              if (parts.length > 1) {
                  queryBoard = parts[1]; // Grabs "CBSE"
              }
          }

          // 👇 Sending both variables to the backend!
          const res = await api.get(`/faculty/my-students?standard=${queryStandard}&board=${queryBoard}`, { 
              headers: { 'x-auth-token': token } 
          });
          
          setStudents(res.data);
      } catch (err) {
          console.error("Failed to fetch students");
      } finally {
          setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (student.rollNumber || student.rollNum)?.toString().includes(searchTerm)
  );

  // Helper for Images
  const getImgSrc = (path) => {
      if (!path) return null;
      return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  };

  if (selectedClass === 'all') return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up flex flex-col h-full">
       
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Class {selectedClass}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{students.length} Students Enrolled</p>
            </div>
            
            <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input 
                    type="text" 
                    placeholder="Search name or roll..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition shadow-sm"
                />
            </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
                <div className="p-10 text-center text-slate-400 font-medium">Fetching class records...</div>
            ) : filteredStudents.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No matches found.</div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Roll No</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-teal-50/40 transition group">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 ring-2 ring-white shadow-sm overflow-hidden flex items-center justify-center">
                                            {student.profilePic ? (
                                                <img 
                                                  src={getImgSrc(student.profilePic)} 
                                                  className="h-full w-full object-cover"
                                                  onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} 
                                                />
                                            ) : null}
                                            {/* Fallback if no img or error */}
                                            <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700 font-bold text-xs" style={{display: student.profilePic ? 'none' : 'flex'}}>
                                                {student.name.charAt(0)}
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition">{student.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                        <FiHash size={10}/> {student.rollNumber || student.rollNum || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button 
                                      onClick={() => setSelectedStudent(student)}
                                      className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition border border-transparent hover:border-teal-100"
                                    >
                                        View Profile
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* --- 👤 PROFESSIONAL MODAL --- */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedStudent(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              
              {/* Modal Content */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5"
              >
                {/* Modal Header */}
                <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition backdrop-blur-md"
                  >
                    <FiX size={18}/>
                  </button>
                </div>

                {/* Profile Pic Overlap */}
                <div className="px-8 pb-8 relative">
                  <div className="relative -mt-14 mb-4 flex justify-between items-end">
                    <div className="h-28 w-28 rounded-2xl bg-white p-1.5 shadow-lg ring-1 ring-slate-100">
                      <div className="h-full w-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                        {selectedStudent.profilePic ? (
                           <img 
                             src={getImgSrc(selectedStudent.profilePic)} 
                             className="h-full w-full object-cover"
                             onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                           />
                        ) : (
                           <FiUser size={40} className="text-slate-300"/>
                        )}
                      </div>
                    </div>
                    
                    {/* Roll No Badge */}
                     <div className="mb-2 bg-teal-50 text-teal-700 px-3 py-1 rounded-lg border border-teal-100 text-xs font-bold shadow-sm">
                        Roll No: {selectedStudent.rollNumber || selectedStudent.rollNum || 'N/A'}
                     </div>
                  </div>

                  {/* Identity */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-slate-800">{selectedStudent.name}</h2>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                       {selectedStudent.standard ? `Class ${selectedStudent.standard}` : `Class ${selectedClass}`} 
                       <span className="text-slate-300">•</span>
                       {selectedStudent.board || "Student"}
                    </p>
                  </div>

                  {/* Detail Grid */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <InfoRow icon={FiMail} label="Email" value={selectedStudent.email} />
                    <InfoRow icon={FiPhone} label="Student Phone" value={selectedStudent.contact} />
                    <div className="h-px bg-slate-200 my-1"></div>
                    <InfoRow icon={FiUser} label="Parent Name" value={selectedStudent.parentName || 'N/A'} />
                    <InfoRow icon={FiPhone} label="Parent Phone" value={selectedStudent.parentPhone || 'N/A'} />
                  </div>

                   <div className="mt-4 pt-2">
                        <InfoRow icon={FiMapPin} label="Address" value={selectedStudent.address || 'N/A'} />
                   </div>
                  
                  {/* Footer Action */}
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                  >
                    Close Profile
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};

// Compact Info Row for Modal
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-teal-500 bg-white p-1.5 rounded shadow-sm border border-slate-100"><Icon size={14}/></div>
    <div className="flex-1 min-w-0">
         <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
         </div>
         <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default ClassStudentList;