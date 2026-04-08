import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiUploadCloud, FiTrash2, FiLink, FiMenu } from 'react-icons/fi';

const AdminAdsPage = () => {
  const [ads, setAds] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const token = localStorage.getItem('token');
    const res = await api.get('/ads', { headers: { 'x-auth-token': token } });
    setAds(res.data);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('link', link);

    try {
      const token = localStorage.getItem('token');
      await api.post('/ads', formData, {
        headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data' // Required for files
        }
      });
      
      // Reset Form
      setTitle('');
      setLink('');
      setFile(null);
      fetchAds(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this ad?")) return;
    try {
        const token = localStorage.getItem('token');
        await api.delete(`/ads/${id}`, { headers: { 'x-auth-token': token } });
        fetchAds();
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all">
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm">
           <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
           <h1 className="text-xl font-bold text-gray-800">Advertisement & Notices</h1>
           <div className="w-8"></div>
        </header>

        <main className="p-8">
            
            {/* 1. UPLOAD SECTION */}
            <div className="mb-10 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                <h2 className="mb-6 text-lg font-bold text-gray-800">Create New Advertisement</h2>
                <form onSubmit={handleUpload} className="grid gap-6 md:grid-cols-2 items-end">
                    
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-600">Ad Title / Message</label>
                        <input 
                            type="text" required 
                            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-blue-500"
                            placeholder="e.g., New Batch Starting June 1st!"
                            value={title} onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-600">External Link (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-blue-500"
                            placeholder="https://..."
                            value={link} onChange={e => setLink(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-gray-600">Banner Image</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="file" required accept="image/*"
                                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                onChange={e => setFile(e.target.files[0])}
                            />
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {uploading ? 'Uploading...' : <><FiUploadCloud /> Publish Ad</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* 2. ACTIVE ADS LIST */}
            <h3 className="mb-4 text-lg font-bold text-gray-800">Active Advertisements</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ads.map((ad) => (
                    <div key={ad._id} className="group relative overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100">
                        <img src={ad.imageUrl} alt={ad.title} className="h-48 w-full object-cover" />
                        <div className="p-4">
                            <h4 className="font-bold text-gray-800">{ad.title}</h4>
                            {ad.link && (
                                <a href={ad.link} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <FiLink /> {ad.link}
                                </a>
                            )}
                            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                                <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                                <button 
                                    onClick={() => handleDelete(ad._id)}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-700 font-bold bg-red-50 px-2 py-1 rounded"
                                >
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </main>
      </div>
    </div>
  );
};

export default AdminAdsPage;