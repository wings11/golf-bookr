import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const createPool = async (retries = MAX_RETRIES) => {
    try {
        console.log('Creating database pool...');
        console.log('DB_HOST:', process.env.DB_HOST);
        
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            ssl: {
                rejectUnauthorized: false
            },
            port: process.env.DB_PORT || 3306,
            connectTimeout: 10000
        });

        // Test the connection
        const [result] = await pool.execute('SELECT 1');
        console.log('Database connection test successful:', result);
        return pool;
    } catch (error) {
        console.error(`Database connection failed (attempts left: ${retries}):`, {
            code: error.code,
            message: error.message,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME
        });
        
        if (retries > 0) {
            console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return createPool(retries - 1);
        }
        
        throw error;
    }
};

let pool = null;

export const db = {
    execute: async (...args) => {
        if (!pool) {
            pool = await createPool();
        }
        try {
            return await pool.execute(...args);
        } catch (error) {
            if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                pool = await createPool();
                return await pool.execute(...args);
            }
            throw error;
        }
    }
};
