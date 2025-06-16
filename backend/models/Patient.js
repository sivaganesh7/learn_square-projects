const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
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
  createdAt: { 
    type: Date, 
    default: Date.now,
  },
});

module.exports = mongoose.model('Patient', patientSchema);