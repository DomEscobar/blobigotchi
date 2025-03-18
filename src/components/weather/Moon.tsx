import React from 'react';

const Moon: React.FC = () => {
  return (
    <div className="absolute right-10 top-10 w-12 h-12 rounded-full bg-gray-100 transform transition-all duration-[60000ms]"
      style={{ boxShadow: '0 0 20px 10px rgba(226, 232, 240, 0.3)' }}>
      {/* Moon craters */}
      <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-gray-300 opacity-70"></div>
      <div className="absolute top-7 left-4 w-3 h-3 rounded-full bg-gray-300 opacity-60"></div>
      <div className="absolute top-4 right-2 w-2.5 h-2.5 rounded-full bg-gray-300 opacity-60"></div>
      
      {/* Create the moon's shadow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-transparent to-gray-800/40"></div>
    </div>
  );
};

export default Moon; 