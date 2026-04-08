import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiImage, FiPlus, FiTrash2, FiVideo, FiMenu, FiX, FiUpload, FiEye } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const AdminGalleryPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAlbum, setViewingAlbum] = useState(null); // This opens the "Manager"
  
  // Forms
  const [newAlbum, setNewAlbum] = useState({ title: '', description: '', date: '', cover: null });
  const [mediaFiles, setMediaFiles] = useState(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/gallery', { headers: { 'x-auth-token': token } });
      setAlbums(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // Helper for URLs
  const getFileUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      const cleanPath = path.replace(/\\/g, '/');
      return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  // --- ACTIONS ---

  const handleCreateAlbum = async (e) => {
      e.preventDefault();
      if(!newAlbum.cover) return toast.error("Please select a cover image");
      const formData = new FormData();
      formData.append('title', newAlbum.title);
      formData.append('description', newAlbum.description);
      formData.append('eventDate', newAlbum.date);
      formData.append('cover', newAlbum.cover);
      try {
          const token = localStorage.getItem('token');
          await api.post('/gallery/create', formData, {
              headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
          });
          toast.success("Album Created!");
          setShowCreateModal(false);
          fetchAlbums();
      } catch (err) { toast.error("Failed to create album"); }
  };

  const handleAddMedia = async () => {
      if(!mediaFiles) return toast.error("Select files first");
      const formData = new FormData();
      for (let i = 0; i < mediaFiles.length; i++) {
          formData.append('media', mediaFiles[i]);
      }
      try {
          const token = localStorage.getItem('token');
          const res = await api.post(`/gallery/${viewingAlbum._id}/add`, formData, {
              headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
          });
          toast.success("Photos Added!");
          setMediaFiles(null);
          setViewingAlbum(res.data); // Update the view with new photos
          fetchAlbums(); // Update background list
      } catch (err) { toast.error("Upload failed"); }
  };

  const deleteAlbum = async (id, e) => {
      e.stopPropagation(); // Prevent opening the album
      if(!window.confirm("Delete this ENTIRE album?")) return;
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/gallery/${id}`, { headers: { 'x-auth-token': token } });
          setAlbums(albums.filter(a => a._id !== id));
          toast.success("Album Deleted");
      } catch (err) { toast.error("Delete failed"); }
  };

  const deleteSinglePhoto = async (mediaId) => {
      if(!window.confirm("Delete this photo?")) return;
      try {
          const token = localStorage.getItem('token');
          const res = await api.delete(`/gallery/${viewingAlbum._id}/media/${mediaId}`, { 
              headers: { 'x-auth-token': token } 
          });
          setViewingAlbum(res.data); // Update modal view
          fetchAlbums(); // Update main list
          toast.success("Photo Removed");
      } catch (err) { toast.error("Failed to delete photo"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-center" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all relative">
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
           <div className="flex items-center gap-4">
               <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
               <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiImage className="text-pink-600" /> Gallery Manager
               </h1>
           </div>
           <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 shadow-md">
               <FiPlus /> New Album
           </button>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto">
            {loading ? <p>Loading Gallery...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map(album => (
                        <div key={album._id} onClick={() => setViewingAlbum(album)} 
                             className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg transition">
                            
                            {/* Cover Image */}
                            <div className="h-48 overflow-hidden relative">
                                <img src={getFileUrl(album.coverImage)} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button onClick={(e) => deleteAlbum(album._id, e)} className="p-2 bg-white/90 text-red-600 rounded-full shadow hover:bg-red-50">
                                        <FiTrash2 />
                                    </button>
                                </div>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"/>
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                                    <FiImage /> {album.media.length}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-800">{album.title}</h3>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-1">{album.description}</p>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {new Date(album.eventDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>

        {/* --- MODAL 1: CREATE ALBUM --- */}
        {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <h3 className="font-bold text-xl mb-6">Create New Album</h3>
                    <form onSubmit={handleCreateAlbum} className="space-y-4">
                        <input type="text" placeholder="Event Title" className="w-full border p-3 rounded-xl outline-none" required
                            value={newAlbum.title} onChange={e => setNewAlbum({...newAlbum, title: e.target.value})} />
                        <textarea placeholder="Description" rows="2" className="w-full border p-3 rounded-xl outline-none"
                            value={newAlbum.description} onChange={e => setNewAlbum({...newAlbum, description: e.target.value})} />
                        <input type="date" className="w-full border p-3 rounded-xl outline-none" required
                            value={newAlbum.date} onChange={e => setNewAlbum({...newAlbum, date: e.target.value})} />
                        <input type="file" accept="image/*" className="w-full border p-2 rounded-xl" required
                            onChange={e => setNewAlbum({...newAlbum, cover: e.target.files[0]})} />
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- MODAL 2: MANAGE ALBUM (VIEW & DELETE PHOTOS) --- */}
        {viewingAlbum && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{viewingAlbum.title}</h2>
                            <p className="text-gray-500 text-sm">{viewingAlbum.media.length} Items</p>
                        </div>
                        <button onClick={() => setViewingAlbum(null)} className="p-2 hover:bg-gray-200 rounded-full"><FiX size={24}/></button>
                    </div>

                    {/* Scrollable Grid */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {viewingAlbum.media.map((item) => (
                                <div key={item._id} className="relative group rounded-xl overflow-hidden shadow-sm bg-white border h-40">
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full bg-black flex items-center justify-center text-white"><FiVideo/></div>
                                    ) : (
                                        <img src={getFileUrl(item.url)} className="w-full h-full object-cover" />
                                    )}
                                    
                                    {/* DELETE OVERLAY */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                        <a href={getFileUrl(item.url)} target="_blank" rel="noreferrer" className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40"><FiEye/></a>
                                        <button onClick={() => deleteSinglePhoto(item._id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><FiTrash2/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer: Upload More */}
                    <div className="p-6 border-t bg-white">
                        <h4 className="font-bold text-sm text-gray-600 mb-3">Add More Photos</h4>
                        <div className="flex gap-4">
                            <input type="file" multiple accept="image/*" className="flex-1 border p-2 rounded-xl"
                                onChange={e => setMediaFiles(e.target.files)} />
                            <button onClick={handleAddMedia} disabled={!mediaFiles} 
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-300">
                                <FiUpload className="inline mr-2"/> Upload
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminGalleryPage;