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
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], // Added 'completed'
    default: 'pending',
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
  },
});

// Optional: Add an index on date for better query performance
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);