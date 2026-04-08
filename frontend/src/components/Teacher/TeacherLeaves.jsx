import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    FiCalendar, FiClock, FiFileText, FiSend, 
    FiCheckCircle, FiXCircle, FiAlertCircle 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const TeacherLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
      leaveType: 'Sick Leave',
      startDate: '',
      endDate: '',
      reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch History
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await api.get('/leaves/my-history', { headers: { 'x-auth-token': token } });
        setLeaves(res.data);
    } catch (err) {
        toast.error("Failed to load leave history");
    } finally {
        setLoading(false);
    }
  };

  // 2. Handle Submit
  const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
          const token = localStorage.getItem('token');
          await api.post('/leaves/apply', formData, { headers: { 'x-auth-token': token } });
          
          toast.success("Leave application submitted!");
          setFormData({ leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '' });
          fetchLeaves(); // Refresh list
      } catch (err) {
          toast.error("Failed to submit application");
      } finally {
          setSubmitting(false);
      }
  };

  // Helper: Status Badge
  const getStatusBadge = (status) => {
      switch(status) {
          case 'Approved': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FiCheckCircle/> Approved</span>;
          case 'Rejected': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FiXCircle/> Rejected</span>;
          default: return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FiAlertCircle/> Pending</span>;
      }
  };

  return (
    <div className="animate-fade-in-up min-h-[80vh] p-4 md:p-8">
        <Toaster position="top-right" />
        
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Leave Management</h1>
            <p className="text-slate-500 mb-8">Apply for leaves and track approval status.</p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- LEFT: APPLICATION FORM --- */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FiFileText className="text-teal-500"/> New Application
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Leave Type</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                    value={formData.leaveType}
                                    onChange={e => setFormData({...formData, leaveType: e.target.value})}
                                >
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Emergency</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Start Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={formData.startDate}
                                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">End Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                                        value={formData.endDate}
                                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Reason</label>
                                <textarea 
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px] resize-none"
                                    placeholder="Please describe the reason for leave..."
                                    value={formData.reason}
                                    onChange={e => setFormData({...formData, reason: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition active:scale-95 flex items-center justify-center gap-2"
                            >
                                {submitting ? "Submitting..." : <><FiSend /> Submit Application</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT: HISTORY TIMELINE --- */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 h-full">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FiClock className="text-teal-500"/> Leave History
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-teal-500 rounded-full border-t-transparent"></div></div>
                        ) : leaves.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p>No leave applications found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {leaves.map((leave) => (
                                    <div key={leave._id} className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{leave.leaveType}</h4>
                                                <span className="text-xs text-slate-400 font-medium">Applied on {new Date(leave.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {getStatusBadge(leave.status)}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 bg-white p-2 rounded-lg border border-slate-100 inline-block">
                                            <FiCalendar className="text-teal-500"/> 
                                            <span className="font-bold">
                                                {new Date(leave.startDate).toLocaleDateString()}
                                            </span>
                                            <span className="text-slate-300">➜</span>
                                            <span className="font-bold">
                                                {new Date(leave.endDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-500 italic">"{leave.reason}"</p>

                                        {leave.adminRemark && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-red-500">
                                                <strong>Admin Note:</strong> {leave.adminRemark}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default TeacherLeaves;