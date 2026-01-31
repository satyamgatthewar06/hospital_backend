import express from 'express';
import Billing from '../models/Billing.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalBillings = await Billing.countDocuments();
    const totalRevenue = await Billing.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalAppointments,
        totalBillings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get monthly revenue report
router.get('/reports/revenue', authMiddleware, async (req, res) => {
  try {
    const revenueReport = await Billing.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: revenueReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointment statistics
router.get('/reports/appointments', authMiddleware, async (req, res) => {
  try {
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: appointmentStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient statistics
router.get('/reports/patients', authMiddleware, async (req, res) => {
  try {
    const patientStats = await Patient.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: patientStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
