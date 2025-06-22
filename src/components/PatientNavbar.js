import React from 'react';

const PatientNavbar = () => {
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/';
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center ">
            <div className="bg-blue-500 text-white rounded-lg p-2 mr-3">
              <span className="font-bold text-lg">M</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">MediTrack</h1>
          </div>
          <nav className="flex space-x-8">
            <button 
              onClick={() => handleNavigation('/view-all-appointments')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Appointments
            </button>
            <button 
              onClick={() => handleNavigation('/view-prescriptions')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Prescriptions
            </button>
            <button 
              onClick={() => handleNavigation('/view-prescriptions')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Feedback
            </button>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default PatientNavbar;