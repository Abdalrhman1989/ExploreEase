import React, { useState, useEffect } from 'react';
import '../styles/Careers.css';
import axios from 'axios';

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cv: '',
    coverLetter: '',
  });
  const [formStatus, setFormStatus] = useState('');

  useEffect(() => {
    // Fetch job data (can be replaced with an API call)
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
    setFormData({
      fullName: '',
      email: '',
      cv: '',
      coverLetter: '',
    });
    setFormStatus('');
  };

  // Filter jobs based on department
  const filteredJobs =
    filter === 'All' ? jobs : jobs.filter((job) => job.department === filter);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Submitting...');

    // Validate form data
    if (!formData.fullName || !formData.email || !formData.cv || !formData.coverLetter) {
      setFormStatus('Please fill in all fields.');
      return;
    }

    // Prepare the data to send
    const applicationData = {
      fullName: formData.fullName,
      email: formData.email,
      cv: formData.cv,
      coverLetter: formData.coverLetter,
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
    };

    try {
      const response = await axios.post('http://localhost:3001/api/apply', applicationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setFormStatus('Application submitted successfully!');
        closeApplyModal();
      } else {
        setFormStatus(response.data.message || 'Failed to submit application.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setFormStatus('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="careers">
      {/* Hero Section */}
      <section className="careers-hero">
        <div className="hero-overlay">
          <h1>Join Our Team</h1>
          <p>Explore exciting career opportunities with us.</p>
          <a href="#current-openings" className="hero-button">
            View Openings
          </a>
        </div>
      </section>

      {/* Company Culture Section */}
      <section className="company-culture">
        <h2>Our Culture</h2>
        <p>
          At TravelPlanner, we foster a collaborative and inclusive environment where innovation thrives. Our team is passionate about creating memorable travel experiences for our users.
        </p>
        <div className="culture-images">
          <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2" alt="Team Collaboration" />
          <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" alt="Office Environment" />
          <img src="https://images.unsplash.com/photo-1519985176271-adb1088fa94c" alt="Team Outing" />
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="current-openings" id="current-openings">
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
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Jane Doe" className="testimonial-avatar" />
            <p>
              "Working at TravelPlanner has been an incredible experience. The team is supportive and the projects are challenging and rewarding."
            </p>
            <h4>Jane Doe, Frontend Developer</h4>
          </div>
          <div className="testimonial">
            <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="John Smith" className="testimonial-avatar" />
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
            <form onSubmit={handleFormSubmit} className="application-form">
              <label>
                Full Name:
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Email Address:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                CV:
                <textarea
                  name="cv"
                  value={formData.cv}
                  onChange={handleInputChange}
                  required
                  placeholder="Write your CV here..."
                ></textarea>
              </label>
              <label>
                Cover Letter:
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  required
                  placeholder="Write your cover letter here..."
                ></textarea>
              </label>
              <button type="submit">Submit Application</button>
            </form>
            {formStatus && <p className="form-status">{formStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
