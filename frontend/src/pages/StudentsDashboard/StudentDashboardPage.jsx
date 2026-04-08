import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import DashboardHeader from '../../components/StudentsDashboard/DashboardHeader'; // Import the new Header
import AttendanceCard from '../../components/StudentsDashboard/AttendanceCard';
import QuickLinks from '../../components/StudentsDashboard/QuickLinks';
import AdvertisementSlider from '../../components/StudentsDashboard/AdvertisementSlider';
import api from '../../api'; // Your API connection
import HighlightsSection from '../../components/StudentsDashboard/HighlightsSection';
import FloatingChatWidget from '../../components/StudentsDashboard/FloatingChatWidget';

const StudentDashboardPage = () => {
  // State to hold the full user profile from DB
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch full details (Name, Board, Std) from the new /me endpoint
        const token = localStorage.getItem('token');
        if(!token) return;

        // Add token to headers for this request
        const res = await api.get('/auth/me', {
            headers: { 'x-auth-token': token } 
        });
        
        setUserProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-5">

      <main className="mx-auto max-w-md px-4  sm:max-w-2xl md:max-w-4xl lg:max-w-6xl">
        
        {/* 1. PASS LIVE DATA TO HEADER */}
        {loading ? (
             // Simple Loading Skeleton
             <div className="h-32 w-full animate-pulse rounded-xl bg-gray-200"></div>
        ) : (
            <DashboardHeader user={userProfile} />
        )}

        {/* 2. Advertisement Slider */}
        <div className="mt-6">
            <AdvertisementSlider />
        </div>


        {/* 4. Attendance Section */}
        <AttendanceCard />

        {/* 5. Quick Links */}
        <QuickLinks />

        <HighlightsSection/>

        <FloatingChatWidget />

      </main>
    </div>
  );
};

export default StudentDashboardPage;