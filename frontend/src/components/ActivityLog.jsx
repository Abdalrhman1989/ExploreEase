import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import axios from 'axios';
import { SaveAlt } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import Papa from 'papaparse'; 

const ActivityLog = ({ idToken, API_BASE_URL }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activity log
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/activity-log`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setActivities(response.data.activities);
      } catch (err) {
        console.error('Error fetching activity log:', err.response ? err.response.data : err.message);
        setError('Failed to load activity log.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [idToken, API_BASE_URL]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(activities);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'activity_log.csv');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Activity Log</Typography>
        <Button
          variant="outlined"
          startIcon={<SaveAlt />}
          onClick={handleExportCSV}
          sx={{
            textTransform: 'none',
            transition: 'background-color 0.3s',
            '&:hover': {
              backgroundColor: theme => theme.palette.grey[300],
            },
          }}
          size="small"
        >
          Export CSV
        </Button>
      </Box>
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : activities.length === 0 ? (
        <Typography>No recent activities.</Typography>
      ) : (
        <List>
          {activities.map((activity, index) => (
            <ListItem key={index} divider>
              <ListItemText
                primary={activity.action}
                secondary={new Date(activity.timestamp).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ActivityLog;
