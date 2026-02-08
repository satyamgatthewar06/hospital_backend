
import { dbPool } from './server.js';

async function checkSchema() {
    try {
        const [rows] = await dbPool.query('DESCRIBE lab_requests');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
