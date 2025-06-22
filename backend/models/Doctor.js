const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true,
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
  },
  specialization: { 
    type: String, 
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  experience: {
    type: String,
    trim: true,
  },
  qualifications: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  workingHours: {
    type: String,
    trim: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
  },
});

module.exports = mongoose.model('Doctor', doctorSchema);