import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, FileText } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import PatientNavbar from '../components/PatientNavbar';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    healthIssue: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(''); // Add userId to state
  const [patientId, setPatientId] = useState('');

  const token = localStorage.getItem('token') || '';

  // Decode JWT token to get userId
  useEffect(() => {
    const decodeToken = () => {
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const decodedUserId = payload.id; // Expecting 'id' field in JWT payload
          console.log('Decoded userId from token:', decodedUserId);
          if (!decodedUserId || decodedUserId.length !== 24) {
            setError('Invalid user ID from token. Please log in again.');
          } else {
            setUserId(decodedUserId); // Update state with the userId
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          setError('Invalid token format. Please log in again.');
        }
      } else {
        setError('No authentication token found. Please log in.');
      }
    };
    decodeToken();
  }, [token]);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30',
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched doctors response:', response.data);
        setDoctors(response.data || []);
      } catch (err) {
        console.error('Error fetching doctors:', err.response?.status, err.response?.data);
        setError(err.response?.data?.message || 'Failed to fetch doctors. Please ensure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

const fetchPatient = async () => {
    if (!userId) {
      setError('User ID not available. Please log in again.');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/patients?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched patient response:', response.data);
      if (!response.data || response.data.length === 0) {
        setError('No patient record found for the current user.');
      } else {
        setPatientId(response.data[0]._id); // Store the patient ID
      }
    } catch (err) {
      console.error('Error fetching patient:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch patient data.');
    }
  };

    if (token && userId) {
      fetchDoctors();
      fetchPatient();
    } else if (!token) {
      setError('Please log in to view available doctors and book appointments.');
      setLoading(false);
    }
  }, [token, userId]);

  const handleDoctorSelect = (doctorId) => {
    setFormData({ ...formData, doctorId });
    setError('');
    setMessage('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleBackToDashboard = () => {
    navigate('/patient-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.doctorId) {
      setError('Please select a doctor');
      setLoading(false);
      return;
    }

    if (!formData.date || !formData.time || !formData.healthIssue) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!patientId) {
      setError('Patient ID not available. Please try again or contact support.');
      setLoading(false);
      return;
    }

    const appointmentDateTime = `${formData.date}T${formData.time}:00`;
    const selectedDate = new Date(appointmentDateTime);
    const currentDate = new Date();
    if (selectedDate < currentDate) {
      setError('Cannot book appointments in the past');
      setLoading(false);
      return;
    }

    try {
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/api/auth/appointments/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appointmentsOnDate = appointmentsResponse.data.filter((appt) => {
        const apptDate = new Date(appt.date).toISOString().split('T')[0];
        return apptDate === formData.date;
      });

      if (appointmentsOnDate.length >= 2) {
        setError('You have reached the daily limit of 2 appointments');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/appointments`, {
        patientId: patientId,
        doctorId: formData.doctorId,
        date: appointmentDateTime,
        healthIssue: formData.healthIssue,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Appointment booking response:', response.data);

      setMessage(response.data.message || 'Appointment booked successfully!');
      setFormData({
        doctorId: '',
        date: '',
        time: '',
        healthIssue: '',
      });
      setTimeout(() => {
        navigate('/patient-appointments');
      }, 2000);
    } catch (err) {
      console.error('Error booking appointment:', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <PatientNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back to Dashboard */}
        <button
          onClick={handleBackToDashboard}
          className="flex items-center text-gray-300 hover:text-blue-300 mb-6 transition-all duration-300 poppins glow-blue"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 glow-blue">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold poppins text-blue-300 mb-2">Book Your Appointment</h1>
          <p className="text-gray-300 poppins">Schedule a visit with our healthcare professionals</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctors List */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-blue-500 glow-blue">
            <h2 className="text-xl font-semibold poppins text-blue-300 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Select Doctor
            </h2>
            {loading ? (
              <p className="text-gray-300 poppins">Loading doctors...</p>
            ) : error ? (
              <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 poppins">
                {error}
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-gray-300 poppins">No doctors available</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor._id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      formData.doctorId === doctor._id
                        ? 'bg-blue-600 border-2 border-blue-300 shadow-lg transform scale-102'
                        : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-white poppins ${formData.doctorId === doctor._id ? 'font-semibold' : ''}`}>
                        Dr. {doctor.userId?.name || doctor.name || 'Unknown'}
                      </span>
                      <span className="text-gray-300 poppins text-sm">
                        {doctor.specialization || 'General Medicine'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointment Form */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-blue-500 glow-blue">
            <h2 className="text-xl font-semibold poppins text-blue-300 mb-4">Appointment Details</h2>

            {message && (
              <div className="bg-green-600 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4 poppins">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 poppins">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 poppins mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 poppins mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Preferred Time *
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                >
                  <option value="">Choose a time slot</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Health Issue Summary */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 poppins mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Health Issue Summary *
                </label>
                <textarea
                  name="healthIssue"
                  value={formData.healthIssue}
                  onChange={handleChange}
                  placeholder="Please describe your symptoms or reason for visit..."
                  rows={4}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none poppins"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium poppins hover:from-blue-700 hover:to-teal-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-300 glow-blue disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Booking...' : 'Submit Appointment Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;