import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all policies
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [policies] = await dbPool.query(`
      SELECT ip.*, p.firstName, p.lastName 
      FROM insurance_policies ip
      LEFT JOIN patients p ON ip.patientId = p.id
      ORDER BY ip.expiryDate ASC
    `);
    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create policy
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      policyId, patientId, insuranceProvider, policyNumber, groupNumber, memberId,
      policyType, coverageAmount, copay, deductible, startDate, expiryDate, status
    } = req.body;

    if (!policyId || !patientId || !policyNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: policyId, patientId, policyNumber'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO insurance_policies (policyId, patientId, insuranceProvider, policyNumber, groupNumber, memberId,
        policyType, coverageAmount, copay, deductible, startDate, expiryDate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [policyId, patientId, insuranceProvider, policyNumber, groupNumber, memberId,
        policyType, coverageAmount, copay, deductible, startDate, expiryDate, status || 'active']
    );

    const [newPolicy] = await dbPool.query('SELECT * FROM insurance_policies WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Insurance policy created successfully',
      data: newPolicy[0]
    });
  } catch (error) {
    console.error('Create policy error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Policy ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete policy
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM insurance_policies WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.status(200).json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Delete policy error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
