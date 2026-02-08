import express from 'express';
import { dbPool } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all patients
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [patients] = await dbPool.query('SELECT * FROM patients ORDER BY createdAt DESC');
    console.log('DEBUG: Raw patients from DB:', JSON.stringify(patients, null, 2));

    // Transform data to match frontend expectations
    const transformedPatients = patients.map(p => {
      // Calculate age from DOB
      let age = '--';
      if (p.dateOfBirth) {
        const birthDate = new Date(p.dateOfBirth);
        const today = new Date();
        // Check if valid date
        if (!isNaN(birthDate.getTime())) {
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
      }

      const formattedDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '--';
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim();

      console.log(`DEBUG: Transforming patient ${p.id}:`, {
        name: fullName,
        age,
        dob: p.dateOfBirth
      });

      return {
        ...p,
        id: p.id,
        name: fullName,
        age: age,
        contact: p.phone, // Map phone -> contact
        diagnosis: p.medicalHistory || '--', // Map medicalHistory -> diagnosis
        doctor: p.doctorName || '--', // Placeholder if doctor join isn't done yet
        dateAdmitted: formattedDate // Format date
      };
    });

    res.status(200).json({
      success: true,
      count: transformedPatients.length,
      data: transformedPatients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [patients] = await dbPool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    res.status(200).json({ success: true, data: patients[0] });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create patient
router.post('/', authMiddleware, async (req, res) => {
  try {
    let {
      patientId,
      firstName,
      lastName,
      name, // Frontend sends 'name'
      dateOfBirth,
      age, // Frontend sends 'age'
      gender,
      bloodType,
      bloodGroup, // Frontend sends 'bloodGroup'
      phone,
      email,
      street,
      address, // Frontend sends 'address'
      city,
      state,
      zipCode,
      country,
      emergencyContactName,
      emergencyContact, // Frontend might send this
      emergencyContactRelation,
      emergencyContactPhone,
      medicalHistory,
      allergies,
      medications,
      chronicDiseases,
      surgicalHistory
    } = req.body;

    // 1. Handle Name (Split if firstName/lastName missing)
    if (!firstName && !lastName && name) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || '.';
    }

    // 2. Handle Date of Birth (Calculate from age if missing)
    if (!dateOfBirth && age) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(age);
      dateOfBirth = `${birthYear}-01-01`;
    }

    // 3. Handle Mappings
    if (!patientId) patientId = 'PAT' + Date.now();
    if (!bloodType && bloodGroup) bloodType = bloodGroup;
    if (!street && address) street = address;
    if (!emergencyContactPhone && emergencyContact) emergencyContactPhone = emergencyContact;

    // Validate required fields
    if (!patientId || !firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields. Received: Name=${firstName} ${lastName}, DOB=${dateOfBirth}, Gender=${gender}`
      });
    }

    const [result] = await dbPool.query(
      `INSERT INTO patients (
        patientId, firstName, lastName, dateOfBirth, gender, bloodType, phone, email,
        street, city, state, zipCode, country,
        emergencyContactName, emergencyContactRelation, emergencyContactPhone,
        medicalHistory, allergies, medications, chronicDiseases, surgicalHistory
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId, firstName, lastName, dateOfBirth, gender, bloodType, phone, email,
        street, city, state, zipCode, country,
        emergencyContactName, emergencyContactRelation, emergencyContactPhone,
        medicalHistory, allergies, medications, chronicDiseases, surgicalHistory
      ]
    );

    // Fetch the created patient
    const [newPatients] = await dbPool.query('SELECT * FROM patients WHERE id = ?', [result.insertId]);
    const p = newPatients[0];

    // Transform for frontend
    let calculatedAge = '--';
    if (p.dateOfBirth) {
      const birthDate = new Date(p.dateOfBirth);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
      }
    }

    const transformedPatient = {
      ...p,
      id: p.id,
      name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown',
      age: calculatedAge,
      contact: p.phone,
      diagnosis: p.medicalHistory || '--',
      doctor: '--', // Placeholder
      dateAdmitted: new Date().toLocaleDateString()
    };

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: transformedPatient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Patient ID already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update patient
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = [];
    const values = [];

    // Build dynamic UPDATE query
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

    await dbPool.query(
      `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated patient
    const [updatedPatient] = await dbPool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);

    if (updatedPatient.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient[0]
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete patient
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await dbPool.query('DELETE FROM patients WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
