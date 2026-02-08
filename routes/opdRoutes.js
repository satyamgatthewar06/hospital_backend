import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Table creation moved to server.js


// Get all OPD records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [records] = await dbPool.query('SELECT * FROM opd_records ORDER BY visitDate DESC, createdAt DESC');
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Get OPD records error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get OPD record by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [records] = await dbPool.query('SELECT * FROM opd_records WHERE id = ?', [req.params.id]);
    if (records.length === 0) {
      return res.status(404).json({ success: false, message: 'OPD record not found' });
    }
    res.status(200).json({ success: true, data: records[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create OPD record
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      patientName, patientId, visitDate, department, doctorName,
      symptoms, diagnosis, treatment, consultationFee, status,
      vitals, notes, followUpDate
    } = req.body;

    // Convert vitals object to string if necessary
    const vitalsStr = typeof vitals === 'object' ? JSON.stringify(vitals) : vitals;

    const [result] = await dbPool.query(
      `INSERT INTO opd_records (patientName, patientId, visitDate, department, doctorName, symptoms, diagnosis, treatment, consultationFee, status, vitals, notes, followUpDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientName, patientId, visitDate, department, doctorName, symptoms, diagnosis, treatment, consultationFee, status || 'Completed', vitalsStr, notes, followUpDate]
    );

    const [newRecord] = await dbPool.query('SELECT * FROM opd_records WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'OPD record created successfully',
      data: newRecord[0]
    });
  } catch (error) {
    console.error('Create OPD error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete OPD record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM opd_records WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'OPD record not found' });
    }
    res.status(200).json({ success: true, message: 'OPD record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
