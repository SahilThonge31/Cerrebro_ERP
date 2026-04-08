import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({ label, placeholder, type = 'text', isOptional = false, name, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700">
        {label}
        {isOptional && <span className="ml-1 font-normal text-gray-500">(Optional)</span>}
      </label>
      <div className="relative mt-1">
        <input
          name={name}          // Added
          value={value}        // Added
          onChange={onChange}  // Added
          type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-primary"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;