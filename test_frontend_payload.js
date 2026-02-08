import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const testFrontendPayload = async () => {
    try {
        // 1. Login to get token
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'doctor1@hospital.com',
            password: 'Doctor@123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful!');

        // 2. Create patient with FRONTEND payload format
        console.log('\\n2. Creating patient with frontend payload...');
        const frontendPayload = {
            id: Date.now(), // Frontend sends timestamp as ID
            name: "Frontend Test User", // Encoded name
            age: "30", // Encoded age
            gender: "Male",
            bloodGroup: "O+", // Encoded blood group
            address: "123 Test St", // Encoded address
            phone: "9876543210",
            email: "frontend.test@example.com",
            emergencyContact: "1122334455",
            registrationDate: "2024-02-03"
        };

        const createRes = await axios.post(`${API_URL}/patients`, frontendPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Patient created successfully!');
        console.log('   Response data:', createRes.data.data);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

testFrontendPayload();
