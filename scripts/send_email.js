#!/usr/bin/env node
/**
 * Send email with attachment via Gmail SMTP
 * 
 * Usage: 
 *   node send_email.js --to "email@example.com" --subject "Subject" --body "Body text" --attach "./proposal.docx"
 *   
 * Or require and call programmatically:
 *   const { sendEmail } = require('./send_email');
 *   await sendEmail({ to, subject, body, attachments });
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

/**
 * Send an email with optional attachments
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Plain text body
 * @param {string[]} [options.attachments] - Array of file paths to attach
 * @param {string} [options.from] - Override sender (defaults to GMAIL_USER)
 */
async function sendEmail({ to, subject, body, attachments = [], from }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error(
      'Missing Gmail credentials. Copy config/env.example to .env and fill in your credentials.\n' +
      'You need a Gmail App Password: https://myaccount.google.com/apppasswords'
    );
  }

  const mailOptions = {
    from: from || `Matt Gates <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: body,
    attachments: attachments.map(filePath => ({
      filename: path.basename(filePath),
      path: path.resolve(filePath)
    }))
  };

  // Verify attachments exist
  for (const att of mailOptions.attachments) {
    if (!fs.existsSync(att.path)) {
      throw new Error(`Attachment not found: ${att.path}`);
    }
  }

  console.log(`\nSending email...`);
  console.log(`  To: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Attachments: ${attachments.length > 0 ? attachments.join(', ') : 'none'}`);

  const result = await transporter.sendMail(mailOptions);
  console.log(`  ✅ Sent! Message ID: ${result.messageId}\n`);
  return result;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const to = getArg('--to');
  const subject = getArg('--subject');
  const body = getArg('--body');
  const attach = getArg('--attach');

  if (!to || !subject || !body) {
    console.log('Usage: node send_email.js --to "email" --subject "Subject" --body "Body" [--attach "file.docx"]');
    process.exit(1);
  }

  sendEmail({
    to,
    subject,
    body,
    attachments: attach ? [attach] : []
  }).catch(err => {
    console.error('❌ Failed to send:', err.message);
    process.exit(1);
  });
}

module.exports = { sendEmail };
