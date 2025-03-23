import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    }
});

router.get('/current-user', auth, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, phone, profile_picture FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: users[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/my-bookings', auth, async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT 
                b.id,
                b.players,
                b.booking_date,
                t.date,
                t.time,
                c.name as course
            FROM bookings b
            JOIN tee_times t ON b.tee_time_id = t.id
            JOIN courses c ON t.course_id = c.id
            WHERE b.user_id = ?
            ORDER BY t.date DESC, t.time DESC
        `, [req.user.id]);

        console.log('Found bookings:', bookings); // Debug log
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/bookings/:id', auth, async (req, res) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await db.getConnection();
        
        // Start transaction
        await connection.beginTransaction();

        // First verify the booking exists and belongs to user
        const [bookings] = await connection.execute(
            'SELECT tee_time_id FROM bookings WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Booking not found or unauthorized'
            });
        }

        const teeTimeId = bookings[0].tee_time_id;

        // Delete booking and update tee time
        await connection.execute(
            'DELETE FROM bookings WHERE id = ?', 
            [req.params.id]
        );
        
        await connection.execute(
            'UPDATE tee_times SET available = true WHERE id = ?',
            [teeTimeId]
        );

        // Commit the transaction
        await connection.commit();
        
        res.json({ success: true, message: 'Booking cancelled successfully' });

    } catch (error) {
        // Rollback on error
        if (connection) {
            await connection.rollback();
        }
        console.error('Error cancelling booking:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        // Always release the connection
        if (connection) {
            connection.release();
        }
    }
});

// Add new route for profile picture upload
router.post('/upload-picture', auth, upload.single('profilePicture'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
        // Store relative path
        const relativePath = `uploads/profiles/${path.basename(req.file.path)}`;
        
        // Clean up old profile picture
        const [oldUser] = await db.execute(
            'SELECT profile_picture FROM users WHERE id = ?',
            [req.user.id]
        );

        if (oldUser[0]?.profile_picture) {
            const oldPath = path.join(process.cwd(), oldUser[0].profile_picture.replace(/^http.*?\//, ''));
            try {
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            } catch (err) {
                console.error('Error deleting old profile picture:', err);
            }
        }

        // Update database
        await db.execute(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [relativePath, req.user.id]
        );

        // Return full URL
        const fullUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${relativePath}`;

        res.json({ 
            success: true, 
            message: 'Profile picture updated',
            profilePicture: fullUrl
        });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;