export const STG = [
  { k: 'planned', label: 'Planned / sourcing', color: '#B9A27A', bg: '#F4EFE6', fg: '#5E4A12' },
  { k: 'hub', label: 'At hub / supplier', color: '#8A97A3', bg: '#EEF1F4', fg: '#3F4B57' },
  { k: 'gl', label: 'Awaiting greenlight', color: '#F03E3E', bg: '#FDF3DC', fg: '#C92A2A' },
  { k: 'depart', label: 'Pending departure', color: '#E8590C', bg: '#FDEBE2', fg: '#C92A2A' },
  { k: 'prelg', label: 'Awaiting pre-leg', color: '#C9772B', bg: '#FBEADF', fg: '#8C3D16' },
  { k: 'thub', label: 'At transit hub', color: '#4D9CC4', bg: '#E3F0F8', fg: '#0062CC' },
  { k: 'transit', label: 'In transit', color: '#0A84FF', bg: '#E0F1F8', fg: '#0062CC' },
  { k: 'arrived', label: 'Arrived in country', color: '#3DD68C', bg: '#E3F3EA', fg: '#22643F' },
  { k: 'received', label: 'Received', color: '#0FA958', bg: '#D3EBDD', fg: '#087F3B' }
];

export const CANC = { k: 'canceled', label: 'Canceled', color: '#C3CBD3', bg: '#EEF1F4', fg: '#536271' };

export const SI: Record<string, number> = Object.fromEntries(STG.map((s, i) => [s.k, i]));
export const NR = new Set(['planned', 'hub', 'gl', 'depart', 'prelg']);

export const SG = (k: string) => (k === 'canceled' ? CANC : STG[SI[k]] || CANC);

export const SRC: Record<
  string,
  { label: string; color: string; bg: string; fg: string; xy?: [number, number] }
> = {
  nbo: { label: 'Nairobi hub', color: '#0071B8', bg: '#E0EEF8', fg: '#00508A', xy: [36.82, -1.29] },
  dkr: { label: 'Dakar hub', color: '#7B5EA7', bg: '#EEE8F6', fg: '#553C7B', xy: [-17.45, 14.69] },
  dxb: { label: 'Dubai hub', color: '#C05621', bg: '#FBEADF', fg: '#8C3D16', xy: [55.27, 25.2] },
  gva: { label: 'Geneva HQ stock', color: '#4A5A69', bg: '#E9EDF1', fg: '#2E3A46' },
  hq: { label: 'HQ / OSL stock', color: '#9AA7B3', bg: '#EEF1F4', fg: '#3F4B57' },
  kin: { label: 'Kinshasa stock (DRC)', color: '#2F7D6D', bg: '#DFF1EC', fg: '#1E5A4E', xy: [15.27, -4.32] },
  proc: { label: 'Procurement (supplier PO)', color: '#B7861A', bg: '#FAF1DA', fg: '#C92A2A' }
};

export const SRC_ORDER = ['nbo', 'dkr', 'dxb', 'kin', 'gva', 'hq', 'proc'];
export const SRC_DEFS = SRC_ORDER.map(k => ({ k, ...SRC[k] }));

export const SEV = [
  { bg: '#EEF1F4', fg: '#3F4B57' },
  { bg: '#FDF3DC', fg: '#C92A2A' },
  { bg: '#FDEBE2', fg: '#C92A2A' }
];

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const TYPE = {
  sr: {
    label: 'Stock release',
    short: 'SR',
    bg: '#E0EEF8',
    fg: '#00508A',
    desc: 'Released by HQ from hub stock (Nairobi, Dakar, Dubai) to the country'
  },
  or: {
    label: 'Order request',
    short: 'OR',
    bg: '#FAF1DA',
    fg: '#C92A2A',
    desc: 'Raised directly by the country office'
  }
};

export const GRP = [
  { k: 'pending', label: 'Pending', color: '#E8590C', bg: '#FDEBE2', fg: '#C92A2A' },
  { k: 'processing', label: 'Processing', color: '#F03E3E', bg: '#FDF3DC', fg: '#C92A2A' },
  { k: 'transit', label: 'In transit', color: '#0A84FF', bg: '#E0F1F8', fg: '#0062CC' },
  { k: 'delivered', label: 'Delivered', color: '#0FA958', bg: '#D3EBDD', fg: '#087F3B' },
  { k: 'canceled', label: 'Canceled', color: '#C3CBD3', bg: '#EEF1F4', fg: '#536271' }
];

export const GM: Record<string, (typeof GRP)[0]> = Object.fromEntries(GRP.map(g => [g.k, g]));

export const BN = [
  { k: 'stock', label: 'Hub stock-out', stage: 'Sourcing', q: 'Item not in hub stock, waiting for replenishment', color: '#E03131', bg: '#FDEBE2', fg: '#C92A2A' },
  { k: 'proc', label: 'Procurement', stage: 'Sourcing', q: 'Supplier has passed its readiness date', color: '#E8590C', bg: '#FDEBE2', fg: '#C92A2A' },
  { k: 'hub', label: 'Hub dispatch', stage: 'Preparing', q: 'Status 02 (goods available at hub) for over 14 days without dispatch', color: '#B7791F', bg: '#FDF3DC', fg: '#C92A2A' },
  { k: 'gl', label: 'Greenlight', stage: 'Preparing', q: 'Shipment waiting over 7 days for greenlight approval', color: '#F03E3E', bg: '#FDF3DC', fg: '#C92A2A' },
  { k: 'book', label: 'Freight booking', stage: 'Preparing', q: 'Greenlit but not uplifted over 7 days after ready', color: '#8A6D1F', bg: '#F6EFD9', fg: '#5E4A12' },
  { k: 'ship', label: 'Shipping', stage: 'In transit', q: 'ETA has passed and arrival not recorded', color: '#0A84FF', bg: '#E0F1F8', fg: '#0062CC' }
];

export const BNM = Object.fromEntries(BN.map(b => [b.k, b]));

export const WHO_ST = [
  ['00-Planned', '#C8B48A'],
  ['01-Sourced', '#B9A27A'],
  ['01b-Awating Pre-leg', '#E08A3C'],
  ['01c-At transit hub', '#6FB0D2'],
  ['01d-Sourced (at transit hub)', '#A38D63'],
  ['02-Goods Available at hub or supplier', '#F03E3E'],
  ['04-GL Requested (if needed)', '#E9B949'],
  ['06-Pending pre-alert request', '#C05621'],
  ['07-Pending Departure', '#E8590C'],
  ['08-Shipped', '#0A84FF'],
  ['09-Arrived', '#3DD68C'],
  ['09-Arrived (from transit hub)', '#7FE0AE'],
  ['10-Received', '#0FA958'],
  ['10-Received (from transit hub)', '#087F3B'],
  ['11-Canceled', '#8A97A3'],
  ['12-On Hold', '#7B5EA7'],
  ['oo-MIssing', '#B42318'],
  ['(empty)', '#C3CBD3']
].map(([k, color]) => ({ k, label: k, color }));

export const EBOLA_TAGS = new Set([
  'G013',
  'Ebola DRC',
  'Ebola UGA 25',
  'Ebola preparedness',
  'Ebola',
  'Ebola-Prep.',
  'Filovirus stock prepositioning',
  'Suspect VHF Burundi',
  'Marburg',
  'Marburg ETH'
]);

export const PRIORITY = ['UGA', 'SSD', 'RWA', 'BDI', 'TZA', 'KEN', 'CAF', 'COG', 'AGO', 'ZMB', 'NGA'];
export const BRIEF = ['COD', ...PRIORITY];
export const BRIEF_DEFAULT = 'UGA';

export const FLAGS = new Set([
  'AGO', 'BDI', 'BEN', 'BFA', 'BWA', 'CAF', 'CIV', 'CMR', 'COD', 'COG', 'COM', 'CPV',
  'DJI', 'DZA', 'EGY', 'ERI', 'ETH', 'GAB', 'GHA', 'GIN', 'GMB', 'GNB', 'GNQ', 'ITA',
  'KEN', 'LBR', 'LBY', 'LSO', 'MAR', 'MDG', 'MLI', 'MOZ', 'MRT', 'MUS', 'MWI', 'NAM',
  'NER', 'NGA', 'NPL', 'RWA', 'SDN', 'SEN', 'SLE', 'SOM', 'SSD', 'STP', 'SWZ', 'SYC',
  'TCD', 'TGO', 'TZA', 'UGA', 'ZAF', 'ZMB', 'ZWE'
]);

export const flagUrl = (iso: string) => (FLAGS.has(iso) ? '/flags/' + iso + '.png' : '');

export const DQ_LABEL: Record<string, string> = {
  tpl: 'Transporter',
  awb: 'AWB / BOL',
  from: 'Origin',
  to: 'Destination',
  mode: 'Mode',
  hub: 'HUB/Supplier',
  reg: 'Reg. no.',
  opr: 'OPR ref',
  po: 'Origin PO',
  rd: 'Request Date',
  poDate: 'PO creation date',
  ready: 'Last readiness',
  commit: 'Committed readiness',
  etd: 'ETD',
  eta: 'ETA',
  ata: 'ATA'
};

export const PF: Array<[string, string]> = [
  ['proj', 'Funding codes (PTAEO)'],
  ['po', 'PO number'],
  ['opr', 'OPR ref'],
  ['commit', 'Committed readiness'],
  ['ready', 'Last readiness'],
  ['tpl', 'Transporter'],
  ['mode', 'Transport mode'],
  ['awb', 'AWB / BOL'],
  ['etd', 'ETD'],
  ['eta', 'ETA'],
  ['ata', 'ATA'],
  ['rem', 'Remarks Supply']
];

export const WHO_KITS = 'WHO Standards Health Emergency Kits – Overview, August 2025';

export const KITF = [
  { f: 'TESK', name: 'Trauma and Emergency Surgery Kit (TESK) 2019', kind: 'p' },
  { f: 'IEHK', name: 'Interagency Emergency Health Kit (IEHK)', kind: 'c' },
  { f: 'NCDK', name: 'Non-communicable Diseases Kit (NCDK)', kind: 'c' },
  { f: 'MHK', name: 'Mental Health Kit (MHK) 2022', kind: 'c' },
  { f: 'CHO', name: 'Cholera kits 2020', kind: 'p' },
  { f: 'PED', name: 'Paediatric SAM kit (PED-SAM) 2020', kind: 'p' },
  { f: 'MEAS', name: 'Measles kit 2021', kind: 'p' },
  { f: 'PNEU', name: 'Pneumonia kit 2020', kind: 'p' },
  { f: 'CTT', name: 'Collection, testing & transfusion kit (CTT) 2021', kind: 'p' }
];

export const KITR = [
  { f: 'TESK', id: 'tesk', code: /^KMEDTESM1AB/, d: /tesk 2019.*set.*drugs, basic/i, per: 50, unit: 'hospitalized trauma patients', label: 'Set 1A1, drugs basic', basis: '1 kit (driven by set 1A1) = 50 hospitalized trauma patients, avg. two operations each', src: WHO_KITS + ', TESK 2019' },
  { f: 'IEHK', id: 'iehkB', code: /^KMEDIEHK(BMM1|24101)/, d: /iehk 20(17|24),? basic\)? (module, medicines$|unit, medicine and renewables)/i, per: 1000, unit: 'people for 3 months (primary care)', label: 'Basic medicines module / unit', basis: '1 basic module = outreach population of 1,000 people for 3 months', src: WHO_KITS + ', IEHK 2024 basic vs supplementary', main: 1 },
  { f: 'IEHK', id: 'iehkS', code: /^KMEDIEHK(SMM1|24201)/, d: /iehk 20(17|24),? supplementary\)?,? (module medicines|unit,? medecine,? oral|unit, medicine, oral)/i, per: 10000, unit: 'people for 3 months (hospital level)', label: 'Supplementary medicines module / oral unit', basis: '1 supplementary module = outreach population of 10,000 people for 3 months (hospital level; overlaps the basic-module population)', src: WHO_KITS + ', IEHK 2024 basic vs supplementary' },
  { f: 'IEHK', id: 'iehkMB', code: /^KMEDIEHK24102/, per: 510, unit: 'uncomplicated malaria cases', label: 'IEHK 2024 basic malaria unit (1.2)', basis: '1 basic malaria unit = 510 uncomplicated malaria cases (+ RDTs to screen 800)', src: WHO_KITS + ', malaria units IEHK 2024' },
  { f: 'IEHK', id: 'iehkMS', code: /^KMEDIEHK24206/, d: /iehk 2024 supplementary\) unit, malaria/i, per: 120, unit: 'severe malaria cases', label: 'IEHK 2024 supplementary malaria unit (2.6)', basis: '1 supplementary malaria unit = about 120 severe malaria cases (WHO medium of 166 children <20 kg or 75 patients >20 kg)', src: WHO_KITS + ', malaria units IEHK 2024' },
  { f: 'IEHK', id: 'iehkP', code: /^KMEDIEHK24207/, d: /iehk 2024 supplementary\) unit, medicine, pep/i, per: 61, unit: 'people given PEP', label: 'IEHK 2024 supplementary PEP unit (2.7)', basis: '1 PEP unit = 50 adults + 10 children 20–30 kg + 1 child <20 kg', src: WHO_KITS + ', PEP unit' },
  { f: 'IEHK', id: 'iehkP21', code: /^KMEDIEHKSMP5B/, per: 60, unit: 'people given PEP', label: 'IEHK 2021 supplementary PEP module', basis: 'As named in the item description: treatments for 50 adults + 10 children', src: 'Item description as recorded' },
  { f: 'NCDK', id: 'ncdM', code: /^KMEDNCD(1BM1|K2MM)/, per: 10000, unit: 'people for 3 months', label: 'Medicines module (NCDK 2016 1a / NCDK 2022 module 1)', basis: '1 medicines module = population of 10,000 people for about 3 months', src: WHO_KITS + ', NCDK 2022', main: 1 },
  { f: 'NCDK', id: 'ncdC', code: /^KMEDNCDK2MCC/, per: 100, unit: 'diabetic patients for 3 months', label: 'NCDK 2022 cold chain (insulin) module', basis: '1 cold chain module = about 100 diabetic patients for 3 months', src: WHO_KITS + ', NCDK 2022' },
  { f: 'MHK', id: 'mhk', code: /^KMEDMH22M1/, per: 10000, unit: 'people for 3 months', label: 'Module 1, medicines, PHC', basis: '1 kit = population of 10,000 for 3 months', src: WHO_KITS + ', MHK 2022', main: 1 },
  { f: 'CHO', id: 'choC', code: /^KMEDCHO(MA11|KA1-)/, d: /kit cholera central\) module, drugs/i, per: 100, unit: 'cholera cases (80 severe, 20 mild)', label: 'Central drugs module (1.1)', basis: '1 central module = 80 severe + 20 mild cases', src: WHO_KITS + ', cholera kits 2020' },
  { f: 'CHO', id: 'choP', code: /^KMEDCHO(MA21|KA2-)/, d: /kit cholera periphery\) module, drugs/i, per: 100, unit: 'cholera cases (60 severe, 40 mild)', label: 'Periphery drugs module (2.1)', basis: '1 peripheral module = 60 severe + 40 mild cases', src: WHO_KITS + ', cholera kits 2020' },
  { f: 'CHO', id: 'choM', code: /^KMEDCHO(MA31|KA3-)/, d: /kit cholera community\) module, drugs/i, per: 100, unit: 'mild cholera cases', label: 'Community drugs module (3.1)', basis: '1 community module = 100 mild cases', src: WHO_KITS + ', cholera kits 2020' },
  { f: 'CHO', id: 'choL', code: /^KMEDCHOKA4(20|--)/, per: 100, unit: 'laboratory confirmation tests', label: 'Cholera laboratory kit (4), complete', basis: '1 laboratory kit = 100 laboratory confirmation tests', src: WHO_KITS + ', cholera kits 2020' },
  { f: 'CHO', id: 'choI', code: /^KMEDCHO(KA5|K25050)/, per: 100, unit: 'suspected samples collected', label: 'Cholera investigation kit (5), complete', basis: '1 investigation kit = supplies to collect 100 samples', src: WHO_KITS + ', cholera kits 2020' },
  { f: 'PED', id: 'pedS', code: /^KMEDPEDSAMMS/, d: /ped-sam 2020\) module,? (1, )?medicines sam/i, per: 50, unit: 'children with SAM and medical complications', label: 'SAM module', basis: '1 SAM module = 50 SAM children (inpatient)', src: WHO_KITS + ', PED-SAM 2020', main: 1 },
  { f: 'PED', id: 'pedO', code: /^KMEDPEDSAMMPO/, per: 200, unit: 'sick children (oral treatment)', label: 'Oral medicines module', basis: '1 oral module = about 200 children', src: WHO_KITS + ', PED-SAM 2020' },
  { f: 'PED', id: 'pedI', code: /^KMEDPEDSAMMPI/, per: 200, unit: 'sick children (oral + injectable)', label: 'Injectable medicines module', basis: '1 oral + injectable module = about 200 children (10-bed ward, 3 months, 4–6 day stay)', src: WHO_KITS + ', PED-SAM 2020' },
  { f: 'MEAS', id: 'measS', code: /^KMEDMEASL1MCC/, per: 50, unit: 'severe measles cases', label: 'Medicines, severe cases', basis: '1 severe-cases module = 50 severe cases (incl. SAM with complications)', src: WHO_KITS + ', measles kit 2021' },
  { f: 'MEAS', id: 'measM', code: /^KMEDMEASL1MMS/, per: 20, unit: 'mild measles cases', label: 'Medicines & supply, mild cases', basis: '1 mild-cases module = 20 mild cases', src: WHO_KITS + ', measles kit 2021' },
  { f: 'PNEU', id: 'pneu', code: /^KMEDPNEU(M1MM|MM2)/, d: /kit pne[un]+monia 100 cases\) module, med[ei]cines/i, per: 100, unit: 'pneumonia cases', label: 'Medicines module (1)', basis: '1 medicines module = 100 pneumonia cases', src: WHO_KITS + ', pneumonia kit 2020' },
  { f: 'CTT', id: 'ctt', code: /^KMEDCTTK5UM32/, per: 50, unit: 'transfusions', label: 'Submodule 3B, transfusion', basis: '1 kit = collect, test and transfuse 50 blood bags', src: WHO_KITS + ', CTT kit 2021' }
];

export const KIT_ANY = /^KMED(TES|T25|IEHK|NCD|MH22|CHO|PEDSAM|MEAS|PNEU|CTT|TR25)/;
export const KIT_PEOPLE = new Set(['iehkB', 'iehkS', 'ncdM', 'mhk']);
export const KIT_TESTS = new Set(['choL', 'choI']);

export const kitRule = (l: { desc?: string; code?: string }) => {
  const d = (l.desc || '').trim();
  if (/cholera (2025 )?investigation \(5\).*complete/i.test(d)) return KITR.find(k => k.id === 'choI');
  if (/cholera laboratory \(4\).*complete/i.test(d)) return /box\s*2/i.test(d) ? null : KITR.find(k => k.id === 'choL');
  return KITR.find(k => (l.code ? k.code.test(l.code) : k.d && k.d.test(d)));
};
