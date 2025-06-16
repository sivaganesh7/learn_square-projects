import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-6xl mx-auto flex justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">MediTrack Lite</h3>
          <p className="text-gray-400">Making healthcare accessible for everyone through innovative technology and compassionate care.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul>
            <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Our Doctors</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Reviews</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Legal</h3>
          <ul>
            <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">HIPAA Compliance</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-8 text-gray-400">
        <p>© 2024 MediTrack Lite. Making healthcare accessible for everyone.</p>
        <p>HIPAA Compliant • SSL Secured</p>
      </div>
    </footer>
  );
};

export default Footer;