import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiArrowLeft, FiFileText, FiVideo, FiTrash2, FiClock, FiUser, FiMenu, FiPlus, FiLink, FiX, FiUploadCloud, FiBook } from 'react-icons/fi';

const AdminSubjectView = () => {
  const { board, className, subject } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [category, setCategory] = useState('Notes'); // Default category
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const subjectName = decodeURIComponent(subject);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/academic/materials?board=${board}&className=${className}&subject=${subjectName}`, 
        { headers: { 'x-auth-token': token } }
      );
      setMaterials(res.data);
    } catch (error) {
      console.error("Failed to load materials", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('board', board);
      formData.append('className', className);
      formData.append('subject', subjectName);

      // --- LOGIC: Handle File vs Link based on Category ---
      if (category === 'Video Lecture') {
          if (!linkUrl) return alert("Please enter a Video URL");
          formData.append('linkUrl', linkUrl);
          formData.append('type', 'Video Lecture'); // Tag explicitly as Video Lecture
      } else {
          // Handle Files (Textbooks or Notes)
          if (!selectedFile) return alert("Please select a PDF file");
          formData.append('file', selectedFile);
          formData.append('type', category); // 👈 THIS SENDS EITHER 'Notes' OR 'Textbook'
      }

      try {
          const token = localStorage.getItem('token');
          await api.post('/academic/materials/add', formData, { 
              headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } 
          });

          // Reset & Refresh
          setTitle(''); setDescription(''); setLinkUrl(''); setSelectedFile(null); setCategory('Notes');
          setIsModalOpen(false);
          fetchMaterials();
          alert("Content Uploaded Successfully! 🚀");
      } catch (err) {
          console.error(err);
          alert("Failed to upload content");
      }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this content permanently?")) return;
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/academic/materials/${id}`, { headers: { 'x-auth-token': token } });
          setMaterials(materials.filter(m => m._id !== id));
      } catch (err) {
          alert("Delete Failed");
      }
  };

  // Helper to show correct icon in list
  const getIcon = (type) => {
      if(type === 'Video Lecture') return <FiVideo className="text-red-500" size={24} />;
      if(type === 'Textbook') return <FiBook className="text-blue-500" size={24} />;
      if(type === 'Link') return <FiLink className="text-blue-500" size={24} />;
      return <FiFileText className="text-gray-500" size={24} />; // Default for Notes
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all relative">
        
        {/* HEADER */}
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
           <div className="flex items-center gap-4">
               <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
               <button onClick={() => navigate('/admin/academic')} className="p-2 hover:bg-gray-100 rounded-full transition">
                   <FiArrowLeft size={20} />
               </button>
               <div>
                   <h1 className="text-xl font-bold text-gray-800">{subjectName}</h1>
                   <p className="text-xs text-gray-500">{className} Standard • {board} Board</p>
               </div>
           </div>
           
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 transition active:scale-95"
           >
               <FiPlus /> Add Material
           </button>
        </header>

        <main className="p-6 md:p-8">
            {loading ? <div className="text-center py-10">Loading Content...</div> : (
               materials.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                       <FiUploadCloud size={48} className="text-gray-300 mb-4" />
                       <h3 className="text-lg font-bold text-gray-500">No Content Uploaded</h3>
                       <p className="text-sm text-gray-400 mb-6">Upload notes, textbooks, or video links.</p>
                       <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Upload Now</button>
                   </div>
               ) : (
                   <div className="grid gap-4">
                       {materials.map((item) => (
                           <div key={item._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition">
                               
                               <div className="flex items-start gap-4">
                                   <div className={`p-3 rounded-lg bg-gray-50`}>
                                       {getIcon(item.type)}
                                   </div>
                                   <div>
                                       <h3 className="font-bold text-gray-800">{item.title}</h3>
                                       <p className="text-sm text-gray-500">{item.description || "No description provided."}</p>
                                       
                                       <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><FiUser size={12}/> {item.uploadedBy}</span>
                                            <span className="flex items-center gap-1"><FiClock size={12}/> {new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-semibold text-[10px] uppercase">{item.type}</span>
                                       </div>
                                   </div>
                               </div>

                               <div className="flex items-center gap-3">
                                   <a 
                                     href={item.fileUrl} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                                   >
                                       View
                                   </a>
                                   
                                   <button 
                                     onClick={() => handleDelete(item._id)}
                                     className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                     title="Delete Content"
                                   >
                                       <FiTrash2 size={20} />
                                   </button>
                               </div>

                           </div>
                       ))}
                   </div>
               )
            )}
        </main>

        {/* --- UPLOAD MODAL --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">Add Study Material</h3>
                        <button onClick={() => setIsModalOpen(false)}><FiX size={20} className="text-gray-400 hover:text-red-500"/></button>
                    </div>
                    
                    <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
                        
                        {/* 1. Category Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Select Category</label>
                            <select 
                                className="w-full border p-2 rounded-lg outline-none bg-white focus:border-purple-400 font-medium"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Notes">Notes (PDF)</option>
                                <option value="Textbook">Textbook (PDF)</option>
                                <option value="Video Lecture">Video Lecture (Link)</option>
                            </select>
                        </div>

                        {/* 2. Title */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                            <input 
                                required
                                className="w-full border p-2 rounded-lg outline-none focus:border-purple-400" 
                                placeholder="e.g. Chapter 1 Explanation"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        {/* 3. Dynamic Input (File vs Link) */}
                        {category === 'Video Lecture' ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Video Link (YouTube/Drive)</label>
                                <input 
                                    type="url"
                                    required
                                    className="w-full border p-2 rounded-lg outline-none focus:border-purple-400" 
                                    placeholder="https://youtube.com/..."
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">
                                    Upload {category} PDF
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer relative transition">
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        required
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                    />
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <FiUploadCloud size={32}/>
                                        <span className="text-xs font-bold">
                                            {selectedFile ? selectedFile.name : `Click to upload ${category} (PDF)`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Description (Optional)</label>
                            <textarea 
                                className="w-full border p-2 rounded-lg outline-none focus:border-purple-400 h-20 resize-none" 
                                placeholder="Brief details..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                            Upload {category}
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminSubjectView;