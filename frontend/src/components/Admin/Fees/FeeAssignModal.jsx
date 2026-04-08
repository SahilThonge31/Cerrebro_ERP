import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiPercent, FiCalendar } from 'react-icons/fi';
import api from '../../../api';

const FeeAssignModal = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    paymentPlan: 'Yearly', // Default
    discount: 0,
    joinDate: new Date().toISOString().split('T')[0] // Today
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/fees/assign', {
        studentId: student._id,
        ...formData
      }, { headers: { 'x-auth-token': token } });
      
      alert("Fee Structure Assigned Successfully! 🟢");
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to assign fees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold">Setup Fee Profile</h2>
            <p className="text-xs text-gray-400">For {student.name} ({student.standard} - {student.board})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full"><FiX /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Payment Plan</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentPlan: 'Yearly'})}
                className={`p-3 rounded-xl border-2 font-bold transition ${formData.paymentPlan === 'Yearly' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
              >
                Yearly
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentPlan: 'Monthly'})}
                className={`p-3 rounded-xl border-2 font-bold transition ${formData.paymentPlan === 'Monthly' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Discount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount (₹)</label>
              <div className="relative">
                <FiPercent className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="number" 
                  className="w-full pl-10 p-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500" 
                  value={formData.discount}
                  onChange={e => setFormData({...formData, discount: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Join Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="date" 
                  className="w-full pl-10 p-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500" 
                  value={formData.joinDate}
                  onChange={e => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition flex justify-center items-center gap-2">
            {loading ? "Assigning..." : <><FiCheckCircle /> Confirm Fee Rules</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeeAssignModal;