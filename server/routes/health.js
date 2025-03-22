import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [result] = await db.execute('SELECT 1');
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({
            success: false,
            status: 'error',
            message: error.message || 'Database connection failed'
        });
    }
});

export default router;
