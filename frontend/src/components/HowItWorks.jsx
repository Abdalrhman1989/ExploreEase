import React from 'react';
import { Grid, Typography, Stepper, Step, StepLabel } from '@mui/material';
import '../styles/HowItWorks.css';

const steps = [
  {
    label: 'Search Flights',
    description: 'Enter your travel details to find the best flight options.',
  },
  {
    label: 'Compare Options',
    description: 'Compare prices, durations, and airlines to choose your flight.',
  },
  {
    label: 'Book Your Flight',
    description: 'Complete the booking process securely and receive your tickets.',
  },
];

const HowItWorks = () => {
  return (
    <div className="how-it-works-section">
      <Typography variant="h4" gutterBottom align="center">
        How It Works
      </Typography>
      <Stepper activeStep={-1} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>
              <Typography variant="h6">{step.label}</Typography>
              <Typography variant="body2" color="textSecondary">
                {step.description}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default HowItWorks;
