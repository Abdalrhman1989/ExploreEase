import React, { useState } from 'react';
import '../styles/CarRentalForm.css';

const CarRentalForm = () => {
  const [carDetails, setCarDetails] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    location: '',
    imageUrl: '',
    carType: '',
    availability: true,
    features: [],
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    setCarDetails({ ...carDetails, imageUrl: e.target.value });
  };

  const handleFeatureChange = (e) => {
    const { value, checked } = e.target;
    setCarDetails((prevDetails) => ({
      ...prevDetails,
      features: checked
        ? [...prevDetails.features, value]
        : prevDetails.features.filter((feature) => feature !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Car rental details submitted:', carDetails);
    // Handle submission to backend here
  };

  return (
    <form className="car-rental-form" onSubmit={handleSubmit}>
      <h2>Add New Car Rental</h2>
      <div className="form-group">
        <label htmlFor="make">Make</label>
        <input
          type="text"
          name="make"
          id="make"
          placeholder="Make"
          value={carDetails.make}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="model">Model</label>
        <input
          type="text"
          name="model"
          id="model"
          placeholder="Model"
          value={carDetails.model}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="year">Year</label>
        <input
          type="number"
          name="year"
          id="year"
          placeholder="Year"
          value={carDetails.year}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price per Day</label>
        <input
          type="number"
          name="price"
          id="price"
          placeholder="Price per Day"
          value={carDetails.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          name="location"
          id="location"
          placeholder="Location"
          value={carDetails.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="carType">Car Type</label>
        <select
          name="carType"
          id="carType"
          value={carDetails.carType}
          onChange={handleChange}
          required
        >
          <option value="">Select Car Type</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
          <option value="Convertible">Convertible</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="imageUrl">Car Image</label>
        <input
          type="file"
          name="imageUrl"
          id="imageUrl"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        {imagePreview && <img src={imagePreview} alt="Car Preview" className="image-preview" />}
      </div>

      <div className="form-group">
        <label htmlFor="availability">Availability</label>
        <label className="switch">
          <input
            type="checkbox"
            name="availability"
            id="availability"
            checked={carDetails.availability}
            onChange={() =>
              setCarDetails((prevDetails) => ({
                ...prevDetails,
                availability: !prevDetails.availability,
              }))
            }
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="form-group">
        <h3>Car Features</h3>
        <div className="features-checkboxes">
          <label>
            <input
              type="checkbox"
              value="GPS"
              onChange={handleFeatureChange}
            />
            GPS
          </label>
          <label>
            <input
              type="checkbox"
              value="Air Conditioning"
              onChange={handleFeatureChange}
            />
            Air Conditioning
          </label>
          <label>
            <input
              type="checkbox"
              value="Automatic Transmission"
              onChange={handleFeatureChange}
            />
            Automatic Transmission
          </label>
          <label>
            <input
              type="checkbox"
              value="Bluetooth"
              onChange={handleFeatureChange}
            />
            Bluetooth
          </label>
        </div>
      </div>

      <button type="submit" className="submit-button">Add Car Rental</button>
    </form>
  );
};

export default CarRentalForm;
