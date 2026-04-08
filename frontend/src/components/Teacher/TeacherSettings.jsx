import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiUser, FiLock, FiBell, FiSave, FiAlertCircle, 
    FiCheckCircle, FiShield, FiSmartphone, FiMapPin 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const TeacherSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // --- GENERAL STATE ---
  const [profileData, setProfileData] = useState({
      mobile: '',
      address: '',
      bio: '',
      qualifications: ''
  });

  // --- NOTIFICATION STATE ---
  const [notifSettings, setNotifSettings] = useState({
      emailAlerts: true,
      smsAlerts: false,
      examUpdates: true,
      adminNotices: true
  });

  // --- PASSWORD STATE ---
  const [passData, setPassData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
  });

  // 1. Load Initial Data
  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/faculty/profile', { headers: { 'x-auth-token': token } });
            
            // 👇 FIX: Map Backend Fields (contact -> mobile, qualification -> qualifications)
            setProfileData({
                mobile: res.data.contact || '', 
                address: res.data.address || '',
                bio: res.data.bio || '',
                qualifications: res.data.qualification || '' 
            });

            // 👇 FIX: Load Notification Preferences
            if(res.data.notificationPreferences) {
                setNotifSettings(prev => ({
                    ...prev,
                    ...res.data.notificationPreferences
                }));
            }

        } catch (err) {
            console.error("Failed to load settings");
        }
    };
    fetchProfile();
  }, []);

  // 2. Update General Profile
  const handleProfileUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          // Send data using the keys the Controller expects ('mobile' and 'qualifications')
          await api.put('/faculty/profile/update', profileData, { headers: { 'x-auth-token': token } });
          toast.success("Profile details updated!");
      } catch (err) {
          toast.error("Failed to update profile");
      } finally {
          setLoading(false);
      }
  };

  // 3. Handle Notification Toggles (Auto-Save)
  const handleToggle = async (key) => {
      const newSettings = { ...notifSettings, [key]: !notifSettings[key] };
      setNotifSettings(newSettings); // Optimistic UI update
      
      try {
          const token = localStorage.getItem('token');
          // Update only the preferences
          await api.put('/faculty/profile/update', { 
              notificationPreferences: newSettings 
          }, { headers: { 'x-auth-token': token } });
          toast.success("Preference updated");
      } catch (err) {
          toast.error("Failed to save preference");
          // Revert on error
          setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
      }
  };

  // 4. Change Password
  const handlePasswordChange = async (e) => {
      e.preventDefault();
      if (passData.newPassword !== passData.confirmPassword) {
          return toast.error("New passwords do not match");
      }
      if (passData.newPassword.length < 6) {
          return toast.error("Password must be at least 6 chars");
      }

      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          await api.put('/faculty/change-password', {
              currentPassword: passData.currentPassword,
              newPassword: passData.newPassword
          }, { headers: { 'x-auth-token': token } });
          
          toast.success("Password changed successfully");
          setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
          toast.error(err.response?.data?.msg || "Failed to change password");
      } finally {
          setLoading(false);
      }
  };

  // --- TABS CONFIG ---
  const tabs = [
      { id: 'general', label: 'General Profile', icon: FiUser },
      { id: 'security', label: 'Security & Login', icon: FiLock },
      { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  // --- NOTIFICATION ITEMS MAP ---
  const notifItems = [
      { key: 'emailAlerts', title: "Assignment Submissions", desc: "Get notified via email when a student submits homework." },
      { key: 'adminNotices', title: "Admin Announcements", desc: "Receive alerts for school-wide notices." },
      { key: 'examUpdates', title: "Exam Schedules", desc: "Updates regarding exam dates and timings." },
      { key: 'smsAlerts', title: "SMS Alerts", desc: "Get critical alerts via SMS on your registered number." }
  ];

  return (
    <div className="animate-fade-in-up min-h-[80vh] bg-slate-50/50 rounded-3xl p-4 md:p-8">
        <Toaster position="top-right" />
        
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Settings</h1>
            <p className="text-slate-500 mb-8">Manage your account preferences and security.</p>

            <div className="flex flex-col md:flex-row gap-8">
                
                {/* --- SIDEBAR MENU --- */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all border-l-4 ${
                                    activeTab === tab.id 
                                    ? 'border-teal-500 bg-teal-50 text-teal-700' 
                                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1">
                    
                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in-up">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <FiUser className="text-teal-500"/> Personal Information
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Phone Number</label>
                                        <div className="relative">
                                            <FiSmartphone className="absolute top-3.5 left-3 text-slate-400" />
                                            <input 
                                                type="text" 
                                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                                value={profileData.mobile}
                                                onChange={e => setProfileData({...profileData, mobile: e.target.value})}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Qualifications</label>
                                        <div className="relative">
                                            <FiCheckCircle className="absolute top-3.5 left-3 text-slate-400" />
                                            <input 
                                                type="text" 
                                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                                value={profileData.qualifications}
                                                onChange={e => setProfileData({...profileData, qualifications: e.target.value})}
                                                placeholder="M.Sc. Mathematics, B.Ed."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Address</label>
                                    <div className="relative">
                                        <FiMapPin className="absolute top-3.5 left-3 text-slate-400" />
                                        <textarea 
                                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] resize-none"
                                            value={profileData.address}
                                            onChange={e => setProfileData({...profileData, address: e.target.value})}
                                            placeholder="123, Teacher's Colony, City..."
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Bio / About Me</label>
                                    <textarea 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px] resize-none"
                                        value={profileData.bio}
                                        onChange={e => setProfileData({...profileData, bio: e.target.value})}
                                        placeholder="Brief description about yourself..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition active:scale-95 flex items-center gap-2"
                                    >
                                        {loading ? "Saving..." : <><FiSave /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: SECURITY */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in-up">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <FiLock className="text-teal-500"/> Change Password
                            </h2>
                            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={passData.currentPassword}
                                        onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                                    />
                                </div>
                                <hr className="border-slate-100 my-4" />
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={passData.newPassword}
                                        onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={passData.confirmPassword}
                                        onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-900 transition active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {loading ? "Updating..." : <><FiShield /> Update Password</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in-up">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <FiBell className="text-teal-500"/> Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                {notifItems.map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-100/50">
                                        <div>
                                            <h4 className="font-bold text-slate-700">{item.title}</h4>
                                            <p className="text-xs text-slate-400 max-w-xs">{item.desc}</p>
                                        </div>
                                        {/* Dynamic Toggle Switch */}
                                        <div 
                                            onClick={() => handleToggle(item.key)}
                                            className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out cursor-pointer rounded-full ${notifSettings[item.key] ? 'bg-teal-500' : 'bg-slate-200'}`}
                                        >
                                            <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${notifSettings[item.key] ? 'translate-x-6' : ''}`}></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
  );
};

export default TeacherSettings;