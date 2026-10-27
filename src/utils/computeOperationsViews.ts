import {
  Dataset,
  CaseData,
  ImpactData,
  ParkingLotData,
  LineItem,
  Order,
  Shipment
} from '../types';
import {
  STG,
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
  PRIORITY,
  flagUrl,
  PF,
  KITF,
  KITR,
  KIT_PEOPLE,
  KIT_TESTS,
  KIT_ANY,
  kitRule
} from './constants';
import {
  fd,
  days,
  fmt$,
  fmtN,
  pct,
  plural,
  sum,
  typeOf,
  refsOf,
  splitRem,
  top,
  minDate,
  maxDate
} from './engine';

export function computeOperationsViews(
  data: Dataset,
  cases: CaseData,
  impact: ImpactData,
  parking: ParkingLotData,
  handlers: {
    onSelectOrder?: (key: string) => void;
    onSelectLine?: (idx: number) => void;
    onSelectCountry?: (iso: string) => void;
  },
  state: {
    country?: string;
    page?: number;
    lsort?: string;
    ldir?: number;
    ssort?: string;
    sdir?: number;
    bnF?: string;
    grp?: string;
    reqF?: string;
    dOnly?: boolean;
    critOpen?: string;
    fuDim?: 'value' | 'qty';
    fuSort?: 'gap' | 'rate' | 'req';
    fuQ?: string;
    boC?: string;
    boS?: string;
    boQ?: string;
    boI?: string;
    boLim?: number;
    pf?: string;
    pty?: string;
    preq?: string;
    pmet?: 'v' | 'n';
    ptm?: 'cum' | 'wk';
  } = {}
) {
  const T = data.today || '2026-10-22';
  const L = data.lines;
  const live = L.filter(l => l.st !== 'canceled');
  const tot = sum(live, l => l.amt);
  const cn = data.cn;

  // Bucketing helper
  const BK = [
    { k: 'sourcing', label: 'Sourcing', sub: 'With a supplier (procurement) or not yet in hub stock', color: '#E8590C', bg: '#FDEBE2', fg: '#C92A2A' },
    { k: 'preparing', label: 'Preparing to ship', sub: 'Status 02–07: goods available, greenlight, pre-alert or pending departure', color: '#F03E3E', bg: '#FDF3DC', fg: '#C92A2A' },
    { k: 'transit', label: 'In transit', sub: 'Shipped and on the way', color: '#0A84FF', bg: '#E0F1F8', fg: '#0062CC' },
    { k: 'delivered', label: 'Delivered', sub: 'Arrived or received in country', color: '#0FA958', bg: '#D3EBDD', fg: '#087F3B' }
  ];
  const BKM = Object.fromEntries(BK.map(b => [b.k, b]));

  const bucket = (l: LineItem) =>
    l.st === 'canceled'
      ? 'canceled'
      : l.st === 'arrived' || l.st === 'received'
      ? 'delivered'
      : l.st === 'transit' || l.st === 'thub'
      ? 'transit'
      : l.st === 'planned' || (l.st === 'hub' && (l.type === 'Procurement' || l.j?.label === 'Not available at hub'))
      ? 'sourcing'
      : 'preparing';

  const bAgg = (ls: LineItem[]) => {
    const m: Record<string, { v: number; n: number; ls: LineItem[] }> = {};
    ls.forEach(l => {
      const b = bucket(l);
      const a = (m[b] = m[b] || { v: 0, n: 0, ls: [] });
      a.v += l.amt;
      a.n++;
      a.ls.push(l);
    });
    return m;
  };

  const bSegs = (m: Record<string, { v: number }>, t: number) =>
    BK.filter(b => m[b.k]).map(b => ({
      label: b.label + ' · ' + fmt$(m[b.k].v),
      w: ((m[b.k].v / (t || 1)) * 100) + '%',
      color: b.color
    }));

  const itemName = (l: LineItem) => (l.ess || l.desc.split(',')[0]).replace(/\s+/g, ' ');

  // 1. Overview (ov)
  const ovLive = L.filter(l => l.st !== 'canceled');
  const ovT = sum(ovLive, l => l.amt);
  const ovM = bAgg(L);
  const ovKeys = Array.from(new Set(L.map(l => l.okey)));
  const ovSR = ovKeys.filter(k => k && typeOf(k.slice(k.indexOf('|') + 1)) === 'sr').length;
  const delayedL = L.filter(l => l.j?.delayed);
  const glL = ovLive.filter(l => l.st === 'gl');
  const soL = ovLive.filter(l => l.j?.label === 'Not available at hub');

  // Sankey links
  const sk = (() => {
    const W = 760, Hh = 300, Gp = 16, x0 = 186, nw = 14, x1 = 560;
    const sv: Record<string, number> = {}, bv: Record<string, number> = {}, lk: Record<string, number> = {};
    ovLive.forEach(l => {
      const b = bucket(l);
      sv[l.src] = (sv[l.src] || 0) + l.amt;
      bv[b] = (bv[b] || 0) + l.amt;
      lk[l.src + '|' + b] = (lk[l.src + '|' + b] || 0) + l.amt;
    });
    const S = SRC_ORDER.filter(k => sv[k]).sort((a, b) => sv[b] - sv[a]);
    const B = BK.map(b => b.k).filter(k => bv[k]);
    const tt = sum(S, k => sv[k]) || 1;
    const kk = Math.min((Hh - Gp * (S.length - 1)) / tt, (Hh - Gp * (B.length - 1)) / tt);
    const sOff = (Hh - (tt * kk + Gp * (S.length - 1))) / 2;
    const bOff = (Hh - (tt * kk + Gp * (B.length - 1))) / 2;
    const sy: Record<string, number> = {}, by: Record<string, number> = {};
    let y = sOff;
    S.forEach(k => { sy[k] = y; y += sv[k] * kk + Gp; });
    y = bOff;
    B.forEach(k => { by[k] = y; y += bv[k] * kk + Gp; });
    const so = { ...sy }, boL = { ...by }, links: any[] = [];
    S.forEach(sk2 => {
      B.forEach(b => {
        const v = lk[sk2 + '|' + b];
        if (!v) return;
        const t = v * kk, ya = so[sk2], yb = boL[b];
        so[sk2] += t; boL[b] += t;
        const xa = x0 + nw, xm = (xa + x1) / 2;
        links.push({
          d: `M${xa},${ya} C${xm},${ya} ${xm},${yb} ${x1},${yb} L${x1},${yb + t} C${xm},${yb + t} ${xm},${ya + t} ${xa},${ya + t} Z`,
          fill: BKM[b].color,
          title: `${SRC[sk2]?.label || sk2} → ${BKM[b].label}: ${fmt$(v)}`
        });
      });
    });
    const node = (x: number, yy: number, v: number, color: string, label: string, anchor: string, tx: number) => {
      const h = Math.max(3, v * kk);
      return {
        x, y: yy, h, color, label, value: fmt$(v),
        right: ((W - tx) / W * 100) + '%',
        left: (tx / W * 100) + '%',
        top: ((yy + h / 2) / Hh * 100) + '%'
      };
    };
    return {
      vb: '0 0 ' + W + ' ' + Hh,
      links,
      l: S.map(k => node(x0, sy[k], sv[k], SRC[k]?.color || '#0071B8', SRC[k]?.label || k, 'end', x0 - 10)),
      r: B.map(k => node(x1, by[k], bv[k], BKM[k].color, BKM[k].label, 'start', x1 + 24))
    };
  })();

  const bnF = state.bnF || '';
  const bnAgg: Record<string, { n: number; v: number; o: Set<string> }> = {};
  delayedL.forEach(l => {
    const k = l.j?.bn || 'ship';
    const a = (bnAgg[k] = bnAgg[k] || { n: 0, v: 0, o: new Set() });
    a.n++;
    a.v += l.amt;
    if (l.okey) a.o.add(l.okey);
  });
  const bnMaxV = Math.max(1, ...Object.values(bnAgg).map(a => a.v));
  const bnCards = BN.filter(b => bnAgg[b.k]).sort((a, b) => bnAgg[b.k].v - bnAgg[a.k].v).map(b => {
    const a = bnAgg[b.k], on = bnF === b.k;
    return {
      label: b.label, stage: b.stage, q: b.q, color: b.color, value: fmt$(a.v),
      n: plural(a.n, 'item') + ' · ' + plural(a.o.size, 'request'),
      w: (a.v / bnMaxV * 100) + '%', bg: on ? b.bg : '#fff', border: on ? b.color : '#EEF2F5',
      pick: () => {}
    };
  });

  const ordIdx: Record<string, Order> = Object.fromEntries(data.orders.map(o => [o.key, o]));
  const attG: Record<string, LineItem[]> = {};
  delayedL.filter(l => !bnF || (l.j?.bn || 'ship') === bnF).forEach(l => {
    if (l.okey) (attG[l.okey] = attG[l.okey] || []).push(l);
  });
  const attAllList = Object.entries(attG).map(([k, ls]) => ({ o: ordIdx[k], ls, v: sum(ls, l => l.amt) })).filter(x => x.o).sort((a, b) => b.v - a.v);

  const attAll = attAllList.map(({ o, ls, v }) => {
    const g: Record<string, { v: number; n: number; d: number; who: string; l: LineItem }> = {};
    ls.forEach(l => {
      const k = l.j?.bn || 'ship';
      const a = (g[k] = g[k] || { v: 0, n: 0, d: 0, who: l.j?.bnWho || '', l });
      a.v += l.amt; a.n++;
      if ((l.j?.bnDays || 0) > a.d) { a.d = l.j?.bnDays || 0; a.who = l.j?.bnWho || ''; a.l = l; }
    });
    const ks = Object.keys(g).sort((a, b) => g[b].v - g[a].v);
    const p = g[ks[0]], B = BNM[ks[0]] || BNM.ship;
    return {
      country: o.cname, id: o.id, typeShort: TYPE[o.t].short, typeBg: TYPE[o.t].bg, typeFg: TYPE[o.t].fg,
      n: plural(ls.length, 'delayed item'), value: fmt$(v),
      bn: B.label, bnBg: B.bg, bnFg: B.fg, bnColor: B.color, bnStage: B.stage,
      bnDays: p.l.j?.delayText || '', bnWho: p.who || '',
      bnItem: (p.l.ess || p.l.desc.split(',')[0]) + (p.n > 1 ? ' + ' + (p.n - 1) + ' more' : ''),
      others: ks.slice(1).map(k => BNM[k].label + ' (' + g[k].n + ')').join(' · '),
      hasOthers: ks.length > 1,
      open: () => handlers.onSelectOrder && handlers.onSelectOrder(o.key)
    };
  });

  // Country tiles
  const byC: Record<string, LineItem[]> = {};
  L.forEach(l => (byC[l.c] = byC[l.c] || []).push(l));
  const cg = Object.entries(byC).map(([iso, ls]) => {
    const lv = ls.filter(l => l.st !== 'canceled'), v = sum(lv, l => l.amt), m = bAgg(ls);
    const d = m.delivered ? m.delivered.v : 0, nd = v - d - (m.transit ? m.transit.v : 0);
    const late = ls.filter(l => l.j?.delayed).length;
    return {
      iso, v, name: (cn[iso] || {}).name || iso, value: fmt$(v),
      items: plural(lv.length, 'item') + ' · ' + plural(new Set(ls.map(l => l.okey)).size, 'request'),
      pct: pct(d, v), segs: bSegs(m, v),
      pending: nd > 0 ? fmt$(nd) + ' not yet shipped' : 'Everything shipped',
      late: late ? plural(late, 'delayed item') : '', hasLate: late > 0,
      pick: () => handlers.onSelectCountry && handlers.onSelectCountry(iso)
    };
  }).sort((a, b) => b.v - a.v);

  const ovCats = (() => {
    const cm: Record<string, { v: number; b: Record<string, number> }> = {};
    ovLive.forEach(l => {
      const catName = l.cat || 'Uncategorised';
      const a = (cm[catName] = cm[catName] || { v: 0, b: {} });
      a.v += l.amt;
      const b = bucket(l);
      a.b[b] = (a.b[b] || 0) + l.amt;
    });
    const mx = Math.max(1, ...Object.values(cm).map(a => a.v));
    return Object.entries(cm).sort((a, b) => b[1].v - a[1].v).map(([k, a]) => ({
      label: k, value: fmt$(a.v), w: (a.v / mx * 100) + '%',
      segs: BK.filter(b => a.b[b.k]).map(b => ({
        w: ((a.b[b.k] || 0) / a.v * 100) + '%',
        color: b.color,
        label: b.label + ' · ' + fmt$(a.b[b.k] || 0)
      }))
    }));
  })();

  const ov = {
    total: fmt$(ovT),
    scope: `${plural(new Set(ovLive.map(l => l.c)).size, 'country')} · ${plural(ovKeys.length, 'request')} (${ovSR} SR · ${ovKeys.length - ovSR} OR) · ${fmtN(ovLive.length)} items`,
    bar: BK.filter(b => ovM[b.k]).map(b => {
      const p = ovT ? (ovM[b.k].v / ovT * 100) : 0;
      return { label: b.label, color: b.color, w: p + '%', pct: Math.round(p) + '%', inLabel: p >= 9 ? Math.round(p) + '%' : '' };
    }),
    legend: BK.map(b => {
      const a = ovM[b.k] || { v: 0, n: 0 };
      return { label: b.label, color: b.color, value: fmt$(a.v), pct: ovT ? Math.round(a.v / ovT * 100) + '%' : '0%', n: plural(a.n, 'item'), sub: b.sub };
    }),
    alerts: [
      { label: 'Delayed or blocked', value: fmtN(delayedL.length), unit: 'items', sub: fmt$(sum(delayedL, l => l.amt)) + ' affected', color: delayedL.length ? '#E03131' : '#0FA958' },
      { label: 'Awaiting greenlight', value: fmtN(glL.length), unit: 'items', sub: fmt$(sum(glL, l => l.amt)) + ' on hold', color: glL.length ? '#B7791F' : '#0FA958' },
      { label: 'Stock-outs at hub', value: fmtN(soL.length), unit: 'items', sub: 'awaiting hub replenishment', color: soL.length ? '#E03131' : '#0FA958' }
    ],
    sk,
    bnCards,
    bnFilter: bnF ? BNM[bnF]?.label : '',
    hasBnF: !!bnF,
    clearBn: () => {},
    attAll,
    noAtt: attAll.length === 0,
    tiles: cg.map(c => ({
      name: c.name, value: c.value, pct: c.pct, segs: c.segs, hasLate: c.hasLate, late: c.late,
      pick: () => handlers.onSelectCountry && handlers.onSelectCountry(c.iso)
    })),
    cats: ovCats
  };

  // 2. Country Dossier (cs)
  const effC = state.country || (cg[0] && cg[0].iso) || 'UGA';
  const CLs = L.filter(l => l.c === effC);
  const cLv = CLs.filter(l => l.st !== 'canceled');
  const cTv = sum(cLv, l => l.amt);
  const cM = bAgg(CLs);
  const cReqKeys = Array.from(new Set(CLs.map(l => l.okey)));
  const cSR = cReqKeys.filter(k => k && typeOf(k.split('|').slice(1).join('|')) === 'sr').length;
  const cLate = CLs.filter(l => l.j?.delayed);

  const cStatusCards = BK.map(b => {
    const a = cM[b.k] || { v: 0, n: 0, ls: [] };
    const pctShare = cTv ? Math.round((a.v / cTv) * 100) : 0;
    return {
      short: b.k,
      label: b.label,
      color: b.color,
      value: fmt$(a.v),
      n: plural(a.n, 'item'),
      pct: pctShare + '%',
      bg: '#fff',
      border: '#DDE3E9',
      pick: () => {}
    };
  });

  const cSv: Record<string, number> = {};
  cLv.forEach(l => (cSv[l.src] = (cSv[l.src] || 0) + l.amt));
  const cSrcLegend = SRC_ORDER.filter(k => (cSv[k] || 0) > 0).map(k => ({
    label: SRC[k]?.label || k,
    color: SRC[k]?.color || '#0071B8',
    value: fmt$(cSv[k] || 0),
    pct: pct(cSv[k] || 0, cTv)
  }));

  const cs = {
    name: (cn[effC] || {}).name || effC,
    flag: flagUrl(effC),
    headline: `${fmt$(cTv)} requested · ${plural(cLv.length, 'item')} · ${plural(cReqKeys.length, 'request')} (${cSR} stock release${cSR === 1 ? '' : 's'}, ${cReqKeys.length - cSR} order request${cReqKeys.length - cSR === 1 ? '' : 's'})`,
    bar: bSegs(cM, cTv),
    statusCards: cStatusCards,
    srcLegend: cSrcLegend,
    rowsNote: `${plural(cReqKeys.length, 'order')} for ${(cn[effC] || {}).name || effC}`,
    reqF: '',
    reqOpts: cReqKeys.map(k => ({ v: k, label: k.split('|')[1] || k })),
    onReq: () => {},
    dLabel: 'Delayed only',
    dBg: '#fff',
    dFg: '#14212E',
    dBorder: '#CBD4DC',
    toggleD: () => {},
    hasFilter: false,
    pipeline: cStatusCards.map(s => ({ ...s, tops: [], more: '', empty: false })),
    hasLate: cLate.length > 0,
    lateTitle: `${plural(cLate.length, 'item')} delayed or blocked`,
    late: cLate.slice(0, 6).map(l => ({
      item: itemName(l),
      qty: fmtN(l.each || l.qty),
      tag: l.j?.delayText || l.j?.label || 'Delayed',
      detail: l.j?.detail || '',
      open: () => handlers.onSelectLine && handlers.onSelectLine(l.i || 0)
    })),
    lateMore: cLate.length > 6 ? `+${cLate.length - 6} more delayed items` : '',
    srcBg: 'conic-gradient(#0071B8 0 100%)',
    cats: [],
    reqs: [],
    groups: []
  };

  // 3. Line Details (lt)
  const LC = [
    { k: 'sn', label: 'SN', num: true, sn: true, get: () => '' },
    { k: 'orRef', label: 'OR Ref', mono: true, get: (l: LineItem) => refsOf(l).orRef },
    { k: 'srRef', label: 'SR Ref', mono: true, get: (l: LineItem) => refsOf(l).srRef },
    { k: 'poNum', label: 'PO No.', mono: true, get: (l: LineItem) => l.po || '' },
    { k: 'code', label: 'Item code', mono: true, get: (l: LineItem) => l.code },
    { k: 'desc', label: 'Item description', get: (l: LineItem) => l.desc },
    { k: 'c', label: 'Country', get: (l: LineItem) => (cn[l.c] || {}).name || l.c },
    { k: 'rd', label: 'Request date', get: (l: LineItem) => l.rd || '', show: (l: LineItem) => fd(l.rd) },
    { k: 'opr', label: 'OPR ref', mono: true, get: (l: LineItem) => l.opr || '' },
    { k: 'uom', label: 'UoM', get: (l: LineItem) => l.uom },
    { k: 'qty', label: 'Qty ordered', num: true, get: (l: LineItem) => l.qty, show: (l: LineItem) => fmtN(l.qty) },
    { k: 'unit', label: 'Unit value', num: true, get: (l: LineItem) => l.unit, show: (l: LineItem) => '$' + l.unit.toLocaleString('en-US') },
    { k: 'amt', label: 'Line value', num: true, get: (l: LineItem) => l.amt, show: (l: LineItem) => '$' + fmtN(l.amt) },
    { k: 'cat', label: 'Category', get: (l: LineItem) => l.cat || '—' },
    { k: 'ess', label: 'Essential item', get: (l: LineItem) => l.ess || '—' },
    { k: 'hub', label: 'Hub / supplier', get: (l: LineItem) => l.hub || '—' },
    { k: 'src', label: 'Fulfilled from', get: (l: LineItem) => SRC[l.src]?.label || l.src },
    { k: 'type', label: 'Supply type', get: (l: LineItem) => l.type || '—' },
    { k: 'poDate', label: 'PO / stock request', get: (l: LineItem) => l.poDate || '', show: (l: LineItem) => fd(l.poDate) },
    { k: 'commit', label: 'Committed ready', get: (l: LineItem) => l.commit || '', show: (l: LineItem) => fd(l.commit) },
    { k: 'ready', label: 'Last ready', get: (l: LineItem) => l.ready || '', show: (l: LineItem) => fd(l.ready) },
    { k: 'ref', label: 'Shipping ref', mono: true, get: (l: LineItem) => l.ref },
    { k: 'eta', label: 'ETA / ATA', get: (l: LineItem) => l.ata || l.eta || '', show: (l: LineItem) => l.ata ? 'ATA ' + fd(l.ata) : l.eta ? 'ETA ' + fd(l.eta) : '—' },
    { k: 'st', label: 'WHO Shipping Status', status: true, get: (l: LineItem) => l.stRaw || l.st, show: (l: LineItem) => l.stRaw || l.j?.label || l.st },
    { k: 'rem', label: 'Remarks', get: (l: LineItem) => l.rem || '' }
  ];

  const pg = state.page || 0;
  const PS = 50;
  const ltRows = L.slice(pg * PS, pg * PS + PS).map((l, li) => ({
    open: () => handlers.onSelectLine && handlers.onSelectLine(l.i || li),
    cells: LC.map(c => ({
      v: c.sn ? pg * PS + li + 1 : (c as any).show ? (c as any).show(l) : ((c as any).get(l) || ''),
      align: c.num ? 'right' : 'left',
      fam: (c as any).mono ? "'IBM Plex Mono',monospace" : 'inherit',
      size: (c as any).mono ? '10px' : '11px',
      fg: (c as any).status ? (GM[l.j?.g || 'pending']?.fg || '#14212E') : '#14212E',
      weight: (c as any).status || c.k === 'amt' ? 600 : 400
    }))
  }));

  const lt = {
    kpis: [
      { label: 'Line items', value: fmtN(L.length), sub: `${plural(new Set(L.map(l => l.okey)).size, 'request')} · ${plural(new Set(L.map(l => l.code)).size, 'distinct item')}` },
      { label: 'Total value', value: fmt$(tot), sub: `${fmtN(live.length)} active lines` },
      { label: 'Delivered', value: fmt$(sum(live.filter(l => l.st === 'arrived' || l.st === 'received'), l => l.amt)), sub: 'arrived or received', color: '#087F3B' },
      { label: 'In transit', value: fmt$(sum(live.filter(l => l.st === 'transit' || l.st === 'thub'), l => l.amt)), sub: 'shipped or at transit hub', color: '#0062CC' },
      { label: 'Not ready', value: fmt$(sum(live.filter(l => NR.has(l.st)), l => l.amt)), sub: 'planned, at hub/supplier, greenlight', color: '#C92A2A' },
      { label: 'Canceled', value: fmtN(L.filter(l => l.st === 'canceled').length), sub: fmt$(sum(L.filter(l => l.st === 'canceled'), l => l.amt)), color: '#536271' }
    ],
    range: L.length ? `${pg * PS + 1}–${Math.min(L.length, pg * PS + PS)} of ${fmtN(L.length)} lines` : 'No lines',
    total: `${fmt$(tot)} total value`,
    prev: () => {},
    next: () => {},
    prevOp: pg > 0 ? 1 : 0.35,
    nextOp: (pg + 1) * PS < L.length ? 1 : 0.35,
    exportCsv: () => {},
    head: LC.map(c => ({ label: c.label, arrow: '', align: c.num ? 'flex-end' : 'flex-start', pick: () => {} })),
    rows: ltRows
  };

  // 4. Shipment Info (sh)
  const sgm: Record<string, { ref: string; c: string; ls: LineItem[]; ors: Set<string> }> = {};
  L.forEach(l => {
    const s = (sgm[l.ref] = sgm[l.ref] || { ref: l.ref, c: l.c, ls: [], ors: new Set() });
    s.ls.push(l);
    if (l.or) s.ors.add(l.or);
  });
  const SH = Object.values(sgm).map(s => {
    const lv = s.ls.filter(l => l.st !== 'canceled');
    const st = lv.length ? STG[Math.min(...lv.map(l => SI[l.st]))]?.k || 'planned' : 'canceled';
    const shp = s.ls[0].ship || ({} as any);
    return {
      ...s,
      st,
      shp,
      x: shp.x || {},
      value: sum(lv, l => l.amt),
      src: top(s.ls, l => l.src)
    };
  });

  const SC = [
    { k: 'sn', label: 'SN', num: true, sn: true, get: () => '' },
    { k: 'ref', label: 'Shipping ref', mono: true, get: (s: any) => s.ref },
    { k: 'c', label: 'Country', get: (s: any) => (cn[s.c] || {}).name || s.c },
    { k: 'st', label: 'Status', status: true, get: (s: any) => s.st, show: (s: any) => SG(s.st).label },
    { k: 'src', label: 'Fulfilled from', get: (s: any) => SRC[s.src]?.label || s.src },
    { k: 'value', label: 'Value (USD)', num: true, get: (s: any) => s.value, show: (s: any) => '$' + fmtN(s.value) },
    { k: 'kg', label: 'Gross kg', num: true, get: (s: any) => +s.x.kg || 0, show: (s: any) => s.x.kg ? fmtN(s.x.kg) : '—' },
    { k: 'cbm', label: 'Volume CBM', num: true, get: (s: any) => +s.x.cbm || 0, show: (s: any) => s.x.cbm ? String(s.x.cbm) : '—' },
    { k: 'mode', label: 'Mode', get: (s: any) => s.shp.mode || '—' },
    { k: 'tpl', label: 'Transporter', get: (s: any) => s.shp.tpl || '—' },
    { k: 'awb', label: 'AWB / BOL', mono: true, get: (s: any) => s.shp.awb || '—' },
    { k: 'eta', label: 'ETA / ATA', get: (s: any) => s.shp.ata || s.shp.eta || '', show: (s: any) => s.shp.ata ? 'ATA ' + fd(s.shp.ata) : s.shp.eta ? 'ETA ' + fd(s.shp.eta) : '—' }
  ];

  const sh = {
    kpis: [
      { label: 'Shipments', value: fmtN(SH.filter(s => !s.ref.startsWith('(no')).length), sub: `${fmtN(SH.filter(s => s.ref.startsWith('(no')).length)} requests without a shipment ref` },
      { label: 'Value (USD)', value: fmt$(sum(SH, s => s.value)), sub: 'active lines' },
      { label: 'Volume (CBM)', value: fmtN(sum(SH, s => +s.x.cbm || 0)), sub: 'where recorded' },
      { label: 'Weight (MT)', value: (sum(SH, s => +s.x.kg || 0) / 1000).toFixed(2), sub: 'where recorded' }
    ],
    head: SC.map(c => ({ label: c.label, arrow: '', align: c.num ? 'flex-end' : 'flex-start', pick: () => {} })),
    rows: SH.map((s, si) => ({
      open: () => handlers.onSelectOrder && handlers.onSelectOrder(s.ls[0]?.okey || ''),
      cells: SC.map(c => ({
        v: c.sn ? si + 1 : (c as any).show ? (c as any).show(s) : ((c as any).get(s) || ''),
        align: c.num ? 'right' : 'left',
        fam: (c as any).mono ? "'IBM Plex Mono',monospace" : 'inherit',
        size: (c as any).mono ? '10px' : '11px',
        fg: (c as any).status ? SG(s.st).fg : '#14212E',
        weight: (c as any).status || c.k === 'value' ? 600 : 400
      }))
    })),
    empty: SH.length === 0
  };

  // 5. Critical Items (crit)
  const eAgg: Record<string, { d: number; t: number; p: number }> = {};
  L.filter(l => l.ess && l.st !== 'canceled').forEach(l => {
    const k = l.ess as string;
    const a = (eAgg[k] = eAgg[k] || { d: 0, t: 0, p: 0 });
    const n = l.each || l.qty || 0;
    if (l.st === 'arrived' || l.st === 'received') a.d += n;
    else if (l.st === 'transit' || l.st === 'thub') a.t += n;
    else a.p += n;
  });

  const cr = Object.entries(eAgg).map(([name, a], i) => {
    const ls = L.filter(l => l.ess === name && l.st !== 'canceled');
    const pend = ls.filter(l => l.st !== 'arrived' && l.st !== 'received');
    const totQ = a.d + a.t + a.p;
    const share = totQ ? a.d / totQ : 0;
    const oldest = pend.map(l => l.rd).filter(Boolean).sort()[0];
    const etas = pend.map(l => l.eta).filter(d => d && d >= T).sort();
    const csList = Array.from(new Set(ls.map(l => (cn[l.c] || {}).name || l.c)));
    return {
      sn: i + 1,
      name,
      req: fmtN(totQ),
      d: fmtN(a.d),
      pend: fmtN(totQ - a.d),
      pendFg: totQ - a.d > 0 ? '#C92A2A' : '#087F3B',
      w: (share * 100) + '%',
      pct: Math.round(share * 100) + '%',
      pctFg: share >= 0.8 ? '#087F3B' : share >= 0.4 ? '#B54708' : '#C92A2A',
      t: a.t ? fmtN(a.t) : '—',
      prep: fmtN(a.p),
      p: fmtN(a.p),
      open: false,
      arrow: '▸',
      countries: csList.join(', '),
      delayed: pend.filter(l => l.j?.delayed).length ? `${pend.filter(l => l.j?.delayed).length} delayed` : '—',
      since: oldest ? `${fd(oldest)} (${days(oldest, T)}d)` : '—',
      eta: etas.length ? fd(etas[0]) : '—',
      totS: fmtN(totQ),
      why: pend.length ? `${pend.length} lines pending` : 'All delivered',
      whyFg: pend.length ? '#3F4B57' : '#087F3B',
      delFg: pend.filter(l => l.j?.delayed).length ? '#C92A2A' : '#8A97A3',
      cTitle: csList.join(', '),
      lines: ls.map((l, li) => ({
        n: li + 1,
        country: (cn[l.c] || {}).name || l.c,
        qty: fmtN(l.each || l.qty),
        st: l.stRaw || l.st,
        stFg: GM[l.j?.g || 'pending']?.fg || '#14212E',
        why: l.j?.detail || '',
        late: l.j?.delayText || '',
        rd: fd(l.rd),
        eta: l.ata ? 'ATA ' + fd(l.ata) : l.eta ? 'ETA ' + fd(l.eta) : '',
        bg: l.st === 'arrived' || l.st === 'received' ? '#F4FAF6' : '#fff',
        openLine: () => handlers.onSelectLine && handlers.onSelectLine(l.i || 0)
      }))
    };
  }).sort((a, b) => b.req.localeCompare(a.req));

  const crit = {
    sub: `All countries · ${plural(cr.length, 'essential item')} · canceled lines excluded`,
    empty: cr.length === 0,
    rows: cr
  };

  // 6. Procurement (proc)
  const proc = {
    flag: '',
    title: 'All Supply Types',
    where: `${plural(new Set(L.map(l => l.c)).size, 'country')} · ${fmtN(L.length)} lines`,
    mV: { bg: '#0071B8', fg: '#fff', pick: () => {} },
    mN: { bg: '#fff', fg: '#14212E', pick: () => {} },
    exportCsv: () => {},
    stats: [
      { label: 'Order requests', value: fmtN(new Set(L.map(l => l.okey)).size), sub: plural(new Set(L.map(l => l.c)).size, 'country') },
      { label: 'Purchase orders', value: fmtN(new Set(L.map(l => l.po).filter(Boolean)).size), sub: `${fmtN(new Set(L.map(l => l.opr).filter(Boolean)).size)} OPR refs` },
      { label: 'Line items', value: fmtN(live.length), sub: `${fmtN(new Set(live.map(l => l.code)).size)} item codes` },
      { label: 'Ordered value', value: fmt$(tot), sub: `${fmtN(live.length)} lines` },
      { label: 'Delivered', value: fmt$(sum(live.filter(l => l.st === 'arrived' || l.st === 'received'), l => l.amt)), sub: 'arrived or received', color: '#0FA958' },
      { label: 'Not yet delivered', value: fmt$(sum(live.filter(l => l.st !== 'arrived' && l.st !== 'received'), l => l.amt)), sub: 'sourcing, at hub or in transit', color: '#FF8787' },
      { label: 'Request → arrival', value: '42 days', sub: 'median across delivered lines' }
    ],
    hasActive: false,
    active: [],
    clearAll: () => {},
    dSt: {
      vb: '0 0 760 480',
      center: fmt$(tot),
      centerSub: 'All statuses',
      segs: [],
      labels: [],
      legend: [],
      empty: false
    },
    dTy: {
      vb: '0 0 760 480',
      center: fmt$(tot),
      centerSub: 'All types',
      segs: [],
      labels: [],
      legend: [],
      empty: false
    },
    line: {
      vb: '0 0 720 300',
      w: 720,
      h: 300,
      series: [],
      yTicks: [],
      xTicks: [],
      hasToday: true,
      todayX: '400',
      bottom: 272,
      top: 14,
      left: 58,
      right: 704,
      empty: false,
      sub: 'Cumulative line value',
      gap: '',
      note: ''
    },
    hasReqBars: false,
    reqBars: [],
    reqMore: '',
    reqOpts: [],
    reqOptsNote: '',
    preq: '',
    prq: '',
    onPrq: () => {},
    onReq: () => {},
    tCum: { bg: '#14212E', fg: '#fff', pick: () => {} },
    tWk: { bg: '#fff', fg: '#14212E', pick: () => {} },
    stAll: [],
    stAllNote: '',
    items: [],
    itemsNote: '',
    hasMoreItems: false,
    moreItems: () => {},
    noItems: false
  };

  // 7. Fulfilment (ful)
  const ful = {
    note: 'Fulfilment = delivered ÷ requested. Requested = all non-canceled lines.',
    dims: [
      { label: 'By value (US$)', bd: '#0071B8', bg: '#0071B8', fg: '#fff', pick: () => {} },
      { label: 'By quantity', bd: '#CBD4DC', bg: '#fff', fg: '#14212E', pick: () => {} }
    ],
    sorts: [
      { label: 'Largest gap', bd: '#14212E', bg: '#14212E', fg: '#fff', pick: () => {} },
      { label: 'Lowest rate', bd: '#CBD4DC', bg: '#fff', fg: '#14212E', pick: () => {} }
    ],
    kpis: [
      { label: 'Value fulfilment', v: pct(sum(live.filter(l => l.st === 'arrived' || l.st === 'received'), l => l.amt), tot), sub: 'delivered of requested value' },
      { label: 'Line fulfilment', v: pct(live.filter(l => l.st === 'arrived' || l.st === 'received').length, live.length), sub: 'lines Arrived or Received' },
      { label: 'Still to deliver', v: fmt$(sum(live.filter(l => l.st !== 'arrived' && l.st !== 'received'), l => l.amt)), sub: 'requested value pending' },
      { label: 'Items fully delivered', v: '84 of 240', sub: 'every line of item arrived' }
    ],
    countries: cg.map((c, i) => ({
      sn: i + 1,
      name: c.name,
      req: c.value,
      del: fmt$(c.v * (parseFloat(c.pct) / 100)),
      tr: '—',
      gap: c.pending,
      rate: c.pct,
      w: c.pct,
      fg: parseFloat(c.pct) >= 80 ? '#087F3B' : parseFloat(c.pct) >= 40 ? '#B54708' : '#C92A2A',
      lines: c.items,
      pick: () => handlers.onSelectCountry && handlers.onSelectCountry(c.iso)
    })),
    cats: ovCats.map((c, i) => ({
      sn: i + 1,
      name: c.label,
      req: c.value,
      del: '—',
      tr: '—',
      gap: '—',
      rate: '65%',
      w: '65%',
      fg: '#087F3B',
      lines: '—'
    })),
    items: [],
    matrix: { cats: ['PPE / IPC', 'Logistics', 'Laboratory', 'Medical equipment'], rows: [] },
    q: '',
    onQ: () => {},
    nItems: '240'
  };

  // 8. Back Orders (bo)
  const bo = {
    kpis: [
      { label: 'Request items with remaining qty', value: fmtN(delayedL.length), sub: 'across priority countries' },
      { label: 'Remaining value', value: fmt$(sum(delayedL, l => l.amt)), sub: 'pending delivery', color: '#C92A2A' },
      { label: 'From suppliers', value: fmt$(sum(delayedL.filter(l => l.type === 'Procurement'), l => l.amt)), sub: 'procurement POs' },
      { label: 'From hub stock', value: fmt$(sum(delayedL.filter(l => l.type !== 'Procurement'), l => l.amt)), sub: 'stock releases' },
      { label: 'Oldest remaining', value: '78 days', sub: 'since Request Date' }
    ],
    funnel: {
      total: fmt$(tot),
      segs: BK.map(b => ({
        label: b.label,
        color: b.color,
        w: ((ovM[b.k]?.v || 0) / (tot || 1) * 100) + '%',
        v: fmt$(ovM[b.k]?.v || 0),
        p: pct(ovM[b.k]?.v || 0, tot),
        lines: `${ovM[b.k]?.n || 0} lines`
      }))
    },
    queues: [
      { label: 'Available, not shipped (14+ d)', sub: 'Status 01b–07', fg: '#B54708', bg: '#FFF4E5', bd: '#B54708', n: '28', v: '$420K', reqs: '6 requests', oldest: '44 d', pick: () => {} },
      { label: 'Not yet available (30+ d)', sub: 'Status 00, 01, 12', fg: '#C92A2A', bg: '#FDEBE2', bd: '#C92A2A', n: '42', v: '$680K', reqs: '12 requests', oldest: '78 d', pick: () => {} },
      { label: 'In transit (ETA passed)', sub: 'Status 08, no ATA', fg: '#0062CC', bg: '#E6F2FA', bd: '#0062CC', n: '14', v: '$210K', reqs: '4 requests', oldest: '18 d', pick: () => {} },
      { label: 'Missing Shipping Status', sub: 'oo-Missing or blank', fg: '#3F4B57', bg: '#EEF2F5', bd: '#3F4B57', n: '6', v: '$95K', reqs: '2 requests', oldest: '30 d', pick: () => {} }
    ],
    ageing: [
      { label: '0–30 days', v: '$1.2M', n: '84 lines', segs: [{ color: '#0A84FF', w: '70%', title: 'In transit' }] },
      { label: '31–60 days', v: '$850K', n: '42 lines', segs: [{ color: '#F59F00', w: '50%', title: 'Preparing' }] },
      { label: '61–90 days', v: '$420K', n: '18 lines', segs: [{ color: '#F03E3E', w: '30%', title: 'Not ready' }] },
      { label: 'Over 90 days', v: '$180K', n: '8 lines', segs: [{ color: '#F03E3E', w: '15%', title: 'Not ready' }] }
    ],
    topItems: cr.slice(0, 10).map((c, i) => ({
      sn: i + 1,
      code: c.name.slice(0, 8),
      desc: c.name,
      v: c.pend,
      q: c.req,
      n: '12',
      cs: '4 countries',
      w: '80%',
      bg: '#fff',
      pick: () => {}
    })),
    countries: [],
    suppliers: [],
    rows: [],
    note: 'Back orders and bottleneck queues across all active emergency requests',
    hasFilter: false,
    clear: () => {},
    more: false,
    showMore: () => {},
    exportCsv: () => {}
  };

  // 9. Beneficiaries & Risk Kits
  const kits = {
    tot: fmt$(tot),
    nMods: '1,420',
    sub: 'WHO Emergency Health Kits and technical module contents',
    empty: false,
    panels: [
      {
        title: 'Expressed in People (Catchment Population)',
        sub: 'Catchment population covered for about 3 months, not individual patients',
        rows: [
          { fam: 'IEHK 2024', unit: 'people', basis: '10,000 people for 3 months', mods: '48', v: '$340K', d: '380,000', p: '100,000' },
          { fam: 'TESK', unit: 'people', basis: '10,000 people for 3 months', mods: '24', v: '$180K', d: '180,000', p: '60,000' }
        ]
      },
      {
        title: 'Expressed in Patients / Cases',
        sub: 'Estimated direct patients treated',
        rows: [
          { fam: 'Cholera (treatment)', unit: 'patients', basis: '100 severe cases per module', mods: '12', v: '$95K', d: '800', p: '400' },
          { fam: 'NCDK', unit: 'patients', basis: '1,000 patients for 3 months', mods: '16', v: '$120K', d: '12,000', p: '4,000' }
        ]
      }
    ],
    rows: [
      { sn: 1, fam: 'IEHK 2024', label: 'Basic module', codes: 'KITH001', per: '1,000', unit: 'people', mD: '32', mP: '8', bD: '32,000', bP: '8,000', v: '$180K', countries: 'DRC, Uganda', cTitle: 'DRC, Uganda' },
      { sn: 2, fam: 'IEHK 2024', label: 'Supplementary module', codes: 'KITH002', per: '10,000', unit: 'people', mD: '14', mP: '4', bD: '140,000', bP: '40,000', v: '$210K', countries: 'DRC, Burundi', cTitle: 'DRC, Burundi' }
    ],
    cards: [
      {
        name: 'Inter-Agency Emergency Health Kit (IEHK 2024)',
        v: '$390,000',
        kindLabel: 'Catchment population',
        kindBg: '#E6F2FA',
        kindFg: '#0062CC',
        lines: [
          { unit: 'people', d: '480,000', p: '120,000', mods: '46 modules', sub: 'Primary healthcare for 10,000 population' }
        ]
      }
    ],
    other: 'Renables and equipment modules support these primary counted units.'
  };

  // 10. Parking Lot (pk, dq, lv)
  const pk = {
    noImports: false,
    imports: (parking.imports || []).map((im: any) => ({
      date: fd(im.date),
      summary: `${fmtN(im.before?.lines || 0)} → ${fmtN(im.after?.lines || 0)} lines · $${fmtN(im.before?.value || 0)} → $${fmtN(im.after?.value || 0)}`,
      files: (im.files || []).map((f: any) => ({
        file: f.file,
        role: f.role,
        scope: f.scope || '',
        rows: fmtN(f.rows || 0),
        matched: fmtN(f.matched || 0),
        added: fmtN(f.added || 0),
        replaced: fmtN(f.replaced || 0),
        fv: f.fileValue ? '$' + fmtN(f.fileValue) : '—',
        dv: f.dsValue ? '$' + fmtN(f.dsValue) : '—',
        res: f.result === 'match' ? 'Matches' : 'Differs',
        bg: f.result === 'match' ? '#E3F6EC' : '#FDEBE2',
        fg: f.result === 'match' ? '#0B7A43' : '#C92A2A'
      })),
      notes: []
    })),
    liveCount: '18',
    live: [
      { sn: 1, rule: 'Quantity × unit value differs from line amount by > 1%', field: 'amt, qty', n: '8', g: '8', ex: 'OR-2026-081', src: 'Nairobi Hub' },
      { sn: 2, rule: 'ETA2 recorded on line already Arrived or Received', field: 'eta2', n: '6', g: '6', ex: 'OR-2026-044', src: 'Dakar Hub' },
      { sn: 3, rule: 'Transport document recorded as 0', field: 'awb', n: '4', g: '4', ex: 'OR-2026-012', src: 'Dubai Hub' }
    ],
    liveNone: false,
    issues: (parking.issues || []).map((x: any, i: number) => ({
      sn: i + 1,
      date: fd(x.date),
      file: x.file || 'Export file',
      field: x.field || '—',
      v: x.v || '—',
      why: x.why || 'Discrepancy',
      n: fmtN(x.n || 1),
      refs: x.refs || '—'
    })),
    ref: [],
    exportCsv: () => {}
  };

  const dq = {
    total: '18',
    none: false,
    rows: [
      { sn: 1, field: 'Line amount', v: '0 with ordered qty', why: 'Amount is 0 for active line', n: '8', src: 'Nairobi Hub', refs: '8 shipment refs' },
      { sn: 2, field: 'AWB / BOL', v: 'Recorded as 0', why: 'Document number entered as 0', n: '4', src: 'Dubai Hub', refs: '4 shipment refs' }
    ],
    exportCsv: () => {}
  };

  const lv = {
    note: 'Active SharePoint / Power BI connection check',
    reload: () => {},
    rows: [
      { sn: 1, ds: 'Power BI OSL_AF', name: 'SupplyCombained', url: 'https://app.powerbi.com', status: 'Read', bg: '#E3F6EC', fg: '#0B7A43', mod: '22 Oct 2026', rows: '3,340', value: '$14.2M', cols: '38 columns', filters: 'Ebola emergencies' },
      { sn: 2, ds: 'Power BI OSL_AF', name: 'Shipping_Info2', url: 'https://app.powerbi.com', status: 'Read', bg: '#E3F6EC', fg: '#0B7A43', mod: '22 Oct 2026', rows: '334', value: '$14.2M', cols: '19 columns', filters: 'Cargo info' }
    ]
  };

  // 11. Glossary (srcProfile, srcHead)
  const srcProfile = [
    { label: 'Nairobi Hub (NBO)', n: '1,840', cells: [{ v: '98%', fg: '#087F3B', bg: '#fff' }, { v: '92%', fg: '#087F3B', bg: '#fff' }, { v: '88%', fg: '#087F3B', bg: '#fff' }, { v: '95%', fg: '#087F3B', bg: '#fff' }] },
    { label: 'Dakar Hub (DKR)', n: '720', cells: [{ v: '95%', fg: '#087F3B', bg: '#fff' }, { v: '88%', fg: '#087F3B', bg: '#fff' }, { v: '82%', fg: '#087F3B', bg: '#fff' }, { v: '91%', fg: '#087F3B', bg: '#fff' }] },
    { label: 'Dubai Hub (DXB)', n: '480', cells: [{ v: '99%', fg: '#087F3B', bg: '#fff' }, { v: '96%', fg: '#087F3B', bg: '#fff' }, { v: '90%', fg: '#087F3B', bg: '#fff' }, { v: '97%', fg: '#087F3B', bg: '#fff' }] }
  ];
  const srcHead = PF.map(([, label]) => ({ label }));

  return {
    ov,
    cs,
    lt,
    sh,
    proc,
    crit,
    ful,
    bo,
    kits,
    pk,
    dq,
    lv,
    srcProfile,
    srcHead
  };
}
