import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();

router.post('/SignUp', async (req, res) => {
    console.log('SignUp request received:', {...req.body, password: '[REDACTED]'});
    
    try {
        const { name, username, email, phone, password } = req.body;

        // Input validation
        if (!name?.trim() || !username?.trim() || !email?.trim() || !phone?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Database operation
        try {
            const [result] = await db.execute(
                'INSERT INTO users (name, username, email, phone, password) VALUES (?, ?, ?, ?, ?)',
                [name.trim(), username.trim(), email.trim(), phone.trim(), await bcrypt.hash(password, 10)]
            );

            console.log('User created:', { id: result.insertId });
            
            return res.status(201).json({ 
                success: true, 
                message: 'Registration successful',
                userId: result.insertId
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            if (dbError.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Email or username already exists'
                });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('SignUp error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed: Server error'
        });
    }
});

router.post('/login', async (req, res) => {
    console.log('Login attempt:', { ...req.body, password: '[REDACTED]' });

    try {
        const { email, password } = req.body;
        
        // Exact email match
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        console.log('Found users:', users.length);

        if (users.length === 0) {
            console.log('No user found with email:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const valid = await bcrypt.compare(password, users[0].password);
        console.log('Password validation:', valid);

        if (!valid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const token = jwt.sign(
            { 
                userId: users[0].id,
                role: users[0].role 
            }, 
            process.env.JWT_SECRET
        );

        console.log('Login successful for user:', { 
            id: users[0].id, 
            role: users[0].role 
        });

        res.json({ 
            success: true, 
            token,
            user: {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email,
                role: users[0].role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

export default router;