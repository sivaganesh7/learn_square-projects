const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true,
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true,
  },
  date: { 
    type: Date, 
    required: true,
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending',
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);