// Mock Database Seeder - In-Memory Data Population
import mockDB from './db/mockDatabase.js';

console.log('🌱 Seeding Mock Database with Sample Data...\n');

try {
  // Add sample doctors
  mockDB.createDoctor({
    name: 'Dr. Rajesh Kumar',
    specialization: 'Cardiology',
    license: 'LIC123456',
    phone: '9876543210',
    email: 'rajesh@hospital.com',
    experience: 10
  });

  mockDB.createDoctor({
    name: 'Dr. Priya Singh',
    specialization: 'Pediatrics',
    license: 'LIC123457',
    phone: '9876543211',
    email: 'priya@hospital.com',
    experience: 8
  });

  mockDB.createDoctor({
    name: 'Dr. Amit Patel',
    specialization: 'Orthopedics',
    license: 'LIC123458',
    phone: '9876543212',
    email: 'amit@hospital.com',
    experience: 12
  });

  // Add sample patients
  mockDB.createPatient({
    name: 'Ramesh Verma',
    age: 45,
    gender: 'Male',
    phone: '9876543220',
    email: 'ramesh@email.com',
    address: '123 Main Street, City',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    medicalHistory: 'Diabetes, Hypertension'
  });

  mockDB.createPatient({
    name: 'Sunita Sharma',
    age: 35,
    gender: 'Female',
    phone: '9876543221',
    email: 'sunita@email.com',
    address: '456 Oak Avenue, City',
    bloodGroup: 'A+',
    allergies: 'None',
    medicalHistory: 'Asthma'
  });

  mockDB.createPatient({
    name: 'Vikram Singh',
    age: 28,
    gender: 'Male',
    phone: '9876543222',
    email: 'vikram@email.com',
    address: '789 Pine Road, City',
    bloodGroup: 'B+',
    allergies: 'Latex',
    medicalHistory: 'None'
  });

  // Add sample appointments
  mockDB.createAppointment({
    patientId: mockDB.getPatients()[0]?._id || '1',
    doctorId: mockDB.getDoctors()[0]?._id || '1',
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    appointmentTime: '10:00 AM',
    status: 'scheduled',
    reason: 'Regular Checkup'
  });

  mockDB.createAppointment({
    patientId: mockDB.getPatients()[1]?._id || '2',
    doctorId: mockDB.getDoctors()[1]?._id || '2',
    appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    appointmentTime: '2:00 PM',
    status: 'scheduled',
    reason: 'Follow-up'
  });

  const stats = mockDB.getStats();

  console.log('✅ Mock Database Seeded Successfully!\n');
  console.log('📊 Data Summary:');
  console.log(`   • Users: ${stats.users}`);
  console.log(`   • Patients: ${stats.patients}`);
  console.log(`   • Doctors: ${stats.doctors}`);
  console.log(`   • Appointments: ${stats.appointments}`);
  console.log(`   • Wards: ${stats.wards}`);
  console.log(`\n💾 Database Mode: ${stats.mode}`);
  console.log('💡 Note: Data stored in memory - will reset on server restart\n');

} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}
