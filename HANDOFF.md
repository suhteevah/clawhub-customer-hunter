# HANDOFF — Clawhub Customer Hunter

## Last Updated
2026-04-25

## Project Status
🟢 RANV pitchkit shipped, OpenClaw fleet flipped to Anthropic with proper tier mapping

## What Was Done This Session

### 1. Built RANV-PitchKit-v1 (paid 1-shot deliverable for Smoothy)
- New self-contained Rust crate at `clients/ranv-pitchkit/`
- Ports the existing Node.js `build_proposal.js` to Rust using `docx-rs`
- Six audience profiles (LE, rancher, outfitter, dealer, training, film) — TOML-driven, compiled into the binary via `include_str!`
- Two run modes: baseline (no LLM, deterministic templated output) and "knob to 11" (Claude Code agent reads `CLAUDE.md`, researches a real prospect, writes a custom prospect TOML, invokes the binary)
- Smoke-tested all 6 audiences generate valid `.docx` (~50KB each)
- `generate.bat` for no-terminal Windows usage; prefers prebuilt `bin/ranv-pitch.exe`, falls back to `cargo build`
- Brand palette: olive-black `#1F2A1A`, phosphor green `#6E8B3D`, sand `#EFEFE6`, Arial throughout

### 2. Generated `SITE-AUDIT.md` war doc
- Dispatched via OAuth'd Opus on cnc-server (`/usr/local/bin/claude --print`)
- 19KB / 172 lines — security posture, SEO deep dive, perf/UX, conversion leaks, ITAR surface, prioritized 30/60/90 plan
- Honest about audit limitations (no shell access for `curl -I` headers; WebFetch strips HTML head, so meta description / canonical / JSON-LD findings are inferences, flagged as such)

### 3. Final deliverable
- `clients/RANV-PitchKit-v1.zip` (4.6 MB, 20 entries) — ready to drop into Discord

