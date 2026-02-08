import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all TPA
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [tpa] = await dbPool.query('SELECT * FROM tpa ORDER BY tpaName ASC');
    res.status(200).json({
      success: true,
      count: tpa.length,
      data: tpa
    });
  } catch (error) {
    console.error('Get TPA error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create TPA
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      tpaId, tpaName, contactPerson, email, phone, address, networkHospitals, claimProcessingTime, status
    } = req.body;

    if (!tpaId || !tpaName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tpaId, tpaName'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO tpa (tpaId, tpaName, contactPerson, email, phone, address, networkHospitals, claimProcessingTime, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tpaId, tpaName, contactPerson, email, phone, address, networkHospitals, claimProcessingTime, status || 'active']
    );

    const [newTpa] = await dbPool.query('SELECT * FROM tpa WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'TPA created successfully',
      data: newTpa[0]
    });
  } catch (error) {
    console.error('Create TPA error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'TPA ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete TPA
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM tpa WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'TPA not found' });
    }
    res.status(200).json({ success: true, message: 'TPA deleted successfully' });
  } catch (error) {
    console.error('Delete TPA error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
