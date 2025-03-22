import bcrypt from 'bcrypt';
import { db } from '../db.js';

const admins = [
    {
        name: 'Admin User',
        username: 'admin',
        email: 'admin@golfbookr.com',
        password: 'admin123',
        role: 'admin'
    },
    {
        name: 'Golf Manager',
        username: 'manager',
        email: 'manager@golfbookr.com',
        password: 'manager123',
        role: 'admin'
    },
    {
        name: 'Course Admin',
        username: 'course_admin',
        email: 'course@golfbookr.com',
        password: 'course123',
        role: 'admin'
    }
];

async function createAdmins() {
    try {
        // Delete existing admin accounts
        const emails = admins.map(admin => admin.email);
        await db.execute('DELETE FROM users WHERE email IN (?)', [emails]);
        
        // Create new admin accounts
        for (const admin of admins) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await db.execute(
                'INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
                [admin.name, admin.username, admin.email, hashedPassword, admin.role]
            );
            console.log(`Admin ${admin.username} created successfully`);
        }

        console.log('\nAll admin accounts created successfully');
        console.log('\nAdmin Credentials:');
        admins.forEach(admin => {
            console.log(`\nUsername: ${admin.username}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Password: ${admin.password}`);
            console.log('------------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating admins:', error);
        process.exit(1);
    }
}

createAdmins();
