import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  // Added 'active:' classes to match the 'hover:' effects for mobile tap feedback.
  const unifiedStyle =
    'bg-transparent text-[#6FCB6C] border-2 border-[#6FCB6C] hover:bg-[#6FCB6C] hover:text-white active:bg-[#6FCB6C] active:text-white';
  
  // Also added 'active:' state to the transform effect.
  const baseStyles = 'rounded-full px-6 py-2 font-bold transition-all duration-300 transform hover:scale-105 active:scale-105';

  const combinedStyles = `${baseStyles} ${unifiedStyle} ${className}`;

  return (
    <button type={type} className={combinedStyles} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;