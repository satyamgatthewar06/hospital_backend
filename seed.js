import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Ward from './models/Ward.js';
import TPA from './models/TPA.js';
import InsurancePolicy from './models/InsurancePolicy.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Ward.deleteMany({});
    await TPA.deleteMany({});
    await InsurancePolicy.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin User
    const adminUser = await User.create({
      email: 'admin@hospital.com',
      password: 'Admin@123',
      fullName: 'Admin User',
      phone: '9876543210',
      role: 'ADMIN',
      department: 'Administration'
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create Doctor Users
    const doctorUsers = await User.insertMany([
      {
        email: 'doctor1@hospital.com',
        password: 'Doctor@123',
        fullName: 'Dr. Rajesh Kumar',
        phone: '9876543211',
        role: 'DOCTOR',
        department: 'Cardiology',
        specialization: 'Cardiology',
        licenseNumber: 'DL001',
        experience: 10
      },
      {
        email: 'doctor2@hospital.com',
        password: 'Doctor@123',
        fullName: 'Dr. Priya Singh',
        phone: '9876543212',
        role: 'DOCTOR',
        department: 'Pediatrics',
        specialization: 'Pediatrics',
        licenseNumber: 'DL002',
        experience: 8
      },
      {
        email: 'doctor3@hospital.com',
        password: 'Doctor@123',
        fullName: 'Dr. Arjun Patel',
        phone: '9876543213',
        role: 'DOCTOR',
        department: 'Orthopedics',
        specialization: 'Orthopedics',
        licenseNumber: 'DL003',
        experience: 12
      }
    ]);
    console.log('✅ Doctor users created:', doctorUsers.length);

    // Create Staff Users
    const staffUsers = await User.insertMany([
      {
        email: 'nurse1@hospital.com',
        password: 'Nurse@123',
        fullName: 'Nurse Maria',
        phone: '9876543214',
        role: 'NURSE',
        department: 'ICU'
      },
      {
        email: 'tech1@hospital.com',
        password: 'Tech@123',
        fullName: 'Lab Technician John',
        phone: '9876543215',
        role: 'TECHNICIAN',
        department: 'Laboratory'
      },
      {
        email: 'accountant1@hospital.com',
        password: 'Account@123',
        fullName: 'Accountant Sarah',
        phone: '9876543216',
        role: 'ACCOUNTANT',
        department: 'Billing'
      }
    ]);
    console.log('✅ Staff users created:', staffUsers.length);

    // Create Patients
    const patients = await Patient.insertMany([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '9876543220',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Male',
        bloodGroup: 'O+',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        allergies: ['Penicillin'],
        currentMedications: ['Aspirin']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '9876543221',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'Female',
        bloodGroup: 'AB+',
        address: '456 Oak Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        allergies: ['Sulfa'],
        currentMedications: []
      },
      {
        firstName: 'Raj',
        lastName: 'Patel',
        email: 'raj.patel@example.com',
        phone: '9876543222',
        dateOfBirth: new Date('1978-12-10'),
        gender: 'Male',
        bloodGroup: 'B+',
        address: '789 Pine Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        allergies: [],
        currentMedications: ['Metformin']
      }
    ]);
    console.log('✅ Patients created:', patients.length);

    // Create Wards
    const wards = await Ward.insertMany([
      {
        wardName: 'ICU Ward',
        wardType: 'ICU',
        totalBeds: 20,
        availableBeds: 15,
        charges: 5000
      },
      {
        wardName: 'General Ward',
        wardType: 'GENERAL',
        totalBeds: 50,
        availableBeds: 30,
        charges: 2000
      },
      {
        wardName: 'Private Ward',
        wardType: 'PRIVATE',
        totalBeds: 10,
        availableBeds: 7,
        charges: 8000
      },
      {
        wardName: 'Pediatrics Ward',
        wardType: 'PEDIATRICS',
        totalBeds: 15,
        availableBeds: 12,
        charges: 3000
      }
    ]);
    console.log('✅ Wards created:', wards.length);

    // Create TPAs
    const tpas = await TPA.insertMany([
      {
        tpaName: 'Apollo Insurance',
        tpaCode: 'APL001',
        contactPerson: 'Mr. Sharma',
        email: 'contact@apolloinsurance.com',
        phone: '9876543230',
        address: 'Apollo Building, Mumbai',
        bankAccount: '123456789',
        bankIFSC: 'APOL0001'
      },
      {
        tpaName: 'Max Health Insurance',
        tpaCode: 'MAX001',
        contactPerson: 'Ms. Gupta',
        email: 'contact@maxhealth.com',
        phone: '9876543231',
        address: 'Max Tower, Delhi',
        bankAccount: '987654321',
        bankIFSC: 'MAXH0001'
      },
      {
        tpaName: 'Star Health Insurance',
        tpaCode: 'STAR001',
        contactPerson: 'Mr. Verma',
        email: 'contact@starhealth.com',
        phone: '9876543232',
        address: 'Star Plaza, Bangalore',
        bankAccount: '555666777',
        bankIFSC: 'STAR0001'
      }
    ]);
    console.log('✅ TPAs created:', tpas.length);

    // Create Insurance Policies
    const policies = await InsurancePolicy.insertMany([
      {
        patientId: patients[0]._id,
        tpaId: tpas[0]._id,
        policyNumber: 'POL001001',
        insuranceCompany: 'Apollo Insurance',
        coverageAmount: 500000,
        copayPercentage: 20,
        deductible: 5000,
        activationDate: new Date(),
        expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: patients[1]._id,
        tpaId: tpas[1]._id,
        policyNumber: 'POL002001',
        insuranceCompany: 'Max Health Insurance',
        coverageAmount: 750000,
        copayPercentage: 15,
        deductible: 3000,
        activationDate: new Date(),
        expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: patients[2]._id,
        tpaId: tpas[2]._id,
        policyNumber: 'POL003001',
        insuranceCompany: 'Star Health Insurance',
        coverageAmount: 600000,
        copayPercentage: 10,
        deductible: 2000,
        activationDate: new Date(),
        expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log('✅ Insurance Policies created:', policies.length);

    console.log('\n✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('\nTest Credentials:');
    console.log('Admin:     admin@hospital.com / Admin@123');
    console.log('Doctor:    doctor1@hospital.com / Doctor@123');
    console.log('Nurse:     nurse1@hospital.com / Nurse@123');
    console.log('Accountant: accountant1@hospital.com / Account@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
