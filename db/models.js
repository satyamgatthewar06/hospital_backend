// Database helper functions for MySQL operations
// Import this in routes and use these functions instead of mongoose methods

import { dbPool } from '../server.js';

// ============ PATIENT OPERATIONS ============
export const Patient = {
  findAll: async () => {
    const [rows] = await dbPool.query('SELECT * FROM patients ORDER BY createdAt DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await dbPool.query('SELECT * FROM patients WHERE id = ?', [id]);
    return rows[0] || null;
  },

  findByUserId: async (userId) => {
    const [rows] = await dbPool.query('SELECT * FROM patients WHERE userId = ?', [userId]);
    return rows[0] || null;
  },

  create: async (data) => {
    const {
      userId, patientId, firstName, lastName, dateOfBirth, gender, bloodType,
      phone, email, street, city, state, zipCode, country,
      emergencyContactName, emergencyContactRelation, emergencyContactPhone,
      medicalHistory, allergies, medications, chronicDiseases, surgicalHistory
    } = data;

    const [result] = await dbPool.query(
      `INSERT INTO patients (
        userId, patientId, firstName, lastName, dateOfBirth, gender, bloodType,
        phone, email, street, city, state, zipCode, country,
        emergencyContactName, emergencyContactRelation, emergencyContactPhone,
        medicalHistory, allergies, medications, chronicDiseases, surgicalHistory
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, patientId, firstName, lastName, dateOfBirth, gender, bloodType,
        phone, email, street, city, state, zipCode, country,
        emergencyContactName, emergencyContactRelation, emergencyContactPhone,
        JSON.stringify(medicalHistory || []),
        JSON.stringify(allergies || []),
        JSON.stringify(medications || []),
        JSON.stringify(chronicDiseases || []),
        JSON.stringify(surgicalHistory || [])
      ]
    );

    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (['medicalHistory', 'allergies', 'medications', 'chronicDiseases', 'surgicalHistory'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    values.push(id);
    const query = `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`;
    await dbPool.query(query, values);
    return await Patient.findById(id);
  },

  delete: async (id) => {
    const [result] = await dbPool.query('DELETE FROM patients WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

// ============ BILLING OPERATIONS ============
export const Billing = {
  findAll: async () => {
    const [rows] = await dbPool.query(`
      SELECT b.*, p.firstName, p.lastName 
      FROM billing b 
      LEFT JOIN patients p ON b.patientId = p.id 
      ORDER BY b.createdAt DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await dbPool.query(`
      SELECT b.*, p.firstName, p.lastName 
      FROM billing b 
      LEFT JOIN patients p ON b.patientId = p.id 
      WHERE b.id = ?
    `, [id]);
    return rows[0] || null;
  },

  findByPatientId: async (patientId) => {
    const [rows] = await dbPool.query(
      'SELECT * FROM billing WHERE patientId = ? ORDER BY createdAt DESC',
      [patientId]
    );
    return rows;
  },

  create: async (data) => {
    const {
      billNumber, patientId, dueDate, items, subtotal, taxes, discount, totalAmount,
      amountPaid, status, paymentMethod, notes
    } = data;

    const [result] = await dbPool.query(
      `INSERT INTO billing (
        billNumber, patientId, dueDate, items, subtotal, taxes, discount, totalAmount,
        amountPaid, status, paymentMethod, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNumber, patientId, dueDate,
        JSON.stringify(items || []),
        subtotal, taxes, discount, totalAmount,
        amountPaid, status, paymentMethod, notes
      ]
    );

    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (key === 'items') {
        fields.push(`items = ?`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    values.push(id);
    const query = `UPDATE billing SET ${fields.join(', ')} WHERE id = ?`;
    await dbPool.query(query, values);
    return await Billing.findById(id);
  },

  delete: async (id) => {
    const [result] = await dbPool.query('DELETE FROM billing WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

// ============ APPOINTMENT OPERATIONS ============
export const Appointment = {
  findAll: async () => {
    const [rows] = await dbPool.query(`
      SELECT a.*, p.firstName AS patientName, d.firstName AS doctorName 
      FROM appointments a 
      LEFT JOIN patients p ON a.patientId = p.id 
      LEFT JOIN doctors d ON a.doctorId = d.id 
      ORDER BY a.appointmentDate DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await dbPool.query(`
      SELECT a.*, p.firstName AS patientName, d.firstName AS doctorName 
      FROM appointments a 
      LEFT JOIN patients p ON a.patientId = p.id 
      LEFT JOIN doctors d ON a.doctorId = d.id 
      WHERE a.id = ?
    `, [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { appointmentNumber, patientId, doctorId, appointmentDate, appointmentType, reason, status, notes } = data;
    const [result] = await dbPool.query(
      `INSERT INTO appointments (appointmentNumber, patientId, doctorId, appointmentDate, appointmentType, reason, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [appointmentNumber, patientId, doctorId, appointmentDate, appointmentType, reason, status, notes]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const query = `UPDATE appointments SET ${fields} WHERE id = ?`;
    await dbPool.query(query, values);
    return await Appointment.findById(id);
  },

  delete: async (id) => {
    const [result] = await dbPool.query('DELETE FROM appointments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

// ============ DOCTOR OPERATIONS ============
export const Doctor = {
  findAll: async () => {
    const [rows] = await dbPool.query('SELECT * FROM doctors ORDER BY createdAt DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await dbPool.query('SELECT * FROM doctors WHERE id = ?', [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { userId, doctorId, firstName, lastName, specialization, phone, email, licenseNumber, department, yearsOfExperience, qualifications, availabilityStatus } = data;
    const [result] = await dbPool.query(
      `INSERT INTO doctors (userId, doctorId, firstName, lastName, specialization, phone, email, licenseNumber, department, yearsOfExperience, qualifications, availabilityStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, doctorId, firstName, lastName, specialization, phone, email, licenseNumber, department, yearsOfExperience, JSON.stringify(qualifications || []), availabilityStatus]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const query = `UPDATE doctors SET ${fields} WHERE id = ?`;
    await dbPool.query(query, values);
    return await Doctor.findById(id);
  },

  delete: async (id) => {
    const [result] = await dbPool.query('DELETE FROM doctors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

// ============ LABORATORY OPERATIONS ============
export const Laboratory = {
  findAll: async () => {
    const [rows] = await dbPool.query(`
      SELECT l.*, p.firstName AS patientName, d.firstName AS doctorName 
      FROM laboratory l 
      LEFT JOIN patients p ON l.patientId = p.id 
      LEFT JOIN doctors d ON l.doctorId = d.id 
      ORDER BY l.testDate DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await dbPool.query(`
      SELECT l.*, p.firstName AS patientName, d.firstName AS doctorName 
      FROM laboratory l 
      LEFT JOIN patients p ON l.patientId = p.id 
      LEFT JOIN doctors d ON l.doctorId = d.id 
      WHERE l.id = ?
    `, [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { testId, patientId, doctorId, testName, testCategory, sampleCollectionDate, reportDate, testResults, referenceRange, status, normalRange, normalValue, abnormalFlag, comments } = data;
    const [result] = await dbPool.query(
      `INSERT INTO laboratory (testId, patientId, doctorId, testName, testCategory, sampleCollectionDate, reportDate, testResults, referenceRange, status, normalRange, normalValue, abnormalFlag, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testId, patientId, doctorId, testName, testCategory, sampleCollectionDate, reportDate, JSON.stringify(testResults || {}), referenceRange, status, normalRange, normalValue, abnormalFlag, comments]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const query = `UPDATE laboratory SET ${fields} WHERE id = ?`;
    await dbPool.query(query, values);
    return await Laboratory.findById(id);
  },

  delete: async (id) => {
    const [result] = await dbPool.query('DELETE FROM laboratory WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

// ============ STAFF OPERATIONS ============
export const Staff = {
  findAll: async () => {
    const [rows] = await dbPool.query('SELECT * FROM staff ORDER BY createdAt DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await dbPool.query('SELECT * FROM staff WHERE id = ?', [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { staffId, firstName, lastName, role, department, phone, email, shiftTiming, qualifications, joiningDate, status } = data;
    const [result] = await dbPool.query(
      `INSERT INTO staff (staffId, firstName, lastName, role, department, phone, email, shiftTiming, qualifications, joiningDate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [staffId, firstName, lastName, role, department, phone, email, shiftTiming, JSON.stringify(qualifications || []), joiningDate, status]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const query = `UPDATE staff SET ${fields} WHERE id = ?`;
    await dbPool.query(query, values);
    return await Staff.findById(id);
  },

  delete: async (id) => {
    const [result] = await dbPool.query('DELETE FROM staff WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

// ============ WARD OPERATIONS ============
export const Ward = {
  findAll: async () => {
    const [rows] = await dbPool.query('SELECT * FROM wards ORDER BY createdAt DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await dbPool.query('SELECT * FROM wards WHERE id = ?', [id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const { wardId, wardName, wardType, totalBeds, occupiedBeds, availableBeds, floorNumber, facilities, status } = data;
    const [result] = await dbPool.query(
      `INSERT INTO wards (wardId, wardName, wardType, totalBeds, occupiedBeds, availableBeds, floorNumber, facilities, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [wardId, wardName, wardType, totalBeds, occupiedBeds, availableBeds, floorNumber, JSON.stringify(facilities || []), status]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const query = `UPDATE wards SET ${fields} WHERE id = ?`;
    await dbPool.query(query, values);
    return await Ward.findById(id);
  },

  delete: async (id) => {
    const [result] = await dbPool.query('DELETE FROM wards WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};
