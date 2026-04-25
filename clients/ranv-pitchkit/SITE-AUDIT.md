# Rocking-A Night Vision — Site Audit War Doc

Target: `https://rockinganightvision.bigcartel.com/`
Date: 2026-04-25
Method: WebFetch on homepage, `/products`, `/contact`, `/itar-statement`, `/military-law-enforcement-sales`, and `/product/an-pvs-14`.

**Audit limitations (read first):**
- The execution environment did not expose a shell, so HTTP response headers (HSTS, CSP, X-Frame-Options, COOP, cookie attributes, etc.) could not be pulled directly. Section 2 is therefore split into platform-level inferences (Big Cartel-controlled) and items that need manual `curl -I` verification before action.
- WebFetch converts HTML to markdown before parsing, which strips most `<head>` content. Meta description, canonical, Open Graph, Twitter cards, and JSON-LD schema were not surfaced. Where the report says "absent," it means "not visible via the available tooling and likely absent based on Big Cartel's default templates" — confirm with view-source before quoting in any external deck.

---

## 1. Executive Summary

Rocking-A Night Vision is running a real ITAR-controlled night-vision business on a stock Big Cartel template, and the storefront is the weakest link in the operation. Three live SKUs, one of which (the flagship AN/PVS-14) is sold out, with no descriptive copy, no reviews, no email capture, and no FAQ — the site is doing nothing to convert the high-intent buyer who already knows what an unfilmed L3 18UA tube is. SEO is effectively non-existent: thin content, generic page titles, no schema, no alt text. Compliance posture is better than the surface suggests (real CAGE/DUNS, ITAR release signature gate at fulfillment), but the public-facing ITAR flow is boilerplate and the end-user verification happens off-site via email, which is invisible to a buyer evaluating trust. Security headers and platform hardening sit downstream of Big Cartel and need direct verification, but the most important fixes are not security — they are content, trust signals, and a real lead-capture loop so a sold-out PVS-14 listing produces a qualified email instead of a closed tab.

---

## 2. Security Posture

### Verified from page content
| Item | Finding | Severity |
|---|---|---|
| Email obfuscation | Cloudflare `cdn-cgi/l/email-protection` is in use on the contact link. Reasonable scraper defense. | Info |
| Contact form anti-abuse | reCAPTCHA is wired into the contact form. | Info |
| Third-party surface (visible) | `assets.bigcartel.com`, `www.bigcartel.com`, Cloudflare email-protection, Google reCAPTCHA. No analytics/pixel observed in rendered output, but absence here does not prove absence in `<head>`. | Info |
| Mixed content | None observed in fetched markup. | Info |

### Requires manual verification (could not pull headers from this environment)
| Item | Why it matters | Severity if missing |
|---|---|---|
| `Strict-Transport-Security` | Forces HTTPS, blocks SSL-strip MITM on a checkout flow that handles real payment data via Stripe/PayPal redirect. Big Cartel typically sets this; verify. | High |
| `Content-Security-Policy` | Shrinks XSS blast radius if any UGC ever lands. Big Cartel does not ship a strong default CSP on storefronts. | Medium |
| `X-Frame-Options` / `frame-ancestors` | Clickjacking defense on the cart/checkout. | Medium |
| `X-Content-Type-Options: nosniff` | MIME-sniff defense. | Low |
| `Referrer-Policy` | Privacy hygiene; affects analytics attribution. | Low |
| `Permissions-Policy` | Limits camera/mic/geo on a storefront that does not need any of them. | Low |
| Cookie attributes (`Secure`, `HttpOnly`, `SameSite`) on session cookies | Session theft / CSRF defense at checkout. | Medium |
| COOP / COEP | Lower priority for a non-SPA storefront. | Low |

**Action:** run `curl -sI https://rockinganightvision.bigcartel.com/` and `curl -sI https://rockinganightvision.bigcartel.com/cart` and screenshot the headers. Most of this is Big Cartel-controlled — RANV cannot fix it directly, but the audit conclusion drives whether the platform is acceptable for an ITAR-adjacent business or whether a Shopify migration is warranted.

### Platform-level reality
Big Cartel handles TLS, payment processing redirect, and the checkout DOM. RANV has limited ability to add custom security headers. The realistic posture work for RANV is: (a) confirm what Big Cartel ships, (b) document acceptance, (c) make sure no custom theme HTML re-introduces inline-script XSS surface.

---

## 3. SEO Deep Dive

