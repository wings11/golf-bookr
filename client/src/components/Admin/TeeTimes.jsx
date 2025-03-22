import { useState, useEffect } from 'react';
import { 
    Button, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle, Alert 
} from '@mui/material';
import api from '../../services/api';

const TeeTimes = () => {
    const [teeTimes, setTeeTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedTeeTime, setSelectedTeeTime] = useState(null);

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

    useEffect(() => {
        fetchTeeTimes();
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

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Tee Times</h2>
                <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={loading || teeTimes.length === 0}
                >
                    Delete All Unused Tee Times
                </Button>
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

            {/* Add Table Component */}
            <div className="card bg-transparent">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Course</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : teeTimes.length > 0 ? (
                                    teeTimes.map((teeTime) => (
                                        <tr key={teeTime.id}>
                                            <td>{new Date(teeTime.date).toLocaleDateString()}</td>
                                            <td>{teeTime.time}</td>
                                            <td>{teeTime.course_name}</td>
                                            <td>
                                                <span className={`badge ${teeTime.available ? 'bg-success' : 'bg-danger'}`}>
                                                    {teeTime.available ? 'Available' : 'Booked'}
                                                </span>
                                            </td>
                                            <td>{new Date(teeTime.updated_at || teeTime.created_at).toLocaleString()}</td>
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
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            No tee times found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
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
