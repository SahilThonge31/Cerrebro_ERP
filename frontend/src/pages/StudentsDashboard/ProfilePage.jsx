import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiAward, FiBook, FiCreditCard, FiActivity, FiLayers 
} from 'react-icons/fi';

// NOTE: We keep this for backwards compatibility just in case 
// any old students still have local images in the database!
const API_BASE_URL = "http://localhost:5000"; 

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
      setUser(res.data);
    } catch (error) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. MUST use FormData to send files to Multer/Cloudinary
    const formData = new FormData();
    formData.append('profilePic', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 👇 FIX: Updated endpoint to match your new backend route ('/student/upload-profile')
      const res = await api.post('/student/upload-profile', formData, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      // The backend now returns the full secure Cloudinary URL!
      setUser(prev => ({ ...prev, profilePic: res.data.profilePic }));
      alert("Profile Picture Updated Successfully! 📸");
    } catch (error) {
      console.error(error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // This function is perfect. If it sees a Cloudinary URL (starts with http), 
  // it uses it. If it sees an old local path, it adds localhost:5000!
  const getProfileSrc = (path) => {
    if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
    </div>
  );

  return (
    // PAGE BACKGROUND: Deep Gradient to make Glass Cards pop
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200 pb-20 font-sans p-4 md:p-8 animate-fade-in-up">
      
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- 1. GLASS HEADER CARD (No Banner) --- */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-10 shadow-xl shadow-teal-900/5 flex flex-col md:flex-row items-center gap-8">
            
            {/* Profile Picture Section */}
            <div className="relative group shrink-0">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-[6px] border-white bg-slate-100 shadow-2xl overflow-hidden relative ring-1 ring-black/5">
                    <img 
                        src={getProfileSrc(user.profilePic)} 
                        alt="Profile" 
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${uploading ? 'opacity-50 blur-sm' : ''}`}
                        onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    />
                    
                    {/* Upload Overlay */}
                    <label className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                         <FiCamera className="text-white text-2xl mb-1" />
                         <span className="text-white text-[9px] font-bold uppercase tracking-widest">Edit</span>
                         {/* Notice: accept="image/*" naturally prevents PDFs from being selected here */}
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                    
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                </div>
                <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-sm" title="Active"></div>
            </div>

            {/* Name & Identity Section */}
            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">{user.name}</h1>
                <p className="text-slate-500 font-medium mb-4">{user.email}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-wider">
                    <Badge icon={FiUser} text={user.role} color="blue" />
                    <Badge icon={FiAward} text={`${user.board || 'No'} Board`} color="amber" />
                    <Badge icon={FiActivity} text="Active Student" color="emerald" />
                </div>
            </div>
        </div>

        {/* --- 2. CONTENT GRID --- */}
        <div className="grid gap-6 lg:grid-cols-12">

            {/* LEFT: Personal Info (Col-Span 4) */}
            <div className="lg:col-span-4 h-full">
                <div className="bg-white/90 backdrop-blur-lg border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/50 h-full">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <FiUser className="text-teal-500"/> Personal Details
                        </h3>
                    </div>
                    
                    <div className="space-y-6">
                        <InfoField label="Phone Number" value={user.contact} icon={<FiPhone />} />
                        <InfoField label="Parent Name" value={user.parentName} icon={<FiUser />} />
                        <InfoField label="Parent Phone" value={user.parentPhone} icon={<FiPhone />} />
                        <InfoField label="Home Address" value={user.address} icon={<FiMapPin />} />
                        <InfoField label="Date of Admission" value={new Date(user.createdAt).toLocaleDateString()} icon={<FiActivity />} />
                    </div>
                </div>
            </div>

            {/* RIGHT: Academic & Fees (Col-Span 8) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Academic Card */}
                <div className="bg-white/90 backdrop-blur-lg border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                            <FiBook size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Academic Profile</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Current Session</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                          <LargeInfoField label="Standard" value={`${user.standard}th Grade`} />
                          <LargeInfoField label="Roll Number" value={user.rollNumber || user.rollNum || "Not Assigned"} />
                          <LargeInfoField label="Board" value={user.board} highlight />
                          <LargeInfoField label="Batch Year" value={new Date().getFullYear()} />
                    </div>
                </div>

                {/* Fees Status Card */}
<div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl shadow-xl text-white p-5 sm:p-6 md:p-8 relative overflow-hidden">
    
    {/* Background Icon (Scaled down slightly on mobile) */}
    <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 p-6 sm:p-8 opacity-5">
        <FiCreditCard className="w-24 h-24 sm:w-32 sm:h-32 md:w-[150px] md:h-[150px]" />
    </div>
    
    {/* Main Flex Container */}
    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        
        {/* LEFT SIDE: Titles and Rows */}
        <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 text-teal-400 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                <FiLayers /> Fee Structure
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Tuition Summary</h2>
            
            <div className="mt-5 sm:mt-6 flex flex-col gap-2.5 sm:gap-2">
                 <FeeRow label="Total Fees" value={user.totalFees || 0} />
                 <FeeRow label="Paid Amount" value={user.paidFees || 0} color="text-emerald-400" icon="+" />
            </div>
        </div>
        
        {/* RIGHT SIDE: Due Balance Card */}
        {/* Smart Layout: Row on Mobile, Column on Desktop */}
        <div className="w-full sm:w-auto bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner flex flex-row sm:flex-col justify-between items-center sm:items-end min-w-[140px]">
             <p className="text-[10px] font-bold text-slate-300 uppercase sm:mb-1 tracking-wider">Due Balance</p>
             <p className="text-2xl sm:text-3xl font-bold text-red-400">
                ₹{(user.totalFees || 0) - (user.paidFees || 0)}
             </p>
        </div>
        
    </div>
</div>

            </div>
        </div>
      </div>
    </div>
  );
};

// --- ✨ Polished Components for High Contrast & Professional Look ---

const Badge = ({ icon: Icon, text, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${colors[color] || colors.blue}`}>
            <Icon size={12}/> {text?.toUpperCase()}
        </span>
    );
};

const InfoField = ({ label, value, icon }) => (
    <div className="flex items-start gap-4">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <div className="flex-1 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-slate-800 font-semibold text-sm break-words">{value || "—"}</p>
        </div>
    </div>
);

const LargeInfoField = ({ label, value, highlight }) => (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-lg font-bold ${highlight ? 'text-teal-600' : 'text-slate-800'}`}>{value}</p>
    </div>
);

const FeeRow = ({ label, value, color = "text-white", icon = "" }) => (
    <div className="flex items-center gap-3 text-sm">
        <span className="w-24 text-slate-400 font-medium">{label}:</span>
        <span className={`font-bold ${color}`}>{icon} ₹{value}</span>
    </div>
);

export default ProfilePage;