import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const testPatientRoutes = async () => {
    try {
        // 1. Login to get token
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'doctor1@hospital.com',
            password: 'Doctor@123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful! Token:', token.substring(0, 30) + '...');

        // 2. Get all patients
        console.log('\\n2. Getting all patients...');
        const patientsRes = await axios.get(`${API_URL}/patients`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${patientsRes.data.count} patients`);

        // 3. Create a new patient
        console.log('\\n3. Creating new patient...');
        const newPatient = {
            patientId: 'PAT' + Date.now(),
            firstName: 'Test',
            lastName: 'Patient',
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            bloodType: 'O+',
            phone: '1234567890',
            email: 'test@example.com'
        };

        const createRes = await axios.post(`${API_URL}/patients`, newPatient, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Patient created:', createRes.data.data);

        console.log('\\n🎉 All patient routes working!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

testPatientRoutes();
