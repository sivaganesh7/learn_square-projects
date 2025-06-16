import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import PatientNavbar from '../components/PatientNavbar';

const ViewAllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showConfirmed, setShowConfirmed] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const patientResponse = await axios.get(`${API_BASE_URL}/api/auth/patients?userId=${user.id}`);
        const patient = patientResponse.data[0];
        if (!patient) {
          setError('Patient record not found');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/appointments/patient/${patient._id}`);
        setAppointments(response.data);
        setFilteredAppointments(response.data);
      } catch (err) {
        setError('Failed to fetch appointments');
      }
    };
    if (user.id) {
      fetchAppointments();
    }
  }, [user.id]);

  const handleFilterConfirmed = () => {
    if (showConfirmed) {
      setFilteredAppointments(appointments);
      setShowConfirmed(false);
    } else {
      const confirmed = appointments.filter((appt) => appt.status === 'confirmed');
      setFilteredAppointments(confirmed);
      setShowConfirmed(true);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/appointments/${appointmentId}/status`, { status: newStatus });
      const updatedAppointment = response.data.appointment;

      // Update the local state with the updated appointment
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
      setFilteredAppointments((prevFiltered) =>
        prevFiltered.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: updatedAppointment.status } : appt
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <PatientNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold poppins text-blue-300 mb-2">All Appointments</h1>
          <p className="text-gray-300 poppins mb-6">View and manage your appointments</p>
        </div>
        <div className="flex justify-end mb-6">
          <button
            onClick={handleFilterConfirmed}
            className={`poppins px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
              showConfirmed ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
            } text-white glow-green`}
          >
            {showConfirmed ? 'Show All' : 'Show Confirmed'}
          </button>
        </div>
        {error && <p className="text-red-400 text-center poppins mb-6">{error}</p>}
        {filteredAppointments.length === 0 ? (
          <p className="text-gray-300 text-center poppins">No appointments found.</p>
        ) : (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-3 px-4 poppins text-blue-300">Doctor</th>
                  <th className="py-3 px-4 poppins text-blue-300">Specialization</th>
                  <th className="py-3 px-4 poppins text-blue-300">Date</th>
                  <th className="py-3 px-4 poppins text-blue-300">Status</th>
                  <th className="py-3 px-4 poppins text-blue-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appt) => (
                  <tr key={appt._id} className="border-b border-gray-600 hover:bg-gray-700">
                    <td className="py-3 px-4 poppins">{appt.doctorId.name}</td>
                    <td className="py-3 px-4 poppins">{appt.doctorId.specialization}</td>
                    <td className="py-3 px-4 poppins">
                      {new Date(appt.date).toLocaleString('en-US', {
                        timeZone: 'Asia/Kolkata',
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block py-1 px-3 rounded-full text-sm poppins ${
                          appt.status === 'confirmed'
                            ? 'bg-green-600 text-white'
                            : appt.status === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                          className="bg-green-600 text-white poppins px-3 py-1 rounded-lg hover:bg-green-700 glow-green transition-all duration-300"
                        >
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(appt._id, 'completed')}
                          className="bg-blue-600 text-white poppins px-3 py-1 rounded-lg hover:bg-blue-700 glow-blue transition-all duration-300"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllAppointments;