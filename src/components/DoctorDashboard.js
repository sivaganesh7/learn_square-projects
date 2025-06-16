import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptionDetails, setPrescriptionDetails] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

        const response = await axios.get(`http://localhost:5000/api/auth/appointments/doctor/${doctor._id}`);
        setAppointments(response.data);
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
      });
      setMessage(response.data.message);
      setPrescriptionDetails({ ...prescriptionDetails, [appointmentId]: '' });
      // Refresh appointments
      const doctorResponse = await axios.get(`http://localhost:5000/api/auth/doctors?userId=${user.id}`);
      const doctor = doctorResponse.data[0];
      const updatedAppointments = await axios.get(`http://localhost:5000/api/auth/appointments/doctor/${doctor._id}`);
      setAppointments(updatedAppointments.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add prescription');
    }
  };

  if (!user) {
    return <div className="text-center py-16">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <Navbar />
      <div className="flex flex-col items-center py-16">
        <div className="max-w-4xl w-full space-y-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-blue mb-4">
              Welcome, Dr. {user.name}!
            </h1>
            <p className="text-gray-600">
              Manage your appointments and prescribe treatments.
            </p>
          </div>
          {message && <p className="text-green-500 text-center">{message}</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {appointments.length === 0 ? (
            <p className="text-gray-600 text-center">No appointments found.</p>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-semibold text-gradient-blue mb-4">Your Appointments</h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4">Patient</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Prescription</th>
                    <th className="py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{appt.patientId.name}</td>
                      <td className="py-2 px-4">
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
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block py-1 px-3 rounded-full text-sm ${
                            appt.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : appt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <textarea
                          value={prescriptionDetails[appt._id] || ''}
                          onChange={(e) => handlePrescriptionChange(appt._id, e.target.value)}
                          placeholder="Enter prescription details..."
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                          rows="2"
                          disabled={appt.status === 'confirmed'}
                        />
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleAddPrescription(appt._id, appt.patientId._id, appt.doctorId._id)}
                          className={`py-1 px-3 rounded-lg text-white ${
                            appt.status === 'confirmed'
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600'
                          } transition-all duration-300`}
                          disabled={appt.status === 'confirmed'}
                        >
                          {appt.status === 'confirmed' ? 'Prescribed' : 'Add Prescription'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;