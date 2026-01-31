import express from 'express';
import TPA from '../models/TPA.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all TPAs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tpas = await TPA.find()
      .populate('insurancePolicies')
      .populate('claims');
    res.status(200).json({
      success: true,
      count: tpas.length,
      data: tpas
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get TPA by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const tpa = await TPA.findById(req.params.id)
      .populate('insurancePolicies')
      .populate('claims');
    if (!tpa) {
      return res.status(404).json({
        success: false,
        message: 'TPA not found'
      });
    }
    res.status(200).json({ success: true, data: tpa });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create TPA
router.post('/', authMiddleware, async (req, res) => {
  try {
    const tpa = new TPA(req.body);
    await tpa.save();
    res.status(201).json({
      success: true,
      message: 'TPA created successfully',
      data: tpa
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update TPA
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const tpa = await TPA.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'TPA updated successfully',
      data: tpa
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete TPA
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await TPA.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'TPA deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
