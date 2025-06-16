import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const PatientRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Please fill details correctly";
    }
    if (!/^\S+@meditrack\.local$/.test(formData.email)) {
      return "Email must be from @meditrack.local domain";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          role: "patient",
        }
      );
      setMessage(response.data.message);
      setTimeout(() => navigate("/patient-login"), 2000); // Redirect after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center py-16">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-700 transition-all duration-300"
          >
            ← Back to Home
          </Link>
          <div className="flex justify-center items-center mt-6">
            <span className="text-blue-500 text-3xl mr-3 animate-pulse">♥</span>
            <h1 className="text-3xl font-bold text-gradient-blue">
              MediTrack Lite
            </h1>
          </div>
          <h2 className="mt-4 text-4xl font-bold text-gradient-purple">
            Join as Patient
          </h2>
          <p className="mt-3 text-gray-600">
            Create your account to start booking appointments
          </p>
        </div>
        <div className="bg-white p-10 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-500">
          <h3 className="text-xl font-semibold text-gradient-blue mb-4">
            Patient Registration
          </h3>
          <p className="text-gray-600 mb-8">
            Fill in your details to get started with your healthcare journey
          </p>
          {message && <p className="text-green-500 mb-6">{message}</p>}
          {error && <p className="text-red-500 mb-6">{error}</p>}
          <div className="space-y-6">
            <div className="flex space-x-6">
              <div className="w-1/2">
                <label className="block text-gray-700 font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@meditrack.local"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a secure password"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                required
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 text-white py-3 rounded-lg shadow-lg hover:bg-blue-600 hover:scale-105 transform transition-all duration-300"
            >
              Create Patient Account
            </button>
          </div>
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/patient-login"
              className="text-blue-500 hover:text-blue-700 transition-all duration-300"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientRegister;
