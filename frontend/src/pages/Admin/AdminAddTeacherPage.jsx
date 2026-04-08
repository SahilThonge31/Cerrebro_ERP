import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import VerifyInput from '../../components/common/VerifyInput'; 
import { FiBriefcase, FiMenu, FiShield, FiArrowLeft, FiCheckCircle, FiPlus, FiX, FiLayers } from 'react-icons/fi';

const AdminAddTeacherPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // DATA STATE
  const [formData, setFormData] = useState({
    name: '', address: '',
    email: '', emailOtp: '',    
    contact: '', contactOtp: '', 
    qualification: '', experience: '', baseSalary: '',
    subjects: '' 
  });

  // 👇 NEW STATE FOR CLASS + BOARD MANAGER
  const [classManager, setClassManager] = useState({
      std: '10th',
      board: 'CBSE',
      addedList: [] // Stores [{ standard: '10th', board: 'CBSE' }]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic to Add Class to the visual list
  const handleAddClass = () => {
      const { std, board, addedList } = classManager;
      // Prevent duplicates
      const exists = addedList.find(item => item.standard === std && item.board === board);
      if(exists) return toast.error("Class already added!");

      setClassManager({
          ...classManager,
          addedList: [...addedList, { standard: std, board: board }]
      });
  };

  // Logic to Remove Class
  const handleRemoveClass = (index) => {
      const newList = classManager.addedList.filter((_, i) => i !== index);
      setClassManager({ ...classManager, addedList: newList });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.emailOtp || !formData.contactOtp) {
      return toast.error("Please verify BOTH Email and Mobile Number first!");
    }

    if (classManager.addedList.length === 0) {
        return toast.error("Please assign at least one Class & Board!");
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        email: formData.email,
        contact: formData.contact,
        emailOtp: formData.emailOtp,
        mobileOtp: formData.contactOtp,
        role: 'teacher',
        teacherDetails: {
          qualification: formData.qualification,
          experience: formData.experience,
          baseSalary: Number(formData.baseSalary),
          subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s !== ''),
          
          // 👇 SENDING THE STRUCTURED CLASS DATA
          classes: classManager.addedList 
        }
      };

      await api.post('/admin/register', payload);
      toast.success("Teacher Registered Successfully! 📧");
      
      setTimeout(() => navigate('/admin/teachers'), 2000);
      
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
                      <FiBriefcase className="text-purple-600" /> Add New Teacher
                   </h1>
               </div>
           </div>
        </header>

        <main className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    
                    {/* 1. VERIFICATION */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Step 1: Contact Verification</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <VerifyInput 
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="teacher@email.com"
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
                                    className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Amit Verma" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="1"
                                    className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Residential Address" />
                            </div>
                        </div>
                    </div>

                    {/* 3. PROFESSIONAL DETAILS */}
                    <div className="p-6 rounded-xl border bg-purple-50 border-purple-100">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-purple-700">
                            <FiShield /> Professional Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                                <input name="qualification" value={formData.qualification} onChange={handleChange} 
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-purple-500 outline-none" placeholder="e.g. M.Sc, B.Ed" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                                <input name="experience" value={formData.experience} onChange={handleChange} 
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-purple-500 outline-none" placeholder="e.g. 5 Years" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Salary (₹)</label>
                                <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} 
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-purple-500 outline-none" placeholder="e.g. 25000" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects</label>
                                <input name="subjects" value={formData.subjects} onChange={handleChange} 
                                    className="w-full rounded-lg border border-gray-200 p-3 bg-white focus:border-purple-500 outline-none" placeholder="Math, Physics (Comma separated)" />
                            </div>

                            {/* 👇 NEW: DYNAMIC CLASS & BOARD ASSIGNMENT */}
                            <div className="md:col-span-2 bg-white p-4 rounded-xl border border-purple-200">
                                <label className="block text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">
                                    <FiLayers/> Assign Classes & Boards
                                </label>
                                
                                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                    <select 
                                        className="p-3 rounded-lg border border-gray-300 bg-white font-semibold text-sm focus:border-purple-500 outline-none flex-1"
                                        value={classManager.std}
                                        onChange={(e) => setClassManager({...classManager, std: e.target.value})}
                                    >
                                        {['8th','9th','10th','11th','12th'].map(s => <option key={s} value={s}>{s} Standard</option>)}
                                    </select>

                                    <select 
                                        className="p-3 rounded-lg border border-gray-300 bg-white font-semibold text-sm focus:border-purple-500 outline-none flex-1"
                                        value={classManager.board}
                                        onChange={(e) => setClassManager({...classManager, board: e.target.value})}
                                    >
                                        {['CBSE','ICSE','State Board','IGCS'].map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>

                                    <button 
                                        type="button"
                                        onClick={handleAddClass}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition flex items-center gap-2 justify-center"
                                    >
                                        <FiPlus size={16}/> Add
                                    </button>
                                </div>

                                {/* LIST OF ADDED CLASSES */}
                                <div className="flex flex-wrap gap-2">
                                    {classManager.addedList.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No classes assigned yet.</p>
                                    ) : (
                                        classManager.addedList.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-200 animate-fade-in-up">
                                                <span>{item.standard} • {item.board}</span>
                                                <button onClick={() => handleRemoveClass(idx)} className="hover:text-red-500 transition"><FiX/></button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* SUBMIT */}
                    <button onClick={handleRegister} disabled={loading} 
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 bg-purple-600 hover:bg-purple-700 shadow-purple-500/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? 'Processing...' : <><FiCheckCircle size={20} /> Create Teacher Account</>}
                    </button>
                </form>
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAddTeacherPage;