import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Book as BookIcon,
  Chat as ChatIcon,
  Email as EmailIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';

const SupportHelp = ({ idToken, API_BASE_URL }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Contact Form State
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [contactFormStatus, setContactFormStatus] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Support Resources Data
  const [resources] = useState([
    {
      id: 1,
      category: 'Travel Guides',
      title: 'Top 10 Destinations for 2024',
      description: 'Explore the most popular destinations for your next trip.',
      link: '/travel-guides/top-10-destinations-2024',
    },
    {
      id: 2,
      category: 'Booking Tips',
      title: 'How to Get the Best Deals on Flights',
      description: 'Learn strategies to secure the best flight prices.',
      link: '/booking-tips/best-deals-on-flights',
    },
    {
      id: 3,
      category: 'FAQs',
      title: 'Booking and Payment Questions',
      description: 'Find answers to common booking and payment-related questions.',
      link: '/faq',
    },
    {
      id: 4,
      category: 'Video Tutorials',
      title: 'Navigating Our Booking System',
      description: 'Watch our step-by-step guide to using our booking platform.',
      link: '/video-tutorials/navigating-booking-system',
    },
    // Add more resources as needed
  ]);

  // Filtered Resources based on search
  const [searchTerm, setSearchTerm] = useState('');
  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Persist Form Data on Page Refresh
  useEffect(() => {
    const savedData = localStorage.getItem('contactFormData');
    if (savedData) {
      setContactFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contactFormData', JSON.stringify(contactFormData));
  }, [contactFormData]);

  // Handle Contact Form input changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactFormData({
      ...contactFormData,
      [name]: value,
    });
  };

  // Handle Contact Form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactFormStatus('Submitting your message...');
    setValidationErrors({});
    setIsSubmitting(true); 

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact`, contactFormData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (response.data.success) {
        setContactFormStatus('Your message has been sent successfully!');
        setContactFormData({
          name: '',
          email: '',
          message: '',
        });
        setIsModalOpen(true); 
        localStorage.removeItem('contactFormData'); 
      } else {
        setContactFormStatus('Failed to send your message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response && error.response.data) {
        const errors = error.response.data.errors; 
        const errorObj = {};

        if (Array.isArray(errors)) {
          errors.forEach((err) => {
            errorObj[err.path] = err.msg;
          });
        } else if (typeof errors === 'object') {
          Object.values(errors).forEach((err) => {
            errorObj[err.path] = err.msg;
          });
        } else {
          setContactFormStatus('An unexpected error occurred. Please try again.');
          return;
        }

        setValidationErrors(errorObj);
        setContactFormStatus('Please correct the highlighted errors and try again.');
      } else {
        setContactFormStatus('An error occurred while sending your message. Please try again later.');
      }
    } finally {
      setIsSubmitting(false); 
    }
  };

  const handleLiveChat = () => {
    const phoneNumber = '1234567890'; 
    const message = encodeURIComponent('Hello, I need assistance with your services.');
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  // Handle Modal Close
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Support Ticket Submission Section */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Submit a Support Ticket
        </Typography>
        <form onSubmit={handleContactSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Your Name"
                name="name"
                value={contactFormData.name}
                onChange={handleContactChange}
                required
                fullWidth
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Your Email"
                name="email"
                type="email"
                value={contactFormData.email}
                onChange={handleContactChange}
                required
                fullWidth
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message"
                name="message"
                value={contactFormData.message}
                onChange={handleContactChange}
                required
                fullWidth
                multiline
                rows={4}
                error={!!validationErrors.message}
                helperText={validationErrors.message}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={isSubmitting}
                  sx={{
                    textTransform: 'none',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
                {contactFormStatus && (
                  <Typography
                    variant="body2"
                    color={
                      contactFormStatus.includes('successfully') ? 'success.main' : 'error.main'
                    }
                    sx={{ ml: 2 }}
                  >
                    {contactFormStatus}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Support Resources Section */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Support Resources
        </Typography>
        <Typography variant="body1" gutterBottom>
          Find answers and enhance your travel experience with our curated resources.
        </Typography>
        <TextField
          placeholder="Search Support Resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {filteredResources.length > 0 ? (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {filteredResources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BookIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">{resource.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {resource.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={Link}
                      to={resource.link}
                      variant="text"
                      sx={{ textTransform: 'none' }}
                      aria-label={`Learn more about ${resource.title}`}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            No resources match your search.
          </Typography>
        )}
      </Paper>

      {/* Additional Support Options */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Additional Support Options
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3,
              }}
            >
              <Tooltip title="Start Live Chat" arrow>
                <IconButton
                  onClick={handleLiveChat}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: '#fff',
                    mb: 2,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  aria-label="Start Live Chat"
                >
                  <ChatIcon fontSize="large" />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" gutterBottom>
                Live Chat
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Instant messaging for quick queries.
              </Typography>
              <Button
                variant="outlined"
                onClick={handleLiveChat}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                    borderColor: theme.palette.primary.dark,
                  },
                }}
                aria-label="Start Live Chat"
              >
                Start Chat
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 3,
              }}
            >
              <Tooltip title="Send an Email" arrow>
                <IconButton
                  href="mailto:support@example.com"
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: '#fff',
                    mb: 2,
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                    },
                  }}
                  aria-label="Send an Email"
                >
                  <EmailIcon fontSize="large" />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" gutterBottom>
                Email Support
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Detailed assistance via email.
              </Typography>
              <Button
                href="mailto:support@example.com"
                variant="outlined"
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.light,
                    borderColor: theme.palette.secondary.dark,
                  },
                }}
                aria-label="Send an Email"
              >
                Send Email
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Social Media Section */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Stay Connected
        </Typography>
        <Typography variant="body1" gutterBottom>
          Follow us on social media for the latest updates and offers.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Tooltip title="Facebook" arrow>
            <IconButton
              href="https://facebook.com"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              color="primary"
              sx={{ mx: 1 }}
            >
              <FacebookIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Twitter" arrow>
            <IconButton
              href="https://twitter.com"
              target="_blank"
              rel="noopener"
              aria-label="Twitter"
              color="primary"
              sx={{ mx: 1 }}
            >
              <TwitterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Instagram" arrow>
            <IconButton
              href="https://instagram.com"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              color="primary"
              sx={{ mx: 1 }}
            >
              <InstagramIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="LinkedIn" arrow>
            <IconButton
              href="https://linkedin.com"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              color="primary"
              sx={{ mx: 1 }}
            >
              <LinkedInIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} aria-labelledby="confirmation-dialog-title">
        <DialogTitle id="confirmation-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Thank You!
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>Your support ticket has been submitted successfully. Our team will get back to you shortly.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Live Chat Floating Button */}
      <Tooltip title="Live Chat" arrow>
        <IconButton
          onClick={handleLiveChat}
          sx={{
            position: 'fixed',
            bottom: isMobile ? 70 : 30,
            right: 30,
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            zIndex: 1000,
          }}
          aria-label="Live Chat"
        >
          <ChatIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SupportHelp;
