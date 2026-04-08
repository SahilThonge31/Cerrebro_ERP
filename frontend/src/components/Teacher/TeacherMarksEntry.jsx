import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiSave, FiFilter, FiUser, FiCheckCircle, FiBookOpen, FiEdit2 } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const TeacherMarksEntry = ({ selectedClass, teacherData }) => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // New State for Max Marks
  const [maxMarks, setMaxMarks] = useState(100); 

  const [marksData, setMarksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 👇 THE FIX: Robust Splitter to get pure standard and board
  const getExactClassDetails = () => {
      let exactStandard = selectedClass;
      let exactBoard = '';

      if (selectedClass && selectedClass !== 'all') {
          const parts = selectedClass.split(' ');
          exactStandard = parts[0]; // Grabs "10th"
          if (parts.length > 1) {
              exactBoard = parts[1]; // Grabs "CBSE"
          }
      }
      return { exactStandard, exactBoard };
  };

  const { exactStandard, exactBoard } = getExactClassDetails();

  // 1. Fetch Students & Subjects
  useEffect(() => {
    if (selectedClass === 'all') return;

    const initData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Subjects - Using exactBoard
            const subRes = await api.get('/academic', { 
                params: { board: exactBoard }, 
                headers: { 'x-auth-token': token } 
            });
            // Find using exactStandard
            const classData = subRes.data.find(c => c.className === exactStandard);
            setSubjects(classData ? classData.subjects : []);

            // Students - Using split parameters
            const stdRes = await api.get('/faculty/class-students', {
                params: { class: exactStandard, board: exactBoard },
                headers: { 'x-auth-token': token }
            });
            setStudents(stdRes.data);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load class data");
        } finally {
            setLoading(false);
        }
    };
    initData();
    setSelectedSubject('');
    setMarksData({});
    setMaxMarks(100); 
  }, [selectedClass, exactStandard, exactBoard]);


  // 2. Fetch Existing Marks
  useEffect(() => {
    if (!selectedSubject || selectedClass === 'all') return;

    const fetchExistingMarks = async () => {
        try {
            const token = localStorage.getItem('token');
            // Using split parameters for precise lookup
            const res = await api.get('/results/view', {
                params: { standard: exactStandard, board: exactBoard, subject: selectedSubject },
                headers: { 'x-auth-token': token }
            });

            const marksMap = {};
            let fetchedMax = 100; 

            res.data.forEach(r => {
                marksMap[r.student] = { marks: r.marksObtained, remarks: r.remarks };
                if (r.totalMarks) fetchedMax = r.totalMarks; 
            });
            
            setMarksData(marksMap);
            setMaxMarks(fetchedMax); 
        } catch (err) {
            console.error(err);
        }
    };
    fetchExistingMarks();
  }, [selectedSubject, exactStandard, exactBoard]);


  // 3. Handle Input Change with Validation
  const handleInputChange = (studentId, field, value) => {
      if (field === 'marks') {
          if (value > maxMarks) {
              toast.error(`Marks cannot exceed ${maxMarks}`);
              return; 
          }
          if (value < 0) return;
      }

      setMarksData(prev => ({
          ...prev,
          [studentId]: {
              ...prev[studentId],
              [field]: value
          }
      }));
  };

  // 4. Submit Handler
  const handleSubmit = async () => {
      if (!selectedSubject) return toast.error("Please select a subject");
      
      setSaving(true);
      try {
          const token = localStorage.getItem('token');
          
          const studentsArray = Object.keys(marksData).map(studentId => ({
              studentId,
              marks: marksData[studentId]?.marks || 0,
              remarks: marksData[studentId]?.remarks || ''
          }));

          // Using split parameters to save correctly in the DB
          await api.post('/results/submit', {
              standard: exactStandard,
              board: exactBoard,
              subject: selectedSubject,
              totalMarks: maxMarks, 
              studentsData: studentsArray
          }, { headers: { 'x-auth-token': token } });

          toast.success(`Marks for ${selectedSubject} saved successfully!`);
      } catch (err) {
          toast.error("Failed to save marks");
      } finally {
          setSaving(false);
      }
  };


  if (selectedClass === 'all') {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-white rounded-3xl border border-dashed border-gray-200 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-700">Select a Class</h3>
            <p className="text-gray-400 text-sm">Please select a class from the header to enter marks.</p>
        </div>
    );
  }

  return (
    <div className="animate-fade-in-up font-sans text-slate-800 pb-10">
        <Toaster position="top-right" />

        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-8 gap-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800">Marks Entry</h1>
                <p className="text-slate-500 font-medium mt-1">
                    Entering data for <span className="text-teal-600 font-bold">Class {exactStandard} ({exactBoard || 'SSC'})</span>
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                
                {/* 1. Max Marks Input */}
                <div className="w-full sm:w-32">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Total Marks
                    </label>
                    <div className="relative">
                        <input 
                            type="number"
                            min="1"
                            value={maxMarks}
                            onChange={(e) => setMaxMarks(Number(e.target.value))}
                            className="w-full p-3 pl-9 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                        />
                        <FiEdit2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    </div>
                </div>

                {/* 2. Subject Selector */}
                <div className="w-full sm:w-64">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Select Subject
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="">-- Choose Subject --</option>
                            {subjects.map((sub, i) => (
                                <option key={i} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                        <FiBookOpen className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>

        {/* --- MARKS TABLE --- */}
        {!selectedSubject ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-slate-400 font-bold">Please select a subject to load the student list.</p>
            </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Marks (Out of {maxMarks})
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks (For AI)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {students.map((student) => (
                                <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{student.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">Roll: {student.rollNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number"
                                            min="0"
                                            max={maxMarks}
                                            placeholder="0"
                                            value={marksData[student._id]?.marks || ''}
                                            onChange={(e) => handleInputChange(student._id, 'marks', e.target.value)}
                                            className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-center outline-none focus:ring-2 focus:ring-teal-500 transition-all focus:bg-white"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="text"
                                            placeholder="e.g. Needs improvement in algebra..."
                                            value={marksData[student._id]?.remarks || ''}
                                            onChange={(e) => handleInputChange(student._id, 'remarks', e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all focus:bg-white"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>Saving...</>
                        ) : (
                            <> <FiSave size={18} /> Save Marks </>
                        )}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default TeacherMarksEntry;