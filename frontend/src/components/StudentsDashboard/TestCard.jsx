import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiCheckCircle, FiEdit3 } from 'react-icons/fi';
import Button from '../common/button'; // Using your reusable Button

const TestCard = ({ test }) => {
  const { title, subject, date, duration, marks, status } = test;

  // Determine button text and icon based on test status
  const getAction = () => { 
    switch (status) {
      case 'Upcoming':
        return { text: 'View Syllabus', icon: <FiEdit3 /> };
      case 'Completed':
        return { text: 'View Results', icon: <FiCheckCircle /> };
      case 'Practice':
        return { text: 'Start Test', icon: <FiEdit3 /> };
      default:
        return { text: 'View Details', icon: <FiEdit3 /> };
    }
  };

  const action = getAction();

  return (
    <div
      className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300
                 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#6FCB6C]/40
                 active:-translate-y-2 active:shadow-2xl active:shadow-[#6FCB6C]/40"
    >
      {/* Test Title and Subject */}
      <div>
        <p className="font-semibold text-primary">{subject}</p>
        <h3 className="mt-1 text-xl font-bold text-secondary">{title}</h3>
      </div>

      {/* Test Details */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <FiCalendar />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span>{marks} Marks</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <Button className="w-full">
          <span className="flex items-center justify-center gap-2">
            {action.icon}
            {action.text}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default TestCard;    