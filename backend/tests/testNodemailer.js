// backend/testNodemailer.js

require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  let transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('Nodemailer transporter is ready.');
  } catch (error) {
    console.error('Error setting up Nodemailer transporter:', error);
    return;
  }

  let mailOptions = {
    from: `"Test Sender" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: 'Test Email from Nodemailer',
    text: 'This is a test email to verify Nodemailer setup.',
    html: '<p>This is a <strong>test email</strong> to verify Nodemailer setup.</p>',
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestEmail();
