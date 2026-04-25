# Rocking-A Night Vision — Proposal Pitchkit

Generate branded `.docx` capability briefs for RANV prospects. Two modes:

- **Baseline** — fill in a TOML, run the binary, get a `.docx`. No LLM needed.
- **Knob-to-11** — open this folder in Claude Code (or any LLM agent that respects `CLAUDE.md`), say *"pitch [prospect]"*, and the agent will research, write a custom TOML, and run the binary for you.

## Audiences Supported

`le` (LE/agency) · `rancher` (ranch/predator) · `outfitter` (hunting guide) · `dealer` (wholesale) · `training` (school/range) · `film` (production armorer)

## First-Time Setup

You need [Rust](https://rustup.rs/) installed (one-time, takes ~5 minutes).

```bash
cd clients/ranv-pitchkit
cargo build --release
```

The binary lands at `target/release/ranv-pitch.exe` (Windows) or `target/release/ranv-pitch` (Mac/Linux).

## Generating a Proposal

### 1. Create a prospect TOML

```bash
ranv-pitch init --audience le > prospects/acme-sheriff.toml
```

Open the file, fill in `business_name`, `contact_name`, `location`, and a one-line `hook`. Optional: override `executive_summary` and `findings` with prospect-specific copy.

### 2. Generate

```bash
ranv-pitch generate --prospect prospects/acme-sheriff.toml --audience le
```

Output lands at `output/Acme_Sheriff_RANV_Proposal.docx`.

### 3. List audiences

```bash
ranv-pitch audiences
```

## No-Terminal Quickstart (Windows)

Double-click `generate.bat`. It walks you through prospect name, audience pick, and contact, then writes a `.docx` to `output/`.

## Knob-to-11 (Claude Code / OpenClaw)

Open this folder in Claude Code. Say something like:

> *"Pitch Yuba County Sheriff Department for a tactical NV upgrade."*

Claude reads `CLAUDE.md`, researches the prospect, writes a custom TOML at `prospects/`, runs `cargo run --release -- generate ...`, and tells you where the `.docx` landed.

The same works with OpenClaw if you've got an agent set up that follows `CLAUDE.md` semantics.

## Folder Structure

```
ranv-pitchkit/
├── Cargo.toml                  # Rust deps
├── CLAUDE.md                   # LLM agent instructions
├── README.md                   # this file
├── generate.bat                # no-terminal Windows runner
├── src/
│   ├── main.rs                 # CLI entry
│   ├── audiences.rs            # audience loader
│   └── proposal.rs             # docx builder
├── audiences/                  # 6 audience templates (compiled in)
│   ├── le.toml
│   ├── rancher.toml
│   ├── outfitter.toml
│   ├── dealer.toml
│   ├── training.toml
│   └── film.toml
├── prospects/                  # your prospect TOMLs go here
├── examples/                   # sample TOML to copy
└── output/                     # generated .docx files
```

## Editing Audience Copy

The audience TOMLs are the brain of the kit. Edit them when:

- Pricing tiers change
- A new product line comes in (e.g. you add a new thermal sensor partner)
- You find better hooks/findings that close more deals

After editing, rebuild:

```bash
cargo build --release
```

(Audience copy is compiled into the binary so the kit ships as one self-contained `.exe` — no loose files to lose on the way to a customer's machine.)

## Brand Palette (in `src/proposal.rs`)

- Primary: `#1F2A1A` (deep olive-black)
- Accent: `#6E8B3D` (phosphor green)
- Light bg: `#EFEFE6` (sand)
- Font: Arial throughout

## ITAR Posture

The kit is built around RANV's ITAR fluency. Audience copy in `le`, `dealer`, `training`, and `film` foregrounds it as a competitive advantage. Don't write copy that implies international shipping of restricted items — the binary won't stop you, but RANV's reputation will.

## Troubleshooting

- **"unknown audience"** — pass one of: `le`, `rancher`, `outfitter`, `dealer`, `training`, `film`
- **"output filename empty"** — `business_name` in the TOML must contain at least one alphanumeric character
- **`.docx` looks bad in Google Docs** — open in Word or LibreOffice; the layout uses fixed-DXA tables that Google Docs sometimes reflows
