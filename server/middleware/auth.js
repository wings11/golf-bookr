import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const auth = (req, res, next) => {
    try {
        console.log('Auth headers:', req.headers);
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId };
        console.log('Auth successful for user:', decoded.userId);
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};
