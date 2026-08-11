export const PRINT_CSS_STATIC = `
  table, img { page-break-inside: avoid; }
  h1, h2, h3, h4 { page-break-after: avoid; }
`

export const PAPER_SIZES = [
  {
    id: 'a5-landscape',
    label: 'A5 Landscape',
    pageSize: 'A5 landscape',
    margin: '10mm',
    fontSize: '11px',
    sectionGap: '4mm',
    headerPadding: '2.5mm 3.5mm',
    bodyPadding: '3mm 3.5mm',
  },
  {
    id: 'a4-landscape',
    label: 'A4 Landscape',
    pageSize: 'A4 landscape',
    margin: '8mm',
    fontSize: '11px',
    sectionGap: '3mm',
    headerPadding: '3mm 4mm',
    bodyPadding: '3mm 4mm',
  },
  {
    id: 'a5-portrait',
    label: 'A5 Portrait',
    pageSize: 'A5 portrait',
    margin: '6mm',
    fontSize: '9px',
    sectionGap: '2.5mm',
    headerPadding: '2mm 3mm',
    bodyPadding: '2.5mm 3mm',
  },
  {
    id: 'a4-portrait',
    label: 'A4 Portrait',
    pageSize: 'A4 portrait',
    margin: '10mm',
    fontSize: '11px',
    sectionGap: '3.5mm',
    headerPadding: '3mm 4mm',
    bodyPadding: '3mm 4mm',
  },
] as const

export type PaperSizeId = (typeof PAPER_SIZES)[number]['id']

