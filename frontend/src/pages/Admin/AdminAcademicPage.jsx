import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiBook, FiMenu, FiPlus, FiTrash2, FiX, FiUser, FiClock, FiLayers } from 'react-icons/fi';

const AdminAcademicPage = () => {
  const navigate = useNavigate();
  const [academics, setAcademics] = useState([]);
  const [teachers, setTeachers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // FILTER STATE
  const [activeBoard, setActiveBoard] = useState('SSC'); // Default Board

  // Input States
  const [newSubject, setNewSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [activeClassId, setActiveClassId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeBoard]); // Refetch when board changes

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Pass board as query param
      const resAcademic = await api.get(`/academic?board=${activeBoard}`, { headers: { 'x-auth-token': token } });
      setAcademics(resAcademic.data);

      const resTeachers = await api.get('/admin/teachers', { headers: { 'x-auth-token': token } });
      setTeachers(resTeachers.data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (className) => {
    if (!newSubject.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await api.post('/academic/add', { 
        className, 
        board: activeBoard, // Send Active Board
        subjectName: newSubject, 
        teacherName: selectedTeacher || "Not Assigned"
      }, { headers: { 'x-auth-token': token } });
      
      setNewSubject('');
      setSelectedTeacher('');
      setActiveClassId(null);
      fetchData(); 
    } catch (error) {
      alert("Failed to add subject");
    }
  };

  const handleRemoveSubject = async (className, subjectName) => {
    if(!window.confirm(`Remove ${subjectName}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await api.post('/academic/remove', { className, board: activeBoard, subjectName }, { headers: { 'x-auth-token': token } });
      fetchData(); 
    } catch (error) {
      alert("Failed to delete subject");
    }
  };

  // Navigate to Deep Dive Page
  const openSubjectView = (className, subjectName) => {
      // Encode URL to handle spaces (e.g. "Maths 1")
      navigate(`/admin/academic/view/${activeBoard}/${className}/${encodeURIComponent(subjectName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all relative">
        
{/* HEADER */}
<header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
    <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiBook className="text-purple-600"/> Academic Structure
        </h1>
    </div>

    {/* BOARD SWITCHER & DEBUG BUTTON */}
    <div className="flex items-center gap-4">

        <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveBoard('SSC')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeBoard === 'SSC' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                SSC
            </button>
            <button 
                onClick={() => setActiveBoard('CBSE')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeBoard === 'CBSE' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                CBSE
            </button>
        </div>
    </div>
</header>

        <main className="p-6 md:p-8">
            <p className="text-gray-500 mb-6">Managing curriculum for <span className="font-bold text-gray-800">{activeBoard}</span>. Click a subject to view uploaded content.</p>

            {loading ? <div className="text-center py-10">Loading...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {academics.map((academic) => (
                      <div key={academic._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col">
                          
                          {/* Card Header */}
                          <div className="bg-purple-50 p-4 border-b border-purple-100 flex justify-between items-center">
                              <div>
                                  <h3 className="text-lg font-bold text-purple-800">{academic.className} Standard</h3>
                                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{activeBoard}</p>
                              </div>
                              <span className="text-xs bg-white px-2 py-1 rounded text-purple-400 font-bold border border-purple-100">
                                {academic.subjects.length} Subjects
                              </span>
                          </div>

                          {/* Subject List */}
                          <div className="p-4 flex-1">
                              <div className="flex flex-col gap-2">
                                  {academic.subjects.map((sub, i) => (
                                      <div 
                                        key={i} 
                                        className="group flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm hover:border-purple-200 transition cursor-pointer"
                                        onClick={() => openSubjectView(academic.className, sub.name)}
                                      >
                                          <div>
                                              <p className="font-bold text-gray-800 text-sm">{sub.name}</p>
                                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                  <FiUser size={10} /> 
                                                  {sub.teacherName}
                                              </div>
                                          </div>
                                          
                                          {/* Delete Button (Stops click propagation so it doesn't open the page) */}
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleRemoveSubject(academic.className, sub.name); }}
                                            className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                                          >
                                              <FiTrash2 size={14} />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Add New Section */}
                          <div className="p-4 border-t border-gray-100 bg-white">
                              {activeClassId === academic._id ? (
                                  <div className="flex flex-col gap-2 animate-fade-in-down">
                                      <input 
                                        autoFocus
                                        className="w-full text-sm border border-purple-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200"
                                        placeholder="Subject Name"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                      />
                                      <select 
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none bg-white"
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                      >
                                          <option value="">Select Teacher</option>
                                          {teachers.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                                      </select>
                                      <div className="flex gap-2 mt-1">
                                          <button onClick={() => handleAddSubject(academic.className)} className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-purple-700">Add</button>
                                          <button onClick={() => { setActiveClassId(null); setNewSubject(''); }} className="px-3 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"><FiX /></button>
                                      </div>
                                  </div>
                              ) : (
                                  <button onClick={() => setActiveClassId(academic._id)} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition flex items-center justify-center gap-2">
                                      <FiPlus /> Add Subject
                                  </button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default AdminAcademicPage;