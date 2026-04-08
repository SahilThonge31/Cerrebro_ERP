import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiAward, FiUsers, FiPercent, FiBarChart2, FiMessageSquare, FiDownload } from 'react-icons/fi';
import Button from '../../components/common/button';

// --- Sample Data ---
const resultsData = [
  {
    id: 'test1', title: 'Unit Test 1', date: 'June 2025', score: 75, totalMarks: 100, rank: 10, totalStudents: 45, resultPdf: '#',
    breakdown: [{ subject: 'Math', score: 40 }, { subject: 'Science', score: 35 }],
    remarks: 'Good effort in Science. Focus more on algebraic concepts in Math.',
  },
  {
    id: 'test2', title: 'Quarterly Examination', date: 'July 2025', score: 82, totalMarks: 100, rank: 7, totalStudents: 45, resultPdf: '#',
    breakdown: [{ subject: 'Math', score: 42 }, { subject: 'Science', score: 40 }],
    remarks: 'Excellent improvement overall. Keep up the consistent hard work.',
  },  
  {
    id: 'test3', title: 'Mid-Term Examination', date: 'Aug 2025', score: 88, totalMarks: 100, rank: 5, totalStudents: 45, resultPdf: '#',
    breakdown: [{ subject: 'Math', score: 45 }, { subject: 'Science', score: 43 }],
    remarks: 'Top performance in the class. Very well done.',
  },
];

const ResultsPage = () => {
  const [selectedTestId, setSelectedTestId] = useState(resultsData[resultsData.length - 1].id);

  const selectedTest = useMemo(() => resultsData.find(r => r.id === selectedTestId), [selectedTestId]);
  const chartData = resultsData.map(r => ({ name: r.date, Performance: (r.score / r.totalMarks) * 100 }));

  // --- CHANGE 3: Updated hover effect color ---
  const cardHoverEffect = "transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6FCB6C]/40 active:-translate-y-2 active:shadow-2xl active:shadow-[#6FCB6C]/40";

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header and Actions */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-4xl font-bold text-secondary">Your Results</h1>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-300 p-2.5 font-semibold sm:w-auto"
          >
            {resultsData.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <a href={selectedTest?.resultPdf || '#'} download>
            <Button className="w-full py-2.5">
              <span className="flex items-center justify-center gap-2"><FiDownload/> Download PDF</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      {selectedTest && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className={`rounded-xl bg-white p-6 text-center shadow-lg ${cardHoverEffect}`}>
            <FiAward className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-2 text-lg font-semibold text-gray-500">Score</h3>
            <p className="text-5xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              {selectedTest.score}<span className="text-3xl text-gray-400">/{selectedTest.totalMarks}</span>
            </p>
          </div>
          <div className={`rounded-xl bg-white p-6 text-center shadow-lg ${cardHoverEffect}`}>
            <FiUsers className="mx-auto h-8 w-8 text-secondary" />
            <h3 className="mt-2 text-lg font-semibold text-gray-500">Class Rank</h3>
            <p className="text-5xl font-bold text-secondary">
              {selectedTest.rank}<span className="text-3xl text-gray-400">/{selectedTest.totalStudents}</span>
            </p>
          </div>
          <div className={`rounded-xl bg-white p-6 text-center shadow-lg ${cardHoverEffect}`}>
            <FiPercent className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-2 text-lg font-semibold text-gray-500">Percentage</h3>
            <p className="text-5xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              {((selectedTest.score / selectedTest.totalMarks) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Performance Graph */}
      <div className={`rounded-xl bg-white p-6 shadow-lg ${cardHoverEffect}`}>
        <h3 className="mb-4 text-2xl font-bold text-secondary flex items-center gap-2"><FiBarChart2/> Performance Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Performance" stroke="#6FCB6C" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* --- CHANGE 1 & 2: Score Breakdown and Remarks Cards Added --- */}
      {selectedTest && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`rounded-xl bg-white p-6 shadow-lg ${cardHoverEffect}`}>
                <h3 className="mb-4 text-2xl font-bold text-secondary flex items-center gap-2"><FiAward/> Score Breakdown</h3>
                <ul className="space-y-3">
                    {selectedTest.breakdown.map(item => (
                        <li key={item.subject} className="flex justify-between font-medium">
                            <span className="text-gray-600">{item.subject}</span>
                            <span className="font-bold text-gray-800">{item.score}</span>
                        </li>
                    ))}
                    <li className="flex justify-between border-t pt-3 font-bold">
                        <span className="text-secondary">Total Score</span>
                        <span className="text-primary">{selectedTest.score}</span>
                    </li>
                </ul>
            </div>
             <div className={`rounded-xl bg-white p-6 shadow-lg ${cardHoverEffect}`}>
                <h3 className="mb-4 text-2xl font-bold text-secondary flex items-center gap-2"><FiMessageSquare/> Teacher's Remarks</h3>
                <p className="text-gray-600 italic">"{selectedTest.remarks}"</p>
            </div>
        </div>
      )}

    </div>
  );
};

export default ResultsPage;