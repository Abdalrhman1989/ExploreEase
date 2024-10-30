require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const mysql = require('mysql2/promise'); 

// Import Routes
const authRoutes = require('./routes/auth'); 
const protectedRoutes = require('./routes/protected'); 
const adminRoutes = require('./routes/admin');
const flightRoutes = require('./routes/flight'); 
const favoritesRouter = require('./routes/favorites'); 
const tripsRouter = require('./routes/trips'); 
const testimonialRoutes = require('./routes/testimonials'); 
const hotelRoutes = require('./routes/hotels'); 
const restaurantRoutes = require('./routes/restaurants'); 
const attractionRoutes = require('./routes/attraction');
const itinerariesRouter = require('./routes/itineraries'); 
const paymentsRouter = require('./routes/payments'); 
const userRoutes = require('./routes/user');
const app = express();
const PORT = process.env.PORT || 3001;



// ... other routes ...


// Setup Winston logger for logging events and errors
const logger = winston.createLogger({
  level: 'info', // Log all levels (info, warn, error, etc.)
  format: winston.format.json(),
  transports: [
    // Log all levels to combined.log
    new winston.transports.File({ filename: 'combined.log' }),
    // Log only errors to error.log
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// If not in production, also log to the console for easier debugging
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Middleware Configuration
app.use(express.json()); // To parse JSON bodies

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000', // Update this to your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Database Connection using Sequelize
const { Sequelize } = require('sequelize');
const User = require('./models/user'); 

const sequelize = new Sequelize(process.env.DB_NAME_DEVELOPMENT, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, 
});



// Test Database Connection and Sync Models
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL');
    logger.info('Connected to MySQL');

    // Sync models (Optional: use migrations in production)
    await sequelize.sync(); // { force: true } to drop and recreate tables
    console.log('Database synchronized');
    logger.info('Database synchronized');
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    logger.error('Error connecting to MySQL:', error);
    process.exit(1);
  }
};

// Initialize DB and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.info(`Server started on port ${PORT}`);
  });
});



// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/favorites', favoritesRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/hotels', hotelRoutes); 
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/itineraries', itinerariesRouter); 
app.use('/api/payments', paymentsRouter); 
app.use('/api/user', userRoutes);


// Health Check Endpoint
app.get('/', (req, res) => {
  res.send('Backend is running.');
});

// Newsletter Subscription Endpoint using Mailchimp
app.post('/api/subscribe',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Newsletter subscription validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    logger.info(`Attempting to subscribe email: ${email}`);

    const mailchimpData = {
      email_address: email,
      status: 'subscribed', // Use 'pending' for double opt-in
    };

    try {
      // Add subscriber to Mailchimp Audience
      const response = await axios.post(
        `https://${process.env.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`,
        mailchimpData,
        {
          headers: {
            Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`New subscriber added to Mailchimp: ${email}`);

      // Send Welcome Email
      let transporter;
      try {
        transporter = nodemailer.createTransport({
          service: 'Gmail', // Use 'Gmail' or another email service
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Verify transporter configuration
        await transporter.verify();
        logger.info('Nodemailer transporter configured successfully.');
      } catch (error) {
        logger.error('Error setting up Nodemailer transporter:', error);
        return res.status(500).json({ success: false, message: 'Failed to set up email transporter.' });
      }

      // Welcome Email to Subscriber
      const mailOptionsToSubscriber = {
        from: `"ExploreEase" <${process.env.EMAIL_USER}>`, // Sender address
        to: email, // Subscriber's email
        subject: 'Welcome to ExploreEase!',
        text: `Hello,

Thank you for subscribing to the ExploreEase newsletter! We're excited to have you on board.

Stay tuned for the latest deals and travel news.

Best regards,
ExploreEase Team`,
        html: `
          <h2>Welcome to ExploreEase!</h2>
          <p>Hello,</p>
          <p>Thank you for subscribing to the ExploreEase newsletter! We're excited to have you on board.</p>
          <p>Stay tuned for the latest deals and travel news.</p>
          <p>Best regards,<br/>ExploreEase Team</p>
        `,
      };

      try {
        logger.info(`Sending welcome email to: ${email}`);
        const info = await transporter.sendMail(mailOptionsToSubscriber);
        logger.info(`Welcome email sent to subscriber: ${email}. Message ID: ${info.messageId}`);
      } catch (error) {
        logger.error(`Error sending welcome email to ${email}:`, error);
        // Optionally, inform the user that welcome email failed
        // For now, proceed
      }

      // Notification Email to Admin
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER; // Use ADMIN_EMAIL if defined, else EMAIL_USER
      const mailOptionsToAdmin = {
        from: `"ExploreEase" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: 'New Newsletter Subscription',
        text: `A new user has subscribed to the newsletter:

Email: ${email}`,
        html: `
          <h2>New Newsletter Subscription</h2>
          <p>A new user has subscribed to the newsletter:</p>
          <p><strong>Email:</strong> ${email}</p>
        `,
      };

      try {
        logger.info(`Sending notification email to admin: ${adminEmail}`);
        const adminInfo = await transporter.sendMail(mailOptionsToAdmin);
        logger.info(`Notification email sent to admin: ${adminEmail}. Message ID: ${adminInfo.messageId}`);
      } catch (error) {
        logger.error(`Error sending notification email to admin: ${adminEmail}:`, error);
        // Optionally, decide how to handle this
      }

      res.json({ success: true, message: 'Subscription successful! Welcome email sent.' });
    } catch (error) {
      logger.error('Error subscribing to Mailchimp:', error.response ? error.response.data : error.message);

      // Handle specific Mailchimp errors
      if (error.response && error.response.status === 400 && error.response.data.title === 'Member Exists') {
        return res.status(400).json({ success: false, message: 'This email is already subscribed.' });
      }

      res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again later.' });
    }
  }
);

// Contact Form Endpoint
app.post('/api/contact',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Contact form validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message } = req.body;

    logger.info(`Received contact form submission from ${email}`);

    // Create Nodemailer transporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: 'Gmail', // Use 'Gmail' or another email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verify transporter configuration
      await transporter.verify();
      logger.info('Nodemailer transporter configured successfully.');
    } catch (error) {
      logger.error('Error setting up Nodemailer transporter:', error);
      return res.status(500).json({ success: false, message: 'Failed to set up email transporter.' });
    }

    // Email to site owner
    const mailOptionsToOwner = {
      from: `"${name}" <${email}>`, // Sender address
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Site owner's email
      subject: 'New Contact Form Submission',
      text: `You have a new contact form submission:

Name: ${name}
Email: ${email}
Message:
${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Confirmation email to sender
    const mailOptionsToSender = {
      from: `"ExploreEase" <${process.env.EMAIL_USER}>`, // Sender address
      to: email, // Sender's email
      subject: 'Thank you for contacting ExploreEase!',
      text: `Hello ${name},

Thank you for reaching out to us. We have received your message and will get back to you shortly.

Best regards,
ExploreEase Team`,
      html: `
        <h2>Thank You for Contacting Us!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for reaching out to us. We have received your message and will get back to you shortly.</p>
        <p>Best regards,<br/>ExploreEase Team</p>
      `,
    };

    try {
      // Send email to site owner
      await transporter.sendMail(mailOptionsToOwner);
      logger.info(`Contact form submission email sent to site owner from ${email}.`);

      // Send confirmation email to sender
      await transporter.sendMail(mailOptionsToSender);
      logger.info(`Confirmation email sent to subscriber: ${email}.`);

      res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
      logger.error('Error sending contact form emails:', error);
      res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
  }
);
