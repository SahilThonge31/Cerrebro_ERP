import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FiFileText, FiVideo, FiBook, FiPlayCircle, FiEye, FiX, FiAlertTriangle } from 'react-icons/fi';
import api from '../../api';

const SubjectDetailPage = () => {
  const { subjectName } = useParams(); 
  const decodedSubject = decodeURIComponent(subjectName);
  
  // REMOVED Audio Notes from state
  const [materials, setMaterials] = useState({ 'Textbooks': [], 'Notes': [], 'Video Lecture': [] });
  const [activeTab, setActiveTab] = useState('Notes'); 
  const [loading, setLoading] = useState(true);

  // --- SECURE VIEWER STATE ---
  const [viewingPdf, setViewingPdf] = useState(null); // Stores URL of PDF to view

  useEffect(() => {
    // 1. Fetch Data
    const fetchMaterials = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data: user } = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
        
        const standard = user.standard || '10th';
        const board = user.board || 'SSC';

        const res = await api.get(`/academic/materials?board=${board}&className=${standard}&subject=${decodedSubject}`, 
            { headers: { 'x-auth-token': token } }
        );

        const organized = { 'Textbooks': [], 'Notes': [], 'Video Lecture': [] };

        // --- 🚨 THE FILTER FIX 🚨 ---
        // Now accurately checks for the exact type saved by the backend
        res.data.forEach(item => {
            if (item.type === 'Video Lecture' || item.type === 'Video') {
                organized['Video Lecture'].push(item);
            } else if (item.type === 'Textbook' || item.category === 'Textbooks') {
                organized['Textbooks'].push(item);
            } else {
                organized['Notes'].push(item); // Catches 'Notes'
            }
        });

        setMaterials(organized);
      } catch (error) {
        console.error("Error fetching materials", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();

    // 2. SECURITY: Disable Right Click globally on this page
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    // 3. SECURITY: Try to block Print Screen Key (Partial Protection)
    const handleKeyUp = (e) => {
        if (e.key === 'PrintScreen') {
            alert("Screenshots are disabled for privacy reasons.");
        }
    };
    document.addEventListener('keyup', handleKeyUp);

    return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keyup', handleKeyUp);
    };
  }, [decodedSubject]);

  // REMOVED Audio Notes from tabs array
  const tabs = ['Textbooks', 'Notes', 'Video Lecture'];

  const getEmbedUrl = (url) => {
      if (!url) return '';
      let videoId = url.split('v=')[1];
      if (!videoId && url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
      const ampersandPosition = videoId ? videoId.indexOf('&') : -1;
      if (ampersandPosition !== -1) videoId = videoId.substring(0, ampersandPosition);
      return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 select-none print:hidden"> 
      {/* 'select-none' disables text highlighting. 'print:hidden' hides content if they try Ctrl+P */}
      
      <div className="mx-auto max-w-6xl px-4 pt-8">
        
        <div className="animate-fade-in-up space-y-6">
          <h1 className="text-4xl font-bold text-secondary">{decodedSubject}</h1>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap border-b-2 py-4 px-1 text-md font-medium transition-colors
                    ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`
                  }
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {loading ? (
                <div className="py-10 text-center text-gray-500">Loading content...</div>
            ) : (materials[activeTab] || []).length > 0 ? (
                
                activeTab === 'Video Lecture' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {materials[activeTab].map((item) => (
                            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
                                    <iframe 
                                        src={getEmbedUrl(item.fileUrl)} 
                                        title={item.title}
                                        className="w-full h-64 border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                        <FiPlayCircle className="text-red-500"/> {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (
                    // --- NOTES & TEXTBOOKS LIST ---
                    <ul className="space-y-4">
                        {materials[activeTab].map((item) => (
                            <li key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-gray-100 transition hover:shadow-md gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        {/* Icon changes based on active tab */}
                                        {activeTab === 'Textbooks' ? <FiBook size={24} className="text-blue-500"/> : <FiFileText size={24} className="text-primary"/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.description || "Study Material"}</p>
                                    </div>
                                </div>
                                
                                {/* --- VIEW BUTTON --- */}
                                <button 
                                    onClick={() => setViewingPdf(item.fileUrl)}
                                    className="group flex items-center justify-center gap-2 rounded-xl bg-purple-50 px-6 py-2 shadow-sm border border-purple-100 transition-all text-purple-700 font-semibold hover:bg-purple-100"
                                >
                                    <FiEye /> View Now
                                </button>
                            </li>
                        ))}
                    </ul>
                )

            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    <FiFileText size={48} className="mb-2 opacity-20" />
                    <p>No {activeTab} available yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SECURE PDF VIEWER MODAL --- */}
      {viewingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in print:hidden">
            <div className="relative w-full h-full max-w-5xl bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl">
                
                {/* Header with Security Warning */}
                <div className="flex justify-between items-center bg-gray-900 text-white px-4 py-3 select-none">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                        <FiAlertTriangle /> Protected Content. Do not distribute.
                    </div>
                    <button 
                        onClick={() => setViewingPdf(null)}
                        className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition"
                    >
                        <FiX size={20}/>
                    </button>
                </div>

                {/* PDF IFRAME (Toolbar Hidden) */}
                <div className="flex-1 bg-gray-200 relative">
                    {/* Transparent Overlay to block Right Click on Iframe (Partial fix) */}
                    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none" />
                    
                    <iframe 
                        // Adding #toolbar=0&navpanes=0 hides the standard PDF controls
                        src={`${viewingPdf}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full"
                        title="Secure Viewer"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default SubjectDetailPage;