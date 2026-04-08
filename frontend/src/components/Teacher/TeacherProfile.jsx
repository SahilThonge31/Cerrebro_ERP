import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { 
    FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiLayers, 
    FiCalendar, FiCamera, FiCheckCircle, FiLoader 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Fetch Profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await api.get('/faculty/profile', { headers: { 'x-auth-token': token } });
        setProfile(res.data);
    } catch (err) {
        console.error("Failed to load profile");
    } finally {
        setLoading(false);
    }
  };

  // 2. Handle Image Upload
  const handleImageClick = () => {
      fileInputRef.current.click();
  };

  const getImgSrc = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Already absolute (e.g. Google Auth)
    return `http://localhost:5000${path}`; // Append server URL for local uploads
}

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      setUploading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await api.put('/faculty/update-profile-pic', formData, {
              headers: { 
                  'x-auth-token': token,
                  'Content-Type': 'multipart/form-data'
              }
          });
          setProfile(res.data); // Update UI with new data
          toast.success("Profile photo updated!");
      } catch (err) {
          toast.error("Failed to upload photo");
      } finally {
          setUploading(false);
      }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-[60vh]">
              <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
      );
  }

  if (!profile) return <div className="text-center p-10 text-gray-400">Profile not found.</div>;

  return (
    <div className="animate-fade-in-up pb-10 max-w-5xl mx-auto">
        <Toaster position="top-right" />

        {/* --- 1. HEADER SECTION (Clean & Centered) --- */}
        <div className="flex flex-col items-center justify-center pt-10 pb-12">
            
            {/* Profile Picture Circle (Clickable) */}
            <div className="relative group cursor-pointer mb-6" onClick={handleImageClick}>
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white shadow-xl bg-slate-100 overflow-hidden relative">
                    {profile.profilePic ? (
                        <img src={getImgSrc(profile.profilePic)} alt={profile.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-5xl font-bold text-teal-600">
                            {profile.name?.charAt(0)}
                        </div>
                    )}
                    
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                        {uploading ? (
                            <FiLoader className="animate-spin" size={24} />
                        ) : (
                            <>
                                <FiCamera size={24} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                            </>
                        )}
                    </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-white h-6 w-6 rounded-full" title="Active"></div>
            </div>

            {/* Hidden Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />

            {/* Name & Role */}
            <h1 className="text-3xl font-extrabold text-slate-800 text-center">{profile.name}</h1>
            <div className="flex items-center gap-2 mt-2">
                <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-100 flex items-center gap-1">
                    <FiCheckCircle size={12}/> Faculty Member
                </span>
            </div>
        </div>

        {/* --- 2. DETAILS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4">
            
            {/* CARD: CONTACT INFO */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FiUser size={20}/></span> 
                    Contact Details
                </h3>
                
                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 text-slate-300"><FiMail size={18}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                            <p className="text-slate-700 font-medium text-sm md:text-base">{profile.email}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 text-slate-300"><FiPhone size={18}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                            <p className="text-slate-700 font-medium text-sm md:text-base">{profile.mobile || "Not Provided"}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="mt-1 text-slate-300"><FiMapPin size={18}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Address</p>
                            <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed">{profile.address || "Not Provided"}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="mt-1 text-slate-300"><FiCalendar size={18}/></div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date Joined</p>
                            <p className="text-slate-700 font-medium text-sm md:text-base">
                                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD: ACADEMIC INFO */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
                <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                    <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FiLayers size={20}/></span>
                    Academic Profile
                </h3>
                
                <div className="space-y-8">
                    {/* Subjects */}
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FiBook /> Specialization (Subjects)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {profile.subjects && profile.subjects.length > 0 ? (
                                profile.subjects.map((sub, i) => (
                                    <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold border border-slate-200">
                                        {typeof sub === 'string' ? sub : sub.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 italic text-sm">No subjects assigned.</span>
                            )}
                        </div>
                    </div>

                    {/* Classes */}
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                            <FiCheckCircle /> Assigned Classes
                        </p>
                        <div className="space-y-3">
                            {profile.classes && profile.classes.length > 0 ? (
                                profile.classes.map((cls, i) => {
                                    const standard = typeof cls === 'string' ? cls : cls.standard;
                                    const board = typeof cls === 'object' ? cls.board : 'General';
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-white text-slate-600 flex items-center justify-center font-bold text-xs shadow-sm border border-slate-100">
                                                    {standard}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">Class {standard}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-white px-2 py-1 rounded border border-slate-100">{board}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-slate-400 italic text-sm">No classes assigned yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TeacherProfile;