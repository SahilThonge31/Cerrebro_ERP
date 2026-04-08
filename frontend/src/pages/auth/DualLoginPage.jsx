import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import api from '../../api'; // Your backend connection
import Button from '../../components/common/button';
import Input from '../../components/common/Input';

// --- STUDENT LOGIN FORM ---
const StudentForm = ({ onSubmit, loading }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="animate-fade-in-up w-full">
      <h1 className="text-3xl font-bold text-secondary">Student Sign In</h1>
      <p className="mt-2 text-gray-600">Please enter your credentials.</p>
      
      <form className="mt-8 space-y-6" onSubmit={(e) => onSubmit(e, credentials, 'student')}>
        <Input 
            label="Student Email / ID" 
            name="email" 
            value={credentials.email} 
            onChange={handleChange} 
            placeholder="Enter your student email" 
        />
        <Input 
            label="Password" 
            name="password" 
            type="password" 
            value={credentials.password} 
            onChange={handleChange} 
            placeholder="••••••••" 
        />
        <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <spam  className="text-sm font-semibold text-primary">
          Forgot Password? 
          [Check Email] or [Contact Admin].
        </spam>
      </div>
    </div>
  );
};

// --- TEACHER LOGIN FORM ---
const TeacherForm = ({ onSubmit, loading }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="animate-fade-in-up w-full">
      <h1 className="text-3xl font-bold text-secondary">Teacher Sign In</h1>
      <p className="mt-2 text-gray-600">Access your dashboard here.</p>
      
      <form className="mt-8 space-y-6" onSubmit={(e) => onSubmit(e, credentials, 'teacher')}>
        <Input 
            label="Teacher Email / ID" 
            name="email" 
            value={credentials.email} 
            onChange={handleChange} 
            placeholder="Enter your teacher email" 
        />
        <Input 
            label="Password" 
            name="password" 
            type="password" 
            value={credentials.password} 
            onChange={handleChange} 
            placeholder="••••••••" 
        />
        <Button type="submit" className="w-full py-3" disabled={loading}>
             {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center">
       <spam  className="text-sm font-semibold text-primary">
          Forgot Password? 
          [Check Email] or [Contact Admin].
        </spam>
      </div>
    </div>
  );
};


// --- MAIN DUAL LOGIN PAGE ---
const DualLoginPage = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('student');
  const [loading, setLoading] = useState(false);

  // STYLES (Kept exactly as requested)
  const panelBaseStyle = "w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out";
  const activeFormStyle = "bg-white";
  const inactivePanelStyle = "bg-gray-100 text-gray-800 text-center"; 

  // --- LOGIN LOGIC ---
  const handleLogin = async (e, credentials, role) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
        return toast.error("Please fill in all fields.");
    }

    setLoading(true);
    try {
        const res = await api.post('/auth/login', credentials);

        // Security Check: Ensure Student cannot login as Teacher
        if (res.data.role !== role) {
            toast.error(`Access Denied: You are not a ${role}. Please switch tabs.`);
            setLoading(false);
            return;
        }

        // 1. Save Token & User Info
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('name', res.data.name);

        toast.success(`Welcome back, ${res.data.name}!`);

        // 2. Redirect to Specific Dashboard
        if (res.data.role === 'student') {
            navigate('/studentdashboard');
        } else if (res.data.role === 'teacher') {
            navigate('/teacher/teacherdashboard');
        } else if (res.data.role === 'admin') {
            navigate('/admin/register');
        }

    } catch (error) {
        toast.error(error.response?.data?.msg || "Login Failed. Check credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-start bg-transparent px-4 pt-12 pb-8 md:justify-center md:pt-8">
      <Toaster position="top-center" />

      {/* --- Main content box --- */}
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
        
        {/* Student Panel */}
        <div className={`${panelBaseStyle} ${activePanel === 'student' ? activeFormStyle : inactivePanelStyle}`}>
          {activePanel === 'student' ? (
            <StudentForm onSubmit={handleLogin} loading={loading} />
          ) : (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold">Hello, Student!</h2>
              <p className="mt-4 px-6">Ready to start your learning journey? Log in here.</p>
              <Button onClick={() => setActivePanel('student')} className="mt-6">
                Student Login
              </Button>
            </div>
          )}
        </div>

        {/* Teacher Panel */}
        <div className={`${panelBaseStyle} ${activePanel === 'teacher' ? activeFormStyle : inactivePanelStyle}`}>
          {activePanel === 'teacher' ? (
            <TeacherForm onSubmit={handleLogin} loading={loading} />
          ) : (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold">Welcome, Teacher!</h2>
              <p className="mt-4 px-6">Log in to manage your classes and student records.</p>
              <Button onClick={() => setActivePanel('teacher')} className="mt-6">
                Teacher Login
              </Button>
            </div>
          )}
        </div>

      </div>

      <div className="mt-8 text-center">
        <p className="text-md text-gray-600">
          Don't have an account?{' '}
          <Link to="/enquiry" className="font-bold text-primary hover:underline">
            Enroll Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DualLoginPage;