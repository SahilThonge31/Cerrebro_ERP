import React, { useEffect, useState } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  FiUsers, FiTrendingUp, FiDollarSign, FiClock, FiMenu, FiPieChart, FiActivity, FiX, FiMail, FiShield, FiPhone
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- NEW: Admin Profile States ---
  const [adminData, setAdminData] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch Dashboard Stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/admin/stats', { headers: { 'x-auth-token': token } });
        setStats(res.data);
      } catch (error) {
        console.error("Dashboard Load Failed", error);
      } finally {
        setLoading(false);
      }
    };

    // 2. Fetch Admin User Data
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Based on your authRoutes.js, the endpoint is /auth/me
        const res = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
        setAdminData(res.data);
      } catch (error) {
        console.error("Failed to load admin profile", error);
      }
    };

    fetchStats();
    fetchAdminData();
  }, []);

  // Format Currency (e.g. 120000 -> ₹1.2L)
  const formatCurrency = (amount) => {
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
      if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
      return `₹${amount}`;
  };

  // --- WIDGET COMPONENTS ---
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition hover:-translate-y-1 hover:shadow-md">
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full ${color} opacity-10`}></div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-800">{value}</h3>
          {trend && <p className="mt-2 flex items-center text-xs font-bold text-green-600"><FiTrendingUp className="mr-1"/> {trend}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} text-white shadow-lg shrink-0`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 transition-all relative w-full">
        
        {/* --- DYNAMIC TOPBAR --- */}
        <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between bg-white/80 px-4 md:px-8 backdrop-blur-md shadow-sm">
           <div className="flex items-center gap-3 md:gap-4">
              <button className="lg:hidden text-gray-600 p-1" onClick={() => setIsSidebarOpen(true)}>
                  <FiMenu size={24} />
              </button>
              <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">Dashboard Overview</h1>
           </div>

           {/* Admin Profile Trigger */}
           <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 md:p-2 rounded-xl transition"
              onClick={() => setIsProfileOpen(true)}
           >
              <div className="hidden sm:block text-right">
                 <p className="text-xs font-medium text-gray-500">Welcome,</p>
                 <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{adminData?.name || 'Loading...'}</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm shrink-0 border border-gray-200">
                 {adminData?.profilePic ? (
                    <img src={adminData.profilePic} alt="Admin" className="h-full w-full object-cover" />
                 ) : (
                    adminData?.name ? adminData.name.charAt(0).toUpperCase() : 'A'
                 )}
              </div>
           </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-8 animate-fade-in-up">
           
           {loading ? (
             <div className="flex h-64 items-center justify-center text-gray-500">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
             </div>
           ) : (
             <>
               {/* 1. Stats Grid (Responsive Stack) */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  <StatCard 
                    title="Total Revenue" 
                    value={formatCurrency(stats.finance.totalRevenue)} 
                    icon={FiDollarSign} color="bg-green-600" trend="Real-Time Data"
                  />
                  <StatCard 
                    title="Pending Fees" 
                    value={formatCurrency(stats.finance.pendingFees)} 
                    icon={FiClock} color="bg-red-500" trend="Outstanding"
                  />
                  <StatCard 
                    title="Total Students" 
                    value={stats.counts.students} 
                    icon={FiUsers} color="bg-blue-600" trend="Active"
                  />
                  <StatCard 
                    title="Collection Rate" 
                    value={`${stats.finance.collectionRate}%`} 
                    icon={FiActivity} color="bg-purple-600" trend="Of Expected Fees"
                  />
               </div>

               <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
                  
                  {/* 2. REAL CLASS-WISE REVENUE */}
                  <div className="lg:col-span-2 rounded-2xl bg-white p-4 md:p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                             <FiPieChart className="text-blue-500"/> Revenue by Class
                          </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {stats.finance.byClass.length > 0 ? (
                             stats.finance.byClass.map((cls, index) => (
                                 <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition border border-gray-100">
                                     <div className="flex items-center gap-3">
                                         <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-gray-700 shrink-0">
                                             {cls._id || "Oth"}
                                         </div>
                                         <div className="min-w-0">
                                             <p className="text-xs text-gray-500 font-bold uppercase">Standard</p>
                                             <p className="font-bold text-gray-800 truncate">{cls._id || "Unassigned"}</p>
                                         </div>
                                     </div>
                                     <div className="text-right shrink-0 ml-2">
                                         <p className="text-xs text-green-600 font-bold uppercase">Collected</p>
                                         <p className="font-bold text-gray-800 text-sm md:text-lg">₹{cls.collected.toLocaleString()}</p>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <div className="col-span-1 sm:col-span-2 py-8 text-center text-gray-400">
                                 No revenue collected yet.
                             </div>
                         )}
                      </div>
                  </div>

                  {/* 3. Recent Activity */}
                  <div className="rounded-2xl bg-white p-4 md:p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-4">Recent Admissions</h3>
                      <div className="space-y-4">
                          {stats.recentActivity.length === 0 ? (
                              <p className="text-sm text-gray-400">No recent students.</p>
                          ) : (
                              stats.recentActivity.map((student) => (
                                  <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                                          {student.name.charAt(0)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold text-gray-800 truncate">{student.name}</p>
                                          <p className="text-xs text-gray-500 truncate">{student.standard} • {student.board}</p>
                                      </div>
                                      <span className="text-xs font-medium text-gray-400 shrink-0 whitespace-nowrap">
                                          {new Date(student.createdAt).toLocaleDateString()}
                                      </span>
                                  </div>
                              ))
                          )}
                      </div>
                      <button className="mt-4 w-full py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          View All Students
                      </button>
                  </div>

               </div>
             </>
           )}
        </main>
      </div>

      {/* ========================================= */}
      {/* --- ADMIN PROFILE POPUP MODAL --- */}
      {/* ========================================= */}
      {isProfileOpen && adminData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up">
            
            <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition z-10">
              <FiX size={20} />
            </button>

            <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 w-full relative">
               <div className="absolute -bottom-10 left-6 h-20 w-20 bg-white rounded-full p-1 shadow-lg">
                  <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-2xl font-black text-blue-600 overflow-hidden">
                    {adminData?.profilePic ? (
                        <img src={adminData.profilePic} alt="Admin" className="h-full w-full object-cover" />
                    ) : (
                        adminData?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
               </div>
            </div>

            <div className="pt-14 px-6 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-gray-800">{adminData.name}</h2>
                <FiShield className="text-blue-500" title="Verified Admin" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                System Administrator
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><FiMail size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{adminData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><FiPhone size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contact Number</p>
                    <p className="text-sm font-bold text-gray-800">{adminData.contact || 'Not Provided'}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }}
                className="w-full mt-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;