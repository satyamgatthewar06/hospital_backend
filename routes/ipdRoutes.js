import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all IPD records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [ipdRecords] = await dbPool.query(`
      SELECT i.*, 
             p.firstName as patientFirstName, p.lastName as patientLastName,
             d.firstName as doctorFirstName, d.lastName as doctorLastName,
             w.wardName, w.wardType, w.floorNumber
      FROM ipd_admissions i
      LEFT JOIN patients p ON i.patientId = p.id
      LEFT JOIN doctors d ON i.doctorId = d.id
      LEFT JOIN wards w ON i.wardId = w.id
      ORDER BY i.admissionDate DESC
    `);
    res.status(200).json({
      success: true,
      count: ipdRecords.length,
      data: ipdRecords
    });
  } catch (error) {
    console.error('Get IPD error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get IPD record by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [ipdRecords] = await dbPool.query(`
      SELECT i.*, 
             p.firstName as patientFirstName, p.lastName as patientLastName,
             d.firstName as doctorFirstName, d.lastName as doctorLastName,
             w.wardName
      FROM ipd_admissions i
      LEFT JOIN patients p ON i.patientId = p.id
      LEFT JOIN doctors d ON i.doctorId = d.id
      LEFT JOIN wards w ON i.wardId = w.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (ipdRecords.length === 0) {
      return res.status(404).json({ success: false, message: 'IPD record not found' });
    }
    res.status(200).json({ success: true, data: ipdRecords[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create IPD record
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      patientId, doctorId, wardId, admissionDate, dischargeDate,
      diagnosis, treatmentPlan, attendingNurse, roomNumber, bedNumber,
      emergencyContactName, emergencyContactPhone, status, notes
    } = req.body;

    if (!patientId || !doctorId || !wardId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, doctorId, wardId'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO ipd_admissions (
        patientId, doctorId, wardId, admissionDate, dischargeDate, 
        diagnosis, treatmentPlan, attendingNurse, roomNumber, bedNumber,
        emergencyContactName, emergencyContactPhone, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId, doctorId, wardId, admissionDate, dischargeDate,
        diagnosis, treatmentPlan, attendingNurse, roomNumber, bedNumber,
        emergencyContactName, emergencyContactPhone, status || 'Admitted', notes
      ]
    );

    const [newRecord] = await dbPool.query('SELECT * FROM ipd_admissions WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'IPD record created successfully',
      data: newRecord[0]
    });
  } catch (error) {
    console.error('Create IPD error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update IPD record
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
    await dbPool.query(`UPDATE ipd_admissions SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updatedRecord] = await dbPool.query('SELECT * FROM ipd_admissions WHERE id = ?', [req.params.id]);
    if (updatedRecord.length === 0) {
      return res.status(404).json({ success: false, message: 'IPD record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'IPD record updated successfully',
      data: updatedRecord[0]
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete IPD record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM ipd_admissions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'IPD record not found' });
    }
    res.status(200).json({ success: true, message: 'IPD record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
