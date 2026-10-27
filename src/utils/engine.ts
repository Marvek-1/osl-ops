import {
  STG,
  CANC,
  SI,
  NR,
  SG,
  SRC,
  SRC_ORDER,
  SRC_DEFS,
  SEV,
  MON,
  TYPE,
  GRP,
  GM,
  BN,
  BNM,
  WHO_ST,
  EBOLA_TAGS,
  PRIORITY,
  FLAGS,
  flagUrl,
  PF
} from './constants';
import type { LineItem, Order, Shipment, Journey, Dataset } from '../types';

export const fd = (d?: string | null): string => {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length < 3) return d;
  const [y, m, dd] = parts;
  const t = +dd + ' ' + MON[+m - 1] + ' ' + y;
  return +y < 1901 ? 'Inconsistent (recorded as ' + t + ')' : t;
};

export const days = (a: string, b: string): number => {
  return Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
};

export const fmt$ = (v: number): string => {
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e4) return '$' + Math.round(v / 1e3) + 'K';
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
  return '$' + Math.round(v).toLocaleString('en-US');
};

export const fmtN = (v: number): string => {
  return Math.round(v).toLocaleString('en-US');
};

export const pct = (a: number, b: number): string => {
  return b ? Math.round((a / b) * 100) + '%' : '—';
};

export const plural = (n: number, w: string): string => {
  return n + ' ' + (n === 1 ? w : w.endsWith('y') ? w.slice(0, -1) + 'ies' : w + 's');
};

export const sum = <T>(a: T[], f: (x: T) => number): number => {
  return a.reduce((s, x) => s + f(x), 0);
};

export const segs = (
  map: Record<string, number>,
  total: number,
  defs: Array<{ k: string; label: string; color: string }>
) => {
  return defs
    .filter(d => (map[d.k] || 0) > 0)
    .map(d => ({
      label: d.label + ' · ' + fmt$(map[d.k]),
      w: ((map[d.k] / (total || 1)) * 100) + '%',
      color: d.color
    }));
};

