import React, { useState, useMemo } from 'react';
import TestCard from '../../components/StudentsDashboard/TestCard';

// --- Sample Data ---
// In a real app, this would come from an API
const allTests = [
  { id: 1, title: 'Mid-Term Examination', subject: 'Mathematics', date: '15 Aug 2025', duration: '3 hours', marks: 100, status: 'Upcoming' },
  { id: 2, title: 'Chapter 1: Real Numbers', subject: 'Mathematics', date: '01 Aug 2025', duration: '1 hour', marks: 25, status: 'Upcoming' },
  { id: 3, title: 'Quarterly Examination', subject: 'Science', date: '10 July 2025', duration: '2 hours', marks: 50, status: 'Completed' },
  { id: 4, title: 'Practice Paper - Set A', subject: 'English', date: 'Practice Anytime', duration: '1.5 hours', marks: 40, status: 'Practice' },
  { id: 5, title: 'Practice Paper - Set B', subject: 'English', date: 'Practice Anytime', duration: '1.5 hours', marks: 40, status: 'Practice' },
];

const TestSeriesPage = () => {
  const tabs = ['Upcoming', 'Completed', 'Practice'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Filter tests based on the active tab
  const filteredTests = useMemo(() => {
    return allTests.filter(test => test.status === activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <h1 className="text-4xl font-bold text-secondary">Test Series</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-md font-medium transition-colors
                ${activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`
              }
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTests.length > 0 ? (
          filteredTests.map((test) => <TestCard key={test.id} test={test} />)
        ) : (
          <p className="col-span-full py-8 text-center text-gray-500">
            No tests found in this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default TestSeriesPage;