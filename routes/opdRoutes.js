import express from 'express';
import Appointment from '../models/Appointment.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all OPD appointments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const opdAppointments = await Appointment.find({ type: 'OPD' })
      .populate('patientId')
      .populate('doctorId');
    res.status(200).json({
      success: true,
      count: opdAppointments.length,
      data: opdAppointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get OPD appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');
    if (!appointment || appointment.type !== 'OPD') {
      return res.status(404).json({
        success: false,
        message: 'OPD appointment not found'
      });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create OPD appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      type: 'OPD'
    });
    await appointment.save();
    res.status(201).json({
      success: true,
      message: 'OPD appointment created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update OPD appointment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, type: 'OPD' },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      message: 'OPD appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete OPD appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'OPD appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
