import React from 'react';
import DashboardCard from './DashboardCard';
import { FiBookOpen, FiClock, FiClipboard, FiAward } from 'react-icons/fi'; // Icons for the cards

const DashboardGrid = () => {
  const dashboardItems = [
    {
      icon: <FiBookOpen size={24} />,
      title: 'Courses',
      description: 'Access your subjects, notes, and study material.',
      link: '/studentdashboard/courses',
    },
    {
      icon: <FiClock size={24} />,
      title: 'Time Table',
      description: 'View your daily and weekly class schedule.',
      link: '/studentdashboard/timetable',
    },
    {
      icon: <FiClipboard size={24} />,
      title: 'Test Series',
      description: 'Check upcoming tests and practice mock papers.',
      link: '/studentdashboard/tests',
    },
    {
      icon: <FiAward size={24} />,
      title: 'Results',
      description: 'View your recent grades and performance reports.',
      link: '/studentdashboard/results',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {dashboardItems.map((item) => (
        <DashboardCard
          key={item.title}
          icon={item.icon}
          title={item.title}
          description={item.description}
          linkTo={item.link}
        />
      ))}
    </div>
  );
};

export default DashboardGrid;