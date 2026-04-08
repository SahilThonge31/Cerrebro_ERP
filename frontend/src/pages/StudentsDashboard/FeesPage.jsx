import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiDownload, FiCheckCircle, FiAlertCircle, FiClock, FiX } from 'react-icons/fi';
import api from '../../api';

const FeesPage = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null); // For the detailed popup

  // 1. Fetch Fee Data
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/fees/my-fees', { headers: { 'x-auth-token': token } });
        setFeeData(res.data);
      } catch (error) {
        console.error("Failed to load fees");
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Helper: Status Colors
  const getStatusColor = (status) => {
    if (status === 'Paid') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Overdue') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'Paid') return <FiCheckCircle />;
    if (status === 'Overdue') return <FiAlertCircle />;
    return <FiClock />;
  };

  if (loading) return <div className="p-10 text-center">Loading Fee Details...</div>;
  if (!feeData) return <div className="p-10 text-center">No fee records found. Contact Admin.</div>;

  // Calculate Totals for Header
  const totalPaid = feeData.breakdown.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = feeData.totalFee - totalPaid;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in-up">
      
      {/* 1. Header with Student Info & Stats */}
      <div className="bg-white px-6 py-8 shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-800">
                <span className="rounded-xl bg-green-100 p-2 text-green-600">
                  <FiDollarSign />
                </span>
                Fee Details
              </h1>
              <p className="mt-2 text-gray-500">
                Payment Structure: <span className="font-bold text-gray-800">{feeData.paymentType}</span> ({feeData.standard})
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
               <div className="rounded-xl bg-green-50 p-4 border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase">Total Paid</p>
                  <p className="text-xl font-bold text-gray-800">₹{totalPaid.toLocaleString()}</p>
               </div>
               <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase">Pending</p>
                  <p className="text-xl font-bold text-gray-800">₹{totalPending.toLocaleString()}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fee Cards Grid */}
      <div className="mx-auto mt-8 max-w-5xl px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {feeData.breakdown.map((item, index) => (
            <div 
              key={index}
              onClick={() => setSelectedPayment(item)}
              className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl border border-gray-100
                          ${item.status === 'Overdue' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                 <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)} {item.status}
                 </span>
              </div>
              
              <div className="space-y-1">
                 <p className="text-2xl font-bold text-gray-800">₹{item.amount.toLocaleString()}</p>
                 <p className="text-sm text-gray-500">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
              </div>

              {/* Hover Prompt */}
              <div className="mt-4 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                 Click for details & receipt →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Detailed Popup Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl scale-100 animate-scale-up">
            
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-800">{selectedPayment.title} Details</h2>
               <button onClick={() => setSelectedPayment(null)} className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
                 <FiX size={20} />
               </button>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-800">₹{selectedPayment.amount}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-bold text-gray-800">{new Date(selectedPayment.dueDate).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded text-sm font-bold ${getStatusColor(selectedPayment.status)}`}>
                     {selectedPayment.status}
                  </span>
               </div>
               {selectedPayment.status === 'Paid' && (
                   <div className="flex justify-between">
                      <span className="text-gray-500">Paid On</span>
                      <span className="font-bold text-green-600">{new Date(selectedPayment.paidDate).toLocaleDateString()}</span>
                   </div>
               )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6">
               {selectedPayment.status === 'Paid' ? (
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                     <FiDownload /> Download Receipt
                  </button>
               ) : (
                  <button disabled className="w-full rounded-xl bg-gray-200 py-3 font-bold text-gray-400 cursor-not-allowed">
                     Receipt Unavailable
                  </button>
               )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default FeesPage;