#!/usr/bin/env node
/**
 * Full proposal pipeline: build → compose email → send
 * 
 * This script is called by Claude Code after it has:
 * 1. Researched the prospect
 * 2. Generated the proposal .docx (saved to proposals/)
 * 3. Decided on email tone and composed the email
 * 
 * Usage:
 *   node pipeline.js --client "midnight-munitions" --subject "Subject" --body "Email body" 
 * 
 * Or for a new prospect not yet in clients.json:
 *   node pipeline.js --to "email@example.com" --subject "Subject" --body "Body" --attach "proposals/file.docx"
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sendEmail } = require('./send_email');
const fs = require('fs');
const path = require('path');

const CLIENTS_PATH = path.join(__dirname, '..', 'config', 'clients.json');
const PROPOSALS_DIR = path.join(__dirname, '..', 'proposals');

async function sendToClient(clientId, subject, body) {
  const data = JSON.parse(fs.readFileSync(CLIENTS_PATH, 'utf8'));
  const client = data.clients.find(c => c.id === clientId);
  
  if (!client) {
    throw new Error(`Client "${clientId}" not found in clients.json`);
  }
  if (!client.proposalFile) {
    throw new Error(`No proposal file for client "${clientId}". Generate one first.`);
  }

  const proposalPath = path.join(PROPOSALS_DIR, client.proposalFile);
  if (!fs.existsSync(proposalPath)) {
    throw new Error(`Proposal file not found: ${proposalPath}`);
  }

  const result = await sendEmail({
    to: client.email,
    subject,
    body,
    attachments: [proposalPath]
  });

  // Update client status
  client.emailSent = true;
  client.emailSentDate = new Date().toISOString();
  client.status = 'email_sent';
  fs.writeFileSync(CLIENTS_PATH, JSON.stringify(data, null, 2));
  console.log(`Updated ${clientId} status to email_sent`);

  return result;
}

async function sendDirect(to, subject, body, attachPath) {
  return sendEmail({
    to,
    subject,
    body,
    attachments: attachPath ? [attachPath] : []
  });
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const clientId = getArg('--client');
  const to = getArg('--to');
  const subject = getArg('--subject');
  const body = getArg('--body');
  const attach = getArg('--attach');

  if (clientId && subject && body) {
    sendToClient(clientId, subject, body).catch(err => {
      console.error('❌ Failed:', err.message);
      process.exit(1);
    });
  } else if (to && subject && body) {
    sendDirect(to, subject, body, attach).catch(err => {
      console.error('❌ Failed:', err.message);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  node pipeline.js --client "client-id" --subject "Subject" --body "Body"');
    console.log('  node pipeline.js --to "email" --subject "Subject" --body "Body" --attach "file.docx"');
    process.exit(1);
  }
}

module.exports = { sendToClient, sendDirect };
