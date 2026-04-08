import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import api from '../../api';

// --- COMPONENTS ---
import TeacherSidebar from '../../components/Teacher/TeacherSidebar';
import TeacherHeader from '../../components/Teacher/TeacherHeader'; 
import AdvertisementSlider from '../../components/StudentsDashboard/AdvertisementSlider';

// --- FEATURES ---
import TeacherHome from '../../components/Teacher/TeacherHome';
import TeacherProfile from '../../components/Teacher/TeacherProfile';
import TeacherAttendance from '../../components/Teacher/TeacherAttendance';
import ClassStudentList from '../../components/Teacher/ClassStudentList'; 
import TeacherStudyMaterial from '../../components/Teacher/TeacherStudyMaterial';
import TeacherAssignments from '../../components/Teacher/TeacherAssignments';
import TeacherSchedule from '../../components/Teacher/TeacherSchedule';
import TeacherMarksEntry from '../../components/Teacher/TeacherMarksEntry';
import TeacherNotices from '../../components/Teacher/TeacherNotices';
import TeacherLeaves from '../../components/Teacher/TeacherLeaves';
import TeacherSettings from '../../components/Teacher/TeacherSettings';
import TeacherChat from '../../components/Teacher/TeacherChat';

const TeacherDashboard = () => {
  // --- 1. STATE MANAGEMENT ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Fixed: Correct state name
  const [loading, setLoading] = useState(true);
  
  // Dashboard Data
  const [dashboardData, setDashboardData] = useState(null);
  
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState('dashboard'); // Current View
  const [selectedClass, setSelectedClass] = useState('all'); // Global Class Filter

  // --- 2. FETCH DASHBOARD DATA ---
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/faculty/dashboard', { headers: { 'x-auth-token': token } });
        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // --- 3. HELPER FUNCTIONS ---
  
  // Toggle Mobile Sidebar (Fixed Reference Error)
  const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle Class Switcher from Header
  const handleClassChange = (newClass) => {
      setSelectedClass(newClass);
  };

  // --- 4. CONTENT RENDERER ---
  const renderContent = () => {
      switch(activeTab) {
          
          // A. HOME DASHBOARD
          case 'dashboard':
              return (
                  <div className="animate-fade-in-up space-y-8">
                    {/* Advertisement Section */}
                    <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <AdvertisementSlider />
                    </div>

                    {/* Dynamic Widgets & Quick Actions */}
                    <TeacherHome 
                        setTab={setActiveTab} 
                        selectedClass={selectedClass} 
                        teacherData={dashboardData} 
                    />
                  </div> 
              );

          // B. CORE ACADEMICS
          case 'attendance':
              return (
                  <TeacherAttendance 
                      selectedClass={selectedClass} 
                      teacherData={dashboardData} 
                  />
              );

          case 'students':
              return (
                  <ClassStudentList selectedClass={selectedClass} />
              );

          case 'schedule':
              return (
                  <TeacherSchedule selectedClass={selectedClass} teacherData={dashboardData} />
              );
            
          case 'assignments':
              return (
                  <TeacherAssignments selectedClass={selectedClass} teacherData={dashboardData} />
              );

          case 'marks':
              return (
                  <TeacherMarksEntry selectedClass={selectedClass} teacherData={dashboardData} />
              );
            
          case 'material':
    return (
        <TeacherStudyMaterial 
            teacherData={dashboardData} 
            selectedClass={selectedClass} // 👈 ADD THIS LINE
        />
    );

          // C. COMMUNICATION & TOOLS
          case 'notices':
              return (
                  <TeacherNotices selectedClass={selectedClass} teacherData={dashboardData} />
              );

          case 'chat':
              return (
                  <TeacherChat teacherData={dashboardData} />
              );

          case 'leaves':
              return ( 
                  <TeacherLeaves />
              );

          // D. PERSONAL
          case 'profile':
              return (
                  <TeacherProfile />
              );

          case 'settings':
              return (
                  <TeacherSettings />
              );

              

          default:
              return null;
      }
  };

  // --- 5. MAIN RENDER ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-800">
      <Toaster position="top-right" />
      
      {/* SIDEBAR NAVIGATION */}
      <TeacherSidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar}
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 transition-all w-full flex flex-col">
        
        {/* TOP HEADER */}
        <TeacherHeader 
            teacher={dashboardData} 
            toggleSidebar={toggleSidebar} // Passing the corrected function
            selectedClass={selectedClass}
            onClassChange={handleClassChange}
            onProfileClick={() => setActiveTab('profile')} 
        />

        {/* DYNAMIC PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {loading ? (
                <div className="flex justify-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : (
                renderContent()
            )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;