import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  FiSettings, FiUser, FiLock, FiGlobe, FiMenu, 
  FiUploadCloud, FiDownload, FiCheckCircle, FiShield, FiDatabase, FiCamera
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const AdminSettingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  // --- DATA STATES ---
  const [profileData, setProfileData] = useState({ name: '', email: '', role: '', profilePic: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [instituteData, setInstituteData] = useState({
      instituteName: '', address: '', contact: '', currentSession: ''
  });

  // --- FETCH ALL DATA ON LOAD ---
  useEffect(() => {
    const fetchAllSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            // 1. Fetch Admin User Data
            const userRes = await api.get('/auth/user', { headers: { 'x-auth-token': token } });
            setProfileData({ 
                name: userRes.data.name, 
                email: userRes.data.email, 
                role: userRes.data.role,
                profilePic: userRes.data.profilePic || '' // Fetching the real saved URL
            });
            
            // 2. Fetch Global Institute Data from DB
            const instRes = await api.get('/settings');
            if(instRes.data) setInstituteData(instRes.data);

        } catch (err) { 
            toast.error("Failed to load settings data."); 
        } finally {
            setInitialLoad(false);
        }
    };
    fetchAllSettings();
  }, []);

  // --- HANDLERS ---

  // 1. PHOTO UPLOAD HANDLER (Merged Logic)
  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file); 

      const toastId = toast.loading("Uploading image...");
      try {
          const token = localStorage.getItem('token');
          const res = await api.post('/auth/upload-avatar', formData, { 
              headers: { 
                  'x-auth-token': token,
                  'Content-Type': 'multipart/form-data'
              } 
          });

          // Update State with new Image URL immediately
          setProfileData(prev => ({ ...prev, profilePic: res.data.profilePic }));
          
          // Optional: Update local storage if your navbar uses it
          localStorage.setItem('profilePic', res.data.profilePic);
          
          toast.success("Profile Photo Updated!", { id: toastId });
      } catch (err) {
          toast.error("Upload failed", { id: toastId });
      }
  };

  // 2. EXPORT & BACKUP HANDLER (Blob Download Logic)
  const downloadFile = async (endpoint, filename) => {
      const toastId = toast.loading("Preparing download...");
      try {
          const token = localStorage.getItem('token');
          const response = await api.get(endpoint, { 
              headers: { 'x-auth-token': token },
              responseType: 'blob' 
          });

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          toast.success("Download Started!", { id: toastId });
      } catch (err) {
          toast.error("Download Failed", { id: toastId });
      }
  };

  const handleProfileUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await api.put('/auth/update-profile', profileData, { headers: { 'x-auth-token': token } });
          localStorage.setItem('name', res.data.user.name); 
          toast.success("Profile Updated Successfully!");
      } catch (err) {
          toast.error("Profile Update Failed");
      } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
      e.preventDefault();
      if(passwordData.newPassword !== passwordData.confirmPassword) return toast.error("New passwords do not match!");
      
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          await api.put('/auth/change-password', {
              currentPassword: passwordData.currentPassword,
              newPassword: passwordData.newPassword
          }, { headers: { 'x-auth-token': token } });

          toast.success("Password Changed Securely!");
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
          toast.error(err.response?.data?.msg || "Password Change Failed");
      } finally { setLoading(false); }
  };

  const handleInstituteUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          await api.put('/settings', instituteData, { headers: { 'x-auth-token': token } });
          toast.success("Institute Configurations Saved!");
      } catch (err) {
          toast.error("Failed to update Institute Data");
      } finally { setLoading(false); }
  };

  // --- UI TABS CONFIG ---
  const tabs = [
      { id: 'Profile', icon: FiUser, label: 'My Profile', desc: 'Manage your personal account details.' },
      { id: 'Security', icon: FiLock, label: 'Security', desc: 'Update your password and secure your account.' },
      { id: 'Institute', icon: FiGlobe, label: 'Institute Data', desc: 'Global settings for reports and branding.' },
      { id: 'Data', icon: FiDatabase, label: 'Database & Export', desc: 'Manage backups and export student records.' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-800">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontWeight: 'bold' } }} />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all w-full">
        
        {/* HEADER */}
        <header className="bg-white px-8 py-6 shadow-sm sticky top-0 z-30 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-500 hover:text-blue-600 transition" onClick={() => setIsSidebarOpen(true)}>
                    <FiMenu size={26} />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <FiSettings className="text-blue-600"/> Configuration
                    </h1>
                    <p className="text-sm text-gray-500 font-medium hidden md:block mt-1">Manage system preferences and profile settings</p>
                </div>
            </div>
        </header>

        <main className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in-up">
            
            {initialLoad ? (
                <div className="flex justify-center items-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT SIDEBAR TABS */}
                    <div className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-start px-5 py-4 rounded-2xl transition-all text-left border ${
                                    activeTab === tab.id 
                                    ? 'bg-white shadow-lg shadow-blue-900/5 border-blue-100 ring-1 ring-blue-500 text-blue-700' 
                                    : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-3 font-bold text-[15px] mb-1">
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}/> 
                                    {tab.label}
                                </div>
                                <span className={`text-xs ${activeTab === tab.id ? 'text-blue-500/80' : 'text-gray-400'}`}>
                                    {tab.desc}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* RIGHT CONTENT AREA */}
                    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
                        
                        {/* 1. PROFILE SETTINGS */}
                        {activeTab === 'Profile' && (
                            <div className="p-8 md:p-10">
                                <div className="mb-8 border-b border-gray-100 pb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                                    <p className="text-gray-500 mt-1">Update your photo and personal details here.</p>
                                </div>

                                <div className="flex items-center gap-6 mb-10">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-500/20 ring-4 ring-white overflow-hidden">
                                            {profileData.profilePic ? (
                                                <img src={profileData.profilePic} alt="Profile" className="h-full w-full object-cover"/>
                                            ) : (
                                                profileData.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition">
                                            <FiCamera size={16}/>
                                        </div>
                                    </div>
                                    
                                    {/* HIDDEN FILE INPUT */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />

                                    <div>
                                        <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm flex items-center gap-2 mb-2">
                                            <FiUploadCloud/> Upload New Photo
                                        </button>
                                        <p className="text-xs text-gray-400">JPG, GIF or PNG. Max size of 2MB.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="max-w-xl">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                            <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})}
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                            <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})}
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"/>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                                        <button disabled={loading} className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 flex items-center gap-2">
                                            {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiCheckCircle size={18}/>}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 2. SECURITY SETTINGS */}
                        {activeTab === 'Security' && (
                            <div className="p-8 md:p-10">
                                <div className="mb-8 border-b border-gray-100 pb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                                    <p className="text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="max-w-xl">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                            <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"/>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                                <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                                <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                                        <button disabled={loading} className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition active:scale-95 flex items-center gap-2">
                                            {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiShield size={18}/>}
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 3. INSTITUTE SETTINGS */}
                        {activeTab === 'Institute' && (
                            <div className="p-8 md:p-10 bg-gradient-to-br from-white to-gray-50 h-full">
                                <div className="mb-8 border-b border-gray-200 pb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        Institute Profile
                                    </h2>
                                    <p className="text-gray-500 mt-1">This information is used publicly on Receipts, Reports, and Timetables.</p>
                                </div>
                                
                                <form onSubmit={handleInstituteUpdate} className="max-w-2xl">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Institute Registered Name</label>
                                            <input type="text" required value={instituteData.instituteName} onChange={e => setInstituteData({...instituteData, instituteName: e.target.value})}
                                                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"/>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Official Address</label>
                                            <textarea rows="3" required value={instituteData.address} onChange={e => setInstituteData({...instituteData, address: e.target.value})}
                                                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none leading-relaxed"></textarea>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Number</label>
                                                <input type="text" required value={instituteData.contact} onChange={e => setInstituteData({...instituteData, contact: e.target.value})}
                                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Active Academic Session</label>
                                                <select required value={instituteData.currentSession} onChange={e => setInstituteData({...instituteData, currentSession: e.target.value})}
                                                    className="w-full p-3.5 bg-white border border-gray-300 rounded-xl font-bold text-purple-700 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none cursor-pointer">
                                                    <option value="2024-2025">2024 - 2025</option>
                                                    <option value="2025-2026">2025 - 2026</option>
                                                    <option value="2026-2027">2026 - 2027</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
                                        <button disabled={loading} className="px-8 py-3.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition active:scale-95 flex items-center gap-2">
                                            {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiCheckCircle size={18}/>}
                                            Save Institute Data
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* 4. DATA MANAGEMENT */}
                        {activeTab === 'Data' && (
                            <div className="p-8 md:p-10">
                                 <div className="mb-8 border-b border-gray-100 pb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Database Operations</h2>
                                    <p className="text-gray-500 mt-1">Manage system backups and export student records for external use.</p>
                                </div>
                                 
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                     <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition group">
                                         <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                             <FiDownload size={24}/>
                                         </div>
                                         <h4 className="text-lg font-bold text-gray-900 mb-2">Export Student Data</h4>
                                         <p className="text-sm text-gray-500 mb-6 leading-relaxed">Download a complete CSV file containing all registered students, their contact info, and assigned standards.</p>
                                         <button 
                                            onClick={() => downloadFile('/data/export/students', 'students_list.csv')}
                                            className="w-full py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"
                                         >
                                             Download CSV
                                         </button>
                                     </div>

                                     <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition group">
                                         <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                             <FiDatabase size={24}/>
                                         </div>
                                         <h4 className="text-lg font-bold text-gray-900 mb-2">System Backup</h4>
                                         <p className="text-sm text-gray-500 mb-6 leading-relaxed">Generate a secure database snapshot containing attendance logs, exam schedules, and result histories.</p>
                                         <button 
                                            onClick={() => downloadFile('/data/backup', 'system_backup.json')}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
                                         >
                                             Trigger Backup
                                         </button>
                                     </div>
                                 </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;