import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '../styles/FAQs.css';

const FAQs = () => {
  const faqData = [
    {
      question: 'How do I find the cheapest flights?',
      answer: 'You can sort flights by price to see them from cheapest to most expensive...',
    },
    {
      question: 'Can I book one-way flight tickets?',
      answer: 'Yes, you can book one-way, round trip, and multi-city flights on our site.',
    },
  ];

  return (
    <div className="faqs-container">
      <Typography variant="h5" gutterBottom>
        Frequently Asked Questions
      </Typography>
      {faqData.map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
          >
            <Typography>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default FAQs;
