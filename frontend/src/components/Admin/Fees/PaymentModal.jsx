import React, { useState } from 'react';
import { FiX, FiDollarSign, FiPrinter, FiCheck } from 'react-icons/fi';
import api from '../../../api';

const PaymentModal = ({ student, onClose, onSuccess }) => {
  const pendingAmount = (student.totalFees || 0) - (student.paidFees || 0);

  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [type, setType] = useState('Installment');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (Number(amount) > pendingAmount) {
        if(!window.confirm("Amount entered is greater than pending fees. Continue?")) return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/fees/pay', {
        studentId: student._id,
        amount,
        mode,
        type
      }, { headers: { 'x-auth-token': token } });
      
      alert("Payment Successful! Receipt Generated. 🧾");
      
      if (res.data.receipt) {
          window.open(res.data.receipt, '_blank');
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || "Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-green-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold">Collect Fee</h2>
            <p className="text-xs text-green-100">For {student.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-800 rounded-full"><FiX /></button>
        </div>

        {/* Quick Stats */}
        <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
            <div>
                <p className="text-xs font-bold text-green-600 uppercase">Pending Due</p>
                <p className="text-xl font-bold text-gray-800">₹{pendingAmount}</p>
            </div>
            <div className="h-10 w-10 bg-green-200 text-green-700 rounded-full flex items-center justify-center">
                <FiDollarSign />
            </div>
        </div>

        <form onSubmit={handlePayment} className="p-6 space-y-5">
          
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Pay</label>
            <input 
                type="number" 
                className="w-full p-4 text-2xl font-bold text-green-700 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:border-green-500"
                placeholder="₹ 0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
            />
          </div>

          {/* Mode & Type */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mode</label>
                <select className="w-full p-3 bg-white border border-gray-300 rounded-xl" value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="Cash">Cash 💵</option>
                    <option value="UPI">UPI / GPay 📱</option>
                    <option value="Cheque">Cheque 🏦</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                <select className="w-full p-3 bg-white border border-gray-300 rounded-xl" value={type} onChange={e => setType(e.target.value)}>
                    <option value="Installment">Installment</option>
                    <option value="Monthly">Monthly Fee</option>
                    <option value="Advance">Advance (April)</option>
                    <option value="Full">Full Payment</option>
                </select>
             </div>
          </div>

          <button disabled={loading || amount <= 0} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? "Processing..." : <><FiPrinter /> Record & Print Receipt</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;    