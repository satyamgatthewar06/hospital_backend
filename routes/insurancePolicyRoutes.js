import express from 'express';
import InsurancePolicy from '../models/InsurancePolicy.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all insurance policies
router.get('/', authMiddleware, async (req, res) => {
  try {
    const policies = await InsurancePolicy.find()
      .populate('tpaId')
      .populate('patientId');
    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get policy by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const policy = await InsurancePolicy.findById(req.params.id)
      .populate('tpaId')
      .populate('patientId');
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create insurance policy
router.post('/', authMiddleware, async (req, res) => {
  try {
    const policy = new InsurancePolicy(req.body);
    await policy.save();
    res.status(201).json({
      success: true,
      message: 'Insurance policy created successfully',
      data: policy
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update insurance policy
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const policy = await InsurancePolicy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Insurance policy updated successfully',
      data: policy
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete insurance policy
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await InsurancePolicy.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Insurance policy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
