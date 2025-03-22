import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import api from '../../services/api';

const TeeTimeManager = () => {
    // State declarations:
    const [teeTimes, setTeeTimes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        courseId: '',
        date: '',
        startTime: '07:00',
        endTime: '17:00',
        interval: 10
    });
    const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchTeeTimes();
        fetchCourses();
    }, []);

    const fetchTeeTimes = async () => {
        try {
            const response = await api.get('/admin/tee-times');
            setTeeTimes(response.data.teeTimes);
        } catch (error) {
            console.error('Error fetching tee times:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/admin/courses');
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/tee-times/bulk', formData);
            setShowModal(false);
            fetchTeeTimes();
        } catch (error) {
            console.error('Error creating tee times:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tee time?')) {
            try {
                await api.delete(`/admin/tee-times/${id}`);
                fetchTeeTimes();
            } catch (error) {
                console.error('Error deleting tee time:', error);
            }
        }
    };

    const handleDeleteAll = async () => {
        try {
            const response = await api.delete('/admin/tee-times/all');
            if (response.data.success) {
                setSuccessMessage(`Successfully deleted ${response.data.deletedCount} tee times`);
                fetchTeeTimes(); // Refresh the list
            }
            setConfirmDeleteAllOpen(false);
        } catch (error) {
            console.error('Error deleting all tee times:', error);
            alert('Failed to delete tee times');
        }
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Manage Tee Times</h2>
                <div>
                    <Button 
                        variant="danger" 
                        className="me-2"
                        onClick={() => setConfirmDeleteAllOpen(true)}
                        disabled={teeTimes.length === 0}
                    >
                        Delete All Unused Times
                    </Button>
                    <Button onClick={() => setShowModal(true)}>Create Tee Times</Button>
                </div>
            </div>

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
            )}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teeTimes.map(teeTime => (
                        <tr key={teeTime.id}>
                            <td>{teeTime.course_name}</td>
                            <td>{teeTime.date}</td>
                            <td>{teeTime.time}</td>
                            <td>{teeTime.available ? 'Available' : 'Booked'}</td>
                            <td>
                                <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => handleDelete(teeTime.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={confirmDeleteAllOpen} onHide={() => setConfirmDeleteAllOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete All</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete all unused tee times? This action cannot be undone.
                    Only tee times without bookings will be deleted.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDeleteAllOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAll}>
                        Delete All
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Tee Times</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Course</Form.Label>
                            <Form.Select
                                value={formData.courseId}
                                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                                required
                            >
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Interval (minutes)</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.interval}
                                onChange={(e) => setFormData({...formData, interval: parseInt(e.target.value)})}
                                min="5"
                                max="60"
                                required
                            />
                        </Form.Group>
                        <Button type="submit">Create</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TeeTimeManager;
