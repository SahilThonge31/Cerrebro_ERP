import React, { useEffect, useState } from 'react';
import api from '../../api';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiActivity, FiFilter, FiDownload, FiPlus, FiBriefcase, FiMenu 
} from 'react-icons/fi';

const AdminFinancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Transactions'); // 'Transactions' or 'Expenses'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters
  const [filterBoard, setFilterBoard] = useState('All');
  const [filterClass, setFilterClass] = useState('All');

  // New Expense Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Salary', paymentMode: 'Bank Transfer' });

  useEffect(() => {
    fetchFinanceData();
  }, [filterBoard, filterClass]);

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Pass filters to backend
      const res = await api.get(`/finance/dashboard?board=${filterBoard}&standard=${filterClass}`, { 
          headers: { 'x-auth-token': token } 
      });
      setData(res.data);
    } catch (error) {
      console.error("Finance Load Error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          await api.post('/finance/expense', newExpense, { headers: { 'x-auth-token': token } });
          alert("Expense Recorded ✅");
          setShowExpenseModal(false);
          fetchFinanceData(); // Refresh data
          setNewExpense({ title: '', amount: '', category: 'Salary', paymentMode: 'Bank Transfer' });
      } catch (err) {
          alert("Failed to add expense");
      }
  };

  const exportCSV = () => {
      if(!data) return;
      const csvRows = [
          ['Date', 'Student/Title', 'Category', 'Amount', 'Mode'],
          ...data.transactions.map(t => [new Date(t.date).toLocaleDateString(), t.student?.name || 'Unknown', 'Fee Income', t.amount, t.paymentMode]),
          ...data.expensesList.map(e => [new Date(e.date).toLocaleDateString(), e.title, e.category, -e.amount, e.paymentMode])
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "finance_report.csv");
      document.body.appendChild(link);
      link.click();
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading Financial Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 md:ml-64 transition-all">
        
        {/* Header */}
        <header className="flex h-20 items-center justify-between bg-white px-8 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}><FiMenu size={24} /></button>
                <h1 className="text-xl font-bold text-gray-800">Financial Overview</h1>
            </div>
            <div className="flex gap-3">
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium text-sm">
                    <FiDownload /> Export Report
                </button>
                <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm shadow-md">
                    <FiPlus /> Record Expense
                </button>
            </div>
        </header>

        <main className="p-8 space-y-8 animate-fade-in-up">

            {/* 1. FINANCIAL SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card 
                    title="Total Income" 
                    value={`₹${data.summary.income.toLocaleString()}`} 
                    sub="Fees Collected" 
                    color="bg-green-100 text-green-700" 
                    icon={<FiTrendingUp size={24}/>} 
                />
                <Card 
                    title="Total Expenses" 
                    value={`₹${data.summary.expenses.toLocaleString()}`} 
                    sub="Salaries & Rent" 
                    color="bg-red-100 text-red-700" 
                    icon={<FiTrendingDown size={24}/>} 
                />
                 <Card 
                    title="Teacher Salaries" 
                    value={`₹${data.summary.salaries.toLocaleString()}`} 
                    sub="Paid this Session" 
                    color="bg-purple-100 text-purple-700" 
                    icon={<FiBriefcase size={24}/>} 
                />
                <Card 
                    title="Net Profit" 
                    value={`₹${data.summary.profit.toLocaleString()}`} 
                    sub="Revenue - Expense" 
                    color="bg-blue-100 text-blue-700" 
                    icon={<FiActivity size={24}/>} 
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* 2. MAIN LEDGER (Transactions) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tabs & Filters */}
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['Transactions', 'Expenses'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        {/* Filters (Only show for Transactions tab) */}
                        {activeTab === 'Transactions' && (
                            <div className="flex gap-2">
                                <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2 outline-none" onChange={e => setFilterBoard(e.target.value)}>
                                    <option value="All">All Boards</option>
                                    <option value="CBSE">CBSE</option>
                                    <option value="SSC">SSC</option>
                                </select>
                                <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2 outline-none" onChange={e => setFilterClass(e.target.value)}>
                                    <option value="All">All Classes</option>
                                    <option value="10th">10th</option>
                                    <option value="12th">12th</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* TABLE CONTENT */}
                    <div className="overflow-x-auto h-[500px] overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold sticky top-0">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">{activeTab === 'Transactions' ? 'Student Name' : 'Title'}</th>
                                    <th className="p-4">{activeTab === 'Transactions' ? 'Class' : 'Category'}</th>
                                    <th className="p-4">Mode</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTab === 'Transactions' ? (
                                    data.transactions.length > 0 ? (
                                        data.transactions.map(t => (
                                            <tr key={t._id} className="hover:bg-gray-50">
                                                <td className="p-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-gray-800">{t.student?.name || "Unknown"}</td>
                                                <td className="p-4">
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                        {t.student?.standard} {t.student?.board}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600">{t.paymentMode}</td>
                                                <td className="p-4 text-right font-bold text-green-600">+₹{t.amount}</td>
                                            </tr>
                                        ))
                                    ) : <EmptyState msg="No transactions found for these filters" />
                                ) : (
                                    // EXPENSES TABLE
                                    data.expensesList.length > 0 ? (
                                        data.expensesList.map(e => (
                                            <tr key={e._id} className="hover:bg-gray-50">
                                                <td className="p-4 text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-gray-800">{e.title}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${e.category === 'Salary' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {e.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-600">{e.paymentMode}</td>
                                                <td className="p-4 text-right font-bold text-red-600">-₹{e.amount}</td>
                                            </tr>
                                        ))
                                    ) : <EmptyState msg="No expenses recorded yet" />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. RECENT ONLINE ACTIVITY SIDEBAR */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FiActivity className="text-blue-500" /> Recent Online Payments
                    </h3>
                    <div className="space-y-4">
                        {data.recentOnline.length > 0 ? (
                            data.recentOnline.map(t => (
                                <div key={t._id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                        {t.student?.name?.charAt(0) || "U"}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-800">{t.student?.name}</p>
                                        <p className="text-xs text-blue-600 font-mono">ID: {t.transactionId?.slice(-6)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">₹{t.amount}</p>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-gray-400 py-6">No recent online payments.</p>
                        )}
                    </div>
                </div>

            </div>

        </main>

        {/* --- ADD EXPENSE MODAL --- */}
        {showExpenseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                    <div className="bg-red-600 px-6 py-4 text-white flex justify-between items-center">
                        <h3 className="font-bold">Record New Expense</h3>
                        <button onClick={() => setShowExpenseModal(false)} className="hover:bg-red-700 p-1 rounded"><FiMenu /></button>
                    </div>
                    <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                            <input required type="text" placeholder="e.g. Salary for Ravi Sir" className="w-full border rounded-lg p-3 outline-none focus:border-red-500" 
                                value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                                <input required type="number" placeholder="₹" className="w-full border rounded-lg p-3 outline-none focus:border-red-500" 
                                    value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <select className="w-full border rounded-lg p-3 outline-none" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                                    <option value="Salary">Salary 👨‍🏫</option>
                                    <option value="Rent">Rent 🏠</option>
                                    <option value="Maintenance">Maintenance 🛠️</option>
                                    <option value="Electricity">Electricity 💡</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition">
                            Save Expense
                        </button>
                    </form>
                </div>
            </div>
        )}
        

      </div>
    </div>
  );
};

const Card = ({ title, value, sub, color, icon }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
);

const EmptyState = ({ msg }) => (
    <tr>
        <td colSpan="5" className="p-8 text-center text-gray-400">
            {msg}
        </td>
    </tr>
);

export default AdminFinancePage;