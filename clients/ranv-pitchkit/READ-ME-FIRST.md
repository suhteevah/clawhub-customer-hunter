# Rocking-A Night Vision — 1-Shot Pitchkit + Site Audit

Hey Smoothy,

Two things in this package:

## 1. `SITE-AUDIT.md` — your site war doc

A full read on `rockinganightvision.bigcartel.com` from a deep-reasoning model: security posture, SEO gaps, conversion leaks, ITAR surface, and a prioritized remediation list with a 30/60/90 plan. Read this first — it's where the easiest wins live.

The audit is honest about what it could and couldn't verify (HTTP headers and the `<head>` tag couldn't be pulled directly through the tooling used). Where it says "absent," it means "best-effort inference based on Big Cartel defaults — confirm with view-source before you act on it." A handful of items at the end are flagged as "needs `curl -I` verification."

## 2. The pitchkit — generate branded `.docx` proposals for your customers

A small Rust tool that produces RANV-branded capability briefs targeted at six audience profiles:

- `le` — Law Enforcement / Agency
- `rancher` — Ranch / Predator Control
- `outfitter` — Hunting Outfitter / Guide
- `dealer` — Dealer / Wholesale
- `training` — Training School / Range
- `film` — Film / Production Armorer

### How to use it (no terminal, Windows)

Double-click `generate.bat`. It walks you through:
- Pick an audience
- Type the prospect's business name + contact
- Drop in a one-line hook ("their team is running aging Gen 2+ tubes and white phosphor is now in budget")
- Spits out a polished `.docx` in `output/`

The prebuilt binary is in `bin\ranv-pitch.exe` — `generate.bat` will pick it up automatically. If you want to build from source instead (e.g. you tweaked the templates), install [Rust](https://rustup.rs/) and run `cargo build --release`.

### How to use it (LLM-assisted, "knob to 11")

If you open this folder in Claude Code (or any LLM agent that respects `CLAUDE.md`) and say something like *"pitch Yuba County Sheriff for a tactical NV upgrade,"* the agent will:

1. Research the prospect (Wraith / web search)
2. Write a custom prospect TOML at `prospects/yuba-sheriff.toml` with prospect-specific findings and exec summary copy
3. Run the generator
4. Tell you where the `.docx` landed

Hard rules baked into `CLAUDE.md`: no fabricated tube specs, no invented range claims, no implied international shipping of restricted items, RANV (not personal name) is the brand voice, and ITAR fluency is framed as a competitive advantage — not a learning curve.

### Editing the templates

The audience copy lives in `audiences/*.toml`. Things you'll probably want to tweak over time:

- Pricing tiers as supplier costs shift
- Capability bullets when you add a new product line (new thermal partner, new tube tier)
- Hooks/findings that close better in your actual sales conversations

After editing, rebuild from source:

```
cargo build --release
```

(Audience copy is compiled into the binary so the kit ships as a single `.exe` you can drop on any Windows box.)

## What's in the box

```
ranv-pitchkit/
├── READ-ME-FIRST.md         # this file
├── SITE-AUDIT.md            # the war doc on rockinganightvision.bigcartel.com
├── README.md                # detailed user docs for the pitchkit
├── CLAUDE.md                # instructions for an LLM agent driving the kit
├── generate.bat             # no-terminal Windows runner
├── bin/
│   └── ranv-pitch.exe       # prebuilt Windows binary
├── src/                     # Rust source if you want to rebuild
├── audiences/               # 6 audience templates
├── examples/                # sample prospect TOML to copy
├── prospects/               # your prospect TOMLs land here
├── output/                  # generated .docx files land here
├── Cargo.toml / Cargo.lock  # Rust build config
└── target/                  # build artifacts (auto-created on rebuild)
```

## Brand palette (locked into the .docx)

- Primary: `#1F2A1A` (deep olive-black)
- Accent: `#6E8B3D` (phosphor green)
- Light bg: `#EFEFE6` (sand)
- Font: Arial throughout

If you want different brand colors, edit the constants at the top of `src/proposal.rs` and rebuild.

## Questions

Ping Matt on Discord. The kit is yours to keep, edit, and break.
