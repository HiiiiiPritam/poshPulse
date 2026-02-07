import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 text-center">
      {/* Spinner */}
      <div className="flex space-x-2 mb-4">
        <div className="w-4 h-4 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-4 h-4 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>

      {/* Text */}
      <h1 className="text-xl md:text-2xl font-semibold">Loading, Please Wait...</h1>
      <p className="text-sm md:text-base mt-2 text-gray-600">Weaving heritage into fashion</p>
    </div>
  );
};

export default Loading;
