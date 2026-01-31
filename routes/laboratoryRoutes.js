import express from 'express';
import Laboratory from '../models/Laboratory.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all lab tests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tests = await Laboratory.find()
      .populate('patientId')
      .populate('appointmentId');
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get lab test by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const test = await Laboratory.findById(req.params.id)
      .populate('patientId')
      .populate('appointmentId');
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }
    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create lab test
router.post('/', authMiddleware, async (req, res) => {
  try {
    const test = new Laboratory(req.body);
    await test.save();
    res.status(201).json({
      success: true,
      message: 'Lab test created successfully',
      data: test
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update lab test
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const test = await Laboratory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Lab test updated successfully',
      data: test
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete lab test
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Laboratory.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Lab test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
