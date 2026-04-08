import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { FiImage, FiCalendar } from 'react-icons/fi';

const GalleryPage = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/gallery', { headers: { 'x-auth-token': token } });
        setAlbums(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchAlbums();
  }, []);

  // 🟢 HELPER FUNCTION TO FIX IMAGE PATHS 🟢
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="bg-white px-6 py-10 shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-6xl text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-heading">Event Gallery</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Relive our best moments. Explore photos and videos from school events, sports days, and functions.
            </p>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="mx-auto max-w-6xl px-4 mt-12">
        {loading ? (
             <div className="text-center">Loading Gallery...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {albums.map((album) => (
                    <div 
                        key={album._id}
                        onClick={() => navigate(`/student/gallery/${album._id}`)}
                        className="group cursor-pointer perspective-1000"
                    >
                        {/* Card Container with Stack Effect */}
                        <div className="relative h-64 w-full rounded-2xl bg-white shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-x-2 group-hover:shadow-2xl">
                            
                            {/* Image with getFileUrl */}
                            <img 
                                src={getFileUrl(album.coverImage)} 
                                alt={album.title} 
                                className="h-full w-full rounded-2xl object-cover opacity-90 transition-opacity group-hover:opacity-100"
                            />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                                <h3 className="text-xl font-bold truncate">{album.title}</h3>
                                <div className="mt-2 flex items-center justify-between text-sm opacity-80">
                                    <span className="flex items-center gap-1">
                                        <FiCalendar /> {new Date(album.eventDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                        <FiImage /> {album.media.length} Items
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;