const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/admin');
const User = require('../models/user');
const Horoscope = require('../models/horoscope');

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('displayName email role createdAt lastLogin')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all horoscopes
router.get('/horoscopes', async (req, res) => {
  try {
    const horoscopes = await Horoscope.find()
      .populate('user', 'displayName email')
      .select('name dateOfBirth timeOfBirth placeOfBirth calculatedAt user')
      .sort({ createdAt: -1 });
    
    res.json(horoscopes);
  } catch (error) {
    console.error('Error fetching horoscopes:', error);
    res.status(500).json({ error: 'Failed to fetch horoscopes' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHoroscopes = await Horoscope.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    // Get recent activity
    const recentHoroscopes = await Horoscope.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    res.json({
      totalUsers,
      totalHoroscopes,
      adminUsers,
      regularUsers,
      recentActivity: {
        horoscopesLast24h: recentHoroscopes,
        usersLast24h: recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('displayName email role');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete any horoscope (admin can delete any horoscope)
router.delete('/horoscopes/:horoscopeId', async (req, res) => {
  try {
    const { horoscopeId } = req.params;
    
    const horoscope = await Horoscope.findById(horoscopeId);
    if (!horoscope) {
      return res.status(404).json({ error: 'Horoscope not found' });
    }
    
    await Horoscope.findByIdAndDelete(horoscopeId);
    
    res.json({ message: 'Horoscope deleted successfully' });
  } catch (error) {
    console.error('Error deleting horoscope:', error);
    res.status(500).json({ error: 'Failed to delete horoscope' });
  }
});

module.exports = router; 