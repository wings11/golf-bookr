import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import api from '../../services/api';

const CourseManager = () => {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        holes: 18,
        location: '',
        facilities: '',
        difficulty_level: 'intermediate',
        caddie_required: false,
        golf_cart_available: true,
        club_rental_available: true
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

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
            // Convert boolean values to integers for MySQL
            const submitData = {
                ...formData,
                caddie_required: formData.caddie_required ? 1 : 0,
                golf_cart_available: formData.golf_cart_available ? 1 : 0,
                club_rental_available: formData.club_rental_available ? 1 : 0
            };

            if (editingId) {
                await api.put(`/admin/courses/${editingId}`, submitData);
            } else {
                await api.post('/admin/courses', submitData);
            }
            
            await fetchCourses(); // Refresh the courses list
            setShowModal(false);
            resetForm();
            
        } catch (error) {
            console.error('Error saving course:', error.response?.data || error);
            alert(error.response?.data?.message || 'Error saving course');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/admin/courses/${id}`);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ 
            name: '', 
            description: '', 
            holes: 18,
            location: '',
            facilities: '',
            difficulty_level: 'intermediate',
            caddie_required: false,
            golf_cart_available: true,
            club_rental_available: true
        });
        setEditingId(null);
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Manage Courses</h2>
                <Button onClick={() => setShowModal(true)}>Add New Course</Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Holes</th>
                        <th>Difficulty</th>
                        <th>Facilities</th>
                        <th>Services</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td>{course.name}</td>
                            <td>{course.location}</td>
                            <td>{course.holes}</td>
                            <td>{course.difficulty_level}</td>
                            <td>{course.facilities}</td>
                            <td>
                                {course.caddie_required && '🏌️ Caddie '}
                                {course.golf_cart_available && '🚗 Cart '}
                                {course.club_rental_available && '⛳ Rentals'}
                            </td>
                            <td>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    className="me-2"
                                    onClick={() => {
                                        setFormData(course);
                                        setEditingId(course.id);
                                        setShowModal(true);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => handleDelete(course.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => {
                setShowModal(false);
                resetForm();
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit Course' : 'Add New Course'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Holes</Form.Label>
                            <Form.Select
                                value={formData.holes}
                                onChange={(e) => setFormData({...formData, holes: parseInt(e.target.value)})}
                            >
                                <option value={9}>9 Holes</option>
                                <option value={18}>18 Holes</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Difficulty Level</Form.Label>
                            <Form.Select
                                value={formData.difficulty_level}
                                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Facilities</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={formData.facilities}
                                onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                                placeholder="List available facilities..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Caddie Required"
                                checked={formData.caddie_required}
                                onChange={(e) => setFormData({...formData, caddie_required: e.target.checked})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Golf Cart Available"
                                checked={formData.golf_cart_available}
                                onChange={(e) => setFormData({...formData, golf_cart_available: e.target.checked})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Club Rental Available"
                                checked={formData.club_rental_available}
                                onChange={(e) => setFormData({...formData, club_rental_available: e.target.checked})}
                            />
                        </Form.Group>

                        <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CourseManager;
