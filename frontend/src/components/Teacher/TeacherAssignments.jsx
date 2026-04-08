import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiPlus, FiTrash2, FiFileText, FiImage, FiCalendar, FiDownload, FiAlertCircle, FiX } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const TeacherAssignments = ({ selectedClass, teacherData }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State for file preview popup
  const [previewUrl, setPreviewUrl] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      subject: '',
      dueDate: '',
      file: null
  });

  // 👇 THE ROBUST FIX: Securely extract standard and board from the combined string or teacher profile
  const getExactClassDetails = () => {
      let exactStandard = selectedClass;
      let exactBoard = '';

      if (teacherData && teacherData.classes) {
          const matchedClass = teacherData.classes.find(c => {
              const combined = typeof c === 'string' ? c : `${c.standard} ${c.board}`;
              return combined === selectedClass;
          });

          if (matchedClass && typeof matchedClass === 'object') {
              exactStandard = matchedClass.standard; // Guaranteed exact match (e.g., "10th")
              exactBoard = matchedClass.board;       // Guaranteed exact match (e.g., "CBSE")
          } else if (selectedClass && selectedClass !== 'all') {
              // Fallback string split just in case
              const parts = selectedClass.split(' ');
              exactStandard = parts[0];
              if (parts.length > 1) exactBoard = parts.slice(1).join(' ');
          }
      } else if (selectedClass && selectedClass !== 'all') {
          const parts = selectedClass.split(' ');
          exactStandard = parts[0];
          if (parts.length > 1) exactBoard = parts.slice(1).join(' ');
      }
      return { exactStandard, exactBoard };
  };

  const { exactStandard, exactBoard } = getExactClassDetails();

  // --- FETCH ASSIGNMENTS ---
  useEffect(() => {
    if (!selectedClass || selectedClass === 'all') return;
    fetchAssignments();
  }, [selectedClass]);

  const fetchAssignments = async () => {
    try {
        const token = localStorage.getItem('token');
        
        // 👇 Send the perfectly extracted standard and board
        const res = await api.get('/assignments/view', {
            params: { standard: exactStandard, board: exactBoard },
            headers: { 'x-auth-token': token }
        });
        setAssignments(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.title || !formData.subject || !formData.dueDate) {
          return toast.error("Please fill required fields");
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      
      // 👇 Save perfectly split standard and board to the database
      data.append('standard', exactStandard);
      data.append('board', exactBoard);
      
      data.append('dueDate', formData.dueDate);
      if (formData.file) data.append('file', formData.file);

      setUploading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await api.post('/assignments/create', data, {
              headers: { 
                  'x-auth-token': token,
                  'Content-Type': 'multipart/form-data'
              }
          });
          setAssignments([res.data, ...assignments]);
          toast.success("Assignment Posted & Students Notified! 🔔");
          setShowModal(false);
          setFormData({ title: '', description: '', subject: '', dueDate: '', file: null });
      } catch (err) {
          toast.error("Failed to post assignment");
      } finally {
          setUploading(false);
      }
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id) => {
      if(!window.confirm("Delete this assignment?")) return;
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/assignments/${id}`, { headers: { 'x-auth-token': token } });
          setAssignments(assignments.filter(a => a._id !== id));
          toast.success("Assignment deleted");
      } catch (err) {
          toast.error("Failed to delete");
      }
  };

  // Smart URL formatting function
  const API_BASE_URL = "http://localhost:5000"; 
  const getFileUrl = (fileUrl) => {
      if (!fileUrl) return "#";
      if (fileUrl.startsWith('http')) return fileUrl;
      return `${API_BASE_URL}${fileUrl}`;
  };

  if (selectedClass === 'all') {
      return (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-200">
              <FiAlertCircle size={32} className="text-gray-400 mb-2" />
              <p className="text-gray-500 font-bold">Please select a class from the header to manage assignments.</p>
          </div>
      );
  }

  return (
    <div className="animate-fade-in-up font-sans relative">
        <Toaster position="top-right" />

        {/* HEADER & CREATE BUTTON */}
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-2xl font-extrabold text-gray-800">Assignments</h2>
                <p className="text-sm text-gray-500 mt-1">Class {exactStandard} ({exactBoard || 'SSC'})</p>
            </div>
            <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition active:scale-95"
            >
                <FiPlus /> New Assignment
            </button>
        </div>

        {/* ASSIGNMENT LIST */}
        <div className="grid gap-4">
            {assignments.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-400 font-bold">No assignments active.</p>
                </div>
            ) : (
                assignments.map(assign => (
                    <div key={assign._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 relative group">
                        
                        {/* Date Badge */}
                        <div className="md:w-20 shrink-0 flex flex-col items-center justify-center bg-teal-50 rounded-xl p-2 text-teal-800 border border-teal-100">
                            <span className="text-xs font-bold uppercase">Due</span>
                            <span className="text-xl font-extrabold">{new Date(assign.dueDate).getDate()}</span>
                            <span className="text-xs font-bold uppercase">{new Date(assign.dueDate).toLocaleString('default', { month: 'short' })}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">
                                    {assign.subject}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{assign.title}</h3>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{assign.description}</p>
                            
                            {/* File Attachment */}
                            {assign.fileUrl && (
                                <button 
                                    onClick={() => setPreviewUrl(getFileUrl(assign.fileUrl))}
                                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                                >
                                    <FiDownload /> View Attached File ({assign.fileType})
                                </button>
                            )}
                        </div>

                        {/* Delete Action */}
                        <button 
                            onClick={() => handleDelete(assign._id)}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                ))
            )}
        </div>

        {/* --- CREATE MODAL --- */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Create Assignment</h3>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">Close</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Title</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-gray-700"
                                placeholder="e.g. Algebra Chapter 1"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-gray-700"
                                    placeholder="e.g. Maths"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Due Date</label>
                                <input 
                                    type="date" 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-gray-700"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Instructions (Optional)</label>
                            <textarea 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700 h-24 resize-none"
                                placeholder="Details regarding the homework..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Attachment (PDF/Img)</label>
                            <input 
                                type="file" 
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                onChange={e => setFormData({...formData, file: e.target.files[0]})}
                            />
                        </div>

                        <button 
                            disabled={uploading}
                            type="submit" 
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition active:scale-95 flex justify-center"
                        >
                            {uploading ? "Posting..." : "Post Assignment"}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* ========================================================= */}
        {/* ================= FILE PREVIEW POPUP ==================== */}
        {/* ========================================================= */}
        {previewUrl && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FiFileText className="text-teal-600" /> Assignment Attachment Preview
                        </h3>
                        <div className="flex items-center gap-4">
                            <a 
                                href={previewUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                            >
                                Open in New Tab
                            </a>
                            <button 
                                onClick={() => setPreviewUrl(null)} 
                                className="p-2 bg-gray-200 rounded-full hover:bg-red-100 hover:text-red-600 transition"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full bg-gray-100">
                        <iframe 
                            src={previewUrl} 
                            title="Assignment Preview"
                            className="w-full h-full border-none"
                        ></iframe>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TeacherAssignments;