| Item | Finding | Severity |
|---|---|---|
| Page titles | `Products \| Rocking-A Night Vision`, `Contact \| Rocking-A Night Vision`. Functional but not keyword-driven. Homepage title not surfaced; likely `Rocking-A Night Vision` only. | Medium |
| Meta description | Not surfaced on any page tested. Almost certainly absent or auto-generated. | High |
| Canonical tags | Not surfaced. Big Cartel typically emits self-canonicals; verify. | Medium |
| Open Graph / Twitter cards | Not surfaced. Likely absent — link previews in Discord, Reddit, X, and SMS will look broken. For a community-driven niche where buyers swap links, this is a real loss. | High |
| JSON-LD / Product schema | None observed. No `Product`, `Offer`, `Organization`, or `BreadcrumbList`. Google Shopping / merchant listings are leaving rich-result eligibility on the table. | High |
| H1 hierarchy | Homepage H1 is `Featured Products` — wastes the most valuable on-page real estate. Should be brand + value prop ("U.S. ITAR-Compliant Night Vision & Thermal — Rocking-A"). | High |
| H2/H3 structure | Effectively none on homepage, products, contact. Flat documents. | Medium |
| Image alt text | Missing on every product image observed (homepage tiles, products page, AN/PVS-14 detail). | High |
| Internal linking | Top nav links to ITAR Statement, Law Enforcement Sales, Contact, Products. No cross-linking between products or to educational content (because no educational content exists). | High |
| Content depth | Homepage ~80 visible words. Contact ~50–75. Product detail page is specs-only with zero marketing copy. Products listing has no category descriptions. Total indexable text is probably under 2,000 words sitewide. | Critical |
| Crawlability / robots / sitemap | Not verified. Big Cartel typically auto-generates a sitemap. Confirm `/sitemap.xml` exists and submit to GSC. | Medium |
| Mobile / viewport | Not verified, but Big Cartel themes are mobile-responsive by default. | Low |
| Structured data for ITAR / business identity | CAGE 94N27, DUNS 118253695, Texas HUB cert exist in copy but are not in `Organization` schema. | Medium |

**Bottom line:** the site is invisible to anyone Googling "PVS-14 dealer," "Bering Optics Crisp 384 LRF for sale," or "L3 unfilmed 18UA in stock." Niche has low absolute volume but very high per-visitor intent and AOV, so the SEO miss is dollars-on-the-table.

---

## 4. Performance & UX

Hard performance numbers (LCP, CLS, TTI, byte weight) cannot be measured from this environment. Inferences from observed page structure:

- **Page weight is probably small.** Homepage renders three product tiles, minimal copy, Big Cartel CSS, and Cloudflare email obfuscation. No analytics, hero video, or marketing widgets observed. LCP candidate is the first product tile image.
- **Render-blocking resources:** standard Big Cartel theme CSS. No obvious third-party-tag tax (no GA4, no Meta Pixel observed in rendered output). This is good for speed, bad for marketing measurement — RANV almost certainly has zero attribution data on inbound traffic.
- **Image optimization:** unknown without inspecting served formats. Big Cartel CDN typically serves resized variants; alt text is universally missing, which is an accessibility and SEO problem more than a perf problem.
- **Core Web Vitals signal:** sparse pages and absent third-party JS suggest CWV is probably passing by default. Validate in PageSpeed Insights / CrUX before claiming.
- **UX:** the homepage H1 is "Featured Products" with three tiles, one of which is sold out. There is no above-the-fold value prop, no "what we sell / why us," no "browse by tube generation," no comparison helper. A first-time visitor cannot tell in five seconds whether this is a hobby store or a serious ITAR dealer.

**Action:** run PageSpeed Insights + WebPageTest on homepage and `/product/an-pvs-14`, capture CWV, and confirm no surprises.

---

## 5. Conversion / Revenue Leaks

The buyer for a $4,250 unfilmed PVS-14 is not a casual shopper. They have already spent hours on r/nightvision, watched TNVC and RANV YouTube content, and arrive ready to spend. The site is failing them in specific ways:

