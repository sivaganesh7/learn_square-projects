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
  createdAt: { 
    type: Date, 
    default: Date.now,
  },
});

module.exports = mongoose.model('Doctor', doctorSchema);