# CLAUDE.md — Rocking-A Night Vision Proposal Pitchkit

You are operating inside the **RANV pitchkit** — a Rust-based proposal generator that ships branded `.docx` capability briefs to a prospect. Your job has two modes:

1. **Baseline (no LLM needed)** — User edits a prospect TOML, runs `ranv-pitch generate`, gets a templated `.docx`. Don't get involved unless asked.
2. **Knob-to-11** — User asks you to "research and pitch X" or "make a proposal for [prospect]". You do the research, write a richer prospect TOML with custom copy, then run the binary.

## When to Engage

Trigger phrases: *"pitch", "build a proposal for", "research and write up", "draft a brief", "knock out a brief for"*.

If the user just says "generate" with a TOML already in hand, **do not rewrite their TOML** — just invoke the binary.

## RANV Voice

- **Direct.** No hedging, no marketing fluff, no "leverage synergies".
- **Spec-honest.** If a tube has FOM 1800, say FOM 1800. Don't promise what you can't deliver.
- **ITAR-fluent.** RANV operates inside ITAR daily — frame paperwork as a competitive advantage, not friction. Never frame ITAR as a "learning curve" or "we'll figure it out".
- **U.S. end-users only.** Never write copy that implies international shipping of restricted items.
- **Operator-grade.** RANV serves real end-users (LE, ranchers, outfitters, training schools, dealers, film). Speak their language. No "stakeholders", no "synergies".

## Audience Profiles (canonical list)

The Rust binary loads exactly these six audience keys (compiled in via `include_str!`):

| Key         | Audience                       |
|-------------|--------------------------------|
| `le`        | Law Enforcement / Agency       |
| `rancher`   | Ranch / Predator Control       |
| `outfitter` | Hunting Outfitter / Guide      |
| `dealer`    | Dealer / Wholesale             |
| `training`  | Training School / Range        |
| `film`      | Film / Production Armorer      |

Each profile lives at `audiences/<key>.toml` with: executive_summary, capability_overview, about, next_steps, findings, strategy, pricing_intro, pricing_tiers.

To extend: add a new TOML and a matching arm in `src/audiences.rs`. The kit deliberately *doesn't* support arbitrary on-disk audience files at runtime — to keep the binary self-contained for a buyer.

## Knob-to-11 Workflow

When the user asks you to research and pitch a real prospect:

1. **Research the prospect.** Use Wraith/curl/WebSearch — agency size, jurisdiction (for `le`), property type (for `rancher`), production scale (for `film`), etc. **Real data only — never fabricate counts, ranks, or unit numbers.**
2. **Pick the audience key.** If ambiguous, ask. (A sheriff department auxiliary could be `le` or `training`.)
3. **Write a custom prospect TOML** at `prospects/<slug>.toml` with:
   - `business_name`, `contact_name`, `location` always set
   - `hook` — one-line opener that names the specific situation you found
   - `executive_summary` array — 3–4 paragraphs that override the audience template with prospect-specific copy
   - `findings` array (optional) — override audience defaults with what you actually saw
4. **Run the binary**:
   ```bash
   cd clients/ranv-pitchkit
   cargo run --release -- generate --prospect prospects/<slug>.toml --audience <key>
   ```
   The output lands in `output/<BusinessName>_RANV_Proposal.docx`.
5. **Tell the user the output path** and any caveats (data you couldn't verify, ITAR considerations, etc.).

## Hard Rules

- **Never fabricate spec data.** No invented FOM/SNR numbers, no fake range claims, no made-up pricing tiers. If you don't know, leave the audience default and flag it.
- **Never write copy implying export to non-U.S. parties.** RANV does not ship ITAR-controlled items outside the U.S. — period.
- **Never replace `RANV` / `Rocking-A Night Vision` with a person's name.** The brand voice is the company.
- **Don't add audience profiles without explicit user approval.** The six are the surface RANV pitches.
- **Verify ITAR posture per audience** — `rancher` and `outfitter` are typically civilian and don't need heavy ITAR framing; `le`, `dealer`, `training`, and `film` should foreground RANV's ITAR fluency.

## Editing the Kit

- **Templates** (`audiences/*.toml`) — safe to edit, the binary reloads on next compile.
- **Branding** (`src/proposal.rs` constants `PRIMARY`, `ACCENT`, `LIGHT_BG`) — change cautiously; current palette is desert-olive + phosphor-green.
- **Cover page format** lives in `proposal.rs::build` — preserve the structure, only adjust copy if asked.

## Output Location

The Rust binary anchors all writes under `./output/` and sanitizes filenames to alphanumerics — this is intentional, don't bypass it.

## When You're Stuck

If the prospect is genuinely unfamiliar (foreign agency, edge audience), **ask** rather than guess. RANV's reputation is staked on spec honesty; a hallucinated proposal sent to a real LE procurement officer costs more than a clarifying question.
