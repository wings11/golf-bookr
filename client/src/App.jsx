import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, Button, CircularProgress } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './components/Home';
import SignUp from './components/Auth/SignUp';
import Loading from './components/Loading';
import Login from './components/Auth/Login';
import Profile from './components/Profile';
import Booking from './components/Booking';
import Chatbot from './components/Chatbot';
import { checkApiHealth } from './utils/apiCheck';
import Dashboard from './components/Admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CourseManager from './components/Admin/CourseManager';
import TeeTimeManager from './components/Admin/TeeTimeManager';
import BookingViewer from './components/Admin/BookingViewer';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import TeeTimes from './components/Admin/TeeTimes';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  // Add this to make MUI components respect the theme
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'var(--text-primary)',
        },
      },
    },
  },
});

function App() {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const health = await checkApiHealth();
      setApiStatus(health.isHealthy ? 'connected' : 'disconnected');
      setError(health.error || null);
    } catch (err) {
      setApiStatus('disconnected');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <CircularProgress />
        <p>Connecting to server...</p>
      </div>
    );
  }

  if (apiStatus === 'disconnected') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
        <h2>Cannot connect to server</h2>
        <p>Please make sure the server is running</p>
        {error && <p>Error details: {error}</p>}
        <Button 
          variant="contained" 
          onClick={checkHealth}
          style={{ marginTop: '20px' }}
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CustomThemeProvider>
        <Router>
          <Navbar />
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={loading ? <Loading /> : <SignUp />} />
              <Route path="/login" element={loading ? <Loading /> : <Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/chatbot" element={loading ? <Loading /> : <Chatbot />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              }>
                <Route index element={<div>Welcome to Admin Dashboard</div>} />
                <Route path="courses" element={<CourseManager />} />
                <Route path="tee-times" element={<TeeTimeManager />} />
                <Route path="bookings" element={<BookingViewer />} />
                <Route path="/admin/tee-times" element={<TeeTimes />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}

export default App;