function getPaperOverrides(paperSizeId: PaperSizeId): string {
  switch (paperSizeId) {
    case 'a5-landscape':
      return `
        .print-title { font-size: 18px; font-weight: 700; text-align: center; color: #1e293b; margin-bottom: 0.5mm; }
        .print-subtitle { font-size: 14px; font-weight: 600; text-align: center; color: #1d4ed8; text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 2px; margin-bottom: 2mm; }
        .print-grid-2 { display: flex; flex-wrap: nowrap; gap: 2.5mm; }
        .print-grid-2 > * { flex: 1; }
        .print-grid-2 .print-section-paid-to { flex: 1.4; }
        .print-grid-2 .print-section-amount { flex: 0.6; }
        .print-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
        .print-info-grid > :nth-child(-n+2) { border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.5mm; margin-bottom: 0.3mm; }
        .print-info-row { display: flex; justify-content: space-between; padding: 0.5mm 0; font-size: 11px; }
        .print-info-label { color: #64748b; font-weight: 500; }
        .print-info-value { font-weight: 600; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 2px; }
        .print-amount-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; }
        .print-amount-table th { padding: 0.8mm 1.5mm; border-bottom: 1px solid #94a3b8; font-weight: 600; color: #64748b; }
        .print-amount-table th:first-child { border-right: 1px solid #94a3b8; }
        .print-amount-table td { padding: 1.5mm 1.5mm; font-size: 14px; font-weight: 700; }
        .print-amount-table td:first-child { border-right: 1px solid #94a3b8; text-align: left; padding-left: 2.5mm; }
        .print-amount-table tbody tr:last-child td { padding-top: 0.5mm; font-size: 10px; }
        .print-carrier-name { font-size: 14px; font-weight: 600; border-bottom: 1.5px dotted #94a3b8; padding-bottom: 0.5mm; margin-bottom: 1mm; color: #1e293b; }
        .print-body-text { font-size: 11px; line-height: 1.35; text-align: justify; color: #475569; font-style: italic; margin-bottom: 1mm; }
        .print-amount-words { font-size: 11px; font-style: italic; color: #334155; border-bottom: 1.5px dotted #475569; padding-bottom: 0.5mm; }
        .print-signatures { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 0.8mm; }
        .print-signature-box { width: 18mm; height: 10mm; border: 1.5px dashed #94a3b8; border-radius: 2px; margin-bottom: 0.5mm; }
        .print-signature-label { font-size: 11px; font-weight: 500; color: #475569; }
        .print-signature-sublabel { font-size: 9px; color: #94a3b8; }
        .print-company-signature { text-align: right; }
        .print-company-signature .print-signature-box { width: 40mm; margin-left: auto; margin-top: 1mm; }
      `
    case 'a4-landscape':
      return `
        .print-title { font-size: 15px; font-weight: 700; text-align: center; color: #1e293b; margin-bottom: 0.8mm; }
        .print-subtitle { font-size: 11px; font-weight: 600; text-align: center; color: #1d4ed8; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 2px; margin-bottom: 4mm; }
        .print-grid-2 { display: flex; flex-wrap: wrap; gap: 4mm; }
        .print-grid-2 > * { flex: 1; min-width: 90mm; }
        .print-grid-2 .print-section-paid-to { flex: 1.4; }
        .print-grid-2 .print-section-amount { flex: 0.6; min-width: 160px; }
        .print-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
        .print-info-grid > :nth-child(-n+2) { border-bottom: 1px dashed #cbd5e1; padding-bottom: 1mm; margin-bottom: 0.5mm; }
        .print-info-row { display: flex; justify-content: space-between; padding: 0.8mm 0; font-size: 10px; }
        .print-info-label { color: #64748b; font-weight: 500; }
        .print-info-value { font-weight: 600; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 2px; }
        .print-amount-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 10px; }
        .print-amount-table th { padding: 1.5mm 2mm; border-bottom: 1px solid #94a3b8; font-weight: 600; color: #64748b; }
        .print-amount-table th:first-child { border-right: 1px solid #94a3b8; }
        .print-amount-table td { padding: 3mm 2mm; font-size: 13px; font-weight: 700; }
        .print-amount-table td:first-child { border-right: 1px solid #94a3b8; text-align: left; padding-left: 3mm; }
        .print-amount-table tbody tr:last-child td { padding-top: 1mm; font-size: 8px; }
        .print-carrier-name { font-size: 12px; font-weight: 600; border-bottom: 2px dotted #94a3b8; padding-bottom: 1mm; margin-bottom: 2mm; color: #1e293b; }
        .print-body-text { font-size: 9px; line-height: 1.4; text-align: justify; color: #475569; font-style: italic; margin-bottom: 2mm; }
        .print-amount-words { font-size: 10px; font-style: italic; color: #334155; border-bottom: 2px dotted #475569; padding-bottom: 1mm; }
        .print-signatures { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 2mm; }
        .print-signature-box { width: 20mm; height: 12mm; border: 2px dashed #94a3b8; border-radius: 2px; margin-bottom: 1mm; }
        .print-signature-label { font-size: 9px; font-weight: 500; color: #475569; }
        .print-signature-sublabel { font-size: 8px; color: #94a3b8; }
        .print-company-signature { text-align: right; }
        .print-company-signature .print-signature-box { width: 55mm; margin-left: auto; margin-top: 2mm; }
      `
    case 'a5-portrait':
      return `
        .print-title { font-size: 12px; font-weight: 700; text-align: center; color: #1e293b; margin-bottom: 0.5mm; }
        .print-subtitle { font-size: 9px; font-weight: 600; text-align: center; color: #1d4ed8; text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 2px; margin-bottom: 3mm; }
        .print-grid-2 { display: flex; flex-direction: column; gap: 3mm; }
        .print-grid-2 > * { min-width: unset; }
        .print-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
        .print-info-grid > :nth-child(-n+2) { border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.8mm; margin-bottom: 0.5mm; }
        .print-info-row { display: flex; justify-content: space-between; padding: 0.5mm 0; font-size: 8.5px; }
        .print-info-label { color: #64748b; font-weight: 500; }
        .print-info-value { font-weight: 600; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 2px; }
        .print-amount-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 8.5px; }
        .print-amount-table th { padding: 1mm 2mm; border-bottom: 1px solid #94a3b8; font-weight: 600; color: #64748b; }
        .print-amount-table th:first-child { border-right: 1px solid #94a3b8; }
        .print-amount-table td { padding: 2mm 2mm; font-size: 11px; font-weight: 700; }
        .print-amount-table td:first-child { border-right: 1px solid #94a3b8; text-align: left; padding-left: 3mm; }
        .print-amount-table tbody tr:last-child td { padding-top: 0.5mm; font-size: 8px; }
        .print-carrier-name { font-size: 11px; font-weight: 600; border-bottom: 2px dotted #94a3b8; padding-bottom: 0.8mm; margin-bottom: 1.5mm; color: #1e293b; }
        .print-body-text { font-size: 8px; line-height: 1.4; text-align: justify; color: #475569; font-style: italic; margin-bottom: 1.5mm; }
        .print-amount-words { font-size: 9px; font-style: italic; color: #334155; border-bottom: 2px dotted #475569; padding-bottom: 0.8mm; }
        .print-signatures { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1mm; }
        .print-signature-box { width: 16mm; height: 9mm; border: 2px dashed #94a3b8; border-radius: 2px; margin-bottom: 1mm; }
        .print-signature-label { font-size: 8px; font-weight: 500; color: #475569; }
        .print-signature-sublabel { font-size: 7px; color: #94a3b8; }
        .print-company-signature { text-align: right; }
        .print-company-signature .print-signature-box { width: 45mm; margin-left: auto; margin-top: 2mm; }
      `
    case 'a4-portrait':
      return `
        .print-title { font-size: 16px; font-weight: 700; text-align: center; color: #1e293b; margin-bottom: 1mm; }
        .print-subtitle { font-size: 12px; font-weight: 600; text-align: center; color: #1d4ed8; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 2px; margin-bottom: 5mm; }
        .print-grid-2 { display: flex; flex-wrap: wrap; gap: 5mm; }
        .print-grid-2 > * { flex: 1; min-width: 100mm; }
        .print-grid-2 .print-section-paid-to { flex: 1.4; }
        .print-grid-2 .print-section-amount { flex: 0.6; min-width: 180px; }
        .print-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
        .print-info-grid > :nth-child(-n+2) { border-bottom: 1px dashed #cbd5e1; padding-bottom: 1.5mm; margin-bottom: 0.5mm; }
        .print-info-row { display: flex; justify-content: space-between; padding: 1mm 0; font-size: 11px; }
        .print-info-label { color: #64748b; font-weight: 500; }
        .print-info-value { font-weight: 600; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 2px; }
        .print-amount-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; }
        .print-amount-table th { padding: 2mm 2mm; border-bottom: 1px solid #94a3b8; font-weight: 600; color: #64748b; }
        .print-amount-table th:first-child { border-right: 1px solid #94a3b8; }
        .print-amount-table td { padding: 4mm 2mm; font-size: 14px; font-weight: 700; }
        .print-amount-table td:first-child { border-right: 1px solid #94a3b8; text-align: left; padding-left: 3mm; }
        .print-amount-table tbody tr:last-child td { padding-top: 1mm; font-size: 9px; }
        .print-carrier-name { font-size: 14px; font-weight: 600; border-bottom: 2px dotted #94a3b8; padding-bottom: 1.2mm; margin-bottom: 2.5mm; color: #1e293b; }
        .print-body-text { font-size: 10px; line-height: 1.45; text-align: justify; color: #475569; font-style: italic; margin-bottom: 2.5mm; }
        .print-amount-words { font-size: 11px; font-style: italic; color: #334155; border-bottom: 2px dotted #475569; padding-bottom: 1mm; }
        .print-signatures { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 2mm; }
        .print-signature-box { width: 22mm; height: 14mm; border: 2px dashed #94a3b8; border-radius: 2px; margin-bottom: 1mm; }
        .print-signature-label { font-size: 10px; font-weight: 500; color: #475569; }
        .print-signature-sublabel { font-size: 9px; color: #94a3b8; }
        .print-company-signature { text-align: right; }
        .print-company-signature .print-signature-box { width: 60mm; margin-left: auto; margin-top: 2mm; }
      `
  }
}

