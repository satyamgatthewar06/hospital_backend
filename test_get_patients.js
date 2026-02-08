import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const testGetPatients = async () => {
    try {
        // 1. Login to get token
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'doctor1@hospital.com',
            password: 'Doctor@123'
        });
        const token = loginRes.data.token;

        // 2. Get patients
        console.log('Fetching patients...');
        const res = await axios.get(`${API_URL}/patients`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Status:', res.status);
        console.log('Count:', res.data.count);
        // Print first patient in full
        if (res.data.data.length > 0) {
            console.log('First Patient:', JSON.stringify(res.data.data[0], null, 2));
            console.log('All Names:', res.data.data.map(p => p.name));
            console.log('All Ages:', res.data.data.map(p => p.age));
        } else {
            console.log('No patients found.');
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
};

testGetPatients();
