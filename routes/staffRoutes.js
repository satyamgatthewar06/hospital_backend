import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all staff
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [staff] = await dbPool.query('SELECT * FROM staff ORDER BY createdAt DESC');
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create staff
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      staffId, firstName, lastName, role, department, phone, email,
      shiftTiming, qualifications, joiningDate, status
    } = req.body;

    if (!staffId || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: staffId, firstName, lastName, role'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO staff (staffId, firstName, lastName, role, department, phone, email,
        shiftTiming, qualifications, joiningDate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [staffId, firstName, lastName, role, department, phone, email,
        shiftTiming, qualifications, joiningDate, status || 'active']
    );

    const [newStaff] = await dbPool.query('SELECT * FROM staff WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: newStaff[0]
    });
  } catch (error) {
    console.error('Create staff error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Staff ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete staff
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM staff WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
