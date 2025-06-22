import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const DoctorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [lastResetTime, setLastResetTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.lastPasswordReset) {
      setLastResetTime(new Date(user.lastPasswordReset).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const validateLoginForm = () => {
    if (!formData.email || !formData.password) {
      return 'Please fill in both email and password.';
    }
    if (!/^\S+@meditrack\.local$/.test(formData.email)) {
      return 'Email must be from @meditrack.local domain.';
    }
    return '';
  };

  const validateResetPasswordForm = () => {
    if (!formData.email) {
      return 'Please enter your email.';
    }
    if (!formData.newPassword || !formData.confirmPassword) {
      return 'Please fill in both new password and confirmation.';
    }
    if (formData.newPassword.length < 8) {
      return 'New password must be at least 8 characters.';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateLoginForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = formData.email.toLowerCase();
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: normalizedEmail,
        password: formData.password,
        role: 'doctor',
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });

      localStorage.setItem('user', JSON.stringify(profileResponse.data));
      setLastResetTime(profileResponse.data.lastPasswordReset ? new Date(profileResponse.data.lastPasswordReset).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) : null);

      setMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => navigate('/doctor-dashboard', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed due to an unexpected error.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateResetPasswordForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = formData.email.toLowerCase();
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email: normalizedEmail,
        role: 'doctor',
        newPassword: formData.newPassword,
      });

      setMessage(response.data.message);
      setLastResetTime(new Date(response.data.lastPasswordReset).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }));
      setTimeout(() => setIsForgotPassword(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError('');
    setMessage('');
    setLastResetTime(null);
    setFormData({ ...formData, newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center py-16">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <Link to="/" className="text-blue-300 hover:text-blue-500 transition-all duration-300 poppins" aria-label="Back to Home">
            ← Back to Home
          </Link>
          <div className="flex justify-center items-center mt-6">
            <span className="text-green-400 text-3xl mr-3 animate-pulse">♥</span>
            <h1 className="text-3xl font-bold poppins text-blue-300">MediTrack Lite</h1>
          </div>
          <h2 className="mt-4 text-4xl font-bold poppins text-blue-300">
            {isForgotPassword ? 'Reset Password' : 'Doctor Login'}
          </h2>
          <p className="mt-3 text-gray-300 poppins">
            {isForgotPassword ? 'Enter your new password' : 'Sign in to manage your appointments'}
          </p>
        </div>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-10 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-500 border border-blue-500 glow-blue">
          <h3 className="text-xl font-semibold poppins text-blue-300 mb-4">
            {isForgotPassword ? 'Set New Password' : 'Doctor Sign In'}
          </h3>
          <p className="text-gray-300 poppins mb-8">
            {isForgotPassword ? 'Provide a new password for your account' : 'Enter your credentials to access your account'}
          </p>
          {message && (
            <div className="bg-green-600 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 poppins" role="alert">
              <p>{message}</p>
              {lastResetTime && <p className="mt-2 text-sm">Last password reset: {lastResetTime}</p>}
            </div>
          )}
          {error && (
            <p className="bg-red-600 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 poppins" role="alert">
              {error}
            </p>
          )}
          {lastResetTime && !isForgotPassword && !message && (
            <p className="text-gray-300 poppins mb-6">Last password reset: {lastResetTime}</p>
          )}
          {!isForgotPassword ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6" aria-label="Doctor Login Form">
              <div>
                <label htmlFor="email" className="block text-gray-300 font-medium poppins mb-2">Professional Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dr.jane@meditrack.local"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                  aria-describedby={error ? 'email-error' : undefined}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-300 font-medium poppins mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                  aria-describedby={error ? 'password-error' : undefined}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-teal-700 hover:scale-105 transform transition-all duration-300 poppins glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign In"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
              <p className="mt-6 text-center text-gray-300 poppins">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  className="text-blue-300 hover:text-blue-500 transition-all duration-300"
                  aria-label="Forgot Password"
                >
                  Forgot Password?
                </button>
              </p>
              <p className="mt-2 text-center text-gray-300 poppins">
                Don’t have an account?{' '}
                <Link to="/doctor-register" className="text-blue-300 hover:text-blue-500 transition-all duration-300">
                  Register here
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-6" aria-label="Reset Password Form">
              <div>
                <label htmlFor="reset-email" className="block text-gray-300 font-medium poppins mb-2">Professional Email</label>
                <input
                  id="reset-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dr.jane@meditrack.local"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                  aria-describedby={error ? 'email-error' : undefined}
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-gray-300 font-medium poppins mb-2">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                  aria-describedby={error ? 'password-error' : undefined}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-gray-300 font-medium poppins mb-2">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 poppins"
                  required
                  aria-describedby={error ? 'password-error' : undefined}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={toggleForgotPassword}
                  disabled={isLoading}
                  className="w-1/2 bg-gray-600 text-white py-3 rounded-lg shadow-lg hover:bg-gray-700 hover:scale-105 transform transition-all duration-300 poppins glow-gray disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Back"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-teal-700 hover:scale-105 transform transition-all duration-300 poppins glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Submit"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;

