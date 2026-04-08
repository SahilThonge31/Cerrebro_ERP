import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiUser, FiLock, FiBell, FiSave, FiShield, 
    FiSmartphone, FiMapPin, FiUsers 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const StudentSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // --- GENERAL STATE ---
  const [profileData, setProfileData] = useState({
      mobile: '',
      parentMobile: '',
      address: '',
      bio: ''
  });

  // --- NOTIFICATION STATE ---
  const [notifSettings, setNotifSettings] = useState({
      emailAlerts: true,
      smsAlerts: false,
      assignmentReminders: true,
      attendanceAlerts: true
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
            // Assuming your endpoint is mapped to /api/student/profile in server.js
            const res = await api.get('/student/profile', { headers: { 'x-auth-token': token } });
            
            setProfileData({
                mobile: res.data.contact || '', 
                parentMobile: res.data.parentContact || '',
                address: res.data.address || '',
                bio: res.data.bio || ''
            });

            if(res.data.notificationPreferences) {
                setNotifSettings(prev => ({
                    ...prev,
                    ...res.data.notificationPreferences
                }));
            }
        } catch (err) {
            console.error("Failed to load settings", err);
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
          await api.put('/student/profile/update', profileData, { headers: { 'x-auth-token': token } });
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
          await api.put('/student/profile/update', { 
              notificationPreferences: newSettings 
          }, { headers: { 'x-auth-token': token } });
          toast.success("Preferences updated");
      } catch (err) {
          toast.error("Failed to save preference");
          setNotifSettings(prev => ({ ...prev, [key]: !prev[key] })); // Revert on error
      }
  };

  // 4. Change Password
  const handlePasswordChange = async (e) => {
      e.preventDefault();
      if (passData.newPassword !== passData.confirmPassword) {
          return toast.error("New passwords do not match");
      }
      if (passData.newPassword.length < 6) {
          return toast.error("Password must be at least 6 characters");
      }

      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          await api.put('/student/profile/change-password', {
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
      { key: 'assignmentReminders', title: "Assignment Reminders", desc: "Get notified before an assignment is due." },
      { key: 'attendanceAlerts', title: "Attendance Alerts", desc: "Receive alerts if you are marked absent." },
      { key: 'emailAlerts', title: "Email Updates", desc: "Receive general platform updates via Email." },
      { key: 'smsAlerts', title: "SMS Alerts", desc: "Get critical exam and fee alerts via SMS." }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
        <Toaster position="top-right" />
        
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-[#1E293B] tracking-tight">Account Settings</h1>
                <p className="text-slate-500 font-medium mt-2">Manage your profile, security, and preferences.</p>
            </div>

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
                                    ? 'border-[#6FCB6C] bg-[#6FCB6C]/10 text-[#6FCB6C]' 
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
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-xl font-black text-[#1E293B] mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <FiUser className="text-[#6FCB6C]"/> Personal Information
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">My Mobile Number</label>
                                        <div className="relative">
                                            <FiSmartphone className="absolute top-3.5 left-3 text-slate-400" />
                                            <input 
                                                type="text" 
                                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all"
                                                value={profileData.mobile}
                                                onChange={e => setProfileData({...profileData, mobile: e.target.value})}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Parent Mobile Number</label>
                                        <div className="relative">
                                            <FiUsers className="absolute top-3.5 left-3 text-slate-400" />
                                            <input 
                                                type="text" 
                                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all"
                                                value={profileData.parentMobile}
                                                onChange={e => setProfileData({...profileData, parentMobile: e.target.value})}
                                                placeholder="+91 91234 56789"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Residential Address</label>
                                    <div className="relative">
                                        <FiMapPin className="absolute top-3.5 left-3 text-slate-400" />
                                        <textarea 
                                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all min-h-[100px] resize-none"
                                            value={profileData.address}
                                            onChange={e => setProfileData({...profileData, address: e.target.value})}
                                            placeholder="Enter your full address..."
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Bio / Goals</label>
                                    <textarea 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all min-h-[80px] resize-none"
                                        value={profileData.bio}
                                        onChange={e => setProfileData({...profileData, bio: e.target.value})}
                                        placeholder="What are your academic goals?"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-[#1E293B] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#6FCB6C] hover:text-[#1E293B] transition-colors active:scale-95 flex items-center gap-2"
                                    >
                                        {loading ? "Saving..." : <><FiSave /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* TAB: SECURITY */}
                    {activeTab === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-xl font-black text-[#1E293B] mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <FiLock className="text-[#6FCB6C]"/> Change Password
                            </h2>
                            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all"
                                        value={passData.currentPassword}
                                        onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                                    />
                                </div>
                                <hr className="border-slate-100 my-4" />
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all"
                                        value={passData.newPassword}
                                        onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all"
                                        value={passData.confirmPassword}
                                        onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-[#1E293B] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {loading ? "Updating..." : <><FiShield /> Update Password</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* TAB: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-xl font-black text-[#1E293B] mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <FiBell className="text-[#6FCB6C]"/> Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                {notifItems.map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-[#1E293B]">{item.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium max-w-xs mt-1">{item.desc}</p>
                                        </div>
                                        {/* Dynamic Toggle Switch */}
                                        <div 
                                            onClick={() => handleToggle(item.key)}
                                            className={`relative inline-block w-12 h-6 transition-colors duration-200 ease-in-out cursor-pointer rounded-full ${notifSettings[item.key] ? 'bg-[#6FCB6C]' : 'bg-slate-200'}`}
                                        >
                                            <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${notifSettings[item.key] ? 'translate-x-6' : ''}`}></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    </div>
  );
};

export default StudentSettingsPage;