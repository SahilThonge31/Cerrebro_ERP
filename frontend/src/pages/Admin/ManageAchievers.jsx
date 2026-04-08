import React, { useState, useEffect } from 'react';
// Added FiMenu and FiTrash2 to icons
import { FiSearch, FiUserPlus, FiAward, FiCheck, FiX, FiUploadCloud, FiMenu, FiTrash2 } from 'react-icons/fi';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { toast, Toaster } from 'react-hot-toast'; // Added toast for better feedback

const ManageAchievers = () => {
  const [entryMode, setEntryMode] = useState('existing'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [achieversList, setAchieversList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // NEW: State for Mobile Sidebar Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    photoUrl: '', 
    percentage: '',
    examName: '',
    year: new Date().getFullYear().toString()
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchAchievers = async () => {
    try {
      const res = await api.get('/admin/achievers'); 
      setAchieversList(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAchievers(); }, []);

// Change this line in ManageAchievers.jsx
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this achiever?")) return;
  
  try {
    // 1. Get the token from storage
    const token = localStorage.getItem('token'); 

    // 2. Pass the token in the headers object (the 2nd argument for axios.delete)
    await api.delete(`/public/achievers/${id}`, {
      headers: { 'x-auth-token': token }
    });

    toast.success("Achiever removed!");
    fetchAchievers(); 
  } catch (err) {
    console.error(err);
    toast.error("Unauthorized: Please login again.");
  }
};

  // Search Logic
  useEffect(() => {
    if (entryMode !== 'existing' || searchQuery.length < 2) {
      setSearchResults([]); return;
    }
    const searchTimer = setTimeout(async () => {
      try {
        const res = await api.get(`/admin/students/search?query=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [searchQuery, entryMode]);

  const handleSelectStudent = (student) => {
    setFormData({
      ...formData,
      name: student.name,
      photoUrl: student.profilePic || '', 
    });
    setPhotoFile(null);
    setPreviewUrl(student.profilePic || '');
    setSearchQuery('');
    setSearchResults([]); 
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('percentage', formData.percentage);
    submitData.append('examName', formData.examName);
    submitData.append('year', formData.year);
    
    if (photoFile) {
        submitData.append('photo', photoFile);
    } else {
        submitData.append('photoUrl', formData.photoUrl);
    }

    try {
      await api.post('/admin/achievers', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Achiever added successfully!');
      setFormData({ name: '', photoUrl: '', percentage: '', examName: '', year: new Date().getFullYear().toString() });
      setPhotoFile(null);
      setPreviewUrl('');
      fetchAchievers(); 
    } catch (err) {
      toast.error('Failed to add achiever.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Toaster />
      
      {/* 👈 PASSED PROPS TO SIDEBAR */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> 

      <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto overflow-y-auto md:ml-64 transition-all duration-300">
        
        {/* --- MOBILE HEADER WITH 3 LINES --- */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                {/* 👈 MOBILE MENU BUTTON */}
                <button 
                    onClick={() => setIsSidebarOpen(true)} 
                    className="md:hidden p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600"
                >
                    <FiMenu size={24} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1E293B]">Manage Achievers</h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">Add and manage top performing students.</p>
                </div>
            </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-8">
          
          {/* --- LEFT COL: ADD FORM --- */}
          <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-xl font-bold text-[#1E293B] mb-6 flex items-center gap-2">
              <FiAward className="text-[#6FCB6C]" /> Add New Achiever
            </h2>

            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => { setEntryMode('existing'); setFormData({...formData, name: '', photoUrl: ''}); setPhotoFile(null); setPreviewUrl(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${entryMode === 'existing' ? 'bg-white text-[#6FCB6C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Search Student
              </button>
              <button 
                type="button"
                onClick={() => { setEntryMode('manual'); setSearchQuery(''); setSearchResults([]); setPhotoFile(null); setPreviewUrl(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${entryMode === 'manual' ? 'bg-white text-[#6FCB6C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Manual Entry
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {entryMode === 'existing' ? (
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Search Database</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" placeholder="Type student name..." 
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6FCB6C]/50 focus:border-[#6FCB6C] outline-none transition-all"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map(student => (
                        <div key={student._id} onClick={() => handleSelectStudent(student)} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                          <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                            {student.profilePic ? <img src={student.profilePic} className="w-full h-full object-cover" /> : <FiUserPlus className="m-auto text-slate-400 mt-2"/>}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1E293B]">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Student Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6FCB6C]/50 outline-none" />
                </div>
              )}

              {entryMode === 'existing' && formData.name && (
                  <div className="flex items-center justify-between bg-[#6FCB6C]/10 border border-[#6FCB6C]/30 text-[#0F172A] px-4 py-3 rounded-xl">
                      <span className="font-bold text-sm flex items-center gap-2"><FiCheck className="text-[#6FCB6C]"/> {formData.name} selected</span>
                      <button type="button" onClick={() => {setFormData({...formData, name: '', photoUrl: ''}); setPreviewUrl('');}} className="text-red-500 hover:text-red-700"><FiX size={18}/></button>
                  </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Student Photo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden relative">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FiUploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">Click to upload photo</p>
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Score</label>
                  <input type="text" required placeholder="e.g. 98.5%" value={formData.percentage} onChange={(e) => setFormData({...formData, percentage: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6FCB6C]/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Year</label>
                  <input type="text" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6FCB6C]/50 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Exam / Board</label>
                <input type="text" required placeholder="e.g. 10th SSC Board" value={formData.examName} onChange={(e) => setFormData({...formData, examName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6FCB6C]/50 outline-none" />
              </div>

              <button type="submit" disabled={loading || !formData.name} className="w-full py-3 mt-4 bg-[#6FCB6C] text-white font-bold rounded-xl shadow-lg hover:bg-[#5bb858] transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Achiever'}
              </button>
            </form>
          </div>

          {/* --- RIGHT COL: ACHIEVERS TABLE --- */}
          <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-[#1E293B] mb-6">Current Achievers</h2>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                              <th className="py-3 px-4 font-bold">Student</th>
                              <th className="py-3 px-4 font-bold">Score</th>
                              <th className="py-3 px-4 font-bold">Exam</th>
                              <th className="py-3 px-4 font-bold">Year</th>
                              <th className="py-3 px-4 font-bold text-right">Action</th> {/* 👈 ACTION COLUMN */}
                          </tr>
                      </thead>
                      <tbody>
                          {achieversList.length === 0 ? (
                              <tr><td colSpan="5" className="text-center py-8 text-slate-500">No achievers added yet.</td></tr>
                          ) : (
                              achieversList.map(ach => (
                                  <tr key={ach._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                      <td className="py-3 px-4 flex items-center gap-3">
                                          <img src={ach.photoUrl} alt={ach.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                                          <span className="font-bold text-[#1E293B] text-sm">{ach.name}</span>
                                      </td>
                                      <td className="py-3 px-4 font-bold text-[#6FCB6C]">{ach.percentage}</td>
                                      <td className="py-3 px-4 text-sm text-slate-600">{ach.examName}</td>
                                      <td className="py-3 px-4 text-sm font-medium text-slate-500">{ach.year}</td>
                                      <td className="py-3 px-4 text-right">
                                          {/* 👈 DELETE BUTTON */}
                                          <button 
                                            onClick={() => handleDelete(ach._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                          >
                                            <FiTrash2 size={18} />
                                          </button>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageAchievers;