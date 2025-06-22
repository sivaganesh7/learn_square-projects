import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const DoctorProfile = ({ user, setUser, setView }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    experience: '',
    qualifications: '',
    bio: '',
    workingHours: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await axios.get(`http://localhost:5000/api/auth/doctors?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('No doctor profile found for this user.');
        }

        const doctor = response.data[0];
        setProfile({
          name: doctor.name || '',
          email: doctor.email || '',
          phoneNumber: doctor.phoneNumber || '',
          specialization: doctor.specialization || '',
          experience: doctor.experience || '',
          qualifications: doctor.qualifications || '',
          bio: doctor.bio || '',
          workingHours: doctor.workingHours || '',
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    } else {
      setError('User not logged in. Please log in to view your profile.');
      setIsLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await axios.put(
        `http://localhost:5000/api/auth/doctors/${user.id}`,
        { ...profile },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Profile updated successfully');
      const updatedUser = { ...user, name: profile.name, email: profile.email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        onAppointmentsClick={() => setView('appointments')}
        onPrescriptionsClick={() => setView('prescriptions')}
        onFeedbackClick={() => setView('feedback')}
        onProfileClick={() => setView('profile')}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setView('dashboard')}
                className="mr-4 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Doctor Profile</h1>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </header>
        <div className="mt-8">
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
          {isLoading ? (
            <div className="text-center text-gray-600">Loading profile...</div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={profile.specialization}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={profile.experience}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                    <input
                      type="text"
                      name="qualifications"
                      value={profile.qualifications}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                  <textarea
                    name="workingHours"
                    value={profile.workingHours}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;