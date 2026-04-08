import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  FiSearch, FiTrash2, FiEdit, FiMenu, FiDollarSign, FiPlus, FiX, FiCheckCircle, FiBriefcase, FiDownload, FiClock
} from 'react-icons/fi';

const AdminTeachersPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real-Time Metrics State
  const [metrics, setMetrics] = useState({ total: 0, pendingSalary: 0, paidSalary: 0 });
  const [currentMonth, setCurrentMonth] = useState('');

  // Drawer States
  const [activeDrawer, setActiveDrawer] = useState(null); 
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Forms
  const [salaryForm, setSalaryForm] = useState({ month: '', amount: '', status: 'Paid' });
  const [editForm, setEditForm] = useState({ 
      name: '', email: '', contact: '', qualification: '', 
      subjects: '', classes: '', experience: '', baseSalary: '' 
  });

  useEffect(() => {
    const date = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const safeMonthStr = `${months[date.getMonth()]} ${date.getFullYear()}`; 
    
    setCurrentMonth(safeMonthStr);
    setSalaryForm(prev => ({ ...prev, month: safeMonthStr }));

    fetchTeachers(safeMonthStr);
  }, []);

  const fetchTeachers = async (monthStr) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/teachers', { headers: { 'x-auth-token': token } });
      const data = res.data;
      
      console.log("🔥 FETCHED TEACHERS DATA:", data); 

      setTeachers(data);
      setFilteredTeachers(data);

      // --- CALCULATE LIVE METRICS ---
      const activeMonth = monthStr || currentMonth;
      const pendingCount = data.filter(t => {
          const history = t.salaryHistory?.find(h => h.month === activeMonth);
          return !history || history.status !== 'Paid';
      }).length;

      setMetrics({
          total: data.length,
          pendingSalary: pendingCount,
          paidSalary: data.length - pendingCount
      });

    } catch (error) {
      console.error("Failed to fetch teachers", error);
    } finally {
      setLoading(false);
    }
  };

  // Search Logic
  useEffect(() => {
    const results = teachers.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTeachers(results);
  }, [searchTerm, teachers]);

  // --- HANDLERS ---

  const openEdit = (teacher) => {
      setSelectedTeacher(teacher);
      
      // Handle Classes for Edit Form (Convert Objects back to String for input)
      let classesString = '';
      if (teacher.classes && teacher.classes.length > 0) {
          classesString = teacher.classes.map(c => 
              typeof c === 'string' ? c : `${c.standard} ${c.board}`
          ).join(', ');
      }

      setEditForm({
          name: teacher.name,
          email: teacher.email,
          contact: teacher.contact,
          qualification: teacher.qualification || '',
          subjects: teacher.subjects?.join(', ') || '',
          classes: classesString,
          experience: teacher.experience || '',
          baseSalary: teacher.baseSalary || ''
      });
      setActiveDrawer('edit');
  };

  const openSalary = (teacher) => {
      setSelectedTeacher(teacher);
      const history = teacher.salaryHistory || [];
      const existingRecord = history.find(h => h.month === currentMonth);
      
      setSalaryForm({
          month: currentMonth,
          amount: existingRecord ? existingRecord.amount : (teacher.baseSalary || ''),
          status: existingRecord ? existingRecord.status : 'Paid'
      });
      setActiveDrawer('salary');
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this teacher account?")) return;
      try {
          const token = localStorage.getItem('token');
          await api.delete(`/admin/users/${id}`, { headers: { 'x-auth-token': token } });
          setTeachers(teachers.filter(t => t._id !== id));
      } catch (err) { alert("Delete Failed"); }
  };

  const handleSalarySubmit = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          await api.put(`/admin/teachers/${selectedTeacher._id}/salary`, salaryForm, {
              headers: { 'x-auth-token': token }
          });
          
          alert("Salary Updated Successfully!");
          setActiveDrawer(null);
          fetchTeachers(currentMonth); 

      } catch (err) { 
          console.error(err);
          alert("Failed to update salary."); 
      }
  };

  const handleUpdateProfile = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          await api.put(`/admin/users/${selectedTeacher._id}`, {
              ...editForm,
              role: 'teacher' 
          }, { headers: { 'x-auth-token': token } });
          
          alert("Profile Updated Successfully!");
          setActiveDrawer(null);
          fetchTeachers(currentMonth);
      } catch (err) { 
          console.error(err);
          alert("Update Failed."); 
      }
  };

  const handleExportCSV = () => {
    if (filteredTeachers.length === 0) return alert("No data to export");
    const headers = ["Name, Email, Phone, Subjects, Classes, Qualification, Base Salary"];
    const rows = filteredTeachers.map(t => 
        `"${t.name}", "${t.email}", "${t.contact}", "${t.subjects?.join(', ') || '-'}", "${t.classes?.map(c => typeof c === 'string' ? c : c.standard).join(', ') || '-'}", "${t.qualification || '-'}", "${t.baseSalary || 0}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `teachers_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 overflow-x-hidden">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* ADDED w-full relative transition logic */}
      <div className="flex-1 lg:ml-64 transition-all relative w-full">
        
        {/* --- HEADER --- */}
        <header className="flex h-16 md:h-20 items-center justify-between bg-white px-4 md:px-8 shadow-sm sticky top-0 z-20">
           <div className="flex items-center gap-3 md:gap-4">
               <button className="lg:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24}/></button>
               <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight truncate">Faculty Management</h1>
           </div>
           
           <div className="flex items-center gap-2 md:gap-3">
               <button onClick={handleExportCSV} className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                   <FiDownload /> <span className="hidden md:inline">Export List</span>
               </button>
               <button onClick={() => navigate('/admin/add-teacher')} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 text-xs md:text-sm font-bold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition active:scale-95 whitespace-nowrap">
                   <FiPlus /> Add Faculty
               </button>
           </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
            
            {/* --- LIVE METRICS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <MetricCard label="Total Faculty" value={metrics.total} color="border-l-4 border-blue-500" icon={<FiBriefcase/>} />
                <MetricCard 
                    label={`Salary Pending (${currentMonth})`} 
                    value={metrics.pendingSalary} 
                    color="border-l-4 border-red-500" 
                    icon={<FiClock/>} 
                />
                <MetricCard 
                    label={`Salary Paid (${currentMonth})`} 
                    value={metrics.paidSalary} 
                    color="border-l-4 border-green-500" 
                    icon={<FiCheckCircle/>} 
                />
            </div>

            {/* --- SEARCH --- */}
            <div className="mb-6 flex items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 w-full">
                <FiSearch className="text-gray-400 ml-2 shrink-0" />
                <input 
                    type="text" 
                    placeholder="Search by name, subject, or class..." 
                    className="w-full pl-3 pr-3 py-2 outline-none text-gray-600 text-sm md:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-4 md:p-5 whitespace-nowrap">Teacher Profile</th>
                                <th className="p-4 md:p-5 whitespace-nowrap">Subjects & Classes</th>
                                <th className="p-4 md:p-5 whitespace-nowrap">Contact</th>
                                <th className="p-4 md:p-5 whitespace-nowrap">Salary Status ({currentMonth})</th>
                                <th className="p-4 md:p-5 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? <tr><td colSpan="5" className="p-8 text-center">Loading...</td></tr> : 
                             filteredTeachers.map((teacher) => {
                                const salaryRecord = teacher.salaryHistory?.find(h => h.month === currentMonth);
                                
                                return (
                                    <tr key={teacher._id} className="hover:bg-gray-50 transition group">
                                        <td className="p-4 md:p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold shrink-0">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{teacher.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">Exp: {teacher.experience || 'Fresh'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 md:p-5">
                                            <div className="flex flex-col gap-1.5">
                                                {/* Subjects */}
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.subjects?.length > 0 ? (
                                                        teacher.subjects.map((sub, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-bold rounded border border-blue-100 whitespace-nowrap">
                                                                {sub}
                                                            </span>
                                                        ))
                                                    ) : <span className="text-gray-400 text-xs">No subjects</span>}
                                                </div>
                                                
                                                {/* Classes */}
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {teacher.classes?.length > 0 ? (
                                                        teacher.classes.map((cls, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] md:text-[10px] rounded whitespace-nowrap">
                                                                {typeof cls === 'string' ? cls : `${cls.standard} (${cls.board})`}
                                                            </span>
                                                        ))
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 md:p-5 text-gray-600">
                                            <p className="truncate max-w-[150px]">{teacher.email}</p>
                                            <p className="text-xs mt-0.5">{teacher.contact}</p>
                                        </td>

                                        <td className="p-4 md:p-5">
                                            {teacher.salaryHistory?.find(h => h.month === currentMonth)?.status === 'Paid' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 whitespace-nowrap">
                                                    <FiCheckCircle /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse whitespace-nowrap">
                                                    Pending
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 md:p-5 text-right">
                                            <div className="flex justify-end gap-1.5 md:gap-2">
                                                <button onClick={() => openSalary(teacher)} className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg shrink-0" title="Manage Salary">
                                                    <FiDollarSign size={18} />
                                                </button>
                                                <button onClick={() => openEdit(teacher)} className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg shrink-0" title="Edit Profile">
                                                    <FiEdit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(teacher._id)} className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0" title="Delete">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>

        {/* --- DRAWER --- */}
        {activeDrawer && (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setActiveDrawer(null)}></div>
                {/* Made Drawer Full width on small screens */}
                <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto animate-fade-in-right">
                    
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800">
                            {activeDrawer === 'edit' ? 'Edit Teacher Profile' : 'Payroll Management'}
                        </h2>
                        <button onClick={() => setActiveDrawer(null)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={24} /></button>
                    </div>

                    {activeDrawer === 'edit' ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4 md:space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Full Name</label>
                                <input className="w-full border p-2.5 md:p-3 rounded-lg text-sm" placeholder="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Subjects (Comma separated)</label>
                                <input className="w-full border p-2.5 md:p-3 rounded-lg text-sm" placeholder="e.g. Maths, Physics" value={editForm.subjects} onChange={e => setEditForm({...editForm, subjects: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Classes (Comma separated)</label>
                                <input className="w-full border p-2.5 md:p-3 rounded-lg text-sm" placeholder="e.g. 10th CBSE, 12th State" value={editForm.classes} onChange={e => setEditForm({...editForm, classes: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Experience</label>
                                    <input className="w-full border p-2.5 md:p-3 rounded-lg text-sm" placeholder="e.g. 5 Years" value={editForm.experience} onChange={e => setEditForm({...editForm, experience: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1">Base Salary (₹)</label>
                                    <input className="w-full border p-2.5 md:p-3 rounded-lg text-sm" type="number" placeholder="Base Salary" value={editForm.baseSalary} onChange={e => setEditForm({...editForm, baseSalary: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Phone</label>
                                <input className="w-full border p-2.5 md:p-3 rounded-lg text-sm" placeholder="Phone" value={editForm.contact} onChange={e => setEditForm({...editForm, contact: e.target.value})} />
                            </div>
                            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4 transition active:scale-95">Save Profile</button>
                        </form>
                    ) : (
                        <form onSubmit={handleSalarySubmit} className="space-y-5 md:space-y-6">
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-2 md:mb-4">
                                <h3 className="text-sm font-bold text-yellow-800">For: {selectedTeacher.name}</h3>
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Month</label>
                                <input type="text" className="w-full border p-2.5 md:p-3 rounded-lg bg-gray-50 text-sm" value={salaryForm.month} readOnly />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Amount (₹)</label>
                                <input type="number" className="w-full border p-2.5 md:p-3 rounded-lg text-sm" value={salaryForm.amount} onChange={e => setSalaryForm({...salaryForm, amount: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Status</label>
                                <select className="w-full border p-2.5 md:p-3 rounded-lg bg-white text-sm" value={salaryForm.status} onChange={e => setSalaryForm({...salaryForm, status: e.target.value})}>
                                    <option value="Paid">Mark as Paid ✅</option>
                                    <option value="Unpaid">Mark as Unpaid ❌</option>
                                    <option value="Pending">Pending ⏳</option>
                                </select>
                            </div>
                            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition active:scale-95 mt-4">Update Status</button>
                        </form>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon }) => (
    <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 ${color} flex justify-between items-start`}>
        <div>
            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 md:mt-2">{value}</h3>
        </div>
        <div className="p-2 md:p-3 bg-gray-50 rounded-lg text-gray-400">{icon}</div>
    </div>
);

export default AdminTeachersPage;