import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all doctors
router.get('/', authMiddleware, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'DOCTOR' });
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get doctor by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create doctor
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = new User({
      ...req.body,
      role: 'DOCTOR'
    });
    await user.save();
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update doctor
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete doctor
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
