import React from 'react';
import styles from '../styles/AboutUs.module.css';

const AboutUs = () => {
    return (
        <div>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>About Golf Bookr</h1>
                    <p>Your Premier Golf Booking Platform in Bangkok</p>
                </div>
            </div>

            <div className={styles.aboutContainer}>
                <section className={styles.missionSection}>
                    <div className={styles.glassCard}>
                        <h2>Our Mission</h2>
                        <p>At Golf Bookr, we're passionate about making golf accessible and enjoyable for everyone. 
                        We provide a seamless booking experience for golf enthusiasts in Bangkok, connecting players 
                        with the finest courses in the area.</p>
                    </div>
                </section>

                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <h2>What We Offer</h2>
                        <ul>
                            <li>Easy online booking for multiple golf courses</li>
                            <li>Real-time availability</li>
                            <li>AI-powered assistance with CawFee</li>
                            <li>Complete golf services</li>
                            <li>Beginner to advanced level courses</li>
                        </ul>
                    </div>

                    <div className={styles.featureCard}>
                        <h2>Why Choose Us</h2>
                        <ul>
                            <li>Bangkok's largest golf course network</li>
                            <li>24/7 online booking system</li>
                            <li>Modern golf club</li>
                            <li>Professional customer service</li>
                            <li>Verified course reviews</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
