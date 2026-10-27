import React, { useState } from 'react';
import { Database, FileSpreadsheet, Layers, ExternalLink, Table2, ArrowRight } from 'lucide-react';

export const DataSchemaTab: React.FC = () => {
  const [activeSubnav, setActiveSubnav] = useState<'registry' | 'sources' | 'mappings' | 'stages' | 'postgres'>('registry');

  const registry = [
    {
      ds: 'Data source 1',
      sys: 'Power BI · semantic model OSL_AF (workspace OSL HQ - by topic)',
      owner: 'Model owner: Sarfaraz KHAN',
      link: 'https://app.powerbi.com/groups/me/reports/0bee1482-e1c8-4073-bcfc-09546034c0d3',
      exports: [
        { name: 'Request Monitoring', file: 'OSL_AF_RequestMonitoring_YYYY-MM-DD.xlsx', table: 'SupplyCombained', use: 'Order lines → orders.json lines' },
        { name: 'Shipment Monitoring', file: 'OSL_AF_ShipmentMonitoring_YYYY-MM-DD.xlsx', table: 'Shipping_Info2', use: 'Shipments → orders.json ships' },
        { name: 'Kit Impact (optional)', file: 'OSL_AF_KitImpact_YYYY-MM-DD.xlsx', table: 'Kit-Rate · Measures_Other', use: 'Reference for kit beneficiaries' }
      ]
    },
    {
      ds: 'Data source 2',
      sys: 'Power BI · report EBOLA_All countries except DRC',
      owner: 'OSL Operations Lead',
      link: '',
      exports: [
        { name: 'Line details', file: 'EBOLA_LineDetails_YYYY-MM-DD.xlsx', table: 'SupplyCombained', use: 'Cross-check of Ebola lines against Data source 1' },
        { name: 'Shipment info', file: 'EBOLA_ShipmentInfo_YYYY-MM-DD.xlsx', table: 'Shipping_Info2', use: 'Cross-check of Ebola shipments against Data source 1' },
        { name: 'Critical items', file: 'EBOLA_CriticalItems_YYYY-MM-DD.xlsx', table: 'Critical_Items_AFRO', use: 'Compared with items flagged as essential in Data source 1' }
      ]
    },
    {
      ds: 'Data source 3',
      sys: 'SharePoint · KENYA NAIROBI HUB · Outbound Monitoring (Excel)',
      owner: 'Hub Logistics Officer',
      link: 'https://worldhealthorg.sharepoint.com/:x:/s/KENYANAIROBIHUB/IQC6is6PAZeuSbZLE3No0WyNAY5DAOQopCgCEofx033DUTM',
      exports: [
        { name: 'Outbound Monitoring', file: 'NBO_OutboundMonitoring_YYYY-MM-DD.xlsx', table: 'Outbound_Dispatches', use: 'Nairobi hub dispatches; compared with SHP Source NBO_SHP_OUT lines' }
      ]
    }
  ];

  const sources = [
    { n: 'Source 1', name: 'OSL_AF · table SupplyCombained', what: 'One row per item line of an order request or stock release: item, quantity, value, status and dates. Exported from the OSL monitoring report (Power BI).', file: 'data/orders.json → lines', cadence: 'each new export, merged without duplicates' },
    { n: 'Source 2', name: 'OSL_AF · table Shipping_Info2', what: 'One row per WHO shipping reference: weight, volume, temperature, readiness and ETA/ATA. Exported from the OSL monitoring report (Power BI).', file: 'data/orders.json → ships', cadence: 'each new export, merged by shipping reference' },
    { n: 'Source 3', name: 'WHO Disease Outbreak News', what: 'Confirmed cases and deaths by country, with report date and link.', file: 'data/cases.json', cadence: 'each new WHO DON publication' },
    { n: 'Source 4', name: 'WHO technical references', what: 'Ebola treatment centre supply calculator rates, kit module contents and WHO AFRO sitrep occupancy, used by Beneficiaries & risk.', file: 'data/impact.json', cadence: 'when WHO publishes a new version' }
  ];

  const pbi = [
    { k: 'Semantic model', v: 'OSL_AF' },
    { k: 'Workspace', v: 'OSL HQ - by topic' },
    { k: 'Model owner', v: 'Sarfaraz KHAN' },
    { k: 'Report', v: 'OSL monitoring (WHO African Region)' },
    { k: 'Tables used', v: 'SupplyCombained (lines) · Shipping_Info2 (shipments)' },
    { k: 'Access', v: 'View and export. Build permission not granted.' },
    { k: 'Column names', v: 'Identical to the semantic model. New or renamed columns in an export are reported in the Parking Lot.' }
  ];

  const maps = [
    {
      title: 'Source 1 · OSL_AF SupplyCombained → orders.json lines',
      sub: 'Lines are matched on trimmed OR + trimmed item code + quantity + rounded amount. Matched lines are never overwritten; only empty dates are filled with the recorded value.',
      rows: [
        { sn: 1, col: 'Destination Country', f: 'c', t: 'ISO3', rule: 'Country name → ISO3 code from the countries list' },
        { sn: 2, col: 'Request Date', f: 'rd', t: 'date', rule: 'Excel serial → YYYY-MM-DD' },
        { sn: 3, col: 'Order Request (OR)', f: 'or', t: 'text', rule: 'Leading/trailing spaces trimmed' },
        { sn: 4, col: 'OPR / PO Reference', f: 'opr', t: 'text', rule: 'Trimmed' },
        { sn: 5, col: 'Origin PO reference', f: 'po', t: 'text', rule: 'Trimmed' },
        { sn: 6, col: 'WHO Item code', f: 'code', t: 'text', rule: 'Trimmed' },
        { sn: 7, col: 'WHO Item description', f: 'desc', t: 'text', rule: 'As recorded' },
        { sn: 8, col: 'UoM', f: 'uom', t: 'text', rule: 'Lowercase string' },
        { sn: 9, col: 'Quantity Ordered', f: 'qty', t: 'number', rule: 'Integer / Float' },
        { sn: 10, col: 'Quantity in each', f: 'each', t: 'number', rule: 'Empty → not available' },
        { sn: 11, col: 'Unit Goods Value (USD)', f: 'unit', t: 'number', rule: 'Numeric USD' },
        { sn: 12, col: 'PO Line Amount', f: 'amt', t: 'number', rule: 'USD total line amount' },
        { sn: 13, col: 'Requested Category', f: 'cat', t: 'text', rule: 'PPE / IPC supplies, PPE → PPE / IPC · Logistic → Logistics · Medical equipement, Biomedical Equipment → Medical equipment · LAB… → Laboratory · empty → Uncategorised' },
        { sn: 14, col: 'Essential Items', f: 'ess', t: 'text', rule: 'Yes / No or Essential category code' },
        { sn: 15, col: 'HUB/Supplier', f: 'hub', t: 'text', rule: 'Fulfillment source identifier' },
        { sn: 16, col: 'Supply Type', f: 'type', t: 'text', rule: 'Empty → Unspecified' },
        { sn: 17, col: 'PO Creation Date/Stock request', f: 'poDate', t: 'date', rule: 'YYYY-MM-DD' },
        { sn: 18, col: 'WHO Shipping Reference', f: 'ref', t: 'text', rule: 'Empty → “(no shipment) ” + OR' },
        { sn: 19, col: 'SHP Source', f: 'src', t: 'code', rule: 'NBO_SHP_OUT → nbo · DKR_SHP_OUT → dkr · otherwise taken from existing lines of the same OR' },
        { sn: 20, col: 'WHO Shipping Status', f: 'stRaw / st', t: 'text / code', rule: 'stRaw as recorded; st mapped from the stage table' },
        { sn: 21, col: 'Incoterm (Payable From)', f: 'from', t: 'text', rule: 'Standard Incoterm rule' },
        { sn: 22, col: 'Incoterm (Payable Upto)', f: 'to', t: 'text', rule: 'Standard Incoterm rule' },
        { sn: 23, col: 'Mod of Shippment', f: 'mode', t: 'text', rule: 'AIR / ROAD / SEA' },
        { sn: 24, col: 'Transporter (3PL)', f: 'tpl', t: 'text', rule: 'Forwarder/Carrier company name' },
        { sn: 25, col: 'Transport Document Number (AWB/BOL/RWB/TB)2', f: 'awb', t: 'text', rule: '“0” not imported' },
        { sn: 26, col: 'Last Readiness Date', f: 'ready', t: 'date', rule: 'YYYY-MM-DD' },
        { sn: 27, col: 'PO/OPR Committed readiness date', f: 'commit', t: 'date', rule: 'YYYY-MM-DD' },
        { sn: 28, col: 'ETD', f: 'etd', t: 'date', rule: 'YYYY-MM-DD' },
        { sn: 29, col: 'ETA', f: 'eta', t: 'date', rule: 'YYYY-MM-DD' },
        { sn: 30, col: 'ATA', f: 'ata', t: 'date', rule: 'YYYY-MM-DD' },
        { sn: 31, col: 'Registration Number', f: 'reg', t: 'text', rule: 'Shipment registration' },
        { sn: 32, col: 'Project / Task / Award', f: 'proj/task/award', t: 'text', rule: 'WHO accounting dimensions' },
        { sn: 33, col: 'Donor Name / Award End Date', f: 'donor/awardEnd', t: 'text/date', rule: 'Donor attribution & expiration date' },
        { sn: 34, col: 'Emergencies/Activities', f: 'em', t: 'text', rule: '2026-G013 DRC Ituri Ebola Bundibugyo → G013; others as recorded' },
        { sn: 35, col: 'Supply Section / Remarks', f: 'section/rem', t: 'text', rule: 'Operational section notes' }
      ]
    },
    {
      title: 'Source 2 · OSL_AF Shipping_Info2 → orders.json ships',
      sub: 'Keyed by WHO Shipping Reference. Value (USD) in this export covers lines of the filtered emergency only; the dashboard sums values from the lines.',
      rows: [
        { sn: 1, col: 'WHO Shipping Reference', f: 'key', t: 'text', rule: 'Unique primary key' },
        { sn: 2, col: 'Gross Weight (Kg)', f: 'kg', t: 'number', rule: 'Gross cargo kilograms' },
        { sn: 3, col: 'Volume (Cbm)', f: 'cbm', t: 'number', rule: 'Volume in cubic metres' },
        { sn: 4, col: 'Temperature Requirement', f: 'temp', t: 'text', rule: 'Cold chain requirement (Ambient, 2-8°C, -20°C)' },
        { sn: 5, col: 'Number of Parcels', f: 'parcels', t: 'text', rule: 'Package/box count' },
        { sn: 6, col: 'Last Readiness Date', f: 'lastReady', t: 'date', rule: 'Serial 0 or 1 not imported' },
        { sn: 7, col: 'ETA/ATA', f: 'etaata', t: 'date', rule: 'Target or actual arrival date' },
        { sn: 8, col: 'Status', f: 'st2', t: 'text', rule: 'Delivered / To be delivered, as recorded' }
      ]
    },
    {
      title: 'Sources 3 and 4 · reference files',
      sub: 'Entered by hand from the WHO publication, with the publication name and date stored next to each figure.',
      rows: [
        { sn: 1, col: 'DON: confirmed cases', f: 'cases.countries[ISO3].confirmed', t: 'number', rule: 'As published by WHO Disease Outbreak News' },
        { sn: 2, col: 'DON: deaths', f: 'cases.countries[ISO3].deaths', t: 'number', rule: 'As published' },
        { sn: 3, col: 'DON: report date', f: 'cases.countries[ISO3].asOf', t: 'date', rule: 'YYYY-MM-DD' },
        { sn: 4, col: 'DON: publication', f: 'cases.countries[ISO3].src / url', t: 'text', rule: 'Full citation and official URL' },
        { sn: 5, col: 'ETC calculator: need per item', f: 'impact.fam[].pm', t: 'number', rule: 'Per bed per month (need ÷ 100,000 beds ÷ 3 months)' },
        { sn: 6, col: 'ETC calculator: Human Resources', f: 'impact.staffPerBed', t: 'number', rule: 'Staffing ratio per bed' },
        { sn: 7, col: 'Kit content lists', f: 'impact.kits[]', t: 'object', rule: 'Population or patients covered per kit module, as published' }
      ]
    }
  ];

  const stages = [
    { raw: '00-Planned', st: 'planned' },
    { raw: '01-Sourced', st: 'planned' },
    { raw: 'oo-MIssing', st: 'planned' },
    { raw: '12-On Hold', st: 'planned' },
    { raw: '01b-Awating Pre-leg', st: 'prelg' },
    { raw: '01c-At transit hub', st: 'thub' },
    { raw: '01d-Sourced (at transit hub)', st: 'thub' },
    { raw: '02-Goods Available at hub or supplier', st: 'hub' },
    { raw: '04-GL Requested (if needed)', st: 'gl' },
    { raw: '06-Pending pre-alert request', st: 'depart' },
    { raw: '07-Pending Departure', st: 'depart' },
    { raw: '08-Shipped', st: 'transit' },
    { raw: '09-Arrived', st: 'arrived' },
    { raw: '09-Arrived (from transit hub)', st: 'arrived' },
    { raw: '10-Received', st: 'received' },
    { raw: '10-Received (from transit hub)', st: 'received' },
    { raw: '11-Canceled', st: 'canceled' }
  ];

  const tables = [
    {
      name: 'country',
      from: 'orders.json countries',
      cols: [
        { n: 'iso', t: 'char(3) PK', key: true },
        { n: 'm49', t: 'int', key: false },
        { n: 'name', t: 'text', key: false }
      ]
    },
    {
      name: 'line',
      from: 'Source 1 (SupplyCombained)',
      cols: [
        { n: 'id', t: 'bigserial PK', key: true },
        { n: 'c', t: 'char(3) FK country', key: true },
        { n: 'ref', t: 'text FK shipment', key: true },
        { n: 'em, or, opr, po', t: 'text', key: false },
        { n: 'code, desc, uom', t: 'text', key: false },
        { n: 'qty, each', t: 'numeric', key: false },
        { n: 'unit, amt', t: 'numeric(14,2)', key: false },
        { n: 'cat, ess, hub, src, type', t: 'text', key: false },
        { n: 'st', t: 'text FK status_map', key: true },
        { n: 'stRaw', t: 'text', key: false },
        { n: 'rd, poDate, ready, commit, etd, eta, ata', t: 'date', key: false },
        { n: 'mode, tpl, awb, from, to, reg', t: 'text', key: false },
        { n: 'proj, task, award, donor, pi', t: 'text', key: false },
        { n: 'awardEnd', t: 'date', key: false },
        { n: 'section, rem', t: 'text', key: false },
        { n: 'import_id', t: 'int FK import_receipt', key: true }
      ]
    },
    {
      name: 'shipment',
      from: 'Source 2 (Shipping_Info2)',
      cols: [
        { n: 'ref', t: 'text PK', key: true },
        { n: 'kg, cbm', t: 'numeric', key: false },
        { n: 'temp, parcels', t: 'text', key: false },
        { n: 'lastReady, etaata', t: 'date', key: false },
        { n: 'st2', t: 'text', key: false }
      ]
    },
    {
      name: 'status_map',
      from: 'stage table',
      cols: [
        { n: 'stRaw', t: 'text PK', key: true },
        { n: 'st', t: 'text', key: false }
      ]
    },
    {
      name: 'case_report',
      from: 'Source 3 (WHO DON)',
      cols: [
        { n: 'iso', t: 'char(3) PK FK country', key: true },
        { n: 'asOf', t: 'date PK', key: true },
        { n: 'confirmed, deaths', t: 'int', key: false },
        { n: 'src, url, note', t: 'text', key: false }
      ]
    },
    {
      name: 'import_receipt',
      from: 'Parking Lot',
      cols: [
        { n: 'id', t: 'serial PK', key: true },
        { n: 'date', t: 'date', key: false },
        { n: 'lines_before, lines_after', t: 'int', key: false },
        { n: 'value_before, value_after', t: 'numeric(14,2)', key: false }
      ]
    },
    {
      name: 'import_file',
      from: 'Parking Lot',
      cols: [
        { n: 'receipt_id', t: 'int FK import_receipt', key: true },
        { n: 'file, role, scope', t: 'text', key: false },
        { n: 'rows, matched, added, replaced', t: 'int', key: false },
        { n: 'file_value, ds_value', t: 'numeric(14,2)', key: false },
        { n: 'result, note', t: 'text', key: false }
      ]
    },
    {
      name: 'import_issue',
      from: 'Parking Lot',
      cols: [
        { n: 'id', t: 'serial PK', key: true },
        { n: 'date', t: 'date', key: false },
        { n: 'file, field, value, issue, refs', t: 'text', key: false },
        { n: 'rows', t: 'int', key: false }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0071B8] mb-1">
            <Database className="w-4 h-4" />
            <span>Architecture & Interoperability</span>
          </div>
          <h2 className="text-xl font-bold text-[#14212E]">Data Schema & Upstream Integration</h2>
          <p className="text-sm text-[#536271] mt-1 max-w-2xl">
            Complete specification of primary sources, ingestion rules, normalisation formulas, and PostgreSQL relational schema powering the WHO AFRO Ebola Supply Chain Dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="https://app.powerbi.com/groups/me/reports/0bee1482-e1c8-4073-bcfc-09546034c0d3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#0071B8] text-white rounded-lg hover:bg-[#00508A] transition-colors"
          >
            <span>Power BI OSL Model</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-[#DDE3E9] pb-3">
        {[
          { id: 'registry', label: '1. Source Registry' },
          { id: 'sources', label: '2. Upstream Sources' },
          { id: 'mappings', label: '3. Field Mappings' },
          { id: 'stages', label: '4. Stage Mapping' },
          { id: 'postgres', label: '5. PostgreSQL Schema' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubnav(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubnav === tab.id
                ? 'bg-[#00205B] text-white shadow-xs'
                : 'bg-white border border-[#DDE3E9] text-[#536271] hover:text-[#14212E] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Registry */}
      {activeSubnav === 'registry' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#14212E] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0071B8]" />
              <span>Upstream System Registry</span>
            </h3>
            <span className="text-xs text-[#536271]">3 integrated WHO IT systems</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {registry.map((r, i) => (
              <div key={i} className="bg-white border border-[#DDE3E9] rounded-xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071B8] bg-blue-50 px-2 py-0.5 rounded">
                      {r.ds}
                    </span>
                    <strong className="text-sm font-semibold text-[#14212E]">{r.sys}</strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#536271]">{r.owner}</span>
                    {r.link && (
                      <a
                        href={r.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0071B8] hover:underline flex items-center gap-1"
                      >
                        <span>Open source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#DDE3E9] rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#0071B8] text-white uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-2 px-3 border-r border-[#3D8FC6]">Export Name</th>
                        <th className="py-2 px-3 border-r border-[#3D8FC6]">File Name Format</th>
                        <th className="py-2 px-3 border-r border-[#3D8FC6]">Semantic Model Table</th>
                        <th className="py-2 px-3">Dashboard Consumption</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE3E9]">
                      {r.exports.map((e, ei) => (
                        <tr key={ei} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-[#14212E] border-r border-[#DDE3E9] whitespace-nowrap">
                            {e.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 border-r border-[#DDE3E9] whitespace-nowrap">
                            {e.file}
                          </td>
                          <td className="py-2.5 px-3 text-[#536271] border-r border-[#DDE3E9] whitespace-nowrap">
                            {e.table}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800">{e.use}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Upstream Sources & Canonical Power BI */}
      {activeSubnav === 'sources' && (
        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((s, i) => (
              <div key={i} className="bg-white border border-[#DDE3E9] border-t-4 border-t-[#0071B8] rounded-xl p-5 shadow-xs flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071B8]">{s.n}</span>
                <strong className="text-sm font-bold text-[#14212E]">{s.name}</strong>
                <p className="text-xs text-[#3F4B57] leading-relaxed">{s.what}</p>
                <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-[#536271]">
                  <div>
                    Stored in: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">{s.file}</code>
                  </div>
                  <div>Sync Cadence: <strong className="text-slate-700">{s.cadence}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#DDE3E9] rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0071B8] pb-2 border-b-2 border-[#0071B8] mb-3">
              Canonical Source Details · Power BI OSL_AF
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs">
              {pbi.map((p, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[11px] font-medium text-[#536271]">{p.k}</span>
                  <span className="font-semibold text-[#14212E]">{p.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Field Mappings */}
      {activeSubnav === 'mappings' && (
        <section className="flex flex-col gap-6">
          {maps.map((m, mi) => (
            <div key={mi} className="bg-white border border-[#DDE3E9] rounded-xl p-5 shadow-xs flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0071B8] pb-2 border-b-2 border-[#0071B8]">
                {m.title}
              </h4>
              <p className="text-xs text-[#536271]">{m.sub}</p>

              <div className="overflow-x-auto border border-[#DDE3E9] rounded-lg max-h-[500px]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0071B8] text-white uppercase text-[10px] font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-2.5 text-center border-r border-[#3D8FC6] w-12">#</th>
                      <th className="py-2 px-3 border-r border-[#3D8FC6]">Source Column</th>
                      <th className="py-2 px-3 border-r border-[#3D8FC6]">Field Code</th>
                      <th className="py-2 px-3 border-r border-[#3D8FC6]">Data Type</th>
                      <th className="py-2 px-3">Ingestion & Validation Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE3E9]">
                    {m.rows.map((r, ri) => (
                      <tr key={ri} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 text-center text-slate-400 font-mono border-r border-[#DDE3E9]">{r.sn}</td>
                        <td className="py-2 px-3 font-semibold text-[#14212E] border-r border-[#DDE3E9] whitespace-nowrap">{r.col}</td>
                        <td className="py-2 px-3 font-mono font-medium text-[#0071B8] border-r border-[#DDE3E9] whitespace-nowrap">{r.f}</td>
                        <td className="py-2 px-3 text-[#536271] border-r border-[#DDE3E9] whitespace-nowrap">{r.t}</td>
                        <td className="py-2 px-3 text-slate-700">{r.rule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Section 4: Stage Mapping */}
      {activeSubnav === 'stages' && (
        <section className="bg-white border border-[#DDE3E9] rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0071B8] pb-2 border-b-2 border-[#0071B8]">
            WHO Shipping Status Code Map → Dashboard Operational Stage
          </h4>
          <p className="text-xs text-[#536271]">
            Normalises raw status strings entered in WHO Nairobi, Dakar, Dubai, and Accra logistics hubs into standardized operational stages.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {stages.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 border border-[#DDE3E9] rounded-lg bg-slate-50 text-xs">
                <span className="font-mono text-slate-700 text-[11px] truncate" title={s.raw}>{s.raw}</span>
                <div className="flex items-center gap-1.5 flex-none pl-2">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-bold text-[#0071B8] uppercase text-[10px] px-1.5 py-0.5 bg-blue-100/60 rounded">
                    {s.st}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 5: PostgreSQL Schema */}
      {activeSubnav === 'postgres' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#14212E] flex items-center gap-2">
              <Table2 className="w-4 h-4 text-[#0071B8]" />
              <span>Relational Schema for PostgreSQL</span>
            </h3>
            <span className="text-xs text-[#536271]">Production tables for backend persistence</span>
          </div>
          <p className="text-xs text-[#536271]">
            Direct drop-in schema for Azure Database for PostgreSQL or Cloud SQL. Column names and types match the JSON keys so files can be loaded without transformation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((tb, i) => (
              <div key={i} className="bg-white border border-[#DDE3E9] rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div className="bg-[#14212E] text-white px-3.5 py-2.5 flex items-baseline justify-between gap-2">
                  <strong className="font-mono text-xs font-semibold">{tb.name}</strong>
                  <span className="text-[10px] text-slate-300 truncate max-w-[150px]">{tb.from}</span>
                </div>
                <div className="divide-y divide-[#EEF1F4] max-h-72 overflow-y-auto">
                  {tb.cols.map((c, ci) => (
                    <div key={ci} className="flex items-center justify-between px-3.5 py-1.5 text-xs">
                      <span className={`font-mono text-[11px] ${c.key ? 'text-[#0071B8] font-bold' : 'text-slate-700'}`}>
                        {c.n}
                      </span>
                      <span className="text-[11px] text-[#536271] font-mono">{c.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#536271]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071B8] inline-block"></span>
            <span>Blue font indicates primary key (PK) or foreign key (FK) constraints.</span>
          </div>
        </section>
      )}
    </div>
  );
};
