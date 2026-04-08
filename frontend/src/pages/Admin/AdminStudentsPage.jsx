import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import {
  FiSearch, FiTrash2, FiEdit, FiMenu, FiFilter, FiDownload, FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiBell, FiDollarSign
} from 'react-icons/fi';

// --- IMPORT THE NEW FEE MODALS ---
import FeeAssignModal from '../../components/Admin/Fees/FeeAssignModal';
import PaymentModal from '../../components/Admin/Fees/PaymentModal';

const AdminStudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- FILTER STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterBoard, setFilterBoard] = useState('All');

  // --- EDIT DRAWER STATE ---
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', contact: '', standard: '', board: '' });

  // --- FEE MODAL STATES ---
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeFeeStudent, setActiveFeeStudent] = useState(null);

  // --- METRICS STATE ---
  const [metrics, setMetrics] = useState({ total: 0, active: 0, new: 0, pendingFees: 0 });

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- 1. FETCH & CALCULATE METRICS ---
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/students', { headers: { 'x-auth-token': token } });
      const data = res.data;

      setStudents(data);

      // Calculate Real-Time Metrics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        total: data.length,
        active: data.length,
        new: data.filter(s => new Date(s.createdAt) >= firstDayOfMonth).length,
        pendingFees: data.filter(s => (s.totalFees || 0) > (s.paidFees || 0)).length
      };
      setMetrics(stats);

    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ADVANCED FILTERING ---
  useEffect(() => {
    let results = students;

    // Search
    if (searchTerm) {
      results = results.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter 1: Standard
    if (filterClass !== 'All') {
      results = results.filter(s => s.standard === filterClass);
    }

    // Filter 2: Board
    if (filterBoard !== 'All') {
      results = results.filter(s => s.board === filterBoard);
    }

    setFilteredStudents(results);
  }, [searchTerm, filterClass, filterBoard, students]);


  // --- 3. CSV EXPORT FUNCTION ---
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return alert("No data to export");
    const headers = ["Name, Email, Contact, Class, Board, Total Fees, Paid Fees, Joined Date"];
    
    const rows = filteredStudents.map(s =>
      `${s.name}, ${s.email}, ${s.contact}, ${s.standard || '-'}, ${s.board || '-'}, ${s.totalFees || 0}, ${s.paidFees || 0}, ${new Date(s.createdAt).toLocaleDateString()}`
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 4. HANDLERS ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/admin/users/${id}`, { headers: { 'x-auth-token': token } });
      setStudents(students.filter(s => s._id !== id));
    } catch (error) {
      alert("Delete Failed");
    }
  };

  const openEditPanel = (student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
      contact: student.contact,
      standard: student.standard || '',
      board: student.board || ''
    });
    setIsEditPanelOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put(`/admin/users/${selectedStudent._id}`, editForm, {
        headers: { 'x-auth-token': token }
      });

      const updatedList = students.map(s =>
        s._id === selectedStudent._id
          ? { ...s, ...editForm }
          : s
      );
      setStudents(updatedList);
      setIsEditPanelOpen(false);
      alert("Profile Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  // FEE REMINDER HANDLER
  const handleFeeReminder = async (student) => {
    if (!window.confirm(`Send fee reminder email to ${student.name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await api.post(`/admin/users/${student._id}/remind`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert(`✅ Email sent to ${student.name}`);
    } catch (error) {
      alert("Failed to send email.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* --- ADDED OVERFLOW/WIDTH CONSTRAINTS HERE --- */}
      <div className="flex-1 lg:ml-64 transition-all relative w-full">

        {/* --- HEADER --- */}
        <header className="flex h-16 md:h-20 items-center justify-between bg-white px-4 md:px-8 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3 md:gap-4">
            <button className="lg:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight truncate">Student Management</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <FiDownload /> <span className="hidden md:inline">Export CSV</span>
            </button>
            <button
              onClick={() => navigate('/admin/add-student')} 
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 text-xs md:text-sm font-bold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition active:scale-95 whitespace-nowrap"
            >
              <FiPlus /> Add Student
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">

          {/* --- 1. DYNAMIC METRICS CARDS (Adjusted grid for mobile) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <MetricCard label="Total Students" value={metrics.total} color="border-l-4 border-blue-500" />
            <MetricCard label="Active Students" value={metrics.active} color="border-l-4 border-green-500" />
            <MetricCard label="New This Month" value={metrics.new} color="border-l-4 border-purple-500" />
            <MetricCard label="Unpaid Fees" value={metrics.pendingFees} color="border-l-4 border-red-500" />
          </div>

          {/* --- 2. DUAL FILTERS & SEARCH (Responsive Stack) --- */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full lg:max-w-sm">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search student name..."
                className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none transition text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
              <div className="relative w-full sm:w-auto">
                <select
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 md:py-3 pl-4 pr-10 rounded-lg focus:outline-none cursor-pointer text-sm"
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="All">All Classes</option>
                  <option value="9th">9th Grade</option>
                  <option value="10th">10th Grade</option>
                  <option value="11th">11th Grade</option>
                  <option value="12th">12th Grade</option>
                </select>
                <FiFilter className="absolute right-3 top-3 md:top-3.5 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 md:py-3 pl-4 pr-10 rounded-lg focus:outline-none cursor-pointer text-sm"
                  onChange={(e) => setFilterBoard(e.target.value)}
                >
                  <option value="All">All Boards</option>
                  <option value="CBSE">CBSE</option>
                  <option value="SSC">SSC</option>
                </select>
                <FiFilter className="absolute right-3 top-3 md:top-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* --- 3. DATA TABLE (Added Overflow wrapper and min-w) --- */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-4 md:p-5 whitespace-nowrap">Student Info</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Contact</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Academic Info</th>
                    <th className="p-4 md:p-5 text-center whitespace-nowrap">Fee Status</th>
                    <th className="p-4 md:p-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center">Loading...</td></tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">No students match your search.</td></tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const totalFees = student.totalFees || 0;
                      const paidFees = student.paidFees || 0;
                      const isFeePaid = paidFees >= totalFees && totalFees > 0;
                      const rowClass = isFeePaid ? "hover:bg-gray-50" : "bg-red-50 hover:bg-red-100";

                      return (
                        <tr key={student._id} className={`${rowClass} transition duration-150 group`}>
                          <td className="p-4 md:p-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                  {student.profilePic ? (
                                      <img 
                                          src={student.profilePic} 
                                          alt={student.name} 
                                          className="h-full w-full object-cover"
                                          onError={(e) => {e.target.onerror = null; e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} 
                                      />
                                  ) : null}
                                  <div 
                                      className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm"
                                      style={{display: student.profilePic ? 'none' : 'flex'}}
                                  >
                                      {student.name.charAt(0)}
                                  </div>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 truncate">{student.name}</p>
                                <p className="text-xs text-gray-500 truncate">ID: {student.rollNumber || student._id.slice(-6).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 md:p-5">
                            <p className="truncate max-w-[150px]">{student.email}</p>
                            <p className="text-xs text-gray-500">{student.contact}</p>
                          </td>
                          <td className="p-4 md:p-5">
                            <span className="px-2 py-1 rounded bg-white border border-gray-200 text-xs font-bold text-gray-600 whitespace-nowrap">
                              {student.standard || "N/A"}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">{student.board}</span>
                          </td>

                          {/* Fee Status */}
                          <td className="p-4 md:p-5 text-center">
                            {isFeePaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 whitespace-nowrap">
                                <FiCheckCircle /> Paid
                              </span>
                            ) : (
                              <div className="flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse whitespace-nowrap">
                                      <FiAlertCircle /> Pending
                                  </span>
                                  <span className="text-[10px] text-red-600 font-bold mt-1 whitespace-nowrap">
                                      {totalFees > 0 ? `Due: ₹${totalFees - paidFees}` : 'Not Setup'}
                                  </span>
                              </div>
                            )}
                          </td>

                          <td className="p-4 md:p-5 text-right">
                            <div className="flex justify-end gap-1.5 md:gap-2 items-center">
                              
                              {/* --- THE NEW FEE BUTTONS --- */}
                              {!student.totalFees ? (
                                  <button 
                                      onClick={() => { setActiveFeeStudent(student); setShowAssignModal(true); }}
                                      className="px-2 md:px-3 py-1 bg-gray-900 text-white text-[10px] md:text-xs font-bold rounded-lg shadow hover:bg-black transition flex items-center gap-1 whitespace-nowrap"
                                  >
                                      Setup ⚙️
                                  </button>
                              ) : (
                                  !isFeePaid && (
                                      <button 
                                          onClick={() => { setActiveFeeStudent(student); setShowPaymentModal(true); }}
                                          className="px-2 md:px-3 py-1 bg-green-600 text-white text-[10px] md:text-xs font-bold rounded-lg shadow hover:bg-green-700 animate-pulse transition flex items-center gap-1 whitespace-nowrap"
                                      >
                                          <FiDollarSign /> Pay
                                      </button>
                                  )
                              )}

                              {/* FEE REMINDER BUTTON */}
                              {!isFeePaid && student.totalFees > 0 && (
                                <button
                                  onClick={() => handleFeeReminder(student)}
                                  className="p-1.5 md:p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition shrink-0"
                                  title="Send Fee Reminder Email"
                                >
                                  <FiBell size={16} />
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                onClick={() => openEditPanel(student)}
                                className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shrink-0"
                                title="Edit"
                              >
                                <FiEdit size={16} />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(student._id)}
                                className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* --- EDIT DRAWER (Responsive Width) --- */}
        {isEditPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsEditPanelOpen(false)}></div>
            <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto animate-fade-in-right">
              <div className="flex justify-between items-center mb-6 md:mb-8 border-b pb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Edit Student</h2>
                <button onClick={() => setIsEditPanelOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={24} /></button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full rounded-lg border border-gray-300 p-2.5 md:p-3" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Class</label>
                    <select className="w-full rounded-lg border border-gray-300 p-2.5 md:p-3" value={editForm.standard} onChange={e => setEditForm({ ...editForm, standard: e.target.value })}>
                      <option value="">Select</option>
                      <option value="9th">9th</option>
                      <option value="10th">10th</option>
                      <option value="11th">11th</option>
                      <option value="12th">12th</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Board</label>
                    <input type="text" className="w-full rounded-lg border border-gray-300 p-2.5 md:p-3" value={editForm.board} onChange={e => setEditForm({ ...editForm, board: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input type="email" className="w-full rounded-lg border border-gray-300 p-2.5 md:p-3 bg-gray-50 text-gray-500" value={editForm.email} disabled />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input type="text" className="w-full rounded-lg border border-gray-300 p-2.5 md:p-3" value={editForm.contact} onChange={e => setEditForm({ ...editForm, contact: e.target.value })} />
                </div>
                <div className="pt-4 md:pt-6">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg transition active:scale-95">
                    <FiCheckCircle size={20} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- FEE MODALS --- */}
        {showAssignModal && (
            <FeeAssignModal 
                student={activeFeeStudent} 
                onClose={() => setShowAssignModal(false)} 
                onSuccess={() => { fetchStudents(); }} 
            />
        )}

        {showPaymentModal && (
            <PaymentModal 
                student={activeFeeStudent} 
                onClose={() => setShowPaymentModal(false)} 
                onSuccess={() => { fetchStudents(); }} 
            />
        )}

      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color }) => (
  <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 ${color}`}>
    <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">{label}</p>
    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1 md:mt-2">{value}</h3>
  </div>
);

export default AdminStudentsPage;