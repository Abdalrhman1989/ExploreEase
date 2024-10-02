import React, { useState } from 'react';
import '../styles/HotelForm.css';

const HotelForm = () => {
  const [hotelDetails, setHotelDetails] = useState({
    name: '',
    location: '',
    basePrice: '',
    description: '',
    images: [],
    roomTypes: [{ type: '', price: '', availability: 'Available' }],
    amenities: [],
    seasonalPricing: [{ startDate: '', endDate: '', price: '' }],
  });

  const handleChange = (e) => {
    setHotelDetails({ ...hotelDetails, [e.target.name]: e.target.value });
  };

  const handleRoomTypeChange = (index, e) => {
    const newRoomTypes = hotelDetails.roomTypes.map((roomType, i) =>
      index === i ? { ...roomType, [e.target.name]: e.target.value } : roomType
    );
    setHotelDetails({ ...hotelDetails, roomTypes: newRoomTypes });
  };

  const addRoomType = () => {
    setHotelDetails({
      ...hotelDetails,
      roomTypes: [...hotelDetails.roomTypes, { type: '', price: '', availability: 'Available' }],
    });
  };

  const handleSeasonalPricingChange = (index, e) => {
    const newSeasonalPricing = hotelDetails.seasonalPricing.map((season, i) =>
      index === i ? { ...season, [e.target.name]: e.target.value } : season
    );
    setHotelDetails({ ...hotelDetails, seasonalPricing: newSeasonalPricing });
  };

  const addSeasonalPricing = () => {
    setHotelDetails({
      ...hotelDetails,
      seasonalPricing: [...hotelDetails.seasonalPricing, { startDate: '', endDate: '', price: '' }],
    });
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    const newAmenities = checked
      ? [...hotelDetails.amenities, value]
      : hotelDetails.amenities.filter((amenity) => amenity !== value);
    setHotelDetails({ ...hotelDetails, amenities: newAmenities });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setHotelDetails({ ...hotelDetails, images: files });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Hotel details submitted:', hotelDetails);
    // Handle submission to backend here
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit}>
      <h2>Add New Hotel</h2>
      <input
        type="text"
        name="name"
        placeholder="Hotel Name"
        value={hotelDetails.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={hotelDetails.location}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="basePrice"
        placeholder="Base Price per Night"
        value={hotelDetails.basePrice}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={hotelDetails.description}
        onChange={handleChange}
        required
      />

      <div className="room-types">
        <h3>Room Types</h3>
        {hotelDetails.roomTypes.map((roomType, index) => (
          <div key={index} className="room-type">
            <input
              type="text"
              name="type"
              placeholder="Room Type"
              value={roomType.type}
              onChange={(e) => handleRoomTypeChange(index, e)}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Room Price per Night"
              value={roomType.price}
              onChange={(e) => handleRoomTypeChange(index, e)}
              required
            />
            <select
              name="availability"
              value={roomType.availability}
              onChange={(e) => handleRoomTypeChange(index, e)}
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={addRoomType}>
          Add Another Room Type
        </button>
      </div>

      <div className="seasonal-pricing">
        <h3>Seasonal Pricing</h3>
        {hotelDetails.seasonalPricing.map((season, index) => (
          <div key={index} className="season">
            <input
              type="date"
              name="startDate"
              value={season.startDate}
              onChange={(e) => handleSeasonalPricingChange(index, e)}
              required
            />
            <input
              type="date"
              name="endDate"
              value={season.endDate}
              onChange={(e) => handleSeasonalPricingChange(index, e)}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Seasonal Price per Night"
              value={season.price}
              onChange={(e) => handleSeasonalPricingChange(index, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addSeasonalPricing}>
          Add Seasonal Pricing
        </button>
      </div>

      <div className="amenities">
        <h3>Amenities</h3>
        <label>
          <input
            type="checkbox"
            value="WiFi"
            onChange={handleAmenityChange}
          />
          WiFi
        </label>
        <label>
          <input
            type="checkbox"
            value="Swimming Pool"
            onChange={handleAmenityChange}
          />
          Swimming Pool
        </label>
        <label>
          <input
            type="checkbox"
            value="Parking"
            onChange={handleAmenityChange}
          />
          Parking
        </label>
        <label>
          <input
            type="checkbox"
            value="Gym"
            onChange={handleAmenityChange}
          />
          Gym
        </label>
        <label>
          <input
            type="checkbox"
            value="Spa"
            onChange={handleAmenityChange}
          />
          Spa
        </label>
        <label>
          <input
            type="checkbox"
            value="Bar"
            onChange={handleAmenityChange}
          />
          Bar
        </label>
      </div>

      <div className="image-upload">
        <h3>Hotel Images</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
      </div>

      <button type="submit">Add Hotel</button>
    </form>
  );
};

export default HotelForm;
