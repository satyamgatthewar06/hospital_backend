import express from 'express';
import InsuranceClaim from '../models/InsuranceClaim.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all insurance claims
router.get('/', authMiddleware, async (req, res) => {
  try {
    const claims = await InsuranceClaim.find()
      .populate('insurancePolicyId')
      .populate('billingId')
      .populate('tpaId');
    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get claim by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const claim = await InsuranceClaim.findById(req.params.id)
      .populate('insurancePolicyId')
      .populate('billingId')
      .populate('tpaId');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Insurance claim not found'
      });
    }
    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create insurance claim
router.post('/', authMiddleware, async (req, res) => {
  try {
    const claim = new InsuranceClaim(req.body);
    await claim.save();
    res.status(201).json({
      success: true,
      message: 'Insurance claim created successfully',
      data: claim
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update insurance claim
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const claim = await InsuranceClaim.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'Insurance claim updated successfully',
      data: claim
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete insurance claim
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await InsuranceClaim.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Insurance claim deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
