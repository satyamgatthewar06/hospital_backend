import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hospital_management',
    port: 3306
};

async function testLabRequest() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database');

        // Check lab_requests table structure
        const [columns] = await connection.query('DESCRIBE lab_requests');
        console.log('\n=== LAB_REQUESTS TABLE STRUCTURE ===');
        console.log(columns.map(c => c.Field).join(', '));

        // Try to insert a test request
        const testData = {
            reqId: 'TEST-001',
            patientId: 1,
            patientName: 'Test Patient',
            testName: 'CBC',
            sampleType: 'Blood',
            collectionDate: new Date().toISOString(),
            status: 'Sample Collected',
            priority: 'Normal',
            technicianName: 'John Doe'
        };

        console.log('\n=== ATTEMPTING INSERT ===');
        console.log(testData);

        const [result] = await connection.query(
            `INSERT INTO lab_requests (reqId, patientId, patientName, testName, sampleType, collectionDate, status, priority, technicianName) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [testData.reqId, testData.patientId, testData.patientName, testData.testName, testData.sampleType, testData.collectionDate, testData.status, testData.priority, testData.technicianName]
        );

        console.log('\n=== INSERT SUCCESSFUL ===');
        console.log('Insert ID:', result.insertId);

        // Clean up test data
        await connection.query('DELETE FROM lab_requests WHERE reqId = ?', ['TEST-001']);
        console.log('Test data cleaned up');

        await connection.end();
    } catch (error) {
        console.error('\n=== ERROR ===');
        console.error('Message:', error.message);
        console.error('SQL:', error.sql);
    }
}

testLabRequest();
