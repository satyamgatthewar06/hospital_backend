import express from 'express';
import { Patient } from '../db/models.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all patients
router.get('/', authMiddleware, async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create patient
router.post('/', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update patient
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete patient
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Patient.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
