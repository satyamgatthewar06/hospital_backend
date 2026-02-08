import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all doctors
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [doctors] = await dbPool.query('SELECT * FROM doctors ORDER BY createdAt DESC');
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get doctor by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [doctors] = await dbPool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctors[0] });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create doctor
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      doctorId, firstName, lastName, specialization, phone, email,
      licenseNumber, department, yearsOfExperience, qualifications, availabilityStatus
    } = req.body;

    if (!doctorId || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: doctorId, firstName, lastName'
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO doctors (doctorId, firstName, lastName, specialization, phone, email,
        licenseNumber, department, yearsOfExperience, qualifications, availabilityStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [doctorId, firstName, lastName, specialization, phone, email,
        licenseNumber, department, yearsOfExperience, qualifications, availabilityStatus || 'available']
    );

    const [newDoctor] = await dbPool.query('SELECT * FROM doctors WHERE id = ?', [result.insertId]);
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: newDoctor[0]
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Doctor ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update doctor
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
    await dbPool.query(`UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updatedDoctor] = await dbPool.query('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
    if (updatedDoctor.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor[0]
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete doctor
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
