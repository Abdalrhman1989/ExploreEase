import React from 'react';
import '../styles/About.css';
import missionImage from '../assets/flight.jpg'; // Image for mission section
import visionImage from '../assets/flight1.jpg'; // Image for vision section
import teamImage from '../assets/flight2.jpg'; // Image for team section

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About TravelPlanner</h1>
          <p>Your ultimate travel companion for unforgettable journeys.</p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="about-mission-vision">
        <div className="mission">
          <div className="image-container">
            <img src={missionImage} alt="Our Mission" />
          </div>
          <div className="text-container">
            <h2>Our Mission</h2>
            <p>To simplify travel planning for everyone by offering a seamless platform that combines booking, discovery, and customer support, making every trip an extraordinary experience.</p>
          </div>
        </div>
        <div className="vision">
          <div className="image-container">
            <img src={visionImage} alt="Our Vision" />
          </div>
          <div className="text-container">
            <h2>Our Vision</h2>
            <p>We envision a world where travel is accessible and enjoyable for all, where every journey is a step towards new experiences and personal growth.</p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values">
        <h2>Our Core Values</h2>
        <ul className="values-list">
          <li><span>Customer Focus:</span> We prioritize our users in every decision.</li>
          <li><span>Innovation:</span> We embrace new ideas to enhance your travel experience.</li>
          <li><span>Integrity:</span> We are committed to transparency and ethical practices.</li>
          <li><span>Excellence:</span> We strive for the highest quality in everything we do.</li>
        </ul>
      </section>

      {/* Meet Our Team Section */}
      <section className="about-team">
        <h2>Meet Our Team</h2>
        <div className="team-members">
          <div className="team-member">
            <img src="https://via.placeholder.com/150" alt="John Doe" />
            <h3>John Doe</h3>
            <p>CEO & Founder</p>
          </div>
          <div className="team-member">
            <img src="https://via.placeholder.com/150" alt="Jane Smith" />
            <h3>Jane Smith</h3>
            <p>Chief Marketing Officer</p>
          </div>
          <div className="team-member">
            <img src="https://via.placeholder.com/150" alt="Bob Johnson" />
            <h3>Bob Johnson</h3>
            <p>Chief Technology Officer</p>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="about-history">
        <div className="image-container">
          <img src={teamImage} alt="Our Journey" />
        </div>
        <div className="text-container">
          <h2>Our Journey</h2>
          <p>Founded in 2024, TravelPlanner began with a simple idea: to make travel planning easy and accessible. Since then, we've grown into a global platform, helping thousands of travelers explore the world.</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="about-testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonials">
          <div className="testimonial">
            <p>"TravelPlanner made my vacation stress-free. I found everything I needed in one place!"</p>
            <h4>- Emily R.</h4>
          </div>
          <div className="testimonial">
            <p>"The best travel app I've ever used. It saved me so much time and hassle!"</p>
            <h4>- Michael K.</h4>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;