import { useState, useEffect } from 'react';
import { 
    Button, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle, Alert,
    TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import api from '../../services/api';

const TeeTimes = () => {
    const [teeTimes, setTeeTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedTeeTime, setSelectedTeeTime] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        courseId: '',
        date: '',
        startTime: '07:00',
        endTime: '17:00',
        interval: 10,
        maxPlayers: 4,
        specialNotes: '',
    });
    const [courses, setCourses] = useState([]);

    const fetchTeeTimes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/tee-times');
            if (response.data.success) {
                setTeeTimes(response.data.teeTimes);
            }
        } catch (error) {
            setError('Failed to load tee times');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/admin/courses');
            if (response.data.success) {
                setCourses(response.data.courses);
            }
        } catch (error) {
            setError('Failed to load courses');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTeeTimes();
        fetchCourses();
    }, []);

    const handleDeleteAll = async () => {
        try {
            setLoading(true);
            const response = await api.delete('/admin/tee-times/all');
            if (response.data.success) {
                setSuccessMessage(`Successfully deleted ${response.data.deletedCount} tee times`);
                fetchTeeTimes(); // Refresh the list
            }
        } catch (error) {
            setError('Failed to delete tee times');
            console.error(error);
        } finally {
            setLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    const handleCreateTeeTimes = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post('/admin/tee-times/bulk', {
                ...formData,
                maxPlayers: parseInt(formData.maxPlayers)
            });
            if (response.data.success) {
                setSuccessMessage(`Successfully created ${response.data.count} tee times`);
                setShowCreateModal(false);
                fetchTeeTimes();
            }
        } catch (error) {
            setError('Failed to create tee times');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Tee Times</h2>
                <div>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => setShowCreateModal(true)}
                        sx={{ mr: 2 }}
                    >
                        Create Tee Times
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={() => setConfirmDialogOpen(true)}
                        disabled={loading || teeTimes.length === 0}
                    >
                        Delete All Unused Tee Times
                    </Button>
                </div>
            </div>

            {error && (
                <Alert severity="error" className="mb-3" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {successMessage && (
                <Alert severity="success" className="mb-3" onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            <div className="card bg-transparent">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Max Players</th>
                                    <th>Status</th>
                                    <th>Special Notes</th>
                                    <th>Created</th>
                                    <th>Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="9" className="text-center">Loading...</td></tr>
                                ) : teeTimes.length > 0 ? (
                                    teeTimes.map((teeTime) => (
                                        <tr key={teeTime.id}>
                                            <td>{teeTime.course_name}</td>
                                            <td>{new Date(teeTime.date).toLocaleDateString()}</td>
                                            <td>{teeTime.time}</td>
                                            <td>{teeTime.max_players}</td>
                                            <td>
                                                <span className={`badge ${teeTime.available ? 'bg-success' : 'bg-danger'}`}>
                                                    {teeTime.available ? 'Available' : 'Booked'}
                                                </span>
                                            </td>
                                            <td>
                                                {teeTime.special_notes ? (
                                                    <span title={teeTime.special_notes}>
                                                        {teeTime.special_notes.substring(0, 20)}
                                                        {teeTime.special_notes.length > 20 ? '...' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>{new Date(teeTime.created_at).toLocaleString()}</td>
                                            <td>{new Date(teeTime.updated_at).toLocaleString()}</td>
                                            <td>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => {
                                                        setSelectedTeeTime(teeTime);
                                                        setConfirmDialogOpen(true);
                                                    }}
                                                    disabled={!teeTime.available}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="9" className="text-center">No tee times found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Tee Times</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleCreateTeeTimes}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Select Course</InputLabel>
                            <Select
                                value={formData.courseId}
                                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                                required
                            >
                                {courses.map(course => (
                                    <MenuItem key={course.id} value={course.id}>
                                        {course.name} ({course.holes} holes)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="normal"
                            type="date"
                            label="Date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                            required
                        />

                        <div className="d-flex gap-3">
                            <TextField
                                type="time"
                                label="Start Time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                type="time"
                                label="End Time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{ flex: 1 }}
                            />
                        </div>

                        <div className="d-flex gap-3 mt-3">
                            <TextField
                                type="number"
                                label="Interval (minutes)"
                                value={formData.interval}
                                onChange={(e) => setFormData({...formData, interval: e.target.value})}
                                InputProps={{ inputProps: { min: 5, max: 60 } }}
                                required
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                type="number"
                                label="Max Players"
                                value={formData.maxPlayers}
                                onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})}
                                InputProps={{ inputProps: { min: 1, max: 4 } }}
                                required
                                sx={{ flex: 1 }}
                            />
                        </div>

                        <TextField
                            multiline
                            rows={3}
                            fullWidth
                            margin="normal"
                            label="Special Notes"
                            value={formData.specialNotes}
                            onChange={(e) => setFormData({...formData, specialNotes: e.target.value})}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button onClick={handleCreateTeeTimes} variant="contained" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Confirm Delete All</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete all unused tee times? This action cannot be undone.
                        Only tee times without bookings will be deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAll} color="error" variant="contained">
                        Delete All
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TeeTimes;