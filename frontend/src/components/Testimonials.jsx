// src/components/Testimonials.jsx

import React from 'react';
import { Grid, Card, CardContent, Typography, Avatar } from '@mui/material';
import '../styles/Testimonials.css';

const testimonialsData = [
  {
    name: 'John Doe',
    feedback: 'Booking flights has never been easier. Great service and competitive prices!',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Jane Smith',
    feedback: 'Loved the user-friendly interface and the variety of flight options available.',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Mike Johnson',
    feedback: 'Excellent customer support and seamless booking process.',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

const Testimonials = () => {
  return (
    <div className="testimonials-section">
      <Typography variant="h4" gutterBottom align="center">
        What Our Users Say
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {testimonialsData.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card className="testimonial-card">
              <CardContent>
                <Avatar src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
                <Typography variant="h6" gutterBottom>
                  {testimonial.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  "{testimonial.feedback}"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Testimonials;
