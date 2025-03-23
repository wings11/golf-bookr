import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';
import styles from '../../styles/Auth.module.css';
import api from '../../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', formData);
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', response.data.user.role);
                setMessage({ text: 'Login Successful!', type: 'success' });
                
                // Redirect based on role with a small delay
                setTimeout(() => {
                    const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/booking';
                    navigate(redirectPath);
                }, 1500);
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage({ 
                text: error.response?.data?.message || 'Login failed', 
                type: 'error' 
            });
        }
    };

    return (
        <Container component="main" maxWidth="xs" className={styles.authContainer}>
            <Typography component="h1" variant="h5">Login</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                {message.text && (
                    <Alert severity={message.type} sx={{ mt: 2 }}>
                        {message.text}
                    </Alert>
                )}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Login
                </Button>
                <Box className={styles.authRedirect}>
                    <Link to="/signup">
                        <Typography variant="body2">
                            Don't have an account? Sign up here
                        </Typography>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;