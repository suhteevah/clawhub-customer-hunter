#!/usr/bin/env node
/**
 * Build a .docx proposal from a JSON config
 *
 * Usage:
 *   node build_proposal.js --config proposals/mm-fence-config.json
 *
 * Or require and call programmatically:
 *   const { buildProposal } = require('./build_proposal');
 *   await buildProposal(configData, outputPath);
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, AlignmentType, BorderStyle, HeadingLevel, PageBreak,
        Header, Footer, PageNumber, ShadingType, VerticalAlign,
        TableLayoutType } = require('docx');
const fs = require('fs');
const path = require('path');

const PRIMARY = '1B4F72';
const ACCENT = '2E86C1';
const LIGHT_BG = 'EBF5FB';
const WHITE = 'FFFFFF';
const DARK_TEXT = '2C3E50';
const GRAY = '95A5A6';

function createCoverPage(data) {
  return [
    new Paragraph({ spacing: { after: 4000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: 'DIGITAL GROWTH PROPOSAL', font: 'Arial', size: 56, bold: true, color: PRIMARY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', font: 'Arial', size: 24, color: ACCENT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: 'Prepared for', font: 'Arial', size: 24, color: GRAY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({ text: data.businessName, font: 'Arial', size: 44, bold: true, color: DARK_TEXT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: 'Prepared by', font: 'Arial', size: 24, color: GRAY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Matt Gates', font: 'Arial', size: 32, bold: true, color: DARK_TEXT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: 'Ridge Cell Repair LLC', font: 'Arial', size: 24, color: ACCENT }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: data.date, font: 'Arial', size: 22, color: GRAY }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({ text: text.toUpperCase(), font: 'Arial', size: 28, bold: true, color: PRIMARY }),
    ],
  });
}

function bodyParagraph(text) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text, font: 'Arial', size: 22, color: DARK_TEXT }),
    ],
  });
}

function bulletPoint(text, bold = '') {
  const children = [];
  if (bold) {
    children.push(new TextRun({ text: bold + ' ', font: 'Arial', size: 22, bold: true, color: DARK_TEXT }));
  }
  children.push(new TextRun({ text, font: 'Arial', size: 22, color: DARK_TEXT }));
  return new Paragraph({
    spacing: { after: 100 },
    indent: { left: 360 },
    children,
  });
}

function createFindingsTable(findings) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 2000, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: PRIMARY },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'AREA', font: 'Arial', size: 20, bold: true, color: WHITE })] })],
      }),
      new TableCell({
        width: { size: 4500, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: PRIMARY },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'FINDING', font: 'Arial', size: 20, bold: true, color: WHITE })] })],
      }),
      new TableCell({
        width: { size: 1500, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: PRIMARY },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PRIORITY', font: 'Arial', size: 20, bold: true, color: WHITE })] })],
      }),
      new TableCell({
        width: { size: 1500, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: PRIMARY },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STATUS', font: 'Arial', size: 20, bold: true, color: WHITE })] })],
      }),
    ],
  });

  const rows = findings.map((f, i) => {
    const bg = i % 2 === 0 ? LIGHT_BG : WHITE;
    const priorityColor = f.priority === 'High' ? 'E74C3C' : f.priority === 'Medium' ? 'F39C12' : '27AE60';
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 2000, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: bg },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: f.area, font: 'Arial', size: 20, color: DARK_TEXT })] })],
        }),
        new TableCell({
          width: { size: 4500, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: bg },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: f.finding, font: 'Arial', size: 20, color: DARK_TEXT })] })],
        }),
        new TableCell({
          width: { size: 1500, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: bg },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: f.priority, font: 'Arial', size: 20, bold: true, color: priorityColor })] })],
        }),
        new TableCell({
          width: { size: 1500, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: bg },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: f.status, font: 'Arial', size: 20, color: DARK_TEXT })] })],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...rows],
  });
}

function createPricingTable(tiers) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 1800, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: PRIMARY },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PACKAGE', font: 'Arial', size: 20, bold: true, color: WHITE })] })],
      }),
      ...tiers.map(t => new TableCell({
        width: { size: Math.floor(7700 / tiers.length), type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: t.recommended ? ACCENT : PRIMARY },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.name, font: 'Arial', size: 22, bold: true, color: WHITE })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t.price, font: 'Arial', size: 20, color: WHITE })] }),
        ],
      })),
    ],
  });

  const maxFeatures = Math.max(...tiers.map(t => t.features.length));
  const featureRows = [];
  for (let i = 0; i < maxFeatures; i++) {
    featureRows.push(new TableRow({
      children: [
        new TableCell({
          width: { size: 1800, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? LIGHT_BG : WHITE },
          children: [new Paragraph({ children: [] })],
        }),
        ...tiers.map(t => new TableCell({
          width: { size: Math.floor(7700 / tiers.length), type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? LIGHT_BG : WHITE },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: t.features[i] || '', font: 'Arial', size: 20, color: DARK_TEXT })] })],
        })),
      ],
    }));
  }

  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...featureRows],
  });
}

async function buildProposal(config, outputPath) {
  const sections = [];

  // Cover page
  sections.push(...createCoverPage(config));

  // Executive Summary
  sections.push(sectionHeader('Executive Summary'));
  config.executiveSummary.forEach(p => sections.push(bodyParagraph(p)));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Digital Presence Assessment
  sections.push(sectionHeader('Digital Presence Assessment'));
  config.assessment.forEach(item => {
    sections.push(new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: item.title, font: 'Arial', size: 24, bold: true, color: ACCENT })],
    }));
    item.points.forEach(p => sections.push(bulletPoint(p)));
  });

  // Findings Table
  sections.push(new Paragraph({ spacing: { before: 300 }, children: [] }));
  sections.push(sectionHeader('Findings Summary'));
  sections.push(createFindingsTable(config.findings));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Recommended Strategy
  sections.push(sectionHeader('Recommended Strategy'));
  config.strategy.forEach(phase => {
    sections.push(new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: phase.title, font: 'Arial', size: 24, bold: true, color: ACCENT })],
    }));
    phase.actions.forEach(a => sections.push(bulletPoint(a)));
  });
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Service Packages
  sections.push(sectionHeader('Service Packages'));
  sections.push(bodyParagraph(config.pricingIntro));
  sections.push(createPricingTable(config.pricingTiers));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // About Ridge Cell Repair
  sections.push(sectionHeader('About Ridge Cell Repair LLC'));
  config.about.forEach(p => sections.push(bodyParagraph(p)));

  // Next Steps
  sections.push(sectionHeader('Next Steps'));
  config.nextSteps.forEach(p => sections.push(bodyParagraph(p)));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'Ridge Cell Repair LLC', font: 'Arial', size: 16, color: GRAY, italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Confidential | ', font: 'Arial', size: 16, color: GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: GRAY }),
            ],
          })],
        }),
      },
      children: sections,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Proposal saved to ${outputPath}`);
  return outputPath;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const configIdx = args.indexOf('--config');
  if (configIdx === -1 || !args[configIdx + 1]) {
    console.log('Usage: node build_proposal.js --config path/to/config.json');
    process.exit(1);
  }
  const configPath = args[configIdx + 1];
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : path.join(__dirname, '..', 'proposals', `${config.businessName.replace(/[^a-zA-Z0-9]/g, '_')}_Digital_Growth_Proposal.docx`);

  buildProposal(config, outputPath).catch(err => {
    console.error('Failed to build proposal:', err.message);
    process.exit(1);
  });
}

module.exports = { buildProposal };
