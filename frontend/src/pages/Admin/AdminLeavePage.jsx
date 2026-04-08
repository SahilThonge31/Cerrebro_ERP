import React, { useState, useEffect } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
    FiCheck, FiX, FiCalendar, FiClock, FiUser, 
    FiAlertCircle, FiSearch, FiMenu 
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const AdminLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending'); // Tabs: Pending, Approved, Rejected
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Fetch All Leaves
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await api.get('/leaves/all', { headers: { 'x-auth-token': token } });
        setLeaves(res.data);
    } catch (err) {
        toast.error("Failed to fetch leave requests");
    } finally {
        setLoading(false);
    }
  };

  // 2. Handle Decision (Approve/Reject)
  const handleDecision = async (leaveId, status) => {
      let remark = '';
      if (status === 'Rejected') {
          remark = prompt("Enter a reason for rejection (optional):");
          if (remark === null) return; // Cancelled
      }

      try {
          const token = localStorage.getItem('token');
          await api.put('/leaves/update-status', {
              leaveId,
              status,
              adminRemark: remark
          }, { headers: { 'x-auth-token': token } });

          toast.success(`Leave ${status} successfully`);
          fetchLeaves(); // Refresh list
      } catch (err) {
          toast.error("Failed to update status");
      }
  };

  // Filter Logic
  const filteredLeaves = leaves.filter(l => l.status === filter);
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <Toaster position="top-right" />
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all w-full">
        
        {/* --- HEADER --- */}
        <header className="bg-white px-8 py-5 shadow-sm sticky top-0 z-20 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>
                    <FiMenu size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><FiClock /></span> 
                    Leave Requests
                </h1>
            </div>
            
            {/* Quick Stat Badge */}
            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
                <div className="bg-orange-500 h-2 w-2 rounded-full animate-pulse"></div>
                <span className="text-orange-700 font-bold text-sm">{pendingCount} Pending Requests</span>
            </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="p-8 max-w-6xl mx-auto">
            
            {/* 1. TABS */}
            <div className="flex gap-6 border-b border-gray-200 mb-8">
                {['Pending', 'Approved', 'Rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`pb-4 px-2 text-sm font-bold transition relative ${
                            filter === status ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {status}
                        {filter === status && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                    </button>
                ))}
            </div>

            {/* 2. LEAVE CARDS LIST */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
            ) : filteredLeaves.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 p-4 rounded-full inline-block mb-3 text-gray-300"><FiCalendar size={32}/></div>
                    <p className="text-gray-400">No {filter.toLowerCase()} leave requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredLeaves.map((leave) => (
                        <div key={leave._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6 animate-fade-in-up">
                            
                            {/* Profile & Info */}
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                    {leave.employee?.profilePic ? (
                                        <img src={leave.employee.profilePic} alt="" className="h-full w-full object-cover"/>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center font-bold text-gray-400 bg-gray-100">
                                            {leave.employee?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{leave.employee?.name}</h3>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">{leave.leaveType}</p>
                                    
                                    <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                        <FiCalendar className="text-gray-400"/>
                                        <span className="font-medium text-gray-700">
                                            {new Date(leave.startDate).toLocaleDateString()} 
                                        </span>
                                        <span className="text-gray-300">➜</span>
                                        <span className="font-medium text-gray-700">
                                            {new Date(leave.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className="mt-3 text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                        "{leave.reason}"
                                    </p>
                                    
                                    {leave.adminRemark && (
                                        <p className="mt-2 text-xs text-red-500 font-medium">
                                            Note: {leave.adminRemark}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col justify-center gap-3 shrink-0">
                                {leave.status === 'Pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleDecision(leave._id, 'Approved')}
                                            className="bg-green-100 text-green-700 px-6 py-2 rounded-xl font-bold hover:bg-green-200 transition flex items-center justify-center gap-2"
                                        >
                                            <FiCheck /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleDecision(leave._id, 'Rejected')}
                                            className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                                        >
                                            <FiX /> Reject
                                        </button>
                                    </>
                                )}
                                {leave.status !== 'Pending' && (
                                    <div className={`px-6 py-2 rounded-xl font-bold text-center border ${
                                        leave.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                        {leave.status}
                                    </div>
                                )}
                                <span className="text-xs text-gray-300 text-center font-medium">
                                    Applied {new Date(leave.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default AdminLeavePage;