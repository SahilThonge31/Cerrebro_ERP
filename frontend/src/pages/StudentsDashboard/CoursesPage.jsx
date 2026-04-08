import React, { useEffect, useState } from 'react';
import { FiBookOpen, FiLayers } from 'react-icons/fi';
import api from '../../api'; // Your backend connection
import SubjectGrid from '../../components/StudentsDashboard/SubjectGrid';

const CoursesPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({ standard: '', board: '' });

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
           console.error("No token found");
           setLoading(false);
           return;
        }

        // 1. Get Student Info 
        const { data: user } = await api.get('/auth/me', { headers: { 'x-auth-token': token } });
        
        // --- THE FIX IS HERE ---
        // OLD: user.studentDetails?.standard
        // NEW: user.standard (Data is now at the root)
        
        const standard = user.standard || '10th'; 
        const board = user.board || 'SSC';
        
        console.log(`🎓 Student Identified: ${standard} - ${board}`); // Debug Log

        setStudentInfo({ standard, board });

        // 2. Fetch Academic Structure for this SPECIFIC Board
        const res = await api.get(`/academic?board=${board}`, {
            headers: { 'x-auth-token': token } 
        });

        // 3. Find the specific class curriculum
        const myClass = res.data.find(a => a.className === standard);
        
        if (myClass) {
            setSubjects(myClass.subjects);
        } else {
            setSubjects([]);
        }

      } catch (error) {
        console.error("Failed to load curriculum", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, []);

  // --- Sub-Component: Loading Skeleton ---
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-64 w-full animate-pulse rounded-2xl bg-gray-200"></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. Professional Header Section */}
      <div className="bg-white px-6 py-10 shadow-sm md:px-12 border-b border-gray-100">
        <div className="mx-auto max-w-6xl">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-800 md:text-4xl">
            <span className="rounded-xl bg-blue-100 p-2 text-primary">
              <FiLayers /> 
            </span>
            My Learning Path
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-500">
            Current Session: <span className="font-bold text-primary">{studentInfo.standard} • {studentInfo.board} Board</span>
            <br/>
            Select a subject below to view study materials uploaded by your teachers.
          </p>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 pt-10">
        
        {loading ? (
          <SkeletonGrid />
        ) : subjects.length > 0 ? (
          <div className="animate-fade-in-up">
            {/* Pass subjects and the link prefix for the detail page */}
            <SubjectGrid subjects={subjects} linkPrefix="/student/courses" />
          </div>
        ) : (
          // 3. Professional Empty State
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 text-center shadow-sm border border-dashed border-gray-300">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-400">
              <FiBookOpen size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">No Subjects Assigned</h3>
            <p className="mt-2 max-w-md text-gray-500">
              Your curriculum for {studentInfo.standard} ({studentInfo.board}) hasn't been set up yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;