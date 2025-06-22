const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const rateLimitMongo = require("rate-limit-mongo");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const TokenBlacklist = require("../models/TokenBlacklist");

// Rate Limiting Configurations
const limiterConfig = {
  store: new rateLimitMongo({
    uri: process.env.MONGO_URI,
    expireTimeMs: 15 * 60 * 1000,
  }),
  message: "Too many attempts. Please try again later.",
};

const loginLimiter = rateLimit({ ...limiterConfig, max: 5, collectionName: "loginRateLimits" });
const resetPasswordLimiter = rateLimit({ ...limiterConfig, max: 3, collectionName: "resetPasswordRateLimits", expireTimeMs: 60 * 60 * 1000 });

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access token required" });

  try {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) return res.status(403).json({ message: "Token invalidated. Please log in again." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`Token verification error at ${new Date().toISOString()}:`, err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Input Validation Middleware
const validateInput = (fields) => (req, res, next) => {
  const { email, password, role, name, specialization, newPassword, phoneNumber, experience, qualifications, bio, workingHours, ...rest } = req.body;
  const required = fields.filter((field) => !req.body[field]);
  if (required.length) return res.status(400).json({ message: `Missing fields: ${required.join(", ")}` });

  if (!/^\S+@meditrack\.local$/.test(email)) return res.status(400).json({ message: "Email must be from @meditrack.local domain" });
  if (password && password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
  if (newPassword && newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
  if (!["patient", "doctor"].includes(role?.toLowerCase())) return res.status(400).json({ message: "Invalid role" });
  if (role?.toLowerCase() === "doctor" && !specialization && fields.includes("specialization")) return res.status(400).json({ message: "Specialization is required for doctors" });

  next();
};

const validateRegisterInput = validateInput(["name", "email", "password", "role", "specialization"]);
const validateLoginInput = validateInput(["email", "password", "role"]);
const validateResetPasswordInput = validateInput(["email", "role", "newPassword"]);
const validateProfileUpdateInput = validateInput(["name", "email", "specialization"]);

// Utility Functions
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const formatDateIST = (date) => date.toLocaleString("en-US", {
  timeZone: "Asia/Kolkata",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

// Register Route
router.post("/register", validateRegisterInput, async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  try {
    const normalized = { email: email.toLowerCase(), role: role.toLowerCase() };
    if (await User.findOne({ email: normalized.email })) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await hashPassword(password);
    const user = new User({ ...normalized, name, password: hashedPassword, specialization: normalized.role === "doctor" ? specialization : "" });
    await user.save();

    if (normalized.role === "patient") await new Patient({ userId: user._id, name, email: normalized.email }).save();
    else if (normalized.role === "doctor") await new Doctor({ userId: user._id, name, email: normalized.email, specialization }).save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(`Registration error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", validateLoginInput, loginLimiter, async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const normalized = { email: email.toLowerCase(), role: role.toLowerCase() };
    const user = await User.findOne({ email: normalized.email, role: normalized.role });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid email, password, or role" });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, lastPasswordReset: user.lastPasswordReset } });
  } catch (err) {
    console.error(`Login error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout Route
router.post("/logout", authenticateToken, async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await new TokenBlacklist({ token, expiresAt: new Date(decoded.exp * 1000) }).save();
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(`Logout error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Route
router.post("/reset-password", validateResetPasswordInput, resetPasswordLimiter, async (req, res) => {
  const { email, role, newPassword } = req.body;

  try {
    const normalized = { email: email.toLowerCase(), role: role.toLowerCase() };
    const user = await User.findOne({ email: normalized.email, role: normalized.role });
    if (!user) return res.status(404).json({ message: "User not found" });

    const lastReset = user.lastPasswordReset ? new Date(user.lastPasswordReset) : null;
    if (lastReset && (Date.now() - lastReset) / (1000 * 60 * 60) < 24) return res.status(403).json({ message: `Password reset available after ${formatDateIST(new Date(lastReset.getTime() + 24 * 60 * 60 * 1000))}` });

    user.password = await hashPassword(newPassword);
    user.lastPasswordReset = new Date();
    await user.save();

    res.status(200).json({ message: "Password updated successfully", lastPasswordReset: formatDateIST(user.lastPasswordReset) });
  } catch (err) {
    console.error(`Reset password error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch User Profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userData = user.toObject();
    if (userData.lastPasswordReset) userData.lastPasswordReset = formatDateIST(user.lastPasswordReset);
    res.status(200).json(userData);
  } catch (err) {
    console.error(`Profile fetch error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Doctor Profile
router.put("/doctors/:id", authenticateToken, validateProfileUpdateInput, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, specialization, experience, qualifications, bio, workingHours } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor._id.toString() !== id) return res.status(403).json({ message: "Unauthorized" });

    doctor.name = name;
    doctor.email = email.toLowerCase();
    doctor.phoneNumber = phoneNumber;
    doctor.specialization = specialization;
    doctor.experience = experience;
    doctor.qualifications = qualifications;
    doctor.bio = bio;
    doctor.workingHours = workingHours;

    await doctor.save();

    const user = await User.findById(req.user.id);
    user.name = name;
    user.email = email.toLowerCase();
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", doctor });
  } catch (err) {
    console.error(`Profile update error at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch Doctors
router.get("/doctors", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId && mongoose.Types.ObjectId.isValid(userId) ? { userId } : {};
    const doctors = await Doctor.find(query).populate("userId", "name email");
    if (!doctors.length) return res.status(404).json({ message: "No doctors available" });
    res.status(200).json(doctors);
  } catch (err) {
    console.error(`Error fetching doctors at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch Patients
router.get("/patients", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Valid userId is required" });
    const patients = await Patient.find({ userId }).populate("userId", "name email");
    res.status(200).json(patients);
  } catch (err) {
    console.error(`Error fetching patients at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Book Appointment
router.post("/appointments", authenticateToken, async (req, res) => {
  const { patientId, doctorId, date, healthIssue } = req.body;

  if (!patientId || !doctorId || !date || !healthIssue)
    return res.status(400).json({ message: "All fields required" });

  if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId))
    return res.status(400).json({ message: "Invalid ID" });

  try {
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime()) || appointmentDate < new Date())
      return res.status(400).json({ message: "Invalid or past date" });

    const [doctor, patient] = await Promise.all([
      Doctor.findById(doctorId),
      Patient.findById(patientId),
    ]);

    if (!doctor || !patient)
      return res.status(404).json({ message: "Doctor or patient not found" });

    if (req.user.role === "patient") {
      if (patient.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Patients can only book their own appointments" });
      }
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      date: appointmentDate,
      healthIssue,
      status: "pending",
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (err) {
    console.error(`Error booking appointment at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch Patient Appointments
router.get("/appointments/patient/:patientId", authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    if (!mongoose.Types.ObjectId.isValid(patientId)) return res.status(400).json({ message: "Invalid patientId" });
    if (req.user.role === "patient" && req.user.id.toString() !== patientId) return res.status(403).json({ message: "Own appointments only" });
    const appointments = await Appointment.find({ patientId }).populate("doctorId", "name specialization").populate("patientId", "name email");
    res.status(200).json(appointments);
  } catch (err) {
    console.error(`Error fetching patient appointments at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch Doctor Appointments
router.get("/appointments/doctor/:doctorId", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) return res.status(400).json({ message: "Invalid doctorId" });
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor || doctor._id.toString() !== doctorId) return res.status(403).json({ message: "Own appointments only" });
    }
    const appointments = await Appointment.find({ doctorId }).populate("patientId", "name email").populate("doctorId", "name specialization");
    res.status(200).json(appointments);
  } catch (err) {
    console.error(`Error fetching doctor appointments at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Appointment Status
router.put("/appointments/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id) || !status) return res.status(400).json({ message: "Invalid ID or missing status" });

  try {
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const appointment = await Appointment.findById(id).populate("doctorId");
    if (!appointment || req.user.role !== "doctor") return res.status(403).json({ message: "Unauthorized" });

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor._id.toString() !== appointment.doctorId._id.toString()) return res.status(403).json({ message: "Own appointments only" });

    const statusRules = { pending: ["confirmed"], confirmed: ["completed"], completed: [], cancelled: [] };
    if (!statusRules[appointment.status].includes(status)) return res.status(400).json({ message: `Invalid transition from ${appointment.status}` });

    appointment.status = status;
    await appointment.save();
    res.status(200).json({ message: "Status updated", appointment });
  } catch (err) {
    console.error(`Error updating appointment status at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create Prescription
router.post("/prescriptions", authenticateToken, async (req, res) => {
  const { appointmentId, patientId, doctorId, details } = req.body;
  if (!appointmentId || !patientId || !doctorId || !details) return res.status(400).json({ message: "All fields required" });
  if (!mongoose.Types.ObjectId.isValid(appointmentId) || !mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) return res.status(400).json({ message: "Invalid ID" });

  try {
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Doctors only" });

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor._id.toString() !== doctorId) return res.status(403).json({ message: "Own appointments only" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctorId.toString() !== doctorId || appointment.patientId.toString() !== patientId || appointment.status !== "pending") return res.status(400).json({ message: "Invalid appointment" });

    const prescription = new Prescription({ appointmentId, patientId, doctorId, details });
    await prescription.save();
    appointment.status = "confirmed";
    await appointment.save();
    res.status(201).json({ message: "Prescription added", prescription });
  } catch (err) {
    console.error(`Error creating prescription at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch Patient Prescriptions
router.get("/prescriptions/patient/:patientId", authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    if (!mongoose.Types.ObjectId.isValid(patientId)) return res.status(400).json({ message: "Invalid patientId" });
    if (req.user.role === "patient" && req.user.id.toString() !== patientId) return res.status(403).json({ message: "Own prescriptions only" });
    const prescriptions = await Prescription.find({ patientId }).populate("doctorId", "name specialization").populate("patientId", "name email").populate("appointmentId", "date");
    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(`Error fetching prescriptions at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch Doctor Prescriptions
router.get("/prescriptions/doctor/:doctorId", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) return res.status(400).json({ message: "Invalid doctorId" });
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor || doctor._id.toString() !== doctorId) return res.status(403).json({ message: "Own prescriptions only" });
    }
    const prescriptions = await Prescription.find({ doctorId }).populate("patientId", "name email").populate("doctorId", "name specialization").populate("appointmentId", "date");
    res.status(200).json(prescriptions);
  } catch (err) {
    console.error(`Error fetching doctor prescriptions at ${new Date().toISOString()}:`, err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;