import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';
import styles from '../../styles/Auth.module.css';
import api from '../../services/api';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validatePasswords = () => {
        if (formData.password !== formData.confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return false;
        }
        return true;
    };

    const validateForm = () => {
        if (!formData.name || !formData.username || !formData.email || 
            !formData.phone || !formData.password || !formData.confirmPassword) {
            setMessage({ text: 'All fields are required', type: 'error' });
            return false;
        }
        if (!formData.email.includes('@')) {
            setMessage({ text: 'Invalid email format', type: 'error' });
            return false;
        }
        if (formData.password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
            return false;
        }
        return validatePasswords();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setMessage({ text: 'Processing...', type: 'info' });
            console.log('Submitting signup data:', {
                ...formData,
                password: '[REDACTED]'
            });

            const response = await api.post('/auth/SignUp', {
                name: formData.name.trim(),
                username: formData.username.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            console.log('Signup response:', response.data);

            if (response.data.success) {
                setMessage({ text: 'Registration successful!', type: 'success' });
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (error) {
            console.error('Signup error:', error.response || error);
            setMessage({ 
                text: error.response?.data?.message || 
                      'Registration failed. Please check your information and try again.',
                type: 'error' 
            });
        }
    };

    return (
        <Container component="main" maxWidth="xs" className={styles.authContainer}>
            <Typography component="h1" variant="h5">
                Sign Up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                    Sign Up
                </Button>
                <Box className={styles.authRedirect}>
                    <Link to="/login">
                        <Typography variant="body2">
                            Already have an account? Login here
                        </Typography>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default SignUp;