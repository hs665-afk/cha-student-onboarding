const express = require('express');
const router = express.Router();
const { protect, authorize, requireStepUp } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Administrator only)
router.get('/dashboard', protect, authorize('administrator'), async (req, res) => {
  res.json({
    success: true,
    data: {
      totalStudents: 1234,
      activeVolunteers: 45,
      totalDonors: 89
    }
  });
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Administrator only)
router.get('/users', protect, authorize('administrator'), async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Administrator only)
router.delete('/users/:id', protect, requireStepUp, authorize('administrator'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Administrator only)
router.put('/users/:id/role', protect, requireStepUp, authorize('administrator'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'donor', 'volunteer', 'administrator'];
    
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
});

module.exports = router;
