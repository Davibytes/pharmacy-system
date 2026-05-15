require('dotenv').config();

const nodemailer = require('nodemailer');

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing SMTP config: ${missing.join(', ')}`);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter
  .verify()
  .then(() => {
    console.log('SMTP connection verified. Password reset emails can be sent.');
  })
  .catch((error) => {
    console.error('SMTP verification failed:', error.message);
    process.exit(1);
  });
