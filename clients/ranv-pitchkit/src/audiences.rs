// Audience profiles — embedded at compile time so the binary is self-contained.
// Smoothy can override by passing --audience-file <path> in the future; for now
// the six baked-in profiles cover his pitch surface.

use anyhow::{anyhow, Result};
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Audience {
    pub key: String,
    pub label: String,
    pub executive_summary: Vec<String>,
    pub capability_overview: Vec<CapabilityItem>,
    pub about: Vec<String>,
    pub next_steps: Vec<String>,
    pub findings: Vec<AudienceFinding>,
    pub strategy: Vec<AudienceStrategyPhase>,
    pub pricing_intro: String,
    pub pricing_tiers: Vec<AudiencePricingTier>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CapabilityItem {
    pub title: String,
    pub points: Vec<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AudienceFinding {
    pub area: String,
    pub finding: String,
    pub priority: String,
    pub status: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AudienceStrategyPhase {
    pub title: String,
    pub actions: Vec<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AudiencePricingTier {
    pub name: String,
    pub price: String,
    pub features: Vec<String>,
    #[serde(default)]
    pub recommended: bool,
}

pub struct AudienceMeta {
    pub key: &'static str,
    pub label: &'static str,
}

const LE: &str = include_str!("../audiences/le.toml");
const RANCHER: &str = include_str!("../audiences/rancher.toml");
const OUTFITTER: &str = include_str!("../audiences/outfitter.toml");
const DEALER: &str = include_str!("../audiences/dealer.toml");
const TRAINING: &str = include_str!("../audiences/training.toml");
const FILM: &str = include_str!("../audiences/film.toml");

pub fn list() -> Vec<AudienceMeta> {
    vec![
        AudienceMeta { key: "le",        label: "Law Enforcement / Agency" },
        AudienceMeta { key: "rancher",   label: "Ranch / Predator Control" },
        AudienceMeta { key: "outfitter", label: "Hunting Outfitter / Guide" },
        AudienceMeta { key: "dealer",    label: "Dealer / Wholesale" },
        AudienceMeta { key: "training",  label: "Training School / Range" },
        AudienceMeta { key: "film",      label: "Film / Production Armorer" },
    ]
}

pub fn load(key: &str) -> Result<Audience> {
    let raw = match key {
        "le"        => LE,
        "rancher"   => RANCHER,
        "outfitter" => OUTFITTER,
        "dealer"    => DEALER,
        "training"  => TRAINING,
        "film"      => FILM,
        _ => return Err(anyhow!("unknown audience '{}' (try one of: le, rancher, outfitter, dealer, training, film)", key)),
    };
    let a: Audience = toml::from_str(raw)?;
    Ok(a)
}

/// Emit a starter prospect TOML pre-filled with placeholders the user fills in.
pub fn starter_toml(audience: &str) -> Result<String> {
    // Validate key.
    let _ = load(audience)?;
    Ok(format!(
        r#"# Prospect TOML — fill in the blanks, then run:
#   ranv-pitch generate --prospect this-file.toml --audience {audience}

business_name = "Acme Sheriff Department"
contact_name  = "Lt. Jane Doe"
location      = "Butte County, CA"

# One-line hook that opens the executive summary. Make it specific.
hook = "Your tactical team's PVS-14s are aging out and Gen 3 white phosphor is now in your budget tier."

# Optional: prospect-specific findings to override audience defaults.
# Each entry: {{ area, finding, priority = "High|Medium|Low", status }}
# findings = []

# Optional: prospect-specific exec summary paragraphs (overrides audience template).
# executive_summary = [
#   "Custom paragraph 1...",
#   "Custom paragraph 2...",
# ]
"#,
        audience = audience
    ))
}
