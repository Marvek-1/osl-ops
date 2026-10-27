import React, { useState, useEffect, useMemo } from 'react';
import { fmt$, fmtN, pct } from '../../utils/engine';
import { KITF, KITR, PRIORITY } from '../../utils/constants';

interface BeneficiariesRiskTabProps {
  country: string;
  onSelectCountry: (iso: string) => void;
  asOf: string;
  kits: {
    tot: string;
    nMods: string;
    sub: string;
    empty: boolean;
    panels: Array<{
      title: string;
      sub: string;
      rows: Array<{
        fam: string;
        unit: string;
        basis: string;
        mods: string;
        v: string;
        d: string;
        p: string;
      }>;
    }>;
    rows: Array<{
      sn: number;
      fam: string;
      label: string;
      codes: string;
      per: string;
      unit: string;
      mD: string;
      mP: string;
      bD: string;
      bP: string;
      v: string;
      countries: string;
      cTitle: string;
      basis: string;
      src: string;
    }>;
    other: string;
  };
  impactData?: any;
  onRunwayUpdate?: (summary: any) => void;
}

export const BeneficiariesRiskTab: React.FC<BeneficiariesRiskTabProps> = ({
  country,
  onSelectCountry,
  asOf,
  kits,
  impactData: propImpactData,
  onRunwayUpdate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'etc' | 'kits'>('etc');
  const [impactData, setImpactData] = useState<any>(propImpactData || null);

  // ETC Scenario parameters
  const [pipe, setPipe] = useState<boolean>(true);
  const [start, setStart] = useState<string>('2026-10-22');
  const [bedsAll, setBedsAll] = useState<number>(20);
  const [customBeds, setCustomBeds] = useState<Record<string, number>>({});
  const [horizon, setHorizon] = useState<number>(90);
  const [occ, setOcc] = useState<number>(1.0);
  const [conf, setConf] = useState<number>(1.0);

  const cfrNo = 0.482;
  const cfrCare = 0.30;
  const pcrRun = 32;
  const pcrCtl = 2;
  const pcrF = Math.max(0, pcrRun - pcrCtl) / pcrRun;
  const stay = 7;

  useEffect(() => {
    if (!impactData) {
      fetch('data/impact.json')
        .then((r) => r.json())
        .then((d) => {
          setImpactData(d);
          if (d.asOf) setStart(d.asOf);
        })
        .catch(() => {});
    }
  }, [impactData]);

  // Compute ETC Model
  const etcModel = useMemo(() => {
    if (!impactData || !impactData.countries) return null;

    const d = impactData;
    const DAY = 864e5;
    const T0 = +new Date(start || d.asOf);
    const H = horizon;
    const fam = Object.fromEntries(
      (d.fam || []).map((f: any) => [
        f.id,
        f.id === 'gloveExam'
          ? { ...f, pm: f.pm * 2, unit: 'gloves' }
          : f.id === 'mask'
          ? { ...f, label: 'Medical masks + FFP2' }
          : f,
      ])
    );
    const CORE = ['coverall', 'gloveExam', 'mask'];
    const AX = 2 * H;

    const calc = (c: any) => {
      const beds = customBeds[c.iso] ?? bedsAll;
      const ls = (d.lines || []).filter(
        (l: any) => l.c === c.iso && (l.f || l.kit) && (l.st === 'delivered' || pipe)
      );
      const by: Record<string, any[]> = {};
      ls.forEach((l: any) => {
        if (!l.f) return;
        let units = l.units;
        if (l.f === 'gloveExam') {
          const m = /(?:box|case|pack|carton)-(\d+)/i.exec(l.desc || '');
          if (m) units = l.qty * +m[1];
        }
        const fk = l.f === 'respirator' ? 'mask' : l.f;
        (by[fk] = by[fk] || []).push({ ...l, units, at: T0 });
      });

      const runs: Record<string, any> = {};
      const wasteLots: any[] = [];
      Object.entries(by).forEach(([fid, lots]) => {
        const f = fam[fid];
        if (!f || !f.pm || f.assumed) return;
        const rate = (f.pm * beds) / 30;
        lots.sort((a, b) => a.at - b.at || (a.exp || '9').localeCompare(b.exp || '9'));
        let t = T0;
        let dD = 0;
        let dP = 0;
        let wU = 0;
        let gap = false;
        const hub: Record<string, number> = {};

        lots.forEach((l: any) => {
          const s0 = Math.max(t, l.at);
          if (s0 > t + DAY) gap = true;
          const ex = l.exp ? +new Date(l.exp) : Infinity;
          const use = ex <= s0 ? 0 : Math.min(l.units, ((ex - s0) / DAY) * rate);
          const w = l.units - use;
          if (w > 0.5) {
            wU += w;
            wasteLots.push({ l, w, val: (l.val * w) / l.units });
          }
          const days = use / rate;
          if (l.st === 'delivered') dD += days;
          else dP += days;
          hub[l.hub] = (hub[l.hub] || 0) + days;
          t = s0 + days * DAY;
        });
        runs[fid] = {
          dD,
          dP,
          days: (t - T0) / DAY,
          wDays: wU / rate,
          gap,
          hub,
          units: lots.reduce((a, l) => a + l.units, 0),
        };
      });

      const core = CORE.map((id) => ({
        id,
        days: runs[id] ? runs[id].dD + runs[id].dP : 0,
      }));
      const bind = core.reduce((a, b) => (b.days < a.days ? b : a), core[0] || { id: 'coverall', days: 0 });
      const has = ls.length > 0;
      const useDays = Math.min(bind.days, H);
      const bedDays = useDays * beds * occ;
      const patients = bedDays / stay;
      const confirmed = patients * conf;
      const lives = confirmed * Math.max(0, cfrNo - cfrCare);
      const stockPatients = (bind.days * beds * occ) / stay;
      const sumU = (id: string) => ls.filter((l: any) => l.f === id).reduce((a: number, l: any) => a + l.units, 0);
      const tests = sumU('pcr') * pcrF;
      const kitN: Record<string, any> = {};
      ls.filter((l: any) => l.kit).forEach((l: any) => {
        const k = (kitN[l.kit] = kitN[l.kit] || { qty: 0, n: 0, arr: 0, pipe: 0 });
        k.qty += l.qty;
        k.n += l.kitN;
        if (l.st === 'delivered') k.arr += l.kitN;
        else k.pipe += l.kitN;
      });
      const people = kitN.iehkB ? kitN.iehkB.n : 0;

      return {
        c,
        beds,
        kitN,
        ls,
        runs,
        bind,
        has,
        patients,
        confirmed,
        lives,
        useDays,
        stockPatients,
        bedLimited: bind.days > H,
        tests,
        people,
        burials: sumU('bodybag'),
        water: sumU('nadcc') * 5 + sumU('hth'),
        entries: runs.coverall
          ? (Math.min(runs.coverall.dD + runs.coverall.dP, bind.days, H) * 170 * beds) / 30
          : 0,
        wasteLots,
        waste: wasteLots.reduce((a, w) => a + w.val, 0),
        sumU,
        hubP: (() => {
          const r = runs[bind.id];
          const o: Record<string, number> = {};
          if (!r || bind.days <= 0) return o;
          const totHub = Object.values(r.hub).reduce((a: number, v: any) => a + (Number(v) || 0), 0) || 1;
          Object.entries(r.hub).forEach(([h, v]) => {
            o[h] = (patients * Number(v)) / totHub;
          });
          return o;
        })(),
        hubT: ls
          .filter((l: any) => l.f === 'pcr')
          .reduce((o: any, l: any) => ((o[l.hub] = (o[l.hub] || 0) + l.units * pcrF), o), {}),
      };
    };

    const all = (d.countries || []).map(calc);

    if (onRunwayUpdate) {
      const summary = {
        beds: bedsAll,
        pipe,
        rows: Object.fromEntries(
          all.map((x: any) => [
            x.c.iso,
            { has: x.has, days: x.has ? x.bind.days : 0, id: x.bind.id, beds: x.beds },
          ])
        ),
      };
      onRunwayUpdate(summary);
    }

    const sel = country ? all.filter((x: any) => x.c.iso === country) : all;
    const tot = (k: string) => sel.reduce((a: number, x: any) => a + (x[k] || 0), 0);
    const withStock = sel.filter((x: any) => x.has).length;

    const nf = (v: number) =>
      v >= 1e6
        ? (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
        : v >= 1e4
        ? Math.round(v / 1e3) + 'k'
        : Math.round(v).toLocaleString('en-US');

    const hero = {
      lives:
        '≈ ' +
        (tot('lives') > 0 && tot('lives') < 10
          ? tot('lives').toFixed(1)
          : nf(tot('lives'))),
      scope:
        (country
          ? sel[0]?.c?.name
          : withStock +
            ' of ' +
            sel.length +
            ' priority countries hold Ebola stock; ' +
            sel.filter((x: any) => x.bind.days > 0).length +
            ' can run a treatment centre') +
        '. ' +
        nf(tot('patients')) +
        ' patients treatable in ' +
        H +
        ' days at ' +
        (country ? sel[0]?.beds : bedsAll) +
        ' beds per country, ' +
        ((cfrNo - cfrCare) * 100).toFixed(1).replace(/\.0$/, '') +
        ' percentage points lower fatality with care. Bed occupancy ' +
        Math.round(occ * 100) +
        '%, confirmed share ' +
        Math.round(conf * 100) +
        '%.',
      stats: [
        {
          v: nf(tot('patients')),
          label: 'Patients admitted',
          sub: 'Beds × ' + Math.round(occ * 100) + '% occ × days of PPE ÷ ' + stay + 'd stay',
        },
        {
          v: nf(tot('confirmed')),
          label: 'Confirmed patients treated',
          sub: Math.round(conf * 100) + '% of admissions confirmed',
        },
        {
          v: nf(tot('entries')),
          label: 'Red-zone entries protected',
          sub: '1 coverall per entry by health workers',
        },
        {
          v: nf(
            sel.reduce(
              (a: number, x: any) => a + x.beds * (x.bind.days > 0 ? 1 : 0),
              0
            ) * (d.staffPerBed || 4.47)
          ),
          label: 'Health workers to staff',
          sub: (d.staffPerBed || 4.47) + ' staff per bed, 4 shifts',
        },
        {
          v: nf(tot('tests')),
          label: 'Patient PCR tests',
          sub: pcrRun - pcrCtl + ' of ' + pcrRun + ' wells per run',
        },
        {
          v: nf(tot('people')),
          label: 'Primary care population',
          sub: 'IEHK basic modules × 1,000 people, 3 months',
        },
        {
          v: nf(tot('burials')),
          label: 'Safe burials',
          sub: 'Body bags on hand',
        },
      ],
    };

    const sc = (v: number) => Math.min(100, (v / AX) * 100) + '%';
    const runLabel = (x: any) =>
      !x.has
        ? 'No stock released'
        : x.bind.days <= 0
        ? 'No ' + (fam[x.bind.id]?.label || x.bind.id).toLowerCase()
        : Math.round(x.bind.days) + ' days · ' + (fam[x.bind.id]?.label || x.bind.id).toLowerCase();

    const countryRows = all
      .slice()
      .sort((a: any, b: any) => b.lives - a.lives || a.c.name.localeCompare(b.c.name))
      .map((x: any) => {
        const r = x.runs[x.bind.id] || { dD: 0, dP: 0 };
        const dD = Math.min(r.dD, x.bind.days);
        return {
          iso: x.c.iso,
          name: x.c.name,
          beds: x.beds,
          wD: sc(dD),
          wP: sc(Math.max(0, x.bind.days - dD)),
          runLabel: runLabel(x),
          runFg: !x.has ? '#B42318' : x.bind.days < H ? '#B54708' : '#536271',
          patients: x.has ? nf(x.patients) : '—',
          lives: x.has ? (x.lives > 0 && x.lives < 10 ? x.lives.toFixed(1) : nf(x.lives)) : '—',
          tests: x.tests ? nf(x.tests) : '—',
          waste: x.waste > 0 ? fmt$(x.waste) : '—',
          wasteFg: x.waste > 0 ? '#B42318' : '#8A96A3',
        };
      });

    // Runway detail
    let rw: any;
    if (country) {
      const x = sel[0];
      const bars = x
        ? Object.entries(x.runs)
            .map(([id, r]: [string, any]) => ({ id, r, f: fam[id] }))
            .sort((a, b) => CORE.includes(b.id) ? 1 : -1)
            .map(({ id, r, f }) => {
              const totD = r.dD + r.dP;
              const core = CORE.includes(id);
              return {
                label: f?.label || id,
                weight: core ? 600 : 400,
                sub: nf(r.units) + ' ' + (f?.unit || 'units') + (core ? ' · core' : ''),
                wD: sc(r.dD),
                wP: sc(Math.min(r.dP, Math.max(0, AX - r.dD))),
                wX: sc(Math.min(r.wDays, Math.max(0, AX - totD))),
                days: totD >= 1000 ? '1,000+ d' : Math.round(totD) + ' d',
                fg: totD < H ? '#B54708' : '#14212E',
              };
            })
        : [];
      rw = {
        title: 'Supply runway · ' + (x?.c?.name || country),
        sub: 'Days each consumable lasts at ' + (x?.beds || bedsAll) + ' beds from ' + start + '.',
        bars,
        empty: !x || !x.has,
      };
    } else {
      const bars = all
        .slice()
        .sort((a: any, b: any) => b.bind.days - a.bind.days)
        .map((x: any) => {
          const r = x.runs[x.bind.id] || { dD: 0, dP: 0 };
          const dD = Math.min(r.dD, x.bind.days);
          return {
            label: x.c.name,
            weight: 600,
            sub: !x.has
              ? 'No stock'
              : x.bind.days <= 0
              ? 'No ' + (fam[x.bind.id]?.label || x.bind.id).toLowerCase()
              : 'Limited by ' + (fam[x.bind.id]?.label || x.bind.id).toLowerCase(),
            wD: sc(dD),
            wP: sc(Math.max(0, x.bind.days - dD)),
            wX: '0%',
            days: x.has ? Math.round(x.bind.days) + ' d' : '0 d',
            fg: x.bind.days < H ? '#B54708' : '#14212E',
          };
        });
      rw = {
        title: 'ETC runway by country',
        sub: 'Days a treatment centre can run before the scarcest core PPE item runs out.',
        bars,
        empty: false,
      };
    }

    // Expiry risk Nairobi stock releases
    const wl = sel
      .flatMap((x: any) => x.wasteLots.map((w: any) => ({ ...w, name: x.c.name })))
      .sort((a: any, b: any) => b.val - a.val);

    const exp = {
      rows: wl.slice(0, 40).map((w: any) => ({
        item: w.l.desc,
        where: w.name + ' · ' + w.l.sr,
        exp: w.l.exp,
        expFg: +new Date(w.l.exp) <= T0 ? '#B42318' : '#B54708',
        units: nf(w.w) + ' ' + (fam[w.l.f]?.unit || 'units'),
        val: fmt$(w.val),
      })),
      sum: wl.length ? fmt$(wl.reduce((a: number, w: any) => a + w.val, 0)) + ' across ' + wl.length + ' lots' : '',
      none: wl.length === 0,
    };

    // Hub impact
    const HN: Record<string, string> = {
      nbo: 'Nairobi',
      dkr: 'Dakar',
      dxb: 'Dubai',
      kin: 'Kinshasa (DRC)',
      gva: 'Geneva',
      hq: 'HQ stock',
      proc: 'Direct from supplier',
    };
    const hubs = Object.keys(HN)
      .map((h) => {
        const p = sel.reduce((a: number, x: any) => a + (x.hubP[h] || 0), 0);
        const t = sel.reduce((a: number, x: any) => a + (x.hubT[h] || 0), 0);
        const v = (d.lines || [])
          .filter(
            (l: any) =>
              l.hub === h &&
              l.f &&
              sel.some((x: any) => x.c.iso === l.c) &&
              (l.st === 'delivered' || pipe)
          )
          .reduce((a: number, l: any) => a + (l.val || 0), 0);
        return { h, p, t, v };
      })
      .filter((o) => o.v > 0)
      .sort((a, b) => b.p - a.p || b.v - a.v);

    const hp = hubs.reduce((m, o) => Math.max(m, o.p), 0) || 1;
    const hubRows = hubs.map((o) => ({
      name: HN[o.h],
      patients: nf(o.p),
      lives: nf(o.p * conf * Math.max(0, cfrNo - cfrCare)),
      tests: o.t ? nf(o.t) : '—',
      val: fmt$(o.v),
      w: (o.p / hp) * 100 + '%',
    }));

    return { hero, countryRows, rw, exp, hubRows, AX };
  }, [impactData, start, bedsAll, customBeds, horizon, occ, conf, pipe, country, onRunwayUpdate]);

  return (
    <div className="flex flex-col gap-4">
      {/* Subtab Toggle Buttons */}
      <div data-noprint="1" className="flex">
        <button
          type="button"
          onClick={() => setActiveSubTab('etc')}
          style={{
            backgroundColor: activeSubTab === 'etc' ? '#0071B8' : '#fff',
            color: activeSubTab === 'etc' ? '#fff' : '#14212E',
            borderColor: activeSubTab === 'etc' ? '#0071B8' : '#CBD4DC',
          }}
          className="cursor-pointer border py-1.5 px-4 text-xs font-semibold rounded-l-md transition-colors"
        >
          Ebola treatment capacity
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('kits')}
          style={{
            backgroundColor: activeSubTab === 'kits' ? '#0071B8' : '#fff',
            color: activeSubTab === 'kits' ? '#fff' : '#14212E',
            borderColor: activeSubTab === 'kits' ? '#0071B8' : '#CBD4DC',
          }}
          className="cursor-pointer border py-1.5 px-4 text-xs font-semibold rounded-r-md -ml-[1px] transition-colors"
        >
          Emergency health kits
        </button>
      </div>

      {activeSubTab === 'etc' && etcModel && (
        <section className="flex flex-col gap-4">
          {/* Scenario Controls Toolbar */}
          <div className="bg-white border border-[#DDE3E9] rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-2 items-center text-xs">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">Scenario</span>
            <div className="flex border border-[#CBD4DC] rounded-md overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setPipe(false)}
                style={{
                  backgroundColor: !pipe ? '#14212E' : '#fff',
                  color: !pipe ? '#fff' : '#14212E',
                }}
                className="cursor-pointer border-0 py-1 px-3 text-xs font-medium whitespace-nowrap"
              >
                Delivered
              </button>
              <button
                type="button"
                onClick={() => setPipe(true)}
                style={{
                  backgroundColor: pipe ? '#14212E' : '#fff',
                  color: pipe ? '#fff' : '#14212E',
                }}
                className="cursor-pointer border-0 py-1 px-3 text-xs font-medium whitespace-nowrap"
              >
                Delivered + pipeline (if it arrived today)
              </button>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-[#536271]">
              Outbreak starts
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="text-[11px] py-1 px-2 border border-[#CBD4DC] rounded-md bg-white text-[#14212E]"
              />
            </label>

            <label className="flex items-center gap-1.5 text-xs text-[#536271]">
              Beds / country
              <input
                type="number"
                min={1}
                value={bedsAll}
                onChange={(e) => {
                  setBedsAll(Math.max(1, +e.target.value || 1));
                  setCustomBeds({});
                }}
                className="w-16 text-[11px] py-1 px-2 border border-[#CBD4DC] rounded-md bg-white text-[#14212E]"
              />
            </label>

            <label className="flex items-center gap-1.5 text-xs text-[#536271]">
              Planning
              <input
                type="number"
                min={7}
                max={365}
                value={horizon}
                onChange={(e) => setHorizon(Math.max(7, Math.min(365, +e.target.value || 90)))}
                className="w-14 text-[11px] py-1 px-2 border border-[#CBD4DC] rounded-md bg-white text-[#14212E]"
              />{' '}
              days
            </label>

            <label className="flex items-center gap-1.5 text-xs text-[#536271]">
              Occupancy
              <input
                type="number"
                min={5}
                max={100}
                value={Math.round(occ * 100)}
                onChange={(e) => setOcc(Math.max(5, Math.min(100, +e.target.value || 100)) / 100)}
                className="w-14 text-[11px] py-1 px-2 border border-[#CBD4DC] rounded-md bg-white text-[#14212E]"
              />
              %
            </label>

            <label className="flex items-center gap-1.5 text-xs text-[#536271]">
              Confirmed
              <input
                type="number"
                min={1}
                max={100}
                value={Math.round(conf * 100)}
                onChange={(e) => setConf(Math.max(1, Math.min(100, +e.target.value || 100)) / 100)}
                className="w-14 text-[11px] py-1 px-2 border border-[#CBD4DC] rounded-md bg-white text-[#14212E]"
              />
              %
            </label>

            <button
              type="button"
              onClick={() => setOcc(0.647)}
              title="WHO AFRO Sitrep 15 (23 Aug 2026): 846 patients in isolation, 1,308 beds = 64.7% occupancy"
              className="cursor-pointer text-[11px] py-1 px-2.5 border border-[#0071B8] rounded-md bg-white text-[#0071B8] font-semibold whitespace-nowrap hover:bg-[#F3F8FC]"
            >
              Use WHO DRC occupancy 64.7%
            </button>
          </div>

          {/* Dark Hero Card */}
          <div className="bg-[#14212E] rounded-xl p-5 md:p-6 text-white flex gap-5 md:gap-10 flex-wrap items-center">
            <div className="flex flex-col gap-1 flex-none max-w-[300px]">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7CC4EC]">
                Lives that could be saved · capacity estimate
              </span>
              <span className="text-4xl md:text-5xl font-semibold tracking-tight leading-none">
                {etcModel.hero.lives}
              </span>
              <span className="text-xs text-[#C9D3DC] leading-relaxed">{etcModel.hero.scope}</span>
            </div>
            <div className="flex-1 min-w-[280px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {etcModel.hero.stats.map((s: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-0.5 min-w-0 border-l border-[#2F4152] pl-3">
                  <span className="text-xl font-semibold tracking-tight">{s.v}</span>
                  <span className="text-xs font-semibold text-white">{s.label}</span>
                  <span className="text-[10px] text-[#AEBBC7] leading-tight">{s.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact by Country Table & Supply Runway Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* Impact by Country */}
            <div className="bg-white border border-[#DDE3E9] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2 flex-wrap items-baseline">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">
                  Impact by country
                </span>
                <span className="text-[11px] text-[#536271]">Beds are editable · click row to focus</span>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[repeat(2,max-content)_minmax(180px,1fr)_repeat(4,max-content)] min-w-full w-max border-l border-[#DDE3E9]">
                  <div className="col-span-full grid grid-cols-subgrid text-[10px] font-semibold tracking-wider uppercase text-white bg-[#0071B8]">
                    <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Country</span>
                    <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Beds</span>
                    <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">ETC runway</span>
                    <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Patients</span>
                    <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Lives</span>
                    <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">PCR tests</span>
                    <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Expires</span>
                  </div>
                  {etcModel.countryRows.map((r: any) => (
                    <div
                      key={r.iso}
                      style={{ backgroundColor: country === r.iso ? '#EAF5FC' : '#fff' }}
                      className="col-span-full grid grid-cols-subgrid text-[11px] items-stretch border-b border-[#DDE3E9] whitespace-nowrap hover:bg-[#F3F8FC]"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectCountry(country === r.iso ? '' : r.iso)}
                        className="cursor-pointer border-0 border-r border-[#DDE3E9] bg-transparent py-1 px-2 whitespace-nowrap text-left text-xs font-semibold text-[#0071B8] hover:underline"
                      >
                        {r.name}
                      </button>
                      <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center">
                        <input
                          type="number"
                          min={1}
                          value={r.beds}
                          onChange={(e) => {
                            const v = Math.max(1, +e.target.value || 1);
                            setCustomBeds((s) => ({ ...s, [r.iso]: v }));
                          }}
                          className="w-14 text-xs py-0.5 px-1.5 border border-[#CBD4DC] rounded bg-white text-[#14212E]"
                        />
                      </span>
                      <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex flex-col justify-center gap-1 min-w-0">
                        <span className="h-2 rounded-full bg-[#EEF2F5] overflow-hidden relative flex">
                          <span style={{ width: r.wD }} className="bg-[#0071B8]" />
                          <span style={{ width: r.wP }} className="bg-[#7CC4EC]" />
                          <span className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#14212E] opacity-35" />
                        </span>
                        <span
                          style={{ color: r.runFg }}
                          className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                          {r.runLabel}
                        </span>
                      </span>
                      <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right tabular-nums">{r.patients}</span>
                      <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold tabular-nums">
                        {r.lives}
                      </span>
                      <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right tabular-nums">{r.tests}</span>
                      <span
                        style={{ color: r.wasteFg }}
                        className="py-1 px-1.5 border-r border-[#DDE3E9] text-right tabular-nums font-semibold"
                      >
                        {r.waste}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supply Runway Detail */}
            <div className="bg-white border border-[#DDE3E9] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#DDE3E9] flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">
                  {etcModel.rw.title}
                </span>
                <span className="text-xs text-[#536271]">{etcModel.rw.sub}</span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div className="grid grid-cols-[140px_minmax(0,1fr)_80px] gap-2.5 text-[10px] text-[#536271]">
                  <span />
                  <span className="flex justify-between">
                    <span>0</span>
                    <span>{horizon} days</span>
                    <span>{horizon * 2}+</span>
                  </span>
                  <span />
                </div>
                {etcModel.rw.bars.map((b: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[140px_minmax(0,1fr)_80px] gap-2.5 items-center text-xs"
                  >
                    <span className="flex flex-col min-w-0">
                      <span
                        style={{ fontWeight: b.weight }}
                        className="whitespace-nowrap overflow-hidden text-ellipsis text-[11px]"
                      >
                        {b.label}
                      </span>
                      <span className="text-[10px] text-[#536271]">{b.sub}</span>
                    </span>
                    <span className="h-3 rounded-xs bg-[#EEF2F5] flex overflow-hidden relative">
                      <span style={{ width: b.wD }} className="bg-[#0071B8]" />
                      <span style={{ width: b.wP }} className="bg-[#7CC4EC]" />
                      {b.wX !== '0%' && (
                        <span
                          style={{
                            width: b.wX,
                            background:
                              'repeating-linear-gradient(135deg, #B42318 0 3px, #F6C9C4 3px 6px)',
                          }}
                        />
                      )}
                      <span className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#14212E] opacity-40" />
                    </span>
                    <span
                      style={{ color: b.fg }}
                      className="text-right tabular-nums font-semibold text-[11px]"
                    >
                      {b.days}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hub & Expiry Risk Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Impact by Source Hub */}
            <div className="bg-white border border-[#DDE3E9] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2 items-baseline">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">
                  Impact by source hub
                </span>
                <span className="text-[11px] text-[#536271]">Patients · lives · PCR tests · value</span>
              </div>
              <div className="divide-y divide-[#EEF2F5]">
                {etcModel.hubRows.map((h: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_56px_50px_56px_60px] gap-2 p-2.5 text-xs items-center"
                  >
                    <span className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                      {h.name}
                    </span>
                    <span className="h-2 rounded-full bg-[#EEF2F5] overflow-hidden flex">
                      <span style={{ width: h.w }} className="bg-[#0071B8]" />
                    </span>
                    <span className="text-right tabular-nums">{h.patients}</span>
                    <span className="text-right font-semibold tabular-nums">{h.lives}</span>
                    <span className="text-right tabular-nums">{h.tests}</span>
                    <span className="text-right text-[#536271] tabular-nums">{h.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry Risk Card */}
            <div className="bg-white border border-[#DDE3E9] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2 items-baseline">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">
                  Expiry risk · Nairobi stock releases
                </span>
                <span className="text-xs text-[#536271]">{etcModel.exp.sum}</span>
              </div>
              <div className="max-h-[320px] overflow-auto divide-y divide-[#EEF2F5]">
                {etcModel.exp.rows.map((x: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[minmax(0,1fr)_84px_90px_70px] gap-2.5 p-2 text-xs items-center"
                  >
                    <span className="flex flex-col min-w-0">
                      <span className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {x.item}
                      </span>
                      <span className="text-[10px] text-[#536271]">{x.where}</span>
                    </span>
                    <span style={{ color: x.expFg }} className="font-mono text-[10px]">
                      {x.exp}
                    </span>
                    <span className="text-right tabular-nums">{x.units}</span>
                    <span className="text-right font-semibold text-[#B42318] tabular-nums">
                      {x.val}
                    </span>
                  </div>
                ))}
                {etcModel.exp.none && (
                  <div className="p-4 text-xs text-[#2F855A] font-medium">
                    All stock is used before it expires at this bed count.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Emergency Health Kits View */}
      {activeSubTab === 'kits' && (
        <section className="flex flex-col gap-3.5">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-col gap-1 max-w-[900px]">
              <h2 className="m-0 text-xl font-semibold text-[#14212E]">
                Emergency health kits · estimated beneficiaries
              </h2>
              <span className="text-xs text-[#536271]">
                {kits.sub}. Beneficiaries = modules recorded × WHO beneficiaries per module. Delivered = Arrived or Received; pipeline = every other status.
              </span>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-[#14212E]">{kits.tot}</span>
                <span className="text-[11px] text-[#536271]">value of counted modules</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-[#14212E]">{kits.nMods}</span>
                <span className="text-[11px] text-[#536271]">modules counted</span>
              </div>
            </div>
          </div>

          {/* 3 Summary Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-start">
            {kits.panels.map((pn, idx) => (
              <div key={idx} className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
                <div className="bg-[#0071B8] text-white p-2.5 flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{pn.title}</span>
                  <span className="text-[11px] text-[#D6E9F7]">{pn.sub}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_max-content_max-content] gap-x-4">
                  <div className="col-span-full grid grid-cols-subgrid py-1.5 px-3 border-b border-[#DDE3E9] bg-[#F7F9FA] text-[10px] font-semibold tracking-wider uppercase text-[#536271]">
                    <span>Kit · beneficiary</span>
                    <span className="text-right text-[#087F3B]">Delivered</span>
                    <span className="text-right text-[#0062CC]">Pipeline</span>
                  </div>
                  {pn.rows.map((x, xi) => (
                    <div
                      key={xi}
                      title={x.basis}
                      className="col-span-full grid grid-cols-subgrid items-center py-2 px-3 border-b border-[#EEF2F5]"
                    >
                      <span className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#14212E]">{x.fam}</span>
                        <span className="text-xs text-[#3F4B57]">{x.unit}</span>
                        <span className="text-[10px] text-[#6B7884]">{x.mods} · {x.v}</span>
                      </span>
                      <span className="text-right text-lg font-bold text-[#087F3B] tabular-nums">{x.d}</span>
                      <span className="text-right text-lg font-bold text-[#0062CC] tabular-nums">{x.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Kit Modules Counted Table */}
          <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
            <div className="p-2.5 border-b border-[#DDE3E9] flex flex-col gap-0.5">
              <h3 className="m-0 text-sm font-semibold text-[#14212E]">Kit modules counted</h3>
              <span className="text-xs text-[#536271]">
                Each row is the module that sets the beneficiary count for its kit. Hover a row for the WHO source.
              </span>
            </div>
            <div className="overflow-auto max-h-[60vh]">
              <div className="grid grid-cols-[repeat(12,max-content)_minmax(320px,1fr)] w-max min-w-full">
                <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">SN</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Kit</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Module counted</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Item code</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Per module</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Beneficiary unit</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Delivered</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Pipeline</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Delivered ben.</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Pipeline ben.</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Value</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Countries</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">WHO basis</span>
                </div>
                {kits.rows.map((k) => (
                  <div
                    key={k.sn}
                    title={k.src}
                    className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] text-[#14212E] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
                  >
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{k.sn}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold">{k.fam}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{k.label}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{k.codes}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{k.per}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{k.unit}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#087F3B]">
                      {k.mD}
                    </span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#0062CC]">
                      {k.mP}
                    </span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-bold text-[#087F3B]">
                      {k.bD}
                    </span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-bold text-[#0062CC]">
                      {k.bP}
                    </span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{k.v}</span>
                    <span title={k.cTitle} className="py-1 px-1.5 border-r border-[#DDE3E9]">
                      {k.countries}
                    </span>
                    <span title={k.basis} className="py-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57] max-w-[520px] overflow-hidden text-ellipsis">
                      {k.basis}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {kits.other && (
              <div className="p-2 border-t border-[#DDE3E9] text-[11px] text-[#536271]">
                {kits.other}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
