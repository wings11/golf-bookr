import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useTheme();
    const isLoggedIn = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link to="/">GOLF BOOKR</Link>
            </div>
            <ul className={styles.navLinks}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                
                {isLoggedIn ? (
                    <>
                        <li><Link to="/booking">Make Booking</Link></li>
                        <li><Link to="/profile">My Profile</Link></li>
                        <li><Link to="/chatbot">CawFee AI</Link></li>
                        {userRole === 'admin' && (
                            <li><Link to="/admin" className={styles.adminLink}>Admin</Link></li>
                        )}
                        <li>
                            <button 
                                onClick={toggleTheme} 
                                className={styles.themeToggle}
                            >
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </button>
                        </li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                        <li>
                            <button 
                                onClick={toggleTheme} 
                                className={styles.themeToggle}
                            >
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
