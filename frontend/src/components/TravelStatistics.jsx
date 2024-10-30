import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const TravelStatistics = ({ idToken, API_BASE_URL }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/travel-stats`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setStats(response.data.stats);
      } catch (err) {
        console.error(
          'Error fetching travel statistics:',
          err.response ? err.response.data : err.message
        );
        setError('Failed to load travel statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [idToken, API_BASE_URL]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Ensure stats is not null
  if (!stats) {
    return <Typography>No statistics available.</Typography>;
  }

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Travel Statistics
      </Typography>
      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Trips
              </Typography>
              <Typography variant="h4">{stats.totalTrips || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Distance Traveled
              </Typography>
              <Typography variant="h4">
                {(stats.totalDistance ?? 0).toFixed(2)} km
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Countries Visited
              </Typography>
              <Typography variant="h4">
                {stats.countriesVisited ? stats.countriesVisited.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Stats */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Trip Duration
              </Typography>
              <Typography variant="h4">
                {(stats.averageTripDuration ?? 0).toFixed(2)} hrs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Visited Destinations */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Most Visited Destinations
          </Typography>
          {stats.mostVisitedDestinations && stats.mostVisitedDestinations.length > 0 ? (
            <List>
              {stats.mostVisitedDestinations.map((dest, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${index + 1}. ${dest.destination}`}
                    secondary={`${dest.count} trips`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No destinations to display.</Typography>
          )}
        </Grid>

        {/* Travel Trends Chart */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Travel Trends Over Time
          </Typography>
          {stats.travelTrends && stats.travelTrends.labels.length > 0 ? (
            <Bar
              data={{
                labels: stats.travelTrends.labels,
                datasets: [
                  {
                    label: '# of Trips',
                    data: stats.travelTrends.data,
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Number of Trips per Month',
                  },
                },
              }}
            />
          ) : (
            <Typography>No data available for travel trends.</Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TravelStatistics;
