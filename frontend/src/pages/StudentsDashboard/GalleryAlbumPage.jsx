import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { FiArrowLeft, FiX, FiMaximize } from 'react-icons/fi';

const GalleryAlbumPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null); // For Lightbox

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/gallery/${id}`, { headers: { 'x-auth-token': token } });
        setAlbum(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchAlbum();
  }, [id]);

  // 🟢 HELPER FUNCTION TO FIX IMAGE PATHS 🟢
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  if (loading) return <div className="p-10 text-center">Loading Photos...</div>;
  if (!album) return <div className="p-10 text-center">Album not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 pb-20 animate-fade-in">
      
      {/* Dark Header */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md px-6 py-4 border-b border-gray-800 flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-300 hover:text-white transition">
            <FiArrowLeft size={20} /> Back to Gallery
         </button>
         <div className="text-center">
             <h1 className="text-xl font-bold text-white">{album.title}</h1>
             <p className="text-xs text-gray-400">{new Date(album.eventDate).toLocaleDateString()}</p>
         </div>
         <div className="w-20"></div> {/* Spacer for center alignment */}
      </div>

      {/* Masonry-ish Grid */}
      <div className="mx-auto max-w-7xl px-4 mt-8">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {album.media.map((item, index) => (
                <div 
                    key={index} 
                    className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl bg-gray-800"
                    onClick={() => setSelectedImg(item.url)}
                >
                    {/* Image with getFileUrl */}
                    <img 
                        src={getFileUrl(item.url)} 
                        alt="Event" 
                        className="w-full rounded-xl transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <FiMaximize className="text-white drop-shadow-lg" size={32} />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* LIGHTBOX (Full Screen Viewer) */}
      {selectedImg && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in"
            onClick={() => setSelectedImg(null)}
        >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 rounded-full">
                <FiX size={32} />
            </button>
            {/* Image with getFileUrl */}
            <img 
                src={getFileUrl(selectedImg)} 
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl" 
                alt="Full screen"
            />
        </div>
      )}
    </div>
  );
};

export default GalleryAlbumPage;