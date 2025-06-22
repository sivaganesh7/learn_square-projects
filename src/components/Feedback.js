import React from 'react';

const Feedback = ({ setView }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => setView('dashboard')}
              className="mr-4 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Patient Feedback</h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Feedback</h3>
          <p className="text-gray-600">This section is ready for your feedback design implementation!</p>
        </div>
      </main>
    </div>
  );
};

export default Feedback;