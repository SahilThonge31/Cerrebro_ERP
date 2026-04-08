import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi'; 
import api from '../../api';

const VerifyInput = ({ 
    label, 
    placeholder, 
    name, 
    value, 
    onChange, 
    type = "text", 
    verifyEndpoint, 
    checkEndpoint   
}) => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // --- VALIDATION LOGIC ---
  const validateInput = () => {
    // 1. Check if empty
    if (!value) {
      toast.error(`${label} is required!`);
      return false;
    }

    // 2. Validate Email
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        toast.error("Please enter a valid Email Address!");
        return false;
      }
    }

    // 3. Validate Mobile Number (Indian Format: 10 Digits)
    if (name === 'contact') {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        toast.error("Mobile number must be exactly 10 digits!");
        return false;
      }
    }

    return true;
  };

  // 1. Send OTP Logic
  const handleSendOtp = async () => {
    if (!validateInput()) return; // Stop if validation fails

    setLoading(true);
    try {
      await api.post(verifyEndpoint, { [name]: value });
      toast.success(`OTP Sent to ${value}`);
      setIsOtpSent(true);
      setShowOtpInput(true);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to send OTP");
    }
    setLoading(false);
  };

  // 2. Check OTP Logic
  const handleVerifyCode = async () => {
    if (!otpValue) return toast.error("Please enter the code");
    
    try {
      await api.post(checkEndpoint, { 
        [name]: value, 
        otp: otpValue 
      });
      
      toast.success(`${label} Verified Successfully!`);
      setIsVerified(true);
      
      // Update parent state with the verified OTP
      onChange({ target: { name: `${name}Otp`, value: otpValue } });

    } catch (error) {
      toast.error("Incorrect OTP. Please try again.");
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} 
        {isVerified && <span className="ml-2 text-green-600 flex items-center inline-flex"><FiCheckCircle className="mr-1"/> Verified</span>}
      </label>
      
      {/* Main Input */}
      <div className="flex gap-2">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isOtpSent} 
          className={`flex-1 rounded-lg border-2 px-4 py-3 outline-none transition ${isVerified ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
        />
        
        {!isOtpSent && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Verify"}
          </button>
        )}
      </div>

      {/* OTP Input Area */}
      {showOtpInput && !isVerified && (
        <div className="mt-3 flex items-center gap-2 animate-fade-in-down">
          <input
            placeholder="Enter Code"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value)}
            className="w-32 rounded border-2 border-blue-300 px-3 py-2 outline-none text-center font-bold tracking-widest"
          />
          
          <button
            type="button"
            onClick={handleVerifyCode}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 text-sm"
          >
            Confirm OTP
          </button>
          
          <span className="text-xs text-gray-500">Check {name === 'email' ? 'Inbox' : 'Console'}</span>
        </div>
      )}
    </div>
  );
};

export default VerifyInput;