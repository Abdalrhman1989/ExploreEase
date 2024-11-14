// src/pages/Careers.jsx

import React, { useState, useEffect } from 'react';
import '../styles/Careers.css'; // Ensure this path is correct based on your project structure

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample job data (Replace with API calls if available)
  useEffect(() => {
    const jobData = [
      {
        id: 1,
        title: 'Frontend Developer',
        location: 'Remote',
        department: 'Engineering',
        description: 'Join our team to build amazing user interfaces...',
      },
      {
        id: 2,
        title: 'Marketing Specialist',
        location: 'New York, NY',
        department: 'Marketing',
        description: 'Drive our marketing campaigns and strategies...',
      },
      {
        id: 3,
        title: 'Sales Manager',
        location: 'San Francisco, CA',
        department: 'Sales',
        description: 'Lead our sales team to new heights...',
      },
      // Add more jobs as needed
    ];
    setJobs(jobData);
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeApplyModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  // Filter jobs based on department
  const filteredJobs =
    filter === 'All' ? jobs : jobs.filter((job) => job.department === filter);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to backend)
    alert('Application submitted successfully!');
    closeApplyModal();
  };

  return (
    <div className="careers">
      {/* Hero Section */}
      <section className="careers-hero">
        <h1>Join Our Team</h1>
        <p>Explore exciting career opportunities with us.</p>
      </section>

      {/* Company Culture Section */}
      <section className="company-culture">
        <h2>Our Culture</h2>
        <p>
          At TravelPlanner, we foster a collaborative and inclusive environment where innovation thrives. Our team is passionate about creating memorable travel experiences for our users.
        </p>
        <div className="culture-images">
          <img src="/images/culture1.jpg" alt="Team Collaboration" />
          <img src="/images/culture2.jpg" alt="Office Environment" />
          <img src="/images/culture3.jpg" alt="Team Outing" />
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="current-openings">
        <h2>Current Openings</h2>

        {/* Filter Jobs */}
        <div className="job-filter">
          <label htmlFor="department">Filter by Department:</label>
          <select id="department" value={filter} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            {/* Add more departments as needed */}
          </select>
        </div>

        {/* Job Listings */}
        <div className="job-listings">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="job-listing">
                <h3>{job.title}</h3>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Department:</strong> {job.department}</p>
                <p>{job.description}</p>
                <button onClick={() => openApplyModal(job)}>Apply Now</button>
              </div>
            ))
          ) : (
            <p>No job openings available in this department.</p>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="employee-benefits">
        <h2>Employee Benefits</h2>
        <ul>
          <li>Competitive Salary and Bonuses</li>
          <li>Health, Dental, and Vision Insurance</li>
          <li>Flexible Working Hours</li>
          <li>Remote Work Opportunities</li>
          <li>Professional Development Programs</li>
          <li>Team Building Activities</li>
          {/* Add more benefits as needed */}
        </ul>
      </section>

      {/* Testimonials Section */}
      <section className="employee-testimonials">
        <h2>What Our Employees Say</h2>
        <div className="testimonials">
          <div className="testimonial">
            <p>
              "Working at TravelPlanner has been an incredible experience. The team is supportive and the projects are challenging and rewarding."
            </p>
            <h4>Jane Doe, Frontend Developer</h4>
          </div>
          <div className="testimonial">
            <p>
              "I love the flexibility and the emphasis on work-life balance. It's a great place to grow your career."
            </p>
            <h4>John Smith, Marketing Specialist</h4>
          </div>
          {/* Add more testimonials as needed */}
        </div>
      </section>

      {/* Apply Modal */}
      {isModalOpen && selectedJob && (
        <div className="modal-overlay" onClick={closeApplyModal}>
          <div className="apply-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeApplyModal}>
              &times;
            </button>
            <h2>Apply for {selectedJob.title}</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Full Name:
                <input type="text" name="fullName" required />
              </label>
              <label>
                Email Address:
                <input type="email" name="email" required />
              </label>
              <label>
                Resume:
                <input type="file" name="resume" accept=".pdf,.doc,.docx" required />
              </label>
              <label>
                Cover Letter:
                <textarea name="coverLetter" required></textarea>
              </label>
              <button type="submit">Submit Application</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
