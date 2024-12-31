import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/ManageAttractions.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageAttractions = () => {
  const { idToken, isAuthenticated, userRole } = useContext(AuthContext);
  const [attractions, setAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: '',
    rating: '',
    description: '',
    amenities: [],
    images: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Fetch attractions when authenticated
  useEffect(() => {
    if (isAuthenticated && idToken) {
      fetchAttractions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, idToken, userRole]);

  // Fetch attractions from backend
  const fetchAttractions = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      let url = '';

      if (userRole === 'Admin') {
        url = `${backendUrl}/api/attractions/pending`; 
      } else {
        url = `${backendUrl}/api/attractions/user`; 
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Standardize attractions to have 'id'
      const standardizedAttractions = response.data.attractions.map((attraction) => ({
        ...attraction,
        id: attraction.id || attraction.AttractionID, 
      }));

      setAttractions(standardizedAttractions);
      console.log('Fetched Attractions:', standardizedAttractions); 
    } catch (err) {
      console.error('Error fetching attractions:', err);
      setError('Failed to fetch attractions.');
      toast.error('Failed to fetch attractions.');
    }
  };

  // Handle search
  const filteredAttractions = attractions.filter((attraction) =>
    attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Delete
  const handleDelete = async (attractionId) => {
    if (!window.confirm('Are you sure you want to delete this attraction?')) return;

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.delete(`${backendUrl}/api/attractions/${attractionId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setAttractions(attractions.filter((attraction) => attraction.id !== attractionId));
      toast.success('Attraction deleted successfully!');
    } catch (err) {
      console.error('Error deleting attraction:', err);
      toast.error('Failed to delete attraction.');
    }
  };

  // Handle Select for View/Edit
  const handleSelect = (attraction) => {
    const attractionId = attraction.id || attraction.AttractionID; 
    if (selectedAttraction && selectedAttraction.id === attractionId && !isEditing) {
      setSelectedAttraction(null);
      setIsEditing(false);
    } else {
      setSelectedAttraction({ ...attraction, id: attractionId }); 
      setFormData({
        name: attraction.name || '',
        location: attraction.location || '',
        type: attraction.type || '',
        rating: attraction.rating || '',
        description: attraction.description || '',
        amenities: attraction.amenities || [],
        images: attraction.images || [],
      });
      setIsEditing(false);
    }
  };

  // Handle Edit Toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle Form Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Amenity Changes
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    const newAmenities = checked
      ? [...formData.amenities, value]
      : formData.amenities.filter((amenity) => amenity !== value);
    setFormData({ ...formData, amenities: newAmenities });
  };

  // Handle Image Upload and Conversion to Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    convertFilesToBase64(files)
      .then((base64Images) => {
        setFormData({ ...formData, images: [...formData.images, ...base64Images] });
      })
      .catch((err) => {
        console.error('Error converting images:', err);
        toast.error('Failed to process images.');
      });
  };

  // Utility function to convert files to Base64
  const convertFilesToBase64 = (files) => {
    return Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      })
    );
  };

  // Handle Form Submission for Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss(); 
    setError('');

    if (!selectedAttraction || !selectedAttraction.id) {
      setError('Invalid attraction selected.');
      toast.error('Invalid attraction selected.');
      return;
    }

    // Prepare payload
    const payload = {
      name: formData.name,
      location: formData.location,
      type: formData.type,
      rating: parseFloat(formData.rating), 
      description: formData.description,
      amenities: formData.amenities, 
      images: formData.images, 
    };

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      await axios.put(`${backendUrl}/api/attractions/${selectedAttraction.id}`, payload, { 
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      toast.success('Attraction updated successfully!');
      // Refresh attraction list
      fetchAttractions();
      // Reset selection
      setSelectedAttraction(null);
      setFormData({
        name: '',
        location: '',
        type: '',
        rating: '',
        description: '',
        amenities: [],
        images: [],
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating attraction:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to update attraction.');
      } else {
        setError('Failed to update attraction.');
      }
      toast.error(error || 'Failed to update attraction.');
    }
  };

  return (
    <div className="manage-attractions-container">
      <h2>Manage Attractions</h2>
      <div className="manage-attractions-header">
        <input
          type="text"
          placeholder="Search by name, location, or type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="manage-attractions-search"
        />
        <Link to="/business/attractions/add" className="manage-attractions-add-button">
          <i className="fas fa-plus"></i> Add New Attraction
        </Link>
      </div>

      {/* Listings Table */}
      <table className="manage-attractions-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttractions.length > 0 ? (
            filteredAttractions.map((attraction) => (
              <tr key={attraction.id}>
                <td data-label="Name">{attraction.name}</td>
                <td data-label="Location">{attraction.location}</td>
                <td data-label="Type">{attraction.type}</td>
                <td data-label="Actions">
                  <button
                    onClick={() => handleSelect(attraction)}
                    className="manage-attractions-view-button"
                  >
                    {selectedAttraction && selectedAttraction.id === attraction.id && !isEditing
                      ? 'Hide'
                      : 'View/Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(attraction.id)}
                    className="manage-attractions-delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No attractions found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* View/Edit Section */}
      {selectedAttraction && (
        <div className="manage-attractions-view-edit-section">
          {!isEditing ? (
            <div className="attraction-details">
              <h3>{selectedAttraction.name}</h3>
              <p>
                <strong>Location:</strong> {selectedAttraction.location}
              </p>
              <p>
                <strong>Type:</strong> {selectedAttraction.type}
              </p>
              <p>
                <strong>Rating:</strong> {selectedAttraction.rating}/5
              </p>
              <p>
                <strong>Description:</strong> {selectedAttraction.description}
              </p>

              <h4>Amenities</h4>
              <ul>
                {selectedAttraction.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>

              <h4>Images</h4>
              <div className="attraction-images">
                {selectedAttraction.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Attraction view ${index + 1}`}
                    className="attraction-image"
                  />
                ))}
              </div>

              <button
                onClick={handleEditToggle}
                className="manage-attractions-edit-toggle-button"
              >
                Edit Attraction
              </button>
            </div>
          ) : (
            <form
              className="manage-attractions-edit-form"
              onSubmit={handleSubmit}
            >
              <h3>Edit Attraction</h3>
              {error && <p className="error-message">{error}</p>}

              <input
                type="text"
                name="name"
                placeholder="Attraction Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="type"
                placeholder="Type"
                value={formData.type}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="rating"
                placeholder="Rating (1-5)"
                value={formData.rating}
                onChange={handleChange}
                min="1"
                max="5"
                step="0.1"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />

              {/* Amenities */}
              <div className="manage-attractions-amenities">
                <h4>Amenities</h4>
                <label>
                  <input
                    type="checkbox"
                    value="Guided Tours"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Guided Tours')}
                  />
                  Guided Tours
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Accessibility"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Accessibility')}
                  />
                  Accessibility
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="Parking"
                    onChange={handleAmenityChange}
                    checked={formData.amenities.includes('Parking')}
                  />
                  Parking
                </label>
                {/* Add more amenities as needed */}
              </div>

              {/* Image Upload */}
              <div className="manage-attractions-image-upload">
                <h4>Attraction Images</h4>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                {formData.images.length > 0 && (
                  <div className="manage-attractions-image-previews">
                    {formData.images.map((base64, index) => (
                      <img
                        key={index}
                        src={base64}
                        alt={`Attraction view ${index + 1}`}
                        className="manage-attractions-preview-image"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="manage-attractions-submit-button"
              >
                Update Attraction
              </button>
            </form>
          )}

          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default ManageAttractions;
