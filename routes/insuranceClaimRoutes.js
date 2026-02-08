import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all claims
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [claims] = await dbPool.query(`
      SELECT ic.*, p.firstName, p.lastName, ip.insuranceProvider
      FROM insurance_claims ic
      LEFT JOIN patients p ON ic.patientId = p.id
      LEFT JOIN insurance_policies ip ON ic.policyId = ip.id
      ORDER BY ic.claimDate DESC
    `);
    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create claim
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      claimNumber, policyId, patientId, billId, claimAmount, approvedAmount,
      status, reason, notes
    } = req.body;

    if (!claimNumber || !policyId || !patientId || !billId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: claimNumber, policyId, patientId, billId'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO insurance_claims (claimNumber, policyId, patientId, billId, claimAmount, approvedAmount,
        status, reason, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [claimNumber, policyId, patientId, billId, claimAmount, approvedAmount,
        status || 'submitted', reason, notes]
    );

    const [newClaim] = await dbPool.query('SELECT * FROM insurance_claims WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Insurance claim created successfully',
      data: newClaim[0]
    });
  } catch (error) {
    console.error('Create claim error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Claim number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete claim
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM insurance_claims WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }
    res.status(200).json({ success: true, message: 'Claim deleted successfully' });
  } catch (error) {
    console.error('Delete claim error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
