import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Typography, Button, TextField, Box, Avatar, Alert,
    List, ListItem, ListItemText, Card, CardContent 
} from '@mui/material';
import styles from '../styles/Profile.module.css';
import api from '../services/api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchUserData();
        fetchUserBookings();
    }, [navigate]);

    const fetchUserData = async () => {
        try {
            console.log('Fetching user data...'); // Debug log
            const response = await api.get('/users/me');
            console.log('User data response:', response.data); // Debug log
            
            if (response.data.success) {
                const userData = response.data.user;
                console.log('Setting user data:', userData); // Debug log
                setUser(userData);
                setFormData({
                    name: userData.name,
                    phone: userData.phone || '',
                    email: userData.email
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            setMessage({ 
                text: 'Failed to load profile data', 
                type: 'error' 
            });
        }
    };

    const fetchUserBookings = async () => {
        try {
            const response = await api.get('/profile/my-bookings');
            if (response.data.success) {
                console.log('Bookings:', response.data.bookings); // Debug log
                setBookings(response.data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setMessage({ 
                text: 'Failed to load booking history', 
                type: 'error' 
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/users/update', formData);
            if (response.data.success) {
                setUser({ ...user, ...formData });
                setMessage({ text: 'Profile updated successfully', type: 'success' });
                setIsEditing(false);
            }
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.message || 'Failed to update profile', 
                type: 'error' 
            });
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await api.delete(`/profile/bookings/${bookingId}`);
            if (response.data.success) {
                setMessage({ text: 'Booking cancelled successfully', type: 'success' });
                fetchUserBookings(); // Refresh the bookings list
            }
        } catch (error) {
            console.error('Cancel booking error:', error);
            setMessage({ 
                text: error.response?.data?.message || 'Failed to cancel booking', 
                type: 'error' 
            });
        }
    };

    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('profilePicture', file);
    
        try {
            setMessage({ text: 'Uploading...', type: 'info' });
            console.log('Uploading file:', file.name);
            
            const response = await api.post('/profile/upload-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.data.success) {
                console.log('Upload successful:', response.data);
                setUser(prev => ({
                    ...prev,
                    profilePicture: response.data.profilePicture
                }));
                setMessage({ text: 'Profile picture updated successfully', type: 'success' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ 
                text: error.response?.data?.message || 'Failed to upload profile picture', 
                type: 'error' 
            });
        }
    };

    const getProfileImage = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/150';
        try {
            console.log('Image path:', imagePath); // Debug log
            const imageUrl = api.getImageUrl(imagePath);
            console.log('Constructed URL:', imageUrl); // Debug log
            return imageUrl;
        } catch (error) {
            console.error('Error constructing image URL:', error);
            return 'https://via.placeholder.com/150';
        }
    };

    const renderProfilePicture = () => {
        if (!user) return null;

        // Use the full URL directly from the server
        const imageUrl = user.profilePicture || 'https://via.placeholder.com/150';
        console.log('Profile picture URL:', imageUrl);

        return (
            <Avatar
                src={imageUrl}
                className={styles.profilePicture}
                alt={user.name}
                variant="square"
                onError={(e) => {
                    console.error('Failed to load image:', e.target.src);
                    e.target.src = 'https://via.placeholder.com/150';
                }}
            />
        );
    };

    return (
        <div className={styles.profileContainer}>
            {user ? (
                <>
                    <Typography variant="h4" gutterBottom>My Profile</Typography>
                    
                    {!isEditing ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            {renderProfilePicture()}
                            <Typography><strong>Name:</strong> {user.name}</Typography>
                            <Typography><strong>Email:</strong> {user.email}</Typography>
                            <Typography><strong>Phone:</strong> {user.phone}</Typography>
                            <Button 
                                variant="contained" 
                                onClick={() => setIsEditing(true)}
                                sx={{ mt: 2 }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ mb: 2, mt: 2 }}>
                                <input
                                    type="file"
                                    id="profile-picture-input"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleProfilePictureUpload}
                                />
                                <label htmlFor="profile-picture-input">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        color="primary"
                                    >
                                        Upload Profile Picture
                                    </Button>
                                </label>
                            </Box>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                            <Box sx={{ mt: 2 }}>
                                <Button type="submit" variant="contained">Save</Button>
                                <Button 
                                    onClick={() => setIsEditing(false)}
                                    sx={{ ml: 2 }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </form>
                    )}

                    {message.text && (
                        <Alert severity={message.type} sx={{ mt: 2 }}>
                            {message.text}
                        </Alert>
                    )}

                    <div className={styles.bookingsContainer}>
                        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
                            My Bookings
                        </Typography>
                        {bookings.length > 0 ? (
                            <List>
                                {bookings.map((booking) => (
                                    <Card key={booking.id} className={styles.bookingCard} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="h6">
                                                {booking.course}
                                            </Typography>
                                            <Typography color="textSecondary">
                                                Date: {formatDate(booking.date)}
                                            </Typography>
                                            <Typography>
                                                Time: {booking.time}
                                            </Typography>
                                            <Typography>
                                                Players: {booking.players}
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                Booking ID: #{booking.id}
                                            </Typography>
                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button 
                                                    variant="outlined" 
                                                    color="error"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                >
                                                    Cancel Booking
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </List>
                        ) : (
                            <Typography color="textSecondary">
                                No bookings found. Ready to play? <Button color="primary" onClick={() => navigate('/booking')}>Book a tee time</Button>
                            </Typography>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;