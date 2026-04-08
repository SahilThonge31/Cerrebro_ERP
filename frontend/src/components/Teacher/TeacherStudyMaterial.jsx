import React, { useEffect, useState } from 'react';
import api from '../../api';
import { 
    FiBook, FiArrowRight, FiLayers, FiAlertCircle, FiX, 
    FiUpload, FiFileText, FiTrash2, FiDownload, 
    FiClock, FiUser, FiVideo, FiLink, FiUploadCloud, FiCheckCircle, FiLoader
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Helper for file icons (Removed Audio)
const getIcon = (type) => {
    if(type === 'Video Lecture' || type === 'Video') return <FiVideo className="text-red-500" size={24} />;
    if(type === 'Textbook') return <FiBook className="text-blue-500" size={24} />;
    if(type === 'Link') return <FiLink className="text-blue-500" size={24} />;
    return <FiFileText className="text-teal-500" size={24} />; // Default for Notes/PDF
};

const TeacherStudyMaterial = ({ teacherData, selectedClass }) => {
  const [academics, setAcademics] = useState([]);
  const [loading, setLoading] = useState(true);
  const assignedClasses = teacherData?.classes || [];

  // --- MODAL & SUBJECT STATES ---
  const [selectedSubject, setSelectedSubject] = useState(null); // { board, className, subject }
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // NEW: State to handle the file preview popup
  const [previewUrl, setPreviewUrl] = useState(null);

  // Form State
  const [category, setCategory] = useState('Notes'); 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. Fetch Class Structure on Mount
  useEffect(() => {
    fetchMySubjects();
  }, [teacherData]);

  const fetchMySubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const myBoards = [...new Set(assignedClasses.map(c => typeof c === 'string' ? '' : c.board).filter(Boolean))];
      
      let allAcademics = [];
      for (const board of myBoards) {
          const res = await api.get(`/academic?board=${board}`, { headers: { 'x-auth-token': token } });
          allAcademics = [...allAcademics, ...res.data];
      }

      const myRelevantAcademics = allAcademics.filter(academic => 
          assignedClasses.some(cls => 
              (typeof cls === 'string' ? cls : cls.standard) === academic.className &&
              (typeof cls === 'string' ? true : cls.board === academic.board)
          )
      );

      setAcademics(myRelevantAcademics);
    } catch (error) {
      toast.error("Could not load classes");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Materials when a Subject is clicked
  useEffect(() => {
      if (selectedSubject) {
          fetchMaterialsForSubject(selectedSubject);
      }
  }, [selectedSubject]);

  const fetchMaterialsForSubject = async (subjectData) => {
      setMaterialsLoading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await api.get(`/academic/materials`, { 
              params: { board: subjectData.board, className: subjectData.className, subject: subjectData.subject },
              headers: { 'x-auth-token': token } 
          });
          setMaterials(res.data);
      } catch (error) {
          toast.error("Failed to load materials");
      } finally {
          setMaterialsLoading(false);
      }
  };

  // 3. Handle Upload
  const handleAddMaterial = async (e) => {
      e.preventDefault();
      if (!selectedSubject) return;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('board', selectedSubject.board);
      formData.append('className', selectedSubject.className);
      formData.append('subject', selectedSubject.subject);
      formData.append('uploadedBy', teacherData.name);

      if (category === 'Video Lecture') {
          if (!linkUrl) return toast.error("Please enter a Video URL");
          formData.append('linkUrl', linkUrl);
          formData.append('type', 'Video Lecture'); 
      } else {
          if (!selectedFile) return toast.error(`Please select a ${category} file`);
          formData.append('file', selectedFile);
          formData.append('type', category); 
      }

      setUploading(true);
      try {
          const token = localStorage.getItem('token');
          await api.post('/academic/materials/add', formData, { 
              headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } 
          });

          // Reset Form & Refresh Materials
          setTitle(''); setDescription(''); setLinkUrl(''); setSelectedFile(null); setCategory('Notes');
          toast.success("Content Uploaded Successfully! 🚀");
          fetchMaterialsForSubject(selectedSubject);
      } catch (err) {
          toast.error("Failed to upload content");
      } finally {
          setUploading(false);
      }
  };

  // 4. Handle Delete
  const handleDelete = async (id) => {
      if(!window.confirm("Delete this content permanently?")) return;
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/academic/materials/${id}`, { headers: { 'x-auth-token': token } });
          setMaterials(materials.filter(m => m._id !== id));
          toast.success("Content deleted");
      } catch (err) {
          toast.error("Delete Failed");
      }
  };

  // 👇 THE FIX: Filter Classes based on Header Dropdown (Matches "10th CBSE")
  const displayedAcademics = academics.filter(academic => {
      if (!selectedClass || selectedClass === 'all') return true;
      const combinedAcademicString = `${academic.className} ${academic.board}`;
      return combinedAcademicString === selectedClass || academic.className === selectedClass;
  });

  // Add your backend base URL at the top of your file if you don't have it already
  const API_BASE_URL = "http://localhost:5000"; 

  // Smart URL formatting function
  const getFileUrl = (fileUrl, linkUrl) => {
      const targetUrl = fileUrl || linkUrl;
      if (!targetUrl) return "#"; 
      if (targetUrl.startsWith('http')) return targetUrl;
      return `${API_BASE_URL}${targetUrl}`;
  };

  return (
    <div className="animate-fade-in-up font-sans relative">
        
        {/* --- MAIN PAGE CONTENT --- */}
        <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
                <FiBook className="text-teal-600"/> Study Material
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
                Select a subject below to upload notes, textbooks, or video lectures for your students.
            </p>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>)}
             </div>
        ) : displayedAcademics.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-400 font-bold">No subjects found for the selected filter.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedAcademics.map((academic) => (
                    <div key={academic._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
                        
                        <div className="bg-gradient-to-r from-teal-50 to-white p-5 border-b border-teal-50 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-extrabold text-teal-900">Class {academic.className}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-teal-200">
                                        {academic.board}
                                    </span>
                                </div>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-teal-600 shadow-sm">
                                <FiLayers size={14} />
                            </div>
                        </div>

                        <div className="p-5 flex-1 bg-white">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Select Subject</p>
                            <div className="flex flex-col gap-2.5">
                                {academic.subjects.map((sub, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setSelectedSubject({ board: academic.board, className: academic.className, subject: sub.name })}
                                        className="flex justify-between items-center p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-all group/btn text-left"
                                    >
                                        <div>
                                            <span className="font-bold text-gray-700 text-sm group-hover/btn:text-teal-900 transition-colors">
                                                {sub.name}
                                            </span>
                                            {sub.teacherName === teacherData.name && (
                                                <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-1.5 rounded-sm font-bold border border-green-200">YOU</span>
                                            )}
                                        </div>
                                        <FiArrowRight size={14} className="text-gray-300 group-hover/btn:text-teal-500 transition-transform group-hover/btn:translate-x-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* ========================================================= */}
        {/* ==================== POPUP MODAL ======================== */}
        {/* ========================================================= */}
        {selectedSubject && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                
                {/* Modal Container */}
                <div className="bg-[#F8FAFC] w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
                    
                    {/* Modal Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiBook className="text-teal-600"/> {selectedSubject.subject}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                Class {selectedSubject.className} • {selectedSubject.board} Board
                            </p>
                        </div>
                        <button 
                            onClick={() => setSelectedSubject(null)} 
                            className="p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-600 transition text-gray-500"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Modal Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            
                            {/* LEFT: UPLOAD FORM */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-0">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                                        <FiUpload className="text-teal-600" /> Upload Content
                                    </h3>
                                    
                                    <form onSubmit={handleAddMaterial} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Select Category</label>
                                            <select 
                                                className="w-full border border-gray-200 p-2.5 rounded-xl outline-none bg-white focus:border-teal-400 font-medium text-sm text-gray-700"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                            >
                                                <option value="Notes">Notes (PDF)</option>
                                                <option value="Textbook">Textbook (PDF)</option>
                                                <option value="Video Lecture">Video Lecture (Link)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                                            <input 
                                                required
                                                className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:border-teal-400 text-sm" 
                                                placeholder="e.g. Chapter 1 Explanation"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                            />
                                        </div>

                                        {category === 'Video Lecture' ? (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Video Link (YouTube/Drive)</label>
                                                <input 
                                                    type="url" required
                                                    className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:border-teal-400 text-sm" 
                                                    placeholder="https://youtube.com/..."
                                                    value={linkUrl}
                                                    onChange={e => setLinkUrl(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                                    Upload File
                                                </label>
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-300 transition">
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf,.doc,.docx"
                                                        className="hidden"
                                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                                    />
                                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                                        <FiUploadCloud size={24}/>
                                                        <span className="text-xs font-bold text-gray-600 text-center px-4">
                                                            {selectedFile ? selectedFile.name : `Click to select ${category} file`}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                            <textarea 
                                                className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:border-teal-400 text-sm h-20 resize-none" 
                                                placeholder="Brief details..."
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                            />
                                        </div>

                                        <button 
                                            disabled={uploading}
                                            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                                        >
                                            {uploading ? <><FiLoader className="animate-spin" /> Uploading...</> : `Upload ${category}`}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* RIGHT: LIST OF UPLOADED MATERIALS */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                                        <h3 className="font-bold text-gray-700">Uploaded Materials</h3>
                                        <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-lg shadow-sm">
                                            {materials.length} Files
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-4">
                                        {materialsLoading ? (
                                            <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                                                <FiLoader className="animate-spin mb-2 text-teal-500" size={28} /> Loading materials...
                                            </div>
                                        ) : materials.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                <FiUploadCloud size={48} className="text-gray-300 mb-4" />
                                                <h3 className="text-lg font-bold text-gray-500">No Content Uploaded</h3>
                                                <p className="text-sm text-gray-400">Use the form to upload notes, textbooks, or videos.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                {materials.map((item) => (
                                                    <div key={item._id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-200 transition group">
                                                        
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 rounded-xl bg-gray-50 shrink-0">
                                                                {getIcon(item.type)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description || "No description provided."}</p>
                                                                
                                                                <div className="flex items-center flex-wrap gap-3 mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                                                    <span className="flex items-center gap-1"><FiUser size={12}/> {item.uploadedBy || 'Teacher'}</span>
                                                                    <span className="flex items-center gap-1"><FiClock size={12}/> {new Date(item.createdAt).toLocaleDateString()}</span>
                                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.type}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 sm:self-auto self-end">
                                                            <button 
                                                                onClick={() => setPreviewUrl(getFileUrl(item.fileUrl, item.linkUrl))}
                                                                className="px-4 py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-100 transition flex items-center gap-2"
                                                            >
                                                                <FiDownload size={14} /> View
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(item._id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                            <FiFileText className="text-teal-600" /> File Preview
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
                            title="File Preview"
                            className="w-full h-full border-none"
                        ></iframe>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TeacherStudyMaterial;