export const top = <T>(arr: T[], f: (x: T) => string): string => {
  const m: Record<string, number> = {};
  arr.forEach(x => {
    const k = f(x);
    m[k] = (m[k] || 0) + 1;
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
};

export const maxDate = (a: Array<string | null | undefined>): string | null => {
  return a.filter((x): x is string => !!x).sort().pop() || null;
};

export const minDate = (a: Array<string | null | undefined>): string | null => {
  return a.filter((x): x is string => !!x).sort()[0] || null;
};

export const typeOf = (or: string): 'or' | 'sr' => {
  return /^\s*[O0]R/i.test(or) ? 'or' : /SR/i.test(or) ? 'sr' : 'or';
};

export function refsOf(l: LineItem) {
  return {
    orRef: l.t === 'or' ? l.or : '',
    srRef: l.t === 'sr' ? l.or : /_SR_/i.test(l.ref || '') ? l.ref : '',
    poNum: l.po || ''
  };
}

export const AUDIT_RE =
  /supply monitoring updated|populated by sb|added based on|data update|sr\s*\w*\s*received|received \(afro\)|po created|^processed/i;

export function splitRem(rem?: string) {
  if (!rem) return { cause: [], audit: [] };
  const parts = rem
    .split(/\s+-\s+|\s*\|\s*|(?=\bAD\s?\d)|(?=\bAM\d)|(?=\bMA\d)|(?=Pick\s?:)/)
    .map(s => s.trim())
    .filter(Boolean);
  return {
    cause: parts.filter(p => !AUDIT_RE.test(p)),
    audit: parts.filter(p => AUDIT_RE.test(p))
  };
}

let SRC_FILL: Record<string, Record<string, number>> = {};
let SRC_FILL_SET = false;

export function buildFill(lines: LineItem[]) {
  const o: Record<string, any> = {};
  lines.forEach(l => {
    const a = (o[l.src] = o[l.src] || { n: 0 });
    a.n++;
    PF.forEach(([k]) => {
      if ((l as any)[k]) a[k] = (a[k] || 0) + 1;
    });
  });
  Object.values(o).forEach((a: any) =>
    PF.forEach(([k]) => {
      a[k] = (a[k] || 0) / a.n;
    })
  );
  return o;
}

export function evidence(l: LineItem, today: string): string {
  const s = l.ship || ({} as any);
  const raw = l.stRaw || '';
  const pick = (k: string) => (l as any)[k] || s[k] || '';
  const fill = SRC_FILL[l.src] || {};
  const since = l.ready || l.commit || l.poDate || l.rd;
  const nd = since ? days(since, today) : null;
  const sinceK = l.ready
    ? 'last readiness'
    : l.commit
    ? 'committed readiness'
    : l.poDate
    ? 'PO / stock request date'
    : 'request date';
  const F: Array<[string, string, (v: string) => string]> = [
    ['proj', 'Funding (PTAEO)', v => 'award ' + (l.award || v)],
    ['po', 'PO', v => v],
    ['commit', 'Committed readiness', v => fd(v)],
    ['ready', 'Last readiness', v => fd(v)],
    ['tpl', 'Transporter', v => v],
    ['mode', 'Mode', v => v],
    ['awb', 'AWB / BOL', v => v],
    ['etd', 'ETD', v => fd(v)],
    ['eta', 'ETA', v => fd(v)]
  ];
  const parts = F.filter(([k]) => pick(k) || (fill[k] ?? 0) >= 0.5).map(
    ([k, label, fn]) => label + ': ' + (pick(k) ? fn(pick(k)) : 'not available')
  );
  const sr = splitRem(l.rem);
  const bad = l.badDates
    ? Object.entries(l.badDates).map(([k, v]) => k + ': inconsistent (recorded as ' + v + ')')
    : [];
  return [
    raw ? 'WHO status ' + raw : 'WHO status: not available',
    ...bad,
    nd != null && nd >= 0 ? nd + ' days since ' + sinceK + ' (' + fd(since) + ')' : '',
    ...parts,
    'Supply remark: ' + (sr.cause.length ? '“' + sr.cause.join(' · ') + '”' : 'not available'),
    sr.audit.length ? 'Data-entry log: ' + sr.audit.join(' · ') : ''
  ]
    .filter(Boolean)
    .join(' · ');
}

export function journey0(l: LineItem, today: string): Journey {
  const s = l.ship || ({} as any);
  const n = (d?: string | null) => (d ? days(d, today) : null);
  const nr = n(l.ready);
  const since = nr != null && nr > 0 ? ' · ready since ' + fd(l.ready) + ' (' + nr + ' days)' : '';
  const rem = l.rem ? ' · Remark: ' + l.rem : '';
  if (l.st === 'planned') {
    const late = l.commit && l.commit < today;
    return {
      g: 'pending',
      label: /^oo/i.test(l.stRaw || '')
        ? 'Status missing'
        : /^12/.test(l.stRaw || '')
        ? 'On hold'
        : l.type === 'Procurement'
        ? 'Sourcing'
        : 'Planned',
      detail:
        (l.stRaw || 'Planned') +
        (l.type === 'Procurement'
          ? ' · supplier ' + (l.hub || 'not yet assigned') + (l.po ? ' · PO ' + l.po : '')
          : ' · ' + (l.hub || 'source not assigned')) +
        (l.commit ? ' · committed readiness ' + fd(l.commit) : '') +
        rem,
      delayed: !!late,
      delayText: late ? days(l.commit, today) + ' days past committed readiness' : '',
      bn: late ? 'proc' : '',
      bnWho: 'Procurement · ' + (l.hub || 'supplier'),
      bnDays: late ? days(l.commit, today) : null
    };
  }
  if (l.st === 'prelg')
    return {
      g: 'processing',
      label: 'Awaiting pre-leg',
      detail:
        'Ready at ' +
        (l.hub || (SRC[l.src] ? SRC[l.src].label : l.src)) +
        ', waiting for the first leg to the transit hub' +
        since +
        rem,
      delayed: nr != null && nr > 14,
      delayText: nr != null && nr > 14 ? nr + ' days since ready' : '',
      bn: nr != null && nr > 14 ? 'book' : '',
      bnWho: 'Pre-leg to transit hub · ' + (l.hub || ''),
      bnDays: nr
    };
  if (l.st === 'thub')
    return {
      g: 'transit',
      label: 'At transit hub',
      detail:
        'Arrived at the transit hub, awaiting the final leg to destination' +
        (l.awb && l.awb !== '0' ? ' · ' + l.awb : '') +
        rem
    };
  if (l.st === 'canceled')
    return {
      g: 'canceled',
      label: 'Canceled',
      detail: 'Line canceled on shipment ' + l.ref + rem
    };
  if (l.st === 'hub') {
    if (/pending.*arrival.*NBO/i.test(l.rem || ''))
      return {
        g: 'pending',
        label: 'Not available at hub',
        detail: 'Stock not yet in Nairobi hub, awaiting replenishment · ' + l.rem,
        delayed: true,
        delayText: 'Stock-out',
        bn: 'stock',
        bnWho: 'Hub replenishment (HQ / OSL)'
      };
    if (l.type === 'Procurement') {
      const late = nr != null && nr > 0;
      return {
        g: 'pending',
        label: 'In procurement',
        detail:
          'PO ' +
          (l.po || '—') +
          ' placed with ' +
          (l.hub || 'supplier') +
          (l.ready
            ? late
              ? ' · supplier readiness ' + fd(l.ready) + ' passed ' + nr + ' days ago'
              : ' · supplier readiness expected ' + fd(l.ready)
            : ' · readiness date not confirmed') +
          rem,
        delayed: late,
        delayText: late ? nr + ' days past readiness' : '',
        bn: late ? 'proc' : '',
        bnWho: 'Procurement · ' + (l.hub || 'supplier') + (l.po ? ' · PO ' + l.po : ''),
        bnDays: nr
      };
    }
    return {
      g: 'processing',
      label: 'Goods available at hub',
      detail:
        'At ' +
        (SRC[l.src] ? SRC[l.src].label : l.src) +
        ' (' +
        (l.hub || '—') +
        '), awaiting dispatch' +
        since +
        rem,
      delayed: nr != null && nr > 14,
      delayText: nr != null && nr > 14 ? nr + ' days at hub' : '',
      bn: nr != null && nr > 14 ? 'hub' : '',
      bnWho: (l.hub || (SRC[l.src] ? SRC[l.src].label : l.src)) + ' warehouse',
      bnDays: nr
    };
  }
  if (l.st === 'gl')
    return {
      g: 'pending',
      label: 'Awaiting greenlight',
      detail: 'Greenlight requested for shipment ' + l.ref + ', not yet approved' + since + rem,
      delayed: nr != null && nr > 7,
      delayText: nr != null && nr > 7 ? nr + ' days waiting' : '',
      bn: nr != null && nr > 7 ? 'gl' : '',
      bnWho: 'Greenlight approver · shipment ' + l.ref,
      bnDays: nr
    };
  if (l.st === 'depart')
    return {
      g: 'processing',
      label: 'Pending departure',
      detail:
        'Greenlight cleared, booked ' +
        [s.mode, s.tpl && 'with ' + s.tpl].filter(Boolean).join(' ') +
        ', awaiting uplift' +
        since +
        rem,
      delayed: nr != null && nr > 7,
      delayText: nr != null && nr > 7 ? nr + ' days since ready' : '',
      bn: nr != null && nr > 7 ? 'book' : '',
      bnWho: (s.tpl || 'Freight forwarder') + (s.mode ? ' · ' + s.mode : ''),
      bnDays: nr
    };
  const via = [s.mode, s.tpl && 'via ' + s.tpl, s.awb && 'AWB ' + s.awb].filter(Boolean).join(' · ');
  if (l.st === 'transit') {
    const late = s.eta && s.eta < today;
    return {
      g: 'transit',
      label: 'Shipped',
      detail:
        (s.etd ? 'Departed ' + fd(s.etd) + ' · ' : '') +
        (via || 'transport details not recorded') +
        (s.eta ? ' · ETA ' + fd(s.eta) : '') +
        rem,
      delayed: !!late,
      delayText: late ? 'ETA passed ' + days(s.eta, today) + ' days ago' : '',
      bn: late ? 'ship' : '',
      bnWho: (s.tpl || 'Carrier') + (s.awb ? ' · AWB ' + s.awb : ''),
      bnDays: late ? days(s.eta, today) : null
    };
  }
  if (l.st === 'arrived')
    return {
      g: 'delivered',
      label: 'Arrived',
      detail: 'Arrived ' + fd(s.ata) + (via ? ' · ' + via : '') + ' · receipt (POD) not yet confirmed' + rem
    };
  return {
    g: 'delivered',
    label: 'Received',
    detail: 'Received in country' + (s.ata ? ' · arrived ' + fd(s.ata) : '') + (via ? ' · ' + via : '') + rem
  };
}

export function journey(l: LineItem, today: string): Journey {
  const j = journey0(l, today);
  return /^(09|10|11)/.test(l.stRaw || '') ? j : { ...j, detail: evidence(l, today) };
}

export function liveChecks(lines: LineItem[]) {
  const out: Array<{ rule: string; field: string; lines: LineItem[] }> = [];
  const add = (
    rule: string,
    field: string,
    ls: LineItem[],
    cols: string[] | ((l: LineItem) => string[])
  ) => {
    if (!ls.length) return;
    ls.forEach(l => {
      const ks = typeof cols === 'function' ? cols(l) : cols;
      l.fl = l.fl || {};
      ks.forEach(k => {
        l.fl![k] = l.fl![k] || rule;
      });
    });
    out.push({ rule, field, lines: ls });
  };
  const DK = ['rd', 'poDate', 'ready', 'commit', 'etd', 'eta', 'ata'];
  add(
    'Line recorded in an earlier export and not in the latest export (kept as recorded, excluded from totals)',
    'All fields',
    lines.filter(l => l.sup),
    ['*']
  );
  const L0 = lines.filter(l => !l.sup);
  const g = new Map<string, LineItem[]>();
  L0.forEach(l => {
    const k = JSON.stringify({ ...l, fl: undefined });
    (g.get(k) || g.set(k, []).get(k)!).push(l);
  });
  add(
    'Line recorded more than once with identical values in every field (kept as recorded)',
    'All fields',
    [...g.values()].filter(a => a.length > 1).flat(),
    ['*']
  );
  add(
    'Quantity × unit value differs from line amount by more than 1%',
    'PO Line Amount',
    L0.filter(
      l =>
        l.qty > 0 &&
        l.unit > 0 &&
        Math.abs(l.qty * l.unit - l.amt) > Math.max(1, l.amt * 0.01)
    ),
    ['amt', 'qty']
  );
  add(
    'Line amount recorded as 0 with a quantity ordered (not canceled)',
    'PO Line Amount',
    L0.filter(l => l.qty > 0 && !l.amt && l.st !== 'canceled'),
    ['amt']
  );
  add(
    'Quantity recorded as 0 with a line amount',
    'Quantity Ordered',
    L0.filter(l => !l.qty && l.amt > 0),
    ['qty']
  );
  add(
    'Arrival date (ATA) earlier than request date',
    'ATA',
    L0.filter(l => l.ata && l.rd && l.ata < l.rd),
    ['eta', 'rd']
  );
  add(
    'Departure date (ETD) later than arrival date (ATA)',
    'ETD',
    L0.filter(l => l.etd && l.ata && l.etd > l.ata),
    ['eta', 'etd']
  );
  add(
    'Arrival date (ATA) recorded while status is not Arrived or Received',
    'WHO Shipping Status',
    L0.filter(l => l.ata && !['arrived', 'received', 'canceled'].includes(l.st)),
    ['eta', 'st']
  );
  const cg: Record<string, Record<string, number>> = {};
  L0.forEach(l => {
    if (l.cat) {
      const k = l.cat
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace(/(.)\1+/g, '$1');
      (cg[k] = cg[k] || {})[l.cat] = 1;
    }
  });
  Object.values(cg)
    .filter(m => Object.keys(m).length > 1)
    .forEach(m => {
      const ks = Object.keys(m);
      add(
        'Category recorded under more than one spelling: ' + ks.join(' / '),
        'Requested Category',
        L0.filter(l => l.cat && ks.includes(l.cat)),
        ['cat']
      );
    });
  add(
    'Transport document number recorded as 0',
    'AWB / BOL',
    L0.filter(l => String(l.awb).trim() === '0'),
    ['awb']
  );
  add(
    'Transporter recorded as 0',
    'Transporter (3PL)',
    L0.filter(l => String(l.tpl).trim() === '0'),
    ['tpl']
  );
  add(
    'ETA2 recorded on a line already Arrived or Received (kept as recorded, not used in calculations)',
    'ETA2',
    L0.filter(l => l.eta2 && (l.st === 'arrived' || l.st === 'received')),
    ['eta']
  );
  add(
    'Date recorded before 1901',
    'Dates',
    L0.filter(l => DK.some(k => (l as any)[k] && +(l as any)[k].slice(0, 4) < 1901)),
    l => DK.filter(k => (l as any)[k] && +(l as any)[k].slice(0, 4) < 1901)
  );
  return out;
}

export const emLabel = (k: string) =>
  k === 'G013' ? '2026-G013 DRC Ituri Ebola Bundibugyo' : k;

export const emPass = (l: LineItem, em?: string) =>
  !em || em === 'G013'
    ? l.em === 'G013'
    : em === 'all'
    ? true
    : em === 'ebola'
    ? EBOLA_TAGS.has(l.em || '')
    : l.em === em;

export interface EngineFilters {
  country?: string;
  src?: string;
  em?: string;
  type?: string;
  stage?: string;
  q?: string;
  dFrom?: string;
  dTo?: string;
  issuesOnly?: boolean;
}

export function filterLines(lines: LineItem[], f: EngineFilters): LineItem[] {
  const qLower = (f.q || '').trim().toLowerCase();
  return lines.filter(l => {
    if (f.country && l.c !== f.country) return false;
    if (f.src && l.src !== f.src) return false;
    if (f.type && l.t !== f.type) return false;
    if (f.stage && (l.stRaw || '').trim() !== f.stage && l.st !== f.stage) return false;
    if (f.em && !emPass(l, f.em)) return false;
    if (f.dFrom && l.rd && l.rd < f.dFrom) return false;
    if (f.dTo && l.rd && l.rd > f.dTo) return false;
    if (f.issuesOnly && !(l.j && l.j.delayed)) return false;
    if (qLower) {
      const match =
        (l.desc || '').toLowerCase().includes(qLower) ||
        (l.code || '').toLowerCase().includes(qLower) ||
        (l.or || '').toLowerCase().includes(qLower) ||
        (l.ref || '').toLowerCase().includes(qLower) ||
        (l.po || '').toLowerCase().includes(qLower) ||
        (l.hub || '').toLowerCase().includes(qLower) ||
        (l.c || '').toLowerCase().includes(qLower);
      if (!match) return false;
    }
    return true;
  });
}

export function buildProcessedData(raw0: any, filteredLines?: LineItem[]): Dataset {
  const target = filteredLines ? { ...raw0, lines: filteredLines } : raw0;
  return build(target, '*');
}

export function build(raw0: any, pri?: string[] | '*'): Dataset {
  const ALL = pri === '*';
  const P = new Set(pri && pri.length && !ALL ? pri : PRIORITY);
  const raw = {
    ...raw0,
    countries: (raw0.countries || []).filter((c: any) => ALL || P.has(c.iso)),
    lines: (raw0.lines || []).filter((l: any) => ALL || P.has(l.c))
  };

  raw0.lines.forEach((l: any) => {
    ['tpl', 'awb', 'from', 'to', 'mode', 'hub', 'reg', 'opr', 'po'].forEach(k => {
      const v = l[k];
      if (
        v &&
        typeof v === 'string' &&
        !/^Inconsistent/.test(v) &&
        (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(v.trim()) || /\b1899\b/.test(v))
      ) {
        l[k] = 'Inconsistent (recorded as ' + v.trim() + ')';
      }
    });
  });

  raw0.lines.forEach((l: any) => {
    ['rd', 'poDate', 'ready', 'commit', 'etd', 'eta', 'ata'].forEach(k => {
      const v = l[k];
      if (
        v &&
        (!/^\d{4}-\d{2}-\d{2}/.test(v) ||
          +v.slice(0, 4) < 2015 ||
          +v.slice(0, 4) > 2030)
      ) {
        (l.badDates = l.badDates || {})[k] = v;
        l[k] = null;
      }
    });
  });

  if (!SRC_FILL_SET) {
    SRC_FILL = buildFill(raw0.lines);
    SRC_FILL_SET = true;
  }

  const today = raw.asOf || '2026-10-22';
  const cn: Record<string, any> = Object.fromEntries(
    raw.countries.map((c: any) => [c.iso, c])
  );
  const om: Record<string, LineItem[]> = {};
  raw.lines.forEach((l: LineItem, i: number) => {
    l.i = i;
    l.t = typeOf(l.or);
    l.okey = l.c + '|' + l.or;
    (om[l.okey] = om[l.okey] || []).push(l);
  });

  const orders: Order[] = Object.entries(om).map(([key, ls]) => {
    const live = ls.filter(l => l.st !== 'canceled');
    const value = sum(live, l => l.amt);
    const byStage: Record<string, number> = {};
    ls.forEach(l => {
      byStage[l.st] = (byStage[l.st] || 0) + l.amt;
    });
    const delivered = (byStage.arrived || 0) + (byStage.received || 0);
    const minIdx = live.length ? Math.min(...live.map(l => SI[l.st])) : -1;
    const sm: Record<string, LineItem[]> = {};
    ls.forEach(l => {
      (sm[l.ref] = sm[l.ref] || []).push(l);
    });

    const shipments: Shipment[] = Object.entries(sm)
      .map(([ref, sl]) => {
        const sLive = sl.filter(l => l.st !== 'canceled');
        const st = sLive.length
          ? STG[Math.min(...sLive.map(l => SI[l.st]))].k
          : 'canceled';
        const x = (raw.ships && raw.ships[ref]) || {};
        const pick = (f: keyof LineItem) =>
          ((sl.find(l => l[f]) || {}) as any)[f] || '';
        return {
          ref,
          lines: sl,
          st,
          src: top(sl, l => l.src),
          hub: top(sl, l => l.hub),
          value: sum(sLive, l => l.amt),
          ready: maxDate(sl.map(l => l.ready)) || x.lastReady || null,
          etd: maxDate(sl.map(l => l.etd)),
          eta: maxDate(sl.map(l => l.eta)) || x.etaata || null,
          ata:
            st === 'arrived' || st === 'received'
              ? maxDate(sl.map(l => l.ata)) || x.etaata
              : null,
          mode: pick('mode'),
          tpl: pick('tpl'),
          awb: pick('awb'),
          from: pick('from'),
          to: pick('to'),
          reg: pick('reg'),
          opr: pick('opr'),
          x,
          poDate: minDate(sl.map(l => l.poDate))
        };
      })
      .sort((a, b) => (SI[a.st] ?? 9) - (SI[b.st] ?? 9) || b.value - a.value);

    shipments.forEach(s =>
      s.lines.forEach(l => {
        l.ship = s;
        l.j = journey(l, today);
      })
    );

    const issues: Array<{ ref: string; sev: number; text: string }> = [];
    shipments.forEach(s => {
      const n = s.ready ? days(s.ready, today) : null;
      const since =
        n != null && n > 0 ? ' · ready since ' + fd(s.ready) + ' (' + n + ' days)' : '';
      if (s.st === 'planned') {
        issues.push({
          ref: s.ref,
          sev: 1,
          text: 'Planned / sourcing · not yet available at hub or supplier'
        });
      } else if (s.st === 'prelg') {
        issues.push({
          ref: s.ref,
          sev: n != null && n > 14 ? 2 : 1,
          text: 'Awaiting pre-leg to transit hub' + since
        });
      } else if (s.st === 'thub') {
        issues.push({
          ref: s.ref,
          sev: 0,
          text: 'At transit hub, awaiting final leg'
        });
      } else if (s.st === 'hub') {
        if (s.src === 'proc') {
          issues.push({
            ref: s.ref,
            sev: n != null && n > 0 ? 2 : 1,
            text:
              'With supplier ' +
              s.hub +
              (s.ready
                ? n > 0
                  ? ' · readiness date ' + fd(s.ready) + ' passed ' + n + ' days ago'
                  : ' · readiness expected ' + fd(s.ready)
                : ' · no readiness date')
          });
        } else {
          issues.push({
            ref: s.ref,
            sev: n != null && n > 14 ? 2 : 1,
            text:
              'Picked at ' +
              (SRC[s.src] ? SRC[s.src].label : s.src) +
              ', not yet dispatched' +
              since
          });
        }
      } else if (s.st === 'gl') {
        issues.push({
          ref: s.ref,
          sev: n != null && n > 7 ? 2 : 1,
          text: 'Greenlight requested, awaiting approval' + since
        });
      } else if (s.st === 'depart') {
        issues.push({
          ref: s.ref,
          sev: n != null && n > 7 ? 2 : 1,
          text: 'Cleared, pending departure' + since
        });
      } else if (s.st === 'transit') {
        if (s.eta && s.eta < today) {
          issues.push({
            ref: s.ref,
            sev: 2,
            text:
              'In transit · ETA ' +
              fd(s.eta) +
              ' passed ' +
              days(s.eta, today) +
              ' days ago, arrival not confirmed'
          });
        } else if (!s.awb) {
          issues.push({
            ref: s.ref,
            sev: 1,
            text: 'In transit · no transport document (AWB/BOL) recorded'
          });
        }
      } else if (s.st === 'arrived') {
        issues.push({
          ref: s.ref,
          sev: 0,
          text: 'Arrived ' + fd(s.ata) + ' · receipt (POD) not yet confirmed'
        });
      }

      const sLiveLines = s.lines.filter(l => !/^(09|10|11)/.test(l.stRaw || ''));
      const rep = sLiveLines.slice().sort((a, b) => (SI[a.st] ?? 9) - (SI[b.st] ?? 9))[0];
      const last = issues[issues.length - 1];
      if (rep && last && last.ref === s.ref && s.st !== 'arrived') {
        last.text =
          evidence(rep, today) +
          (sLiveLines.length > 1 && new Set(sLiveLines.map(l => l.stRaw)).size > 1
            ? ' · lines in this shipment are at ' +
              new Set(sLiveLines.map(l => l.stRaw)).size +
              ' different statuses'
            : '');
      } else if (rep && !(last && last.ref === s.ref)) {
        issues.push({ ref: s.ref, sev: 1, text: evidence(rep, today) });
      }

      const canc = s.lines.filter(l => l.st === 'canceled');
      if (canc.length) {
        issues.push({
          ref: s.ref,
          sev: 0,
          text: plural(canc.length, 'line') + ' canceled · ' + fmt$(sum(canc, l => l.amt))
        });
      }

      [...new Set(s.lines.flatMap(l => splitRem(l.rem).cause))]
        .filter(r => !(rep && splitRem(rep.rem).cause.includes(r)))
        .forEach(r =>
          issues.push({ ref: s.ref, sev: 0, text: 'Supply note: ' + r })
        );
    });

    issues.sort((a, b) => b.sev - a.sev);
    const srcVal: Record<string, number> = {};
    live.forEach(l => {
      srcVal[l.src] = (srcVal[l.src] || 0) + l.amt;
    });

    const cname = cn[ls[0].c] ? cn[ls[0].c].name : ls[0].c;

    return {
      key,
      id: ls[0].or,
      t: typeOf(ls[0].or),
      c: ls[0].c,
      cname,
      rd: minDate(ls.map(l => l.rd)),
      lines: ls,
      value,
      byStage,
      delivered,
      pct: value ? delivered / value : 0,
      stage: minIdx >= 0 ? STG[minIdx].k : 'canceled',
      shipments,
      issues,
      sev: issues.length ? issues[0].sev : -1,
      srcs: SRC_ORDER.filter(k => (srcVal[k] || 0) > 0).sort(
        (a, b) => (srcVal[b] || 0) - (srcVal[a] || 0)
      ),
      text: [
        ls[0].or,
        ...shipments.map(s => s.ref + ' ' + s.awb + ' ' + s.opr),
        ...ls.map(l => l.desc + ' ' + l.code + ' ' + l.po + ' ' + l.ess)
      ]
        .join(' ')
        .toLowerCase()
    };
  });

  return {
    today,
    asOf: today,
    countries: raw.countries,
    cn,
    orders,
    lines: raw.lines,
    ships: raw.ships,
    ems: raw0.ems || [],
    allLines: raw0.lines,
    allCn: Object.fromEntries(raw0.countries.map((c: any) => [c.iso, c.name]))
  };
}
