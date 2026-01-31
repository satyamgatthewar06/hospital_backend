import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all staff
router.get('/', authMiddleware, async (req, res) => {
  try {
    const staffMembers = await User.find({
      role: { $in: ['NURSE', 'TECHNICIAN', 'ADMINISTRATOR'] }
    });
    res.status(200).json({
      success: true,
      count: staffMembers.length,
      data: staffMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get staff member by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create staff member
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update staff member
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete staff member
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
