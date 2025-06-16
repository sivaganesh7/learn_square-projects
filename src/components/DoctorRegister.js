import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.specialization || !formData.password || !formData.confirmPassword) {
      return 'Please fill details correctly';
    }
    if (!/^\S+@meditrack\.local$/.test(formData.email)) {
      return 'Email must be from @meditrack.local domain';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        specialization: formData.specialization,
        password: formData.password,
        role: 'doctor',
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/doctor-login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center py-16">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <Link to="/" className="text-blue-300 hover:text-blue-500 transition-all duration-300 poppins">
            ← Back to Home
          </Link>
          <div className="flex justify-center items-center mt-6">
            <span className="text-green-400 text-3xl mr-3 animate-pulse">♥</span>
            <h1 className="text-3xl font-bold poppins text-blue-300">MediTrack Lite</h1>
          </div>
          <h2 className="mt-4 text-4xl font-bold poppins text-blue-300">Join Our Team</h2>
          <p className="mt-3 text-gray-300 poppins">Register as a healthcare professional</p>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-10 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-500 border border-blue-500 glow-blue">
          <h3 className="text-xl font-semibold poppins text-green-400 mb-4">Doctor Registration</h3>
          <p className="text-gray-300 poppins mb-8">Complete your profile to start helping patients</p>
          {message && (
            <p className="bg-green-600 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 poppins">{message}</p>
          )}
          {error && (
            <p className="bg-red-600 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 poppins">{error}</p>
          )}
          <div className="space-y-6">
            <div className="flex space-x-6">
              <div className="w-1/2">
                <label className="block text-gray-300 font-medium poppins mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Dr. Jane"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-300 font-medium poppins mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Smith"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-medium poppins mb-2">Professional Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="dr.jane@meditrack.local"
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium poppins mb-2">Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                required
              >
                <option value="">Select your specialization</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="General Practitioner">General Practitioner</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-medium poppins mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium poppins mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                required
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-teal-700 hover:scale-105 transform transition-all duration-300 poppins glow-blue"
            >
              Submit Application
            </button>
          </div>
          <p className="mt-6 text-center text-gray-300 poppins">
            Already registered?{' '}
            <Link to="/doctor-login" className="text-blue-300 hover:text-blue-500 transition-all duration-300">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;