const nodemailer = require('nodemailer');
const configService = require('../services/config.service');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const fromName = await configService.getFromName();
    
    const info = await transporter.sendMail({
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
      status: 'sent',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
