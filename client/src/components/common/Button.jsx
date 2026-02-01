import React from 'react';

const Button = ({ type = 'button', children, onClick, fullWidth = false, disabled = false, variant = 'primary' }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50";
  
  const variants = {
    primary: 'text-white bg-primary hover:bg-primary-hover focus:ring-primary',
    secondary: 'text-text bg-gray-200 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;