import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all appointments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [appointments] = await dbPool.query(`
      SELECT a.*, 
        p.firstName as patientFirstName, p.lastName as patientLastName,
        d.firstName as doctorFirstName, d.lastName as doctorLastName
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN doctors d ON a.doctorId = d.id
      ORDER BY a.appointmentDate DESC
    `);
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [appointments] = await dbPool.query(`
      SELECT a.*, 
        p.firstName as patientFirstName, p.lastName as patientLastName,
        d.firstName as doctorFirstName, d.lastName as doctorLastName
      FROM appointments a
      LEFT JOIN patients p ON a.patientId = p.id
      LEFT JOIN doctors d ON a.doctorId = d.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: appointments[0] });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      appointmentNumber, patientId, doctorId, appointmentDate,
      appointmentType, reason, status, notes
    } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, doctorId, appointmentDate'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO appointments (patientId, doctorId, appointmentDate, status, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, doctorId, appointmentDate, status || 'scheduled', reason]
    );

    const [newAppointment] = await dbPool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: newAppointment[0]
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Appointment number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update appointment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    Object.keys(req.body).forEach(key => {
      if (key !== 'id' && req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await dbPool.query(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updatedAppointment] = await dbPool.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (updatedAppointment.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment[0]
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
