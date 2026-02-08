
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const repairSchema = async () => {
    try {
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hospital_management',
            port: process.env.DB_PORT || 3306,
        };

        const pool = mysql.createPool(config);
        const connection = await pool.getConnection();
        console.log('🔧 Starting Schema Repair & Seed...');

        // 1. Create IPD Admissions Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ipd_admissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patientId INT,
                doctorId INT,
                wardId INT,
                admissionDate DATETIME,
                dischargeDate DATETIME,
                diagnosis TEXT,
                treatmentPlan TEXT,
                attendingNurse VARCHAR(255),
                roomNumber VARCHAR(50),
                bedNumber VARCHAR(50),
                emergencyContactName VARCHAR(255),
                emergencyContactPhone VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Admitted',
                notes TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL,
                FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Checked/Created ipd_admissions');

        // 2. Create Billing Table (General)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS billing (
                id INT AUTO_INCREMENT PRIMARY KEY,
                billNumber VARCHAR(50) UNIQUE NOT NULL,
                patientId INT,
                billDate DATETIME,
                dueDate DATETIME,
                items JSON,
                subtotal DECIMAL(10,2),
                taxes DECIMAL(10,2),
                discount DECIMAL(10,2),
                totalAmount DECIMAL(10,2),
                amountPaid DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'Pending',
                paymentMethod VARCHAR(50),
                notes TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Checked/Created billing');

        // 3. Seed Wards (if empty)
        const [wards] = await connection.query('SELECT COUNT(*) as count FROM wards');
        if (wards[0].count === 0) {
            console.log('🌱 Seeding Wards...');
            const wardData = [
                ['WARD001', 'General Ward', 'General', 20, 15, 1, 'WiFi, TV', 'Active'],
                ['WARD002', 'ICU', 'ICU', 10, 5, 2, 'Ventilator, Monitor', 'Active'],
                ['WARD003', 'Private Suite', 'Private', 5, 2, 3, 'AC, TV, Fridge', 'Active']
            ];
            for (const w of wardData) {
                await connection.query(
                    `INSERT INTO wards (wardId, wardName, wardType, totalBeds, availableBeds, floorNumber, facilities, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    w
                );
            }
        }

        // 4. Seed Staff (if empty)
        const [staff] = await connection.query('SELECT COUNT(*) as count FROM staff');
        if (staff[0].count === 0) {
            console.log('🌱 Seeding Staff...');
            const staffData = [
                ['STF001', 'John', 'Doe', 'Lab Technician', 'Pathology', '555-0101', 'john@hospital.com', 'Morning', 'B.Sc MLT', '2023-01-01', 'Active'],
                ['STF002', 'Jane', 'Smith', 'Nurse', 'IPD', '555-0102', 'jane@hospital.com', 'Night', 'B.Sc Nursing', '2023-02-01', 'Active'],
                ['STF003', 'Bob', 'Brown', 'Receptionist', 'Front Desk', '555-0103', 'bob@hospital.com', 'Day', 'B.A.', '2023-03-01', 'Active']
            ];
            for (const s of staffData) {
                await connection.query(
                    `INSERT INTO staff (staffId, firstName, lastName, role, department, phone, email, shiftTiming, qualifications, joiningDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    s
                );
            }
        }

        // 5. Seed TPA (if empty)
        const [tpas] = await connection.query('SELECT COUNT(*) as count FROM tpa');
        if (tpas[0].count === 0) {
            console.log('🌱 Seeding TPA...');
            const tpaData = [
                ['TPA001', 'Star Health', 'Manager A', 'star@tpa.com', '1800-111-222', 'Mumbai', 'All Major Hospitals', 24, 'Active'],
                ['TPA002', 'HDFC ERGO', 'Manager B', 'hdfc@tpa.com', '1800-333-444', 'Delhi', 'Pan India', 48, 'Active']
            ];
            for (const t of tpaData) {
                await connection.query(
                    `INSERT INTO tpa (tpaId, tpaName, contactPerson, email, phone, address, networkHospitals, claimProcessingTime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    t
                );
            }
        }

        connection.release();
        await pool.end();
        console.log('🏁 System Repair Complete. All modules should be functional.');

    } catch (e) {
        console.error('Repair Error:', e);
    }
};

repairSchema();
