import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center">
        <Link to="/" className="text-blue-500 text-xl font-bold">MediTrack Lite</Link>
      </div>
      <div className="flex space-x-4">
        <Link to="/" className="text-gray-600 hover:text-blue-500">Features</Link>
        <Link to="/" className="text-gray-600 hover:text-blue-500">Our Doctors</Link>
        <Link to="/" className="text-gray-600 hover:text-blue-500">Reviews</Link>
        <Link to="/" className="text-gray-600 hover:text-blue-500">Contact</Link>
      </div>
      <div className="flex items-center space-x-4">
        {/* <span className="text-gray-600">+1 (555) 123-4567</span> */}
        <Link to="/patient-login" className="text-gray-600 hover:text-blue-500">Patient Login</Link>
        <Link to="/doctor-login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Doctor Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;