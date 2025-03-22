import express from 'express';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';
import { broadcastBookingUpdate } from '../websocket.js';

const router = express.Router();

router.get('/tee-times', async (req, res) => {  // Fixed endpoint name from tee_times to tee-times
    try {
        const { courseId, date } = req.query;
        if (!courseId || !date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course ID and date are required' 
            });
        }

        const [teeTimes] = await db.execute(`
            SELECT t.*, c.name as course_name, c.description as course_description 
            FROM tee_times t
            JOIN courses c ON t.course_id = c.id
            WHERE t.course_id = ? AND t.date = ? AND t.available = true
            ORDER BY t.time`,
            [courseId, date]
        );
        res.json({ success: true, teeTimes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/book', auth, async (req, res) => {
    try {
        const { teeTimeId, players } = req.body;
        const userId = req.user.id;

        await db.execute(
            'INSERT INTO bookings (user_id, tee_time_id, players) VALUES (?, ?, ?)',
            [userId, teeTimeId, players]
        );

        await db.execute(
            'UPDATE tee_times SET available = false WHERE id = ?',
            [teeTimeId]
        );

        broadcastBookingUpdate(); // Notify all admin dashboards
        res.json({ success: true, message: 'Booking confirmed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/create-tee-time', auth, async (req, res) => {
    try {
        const { courseId, date, time, holes } = req.body;
        
        // Validate time format and availability
        const [existingTimes] = await db.execute(
            'SELECT * FROM tee_times WHERE course_id = ? AND date = ? AND time = ?',
            [courseId, date, time]
        );

        if (existingTimes.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'This time slot is already taken' 
            });
        }

        // Create new tee time
        const [result] = await db.execute(
            'INSERT INTO tee_times (course_id, date, time, holes, available) VALUES (?, ?, ?, ?, true)',
            [courseId, date, time, holes]
        );

        res.json({ 
            success: true, 
            message: 'Tee time created successfully',
            teeTimeId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get available courses
router.get('/courses', async (req, res) => {
    try {
        const [courses] = await db.execute('SELECT * FROM courses');
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get tee times for a specific date range
router.get('/tee-times-range', async (req, res) => {
    try {
        const { startDate, endDate, courseId } = req.query;
        const [teeTimes] = await db.execute(
            'SELECT t.*, c.name as course_name FROM tee_times t ' +
            'JOIN courses c ON t.course_id = c.id ' +
            'WHERE t.date BETWEEN ? AND ? AND (? IS NULL OR t.course_id = ?) ' +
            'ORDER BY t.date, t.time',
            [startDate, endDate, courseId, courseId]
        );
        res.json({ success: true, teeTimes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        // Verify the booking belongs to the user
        const [bookings] = await db.execute(
            'SELECT tee_time_id FROM bookings WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or unauthorized' 
            });
        }

        // Delete the booking
        await db.execute('DELETE FROM bookings WHERE id = ?', [req.params.id]);
        
        // Make tee time available again
        await db.execute(
            'UPDATE tee_times SET available = true WHERE id = ?',
            [bookings[0].tee_time_id]
        );
        
        broadcastBookingUpdate(); // Notify all admin dashboards
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
