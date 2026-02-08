import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
let token = '';
let ipdId = 0;
let patientId = 0;
let doctorId = 0;
let wardId = 0;

const login = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@hospital.com',
            password: 'Admin@123'
        });
        token = res.data.token;
        console.log('✅ Login successful');
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        process.exit(1);
    }
};

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${token}` }
});

const getIds = async () => {
    try {
        const [pRes, dRes, wRes] = await Promise.all([
            axios.get(`${API_URL}/patients`, getHeaders()),
            axios.get(`${API_URL}/doctors`, getHeaders()),
            axios.get(`${API_URL}/wards`, getHeaders())
        ]);

        if (pRes.data.data.length > 0) patientId = pRes.data.data[0].id;
        else throw new Error("No patients");

        if (dRes.data.data.length > 0) doctorId = dRes.data.data[0].id;
        else throw new Error("No doctors");

        if (wRes.data.data.length > 0) wardId = wRes.data.data[0].id;
        else throw new Error("No wards");

        console.log(`✅ IDs Fetched - Patient: ${patientId}, Doctor: ${doctorId}, Ward: ${wardId}`);

    } catch (error) {
        console.error('❌ Failed to fetch required IDs:', error.message);
        process.exit(1);
    }
};

const createDummyIPD = async () => {
    try {
        const res = await axios.post(`${API_URL}/ipd`, {
            patientId: patientId,
            doctorId: doctorId,
            wardId: wardId,
            admissionDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            bedNumber: '101',
            diagnosis: 'Test Diagnosis',
            treatmentPlan: 'Test Plan',
            emergencyContactName: 'Emergency',
            emergencyContactPhone: '999'
        }, getHeaders());

        ipdId = res.data.data.insertId || res.data.data.id;
        console.log(`✅ IPD Record created with ID: ${ipdId}`);
    } catch (error) {
        console.error('❌ Failed to create IPD record:', error.message, error.response?.data);
        try {
            const res = await axios.get(`${API_URL}/ipd`, getHeaders());
            if (res.data.data.length > 0) {
                ipdId = res.data.data[0].id; // Ensure consistent ID access
                console.log(`⚠️ Using existing IPD ID: ${ipdId}`);
            } else {
                process.exit(1);
            }
        } catch (e) {
            process.exit(1);
        }
    }
};

const testNursingNotes = async () => {
    try {
        await axios.post(`${API_URL}/ipd-details/${ipdId}/nursing-notes`, {
            nurseName: 'Nurse Joy',
            note: 'Patient is stable.'
        }, getHeaders());
        console.log('✅ Added Nursing Note');

        const res = await axios.get(`${API_URL}/ipd-details/${ipdId}/nursing-notes`, getHeaders());
        if (res.data.data.length > 0) console.log('✅ Fetched Nursing Notes');
        else console.error('❌ Nursing Notes verification failed');
    } catch (error) {
        console.error('❌ Nursing Notes failed:', error.message);
    }
};

const testDoctorRounds = async () => {
    try {
        await axios.post(`${API_URL}/ipd-details/${ipdId}/doctor-rounds`, {
            doctorName: 'Dr. House',
            observation: ' Lupus?',
            instruction: 'More tests.'
        }, getHeaders());
        console.log('✅ Added Doctor Round');
    } catch (error) {
        console.error('❌ Doctor Rounds failed:', error.message);
    }
};

const runTests = async () => {
    await login();
    await getIds();
    await createDummyIPD();
    await testNursingNotes();
    await testDoctorRounds();
    console.log('Tests finished.');
};

runTests();
