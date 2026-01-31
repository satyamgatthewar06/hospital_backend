import express from 'express';
import Ward from '../models/Ward.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all wards
router.get('/', authMiddleware, async (req, res) => {
  try {
    const wards = await Ward.find();
    res.status(200).json({
      success: true,
      count: wards.length,
      data: wards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get ward by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found'
      });
    }
    res.status(200).json({ success: true, data: ward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create ward
router.post('/', authMiddleware, async (req, res) => {
  try {
    const ward = new Ward(req.body);
    await ward.save();
    res.status(201).json({
      success: true,
      message: 'Ward created successfully',
      data: ward
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update ward
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const ward = await Ward.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Ward updated successfully',
      data: ward
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete ward
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Ward.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Ward deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
