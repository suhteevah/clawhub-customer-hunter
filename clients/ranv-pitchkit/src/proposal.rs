// Proposal builder — ports the JS docx layout to Rust via docx-rs.
// Branding: RANV deep-desert tones (sand + green-phosphor accent) with Arial.

use crate::audiences::{Audience, AudienceFinding, AudiencePricingTier};
use anyhow::{Context, Result};
use docx_rs::*;
use serde::Deserialize;
use std::fs;
use std::io::Cursor;
use std::path::{Component, Path, PathBuf};

fn reject_traversal(p: &Path) -> Result<()> {
    if p.components().any(|c| matches!(c, Component::ParentDir)) {
        anyhow::bail!("output path '{}' contains '..' traversal", p.display());
    }
    Ok(())
}

// RANV brand palette
const PRIMARY: &str   = "1F2A1A"; // deep olive-black
const ACCENT: &str    = "6E8B3D"; // phosphor green
const LIGHT_BG: &str  = "EFEFE6"; // sand
const WHITE: &str     = "FFFFFF";
const DARK_TEXT: &str = "1A1A1A";
const GRAY: &str      = "7A7A7A";

#[derive(Debug, Deserialize, Default)]
pub struct Prospect {
    pub business_name: String,
    pub contact_name: String,
    #[serde(default)]
    pub location: String,
    #[serde(default)]
    pub hook: String,
    /// Override audience executive summary if present.
    #[serde(default)]
    pub executive_summary: Vec<String>,
    /// Override audience findings if present.
    #[serde(default)]
    pub findings: Vec<AudienceFinding>,
}

pub fn build(prospect: &Prospect, audience: &Audience, date: &str, out_path: &Path) -> Result<()> {
    let mut doc = Docx::new();

    // Cover page
    doc = doc
        .add_paragraph(blank())
        .add_paragraph(blank())
        .add_paragraph(centered_run("CAPABILITY & PROCUREMENT BRIEF", 56, true, PRIMARY))
        .add_paragraph(centered_run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 24, false, ACCENT))
        .add_paragraph(blank())
        .add_paragraph(centered_run("Prepared for", 24, false, GRAY))
        .add_paragraph(centered_run(&prospect.business_name, 44, true, DARK_TEXT))
        .add_paragraph(blank())
        .add_paragraph(centered_run(&format!("Audience: {}", audience.label), 22, false, ACCENT))
        .add_paragraph(blank())
        .add_paragraph(centered_run("Prepared by", 24, false, GRAY))
        .add_paragraph(centered_run("Rocking-A Night Vision", 32, true, DARK_TEXT))
        .add_paragraph(centered_run("Authorized U.S. NV / Thermal Dealer", 22, false, ACCENT))
        .add_paragraph(centered_run(date, 22, false, GRAY))
        .add_paragraph(page_break());

    // Executive Summary — prefer prospect override, fall back to audience template.
    doc = doc.add_paragraph(section_header("Executive Summary"));
    if !prospect.hook.is_empty() {
        doc = doc.add_paragraph(body_para(&prospect.hook));
    }
    let exec_paras = if !prospect.executive_summary.is_empty() {
        &prospect.executive_summary
    } else {
        &audience.executive_summary
    };
    for p in exec_paras {
        doc = doc.add_paragraph(body_para(&substitute(p, prospect)));
    }
    doc = doc.add_paragraph(page_break());

    // Capability Overview
    doc = doc.add_paragraph(section_header("Capability Overview"));
    for item in &audience.capability_overview {
        doc = doc.add_paragraph(subhead(&item.title));
        for pt in &item.points {
            doc = doc.add_paragraph(bullet(&substitute(pt, prospect)));
        }
    }

    // Findings table
    doc = doc.add_paragraph(blank())
             .add_paragraph(section_header("Engagement Findings"));
    let findings = if !prospect.findings.is_empty() {
        &prospect.findings
    } else {
        &audience.findings
    };
    doc = doc.add_table(findings_table(findings))
             .add_paragraph(page_break());

    // Recommended Strategy
    doc = doc.add_paragraph(section_header("Recommended Path Forward"));
    for phase in &audience.strategy {
        doc = doc.add_paragraph(subhead(&phase.title));
        for a in &phase.actions {
            doc = doc.add_paragraph(bullet(&substitute(a, prospect)));
        }
    }
    doc = doc.add_paragraph(page_break());

    // Pricing
    doc = doc.add_paragraph(section_header("Procurement Tiers"))
             .add_paragraph(body_para(&audience.pricing_intro))
             .add_table(pricing_table(&audience.pricing_tiers))
             .add_paragraph(page_break());

    // About
    doc = doc.add_paragraph(section_header("About Rocking-A Night Vision"));
    for p in &audience.about {
        doc = doc.add_paragraph(body_para(p));
    }

    // Next steps
    doc = doc.add_paragraph(section_header("Next Steps"));
    for p in &audience.next_steps {
        doc = doc.add_paragraph(body_para(&substitute(p, prospect)));
    }

    let safe_path = anchor_under_output(out_path)?;
    let mut cursor = Cursor::new(Vec::<u8>::new());
    doc.build().pack(&mut cursor).context("packing .docx")?;
    fs::write(&safe_path, cursor.into_inner()).context("writing .docx")?;
    Ok(())
}

