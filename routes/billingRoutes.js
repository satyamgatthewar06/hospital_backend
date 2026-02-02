import express from 'express';
import { Billing } from '../db/models.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all bills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bills = await Billing.findAll();
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get bill by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create bill
router.post('/', authMiddleware, async (req, res) => {
  try {
    const bill = await Billing.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: bill
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update bill
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const bill = await Billing.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete bill
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Billing.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
