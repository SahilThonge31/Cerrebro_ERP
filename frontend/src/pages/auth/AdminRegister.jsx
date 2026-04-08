import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

// Icons & Sidebar
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { FiUserPlus, FiUsers, FiBriefcase, FiMenu, FiCheckCircle, FiShield } from 'react-icons/fi';

// Components (Assuming you have these common components, otherwise standard HTML inputs work too)
import VerifyInput from '../../components/common/VerifyInput'; 

const AdminRegister = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  // --- LOGIC STARTS (UNCHANGED) ---
  const boardOptions = ['CBSE', 'ICSE', 'SSC', 'State Board'];
  const standardOptions = ['8th', '9th', '10th', '11th', '12th'];

  const [formData, setFormData] = useState({
    name: '', address: '',
    email: '', emailOtp: '',    
    contact: '', contactOtp: '', 
    board: 'CBSE', standard: '10th', schoolName: '',
    qualification: '', mainSubject: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.emailOtp || !formData.contactOtp) {
      return toast.error("Please verify BOTH Email and Mobile Number!");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        role,
        mobileOtp: formData.contactOtp, 
        studentDetails: role === 'student' ? {
          board: formData.board, 
          standard: formData.standard, 
          schoolName: formData.schoolName
        } : undefined,
        teacherDetails: role === 'teacher' ? {
          qualification: formData.qualification, 
          mainSubject: formData.mainSubject
        } : undefined
      };

      await api.post('/admin/register', payload);
      toast.success("User Registered Successfully!");
      
      // Redirect to list after success
      setTimeout(() => {
          if(role === 'student') navigate('/admin/students');
          else navigate('/admin/teachers');
      }, 1500);
      
    } catch (error) {
      toast.error(error.response?.data?.msg || "Registration Failed");
    }
    setLoading(false);
  };
  // --- LOGIC ENDS ---

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-center" />
      
      {/* 1. SIDEBAR INTEGRATION */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 transition-all relative">
        
        {/* Header */}
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
           <div className="flex items-center gap-4">
               <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}>
                  <FiMenu size={24}/>
               </button>
               <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FiUserPlus className="text-blue-600" /> Register New User
               </h1>
           </div>
        </header>

        <main className="p-6 md:p-8 max-w-4xl mx-auto">
            
            {/* 3. FORM CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Role Toggle Tabs */}
                <div className="flex border-b border-gray-100">
                    <button 
                        type="button" 
                        onClick={() => setRole('student')} 
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all
                            ${role === 'student' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FiUsers size={18} /> Add Student
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setRole('teacher')} 
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all
                            ${role === 'teacher' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FiBriefcase size={18} /> Add Teacher
                    </button>
                </div>

                <div className="p-8">
                    <form className="space-y-6">
                        
                        {/* Section: Basic Info */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Personal Information</h3>
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="e.g. Rahul Sharma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Residential Address</label>
                                    <textarea 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleChange} 
                                        rows="2"
                                        className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Full address..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Verification */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-4">Contact Verification</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <VerifyInput 
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="official@email.com"
                                    verifyEndpoint="/admin/verify-email"
                                    checkEndpoint="/admin/check-email-otp"
                                />
                                <VerifyInput 
                                    label="Mobile Number"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    verifyEndpoint="/admin/verify-mobile"
                                    checkEndpoint="/admin/check-mobile-otp"
                                />
                            </div>
                        </div>

                        {/* Section: Role Specifics */}
                        <div className={`p-6 rounded-xl border ${role === 'student' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
                            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${role === 'student' ? 'text-blue-700' : 'text-green-700'}`}>
                                <FiShield /> {role === 'student' ? 'Academic Details' : 'Professional Details'}
                            </h3>
                            
                            {role === 'student' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                                        <input 
                                            name="schoolName" 
                                            value={formData.schoolName} 
                                            onChange={handleChange} 
                                            className="w-full rounded-lg border border-gray-200 p-3 focus:border-blue-500 outline-none"
                                            placeholder="Current School"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Board</label>
                                            <select 
                                                name="board" 
                                                value={formData.board} 
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none"
                                            >
                                                {boardOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Standard</label>
                                            <select 
                                                name="standard" 
                                                value={formData.standard} 
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none"
                                            >
                                                {standardOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                                        <input 
                                            name="qualification" 
                                            value={formData.qualification} 
                                            onChange={handleChange} 
                                            className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-green-500 outline-none"
                                            placeholder="e.g. B.Ed, M.Sc"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Main Subject</label>
                                        <input 
                                            name="mainSubject" 
                                            value={formData.mainSubject} 
                                            onChange={handleChange} 
                                            className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-green-500 outline-none"
                                            placeholder="e.g. Mathematics"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button 
                                onClick={handleRegister} 
                                disabled={loading} 
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95
                                    ${role === 'student' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'}
                                    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                {loading ? 'Processing...' : <><FiCheckCircle size={20} /> Create Account</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRegister;