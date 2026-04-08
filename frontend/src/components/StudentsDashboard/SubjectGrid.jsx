import React from 'react';
import SubjectCard from './SubjectCard';

const SubjectGrid = ({ subjects = [], linkPrefix }) => { 
  if (!Array.isArray(subjects) || subjects.length === 0) {
      return (
          <div className="text-gray-500 italic py-10 text-center">
              No subjects available at the moment.
          </div>
      );
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="mb-6 text-2xl font-bold text-secondary">Select a Subject</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((subject, index) => (
          <SubjectCard
            key={index} 
            subjectName={subject.name} 
            linkPrefix={linkPrefix} 
          />
        ))}
      </div>
    </div>
  );
};

export default SubjectGrid;