import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import PatientRegister from './components/PatientRegister';
import DoctorRegister from './components/DoctorRegister';
import PatientLogin from './components/PatientLogin';
import DoctorLogin from './components/DoctorLogin';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import Appointments from './components/Appointments';
import BookAppointment from './components/BookAppointment';
import ViewAllAppointments from './components/ViewAllAppointments';
import ViewPrescriptions from './components/PatientPrescriptions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/patient-register" element={<PatientRegister />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/view-all-appointments" element={<ViewAllAppointments />} />
        <Route path="/view-prescriptions" element={<ViewPrescriptions />} />
      </Routes>
    </Router>
  );
}

export default App;