import express from 'express';
import IPD from '../models/IPD.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all IPD records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ipdRecords = await IPD.find()
      .populate('patientId')
      .populate('wardId')
      .populate('doctorId');
    res.status(200).json({
      success: true,
      count: ipdRecords.length,
      data: ipdRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get IPD record by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ipdRecord = await IPD.findById(req.params.id)
      .populate('patientId')
      .populate('wardId')
      .populate('doctorId');
    if (!ipdRecord) {
      return res.status(404).json({
        success: false,
        message: 'IPD record not found'
      });
    }
    res.status(200).json({ success: true, data: ipdRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create IPD record
router.post('/', authMiddleware, async (req, res) => {
  try {
    const ipdRecord = new IPD(req.body);
    await ipdRecord.save();
    res.status(201).json({
      success: true,
      message: 'IPD record created successfully',
      data: ipdRecord
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update IPD record
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const ipdRecord = await IPD.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'IPD record updated successfully',
      data: ipdRecord
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete IPD record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await IPD.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'IPD record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
