const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// In-memory store fallback when MongoDB is unavailable
const memUsers = new Map();

let User;
try {
  User = require('../models/User');
} catch (e) {
  User = null;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Try MongoDB first, fallback to memory
    try {
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) return res.status(409).json({ error: 'Username or email already taken' });

      const user = await User.create({ username, email, password });
      const token = generateToken(user);
      return res.status(201).json({ token, user: { id: user._id, username, email } });
    } catch (dbErr) {
      // Memory fallback
      if ([...memUsers.values()].find(u => u.email === email || u.username === username)) {
        return res.status(409).json({ error: 'Username or email already taken' });
      }
      const id = Date.now().toString();
      const hashed = await bcrypt.hash(password, 12);
      const user = { id, username, email, password: hashed };
      memUsers.set(id, user);
      const token = generateToken({ _id: id, username, email });
      return res.status(201).json({ token, user: { id, username, email } });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = generateToken(user);
      return res.json({ token, user: { id: user._id, username: user.username, email } });
    } catch (dbErr) {
      const user = [...memUsers.values()].find(u => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = generateToken({ _id: user.id, username: user.username, email });
      return res.json({ token, user: { id: user.id, username: user.username, email } });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/guest — quick guest login
router.post('/guest', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  const guestUser = { _id: 'guest_' + Date.now(), username, email: '' };
  const token = generateToken(guestUser);
  res.json({ token, user: { id: guestUser._id, username, email: '', isGuest: true } });
});

module.exports = router;
