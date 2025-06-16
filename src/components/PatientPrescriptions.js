import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import PatientNavbar from '../components/PatientNavbar';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const patientResponse = await axios.get(`${API_BASE_URL}/api/auth/patients?userId=${user.id}`);
        const patient = patientResponse.data[0];
        if (!patient) {
          setError('Patient record not found');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/prescriptions/patient/${patient._id}`);
        setPrescriptions(response.data);
      } catch (err) {
        setError('Failed to fetch prescriptions');
      }
    };

    if (user.id) {
      fetchPrescriptions();
    }
  }, [user.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <PatientNavbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold poppins text-blue-300 mb-2">My Prescriptions</h1>
          <p className="text-gray-300 poppins mb-6">View your active prescriptions</p>
        </div>
        {error && <p className="text-red-400 text-center poppins mb-6">{error}</p>}
        {prescriptions.length === 0 ? (
          <p className="text-gray-300 text-center poppins">No prescriptions found.</p>
        ) : (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-3 px-4 poppins text-blue-300">Doctor</th>
                  <th className="py-3 px-4 poppins text-blue-300">Date</th>
                  <th className="py-3 px-4 poppins text-blue-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="border-b border-gray-600 hover:bg-gray-700">
                    <td className="py-3 px-4 poppins">{prescription.doctorId.name}</td>
                    <td className="py-3 px-4 poppins">
                      {new Date(prescription.appointmentId.date).toLocaleString('en-US', {
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
                    <td className="py-3 px-4 poppins">{prescription.details}</td>
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

export default PatientPrescriptions;