export function buildPrintCss(paperSizeId: PaperSizeId): string {
  const size = PAPER_SIZES.find((s) => s.id === paperSizeId) ?? PAPER_SIZES[0]
  return (
    `
      @page {
        size: ${size.pageSize};
        margin: ${size.margin};
      }
      /* Override the preview wrapper's inline max-width/min-height so print fills the full page */
      [style*="max-width"] { max-width: 100% !important; min-height: auto !important; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      body {
        width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: ${size.fontSize};
        line-height: 1.3;
        color: #1e293b;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .print-section {
        border: 1px solid #cbd5e1;
        border-radius: 2px;
        margin-bottom: ${size.sectionGap};
        overflow: hidden;
        page-break-inside: avoid;
      }
      .print-section-header {
        background: #f1f5f9;
        padding: ${size.headerPadding};
        border-bottom: 1px solid #cbd5e1;
        font-size: ${size.fontSize};
        font-weight: 600;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .print-section-body {
        padding: ${size.bodyPadding};
      }
      .print-notification {
        display: flex;
        align-items: flex-start;
        gap: 1.5mm;
        background: #fef2f2;
        border: 1px solid #fca5a5;
        border-radius: 2px;
        padding: 1.5mm 2mm;
        margin-bottom: 2mm;
      }
      .print-notification-icon {
        font-size: 12px;
        line-height: 1.3;
        flex-shrink: 0;
      }
      .print-notification-body {
        display: flex;
        flex-direction: column;
        gap: 0.3mm;
      }
      .print-notification-title {
        font-size: 11px;
        font-weight: 600;
        color: #991b1b;
      }
      .print-notification-list {
        font-size: 9px;
        color: #b91c1c;
        line-height: 1.3;
      }
    ` +
    getPaperOverrides(paperSizeId) +
    PRINT_CSS_STATIC
  )
}
