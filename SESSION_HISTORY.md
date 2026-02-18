# Session History — Clawhub Customer Hunter Pipeline

## Overview
Matt Gates (Ridge Cell Repair LLC) built a scaffold for a cold outreach customer acquisition pipeline. Claude operationalized it across multiple sessions on 2026-02-15/16/17, sending 30+ personalized proposals to local businesses across Northern California.

---

## Session Timeline

### Session 1 — Initial Setup & First Sends (2026-02-15)
1. Explored project scaffold — found scripts, templates, configs, 2 pre-built .docx proposals
2. **Blocker:** No `.env` file. Matt provided Gmail credentials (ridgecellrepair@gmail.com)
3. First app password rejected (535-5.7.8 auth error). Matt provided fresh app password.
4. **Created `scripts/build_proposal.js`** — was missing from scaffold. Full .docx generator (~350 lines) using `docx` npm package.
5. Sent 2 homie proposals:
   - Midnight Munitions → sales@midnightmunitions.com
   - First Choice Plastics → Corysturgis@live.com
6. Prospected Northern CA businesses. Found M&M Fence (mandmfence.net) with real SEO weaknesses.
7. Sent cold proposal to M&M Fence → mandmfence@yahoo.com
8. Matt said: "keep generating proposals, spawn a sub agent for scraping"
9. Spawned background scraping agent — found 16 new prospects with email addresses
10. Generated 6 proposals for phone-only prospects (no email available)
11. Found Apex HVAC from scraper results, audited site, sent proposal → jesse@apexhvac.co

**End of Session 1:** 4 emails sent, 6 proposals generated (phone-only), 16 new prospects queued

### Session 2 — Batch Processing Round 1 (2026-02-15, continued)
1. Launched 15 parallel website audit sub-agents
2. Discovered Clear Choice Pool actually HAS a website at clearchoiceps.com (Wix, 4/10)
3. Built and sent first batch of 5:
   - Pool Service Inc → poolservice95@yahoo.com
   - Clear Choice Pool → clearchoicepoolservice@gmail.com
   - Crossfire Tree → crossfiretree@gmail.com
   - McMillan Tree → scott_mcmlln@yahoo.com
   - Dave Brown's Pest → davebrownspestcontrol@gmail.com

**End of Session 2:** 9 total emails sent

### Session 3 — Batch Processing Round 2 (2026-02-15, continued)
1. Created 9 proposal JSON configs from completed audit data
2. Generated 9 .docx files in parallel
3. Sent all 9 cold emails in parallel:
   - Double Diamond Steel → office@doublediamondsteel.com
   - Slag Factory → Info@slagfactory.com
   - Run Electric → runconst@gmail.com
   - M&S Fencing → contact@msfences.com
   - Earl's Plumbing → contact@earlsplumbing.net
   - Barrows Landscaping → sales@barrowslandscaping.com
   - Paradise Landscaping → paradiselandscape78@gmail.com
   - Bidwell Iron → Mail@Bidwelliron.com
   - L&T Towing → tyler@lttowing.com
