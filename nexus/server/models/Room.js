const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    default: '',
  },
  maxParticipants: {
    type: Number,
    default: 10,
  },
  messages: [{
    sender: String,
    senderId: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    type: { type: String, default: 'text' },
    fileName: String,
    fileSize: Number,
  }],
  whiteboardData: [{
    type: { type: String },
    points: Array,
    color: String,
    width: Number,
    timestamp: { type: Date, default: Date.now },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24h
  },
});

module.exports = mongoose.model('Room', roomSchema);