/// Force the output path to live under ./output/ with an alphanumeric filename only.
/// Any caller-supplied directory components are dropped — only the filename is honored.
fn anchor_under_output(requested: &Path) -> Result<PathBuf> {
    reject_traversal(requested)?;
    let filename = requested
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("output path missing filename"))?
        .to_string_lossy()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || matches!(*c, '_' | '-' | '.'))
        .collect::<String>();
    if filename.is_empty() {
        anyhow::bail!("output filename empty after sanitization");
    }
    let base = PathBuf::from("output");
    fs::create_dir_all(&base).ok();
    Ok(base.join(filename))
}

// ---------- helpers ----------

fn substitute(s: &str, p: &Prospect) -> String {
    s.replace("{{business}}", &p.business_name)
        .replace("{{contact}}", &p.contact_name)
        .replace("{{location}}", &p.location)
}

fn blank() -> Paragraph {
    Paragraph::new()
}

fn page_break() -> Paragraph {
    Paragraph::new().add_run(Run::new().add_break(BreakType::Page))
}

fn centered_run(text: &str, half_pt: usize, bold: bool, color: &str) -> Paragraph {
    let mut run = Run::new().add_text(text).fonts(RunFonts::new().ascii("Arial")).size(half_pt).color(color);
    if bold {
        run = run.bold();
    }
    Paragraph::new().align(AlignmentType::Center).add_run(run)
}

fn section_header(text: &str) -> Paragraph {
    Paragraph::new().add_run(
        Run::new()
            .add_text(text.to_uppercase())
            .fonts(RunFonts::new().ascii("Arial"))
            .size(28)
            .bold()
            .color(PRIMARY),
    )
}

fn subhead(text: &str) -> Paragraph {
    Paragraph::new().add_run(
        Run::new()
            .add_text(text)
            .fonts(RunFonts::new().ascii("Arial"))
            .size(24)
            .bold()
            .color(ACCENT),
    )
}

fn body_para(text: &str) -> Paragraph {
    Paragraph::new().add_run(
        Run::new()
            .add_text(text)
            .fonts(RunFonts::new().ascii("Arial"))
            .size(22)
            .color(DARK_TEXT),
    )
}

fn bullet(text: &str) -> Paragraph {
    Paragraph::new()
        .indent(Some(360), None, None, None)
        .add_run(
            Run::new()
                .add_text(format!("•  {}", text))
                .fonts(RunFonts::new().ascii("Arial"))
                .size(22)
                .color(DARK_TEXT),
        )
}

fn header_cell(text: &str, width: usize) -> TableCell {
    TableCell::new()
        .width(width, WidthType::Dxa)
        .shading(Shading::new().shd_type(ShdType::Clear).fill(PRIMARY))
        .vertical_align(VAlignType::Center)
        .add_paragraph(
            Paragraph::new().align(AlignmentType::Center).add_run(
                Run::new()
                    .add_text(text)
                    .fonts(RunFonts::new().ascii("Arial"))
                    .size(20)
                    .bold()
                    .color(WHITE),
            ),
        )
}

fn body_cell(text: &str, width: usize, bg: &str, color: &str, bold: bool, center: bool) -> TableCell {
    let mut run = Run::new()
        .add_text(text)
        .fonts(RunFonts::new().ascii("Arial"))
        .size(20)
        .color(color);
    if bold {
        run = run.bold();
    }
    let mut p = Paragraph::new().add_run(run);
    if center {
        p = p.align(AlignmentType::Center);
    }
    TableCell::new()
        .width(width, WidthType::Dxa)
        .shading(Shading::new().shd_type(ShdType::Clear).fill(bg))
        .vertical_align(VAlignType::Center)
        .add_paragraph(p)
}

fn findings_table(findings: &[AudienceFinding]) -> Table {
    let header = TableRow::new(vec![
        header_cell("AREA", 2000),
        header_cell("FINDING", 4500),
        header_cell("PRIORITY", 1500),
        header_cell("STATUS", 1500),
    ]);

    let mut rows = vec![header];
    for (i, f) in findings.iter().enumerate() {
        let bg = if i % 2 == 0 { LIGHT_BG } else { WHITE };
        let pri_color = match f.priority.as_str() {
            "High"   => "C0392B",
            "Medium" => "B9770E",
            _        => "27AE60",
        };
        rows.push(TableRow::new(vec![
            body_cell(&f.area, 2000, bg, DARK_TEXT, false, false),
            body_cell(&f.finding, 4500, bg, DARK_TEXT, false, false),
            body_cell(&f.priority, 1500, bg, pri_color, true, true),
            body_cell(&f.status, 1500, bg, DARK_TEXT, false, true),
        ]));
    }
    Table::new(rows).layout(TableLayoutType::Fixed)
}

fn pricing_table(tiers: &[AudiencePricingTier]) -> Table {
    let col_w = 7700 / tiers.len().max(1);

    let mut header_cells = vec![header_cell("PACKAGE", 1800)];
    for t in tiers {
        let bg = if t.recommended { ACCENT } else { PRIMARY };
        let cell = TableCell::new()
            .width(col_w, WidthType::Dxa)
            .shading(Shading::new().shd_type(ShdType::Clear).fill(bg))
            .vertical_align(VAlignType::Center)
            .add_paragraph(Paragraph::new().align(AlignmentType::Center).add_run(
                Run::new().add_text(&t.name).fonts(RunFonts::new().ascii("Arial")).size(22).bold().color(WHITE),
            ))
            .add_paragraph(Paragraph::new().align(AlignmentType::Center).add_run(
                Run::new().add_text(&t.price).fonts(RunFonts::new().ascii("Arial")).size(20).color(WHITE),
            ));
        header_cells.push(cell);
    }
    let header = TableRow::new(header_cells);

    let max_features = tiers.iter().map(|t| t.features.len()).max().unwrap_or(0);
    let mut rows = vec![header];
    for i in 0..max_features {
        let bg = if i % 2 == 0 { LIGHT_BG } else { WHITE };
        let mut cells = vec![body_cell("", 1800, bg, DARK_TEXT, false, false)];
        for t in tiers {
            let feature = t.features.get(i).cloned().unwrap_or_default();
            cells.push(body_cell(&feature, col_w, bg, DARK_TEXT, false, false));
        }
        rows.push(TableRow::new(cells));
    }

    Table::new(rows).layout(TableLayoutType::Fixed)
}
