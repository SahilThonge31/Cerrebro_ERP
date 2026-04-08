import React from 'react';

const Textarea = ({ label, placeholder }) => {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <textarea
        placeholder={placeholder}
        rows="4"
        className="mt-1 block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      ></textarea>
    </div>
  );
};

export default Textarea;