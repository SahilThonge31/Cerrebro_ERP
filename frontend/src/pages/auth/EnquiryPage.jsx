import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiBook, FiPhone, FiMapPin, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const EnquiryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', className: '', schoolName: '', board: '',
    studentMobile: '', parentMobile: '', address: '', previousMarks: '', referenceSource: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/public/enquiry', formData);
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting enquiry", error);
      alert("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <FiCheckCircle className="text-[#6FCB6C] w-24 h-24 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-[#1E293B] mb-2">Request Received!</h2>
          <p className="text-slate-500 font-medium mb-8">Thank you for choosing Cerrebro. Our admissions team will contact you shortly.</p>
          <button onClick={() => navigate('/')} className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#6FCB6C] hover:text-[#0F172A] transition-colors w-full">
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6FCB6C]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Button & Header */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-[#6FCB6C] font-bold mb-8 transition-colors">
          <FiArrowLeft /> Back to Website
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-[#1E293B] tracking-tight mb-3">Admission Enquiry</h1>
          <p className="text-slate-500 text-lg font-medium">Take the first step towards academic excellence.</p>
        </motion.div>

        {/* The Form */}
        <motion.form 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6FCB6C] to-[#4a9648]"></div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* --- SECTION 1: BASIC DETAILS --- */}
            <div className="md:col-span-2">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#1E293B] border-b border-slate-100 pb-3 mb-5">
                <FiUser className="text-[#6FCB6C]" /> 1. Basic Details
              </h3>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
              <input type="text" name="fullName" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700" placeholder="Student's Full Name" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class / Standard *</label>
              <input type="text" name="className" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700" placeholder="e.g. 10th Standard" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">School / College Name *</label>
              <input type="text" name="schoolName" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700" placeholder="Enter school name" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Board *</label>
              <select name="board" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700 appearance-none">
                <option value="">Select Board</option>
                <option value="SSC">SSC</option>
                <option value="CBSE">CBSE</option>
      
              </select>
            </div>

            {/* --- SECTION 2: CONTACT DETAILS --- */}
            <div className="md:col-span-2 mt-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#1E293B] border-b border-slate-100 pb-3 mb-5">
                <FiPhone className="text-[#6FCB6C]" /> 2. Contact Details
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Mobile Number *</label>
              <input type="tel" name="studentMobile" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700" placeholder="+91" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Mobile Number *</label>
              <input type="tel" name="parentMobile" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700" placeholder="+91" />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address / Area *</label>
              <textarea name="address" rows="2" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700 resize-none" placeholder="Enter your full address"></textarea>
            </div>

            {/* --- SECTION 3: ACADEMIC & REFERENCE --- */}
            <div className="md:col-span-2 mt-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#1E293B] border-b border-slate-100 pb-3 mb-5">
                <FiBook className="text-[#6FCB6C]" /> 3. Academic & Other Details
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Year Marks / % *</label>
              <input type="text" name="previousMarks" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700" placeholder="e.g. 85%" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">How did you know about us? *</label>
              <select name="referenceSource" required onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#6FCB6C] focus:ring-2 focus:ring-[#6FCB6C]/20 transition-all font-medium text-slate-700 appearance-none">
                <option value="">Select an option</option>
                <option value="Friend/Relative">Friend / Relative</option>
                <option value="Google">Google / Internet</option>
                <option value="Social Media">Social Media (Instagram/FB)</option>
                <option value="Pamphlet/Banner">Pamphlet / Banner</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#6FCB6C] text-[#0F172A] px-10 py-4 rounded-xl font-black text-lg hover:bg-[#5bb858] hover:shadow-lg hover:shadow-[#6FCB6C]/30 transition-all duration-300 w-full md:w-auto flex items-center justify-center disabled:opacity-70"
            >
              {loading ? "Submitting Request..." : "Submit Enquiry"}
            </button>
          </div>
        </motion.form>

      </div>
    </div>
  );
};

export default EnquiryPage;