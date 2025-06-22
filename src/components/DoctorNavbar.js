import React from 'react';

const DoctorNavbar = ({ user, onProfileClick, onAppointmentsClick, onPrescriptionsClick, onFeedbackClick }) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-gray-900">MediTrack</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onAppointmentsClick}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span>📅</span>
              <span className="hidden sm:inline">All Appointments</span>
            </button>
            <button
              onClick={onPrescriptionsClick}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span>📋</span>
              <span className="hidden sm:inline">Prescriptions</span>
            </button>
            <button
              onClick={onFeedbackClick}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span>💬</span>
              <span className="hidden sm:inline">Feedback</span>
            </button>
            <button
              onClick={onProfileClick}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <span>👤</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;