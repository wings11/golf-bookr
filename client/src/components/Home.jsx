import { Link, useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import styles from '../styles/Home.module.css';

const Home = () => {
    const navigate = useNavigate();
    
    const handleBookNow = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            navigate('/booking');
        }
    };

    return (
        <>
            <section className={styles.features}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Welcome to Golf Bookr with CawFee AI.
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Discover and reserve the finest golf courses tailored for you in Bangkok.
                </Typography>
                <Button
                    onClick={handleBookNow}
                    variant="contained"
                    size="large"
                    sx={{ mt: 2 }}
                >
                    Book Now
                </Button>
            </section>

            {/* Add Logo Runner Section */}
            <div className={styles.logoContainer}>
                {[1, 2, 3, 4, 5].map((index) => (
                    <img 
                        key={index}
                        src={`/images/logo${index}.png`}
                        alt={`Logo ${index}`}
                        className={`${styles.runningLogo} ${styles[`logo${index}`]}`}
                        onError={(e) => {
                            e.target.src = `https://via.placeholder.com/150x60?text=Logo+${index}`;
                        }}
                    />
                ))}
            </div>

            <section className={styles.featuredCourses}>
                <Typography variant="h3" gutterBottom>
                    Featured Courses
                </Typography>
                <div className={styles.courseGrid}>
                    {/* Alpine Golf Club Card */}
                    <div className={styles.courseCard}>
                        <div className={styles.courseImage}>
                            <img 
                                src="/images/alpine.jpg" 
                                alt="Alpine Golf & Sports Club"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Alpine+Golf+Club';
                                }}
                            />
                        </div>
                        <div className={styles.courseInfo}>
                            <Typography variant="h4">Alpine Golf & Sports Club</Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Bangkok, Thailand
                            </Typography>
                            <Typography variant="body1" paragraph>
                                A championship course designed by Ron Garl, known for its challenging 
                                layout with rolling fairways and fast greens. Tee times are limited 
                                due to its private membership; advance booking is essential.
                            </Typography>
                            <div className={styles.courseFeatures}>
                                <div>
                                    <Typography variant="h6">Course Features:</Typography>
                                    <ul>
                                        <li>Championship Layout</li>
                                        <li>Rolling Fairways</li>
                                        <li>Fast Greens</li>
                                        <li>Private Membership</li>
                                    </ul>
                                </div>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleBookNow}
                                >
                                    Book This Course
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Thai Country Club Card */}
                    <div className={styles.courseCard}>
                        <div className={styles.courseImage}>
                            <img 
                                src="/images/thai-country-club.jpg" 
                                alt="Thai Country Club"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Thai+Country+Club';
                                }}
                            />
                        </div>
                        <div className={styles.courseInfo}>
                            <Typography variant="h4">Thai Country Club</Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Bangkok, Thailand
                            </Typography>
                            <Typography variant="body1" paragraph>
                                An exclusive club that has hosted international tournaments, offering 
                                meticulously maintained fairways and top-notch facilities. Visitor 
                                tee times are restricted; booking through authorized agents is recommended.
                            </Typography>
                            <div className={styles.courseFeatures}>
                                <div>
                                    <Typography variant="h6">Course Features:</Typography>
                                    <ul>
                                        <li>International Tournament Venue</li>
                                        <li>Meticulously Maintained</li>
                                        <li>Top-notch Facilities</li>
                                        <li>Exclusive Access</li>
                                    </ul>
                                </div>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleBookNow}
                                >
                                    Book This Course
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Nikanti Golf Club Card */}
                    <div className={styles.courseCard}>
                        <div className={styles.courseImage}>
                            <img 
                                src="/images/nikanti-golf.jpg" 
                                alt="Nikanti Golf Club"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400?text=Nikanti+Golf+Club';
                                }}
                            />
                        </div>
                        <div className={styles.courseInfo}>
                            <Typography variant="h4">Nikanti Golf Club</Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Nakhon Pathom, Thailand
                            </Typography>
                            <Typography variant="body1" paragraph>
                                A unique 18-hole course comprising three six-hole layouts, each with 
                                two par-3s, two par-4s, and two par-5s, providing a distinctive 
                                golfing experience. Tee times are generally available; inclusive 
                                packages cover green fees, caddie fees, and meals.
                            </Typography>
                            <div className={styles.courseFeatures}>
                                <div>
                                    <Typography variant="h6">Course Features:</Typography>
                                    <ul>
                                        <li>Unique 6-6-6 Layout</li>
                                        <li>All-Inclusive Packages</li>
                                        <li>Modern Facilities</li>
                                        <li>Excellent Value</li>
                                    </ul>
                                </div>
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={handleBookNow}
                                >
                                    Book This Course
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.features}>
                <Typography variant="h3" gutterBottom>Why Choose Us?</Typography>
                <div className={styles.featuresGrid}>
                    {[
                        {
                            title: "✔ Seamless Online Booking",
                            description: "Quick and convenient booking process."
                        },
                        {
                            title: "✔ Personalized Course Recommendations",
                            description: "Personalized course suggestions based on your preferences."
                        },
                        {
                            title: "✔ CawFee AI",
                            description: "The CawFee AI assistant will help you choose courses,tee times and make booking."
                        },
                        {
                            title: "✔ Customized Profile",
                            description: "Fully customize profile byself."
                        }
                    ].map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                            <Typography>{feature.description}</Typography>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Home;
