import express from 'express';
import { auth } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

// Get current user info
router.get('/me', auth, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, phone, profile_picture FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Add baseURL to profile picture
        const user = users[0];
        if (user.profile_picture) {
            user.profile_picture = `${process.env.BASE_URL || 'http://localhost:3000'}/${user.profile_picture}`;
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        
        await db.execute(
            'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?',
            [name, phone, email, req.user.id]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
