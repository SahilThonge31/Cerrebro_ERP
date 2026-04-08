import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import VerifyInput from '../../components/common/VerifyInput'; 
import { FiUserPlus, FiMenu, FiShield, FiArrowLeft, FiCheckCircle, FiUser } from 'react-icons/fi';

const AdminAddStudentPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // DATA STATE (Matches Student Model)
  const [formData, setFormData] = useState({
    name: '', address: '',
    email: '', emailOtp: '',    
    contact: '', contactOtp: '', 
    // Student Specifics
    board: 'CBSE', standard: '10th', 
    parentName: '', parentPhone: '', 
    dob: '', gender: 'Male'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 1. Strict Verification Check
    if (!formData.emailOtp || !formData.contactOtp) {
      return toast.error("Please verify BOTH Email and Mobile Number first!");
    }

    setLoading(true);
    try {
      // 2. Construct Payload (Matches your Logic + Model)
      const payload = {
        name: formData.name,
        address: formData.address,
        email: formData.email,
        contact: formData.contact,
        emailOtp: formData.emailOtp,
        mobileOtp: formData.contactOtp, // logic maps contactOtp to mobileOtp
        role: 'student',
        studentDetails: {
          board: formData.board,
          standard: formData.standard,
          parentName: formData.parentName,
          parentPhone: formData.parentPhone,
          dob: formData.dob,
          gender: formData.gender
        }
      };

      await api.post('/admin/register', payload);
      toast.success("Student Registered & Credentials Sent to Email! 📧");
      
      setTimeout(() => navigate('/admin/students'), 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.msg || "Registration Failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-center" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all relative">
        
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
           <div className="flex items-center gap-4">
               <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
               <div className="flex items-center gap-2">
                   <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><FiArrowLeft /></button>
                   <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FiUserPlus className="text-blue-600" /> Add New Student
                   </h1>
               </div>
           </div>
        </header>

        <main className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    
                    {/* 1. VERIFICATION SECTION (First for flow) */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Step 1: Contact Verification</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <VerifyInput 
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="student@email.com"
                                verifyEndpoint="/admin/verify-email"
                                checkEndpoint="/admin/check-email-otp"
                                onVerified={(otp) => setFormData(prev => ({...prev, emailOtp: otp}))}
                            />
                            <VerifyInput 
                                label="Mobile Number"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                placeholder="9876543210"
                                verifyEndpoint="/admin/verify-mobile"
                                checkEndpoint="/admin/check-mobile-otp"
                                onVerified={(otp) => setFormData(prev => ({...prev, contactOtp: otp}))}
                            />
                        </div>
                    </div>

                    {/* 2. PERSONAL INFO */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Step 2: Personal Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} 
                                    className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Rahul Sharma" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="1"
                                    className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Residential Address" />
                            </div>
                        </div>
                    </div>

                    {/* 3. ACADEMIC & FAMILY DETAILS (Matches Model) */}
                    <div className="p-6 rounded-xl border bg-blue-50 border-blue-100">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-blue-700">
                            <FiShield /> Academic & Family Details
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Academic */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Board</label>
                                <select name="board" value={formData.board} onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none">
                                    {['CBSE', 'ICSE', 'SSC', 'State Board'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Standard</label>
                                <select name="standard" value={formData.standard} onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none">
                                    {['8th', '9th', '10th', '11th', '12th'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            {/* Personal */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} 
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Name</label>
                                <input name="parentName" value={formData.parentName} onChange={handleChange} 
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none" placeholder="Father/Mother Name" />
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Phone</label>
                                <input name="parentPhone" value={formData.parentPhone} onChange={handleChange} 
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-blue-500 outline-none" placeholder="Parent Contact" />
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <button onClick={handleRegister} disabled={loading} 
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? 'Processing...' : <><FiCheckCircle size={20} /> Create Student Account</>}
                    </button>
                    <p className="text-center text-xs text-gray-400">Login credentials will be sent to the verified email.</p>
                </form>
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAddStudentPage;