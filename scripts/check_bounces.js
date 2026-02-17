#!/usr/bin/env node
/**
 * Check Gmail inbox for bounce-back / delivery failure notifications
 * Uses IMAP via imapflow to connect to Gmail and search for bounce messages
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { ImapFlow } = require('imapflow');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env');
  process.exit(1);
}

async function checkBounces() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    },
    logger: false
  });

  const bounces = [];

  try {
    console.log(`Connecting to Gmail IMAP as ${GMAIL_USER}...`);
    await client.connect();
    console.log('Connected successfully.\n');

    // Search in INBOX
    const mailboxes = ['INBOX', '[Gmail]/All Mail'];

    for (const mailboxName of mailboxes) {
      try {
        const lock = await client.getMailboxLock(mailboxName);
        console.log(`Searching in "${mailboxName}" (${client.mailbox.exists} total messages)...`);

        try {
          // Search for bounce-related subjects using OR queries
          // ImapFlow uses a search object syntax
          const bounceTerms = [
            'delivery',
            'failure',
            'undeliverable',
            'bounce',
            'returned',
            'Delivery Status Notification',
            'Mail Delivery Subsystem',
            'Undelivered Mail',
            'delivery failed',
            'could not be delivered',
            'permanent failure'
          ];

          // Search for messages from common bounce senders OR with bounce subjects
          // We'll do individual searches and combine results
          const seenUids = new Set();

          for (const term of bounceTerms) {
            let results;
            try {
              // Search by subject
              results = await client.search({
                subject: term
              });
            } catch (e) {
              // If subject search fails, try OR search
              try {
                results = await client.search({
                  from: term
                });
              } catch (e2) {
                continue;
              }
            }

            if (results && results.length > 0) {
              for (const uid of results) {
                if (seenUids.has(uid)) continue;
                seenUids.add(uid);

                try {
                  const msg = await client.fetchOne(uid, {
                    envelope: true,
                    bodyStructure: true,
                    source: { start: 0, maxLength: 50000 }
                  }, { uid: false });

                  if (!msg) continue;

                  const subject = msg.envelope?.subject || '(no subject)';
                  const from = msg.envelope?.from?.[0]?.address || msg.envelope?.from?.[0]?.name || 'unknown';
                  const date = msg.envelope?.date || 'unknown date';
                  const to = msg.envelope?.to?.map(t => t.address).join(', ') || 'unknown';

                  // Parse the raw source to find the original recipient and failure reason
                  let originalRecipient = '';
                  let failureReason = '';

                  const rawSource = msg.source ? msg.source.toString('utf-8') : '';

                  // Look for Final-Recipient or Original-Recipient headers in DSN
                  const finalRecipientMatch = rawSource.match(/Final-Recipient:\s*(?:rfc822;)?\s*(.+)/i);
                  if (finalRecipientMatch) {
                    originalRecipient = finalRecipientMatch[1].trim();
                  }

                  const origRecipientMatch = rawSource.match(/Original-Recipient:\s*(?:rfc822;)?\s*(.+)/i);
                  if (origRecipientMatch && !originalRecipient) {
                    originalRecipient = origRecipientMatch[1].trim();
                  }

                  // Look for X-Failed-Recipients header
                  const failedRecipientsMatch = rawSource.match(/X-Failed-Recipients:\s*(.+)/i);
                  if (failedRecipientsMatch && !originalRecipient) {
                    originalRecipient = failedRecipientsMatch[1].trim();
                  }

                  // Try to extract recipient from subject line (e.g. "Delivery to ... has been suspended")
                  if (!originalRecipient) {
                    const subjectEmailMatch = subject.match(/[\w.-]+@[\w.-]+\.\w+/);
                    if (subjectEmailMatch) {
                      originalRecipient = subjectEmailMatch[0];
                    }
                  }

                  // Try to extract from body
                  if (!originalRecipient) {
                    // Look for common patterns in bounce body
                    const bodyEmailMatch = rawSource.match(/(?:was not delivered to|could not be delivered to|rejected by|failed for)\s+([\w.-]+@[\w.-]+\.\w+)/i);
                    if (bodyEmailMatch) {
                      originalRecipient = bodyEmailMatch[1];
                    }
                  }

                  // Extract failure/diagnostic reason
                  const diagnosticMatch = rawSource.match(/Diagnostic-Code:\s*(.+?)(?:\r?\n(?!\s))/is);
                  if (diagnosticMatch) {
                    failureReason = diagnosticMatch[1].trim().replace(/\s+/g, ' ');
                  }

                  const statusMatch = rawSource.match(/Status:\s*(\d\.\d+\.\d+)/i);
                  let statusCode = '';
                  if (statusMatch) {
                    statusCode = statusMatch[1];
                  }

                  // Look for Action: failed
                  const actionMatch = rawSource.match(/Action:\s*(.+)/i);
                  let action = '';
                  if (actionMatch) {
                    action = actionMatch[1].trim();
                  }

                  // Additional reason extraction from body text
                  if (!failureReason) {
                    const reasonPatterns = [
                      /The email account that you tried to reach (.*?)(?:\.|$)/i,
                      /Your message wasn't delivered .* because (.*?)(?:\.|$)/i,
                      /This message was not delivered .* due to (.*?)(?:\.|$)/i,
                      /Reason:\s*(.+?)(?:\r?\n)/i,
                      /Error:\s*(.+?)(?:\r?\n)/i,
                      /Remote server returned:\s*(.+?)(?:\r?\n)/i
                    ];
                    for (const pattern of reasonPatterns) {
                      const match = rawSource.match(pattern);
                      if (match) {
                        failureReason = match[1].trim().replace(/\s+/g, ' ').substring(0, 200);
                        break;
                      }
                    }
                  }

                  // Only include if it looks like a real bounce
                  const isBounce =
                    from.includes('mailer-daemon') ||
                    from.includes('postmaster') ||
                    from.includes('mail-noreply') ||
                    subject.toLowerCase().includes('delivery') ||
                    subject.toLowerCase().includes('undeliverable') ||
                    subject.toLowerCase().includes('failure') ||
                    subject.toLowerCase().includes('bounced') ||
                    subject.toLowerCase().includes('returned') ||
                    action.toLowerCase() === 'failed';

                  if (isBounce) {
                    bounces.push({
                      date: new Date(date).toLocaleString(),
                      subject: subject.substring(0, 100),
                      from,
                      originalRecipient: originalRecipient || '(could not extract)',
                      failureReason: failureReason ? failureReason.substring(0, 300) : '(could not extract)',
                      statusCode: statusCode || '',
                      mailbox: mailboxName
                    });
                  }
                } catch (fetchErr) {
                  // Skip individual message errors
                  console.log(`  Warning: Could not fetch message ${uid}: ${fetchErr.message}`);
                }
              }
            }
          }

          // Also search by sender (mailer-daemon, postmaster)
          const bounceSenders = ['mailer-daemon', 'postmaster'];
          for (const sender of bounceSenders) {
            let results;
            try {
              results = await client.search({
                from: sender
              });
            } catch (e) {
              continue;
            }

            if (results && results.length > 0) {
              for (const uid of results) {
                if (seenUids.has(uid)) continue;
                seenUids.add(uid);

                try {
                  const msg = await client.fetchOne(uid, {
                    envelope: true,
                    source: { start: 0, maxLength: 50000 }
                  }, { uid: false });

                  if (!msg) continue;

                  const subject = msg.envelope?.subject || '(no subject)';
                  const from = msg.envelope?.from?.[0]?.address || msg.envelope?.from?.[0]?.name || 'unknown';
                  const date = msg.envelope?.date || 'unknown date';

                  const rawSource = msg.source ? msg.source.toString('utf-8') : '';

                  let originalRecipient = '';
                  let failureReason = '';
                  let statusCode = '';

                  const finalRecipientMatch = rawSource.match(/Final-Recipient:\s*(?:rfc822;)?\s*(.+)/i);
                  if (finalRecipientMatch) originalRecipient = finalRecipientMatch[1].trim();

                  const failedRecipientsMatch = rawSource.match(/X-Failed-Recipients:\s*(.+)/i);
                  if (failedRecipientsMatch && !originalRecipient) originalRecipient = failedRecipientsMatch[1].trim();

                  if (!originalRecipient) {
                    const bodyEmailMatch = rawSource.match(/(?:was not delivered to|could not be delivered to|rejected|failed for)\s+([\w.-]+@[\w.-]+\.\w+)/i);
                    if (bodyEmailMatch) originalRecipient = bodyEmailMatch[1];
                  }

                  const diagnosticMatch = rawSource.match(/Diagnostic-Code:\s*(.+?)(?:\r?\n(?!\s))/is);
                  if (diagnosticMatch) failureReason = diagnosticMatch[1].trim().replace(/\s+/g, ' ');

                  const statusMatch = rawSource.match(/Status:\s*(\d\.\d+\.\d+)/i);
                  if (statusMatch) statusCode = statusMatch[1];

                  bounces.push({
                    date: new Date(date).toLocaleString(),
                    subject: subject.substring(0, 100),
                    from,
                    originalRecipient: originalRecipient || '(could not extract)',
                    failureReason: failureReason ? failureReason.substring(0, 300) : '(could not extract)',
                    statusCode: statusCode || '',
                    mailbox: mailboxName
                  });
                } catch (fetchErr) {
                  console.log(`  Warning: Could not fetch message ${uid}: ${fetchErr.message}`);
                }
              }
            }
          }

        } finally {
          lock.release();
        }
      } catch (mailboxErr) {
        console.log(`  Could not open "${mailboxName}": ${mailboxErr.message}`);
      }
    }

    await client.logout();
    console.log('\nDisconnected from Gmail.\n');

  } catch (err) {
    console.error('IMAP Error:', err.message);
    try { await client.logout(); } catch (e) {}
    process.exit(1);
  }

  // Deduplicate by subject+date+recipient
  const seen = new Set();
  const uniqueBounces = bounces.filter(b => {
    const key = `${b.subject}|${b.date}|${b.originalRecipient}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date (newest first)
  uniqueBounces.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Print summary
  console.log('='.repeat(80));
  console.log(`  BOUNCE / DELIVERY FAILURE REPORT`);
  console.log(`  Account: ${GMAIL_USER}`);
  console.log(`  Checked: ${new Date().toLocaleString()}`);
  console.log('='.repeat(80));

  if (uniqueBounces.length === 0) {
    console.log('\n  No bounce-back or delivery failure messages found.\n');
    console.log('  This means all sent emails were accepted by the recipient mail servers.');
    console.log('  (Note: This does not guarantee emails reached the inbox -- they may be in spam.)\n');
  } else {
    console.log(`\n  Found ${uniqueBounces.length} bounce/failure notification(s):\n`);

    uniqueBounces.forEach((b, i) => {
      console.log(`  --- Bounce #${i + 1} ---`);
      console.log(`  Date:            ${b.date}`);
      console.log(`  Original To:     ${b.originalRecipient}`);
      console.log(`  Subject:         ${b.subject}`);
      console.log(`  From:            ${b.from}`);
      if (b.statusCode) console.log(`  Status Code:     ${b.statusCode}`);
      console.log(`  Failure Reason:  ${b.failureReason}`);
      console.log('');
    });

    // Extract unique failed recipients
    const failedRecipients = [...new Set(
      uniqueBounces
        .map(b => b.originalRecipient)
        .filter(r => r !== '(could not extract)' && r.includes('@'))
    )];

    if (failedRecipients.length > 0) {
      console.log('  FAILED RECIPIENT ADDRESSES:');
      failedRecipients.forEach(r => console.log(`    - ${r}`));
      console.log('');
    }
  }

  console.log('='.repeat(80));
  return uniqueBounces;
}

checkBounces().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