1. **Sold-out flagship has no waitlist.** AN/PVS-14 shows "Sold out." There is no "notify me when back in stock" capture, no email signup, no "tell us what tube spec you want and we'll source it." This is the single biggest leak. Every PVS-14 page view today is a lost qualified lead.
2. **No email capture anywhere.** No newsletter, no "join the list for tube drops." For a low-volume / high-AOV business where inventory is intermittent, an email list of qualified buyers is the entire game.
3. **No product copy, no buying guide.** The PVS-14 detail page is a spec sheet. There is no explanation of Elbit XLSH vs. SLH vs. L3 18UA, no FOM range, no resolution guidance, no "what's right for hunting vs. shooting vs. driving." This is exactly what a qualified buyer wants to read before clicking $4,250.
4. **No trust signals near the buy button.** No reviews, no "ITAR release process explained," no "ships within X days," no warranty, no return policy. The CAGE/DUNS/HUB cert info is buried on the LE page instead of being on the homepage as proof-of-real-business.
5. **No reviews / social proof.** Zero. For a brand whose YouTube presence is the actual moat, there is no embed, no testimonial, no "as featured in," no Garand Thumb / TNVC cross-link.
6. **No FAQ.** Standard buyer questions (How does the ITAR release work? How long does shipping take? Can I trade in my PVS-14? Do you accept gov POs?) are nowhere on the site, forcing every one of them into the contact-form bottleneck.
7. **No financing / Affirm / Klarna messaging.** Even if not offered, the absence is conspicuous in this AOV range.
8. **Contact-only LE flow.** Government / LE sales is "send an email." No GovX, no GSA Advantage link, no quote-request form with badge upload. Every LE buyer is being asked to start a manual thread.
9. **Single hero is "Featured Products" with three tiles.** No category storytelling. A buyer hunting for thermal lands on a PVS-14-heavy page and bounces.
10. **No phone number.** $4,250 buyers want to talk to a human before they wire money. Even a "by appointment only" call line would close deals.

---

## 6. ITAR / Compliance Surface

**What's actually working:**
- ITAR Statement page exists, cites 22 CFR 120–130 correctly, references DDTC and DoC.
- Product page ("AN/PVS-14") states explicitly: "Buyer will be required to sign an ITAR release before NVG will be shipped." That is a real fulfillment-side gate.
- LE page lists CAGE Code 94N27, DUNS 118253695, Texas HUB cert. These are verifiable government identifiers and signal a legitimate operation.
- Email contact is obfuscated; contact form has reCAPTCHA — these reduce harvest by foreign brokers.

**Real concerns (not boilerplate):**
1. **No on-site end-user verification.** The ITAR release is collected via email after order. A foreign buyer can complete checkout, pay, and only then be told "we can't ship." Better: a pre-checkout US-residency attestation checkbox + shipping-address country gate at the cart level. Stops the bad order before money moves.
2. **No country block at the address form.** Big Cartel's checkout will accept international addresses by default unless explicitly restricted. Confirm shipping zones are configured to US-only on every NVG SKU. If not, you have a paper-trail problem on every blocked order.
3. **No statement about EAR vs. ITAR jurisdiction per SKU.** Some thermal optics fall under EAR/CCL rather than USML Cat XII. Lumping everything as "ITAR" is sloppy and could create issues if a product is actually EAR-controlled. Worth a per-SKU jurisdiction tag.
4. **No restricted-party / denied-party screening visible.** No statement that orders are screened against Consolidated Screening List before shipment. If RANV does this internally (likely), saying so publicly is a trust signal and a deterrent.
5. **Aggregator/broker risk.** No language addressing buyers who claim to be US persons but ship to a freight forwarder. Adding "we do not ship to freight forwarders or mail-forwarding addresses" closes the most common diversion vector.
6. **No SOC for sensitive data.** If the ITAR release form collects DOB, SSN-last-4, or copies of ID via email attachment, that is sensitive data riding on Gmail/Outlook. A simple Big Cartel-external secure intake (e.g., a tokenized form) would harden this.
7. **State-level firearm-pairing language is present but minimal.** "Check with your local and state laws…" is good. Calling out CA, NY, IL specifically (where night-vision-on-firearm laws are most aggressive) would be tighter.

**What's not a concern but reads like one:**
- The boilerplate ITAR text is fine. Don't rewrite it for the sake of rewriting it. The DDTC registration number is not required to be public; absence on the site is not a flag.

---

## 7. Prioritized Remediation Plan

Ranked by impact × ease. Effort is rough developer-days assuming someone with Big Cartel theme familiarity.

1. **Add "Notify me when back in stock" + email capture on every sold-out SKU and the homepage.** Captures the highest-intent lost traffic on the site today. Use Big Cartel's restock email or a Klaviyo embed. **Impact: high. Effort: 0.5 day.**
2. **Write real product copy for the PVS-14 (and every future SKU).** 300–500 words covering tube spec tradeoffs, FOM, who it's for, what's in the box, ITAR process. This is the conversion lever. **Impact: high. Effort: 1 day per SKU.**
3. **Pre-checkout US-residency attestation + freight-forwarder ban + country-block on shipping zones.** Stops bad orders before payment, hardens the ITAR posture, and is documented compliance hygiene. **Impact: high. Effort: 0.5 day.**
4. **Fix the homepage H1, hero, and value prop.** Replace "Featured Products" with a real positioning line ("ITAR-compliant night vision and thermal, sourced and shipped from Texas. CAGE 94N27."). Add three cards: Browse Monoculars / How ITAR Shipping Works / Contact a Specialist. **Impact: high. Effort: 0.5 day.**
5. **Add alt text to every product image and every nav image.** Pure SEO/accessibility win, low effort. **Impact: medium. Effort: 0.25 day.**
6. **Add Open Graph + Twitter card meta + Product JSON-LD across all product pages.** Fixes link previews and unlocks rich-result eligibility. Most Big Cartel themes support meta overrides; if not, a `theme.liquid` patch. **Impact: high. Effort: 1 day.**
7. **Stand up a real FAQ page.** Eight to twelve questions covering ITAR release process, shipping timelines, payment options, returns, warranty, LE/GOV sales, trade-ins, freight forwarders. **Impact: high. Effort: 1 day.**
8. **Publish a buying guide / tube-spec primer.** One long-form page on "Choosing a PVS-14 Tube" — Elbit XLSH vs. SLH, L3 unfilmed, FOM ranges, when it matters. This is the SEO + trust piece. **Impact: high. Effort: 2 days.**
9. **Verify and document HTTP security headers on Big Cartel; add GA4 + a basic event model (add-to-cart, contact-submit, restock-signup).** Without analytics, none of the above can be measured. **Impact: medium. Effort: 0.5 day.**
10. **Move CAGE / DUNS / HUB / "ships from Texas" trust block to the homepage footer and product page sidebars.** They prove RANV is a real government-eligible vendor; today they're hidden behind one nav click. **Impact: medium. Effort: 0.25 day.**

---

## 8. 30 / 60 / 90 Roadmap

### Days 0–30 — Stop the bleeding
- Ship items 1, 3, 4, 5, 9, 10 from the remediation plan.
- Outcome: every sold-out PVS-14 page view becomes a captured email; foreign orders get blocked at the address form, not at fulfillment; the homepage tells a real story; analytics are running so the next 60 days are measurable.
- One content piece: rewrite the AN/PVS-14 product page (item 2) as the proof-of-concept template.

### Days 31–60 — Build the trust and content layer
- Ship items 6 (OG + JSON-LD), 7 (FAQ), 8 (tube-spec buying guide).
- Add product copy to remaining SKUs as inventory comes in.
- Add a reviews surface — even a manually curated "what customers say" block with permission-cleared quotes if no review tool is wired up yet.
- Start an email cadence: monthly "what's in stock" + "tube market update."
- Decide: stay on Big Cartel or migrate to Shopify. The decision driver is whether item 6 (schema/OG) can be reliably injected and whether per-SKU shipping rules can hold the ITAR posture. If Big Cartel can't, plan migration in this window.

### Days 61–90 — Compound
- Add a "Trade-in your PVS-14" intake form. High-margin inventory acquisition channel.
- Add a Government / LE quote-request form with badge/credential upload, replacing the email-only flow.
- Publish two more long-form posts: "ITAR Release, Explained" and "Thermal vs. Image-Intensified: A Buyer's Guide." Internal-link them from product pages.
- Wire restock notifications + abandoned-cart sequences. By day 90, the email list should be the primary revenue driver on the next inventory drop.
- Reassess: is the site converting captured leads? Run a cohort on the day-0 vs. day-90 funnel.

---

## Appendix — Raw observations used for this audit

- Homepage H1: "Featured Products". Three tiles: Bering Optics Crisp 384 LRF DEMO ($1,650), AN/PVS-14 ($2,999–$4,250, sold out), RANV horned lizard patch ($14.99). ~80 visible words.
- Products page: title `Products | Rocking-A Night Vision`. Categories: All, Monoculars, Merch. No sort, no pagination, no per-product copy on listing.
- AN/PVS-14 detail: full spec sheet (1x mag, 26mm F1.2, 40° FOV, 335 g, 40 hr battery), tube variants (Elbit XLSH x1, SLH x3, L3 unfilmed 18UA WP x1), no marketing copy, no reviews, no related products. Contains the line "Buyer will be required to sign an ITAR release before NVG will be shipped."
- Contact page: name/email/subject/message form with reCAPTCHA. No phone, no address, no hours. Contact email is Cloudflare-obfuscated.
- ITAR Statement page: cites 22 CFR 120–130, references DoS / DDTC / DoC. "By adding to Cart, You confirm…" is the only buyer-side affirmation. No on-site end-user verification form. No specific country list.
- Mil/LE page: "Please send an email…" + CAGE 94N27, DUNS 118253695, Texas HUB certified.
- Third-party domains visible in rendered output: `assets.bigcartel.com`, `www.bigcartel.com`, Cloudflare email-protection, Google reCAPTCHA. No GA4, Meta Pixel, or other marketing tags surfaced.
- Not verified due to environment limits: HTTP response headers, cookie attributes, raw `<head>` contents (meta description, canonical, OG, JSON-LD), sitemap.xml, robots.txt, Core Web Vitals.
