# Client Proposal Generator — Claude Code Edition

## Overview
Automated client proposal pipeline that researches prospects, generates polished .docx proposals, composes emails, and sends them — all from the command line via Claude Code.

## Quick Start
```bash
cd proposal-generator
npm install
cp config/env.example .env   # Fill in your Gmail credentials
node scripts/send_email.js    # Test email sending
```

## Project Structure
```
proposal-generator/
├── README.md                    # This file
├── CLAUDE.md                    # Instructions for Claude Code
├── package.json                 # Node dependencies
├── .env                         # Gmail credentials (DO NOT COMMIT)
├── config/
│   ├── env.example              # Template for .env
│   ├── sender.json              # Matt's contact info & company details
│   └── clients.json             # Client/prospect database
├── skills/
│   └── SKILL.md                 # The proposal generator skill file
├── scripts/
│   ├── research.js              # Web research helper (placeholder — Claude Code does this natively)
│   ├── build_proposal.js        # Core docx generator with reusable functions
│   ├── send_email.js            # Gmail SMTP sender with attachment support
│   └── pipeline.js              # Full pipeline: research → build → email
├── templates/
│   ├── email_cold.txt           # Cold outreach email template
│   ├── email_homie.txt          # Friend/partner email template
│   └── email_inbound.txt        # Inbound response email template
└── proposals/                   # Generated proposals land here
    ├── Midnight_Munitions_Digital_Growth_Proposal.docx
    └── First_Choice_Plastics_Digital_Growth_Proposal.docx
```

## Setup

### 1. Gmail App Password
You need a Gmail App Password (NOT your regular password) to send emails:
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new app password for "Mail"
3. Copy the 16-character password
4. Add it to your `.env` file

### 2. Environment Variables
```bash
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### 3. Install Dependencies
```bash
npm install
```

## Usage with Claude Code

### Generate and send a proposal
```
claude "Generate a proposal for [Business Name] at [URL] and email it to [email]. This is a [cold/homie/inbound] outreach."
```

### Add a new prospect
```
claude "Add [Business Name] to the client database with email [email] and mark as [cold/homie/inbound]"
```

### Batch proposals
```
claude "Generate and send proposals for all prospects in clients.json that don't have proposals yet"
```

## Email Tones
- **cold** — Professional but direct, leads with findings, pitches services
- **homie** — Casual friend sharing useful info, no sales pitch
- **inbound** — Responding to their inquiry, validates their ask with research

## Dependencies
- `docx` — Word document generation
- `nodemailer` — Email sending via Gmail SMTP
- `dotenv` — Environment variable management

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

## Support This Project

If you find this project useful, consider buying me a coffee! Your support helps me keep building and sharing open-source tools.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z61UCUI7)

Every donation, no matter how small, is greatly appreciated and motivates continued development. Thank you!
