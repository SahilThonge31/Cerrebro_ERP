import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiMenu, FiEye, FiList, FiCalendar, FiTrash2, FiX } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const AdminTimetablePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Selection State
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedBoard, setSelectedBoard] = useState('CBSE');
  const [file, setFile] = useState(null);
  
  // Data State
  const [existingTimetable, setExistingTimetable] = useState(null);
  const [allTimetables, setAllTimetables] = useState([]);

  // State for file preview popup
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    setFile(null); 
    fetchCurrentTimetable();
    fetchAllTimetables();
  }, [selectedClass, selectedBoard]);

  const fetchCurrentTimetable = async () => {
    try {
        setExistingTimetable(null);
        const token = localStorage.getItem('token');
        
        // 👇 THE FIX: Send the raw standard and board exactly as they are
        const res = await api.get(`/timetable/fetch?standard=${selectedClass}&board=${selectedBoard}`, { 
            headers: { 'x-auth-token': token } 
        });
        setExistingTimetable(res.data);
    } catch (err) { /* Ignore 404 */ }
  };

  const fetchAllTimetables = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await api.get('/timetable/all', { headers: { 'x-auth-token': token } });
          setAllTimetables(res.data);
      } catch (err) { console.error("Failed to load list"); }
  };

  const handleUpload = async (e) => {
      e.preventDefault();
      if (!file) return toast.error("Please select a PDF file!");

      const formData = new FormData();
      formData.append('file', file);
      
      // 👇 THE FIX: Append exactly what the database expects ("10th" and "CBSE")
      formData.append('standard', selectedClass); 
      formData.append('board', selectedBoard);

      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          await api.post('/timetable/upload', formData, {
              headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
          });
          toast.success("Timetable Uploaded!");
          setFile(null);
          fetchCurrentTimetable();
          fetchAllTimetables(); 
      } catch (err) {
          toast.error("Upload Failed");
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this timetable?")) return;
      
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/timetable/${id}`, { headers: { 'x-auth-token': token } });
          toast.success("Timetable Deleted!");
          
          fetchCurrentTimetable();
          fetchAllTimetables();
      } catch (err) {
          toast.error("Failed to delete timetable");
      }
  };

  // URL Helper
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; 
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-center" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 transition-all w-full overflow-hidden">
        
        {/* Mobile-Friendly Header */}
        <header className="flex h-16 md:h-20 items-center justify-between bg-white px-4 md:px-8 shadow-sm">
           <div className="flex items-center gap-3 md:gap-4">
               <button className="lg:hidden p-2 -ml-2 text-gray-600 rounded-lg hover:bg-gray-100" onClick={() => setIsSidebarOpen(true)}>
                   <FiMenu size={24}/>
               </button>
               <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2 truncate">
                  <FiFileText className="text-blue-600 shrink-0" /> Timetable Manager
               </h1>
           </div>
        </header>

        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            
            {/* --- SECTION 1: UPLOAD AREA --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
                
                {/* Upload Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><FiUploadCloud className="text-blue-500"/> Upload New Schedule</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Class</label>
                            <select className="w-full p-3 rounded-xl border border-gray-200 font-bold bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                {['8th','9th','10th','11th','12th'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Board</label>
                            <select className="w-full p-3 rounded-xl border border-gray-200 font-bold bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                value={selectedBoard} onChange={e => setSelectedBoard(e.target.value)}>
                                {['CBSE','SSC'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-6 md:p-8 text-center hover:bg-blue-50 transition mb-4">
                        <input type="file" onChange={e => setFile(e.target.files[0])} className="hidden" id="file-upload" accept=".pdf,image/*" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                            <FiUploadCloud size={36} className="text-blue-500" />
                            <span className="text-blue-700 font-bold text-sm text-center px-4 break-words w-full">
                                {file ? file.name : "Tap to Select PDF/Image"}
                            </span>
                        </label>
                    </div>

                    <button onClick={handleUpload} disabled={loading} 
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition flex justify-center items-center gap-2
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}
                        `}>
                        {loading ? 'Uploading to Cloud...' : 'Save Timetable'}
                    </button>
                </div>

                {/* Current Status Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col items-center justify-center text-center h-full min-h-[250px]">
                    {existingTimetable ? (
                        <div className="flex flex-col items-center w-full">
                            <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4 animate-fade-in-up"><FiCheckCircle size={36} /></div>
                            <h3 className="font-bold text-green-800 text-lg">Active Schedule</h3>
                            <p className="text-sm font-medium text-gray-500 mb-6 bg-gray-50 px-4 py-1.5 rounded-full mt-2">
                                {selectedClass} • {selectedBoard}
                            </p>
                            
                            <button 
                               onClick={() => setPreviewUrl(getFileUrl(existingTimetable.pdfUrl))}
                               className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md shadow-green-200">
                                <FiEye size={18} /> View File
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center opacity-70">
                            <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4 border border-gray-100"><FiFileText size={36} /></div>
                            <h3 className="font-bold text-gray-500 text-lg">No Schedule Found</h3>
                            <p className="text-sm text-gray-400 mt-1 max-w-[200px]">Upload a file to set the timetable for this class.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SECTION 2: ALL UPLOADED TIMETABLES LIST --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3 shrink-0">
                    <FiList className="text-gray-500" size={20}/>
                    <h3 className="font-bold text-gray-700 text-lg">All Uploaded Timetables ({allTimetables.length})</h3>
                </div>
                
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100 bg-white">
                                <th className="p-4 md:p-5 whitespace-nowrap">Standard</th>
                                <th className="p-4 md:p-5 whitespace-nowrap">Board</th>
                                <th className="p-4 md:p-5 whitespace-nowrap">Uploaded On</th>
                                <th className="p-4 md:p-5 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {allTimetables.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400 font-medium">
                                        No timetables uploaded yet.
                                    </td>
                                </tr>
                            ) : (
                                allTimetables.map((tt) => (
                                    <tr key={tt._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition group">
                                        <td className="p-4 md:p-5 font-bold text-gray-800 text-base capitalize">{tt.standard}</td>
                                        <td className="p-4 md:p-5">
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-bold uppercase tracking-wide">
                                                {tt.board}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-5 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400 shrink-0"/>
                                                <span className="font-medium">{new Date(tt.updatedAt).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-400 hidden sm:inline">
                                                    ({new Date(tt.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                
                                                <button 
                                                    onClick={() => setPreviewUrl(getFileUrl(tt.pdfUrl))}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition text-xs font-bold shadow-sm"
                                                >
                                                    <FiEye size={14}/> View
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDelete(tt._id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition text-xs font-bold shadow-sm"
                                                >
                                                    <FiTrash2 size={14}/> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* ================= FILE PREVIEW POPUP ==================== */}
      {/* ========================================================= */}
      {previewUrl && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <FiFileText className="text-blue-600" /> Timetable Preview
                      </h3>
                      <div className="flex items-center gap-4">
                          <a 
                              href={previewUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
                          title="Timetable Preview"
                          className="w-full h-full border-none"
                      ></iframe>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminTimetablePage;