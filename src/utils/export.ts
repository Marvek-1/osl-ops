import * as XLSX from 'xlsx';
import { fd } from './engine';

export function exportTablesToExcel(
  title: string,
  asOf: string,
  filters: Record<string, string>,
  tables: Array<{ name: string; headers: string[]; rows: (string | number)[][] }>
) {
  const wb = XLSX.utils.book_new();

  // Filters Sheet
  const filterRows: (string | number)[][] = [
    ['Ebola Preparedness · Order Request Tracker | WHO AFRO OSL'],
    ['Page / View', title],
    ['Data as of', asOf],
    ['Exported at', new Date().toLocaleString()],
    []
  ];

  Object.entries(filters).forEach(([k, v]) => {
    if (v) filterRows.push([k, v]);
  });

  filterRows.push([]);
  filterRows.push(['Total tables in this export', tables.length]);

  const wsFilters = XLSX.utils.aoa_to_sheet(filterRows);
  XLSX.utils.book_append_sheet(wb, wsFilters, 'Summary & Filters');

  // Sheets for each table
  const usedNames: Record<string, number> = {};
  tables.forEach(t => {
    let sheetName = t.name.replace(/[\[\]:*?/\\]/g, ' ').slice(0, 28).trim() || 'Table';
    const lower = sheetName.toLowerCase();
    usedNames[lower] = (usedNames[lower] || 0) + 1;
    if (usedNames[lower] > 1) {
      sheetName = sheetName.slice(0, 26) + ' ' + usedNames[lower];
    }

    const sheetData = [t.headers, ...t.rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto column widths
    if (sheetData.length > 0) {
      ws['!cols'] = t.headers.map((_, colIdx) => ({
        wch: Math.min(
          60,
          Math.max(
            8,
            ...sheetData.slice(0, 300).map(row => String(row[colIdx] ?? '').length)
          )
        )
      }));
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const filename = `WHO_AFRO_Ebola_Tracker_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${asOf || 'export'}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const allRows = [headers, ...rows];
  const csv = allRows
    .map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(','))
    .join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportExecutiveWorkbook(
  data: any,
  cases: any,
  impact: any,
  parking: any,
  options?: { filename?: string }
) {
  const wb = XLSX.utils.book_new();

  // 1. Executive Summary Sheet
  const briefRows: (string | number)[][] = [
    ['WHO AFRO Health Emergencies · Ebola Preparedness & Response Order Tracker'],
    ['Executive Brief & Strategic Supply Chain Status'],
    ['Data as of', data.today],
    ['Exported at', new Date().toLocaleString()],
    [],
    ['Macro KPIs across 12 countries'],
    ['Metric', 'Value'],
    ['Total Requested Value (USD)', data.orders.reduce((s: number, o: any) => s + o.value, 0)],
    ['Delivered Value (USD)', data.orders.reduce((s: number, o: any) => s + o.delivered, 0)],
    ['Total Lines', data.lines.length],
    ['Total Shipments', Object.keys(data.ships || {}).length],
    [],
    ['Country Breakdown (Ebola Outbreak & Priority 1 Preparedness)'],
    ['Country', 'Confirmed Cases', 'Deaths', 'Requested USD', 'Delivered USD', 'Delivered %', 'Lines Count']
  ];

  (data.countries || []).forEach((c: any) => {
    const cLines = data.lines.filter((l: any) => l.c === c.iso && l.st !== 'canceled');
    const tot = cLines.reduce((s: number, l: any) => s + l.amt, 0);
    const del = cLines.filter((l: any) => l.st === 'arrived' || l.st === 'received').reduce((s: number, l: any) => s + l.amt, 0);
    const cEpi = (cases.countries && cases.countries[c.iso]) || { confirmed: 0, deaths: 0 };
    briefRows.push([
      c.name,
      cEpi.confirmed,
      cEpi.deaths,
      Math.round(tot),
      Math.round(del),
      tot ? Math.round((del / tot) * 100) + '%' : '—',
      cLines.length
    ]);
  });

  const wsBrief = XLSX.utils.aoa_to_sheet(briefRows);
  XLSX.utils.book_append_sheet(wb, wsBrief, 'Executive Brief');

  // 2. Line Details Sheet
  const lineHeaders = [
    'Destination Country', 'Request Date', 'Order Request (OR)', 'OPR Ref', 'PO Reference',
    'Item Code', 'Item Description', 'UoM', 'Quantity Ordered', 'Unit Goods Value (USD)', 'Line Amount (USD)',
    'Requested Category', 'Essential Item', 'Fulfilled From', 'Hub / Supplier', 'Supply Type',
    'WHO Shipping Status', 'Shipment Reference', 'Mode', 'Transporter (3PL)', 'AWB / BOL',
    'Last Readiness', 'ETD', 'ETA', 'ATA', 'Remarks Supply'
  ];
  const lineRows = (data.lines || []).map((l: any) => [
    (data.cn && data.cn[l.c] && data.cn[l.c].name) || l.c,
    l.rd || '',
    l.or || '',
    l.opr || '',
    l.po || '',
    l.code || '',
    l.desc || '',
    l.uom || '',
    l.qty || 0,
    l.unit || 0,
    l.amt || 0,
    l.cat || '',
    l.ess || '',
    l.src || '',
    l.hub || '',
    l.type || '',
    l.stRaw || l.st || '',
    l.ref || '',
    l.mode || (l.ship && l.ship.mode) || '',
    l.tpl || (l.ship && l.ship.tpl) || '',
    l.awb || (l.ship && l.ship.awb) || '',
    l.ready || '',
    l.etd || '',
    l.eta || '',
    l.ata || '',
    l.rem || ''
  ]);
  const wsLines = XLSX.utils.aoa_to_sheet([lineHeaders, ...lineRows]);
  XLSX.utils.book_append_sheet(wb, wsLines, 'Line Details');

  // 3. Shipments Sheet
  const shipHeaders = [
    'Shipping Reference', 'Status', 'Gross Weight (Kg)', 'Volume (Cbm)', 'Temperature',
    'Parcels', 'Last Readiness Date', 'ETA / ATA', 'Status Note'
  ];
  const shipRows = Object.entries(data.ships || {}).map(([ref, s]: [string, any]) => [
    ref,
    s.st || s.st2 || '',
    s.kg || '',
    s.cbm || '',
    s.temp || '',
    s.parcels || '',
    s.lastReady || '',
    s.etaata || '',
    s.st2 || ''
  ]);
  const wsShips = XLSX.utils.aoa_to_sheet([shipHeaders, ...shipRows]);
  XLSX.utils.book_append_sheet(wb, wsShips, 'Shipments');

  // 4. Critical Items Sheet
  const critMap: Record<string, { req: number; del: number; tr: number; lines: number }> = {};
  data.lines.filter((l: any) => l.ess && l.st !== 'canceled').forEach((l: any) => {
    const k = l.ess;
    const a = (critMap[k] = critMap[k] || { req: 0, del: 0, tr: 0, lines: 0 });
    const n = l.each || l.qty || 0;
    a.req += n;
    a.lines++;
    if (l.st === 'arrived' || l.st === 'received') a.del += n;
    else if (l.st === 'transit' || l.st === 'thub') a.tr += n;
  });
  const critRows = Object.entries(critMap).map(([name, a]) => [
    name,
    a.req,
    a.del,
    a.tr,
    a.req - a.del,
    a.req ? Math.round((a.del / a.req) * 100) + '%' : '0%',
    a.lines
  ]);
  const wsCrit = XLSX.utils.aoa_to_sheet([
    ['Essential Item', 'Quantity Requested', 'Delivered', 'In Transit', 'Pending', 'Delivered %', 'Lines Count'],
    ...critRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsCrit, 'Critical Items');

  const filename = options?.filename || `WHO_AFRO_Ebola_Supply_Chain_${data.today}.xlsx`;
  XLSX.writeFile(wb, filename);
}

