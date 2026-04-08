import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';

// ==========================================
// 1. EAGER LOADS (Critical Path)
// ==========================================
// We keep the Landing Page and Auth pages imported normally so the initial
// screen the user sees loads instantly without any loading spinners.
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import DualLoginPage from './pages/auth/DualLoginPage.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import StudentAskAI from './pages/StudentsDashboard/StudentAskAI.jsx';

// ==========================================
// 2. LAZY LOADS (Code Splitting)
// ==========================================
// These chunks are only downloaded when the user requests the route.

// --- Auth & Admin Public ---
const AdminRegister = lazy(() => import('./pages/auth/AdminRegister.jsx'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin.jsx'));
const EnquiryPage = lazy(() => import('./pages/auth/EnquiryPage.jsx'));

// --- Student Pages ---
const StudentDashboardPage = lazy(() => import('./pages/StudentsDashboard/StudentDashboardPage.jsx'));
const CoursesPage = lazy(() => import('./pages/StudentsDashboard/CoursesPage.jsx'));
const SubjectDetailPage = lazy(() => import('./pages/StudentsDashboard/SubjectDetailPage.jsx'));
const StudentAssignments = lazy(() => import('./pages/StudentsDashboard/StudentAssignments.jsx'));
const CalendarPage = lazy(() => import('./pages/StudentsDashboard/CalendarPage.jsx'));
const TimeTablePage = lazy(() => import('./pages/StudentsDashboard/TimeTablePage.jsx'));
const GalleryPage = lazy(() => import('./pages/StudentsDashboard/GalleryPage.jsx'));
const GalleryAlbumPage = lazy(() => import('./pages/StudentsDashboard/GalleryAlbumPage.jsx'));
const SupportPage = lazy(() => import('./pages/StudentsDashboard/SupportPage.jsx'));
const ProfilePage = lazy(() => import('./pages/StudentsDashboard/ProfilePage.jsx'));
const TestSeriesPage = lazy(() => import('./pages/StudentsDashboard/TestSeriesPage.jsx'));
const ResultsPage = lazy(() => import('./pages/StudentsDashboard/ResultsPage.jsx'));
const StudentFeesPage = lazy(() => import('./pages/StudentsDashboard/StudentFeesPage.jsx'));
const StudentReportPage = lazy(() => import('./pages/StudentsDashboard/StudentReportPage.jsx'));
const StudentAttendancePage = lazy(() => import('./pages/StudentsDashboard/StudentAttendancePage.jsx'));
const StudentChatPage = lazy(() => import('./pages/StudentsDashboard/StudentChatPage.jsx'));
const StudentSettingsPage = lazy(() => import('./pages/StudentsDashboard/StudentSettingsPage.jsx'));
const NotificationPage = lazy(() => import('./components/common/NotificationPage.jsx'));

// --- Teacher Pages ---
const TeacherDashboard = lazy(() => import('./pages/Teacher/TeacherDashboardPage.jsx'));

// --- Admin Pages ---
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard.jsx'));
const AdminAdsPage = lazy(() => import('./pages/Admin/AdminAdsPage.jsx'));
const AdminStudentsPage = lazy(() => import('./pages/Admin/AdminStudentsPage.jsx'));
const AdminTeachersPage = lazy(() => import('./pages/Admin/AdminTeachersPage.jsx'));
const AdminAcademicPage = lazy(() => import('./pages/Admin/AdminAcademicPage.jsx'));
const AdminSubjectView = lazy(() => import('./pages/Admin/AdminSubjectView.jsx'));
const AdminFinancePage = lazy(() => import('./pages/Admin/AdminFinancePage.jsx'));
const AdminReportPage = lazy(() => import('./pages/Admin/AdminReportPage.jsx'));
const AdminAddStudentPage = lazy(() => import('./pages/Admin/AdminAddStudentPage.jsx'));
const AdminAddTeacherPage = lazy(() => import('./pages/Admin/AdminAddTeacherPage.jsx'));
const AdminTimetablePage = lazy(() => import('./pages/Admin/AdminTimetablePage.jsx'));
const AdminGalleryPage = lazy(() => import('./pages/Admin/AdminGalleryPage.jsx'));
const AdminAttendancePage = lazy(() => import('./pages/Admin/AdminAttendancePage.jsx'));
const AdminExamPage = lazy(() => import('./pages/Admin/AdminExamPage.jsx'));
const AdminNoticePage = lazy(() => import('./pages/Admin/AdminNoticePage.jsx'));
const AdminSettingsPage = lazy(() => import('./pages/Admin/AdminSettingsPage.jsx'));
const AdminLeavePage = lazy(() => import('./pages/Admin/AdminLeavePage.jsx'));
const AdminChatPage = lazy(() => import('./pages/Admin/AdminChatPage.jsx'));
const ManageAchievers = lazy(() => import('./pages/Admin/ManageAchievers.jsx'));

// ==========================================
// PROTECTED ROUTE COMPONENT (The Shield)
// ==========================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
     if (role === 'student') return <Navigate to="/studentdashboard" replace />;
     if (role === 'teacher') return <Navigate to="/teacher/teacherdashboard" replace />;
     if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
     return <Navigate to="/login" replace />;
  }

  return children;
};

