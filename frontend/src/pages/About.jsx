import React, { useState } from 'react';
import '../styles/About.css';
import hotelImage from '../assets/hotel.jpg';
import flightImage from '../assets/flight.jpg';
import carRentalImage from '../assets/carrenter.jpg';
import trainImage from '../assets/train1.jpg';
import busImage from '../assets/bus1.jpg';
import restaurantImage from '../assets/Restaurant1.jpg';



const About = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About ExploreEase</h1>
          <p>Your gateway to seamless and unforgettable travel experiences.</p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="about-mission-vision">
        <div className="mission">
          <div className="image-container">
            <img src={hotelImage} alt="Our Mission" />
          </div>
          <div className="text-container">
            <h2>Our Mission</h2>
            <p>To simplify travel planning for everyone by offering a seamless platform that combines booking, discovery, and customer support, making every trip an extraordinary experience.</p>
          </div>
        </div>
        <div className="vision">
          <div className="image-container">
            <img src={flightImage} alt="Our Vision" />
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
          <img src={carRentalImage} alt="Our Journey" />
        </div>
        <div className="text-container">
          <h2>Our Journey</h2>
          <p>Founded in 2024, ExploreEase began with a simple idea: to make travel planning easy and accessible. Since then, we've grown into a global platform, helping thousands of travelers explore the world.</p>
        </div>
      </section>

      {/* Awards Section */}
      <section className="about-awards">
        <h2>Our Achievements</h2>
        <div className="awards-list">
          <div className="award-item">
            <img src="https://via.placeholder.com/100" alt="Award 1" />
            <h3>Best Travel App 2023</h3>
            <p>Awarded by TravelTech Magazine</p>
          </div>
          <div className="award-item">
            <img src="https://via.placeholder.com/100" alt="Award 2" />
            <h3>Customer Choice Award</h3>
            <p>Voted by our users</p>
          </div>
          <div className="award-item">
            <img src="https://via.placeholder.com/100" alt="Award 3" />
            <h3>Innovation in Travel</h3>
            <p>Recognized by Tech Innovators</p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="about-faqs">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq(1)}>
              What services does ExploreEase offer?
            </div>
            <div className="faq-answer">
              <p>We offer a comprehensive travel planning platform that includes booking flights, hotels, car rentals, and providing personalized travel itineraries.</p>
            </div>
          </div>
          <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq(2)}>
              How can I contact customer support?
            </div>
            <div className="faq-answer">
              <p>You can reach our customer support team via the Contact Us section on our website, or by emailing support@exploreease.com.</p>
            </div>
          </div>
          <div className={`faq-item ${activeFaq === 3 ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFaq(3)}>
              Is ExploreEase available on mobile devices?
            </div>
            <div className="faq-answer">
              <p>Yes, ExploreEase is available on both iOS and Android devices. You can download our app from the App Store or Google Play Store.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
