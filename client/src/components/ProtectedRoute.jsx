import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

const ProtectedRoute = ({ children, requiredRole }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    
    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Check stored role first for faster response
                const storedRole = localStorage.getItem('userRole');
                if (storedRole === requiredRole) {
                    setHasAccess(true);
                    setIsLoading(false);
                    return;
                }

                // Verify with server
                const response = await api.get('/users/me');
                const userRole = response.data.user.role;
                setHasAccess(userRole === requiredRole);
            } catch (error) {
                console.error('Access check error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                setHasAccess(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            setHasAccess(false);
        } else {
            checkAccess();
        }
    }, [requiredRole]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return hasAccess ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
