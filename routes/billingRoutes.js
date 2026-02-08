import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all bills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [bills] = await dbPool.query(`
      SELECT b.*, p.firstName as patientFirstName, p.lastName as patientLastName
      FROM billing b
      LEFT JOIN patients p ON b.patientId = p.id
      ORDER BY b.billDate DESC
    `);
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get bill by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [bills] = await dbPool.query(`
      SELECT b.*, p.firstName as patientFirstName, p.lastName as patientLastName
      FROM billing b
      LEFT JOIN patients p ON b.patientId = p.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (bills.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: bills[0] });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create bill
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      billNumber, patientId, billDate, dueDate, items, subtotal, taxes, discount,
      totalAmount, amountPaid, status, paymentMethod, notes
    } = req.body;

    if (!billNumber || !patientId || !items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: billNumber, patientId, items'
      });
    }

    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);

    const [result] = await dbPool.query(
      `INSERT INTO billing (billNumber, patientId, billDate, dueDate, items, subtotal, taxes, 
        discount, totalAmount, amountPaid, status, paymentMethod, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [billNumber, patientId, billDate, dueDate, itemsJson, subtotal || 0, taxes || 0,
        discount || 0, totalAmount || 0, amountPaid || 0, status || 'pending', paymentMethod, notes]
    );

    const [newBill] = await dbPool.query('SELECT * FROM billing WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: newBill[0]
    });
  } catch (error) {
    console.error('Create bill error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Bill number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update bill payment
router.put('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { amountPaid, paymentMethod, status } = req.body;

    await dbPool.query(
      `UPDATE billing SET amountPaid = ?, paymentMethod = ?, status = ? WHERE id = ?`,
      [amountPaid, paymentMethod, status, req.params.id]
    );

    const [updatedBill] = await dbPool.query('SELECT * FROM billing WHERE id = ?', [req.params.id]);
    if (updatedBill.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedBill[0]
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update bill
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    Object.keys(req.body).forEach(key => {
      if (key !== 'id' && req.body[key] !== undefined) {
        if (key === 'items' && typeof req.body[key] === 'object') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(req.body[key]));
        } else {
          updates.push(`${key} = ?`);
          values.push(req.body[key]);
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await dbPool.query(`UPDATE billing SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updatedBill] = await dbPool.query('SELECT * FROM billing WHERE id = ?', [req.params.id]);
    if (updatedBill.length === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: updatedBill[0]
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete bill
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM billing WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
