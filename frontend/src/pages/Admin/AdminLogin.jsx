import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiShield, FiAlertCircle } from 'react-icons/fi';
import api from '../../api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login Request
      const res = await api.post('/auth/login', formData);

      // SECURITY CHECK: Ensure the user is actually an Admin
      if (res.data.role !== 'admin') {
        setError("Access Denied. You are not an Administrator.");
        setLoading(false);
        return;
      }

      // Save Token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      // --- FIX IS HERE: Use res.data.name directly ---
      localStorage.setItem('name', res.data.name); 

      // Redirect to Admin Dashboard
      navigate('/admin/dashboard');

    } catch (err) {
      console.error("Login Error:", err);
      // Fallback error message
      const msg = err.response?.data?.msg || 'Invalid Credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        
        {/* Header Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <FiShield size={32} />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-gray-400">Restricted Access. Authorized Personnel Only.</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-gray-800 p-8 shadow-2xl border border-gray-700">
          
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
              <FiAlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="admin@cerrebro.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <FiLock className="absolute right-4 top-3.5 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3.5 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:bg-gray-600"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
             &copy; 2026 Cerrebro Systems. Secure Connection.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;