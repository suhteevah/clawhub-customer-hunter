# CLAUDE.md — Client Proposal Generator

## What This Project Does
This is Matt Gates' (Ridge Cell Repair LLC) client proposal pipeline. It researches prospects, generates professional .docx proposals, and sends them via email.

## Key Commands

### Generate a proposal
When Matt says something like "generate a proposal for [business]" or "pitch [business]":
1. Research the business (website audit, SEO check, competitor analysis)
2. Generate a .docx proposal using `scripts/build_proposal.js` patterns
3. Save to `proposals/` directory
4. Ask Matt to confirm before sending

### Send a proposal
When Matt says "send it" or "email it to [address]":
1. Read the email tone from context (cold, homie, inbound)
2. Compose the email using the appropriate template from `templates/`
3. Attach the .docx from `proposals/`
4. Send via `scripts/send_email.js`
5. Update `config/clients.json` with sent status

### Add a prospect
When Matt mentions a new business or says "add [business] to the list":
1. Add to `config/clients.json`
2. Include name, email, URL, relationship type, and status

## Matt's Info (for proposals and emails)
- **Name:** Matt Gates
- **Company:** Ridge Cell Repair LLC
- **Phone:** (530) 786-3655
- **Location:** California
- **Services:** SEO, Digital Marketing, Website Development, Business Analysis

## Proposal Structure
Every proposal follows this structure:
1. **Cover Page** — Professional branded cover with prospect name and date
2. **Executive Summary** — Hook with the most compelling finding
3. **Digital Presence Assessment** — Website audit, SEO visibility, competitive landscape
4. **Findings Summary Table** — Color-coded priority matrix
5. **Recommended Strategy** — Phased action plan (3 phases)
6. **Service Packages** — 3 retainer tiers in comparison table
7. **About Ridge Cell Repair LLC** — Brief company background
8. **Next Steps** — CTA with contact info

## Design Standards
- **Primary color:** #1B4F72 (dark blue)
- **Accent color:** #2E86C1 (lighter blue)
- **Font:** Arial throughout
- **Page size:** US Letter (8.5" x 11")
- **Margins:** 1 inch all sides
- Use `docx` npm package for generation
- Always validate with proper table widths (DXA, not percentage)

## Email Tones
- **cold** — Professional, leads with findings, includes pricing tiers. "I noticed some opportunities for your business..."
- **homie** — Casual, no sales pitch, friend sharing info. "Was messing around and put this together for you..."
- **inbound** — Responds to their ask, validates with research, direct on pricing. "Based on what you described..."

## Pricing Tiers (defaults, Matt can override)
| Tier | Range |
|------|-------|
| Starter/Launch | $500-800/mo |
| Growth | $800-1,500/mo |
| Premium/Full Build | $1,500-2,500/mo |

## Important Rules
- ALWAYS use real research data in proposals — never placeholder content
- NEVER fabricate traffic numbers, rankings, or competitor data
- For "homie" deals, still generate the full proposal but adjust the email to be casual with no sales pressure
- Always confirm with Matt before sending any email
- Save every generated proposal to the `proposals/` directory
- Update `config/clients.json` after every action

## Existing Clients (reference)
- **Midnight Munitions** — Christian Anderson, sales@midnightmunitions.com, veteran-owned NAS3 ammo manufacturer in Nephi UT. Homie/freebie.
- **First Choice Plastics** — Cory Sturgis, Corysturgis@live.com, plastics/3D printing in Oroville CA. Homie/business partner.
- **Halsey Bottling** — Previous client, SEO analysis completed
- **Compac Engineering** — Previous client