// ==========================================
// REUSABLE FALLBACK LOADER
// ==========================================
// This shows while the lazy-loaded chunk is downloading over the network
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
     <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#6FCB6C]"></div>
  </div>
);

// ==========================================
// MAIN APP COMPONENT & ROUTING
// ==========================================
function App() {
  return (
    // Suspense wraps all routes. It intercepts any lazy component that isn't ready
    // and displays the fallback UI until the JS chunk finishes downloading.
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        
        <Route path="/student/ask-ai" element={<StudentAskAI />} />
        {/* -------------------------------------------
            1. PUBLIC ROUTES
        ------------------------------------------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<DualLoginPage />} />
        <Route path="/enquiry" element={<EnquiryPage />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* -------------------------------------------
            2. STUDENT ROUTES (Wrapped in Main Layout)
        ------------------------------------------- */}
        <Route element={<Layout />}>
        
          <Route path="/studentdashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboardPage /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><ProfilePage /></ProtectedRoute>} />
          
          <Route path="/courses" element={<ProtectedRoute allowedRoles={['student']}><CoursesPage /></ProtectedRoute>} />
          <Route path="/student/courses/:subjectName" element={<ProtectedRoute allowedRoles={['student']}><SubjectDetailPage /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignments /></ProtectedRoute>} />
          
          <Route path="/calendar" element={<ProtectedRoute allowedRoles={['student']}><CalendarPage /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute allowedRoles={['student']}><StudentFeesPage /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRoles={['student']}><TimeTablePage /></ProtectedRoute>} />
          <Route path="/gallery" element={<ProtectedRoute allowedRoles={['student']}><GalleryPage /></ProtectedRoute>} />
          <Route path="/student/gallery/:id" element={<ProtectedRoute allowedRoles={['student']}><GalleryAlbumPage /></ProtectedRoute>} />
          
          <Route path="/studentdashboard/tests" element={<ProtectedRoute allowedRoles={['student']}><TestSeriesPage /></ProtectedRoute>} />
          <Route path="/studentdashboard/results" element={<ProtectedRoute allowedRoles={['student']}><ResultsPage /></ProtectedRoute>} />
          <Route path="/student/report" element={<ProtectedRoute allowedRoles={['student']}><StudentReportPage /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendancePage /></ProtectedRoute>} />
          
          <Route path="/support" element={<ProtectedRoute allowedRoles={['student']}><SupportPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><StudentSettingsPage /></ProtectedRoute>} />
        </Route>

        <Route path="/student/chat" element={<ProtectedRoute allowedRoles={['student']}><StudentChatPage /></ProtectedRoute>} />

        {/* -------------------------------------------
            3. TEACHER ROUTES
        ------------------------------------------- */}
        <Route path="/teacher/teacherdashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/settings" element={<ProtectedRoute allowedRoles={['teacher']}><AdminSettingsPage /></ProtectedRoute>} />

        {/* -------------------------------------------
            4. ADMIN ROUTES
        ------------------------------------------- */}
        <Route path="/add" element={<ProtectedRoute allowedRoles={['admin']}><AdminRegister /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentsPage /></ProtectedRoute>} />
        <Route path="/admin/add-student" element={<ProtectedRoute allowedRoles={['admin']}><AdminAddStudentPage /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeachersPage /></ProtectedRoute>} />
        <Route path="/admin/add-teacher" element={<ProtectedRoute allowedRoles={['admin']}><AdminAddTeacherPage /></ProtectedRoute>} />
        
        <Route path="/admin/academic" element={<ProtectedRoute allowedRoles={['admin']}><AdminAcademicPage /></ProtectedRoute>} />
        <Route path="/admin/academic/view/:board/:className/:subject" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubjectView /></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['admin']}><AdminTimetablePage /></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['admin']}><AdminExamPage /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendancePage /></ProtectedRoute>} />
        <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['admin']}><AdminLeavePage /></ProtectedRoute>} />
        
        <Route path="/admin/ads" element={<ProtectedRoute allowedRoles={['admin']}><AdminAdsPage /></ProtectedRoute>} />
        <Route path="/admin/notices" element={<ProtectedRoute allowedRoles={['admin']}><AdminNoticePage /></ProtectedRoute>} />
        <Route path="/admin/gallery" element={<ProtectedRoute allowedRoles={['admin']}><AdminGalleryPage /></ProtectedRoute>} />
        <Route path="/admin/achievers" element={<ProtectedRoute allowedRoles={['admin']}><ManageAchievers /></ProtectedRoute>} />
        
        <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['admin']}><AdminFinancePage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReportPage /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute allowedRoles={['admin']}><AdminChatPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
}

export default App;