4. Processed final 2 audit agents (Western Termite, Feather River Aire)
5. Sent Western Termite → westerntermite@gmail.com
6. Sent Feather River Aire → info@featherriveraire.com (BOUNCED — address doesn't exist)
7. Updated all clients.json statuses

**End of Session 3:** 20 total emails sent (1 bounced)

### Session 4 — Bounce Fix & Second Scrape (2026-02-15/16)
1. Fixed Feather River Aire bounce — correct email is Dispatch@featherriveraire.com
2. Resent proposal to correct address ✅
3. Matt asked: "scrape for more customers"
4. Launched second scraping round — found 17 new prospects in fresh industries (roofing, painting, masonry, concrete, garage doors, glass/windows, solar, auto body, general contractor, excavation, moving)
5. Launched 17 parallel website audit agents
6. Built and sent Knockout Collision → info@knockoutcollisionrepair.com
7. **Hit prompt-too-long errors** — 16 remaining audit agents returned but couldn't be processed

**End of Session 4:** 21 emails sent. 16 new prospects audited but not yet processed into proposals.

### Session 5 — Recovery & Continued Processing (2026-02-16/17)
Context recovered from previous sessions. Before sending, checked Gmail sent folder via IMAP to prevent duplicate emails.

**Sent folder audit results (24 proposal emails confirmed in Gmail):**
- All 21 from sessions 1-4 confirmed in sent folder
- Additionally found 4 more sent during Session 4 crash recovery (before prompt-too-long killed the session):
  - George Roofing → info@georgeroofing.net (sent 2026-02-17 03:52 UTC)
  - Boster Roofing → info@bosterroofing.com (sent 2026-02-17 03:56 UTC)
  - Tugwell Roofing → tugwellroofing@gmail.com (sent 2026-02-17 03:56 UTC)
  - Hamilton Roofing → office@hamiltonroofing.com (sent 2026-02-17 03:56 UTC)

**New sends this session:**
1. JD Rivera Concrete → jaime@riveraconcrete.com (from website audit, not jdriveraconcrete@gmail.com)
2. MV Masonry → mvmasonry@yahoo.com

**Launched 10 parallel audit agents for remaining unsent prospects:**
- SGB Custom Painting, Sharp's Locksmithing, OHM Solar, Lash's Glass, Miller Glass, Touch of Glass & Screen, Davis Excavating, Axner Excavating, Gheen Builders, Murdock's Moving

**Running total: 27 emails sent, 10 more in pipeline**

### Session 5 Continued — Processing 10 Remaining Audits (2026-02-16)
Recovered from second prompt-too-long crash. All 10 audit agents completed successfully.

**First batch (4 configs built, .docx generated, emails sent):**
1. SGB Custom Painting → sgbpainting@gmail.com ✅
   - Squarespace, managed by Peterson SEO. 5 H1 tags, heavy keyword stuffing, NAP inconsistency. PDCA accredited.
2. OHM Solar Solutions → info@ohmsolar.com ✅
   - WordPress/Elementor. No meta description, no OG tags, no LocalBusiness schema, 5/7 images missing alt.
3. Gheen Builders → info@gheenbuilders.com ✅
   - WordPress. No blog, thin meta, minimal alt text, no review schema. Trader Joe's client.
4. Murdock's Moving → info@murdocksmoving.com ✅
   - WordPress/AIOSEO Pro. OG title shows phone number, no MovingCompany schema, H1→H4 heading skip.

**Second batch (5 configs built, .docx generated, emails sent):**
5. Sharp's Locksmithing → sharpslock@yahoo.com ✅
   - WordPress/Divi. No meta desc, zero schema, multiple H1s, no blog. Family-owned since 1976.
6. Miller Glass → info@millerglasschico.com ✅
   - WordPress. 7 locations, 50yr history, BBB A+. No meta desc, zero schema, broken H-tags, no blog.
7. Touch of Glass & Screen → touchofglass@sbcglobal.net ✅
   - Duda platform. Weak meta, thin schema, 1 blog post in 2 years. 25yr history, 2 locations.
8. Axner Excavating → info@axnerexcavating.com ✅
   - WordPress. Since 1967. Title only targets Redding, no schema, weak meta. PageSpeed SEO: 100.
9. Lash's Glass → lashsglass@gmail.com ✅
   - Custom PHP (no CMS). Blank meta desc, zero schema, 54 HTTP links (mixed content), 9/12 images missing alt.

**Skipped:**
- Davis Excavating — NOT FOUND in Oroville, CA. Extensive search (Google, Yelp, Angi, CSLB, BBB, Facebook, Instagram, FMCSA) found only a Davis Excavating in Anderson, CA (owner: Raul Davis, (530) 356-9289). Business from original scrape likely doesn't exist at Oroville address.

**Updated clients.json with all 17 new prospects (16 sent + 1 skipped)**

**End of Session 5: 36 total emails sent (9 this session), 1 prospect skipped (Davis Excavating)**

---

### Session 6 — Round 3 Scrape, Bounce Investigation & Continued Sends (2026-02-17)
Continued from Session 5. Round 3 city-based scraping had been completed in prior session (Chico 21 prospects, Redding 19 prospects). 8 website audit agents completed.

**Bounce Investigation (Matt's urgent request: "check my email, we're getting failure to delivers"):**
Created `scripts/check_bounces.js` — connects via IMAP to check for bounce-back notifications.

**7 BOUNCED emails identified:**
| # | Recipient | Reason | Error Code |
|---|-----------|--------|------------|
| 1 | touchofglass@sbcglobal.net | Mailbox not found | 5.1.1 |
| 2 | info@millerglasschico.com | Domain doesn't exist (NXDOMAIN) | 5.1.2 |
| 3 | sharpslock@yahoo.com | Mailbox not found | 5.1.1 |
| 4 | info@ohmsolar.com | Recipient not found (Microsoft 365) | 5.1.10 |
| 5 | mvmasonry@yahoo.com | Mailbox not found | 5.1.1 |
| 6 | info@bosterroofing.com | Account doesn't exist | 5.1.1 |
| 7 | info@featherriveraire.com | Account doesn't exist | 5.1.1 |

All 7 marked as `email_bounced` in clients.json with bounce reasons and dates. These 7 need phone follow-up.

**Round 3 Proposals Built & Sent This Session:**
| # | Business | Email | SEO Score | Status |
|---|----------|-------|-----------|--------|
| 41 | The Door Company | chico@thedoorco.net | 5/10 | ✅ SENT |
| 42 | Gates Garage Door | gatesgaragedoorservice@yahoo.com | 5/10 | ✅ SENT |
| 43 | Chico Plumbing | chicoplumbing@gmail.com | 3/10 | ✅ SENT |
| 44 | Chico Electric | info@chicoelectric.com | 3/10 | ✅ SENT |
| 45 | Primetime Asphalt | Ken@Primetimeasphaltpaving.shop | 3/10 | ✅ SENT |
| 46 | Custom Plumbing Pros | John@CustomPlumbingPros.com | 4.5/10 | ✅ SENT |

**Prior sends this session (from earlier context windows):**
| # | Business | Email | Status |
|---|----------|-------|--------|
| 37 | Chico Septic | jamie@chicoseptic.com | ✅ SENT |
| 38 | Walgamuth Painting | info@walgamuthpainting.com | ✅ SENT |
| 39 | Western Gutters | info@westerngutters.com | ✅ SENT |
| 40 | Wood Brothers Carpet | Craig@WoodBrothersCarpet.org | ✅ SENT |

**New process added:** Post-send bounce verification check using `scripts/check_bounces.js` — run after every send cycle.

**Post-send verification caught 2 NEW bounces:**
- Gates Garage Door (gatesgaragedoorservice@yahoo.com) — 5.1.1 Mailbox not found
- Primetime Asphalt (Ken@Primetimeasphaltpaving.shop) — 5.1.2 NXDOMAIN domain dead

**End of Session 6: 46 total emails sent, 9 bounced (need phone follow-up), 37 delivered, 52 total clients in database**

---

## Pipeline State (Current)

### Fully Processed — Emails Sent (46 total, 7 bounced)
| # | Business | Email | Tone | SEO Score | Sent Date | Status |
|---|----------|-------|------|-----------|-----------|--------|
| 1 | Midnight Munitions | sales@midnightmunitions.com | Homie | N/A | 2026-02-15 | ✅ |
| 2 | First Choice Plastics | Corysturgis@live.com | Homie | N/A | 2026-02-15 | ✅ |
| 3 | M&M Fence Company | mandmfence@yahoo.com | Cold | Weak | 2026-02-15 | ✅ |
| 4 | Apex HVAC | jesse@apexhvac.co | Cold | 7.5/10 | 2026-02-15 | ✅ |
| 5 | Pool Service Inc | poolservice95@yahoo.com | Cold | 3/10 | 2026-02-15 | ✅ |
| 6 | Clear Choice Pool | clearchoicepoolservice@gmail.com | Cold | 4/10 | 2026-02-15 | ✅ |
| 7 | Crossfire Tree | crossfiretree@gmail.com | Cold | 5.5/10 | 2026-02-15 | ✅ |
| 8 | McMillan Tree | scott_mcmlln@yahoo.com | Cold | 4/10 | 2026-02-15 | ✅ |
| 9 | Dave Brown's Pest | davebrownspestcontrol@gmail.com | Cold | 5.5/10 | 2026-02-15 | ✅ |
| 10 | Double Diamond Steel | office@doublediamondsteel.com | Cold | 3.5/10 | 2026-02-15 | ✅ |
| 11 | Slag Factory | Info@slagfactory.com | Cold | 4.5/10 | 2026-02-15 | ✅ |
| 12 | Run Electric | runconst@gmail.com | Cold | 3/10 | 2026-02-15 | ✅ |
| 13 | M&S Fencing | contact@msfences.com | Cold | 6.2/10 | 2026-02-15 | ✅ |
| 14 | Earl's Plumbing | contact@earlsplumbing.net | Cold | 5.5/10 | 2026-02-15 | ✅ |
| 15 | Barrows Landscaping | sales@barrowslandscaping.com | Cold | 5.5/10 | 2026-02-15 | ✅ |
| 16 | Paradise Landscaping | paradiselandscape78@gmail.com | Cold | 3.5/10 | 2026-02-15 | ✅ |
| 17 | Bidwell Iron | Mail@Bidwelliron.com | Cold | 3/10 | 2026-02-15 | ✅ |
| 18 | L&T Towing | tyler@lttowing.com | Cold | 5.5/10 | 2026-02-15 | ✅ |
| 19 | Western Termite | westerntermite@gmail.com | Cold | 4.5/10 | 2026-02-15 | ✅ |
| 20 | Feather River Aire | Dispatch@featherriveraire.com | Cold | 5.5/10 | 2026-02-15 | ❌ BOUNCED |
| 21 | Knockout Collision | info@knockoutcollisionrepair.com | Cold | 7.2/10 | 2026-02-16 | ✅ |
| 22 | George Roofing | George3Roofing@gmail.com | Cold | TBD | 2026-02-16 | ✅ |
| 23 | Boster Roofing | bosterroofing@gmail.com | Cold | TBD | 2026-02-16 | ❌ BOUNCED |
| 24 | Tugwell Roofing | info@tugwellroofing.com | Cold | TBD | 2026-02-16 | ✅ |
| 25 | Hamilton Roofing | hamiltonrfg@yahoo.com | Cold | TBD | 2026-02-16 | ✅ |
| 26 | JD Rivera Concrete | jdriveraconcrete@gmail.com | Cold | 4.5/10 | 2026-02-16 | ✅ |
| 27 | MV Masonry | mvmasonry@yahoo.com | Cold | 5/10 | 2026-02-16 | ❌ BOUNCED |
| 28 | SGB Custom Painting | sgbpainting@gmail.com | Cold | 5.5/10 | 2026-02-16 | ✅ |
| 29 | OHM Solar Solutions | info@ohmsolar.com | Cold | 4.5/10 | 2026-02-16 | ❌ BOUNCED |
| 30 | Gheen Builders | info@gheenbuilders.com | Cold | 4.5/10 | 2026-02-16 | ✅ |
| 31 | Murdock's Moving | info@murdocksmoving.com | Cold | 5.5/10 | 2026-02-16 | ✅ |
| 32 | Sharp's Locksmithing | sharpslock@yahoo.com | Cold | 3.5/10 | 2026-02-16 | ❌ BOUNCED |
| 33 | Miller Glass | info@millerglasschico.com | Cold | 4.5/10 | 2026-02-16 | ❌ BOUNCED (domain dead) |
| 34 | Touch of Glass & Screen | touchofglass@sbcglobal.net | Cold | 4.5/10 | 2026-02-16 | ❌ BOUNCED |
| 35 | Axner Excavating | info@axnerexcavating.com | Cold | 4.5/10 | 2026-02-16 | ✅ |
| 36 | Lash's Glass | lashsglass@gmail.com | Cold | 3.5/10 | 2026-02-16 | ✅ |
| 37 | Chico Septic | jamie@chicoseptic.com | Cold | 4/10 | 2026-02-17 | ✅ |
| 38 | Walgamuth Painting | info@walgamuthpainting.com | Cold | 4/10 | 2026-02-17 | ✅ |
| 39 | Western Gutters | info@westerngutters.com | Cold | 3/10 | 2026-02-17 | ✅ |
| 40 | Wood Brothers Carpet | Craig@WoodBrothersCarpet.org | Cold | 4/10 | 2026-02-17 | ✅ |
| 41 | The Door Company | chico@thedoorco.net | Cold | 5/10 | 2026-02-17 | ✅ |
| 42 | Gates Garage Door | gatesgaragedoorservice@yahoo.com | Cold | 5/10 | 2026-02-17 | ❌ BOUNCED |
| 43 | Chico Plumbing | chicoplumbing@gmail.com | Cold | 3/10 | 2026-02-17 | ✅ |
| 44 | Chico Electric | info@chicoelectric.com | Cold | 3/10 | 2026-02-17 | ✅ |
| 45 | Primetime Asphalt | Ken@Primetimeasphaltpaving.shop | Cold | 3/10 | 2026-02-17 | ❌ BOUNCED |
| 46 | Custom Plumbing Pros | John@CustomPlumbingPros.com | Cold | 4.5/10 | 2026-02-17 | ✅ |

### Bounced Emails — Need Phone Follow-Up (9)
| Business | Bounced Email | Reason | Phone |
|----------|---------------|--------|-------|
| Feather River Aire | info@featherriveraire.com | 5.1.1 NoSuchUser | (530) 589-2260 |
| Boster Roofing | info@bosterroofing.com | 5.1.1 NoSuchUser | (530) 518-5218 |
| MV Masonry | mvmasonry@yahoo.com | 5.1.1 Mailbox not found | N/A |
| OHM Solar Solutions | info@ohmsolar.com | 5.1.10 Microsoft 365 RecipientNotFound | N/A |
| Sharp's Locksmithing | sharpslock@yahoo.com | 5.1.1 Mailbox not found | (530) 533-5713 |
| Miller Glass | info@millerglasschico.com | 5.1.2 Domain NXDOMAIN (dead) | (530) 343-7934 |
| Touch of Glass & Screen | touchofglass@sbcglobal.net | 5.1.1 Mailbox not found | (530) 538-8100 |
| Gates Garage Door | gatesgaragedoorservice@yahoo.com | 5.1.1 Mailbox not found | N/A |
| Primetime Asphalt | Ken@Primetimeasphaltpaving.shop | 5.1.2 NXDOMAIN (.shop domain dead) | N/A |

### Skipped Prospects (1)
| Business | Reason |
|----------|--------|
| Davis Excavating | Business not found in Oroville, CA. Only match: Anderson, CA (Raul Davis). |

### Proposals Generated — Phone Only (6, no email available)
| Business | Phone | Location | Key Issue |
|----------|-------|----------|-----------|
| Campbell Fence | (530) 533-8039 | Oroville | Website 1/10, no H1, no content in HTML |
| Gilbert's Auto Remedy | (530) 534-3318 | Oroville | 7.5/10, missing blog/FAQ |
| Lakeside Auto & Diesel | (530) 589-1088 | Oroville | NO website, 4.9 stars |
| AJ Auto Repair | (530) 538-9670 | Oroville | NO website, 20+ years |
| Surplus City Welding | (530) 534-1454 | Oroville | NO website, NO email |
| Ken's Paradise Hitch | (530) 877-3907 | Paradise | Website DOWN |

### Round 3 — Still Need Audit & Processing (~30 prospects)
**Chico (13 remaining):**
| Business | Email |
|----------|-------|
| A & EM Garage Doors | aandemgaragedoors@gmail.com |
| Pro Garage Doors | info@getprodoors.com |
| Earl's Plumbing | earlsplumbing@gmail.com |
| ABLE Plumbing | info@callablefirst.com |
| Agri Electric | agri@agrielectric.com |
| Captain Todd's Electrical | info@captaintoddselectrical.com |
| Inside Out Landscaping | sales@insideoutchico.com |
| North Valley Lawn Care | mike@northvalleylawncare.com |
| Distinctive Landscape | distinctivelandscape1@gmail.com |
| Sal Rodriguez Landscapes | info@rodriguezlandscapes.net |
| Hydrotec Solutions | hydrotec@gmail.com |
| Artisan Natural Stone | ryan@artisan-natural-stone.com |
| SPEEDY-CLEAN Painting | info@tryspeedy.com |

**Redding (18 remaining):**
| Business | Email |
|----------|-------|
| Inspire Painting | eric@inspirepaintinginc.com |
| All Plumbing & Drain | myreddingplumber@gmail.com |
| Advanced Plumbing & Electric | apande3@gmail.com |
| Stephens Electrical | cstephens@stephenselectricalinc.com |
| Horizon Electric | info@horizonelectricredding.com |
| Living Stone Electric | livingstoneelectric@outlook.com |
| Strange & Son Fencing | strangensonfence@yahoo.com |
| American Door Company | adc.rdg@gmail.com |
| Nor-Cal Garage Door | office@reddinggaragedoors.com |
| Factory Flooring Outlet | info@reddingfloors.com |
| Carpet One of Redding | reddingcarpetone@gmail.com |
| Complete Lawn & Landscape | info@completelawnandlandscape.com |
| Londono Lawn Care | londonolawncare@gmail.com |
| R.A.W. Roofing | RAW@RoofRedding.com |
| Mast Roofing | info@mastroofing.com |
| Benson Roofing | bensonroofinginc@yahoo.com |
| Caleb Dunn's Handyman | calebdunnhandyman@gmail.com |

---

## Technical Architecture

### Pipeline Flow
```
Research → JSON config → build_proposal.js → .docx → send_email.js → update clients.json
```

### Key Files
- `scripts/build_proposal.js` — Core .docx generator (~350 lines, uses `docx` npm package)
  - CLI: `node build_proposal.js --config path/to/config.json [--output path/to/output.docx]`
  - Creates cover page, findings table (color-coded), pricing comparison, headers/footers
  - Brand: Primary #1B4F72, Accent #2E86C1, Font: Arial, DXA table widths
- `scripts/send_email.js` — Gmail SMTP sender via nodemailer
  - CLI: `node send_email.js --to "email" --subject "Subject" --body "Body" --attach "file.docx"`
  - From: Matt Gates <ridgecellrepair@gmail.com>
- `scripts/pipeline.js` — Orchestrates email sending by client ID
- `config/clients.json` — Client database (status: prospect → proposal_generated → email_sent)
- `config/sender.json` — Matt's contact info
- `templates/email_cold.txt` — Cold email template with {{CONTACT_NAME}}, {{BUSINESS_NAME}}, {{KEY_FINDING}}
- `templates/email_homie.txt` — Casual homie template
- `templates/email_inbound.txt` — Inbound response template
- `.env` — Gmail SMTP credentials (gitignored)

### Pricing Tiers (adjusted by industry)
| Industry | Starter | Growth | Premium |
|----------|---------|--------|---------|
| Default | $600/mo | $1,100/mo | $1,800/mo |
| Pool/Landscaping | $550/mo | $950/mo | $1,600/mo |
| E-commerce (WooCommerce) | $650/mo | $1,100/mo | $1,800/mo |
| Plumbing/HVAC (higher value) | $650/mo | $1,100/mo | $1,800/mo |

### SEO Audit Methodology
Each prospect gets a real website audit covering:
- Meta descriptions, title tags, H1 tags
- Schema markup (LocalBusiness, Review, FAQ, Service)
- Content depth (blog, service pages, location pages)
- Image alt text
- Analytics presence
- NAP consistency (Name, Address, Phone)
- Mobile responsiveness
- Competitor analysis
- Platform identification (WordPress, Squarespace, Wix, Shopify, Astro, Webflow, custom)

---

## Known Issues & Gotchas
1. **Windows paths** — Use forward slashes in Bash, backslashes in file paths
2. **Yelp blocks scraping** — Returns 403. Use Google/YellowPages/BBB instead
3. **Gmail auth** — Uses App Password (requires 2FA enabled). App passwords can be invalidated.
4. **Email bounces** — 7 out of 46 emails bounced (~15%). Common causes: dead mailboxes (yahoo, sbcglobal), dead domains (millerglasschico.com), Microsoft 365 not configured. Always run bounce check after sending.
5. **Context overflow** — Large parallel audit batches (15+) can hit prompt-too-long. Process in smaller batches of 5-8.
6. **No-email prospects** — Many local businesses have phone only. Proposals are generated and saved, need Matt to call for email addresses.
7. **Paradise Landscaping** — Located in Santa Clarita CA, NOT Paradise CA (despite name)
8. **send_email.js flag** — Attachment flag is `--attach` NOT `--attachment`. Wrong flag sends email without attachment.
9. **Post-send verification** — ALWAYS run `node scripts/check_bounces.js` after each send cycle to catch bounces early.
10. **Gmail sending limits** — Gmail allows ~500 emails/day with regular accounts, but high volume from new sender can trigger spam filters. Space sends if needed.

---

## Matt's Standing Instructions
- "Do not ask questions about approvals all approvals have been given just go ahead and do this"
- "yes keep generating the proposals, spawn a sub agent for the scraping"
- All proposals approved for sending — no confirmation needed
- After sending proposals, immediately scrape for more prospects
- Use real audit data only — never fabricate numbers
