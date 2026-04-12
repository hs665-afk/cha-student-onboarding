const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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
    const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Administrator only)
router.put('/users/:id/role', protect, authorize('administrator'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'donor', 'volunteer', 'administrator'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

module.exports = router;
