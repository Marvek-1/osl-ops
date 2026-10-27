export interface LineItem {
  i?: number;
  c: string;
  or: string;
  ref: string;
  amt: number;
  qty: number;
  each?: number;
  unit: number;
  desc: string;
  code: string;
  uom: string;
  cat?: string;
  ess?: string;
  hub: string;
  src: string;
  type?: string;
  st: string;
  stRaw?: string;
  rd?: string | null;
  poDate?: string | null;
  ready?: string | null;
  commit?: string | null;
  etd?: string | null;
  eta?: string | null;
  ata?: string | null;
  eta2?: string | null;
  mode?: string;
  tpl?: string;
  awb?: string;
  from?: string;
  to?: string;
  reg?: string;
  opr?: string;
  po?: string;
  proj?: string;
  task?: string;
  award?: string;
  donor?: string;
  awardEnd?: string;
  pi?: string;
  em?: string;
  rem?: string;
  sup?: boolean;
  fl?: Record<string, string>;
  badDates?: Record<string, string>;
  ship?: Shipment;
  j?: Journey;
  t?: 'or' | 'sr';
  okey?: string;
}

export interface Shipment {
  ref: string;
  lines: LineItem[];
  st: string;
  src: string;
  hub: string;
  value: number;
  ready: string | null;
  etd: string | null;
  eta: string | null;
  ata: string | null;
  mode: string;
  tpl: string;
  awb: string;
  from: string;
  to: string;
  reg: string;
  opr: string;
  poDate: string | null;
  x: {
    kg?: number | string;
    cbm?: number | string;
    temp?: string;
    parcels?: string | number;
    st2?: string;
  };
}

export interface Order {
  key: string;
  id: string;
  t: 'or' | 'sr';
  c: string;
  cname: string;
  rd: string | null;
  lines: LineItem[];
  value: number;
  byStage: Record<string, number>;
  delivered: number;
  pct: number;
  stage: string;
  shipments: Shipment[];
  issues: Issue[];
  sev: number;
  srcs: string[];
  text: string;
}

export interface Issue {
  ref: string;
  sev: number;
  text: string;
}

export interface Journey {
  g: 'pending' | 'processing' | 'transit' | 'delivered' | 'canceled';
  label: string;
  detail: string;
  delayed?: boolean;
  delayText?: string;
  bn?: string;
  bnWho?: string;
  bnDays?: number | null;
}

export interface CountryInfo {
  iso: string;
  name: string;
  id?: number;
}

export interface Dataset {
  today: string;
  asOf?: string;
  countries: CountryInfo[];
  cn: Record<string, CountryInfo>;
  orders: Order[];
  lines: LineItem[];
  ships?: Record<string, any>;
  ems: Array<{ k: string; n: number }>;
  allLines?: LineItem[];
  allCn?: Record<string, string>;
}

export interface CaseData {
  countries: Record<
    string,
    {
      confirmed: number;
      deaths: number;
      asOf: string;
      src: string;
      url: string;
      note?: string;
    }
  >;
}

export interface ImpactData {
  asOf: string;
  medLead: number;
  staffPerBed: number;
  countries: Array<{ iso: string; name: string; popM: number }>;
  fam: Array<{
    id: string;
    label: string;
    group: string;
    pm?: number;
    pb?: number;
    per?: number;
    out?: string;
    unit: string;
    assumed?: number;
  }>;
  lines: any[];
  kits?: Array<{
    id: string;
    label: string;
    per: number;
    unit: string;
    kind: string;
    src: string;
    grp: string;
  }>;
}

export interface ParkingLotData {
  updated?: string;
  imports?: Array<{
    date: string;
    before: { lines: number; value: number };
    after: { lines: number; value: number };
    files: Array<{
      file: string;
      role: string;
      scope?: string;
      rows: number;
      matched?: number;
      added?: number;
      replaced?: number;
      consolidated?: number;
      fileValue?: number;
      dsValue?: number;
      result: string;
      note?: string;
      addedBy?: Array<{ or: string; country: string; n: number; value: number }>;
      uploadedAs?: string;
      flagged?: number;
    }>;
    fills?: Array<{ field: string; n: number }>;
  }>;
  issues?: Array<{
    sn?: number;
    date: string;
    file: string;
    field: string;
    v: string;
    why: string;
    n: number;
    refs?: string;
  }>;
  reference?: Array<{
    date: string;
    source: string;
    filters: string;
    figures: Array<[string, string, string]>;
  }>;
}

export interface SourceItem {
  id: string;
  ds: string;
  name: string;
  role: string;
  url: string;
  status?: string;
  mod?: string;
  rows?: number;
  value?: number | null;
  head?: string[];
  filters?: string;
}

export type TabId =
  | 'visuals'
  | 'countries'
  | 'lines'
  | 'ships'
  | 'proc'
  | 'critical'
  | 'fulfil'
  | 'backorders'
  | 'impact'
  | 'glossary'
  | 'parking'
  | 'schema';

export type ViewMode = 'brief' | 'ops';
