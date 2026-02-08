import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all wards
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [wards] = await dbPool.query('SELECT * FROM wards ORDER BY wardId ASC');
    res.status(200).json({
      success: true,
      count: wards.length,
      data: wards
    });
  } catch (error) {
    console.error('Get wards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create ward
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      wardId, wardName, wardType, totalBeds, availableBeds, floorNumber, facilities, status
    } = req.body;

    if (!wardId || !wardName || !totalBeds) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: wardId, wardName, totalBeds'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO wards (wardId, wardName, wardType, totalBeds, availableBeds, floorNumber, facilities, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [wardId, wardName, wardType, totalBeds, availableBeds || totalBeds, floorNumber, facilities, status || 'active']
    );

    const [newWard] = await dbPool.query('SELECT * FROM wards WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Ward created successfully',
      data: newWard[0]
    });
  } catch (error) {
    console.error('Create ward error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ward ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete ward
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM wards WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }
    res.status(200).json({ success: true, message: 'Ward deleted successfully' });
  } catch (error) {
    console.error('Delete ward error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
