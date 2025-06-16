import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Homepage = () => {
  return (
    <div className="bg-gray-50">
         <Navbar />
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-4xl font-bold text-gradient-blue mb-6">Your Health Journey, Simplified</h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with trusted doctors, book appointments effortlessly, and manage your healthcare with confidence. Welcome to the future of clinic management.
        </p>
        <div className="flex justify-center space-x-6 mb-8">
          <Link to="/patient-register">
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 hover:scale-105 transform transition-all duration-300">
              Join as Patient
            </button>
          </Link>
          <Link to="/doctor-register">
            <button className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 transform transition-all duration-300">
              Join as Doctor
            </button>
          </Link>
        </div>
        <div className="flex justify-center space-x-8 text-gray-600">
          <span>✔ 500+ Happy Patients</span>
          <span>✔ 50+ Verified Doctors</span>
          <span>✔ Available 24/7</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 text-center bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex justify-center space-x-12">
          <div className="transform hover:scale-105 transition-all duration-300 max-w-xs">
            <div className="text-blue-500 text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gradient-blue mb-3">Easy Booking</h3>
            <p className="text-gray-600">Schedule appointments in just a few clicks</p>
          </div>
          <div className="transform hover:scale-105 transition-all duration-300 max-w-xs">
            <div className="text-green-500 text-4xl mb-4">🩺</div>
            <h3 className="text-xl font-semibold text-gradient-green mb-3">Trusted Doctors</h3>
            <p className="text-gray-600">Connect with qualified healthcare professionals</p>
          </div>
          <div className="transform hover:scale-105 transition-all duration-300 max-w-xs">
            <div className="text-purple-500 text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gradient-purple mb-3">Secure & Private</h3>
            <p className="text-gray-600">Your health data is protected and confidential</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-gradient-purple mb-6">Why Choose MediTrack Lite?</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Designed with both patients and doctors in mind, our platform makes healthcare accessible and efficient.</p>
        <div className="flex justify-center space-x-12">
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 max-w-sm">
            <div className="text-blue-500 text-3xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-gradient-blue mb-3">24/7 Availability</h3>
            <p className="text-gray-600">Book appointments anytime, anywhere. Our platform is accessible when you need it most.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 max-w-sm">
            <div className="text-green-500 text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gradient-green mb-3">Expert Care Team</h3>
            <p className="text-gray-600">Our network of verified doctors and specialists are ready to provide you quality healthcare.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 max-w-sm">
            <div className="text-purple-500 text-3xl mb-4">💜</div>
            <h3 className="text-xl font-semibold text-gradient-purple mb-3">Patient-Centered</h3>
            <p className="text-gray-600">Every feature is designed with your comfort and convenience in mind, making healthcare stress-free.</p>
          </div>
        </div>
      </section>

      {/* Meet Our Doctors Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-gradient-blue mb-6">Meet Our Doctors</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Our team of experienced healthcare professionals is here to provide you with the best care possible.</p>
        <div className="flex justify-center space-x-12">
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-center max-w-xs">
            <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">Dr</div>
            <h3 className="text-xl font-semibold text-gradient-blue mb-2">Dr. Sarah Johnson</h3>
            <p className="text-gray-600 mb-2">Cardiologist</p>
            <p className="text-yellow-500 mb-2">★★★★★</p>
            <p className="text-gray-600 mb-4">15+ years of experience in cardiovascular medicine</p>
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100 hover:scale-105 transition-all duration-300">
              View Profile
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-center max-w-xs">
            <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">Dr</div>
            <h3 className="text-xl font-semibold text-gradient-green mb-2">Dr. Michael Chen</h3>
            <p className="text-gray-600 mb-2">Pediatrician</p>
            <p className="text-yellow-500 mb-2">★★★★★</p>
            <p className="text-gray-600 mb-4">Specialized in child health and development</p>
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100 hover:scale-105 transition-all duration-300">
              View Profile
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-center max-w-xs">
            <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">Dr</div>
            <h3 className="text-xl font-semibold text-gradient-purple mb-2">Dr. Emily Rodriguez</h3>
            <p className="text-gray-600 mb-2">Dermatologist</p>
            <p className="text-yellow-500 mb-2">★★★★★</p>
            <p className="text-gray-600 mb-4">Expert in skin conditions and cosmetic procedures</p>
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100 hover:scale-105 transition-all duration-300">
              View Profile
            </button>
          </div>
        </div>
      </section>

      {/* Patient Reviews Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-gradient-green mb-6">What Our Patients Say</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Real stories from real patients who have experienced exceptional care through our platform.</p>
        <div className="flex justify-center space-x-12">
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-center max-w-xs">
            <p className="text-yellow-500 mb-3">★★★★★</p>
            <p className="text-gray-600 mb-4">"MediTrack Lite made booking my appointment so easy. The whole process was smooth and the doctor was fantastic!"</p>
            <div className="flex items-center justify-center">
              <div className="bg-blue-100 text-blue-500 w-8 h-8 rounded-full flex items-center justify-center mr-3">JD</div>
              <p className="text-gray-600">John Doe, Patient</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-center max-w-xs">
            <p className="text-yellow-500 mb-3">★★★★★</p>
            <p className="text-gray-600 mb-4">"As a doctor, this platform helps me manage my appointments efficiently. Great user experience!"</p>
            <div className="flex items-center justify-center">
              <div className="bg-green-100 text-green-500 w-8 h-8 rounded-full flex items-center justify-center mr-3">AS</div>
              <p className="text-gray-600">Dr. Alice Smith, General Practitioner</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-center max-w-xs">
            <p className="text-yellow-500 mb-3">★★★★★</p>
            <p className="text-gray-600 mb-4">"Finally, a healthcare platform that actually works! Quick, reliable, and user-friendly."</p>
            <div className="flex items-center justify-center">
              <div className="bg-purple-100 text-purple-500 w-8 h-8 rounded-full flex items-center justify-center mr-3">MJ</div>
              <p className="text-gray-600">Maria Johnson, Patient</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Your Health Journey?</h2>
        <p className="mb-8 max-w-2xl mx-auto">Join thousands of patients and doctors who trust MediTrack Lite for their healthcare needs.</p>
        <div className="flex justify-center space-x-6">
          <Link to="/patient-register">
            <button className="bg-white text-blue-500 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 hover:scale-105 transform transition-all duration-300">
              Get Started as Patient
            </button>
          </Link>
          <Link to="/doctor-register">
            <button className="border border-white text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 hover:scale-105 transform transition-all duration-300">
              Join Our Medical Team
            </button>
          </Link>
        </div>
      </section>
      {/*footer*/}
      <Footer />
    </div>
  );
};

export default Homepage;