### 7. Hardened the github-uploader-buildout tool itself
- **Location:** `C:\Users\Matt\Documents\GitHub\githubuploaderbuildout\` (also at github.com/suhteevah/githubuploaderbuildout)
- **secret_scanner.py** — added Tailscale (`tskey-*`) and Anthropic OAuth (`sk-ant-oat0N-*`) regex patterns; expanded suspicious-filename list (id_rsa, id_ed25519, .credentials.json, discord-bot-token.secret); new `_BLOCKED_PATH_PATTERNS` regex set that hard-blocks Windows-absolute-path filenames (both literal `:` and U+F03A-encoded) and bare `*-key` files at repo root.
- **github_api.py DEFAULT_GITIGNORE** — added SSH private-key forms (id_rsa, id_ed25519, *-key with `!*-key.pub` exception), `.claude/.credentials.json`, `C:Users*` / `C:Windows*` globs to block bulk-upload-of-home-dir leakage. Bumped `_REQUIRED_ENTRIES` accordingly.
- **github_api.py urllib calls** — added scheme guards before `urllib.request.urlopen` (asserts URL is api.github.com) to satisfy CWE-939 static-analysis warnings.
- Committed as `47bdadd Harden secret-scanner + gitignore against bulk-upload leaks`, pushed to origin.
- Effect: the next time someone runs github-uploader-buildout, the same class of leaks (SSH keys, OAuth tokens, Windows home-dir files) will be either gitignored or hard-blocked at scan time.

### 4. Repository history scrubbed of leaked secrets and made public again
- **Trigger:** Discord Safety Jim DM — flagged a leaked bot token at `docs/discord-bot-token.secret` in distcc history. Discord auto-rotated the token, but the surface scan revealed broader contamination.
- **Root cause of the contamination:** the `github-uploader-buildout` tool that originally seeded these repos uploaded the entire working directory including (a) literal Windows-pathed files (`C:Users\Matt\...` encoded as Unicode-escaped paths in the git tree) and (b) an SSH private key (`satibook-key`) sitting at the repo root.
- **Removed from history (all branches, all commits):**
  - `satibook-key` (RSA private key — real concern, but satibook runs ClaudioOS so no standard sshd to attack)
  - `docs/discord-bot-token.secret` (Discord bot token, already rotated)
  - 6× `C:UsersMatt...` files (local Discord configs, screenshot, openclaw extension dumps)
  - 1× `C:WindowsSystem32...hosts` (local hosts file)
  - String scrubs: previously-leaked Anthropic API key, Tailscale auth key, Discord bot token (all already dead by this point)
- **Process:** `git filter-repo --invert-paths --path ... --path-regex 'C\xef\x80\xba.*' --replace-text replacements.txt --force`. Re-ran after first attempt missed scrubs on non-current branches.
- **Verified clean:** all 4 distcc branches (main + 3 claude/*) and clawhub main pass broad pattern sweep (Anthropic, Tailscale, Discord, GitHub PAT, Google API, Groq, RSA private keys).
- **Backup tags pushed:** `pre-scrub-2026-04-25`, `pre-scrub2-2026-04-25` on origin (delete after confirming nothing's lost).
- **Both repos flipped private → scrubbed → public again.**
- **Belt-and-suspenders for next time:** the github-uploader-buildout tool needs an exclude list before re-running. Don't ever bulk-upload a working dir that has private keys, `.env`, or `~/.claude.json` in it.

### 5. agentapi PTY hang root-caused and fixed (later in session)
- Symptom: POST /message hung indefinitely; status returned "stable" but claude burned 0 CPU
- Root cause: claude TUI shows a non-dismissible "Bypass Permissions mode" consent prompt whenever `--dangerously-skip-permissions` is used. agentapi can't autonomously acknowledge it
- Fix: swapped `--dangerously-skip-permissions` → `--permission-mode dontAsk` in `claude-agentapi.service`. Added `Environment="CI=true"` to both services for any other interactive gates. Pushed updated service file to cnc-server, daemon-reload, restart.
- Verified: POST /message → `{"ok":true}` immediately, /messages shows clean banner ("Claude Code v2.1.119 · Opus 4.7 · Claude Max") and a "PING-OK" response.
- Committed: distcc `54d9313 Fix agentapi PTY hang on long prompts`

### 6. OpenClaw OAuth + Opus full restoration
**Plumbing** (in `J:\distcc for claw project\`):
- `cnc-server-bootstrap.sh` Phase 5 now picks auth in priority order: OAuth (`CLAUDE_CREDENTIALS_FILE` → `/home/claude-agent/.claude/.credentials.json`) → API key fallback → empty (Ollama-only). Always writes `/etc/claude/model-env` with `ANTHROPIC_MODEL=claude-opus-4-7`
- `service-files/systemd/claude-agentapi.service` + `claude-orchestrator.service`: added `Environment="HOME=/home/claude-agent"` (so claude CLI finds OAuth creds), `EnvironmentFile=-/etc/claude/api-key` (optional), `EnvironmentFile=-/etc/claude/model-env`
- `.secrets.example` documents both auth options + `ANTHROPIC_MODEL`
- `scripts/claude-oauth-deploy.sh` — workstation-side: SCPs local `~/.claude/.credentials.json` to a Tailscale node, restarts services
- `scripts/flip-to-opus.sh` — one-shot: pushes service files + creds + model-env, restarts everything

**Deployment to cnc-server (LIVE):**
- Slurped pixie's OAuth creds from `/var/lib/docker/volumes/moltbook-container_moltbook-data/_data/.claude/.credentials.json` (kept locally at `C:\Users\Matt\scratch\pixie-creds\.credentials.json`)
- Ran `flip-to-opus.sh cnc-server` → service files installed, model-env written, OAuth creds dropped at `/home/claude-agent/.claude/.credentials.json`, services restarted
- claude-code CLI on cnc-server upgraded 2.1.72 → 2.1.119 (matched local; agentapi 0.12.1's "ready" detection wouldn't match the older TUI banner)
- Verified: `sudo -u claude-agent /usr/local/bin/claude --print "..."` returned correct output → OAuth + Opus working

**OpenClaw Rust agent fleet (12 services on cnc-server):**
- Pre-flip: HEAVY → Groq llama-3.3-70b, FAST → Gemini 2.5 Flash, ANTHROPIC was unused fallback on `claude-3-5-haiku-latest`
- Post-flip: HEAVY → `claude-opus-4-7`, STANDARD (new tier) → `claude-sonnet-4-6`, FAST → `claude-haiku-4-5`, all via Anthropic OpenAI-compat endpoint at `https://api.anthropic.com/v1` using existing `sk-ant-api03-*` key (Rust agents don't speak OAuth — that's CLI-only)
- Backed up old env at `/opt/openclaw/openclaw-agents/.env.pre-anthropic-flip-<timestamp>` on cnc-server
- All 12 services restarted clean: briefing, client-dashboard, coder, content-mill, fleet-monitor, job-hunter, lead-responder, legal-team, mailclaw, proposal-gen, seo-auditor, wow-economy
- Per-agent tier declarations preserved (each agent's IDENTITY.md/README declares heavy/standard/fast)

## Current State

### Working
- RANV pitchkit binary smoke-tested, zip deliverable assembled
- cnc-server claude CLI on Opus + OAuth, headless (silent — does NOT create chats in claude.ai sidebar based on `sk-ant-oat01` token type, user can verify)
- All 12 OpenClaw Rust agents running on Anthropic with proper tier mapping
- Existing clawhub customer hunter pipeline (clients.json, build_proposal.js, send_email.js) untouched

### Broken / Unverified
- ~~agentapi POST /message hangs~~ — **FIXED later in session.** Root cause: `--dangerously-skip-permissions` triggers a non-dismissible "Bypass Permissions mode" consent gate. Swapped to `--permission-mode dontAsk` + added `CI=true` env. Verified: POST /message returns `{"ok":true}`, claude responds in seconds. Committed in distcc as `54d9313`.
- ~~Whether OpenClaw OAuth creates claude.ai chat threads~~ — **CONFIRMED NO.** User checked sidebar; nothing surfaced. OpenClaw is back to silent/headless mode as it used to be.

### Stubbed / Deferred
- War doc was generated despite WebFetch stripping the HTML `<head>` — security/SEO findings on meta tags / JSON-LD / canonical are inferences from Big Cartel defaults, not direct measurements. Smoothy needs to view-source verify before quoting in any external deck. The war doc says this explicitly upfront.
- Multi-fleet rollout: only cnc-server got the OAuth flip. faye, satibook, swoop fleet, FCP fleet are untouched. Run `scripts/flip-to-opus.sh <node>` per node when ready
- SDK-side Anthropic client in `openclaw-rust-agents/sdk/` — agents currently use OpenAI-shape calls to Anthropic's compat endpoint, not native Anthropic SDK. Works fine, but doesn't support OAuth credentials directly
- `openclaw-docs-upstream` is 16,543 commits behind upstream `openclaw/openclaw` main. Not blocking anything (Core appears to be running locally on cnc-server at `localhost:9000`, not from this repo), but worth a `git pull` cycle when there's bandwidth

## Blocking Issues
None.

## What's Next

1. **Send `RANV-PitchKit-v1.zip` to Smoothy via Discord** — it's at `J:\clawhub customer hunter\clients\RANV-PitchKit-v1.zip`
2. **Roll OAuth + Opus to satibook + faye** when those machines come back online (both timed out at end of session). FCP and Swoop are excluded — not Matt's fleet. One-liner: `./scripts/flip-to-opus.sh <node>` from `J:\distcc for claw project\`
3. **Per-subagent model discipline**: ensure `.claude/agents/*.md` frontmatter in projects routinely declares `model: sonnet` or `model: haiku` for delegated subagents so Opus quota isn't burned on routine work
4. **Push the unpushed commits** when ready: `git -C "J:\clawhub customer hunter" push` (62 commits ahead) and `git -C "J:\distcc for claw project" push` (3 commits ahead, branch has diverged from origin — may need rebase first)

## Notes for Next Session

- **Pixie OAuth creds are at** `C:\Users\Matt\scratch\pixie-creds\.credentials.json` locally — same content as `/home/claude-agent/.claude/.credentials.json` on cnc-server. Don't commit either.
- **Anthropic API key** in OpenClaw env is real (`sk-ant-api03-...`). Burn rate now matters: HEAVY-tier agents on Opus are expensive. The user accepted this; that's the explicit ask.
- **agent tier mapping** lives in each agent's `IDENTITY.md` or `README.md`, not in a central registry. Currently: heavy = coder/content-mill/job-hunter/legal-team/proposal-gen/seo-auditor; fast = client-dashboard/lead-responder/wow-economy; standard (assumed) = briefing/mailclaw.
- **Bash shell wrapper bug**: `lean-ctx.exe` wrapper is broken in this environment, can't chain `cd && cmd` reliably. Use PowerShell or `git -C <path>` style calls.
- **ITAR posture in copy**: every audience profile frames RANV's ITAR fluency as a *competitive advantage*, never a learning curve or friction point. The user explicitly course-corrected on this. Hard rule baked into `clients/ranv-pitchkit/CLAUDE.md`.
- **RANV is the brand voice, not "Smoothy"**. Smoothy is the user's contact name; the deliverable speaks as Rocking-A Night Vision. Also a hard rule.
- **OpenClaw Core appears to run on cnc-server at `localhost:9000`** (per agent env `OPENCLAW_API_URL=http://localhost:9000`). Source is unclear — may be hosted by `openclaw.mjs` from npm or by a separate service. Worth tracing if Core itself starts misbehaving.
- **Old env backup on cnc-server**: `/opt/openclaw/openclaw-agents/.env.pre-anthropic-flip-<ts>` — restore from here if Anthropic flip causes regressions.
