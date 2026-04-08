import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Dropdown = ({ label, options, name, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="relative mt-1">
        <select 
          name={name}          // Added
          value={value}        // Added
          onChange={onChange}  // Added
          className="block w-full appearance-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-8 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="" disabled>Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <FiChevronDown />
        </div>
      </div>
    </div>
  );
};

export default Dropdown;