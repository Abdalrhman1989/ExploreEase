import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { PuffLoader } from 'react-spinners';
import '../styles/PopularFlights.css';

const PopularFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularFlights = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/popular-flights`);
        if (!response.ok) {
          throw new Error('Failed to fetch popular flights.');
        }
        const data = await response.json();
        setFlights(data.flights);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularFlights();
  }, []);

  if (loading) {
    return (
      <Box className="popular-flights-loading">
        <PuffLoader size={60} color="#3f51b5" />
        <Typography variant="body1">Loading popular flights...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="popular-flights-error">
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="popular-flights-container">
      <Typography variant="h5" gutterBottom>
        Popular Flights Near You
      </Typography>
      <Grid container spacing={3}>
        {flights.map((flight) => (
          <Grid item xs={12} sm={6} md={4} key={flight.id}>
            <Card className="flight-card">
              <CardMedia
                component="img"
                height="140"
                image={flight.imageUrl}
                alt={`${flight.origin} to ${flight.destination}`}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {flight.origin} to {flight.destination}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Shortest flight time: {flight.duration}
                </Typography>
                <Button size="small" color="primary">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PopularFlights;
