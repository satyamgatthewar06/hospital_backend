// In-Memory Mock Database for Hospital Management System
// This provides instant data storage without MongoDB

const mockDatabase = {
  users: [
    {
      _id: '1',
      username: 'admin',
      email: 'admin@hospital.com',
      password: 'hashed_password', // In real app, would be hashed
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  patients: [],
  doctors: [],
  appointments: [],
  staff: [],
  wards: [
    {
      _id: '1',
      wardName: 'ICU',
      wardType: 'ICU',
      totalBeds: 20,
      availableBeds: 18,
      charges: 5000,
      createdAt: new Date()
    },
    {
      _id: '2',
      wardName: 'General Ward',
      wardType: 'GENERAL',
      totalBeds: 50,
      availableBeds: 35,
      charges: 2000,
      createdAt: new Date()
    }
  ],
  opd: [],
  ipd: [],
  billing: [],
  laboratory: [],
  tpa: [],
  insurancePolicies: [],
  insuranceClaims: [],
  reports: []
};

// Mock Database Helper Functions
export const mockDB = {
  // User operations
  createUser: (userData) => {
    const user = {
      _id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDatabase.users.push(user);
    return user;
  },

  findUserByUsername: (username) => {
    return mockDatabase.users.find(u => u.username === username);
  },

  findUserById: (id) => {
    return mockDatabase.users.find(u => u._id === id);
  },

  // Patient operations
  createPatient: (patientData) => {
    const patient = {
      _id: Date.now().toString(),
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDatabase.patients.push(patient);
    return patient;
  },

  getPatients: () => mockDatabase.patients,

  getPatientById: (id) => {
    return mockDatabase.patients.find(p => p._id === id);
  },

  updatePatient: (id, updateData) => {
    const patient = mockDatabase.patients.find(p => p._id === id);
    if (patient) {
      Object.assign(patient, updateData);
      patient.updatedAt = new Date();
    }
    return patient;
  },

  deletePatient: (id) => {
    const index = mockDatabase.patients.findIndex(p => p._id === id);
    if (index !== -1) {
      return mockDatabase.patients.splice(index, 1)[0];
    }
  },

  // Doctor operations
  createDoctor: (doctorData) => {
    const doctor = {
      _id: Date.now().toString(),
      ...doctorData,
      createdAt: new Date()
    };
    mockDatabase.doctors.push(doctor);
    return doctor;
  },

  getDoctors: () => mockDatabase.doctors,

  // Appointment operations
  createAppointment: (appointmentData) => {
    const appointment = {
      _id: Date.now().toString(),
      ...appointmentData,
      createdAt: new Date()
    };
    mockDatabase.appointments.push(appointment);
    return appointment;
  },

  getAppointments: () => mockDatabase.appointments,

  // Generic CRUD helper
  create: (collection, data) => {
    const record = {
      _id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    if (!mockDatabase[collection]) {
      mockDatabase[collection] = [];
    }
    mockDatabase[collection].push(record);
    return record;
  },

  getAll: (collection) => {
    return mockDatabase[collection] || [];
  },

  getById: (collection, id) => {
    return (mockDatabase[collection] || []).find(item => item._id === id);
  },

  update: (collection, id, data) => {
    const item = (mockDatabase[collection] || []).find(item => item._id === id);
    if (item) {
      Object.assign(item, data);
      item.updatedAt = new Date();
    }
    return item;
  },

  delete: (collection, id) => {
    const arr = mockDatabase[collection] || [];
    const index = arr.findIndex(item => item._id === id);
    if (index !== -1) {
      return arr.splice(index, 1)[0];
    }
  },

  // Get database stats
  getStats: () => {
    return {
      users: mockDatabase.users.length,
      patients: mockDatabase.patients.length,
      doctors: mockDatabase.doctors.length,
      appointments: mockDatabase.appointments.length,
      wards: mockDatabase.wards.length,
      staff: mockDatabase.staff.length,
      mode: 'IN_MEMORY',
      note: 'Data will be cleared when server restarts'
    };
  }
};

export default mockDB;
