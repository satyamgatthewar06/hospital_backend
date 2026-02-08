import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// 1. LAB TESTS (Test Master)
// ============================================

// Get all lab tests
router.get('/tests', authMiddleware, async (req, res) => {
  try {
    const [tests] = await dbPool.query('SELECT * FROM lab_tests ORDER BY testName ASC');
    res.status(200).json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create lab test
router.post('/tests', authMiddleware, async (req, res) => {
  try {
    const { testName, testCategory, price, sampleType, normalRange, tat, format } = req.body;
    const [result] = await dbPool.query(
      `INSERT INTO lab_tests (testName, testCategory, price, sampleType, normalRange, tat, format) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [testName, testCategory, price, sampleType, normalRange, tat, format]
    );
    const [newTest] = await dbPool.query('SELECT * FROM lab_tests WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newTest[0] });
  } catch (error) {
    console.error('Create lab test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lab test
router.put('/tests/:id', authMiddleware, async (req, res) => {
  try {
    const { testName, testCategory, price, sampleType, normalRange, tat, format } = req.body;
    await dbPool.query(
      `UPDATE lab_tests SET testName=?, testCategory=?, price=?, sampleType=?, normalRange=?, tat=?, format=? WHERE id=?`,
      [testName, testCategory, price, sampleType, normalRange, tat, format, req.params.id]
    );
    const [updated] = await dbPool.query('SELECT * FROM lab_tests WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update lab test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete lab test
router.delete('/tests/:id', authMiddleware, async (req, res) => {
  try {
    await dbPool.query('DELETE FROM lab_tests WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete lab test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// 2. LAB REQUESTS (Sample Collection/Tracking)
// ============================================

// Get all lab requests (can filter by status via query)
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM lab_requests ORDER BY createdAt DESC';
    const params = [];

    // Optional filtering
    if (req.query.status) {
      query = 'SELECT * FROM lab_requests WHERE status = ? ORDER BY createdAt DESC';
      params.push(req.query.status);
    }

    const [requests] = await dbPool.query(query, params);
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Get lab requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Request (Sample Collection)
router.post('/requests', authMiddleware, async (req, res) => {
  try {
    const { reqId, patientId, patientName, testName, sampleType, collectionDate, status, priority, technicianName } = req.body;
    const [result] = await dbPool.query(
      `INSERT INTO lab_requests (reqId, patientId, patientName, testName, sampleType, collectionDate, status, priority, technicianName) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reqId, patientId, patientName, testName, sampleType, collectionDate, status, priority, technicianName]
    );
    const [newReq] = await dbPool.query('SELECT * FROM lab_requests WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newReq[0] });
  } catch (error) {
    console.error('Create lab request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Request (Status, Results, or Signature)
router.put('/requests/:id', authMiddleware, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    // Allow flexible updates of any field passed in body
    const allowedFields = ['status', 'testResult', 'remarks', 'signature', 'resultDate', 'technicianName', 'resultType', 'pathologistRemark', 'verifiedBy', 'verifiedDate', 'isVerified', 'doctorId', 'shareHistory', 'downloadHistory'];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    });

    if (updates.length > 0) {
      values.push(req.params.id);
      await dbPool.query(`UPDATE lab_requests SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const [updatedReq] = await dbPool.query('SELECT * FROM lab_requests WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, data: updatedReq[0] });
  } catch (error) {
    console.error('Update lab request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// 3. LAB BILLS (Billing)
// ============================================

router.get('/bills', authMiddleware, async (req, res) => {
  try {
    const [bills] = await dbPool.query('SELECT * FROM lab_bills ORDER BY billDate DESC');
    res.status(200).json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    console.error('Get lab bills error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/bills', authMiddleware, async (req, res) => {
  try {
    const { billNo, billDate, reqId, patientName, testName, totalAmount, discount, gst, finalAmount, paymentMode, status, isCashless, insuranceProvider, policyNumber } = req.body;

    // Validate required fields
    if (!billNo || !reqId || !finalAmount) {
      return res.status(400).json({ success: false, message: 'Missing required billing fields' });
    }

    const [result] = await dbPool.query(
      `INSERT INTO lab_bills (billNo, billDate, reqId, patientName, testName, totalAmount, discount, finalAmount, paymentMode, status, isCashless, insuranceProvider, policyNumber)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [billNo, billDate, reqId, patientName, testName, totalAmount, discount, finalAmount, paymentMode, status, isCashless, insuranceProvider, policyNumber]
    );
    const [newBill] = await dbPool.query('SELECT * FROM lab_bills WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newBill[0] });
  } catch (error) {
    console.error('Create lab bill error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ============================================
// 4. REPORT SHARING & LOGGING
// ============================================

// Share Report (Log Share Event)
// Body: { reqId, method ('whatsapp'|'email'|'portal'), recipient }
router.post('/share-log', authMiddleware, async (req, res) => {
  try {
    const { reqId, method, recipient } = req.body;

    // Get current history
    const [rows] = await dbPool.query('SELECT shareHistory FROM lab_requests WHERE id = ?', [reqId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });

    let history = [];
    try {
      history = JSON.parse(rows[0].shareHistory || '[]');
    } catch (e) { history = []; }

    const newEvent = {
      method,
      recipient,
      timestamp: new Date().toISOString(),
      status: 'Sent' // In a real app, this would be callback based
    };

    history.push(newEvent);

    await dbPool.query('UPDATE lab_requests SET shareHistory = ? WHERE id = ?', [JSON.stringify(history), reqId]);

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Share log error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download Log
router.post('/download-log', authMiddleware, async (req, res) => {
  try {
    const { reqId, type } = req.body;

    const [rows] = await dbPool.query('SELECT downloadHistory FROM lab_requests WHERE id = ?', [reqId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });

    let history = [];
    try {
      history = JSON.parse(rows[0].downloadHistory || '[]');
    } catch (e) { history = []; }

    const newEvent = {
      type: type || 'pdf',
      timestamp: new Date().toISOString()
    };
    history.push(newEvent);

    await dbPool.query('UPDATE lab_requests SET downloadHistory = ? WHERE id = ?', [JSON.stringify(history), reqId]);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Download log error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
