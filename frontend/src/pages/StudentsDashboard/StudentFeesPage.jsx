import React, { useEffect, useState } from 'react';
import { 
  FiDollarSign, FiClock, FiCheckCircle, FiDownload, FiAlertCircle, FiFileText, FiPieChart, FiCreditCard 
} from 'react-icons/fi';
import api from '../../api';

const StudentFeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRes = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
        const studentId = userRes.data._id;
        const res = await api.get(`/fees/${studentId}`, { headers: { 'x-auth-token': token } });
        setFeeData(res.data);
      } catch (err) {
        if(err.response?.status === 404) {
            setError("Fee structure pending. Please contact Admin.");
        } else {
            setError("Failed to load fee record.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handleDownload = (url) => {
      if(!url) return alert("Receipt generation in progress...");
      const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
      window.open(fullUrl, '_blank');
  };

  const handlePayClick = () => {
      alert("Online Payment Gateway is being configured. Please pay via Cash/UPI at the office for now.");
  };

  if (loading) return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg"></div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase animate-pulse">Loading Finances...</p>
          </div>
      </div>
  );

  if (error) return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
          <div className="mb-6 rounded-full bg-orange-50 p-6 text-orange-500 shadow-inner border border-orange-100">
              <FiAlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Status Update</h2>
          <p className="mt-3 text-sm text-gray-500 max-w-sm font-medium leading-relaxed">{error}</p>
      </div>
  );

  const isFullyPaid = feeData.pendingAmount <= 0;
  const progress = Math.min(100, (feeData.paidAmount / feeData.finalAmount) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-fade-in-up font-sans overflow-x-hidden">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-60"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Fee Dashboard</h1>
                    <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-500 flex flex-wrap items-center gap-2 font-medium">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">{feeData.standard} ({feeData.board})</span>
                        <span className="hidden sm:inline-block h-1.5 w-1.5 bg-gray-300 rounded-full"></span>
                        <span className="text-blue-600 font-bold">{feeData.paymentPlan} Plan</span>
                    </p>
                </div>
                <div className="w-full lg:w-auto mt-2 lg:mt-0">
                     {isFullyPaid ? (
                         <div className="w-full lg:w-auto px-5 py-3 bg-green-50 border border-green-200 text-green-700 font-bold rounded-xl flex justify-center items-center gap-2 shadow-sm text-sm">
                             <FiCheckCircle size={18} /> All Dues Cleared
                         </div>
                     ) : (
                         <div className="w-full lg:w-auto px-5 py-3 bg-orange-50 border border-orange-200 text-orange-700 font-bold rounded-xl flex justify-center items-center gap-2 shadow-sm animate-pulse text-sm">
                             <FiClock size={18} /> Payment Due
                         </div>
                     )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 sm:mt-12 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider mb-2 sm:mb-3">
                    <span className="text-gray-400">Payment Progress</span>
                    <span className="text-blue-600">{Math.round(progress)}% Paid</span>
                </div>
                <div className="h-2.5 sm:h-3 md:h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out relative ${isFullyPaid ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} 
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid gap-6 sm:gap-8 lg:grid-cols-3">

        {/* --- LEFT COLUMN: Summary Cards --- */}
        <div className="space-y-6 lg:space-y-8">
            
            {/* Payment Summary */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg tracking-tight">
                    <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg text-blue-600"><FiPieChart size={20}/></div> 
                    Financial Summary
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition">
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide">Total Fees</span>
                        <span className="text-sm sm:text-base md:text-lg font-black text-gray-900">₹{feeData.finalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-green-50 rounded-2xl border border-green-100 hover:border-green-200 transition">
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold text-green-700 uppercase tracking-wide">Paid Amount</span>
                        <span className="text-sm sm:text-base md:text-lg font-black text-green-700">₹{feeData.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-red-50 rounded-2xl border border-red-100 hover:border-red-200 transition relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500 opacity-5 pointer-events-none"></div>
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold text-red-700 uppercase tracking-wide relative z-10">Pending Due</span>
                        <span className="text-sm sm:text-base md:text-lg font-black text-red-700 relative z-10">₹{feeData.pendingAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* --- PAY ONLINE CARD (Only if Pending) --- */}
            {!isFullyPaid && (
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 p-5 sm:p-6 md:p-8 rounded-3xl shadow-xl text-white hover:shadow-2xl transition duration-300">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
                        <div className="p-2 sm:p-2.5 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                            <FiCreditCard size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-black text-base sm:text-lg md:text-xl tracking-tight">Pay Online</h3>
                    </div>
                    <p className="text-blue-100 text-[10px] sm:text-xs md:text-sm mb-5 sm:mb-6 leading-relaxed font-medium relative z-10 opacity-90">
                        Securely pay your pending fees using UPI, Credit Card, or Net Banking. Official receipt generated instantly.
                    </p>
                    <button 
                        onClick={handlePayClick}
                        className="relative z-10 w-full py-3 sm:py-4 bg-white text-indigo-700 font-black rounded-2xl shadow-lg hover:bg-gray-50 transition active:scale-95 flex justify-center items-center gap-2 text-xs sm:text-sm md:text-base"
                    >
                        <FiDollarSign size={16} className="sm:w-4 sm:h-4" /> Pay ₹{feeData.pendingAmount.toLocaleString()} Now
                    </button>
                </div>
            )}
        </div>

        {/* --- RIGHT COLUMN: Transaction History --- */}
        {/* 👇 THE FIX: min-w-0 prevents grid blowout, w-full ensures it spans available space */}
        <div className="lg:col-span-2 min-w-0 w-full">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col w-full">
                
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm sm:text-base md:text-lg tracking-tight">
                        <FiFileText className="text-gray-400 shrink-0"/> Transaction Log
                    </h3>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500 bg-white px-2 sm:px-3 py-1 rounded-lg border border-gray-200 shadow-sm uppercase tracking-wider shrink-0">
                        {feeData.transactions?.length || 0} Records
                    </span>
                </div>

                {feeData.transactions && feeData.transactions.length > 0 ? (
                    /* 👇 THE FIX: overflow-x-auto enables horizontal scrolling on small screens */
                    <div className="overflow-x-auto w-full flex-1 custom-scrollbar">
                        {/* Reduced min-w to 500px so it's less scroll-heavy on mobile */}
                        <table className="w-full text-left min-w-[500px] sm:min-w-[700px]">
                            <thead className="bg-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 whitespace-nowrap">Date</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 whitespace-nowrap">Receipt ID</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 whitespace-nowrap">Mode</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right whitespace-nowrap">Amount</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center whitespace-nowrap">Document</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {feeData.transactions.slice().reverse().map((txn) => (
                                    <tr key={txn._id} className="hover:bg-gray-50/50 transition group">
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <p className="text-xs sm:text-sm font-bold text-gray-800 whitespace-nowrap">
                                                {new Date(txn.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <span className="font-mono text-[9px] sm:text-[10px] md:text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200 whitespace-nowrap">
                                                {txn.transactionId}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                                            <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[9px] sm:text-[10px] md:text-xs font-bold border border-blue-100 whitespace-nowrap inline-block">
                                                {txn.paymentMode}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                            <p className="font-black text-gray-900 text-xs sm:text-sm whitespace-nowrap">₹{txn.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                            {txn.receiptUrl ? (
                                                <button 
                                                    onClick={() => handleDownload(txn.receiptUrl)}
                                                    className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition text-[9px] sm:text-[10px] md:text-xs font-bold shadow-sm whitespace-nowrap group-hover:shadow-md"
                                                    title="Download Official Receipt"
                                                >
                                                    <FiDownload size={12} className="sm:w-3.5 sm:h-3.5" /> Receipt
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs font-bold text-orange-500 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl whitespace-nowrap">
                                                    <FiClock size={10} className="animate-spin-slow sm:w-3 sm:h-3"/> Processing
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-gray-400 py-12 sm:py-20 px-4 text-center">
                        <div className="p-4 sm:p-5 bg-gray-50 rounded-full mb-3 sm:mb-4 shadow-inner border border-gray-100">
                            <FiFileText size={32} className="text-gray-300 sm:w-10 sm:h-10"/>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base font-bold text-gray-600">No transactions recorded.</p>
                        <p className="text-[10px] sm:text-xs mt-1 text-gray-400 font-medium">Any payments made will appear here instantly.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default StudentFeesPage;