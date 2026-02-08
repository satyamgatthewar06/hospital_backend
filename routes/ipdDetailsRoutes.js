import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Nursing Notes ---
router.get('/:ipdId/nursing-notes', authMiddleware, async (req, res) => {
    try {
        const [notes] = await dbPool.query('SELECT * FROM nursing_notes WHERE ipdId = ? ORDER BY timestamp DESC', [req.params.ipdId]);
        res.json({ success: true, data: notes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:ipdId/nursing-notes', authMiddleware, async (req, res) => {
    try {
        const { nurseName, note } = req.body;
        const [result] = await dbPool.query(
            'INSERT INTO nursing_notes (ipdId, nurseName, note) VALUES (?, ?, ?)',
            [req.params.ipdId, nurseName, note]
        );
        res.json({ success: true, message: 'Note added', id: result.insertId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// --- Doctor Rounds ---
router.get('/:ipdId/doctor-rounds', authMiddleware, async (req, res) => {
    try {
        const [rounds] = await dbPool.query('SELECT * FROM doctor_rounds WHERE ipdId = ? ORDER BY timestamp DESC', [req.params.ipdId]);
        res.json({ success: true, data: rounds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:ipdId/doctor-rounds', authMiddleware, async (req, res) => {
    try {
        const { doctorName, observation, instruction } = req.body;
        const [result] = await dbPool.query(
            'INSERT INTO doctor_rounds (ipdId, doctorName, observation, instruction) VALUES (?, ?, ?, ?)',
            [req.params.ipdId, doctorName, observation, instruction]
        );
        res.json({ success: true, message: 'Round recorded', id: result.insertId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// --- Medications ---
router.get('/:ipdId/medications', authMiddleware, async (req, res) => {
    try {
        const [meds] = await dbPool.query('SELECT * FROM ipd_medications WHERE ipdId = ?', [req.params.ipdId]);
        res.json({ success: true, data: meds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:ipdId/medications', authMiddleware, async (req, res) => {
    try {
        const { medicineName, dosage, frequency, startDate, endDate, status } = req.body;
        const [result] = await dbPool.query(
            'INSERT INTO ipd_medications (ipdId, medicineName, dosage, frequency, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.params.ipdId, medicineName, dosage, frequency, startDate, endDate, status || 'Active']
        );
        res.json({ success: true, message: 'Medication added', id: result.insertId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// --- Intake / Output ---
router.get('/:ipdId/intake-output', authMiddleware, async (req, res) => {
    try {
        const [io] = await dbPool.query('SELECT * FROM intake_output WHERE ipdId = ? ORDER BY date DESC, time DESC', [req.params.ipdId]);
        res.json({ success: true, data: io });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:ipdId/intake-output', authMiddleware, async (req, res) => {
    try {
        const { date, time, type, item, quantity, recordedBy } = req.body;
        const [result] = await dbPool.query(
            'INSERT INTO intake_output (ipdId, date, time, type, item, quantity, recordedBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.params.ipdId, date, time, type, item, quantity, recordedBy]
        );
        res.json({ success: true, message: 'Entry added', id: result.insertId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// --- OT Schedules ---
// Note: This might need to be accessed by date globally, but here filtering by IPD ID is fine for patient view
router.get('/:ipdId/ot-schedules', authMiddleware, async (req, res) => {
    try {
        const [ot] = await dbPool.query('SELECT * FROM ot_schedules WHERE ipdId = ? ORDER BY scheduledDate DESC', [req.params.ipdId]);
        res.json({ success: true, data: ot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:ipdId/ot-schedules', authMiddleware, async (req, res) => {
    try {
        const { procedureName, operatingSurgeon, otRoom, scheduledDate, status, notes } = req.body;
        const [result] = await dbPool.query(
            'INSERT INTO ot_schedules (ipdId, procedureName, operatingSurgeon, otRoom, scheduledDate, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.params.ipdId, procedureName, operatingSurgeon, otRoom, scheduledDate, status || 'Scheduled', notes]
        );
        res.json({ success: true, message: 'Surgery scheduled', id: result.insertId });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;
