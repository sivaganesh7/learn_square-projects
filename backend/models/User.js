const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@meditrack\.local$/, 'Email must be from @meditrack.local domain'],
  },
  specialization: { 
    type: String,
    enum: ['Cardiologist', 'Pediatrician', 'Dermatologist', 'General Practitioner', ''], 
    default: '',
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  role: { 
    type: String, 
    enum: ['patient', 'doctor'], 
    required: [true, 'Role is required'],
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
  },
  lastPasswordReset: { 
    type: Date, 
    default: null,
  },
});

module.exports = mongoose.model('User', userSchema);