const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const rateLimitMongo = require('rate-limit-mongo');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const TokenBlacklist = require('../models/TokenBlacklist');

// Rate Limiting with MongoDB Store
const loginLimiter = rateLimit({
  store: new rateLimitMongo({
    uri: 'mongodb://localhost:27017/meditrack-lite',
    collectionName: 'loginRateLimits',
    expireTimeMs: 15 * 60 * 1000, // 15 minutes
  }),
  max: 5, // Limit to 5 requests per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

const resetPasswordLimiter = rateLimit({
  store: new rateLimitMongo({
    uri: 'mongodb://localhost:27017/meditrack-lite',
    collectionName: 'resetPasswordRateLimits',
    expireTimeMs: 60 * 60 * 1000, // 1 hour
  }),
  max: 3, // Limit to 3 requests per hour
  message: 'Too many password reset attempts. Please try again after 1 hour.',
});

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(403).json({ message: 'Token has been invalidated. Please log in again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`Token verification error at ${new Date().toISOString()}:`, err.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Input Validation Middleware
const validateRegisterInput = (req, res, next) => {
  const { name, email, password, role, specialization } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields (name, email, password, role) are required' });
  }

  if (!/^\S+@meditrack\.local$/.test(email)) {
    return res.status(400).json({ message: 'Email must be from @meditrack.local domain' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  if (!['patient', 'doctor'].includes(role.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (role.toLowerCase() === 'doctor' && !specialization) {
    return res.status(400).json({ message: 'Specialization is required for doctors' });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields (email, password, role) are required' });
  }

  if (!/^\S+@meditrack\.local$/.test(email)) {
    return res.status(400).json({ message: 'Email must be from @meditrack.local domain' });
  }

  if (!['patient', 'doctor'].includes(role.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  next();
};

const validateResetPasswordInput = (req, res, next) => {
  const { email, role, newPassword } = req.body;

  if (!email || !role || !newPassword) {
    return res.status(400).json({ message: 'All fields (email, role, newPassword) are required' });
  }

  if (!/^\S+@meditrack\.local$/.test(email)) {
    return res.status(400).json({ message: 'Email must be from @meditrack.local domain' });
  }

  if (!['patient', 'doctor'].includes(role.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  next();
};

// Register Route
router.post('/register', validateRegisterInput, async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const normalizedRole = role.toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      specialization: normalizedRole === 'doctor' ? specialization : '',
    });

    await user.save();

    if (normalizedRole === 'patient') {
      const patient = new Patient({
        userId: user._id,
        name,
        email: normalizedEmail,
      });
      await patient.save();
    } else if (normalizedRole === 'doctor') {
      const doctor = new Doctor({
        userId: user._id,
        name,
        email: normalizedEmail,
        specialization,
      });
      await doctor.save();
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(`Registration error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', validateLoginInput, loginLimiter, async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const normalizedRole = role.toLowerCase();

    console.log(`Login attempt at ${new Date().toISOString()}: email=${normalizedEmail}, role=${normalizedRole}`);

    const user = await User.findOne({ email: normalizedEmail, role: normalizedRole });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email, password, or role' });
    }

    console.log('User found:', user);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email, password, or role' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        lastPasswordReset: user.lastPasswordReset,
      }
    });
  } catch (err) {
    console.error(`Login error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout Route
router.post('/logout', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decoded.exp * 1000); // Convert expiration from seconds to milliseconds

    const blacklistedToken = new TokenBlacklist({
      token,
      expiresAt,
    });

    await blacklistedToken.save();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(`Logout error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password Route
router.post('/reset-password', validateResetPasswordInput, resetPasswordLimiter, async (req, res) => {
  const { email, role, newPassword } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const normalizedRole = role.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail, role: normalizedRole });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the last reset was within 24 hours
    if (user.lastPasswordReset) {
      const lastResetTime = new Date(user.lastPasswordReset);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastResetTime) / (1000 * 60 * 60); // Difference in hours
      if (timeDiff < 24) {
        const lastResetTimeIST = lastResetTime.toLocaleString('en-US', { 
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return res.status(403).json({ 
          message: `You can only reset your password once every 24 hours. Last reset was on ${lastResetTimeIST}.` 
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.lastPasswordReset = new Date();
    await user.save();

    const lastPasswordResetIST = user.lastPasswordReset.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    res.status(200).json({ 
      message: 'Password updated successfully', 
      lastPasswordReset: lastPasswordResetIST,
    });
  } catch (err) {
    console.error(`Reset password error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch User Profile (Authenticated Route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.toObject();
    if (userData.lastPasswordReset) {
      userData.lastPasswordReset = user.lastPasswordReset.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    res.status(200).json(userData);
  } catch (err) {
    console.error(`Profile fetch error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Doctors (Protected Route)
router.get('/doctors', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    let doctors;
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
      }
      doctors = await Doctor.find({ userId }).populate('userId', 'name email');
    } else {
      doctors = await Doctor.find().populate('userId', 'name email');
    }
    res.status(200).json(doctors);
  } catch (err) {
    console.error(`Error fetching doctors at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Patients by userId (Protected Route)
router.get('/patients', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }
    const patients = await Patient.find({ userId }).populate('userId', 'name email');
    res.status(200).json(patients);
  } catch (err) {
    console.error(`Error fetching patients at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book Appointment (Protected Route)
router.post('/appointments', authenticateToken, async (req, res) => {
  const { patientId, doctorId, date, healthIssue } = req.body;

  if (!patientId || !doctorId || !date || !healthIssue) {
    return res.status(400).json({ message: 'All fields (patientId, doctorId, date, healthIssue) are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ message: 'Invalid patientId or doctorId' });
  }

  try {
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const currentTime = new Date();
    if (appointmentDate < currentTime) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }

    // Verify that the patientId matches the logged-in user (if role is patient)
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'You can only book appointments for yourself' });
    }

    // Verify that the doctorId exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      date: appointmentDate,
      healthIssue,
      status: 'pending',
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    console.error(`Error booking appointment at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Patient Appointments (Protected Route)
router.get('/appointments/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patientId' });
    }

    // Verify that the patientId matches the logged-in user (if role is patient)
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'You can only view your own appointments' });
    }

    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name email');
    res.status(200).json(appointments);
  } catch (err) {
    console.error(`Error fetching patient appointments at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Doctor Appointments (Protected Route)
router.get('/appointments/doctor/:doctorId', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctorId' });
    }

    // Verify that the doctorId matches the logged-in user (if role is doctor)
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor || doctor._id.toString() !== doctorId) {
        return res.status(403).json({ message: 'You can only view your own appointments' });
      }
    }

    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization');
    res.status(200).json(appointments);
  } catch (err) {
    console.error(`Error fetching doctor appointments at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Appointment Status (Protected Route)
router.put('/appointments/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid appointment ID' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const validStatuses = ['pending', 'confirmed', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(id).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only doctors can update appointment status, and only for their own appointments
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update appointment status' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor._id.toString() !== appointment.doctorId._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own appointments' });
    }

    if (appointment.status === 'pending' && status !== 'confirmed') {
      return res.status(400).json({ message: 'Pending appointments can only be confirmed' });
    }
    if (appointment.status === 'confirmed' && status !== 'completed') {
      return res.status(400).json({ message: 'Confirmed appointments can only be completed' });
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Completed appointments cannot be modified' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: 'Appointment status updated', appointment });
  } catch (err) {
    console.error(`Error updating appointment status at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Prescription (Protected Route)
router.post('/prescriptions', authenticateToken, async (req, res) => {
  const { appointmentId, patientId, doctorId, details } = req.body;

  if (!appointmentId || !patientId || !doctorId || !details) {
    return res.status(400).json({ message: 'All fields (appointmentId, patientId, doctorId, details) are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId) || !mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    // Verify that the doctorId matches the logged-in user
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create prescriptions' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor._id.toString() !== doctorId) {
      return res.status(403).json({ message: 'You can only create prescriptions for your own appointments' });
    }

    // Verify the appointment exists and belongs to this doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctorId || appointment.patientId.toString() !== patientId) {
      return res.status(403).json({ message: 'Invalid appointment, patient, or doctor association' });
    }

    // Check appointment status
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: `Cannot create prescription for an appointment with status "${appointment.status}"` });
    }

    const prescription = new Prescription({
      appointmentId,
      patientId,
      doctorId,
      details,
    });

    await prescription.save();
    appointment.status = 'confirmed';
    await appointment.save();

    res.status(201).json({ message: 'Prescription added successfully', prescription });
  } catch (err) {
    console.error(`Error creating prescription at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Patient Prescriptions (Protected Route)
router.get('/prescriptions/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patientId' });
    }

    // Verify that the patientId matches the logged-in user (if role is patient)
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'You can only view your own prescriptions' });
    }

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name email')
      .populate('appointmentId', 'date');
    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(`Error fetching prescriptions at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Doctor Prescriptions (Protected Route)
router.get('/prescriptions/doctor/:doctorId', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctorId' });
    }

    // Verify that the doctorId matches the logged-in user (if role is doctor)
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor || doctor._id.toString() !== doctorId) {
        return res.status(403).json({ message: 'You can only view your own prescriptions' });
      }
    }

    const prescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date');
    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(`Error fetching doctor prescriptions at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;