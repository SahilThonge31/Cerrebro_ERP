import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FiImage, FiVideo, FiX } from 'react-icons/fi';

const GalleryViewer = () => {
    const [albums, setAlbums] = useState([]);
    const [viewingAlbum, setViewingAlbum] = useState(null);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/gallery', { headers: { 'x-auth-token': token } });
                setAlbums(res.data);
            } catch (err) {
                console.log("Gallery Error", err);
            }
        };
        fetchAlbums();
    }, []);

    // 🔴 THE FIX IS HERE 🔴
    const getFileUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        
        // 1. Fix Windows Backslashes
        const cleanPath = path.replace(/\\/g, '/');
        
        // 2. Prepend Domain
        return `http://localhost:5000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiImage className="text-pink-600"/> School Gallery
            </h2>
            
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map(album => (
                    <div key={album._id} onClick={() => setViewingAlbum(album)} 
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition group">
                        <div className="h-48 overflow-hidden">
                            {/* Usage of getFileUrl */}
                            <img src={getFileUrl(album.coverImage)} 
                                 className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                                 alt={album.title} />
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800">{album.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{new Date(album.eventDate).toDateString()}</p>
                            <p className="text-xs font-bold text-blue-600 mt-3">{album.media.length} Photos/Videos</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {viewingAlbum && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl p-4 overflow-y-auto">
                    <button onClick={() => setViewingAlbum(null)} className="fixed top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 z-50">
                        <FiX size={24} />
                    </button>
                    
                    <div className="max-w-6xl mx-auto pt-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">{viewingAlbum.title}</h2>
                            <p className="text-gray-400">{viewingAlbum.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                            {viewingAlbum.media.map((item, idx) => (
                                <div key={idx} className="rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                                    {item.type === 'video' ? (
                                        <video controls className="w-full h-64 object-cover">
                                            <source src={getFileUrl(item.url)} type="video/mp4" />
                                        </video>
                                    ) : (
                                        // Usage of getFileUrl
                                        <img src={getFileUrl(item.url)} className="w-full h-64 object-cover" loading="lazy" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryViewer;