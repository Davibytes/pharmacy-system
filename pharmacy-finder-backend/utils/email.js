const nodemailer = require('nodemailer');

const hasSmtpConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER);
};

const createTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
};

const sendPasswordResetCode = async ({ to, name, code }) => {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || 'Pharmacy Finder';
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!transporter) {
    throw new Error('SMTP is not configured for password reset emails');
  }

  await transporter.sendMail({
    from,
    to,
    subject: `${appName} password reset code`,
    text: [
      `Hello ${name || 'there'},`,
      '',
      `Your ${appName} password reset code is ${code}.`,
      'This code expires in 15 minutes. If you did not request it, ignore this email.',
    ].join('\n'),
  });
};

const sendPasswordResetLink = async ({ to, name, resetUrl }) => {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || 'Pharmacy Finder';
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!transporter) {
    throw new Error('SMTP is not configured for password reset emails');
  }

  await transporter.sendMail({
    from,
    to,
    subject: `${appName} password reset`,
    text: [
      `Hello ${name || 'there'},`,
      '',
      `Reset your ${appName} password using this link:`,
      resetUrl,
      '',
      'This link expires in 15 minutes. If you did not request it, ignore this email.',
    ].join('\n'),
  });
};

module.exports = {
  sendPasswordResetCode,
  sendPasswordResetLink,
};
