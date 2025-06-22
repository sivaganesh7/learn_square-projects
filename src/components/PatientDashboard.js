import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Activity } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import PatientNavbar from '../components/PatientNavbar';
import Footer from './Footer';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const patientName = user.name || 'Patient';
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedVisits: 0,
    activePrescriptions: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const patientResponse = await axios.get(`${API_BASE_URL}/api/auth/patients?userId=${user.id}`);
        const patient = patientResponse.data[0];
        if (!patient) {
          setError('Patient record not found');
          return;
        }

        const appointmentsResponse = await axios.get(`${API_BASE_URL}/api/auth/appointments/patient/${patient._id}`);
        const appointments = appointmentsResponse.data;

        const currentDate = new Date();
        const upcomingAppointments = appointments.filter(
          (appt) =>
            (appt.status === 'pending' || appt.status === 'confirmed') &&
            new Date(appt.date) >= currentDate
        ).length;
        const completedVisits = appointments.filter((appt) => appt.status === 'completed').length;

        const prescriptionsResponse = await axios.get(`${API_BASE_URL}/api/auth/prescriptions/patient/${patient._id}`);
        const activePrescriptions = prescriptionsResponse.data.length;

        setStats({
          upcomingAppointments,
          completedVisits,
          activePrescriptions,
        });
      } catch (err) {
        setError('Failed to fetch dashboard stats');
      }
    };

    if (user.id) {
      fetchStats();
    }
  }, [user.id]);

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <PatientNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 glow-blue">
            <Activity className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold poppins text-blue-300 mb-2">
            Welcome, {patientName}! 👋
          </h2>
          <p className="text-gray-300 poppins">Welcome back to your health dashboard</p>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-blue-500 rounded-lg p-6 mb-8 glow-blue">
          <div className="flex items-center mb-2">
            <div className="bg-pink-600 rounded-full p-2 mr-3">
              <span className="text-white">💗</span>
            </div>
            <h3 className="text-sm font-semibold poppins text-gray-300 uppercase tracking-wide">
              Daily Wellness Tip
            </h3>
          </div>
          <p className="text-gray-200 italic poppins">
            "Your health is your greatest wealth. Take care of yourself today."
          </p>
        </div>

        <div className="bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-lg p-4 mb-8 glow-yellow">
          <p className="text-center text-yellow-300 font-medium poppins">
            Only patient can book appointment daily 2 only
          </p>
        </div>

        {error && <p className="text-red-400 text-center poppins mb-6">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => handleNavigation('/book-appointment')}
            className="bg-blue-600 text-white rounded-lg p-8 text-center hover:bg-blue-700 transition-all duration-300 cursor-pointer transform hover:scale-105 glow-blue"
          >
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold poppins mb-2">Book an Appointment</h3>
            <p className="text-gray-200 poppins">
              Schedule a visit with our healthcare professionals
            </p>
          </div>

          <div
            onClick={() => handleNavigation('/view-all-appointments')}
            className="bg-teal-600 text-white rounded-lg p-8 text-center hover:bg-teal-700 transition-all duration-300 cursor-pointer transform hover:scale-105 glow-teal"
          >
            <Eye className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold poppins mb-2">View All Appointments</h3>
            <p className="text-gray-200 poppins">
              Check your upcoming and past appointments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div
            onClick={() => handleNavigation('/patient-appointments')}
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-sm p-6 text-center border border-blue-500 cursor-pointer hover:bg-opacity-20 transition-all duration-300 glow-blue"
          >
            <div className="text-3xl font-bold poppins text-blue-300 mb-2">{stats.upcomingAppointments}</div>
            <div className="text-gray-300 poppins text-sm">Upcoming Appointments</div>
          </div>

          <div
            onClick={() => handleNavigation('/patient-appointments')}
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-sm p-6 text-center border border-teal-500 cursor-pointer hover:bg-opacity-20 transition-all duration-300 glow-teal"
          >
            <div className="text-3xl font-bold poppins text-teal-300 mb-2">{stats.completedVisits}</div>
            <div className="text-gray-300 poppins text-sm">Completed Visits</div>
          </div>

          <div
            onClick={() => handleNavigation('/patient-prescriptions')}
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-sm p-6 text-center border border-green-500 cursor-pointer hover:bg-opacity-20 transition-all duration-300 glow-green"
          >
            <div className="text-3xl font-bold poppins text-green-300 mb-2">{stats.activePrescriptions}</div>
            <div className="text-gray-300 poppins text-sm">Active Prescriptions</div>
          </div>
        </div>
      </main>
        <Footer />
    </div>
  );
};

export default PatientDashboard;