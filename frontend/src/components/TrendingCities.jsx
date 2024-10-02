import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { PuffLoader } from 'react-spinners';
import '../styles/TrendingCities.css';

const TrendingCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingCities = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/trending-cities`);
        if (!response.ok) {
          throw new Error('Failed to fetch trending cities.');
        }
        const data = await response.json();
        setCities(data.cities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCities();
  }, []);

  if (loading) {
    return (
      <Box className="trending-cities-loading">
        <PuffLoader size={60} color="#3f51b5" />
        <Typography variant="body1">Loading trending cities...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="trending-cities-error">
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="trending-cities-container">
      <Typography variant="h5" gutterBottom>
        Trending Cities
      </Typography>
      <Grid container spacing={3}>
        {cities.map((city) => (
          <Grid item xs={12} sm={6} md={4} key={city.id}>
            <Card className="city-card">
              <CardMedia
                component="img"
                height="140"
                image={city.imageUrl}
                alt={city.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {city.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Explore {city.name} with great deals on flights.
                </Typography>
                <Button size="small" color="primary">
                  Explore Flights
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TrendingCities;
