import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorNavbar from './DoctorNavbar';
import Appointments from './Appointments';
import Feedback from './Feedback';
import DoctorProfile from './DoctorProfile';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptionDetails, setPrescriptionDetails] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    newAppointments: 0,
    inProgress: 0,
    completedToday: 0
  });
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const doctorResponse = await axios.get(`http://localhost:5000/api/auth/doctors?userId=${user.id}`);
        const doctor = doctorResponse.data[0];
        if (!doctor) {
          setError('Doctor record not found');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/auth/appointments/doctor/${doctor._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAppointments(response.data);
        
        const today = new Date().toDateString();
        const stats = {
          newAppointments: response.data.filter(appt => appt.status === 'pending').length,
          inProgress: response.data.filter(appt => appt.status === 'in-progress').length,
          completedToday: response.data.filter(appt => 
            appt.status === 'confirmed' && 
            new Date(appt.date).toDateString() === today
          ).length
        };
        setDashboardStats(stats);
      } catch (err) {
        setError('Failed to fetch appointments');
      }
    };
    fetchAppointments();
  }, [user]);

  const handlePrescriptionChange = (appointmentId, value) => {
    setPrescriptionDetails({ ...prescriptionDetails, [appointmentId]: value });
  };

  const handleAddPrescription = async (appointmentId, patientId, doctorId) => {
    const details = prescriptionDetails[appointmentId];
    if (!details) {
      setError('Please enter prescription details');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/prescriptions', {
        appointmentId,
        patientId,
        doctorId,
        details,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(response.data.message);
      setPrescriptionDetails({ ...prescriptionDetails, [appointmentId]: '' });
      
      const doctorResponse = await axios.get(`http://localhost:5000/api/auth/doctors?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const doctor = doctorResponse.data[0];
      const updatedAppointments = await axios.get(`http://localhost:5000/api/auth/appointments/doctor/${doctor._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(updatedAppointments.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add prescription');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorNavbar
          user={user}
          onAppointmentsClick={() => setView('appointments')}
          onPrescriptionsClick={() => setView('prescriptions')}
          onFeedbackClick={() => setView('feedback')}
          onProfileClick={() => setView('profile')}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome, Dr. {user.name}
            </h1>
            <div className="max-w-2xl mx-auto">
              <blockquote className="text-lg text-gray-600 italic bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                "The good physician treats the disease; the great physician treats the patient. - William Osler"
              </blockquote>
            </div>
          </div>

          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Appointments</h3>
              <p className="text-gray-600 mb-6">
                Manage your patient appointments, accept new requests, and track progress.
              </p>
              <button
                onClick={() => setView('appointments')}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                View All Appointments
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Patient Feedback</h3>
              <p className="text-gray-600 mb-6">
                Review feedback from your patients and improve your care quality.
              </p>
              <button
                onClick={() => setView('feedback')}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                View Feedback
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-blue-500 mb-2">{dashboardStats.newAppointments}</div>
              <div className="text-gray-600 font-medium">New Appointments</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-orange-500 mb-2">{dashboardStats.inProgress}</div>
              <div className="text-gray-600 font-medium">In Progress</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-green-500 mb-2">{dashboardStats.completedToday}</div>
              <div className="text-gray-600 font-medium">Completed Today</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'appointments') {
    return <Appointments appointments={appointments} prescriptionDetails={prescriptionDetails} onPrescriptionChange={handlePrescriptionChange} onAddPrescription={handleAddPrescription} setView={setView} />;
  }

  if (view === 'feedback') {
    return <Feedback setView={setView} />;
  }

  if (view === 'profile') {
    return <DoctorProfile user={user} setUser={setUser} setView={setView} />;
  }

  return null;
};

export default DoctorDashboard;