// ranv-pitch — proposal generator for Rocking-A Night Vision
// Baseline: deterministic templated .docx from a prospect TOML.
// Claude knob: CLAUDE.md teaches an LLM agent to write the TOML for you.

mod audiences;
mod proposal;

use anyhow::{anyhow, Context, Result};
use chrono::Local;
use clap::{Parser, Subcommand};
use std::fs;
use std::path::{Component, Path, PathBuf};

/// Reject paths containing parent-directory traversal components.
fn safe_path(p: &Path) -> Result<PathBuf> {
    if p.components().any(|c| matches!(c, Component::ParentDir)) {
        return Err(anyhow!("path '{}' contains '..' traversal", p.display()));
    }
    Ok(p.to_path_buf())
}

#[derive(Parser)]
#[command(name = "ranv-pitch", version, about = "Rocking-A Night Vision proposal generator")]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Generate a .docx proposal from a prospect TOML
    Generate {
        /// Path to the prospect TOML file
        #[arg(short, long)]
        prospect: PathBuf,

        /// Audience profile to use (le, rancher, outfitter, dealer, training, film)
        #[arg(short, long)]
        audience: String,

        /// Output .docx path (default: output/<BusinessName>_RANV_Proposal.docx)
        #[arg(short, long)]
        output: Option<PathBuf>,
    },

    /// List available audience profiles
    Audiences,

    /// Print a starter prospect TOML to stdout
    Init {
        /// Audience profile the starter should target
        #[arg(short, long, default_value = "le")]
        audience: String,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.cmd {
        Cmd::Generate { prospect, audience, output } => generate(prospect, &audience, output),
        Cmd::Audiences => {
            for a in audiences::list() {
                println!("{:<12} {}", a.key, a.label);
            }
            Ok(())
        }
        Cmd::Init { audience } => {
            print!("{}", audiences::starter_toml(&audience)?);
            Ok(())
        }
    }
}

fn generate(prospect_path: PathBuf, audience_key: &str, output: Option<PathBuf>) -> Result<()> {
    let prospect_path = safe_path(&prospect_path)?;
    let prospect_str = fs::read_to_string(&prospect_path)
        .with_context(|| format!("reading prospect file {}", prospect_path.display()))?;
    let prospect: proposal::Prospect = toml::from_str(&prospect_str)
        .context("parsing prospect TOML")?;

    let audience = audiences::load(audience_key)
        .with_context(|| format!("loading audience profile {}", audience_key))?;

    let date = Local::now().format("%B %d, %Y").to_string();

    let out_path = match output {
        Some(p) => safe_path(&p)?,
        None => {
            let safe_name: String = prospect.business_name
                .chars()
                .map(|c| if c.is_ascii_alphanumeric() { c } else { '_' })
                .collect();
            PathBuf::from(format!("output/{}_RANV_Proposal.docx", safe_name))
        }
    };

    if let Some(parent) = out_path.parent() {
        let parent = safe_path(parent)?;
        fs::create_dir_all(&parent).ok();
    }

    proposal::build(&prospect, &audience, &date, &out_path)?;
    println!("Proposal written: {}", out_path.display());
    Ok(())
}
