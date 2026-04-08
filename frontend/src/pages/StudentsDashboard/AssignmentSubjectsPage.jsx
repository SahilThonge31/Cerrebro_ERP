import React, { useEffect, useState } from 'react';
import api from '../../api';
import SubjectGrid from '../../components/StudentsDashboard/SubjectGrid';
import { FiFileText } from 'react-icons/fi';

const AssignmentSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/courses/subjects', { headers: { 'x-auth-token': token } });
        setSubjects(res.data);
      } catch (error) { console.error(error); }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-6 md:p-12">
        <div className="mx-auto max-w-6xl animate-fade-in-up">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-800 mb-2">
                <span className="rounded-xl bg-yellow-100 p-2 text-yellow-600"><FiFileText /></span>
                Assignments
            </h1>
            <p className="text-gray-500 mb-8">Select a subject to view pending and past assignments.</p>
            <hr className="mb-8 border-gray-200" />
            
            {/* THIS IS THE MAGIC: We send users to /student/assignments/... */}
            <SubjectGrid subjects={subjects} linkPrefix="/student/assignments" />
        </div>
    </div>
  );
};

export default AssignmentSubjectsPage;