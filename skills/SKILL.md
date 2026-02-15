---
name: client-proposal-generator
description: "Generate professional client proposals and pitches as polished Word documents (.docx). Use this skill whenever the user mentions a potential client, prospect, lead, business they want to pitch, proposal, pitch deck, quote, or engagement letter. Also trigger when the user says things like 'write a proposal for', 'pitch this business', 'I found a prospect', 'draft an engagement letter', 'send them a quote', or provides a business name/URL and wants to win their business. This skill researches the prospect's business, identifies gaps and opportunities, and produces a ready-to-send .docx proposal with specific findings and monthly retainer recommendations. Even if the user just drops a URL or business name with minimal context, use this skill to generate a full proposal."
---

# Client Proposal Generator

## Overview

This skill generates professional, persuasive client proposals for Ridge Cell Repair LLC's digital marketing and web development consulting services. It takes minimal input (a business name and/or URL) and produces a polished Word document (.docx) ready to send to the prospect.

The key differentiator of these proposals is that they include **real research findings** — not generic marketing fluff. Each proposal contains a mini-audit of the prospect's current digital presence, which demonstrates expertise and creates urgency.

## Workflow

### Step 1: Gather Input

At minimum, you need:
- **Business name**
- **Website URL** (if available)

Optionally, the user may also provide:
- Whether this is cold outreach or a response to an inbound inquiry
- Specific pain points the prospect mentioned
- Budget range or pricing to quote
- Any prior conversation context

If the user only provides a business name or URL, that's enough — proceed to research.

### Step 2: Research the Prospect

This is what makes the proposal powerful. Conduct a quick but thorough audit:

1. **Website audit** (use web_fetch on their URL):
   - Overall design quality and mobile-readiness
   - Page load indicators (heavy images, bloated code)
   - Clear calls-to-action? Contact forms working?
   - Content freshness — when was the site last updated?
   - SSL certificate present?
   - Basic on-page SEO: title tags, meta descriptions, heading structure

2. **SEO presence** (use web_search):
   - Search for their business name — do they rank for it?
   - Search for "[their service] + [their city]" — are they visible?
   - Check for Google Business Profile presence
   - Look for competitors ranking above them
   - Note any obvious keyword opportunities

3. **Competitive landscape** (use web_search):
   - Identify 2-3 direct competitors
   - Note what competitors are doing better digitally
   - Find opportunities the prospect is missing

4. **Social & reputation** (use web_search):
   - Check for social media presence
   - Look for reviews (Google, Yelp, industry-specific)
   - Note any reputation issues or opportunities

Organize findings into three categories:
- **Critical issues** (things actively hurting them)
- **Missed opportunities** (easy wins they're leaving on the table)
- **Growth potential** (bigger strategic plays)

### Step 3: Determine Services & Pricing

Based on research findings, recommend an appropriate service package. The user operates on **monthly retainer packages**. If the user hasn't specified pricing, use these general tiers as guidance (the user can adjust before sending):

| Tier | Monthly Rate | Typical Services |
|------|-------------|-----------------|
| Starter | $500-800/mo | Basic SEO, Google Business Profile optimization, monthly reporting |
| Growth | $800-1,500/mo | Full SEO, content strategy, website updates, social media guidance |
| Premium | $1,500-2,500/mo | Everything above + website redesign/development, paid ads management, comprehensive analytics |

Always present 2-3 tier options in the proposal so the prospect can choose their comfort level.

### Step 4: Generate the Proposal Document

Create a professional .docx using the docx skill (read `/mnt/skills/public/docx/SKILL.md` for technical implementation).

#### Proposal Structure

The proposal should follow this structure. The tone should be confident, specific, and focused on the prospect's business — not generic. Every section should reference actual findings from the research.

**Page 1 — Cover Page:**
- "Digital Growth Proposal" (or similar)
- Prepared for: [Business Name]
- Prepared by: Matt Gates, Ridge Cell Repair LLC
- Date
- Clean, professional design with brand color (#1B4F72 dark blue as primary accent)

**Section 1 — Executive Summary (half page):**
- Brief, compelling overview of what you found and why you're reaching out
- The key insight that should grab their attention
- One sentence on the opportunity ahead

**Section 2 — Current Digital Presence Assessment (1-2 pages):**
- Website analysis findings (specific, not vague)
- SEO visibility findings with concrete examples
- Competitive comparison highlights
- Use a simple scoring rubric or visual indicators
- Include a summary table of findings

**Section 3 — Recommended Strategy (1 page):**
- 3-5 specific action items tied to findings
- Expected outcomes for each (be realistic, not hyperbolic)
- Timeline overview (what happens in months 1-3, 3-6, 6-12)

**Section 4 — Service Packages (1 page):**
- Present 2-3 retainer tiers in a clear comparison table
- Each tier lists specific deliverables
- Highlight the recommended tier
- Make it easy to say yes

**Section 5 — About Ridge Cell Repair LLC (half page):**
- Brief background on the company and expertise
- Focus on relevant experience and results
- Keep it short — the research speaks louder than credentials

**Section 6 — Next Steps (quarter page):**
- Clear call to action
- Suggest a free 30-minute strategy call
- Provide contact info
- Include a sense of timeliness without being pushy

#### Design Guidelines

- **Primary color**: #1B4F72 (professional dark blue)
- **Accent color**: #2E86C1 (lighter blue for highlights)
- **Font**: Arial throughout
- **Page size**: US Letter (8.5" x 11")
- **Margins**: 1 inch all sides
- **Tables**: Use colored header rows, clean borders, adequate padding
- **Tone**: Professional but approachable, data-driven, specific to their business
- Use bold sparingly for emphasis on key findings
- Include page numbers in footer

### Step 5: Present to User

After generating the .docx:
1. Save to `/mnt/user-data/outputs/`
2. Use `present_files` to share with the user
3. Give a brief summary of key findings and the pricing tiers included
4. Ask if the user wants to adjust anything (pricing, tone, specific findings) before sending

## Cold vs. Inbound Adjustments

**For cold outreach proposals:**
- Lead with the most attention-grabbing finding from the audit
- Frame the proposal as "I noticed some opportunities for your business"
- Be respectful of their time — acknowledge they didn't ask for this
- Make the free strategy call the primary CTA
- Keep pricing ranges rather than exact figures (less commitment)

**For inbound/response proposals:**
- Reference their specific ask or pain points
- Validate their concerns with your research findings
- Be more direct with pricing recommendations
- Include a timeline that shows urgency and responsiveness
- Suggest next steps with specific dates when possible

## Important Notes

- Every proposal must contain REAL findings from actual research — never use placeholder or generic content
- Never fabricate data, traffic numbers, or competitor information
- If the website is down or inaccessible, note this and adjust the proposal accordingly
- If research reveals the business is in serious trouble (closing, legal issues), flag this to the user before generating the proposal
- The proposal should feel custom-crafted, not template-based — because it is
- Always save the output as a .docx file, never just display the content in chat

## Reference Files

- For .docx generation technical details, always read: `/mnt/skills/public/docx/SKILL.md`
- Proposal generation script: `scripts/generate_proposal.js` (template with docx-js patterns)
