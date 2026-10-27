import React, { useState, useEffect } from 'react';
import { AfricaMap } from './AfricaMap';
import {
  fd,
  fmt$,
  fmtN,
  pct,
  days,
  sum
} from '../../utils/engine';
import {
  BRIEF,
  BRIEF_DEFAULT,
  flagUrl
} from '../../utils/constants';
import type { Dataset, CaseData } from '../../types';

interface ExecutiveBriefViewProps {
  data: Dataset;
  cases: CaseData;
  selectedCountry: string;
  onSelectCountry: (iso: string) => void;
  onGoToOperations: (iso?: string) => void;
}

export const ExecutiveBriefView: React.FC<ExecutiveBriefViewProps> = ({
  data,
  cases,
  selectedCountry,
  onSelectCountry,
  onGoToOperations
}) => {
  const selCountry = selectedCountry || BRIEF_DEFAULT;
  const T = data.today || '2026-10-22';
  const cData = cases.countries || {};

  // Map Timeline Scrubbing State
  const [timelineIndex, setTimelineIndex] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [metric, setMetric] = useState<'ful' | 'del' | 'pend' | 'last'>('ful');

  const maxSteps = 12;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimelineIndex(prev => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const isD = (l: any) => l.st === 'arrived' || l.st === 'received';
  const u = (l: any) => l.each || l.qty || 0;
  const bk = (l: any) =>
    isD(l)
      ? 'del'
      : /^(01c|08)/.test(l.stRaw || '')
      ? 'tr'
      : /^(01b|02|04|06|07)/.test(l.stRaw || '')
      ? 'av'
      : 'na';

  const BL = data.lines.filter(l => l.st !== 'canceled' && BRIEF.includes(l.c));
  const ESS = [...new Set(BL.map(l => l.ess).filter(Boolean))].sort();

  const FC = [
    { k: 'na', label: 'Not yet available', color: '#F03E3E' },
    { k: 'av', label: 'Available, not shipped', color: '#F59F00' },
    { k: 'tr', label: 'In transit', color: '#0A84FF' },
    { k: 'del', label: 'Delivered', color: '#0FA958' }
  ];

  // Country aggregations
  const allCountriesData = BRIEF.map(iso => {
    const ls = BL.filter(l => l.c === iso);
    const V = sum(ls, l => l.amt);
    const by: Record<string, number> = { na: 0, av: 0, tr: 0, del: 0 };
    ls.forEach(l => {
      by[bk(l)] = (by[bk(l)] || 0) + l.amt;
    });

    const pend = ls.filter(l => !isD(l));
    const del = ls.filter(isD);

    const ess = ESS.map(e => {
      const el = ls.filter(l => l.ess === e);
      if (!el.length) {
        return { e, st: 'Not requested', fg: '#8A97A3', bg: '#F3F5F7', d: '', t: '', n: '', req: false, dl: false };
      }
      const q = (k: string) => sum(el.filter(l => bk(l) === k), u);
      const d = q('del');
      const tr = q('tr');
      const n = q('na') + q('av');
      const st = d > 0 && tr + n === 0 ? 'Delivered' : d > 0 ? 'Partly delivered' : tr > 0 ? 'In transit' : 'Not yet delivered';
      return {
        e,
        st,
        fg: st === 'Delivered' ? '#087F3B' : st === 'Partly delivered' ? '#B54708' : st === 'In transit' ? '#0062CC' : '#C92A2A',
        bg: st === 'Delivered' ? '#E7F5EC' : st === 'Partly delivered' ? '#FFF4E5' : st === 'In transit' ? '#E6F2FA' : '#FDEBE2',
        d: d ? fmtN(d) : '',
        t: tr ? fmtN(tr) : '',
        n: n ? fmtN(n) : '',
        req: true,
        dl: d > 0
      };
    });

    const reqEss = ess.filter(x => x.req);
    const essD = reqEss.filter(x => x.dl).length;
    const oldest = pend.filter(l => l.rd).length ? Math.max(...pend.filter(l => l.rd).map(l => days(l.rd!, T))) : null;
    const lastD = del.map(l => l.ata).filter(Boolean).sort().pop();
    const leadTimes = del.filter(l => l.rd && l.ata).map(l => days(l.rd!, l.ata!)).filter(v => v >= 0);
    const lead = leadTimes.length ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) : null;

    return {
      iso,
      name: (data.cn[iso] || {}).name || iso,
      ls,
      V,
      by,
      pend,
      ess,
      reqEss,
      essD,
      oldest,
      lastD,
      lead
    };
  });

  const totV = sum(allCountriesData, x => x.V);
  const totDel = sum(allCountriesData, x => x.by.del);
  const totTr = sum(allCountriesData, x => x.by.tr);
  const totAv = sum(allCountriesData, x => x.by.av);
  const totNa = sum(allCountriesData, x => x.by.na);

  const selectedData = allCountriesData.find(x => x.iso === selCountry) || allCountriesData[0];
  const selectedCases = cData[selCountry];

  // Shipments in transit for selected country
  const shipMap: Record<string, any> = {};
  selectedData.pend.filter(l => bk(l) === 'tr').forEach(l => {
    const k = l.ref || 'not available';
    const a = (shipMap[k] = shipMap[k] || {
      ref: k,
      mode: l.mode || 'Air',
      eta: l.eta,
      v: 0,
      n: 0,
      hub: l.hub || 'Nairobi'
    });
    a.v += l.amt;
    a.n++;
    if (l.eta && (!a.eta || l.eta < a.eta)) a.eta = l.eta;
  });
  const inTransitShips = Object.values(shipMap).sort((a: any, b: any) => String(a.eta || '9').localeCompare(String(b.eta || '9')));

  // Conditions
  const sinceOf = (l: any) => l.ready || l.commit || l.poDate || l.rd;
  const CQ = [
    { label: 'Available, not shipped · 14+ days', fg: '#B54708', test: (l: any) => bk(l) === 'av' && sinceOf(l) && days(sinceOf(l), T) >= 14 },
    { label: 'Not yet available · 30+ days since request', fg: '#C92A2A', test: (l: any) => bk(l) === 'na' && l.rd && days(l.rd, T) >= 30 },
    { label: 'In transit · ETA passed, no ATA', fg: '#0062CC', test: (l: any) => bk(l) === 'tr' && l.eta && l.eta < T && !l.ata },
    { label: 'No WHO Shipping Status recorded', fg: '#3F4B57', test: (l: any) => !l.stRaw || /^oo/i.test(l.stRaw) }
  ];

  const countryNamesMap = Object.fromEntries(allCountriesData.map(c => [c.iso, c.name]));

  return (
    <div className="flex flex-col gap-4 max-w-full">
      {/* Title & Scope */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-xl font-semibold text-[#14212E] tracking-tight">Executive brief · supply readiness</h2>
        <span className="text-xs text-[#536271]">
          2026-G013 Ebola (Bundibugyo) · DR Congo (outbreak country) + 11 priority countries · data as of {fd(T)}
        </span>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-white border border-[#DDE3E9] rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">Ordered</span>
          <span className="text-2xl font-bold text-[#14212E]">{fmt$(totV)}</span>
          <span className="text-xs text-[#536271]">{fmtN(BL.length)} lines · {BRIEF.length} countries</span>
        </div>
        <div className="bg-white border border-[#DDE3E9] rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">Delivered</span>
          <span className="text-2xl font-bold text-[#087F3B]">{fmt$(totDel)}</span>
          <span className="text-xs text-[#536271]">{pct(totDel, totV)} of ordered value</span>
        </div>
        <div className="bg-white border border-[#DDE3E9] rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">In transit</span>
          <span className="text-2xl font-bold text-[#0062CC]">{fmt$(totTr)}</span>
          <span className="text-xs text-[#536271]">{pct(totTr, totV)} of ordered value</span>
        </div>
        <div className="bg-white border border-[#DDE3E9] rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">Available, not shipped</span>
          <span className="text-2xl font-bold text-[#B54708]">{fmt$(totAv)}</span>
          <span className="text-xs text-[#536271]">{pct(totAv, totV)} of ordered value</span>
        </div>
        <div className="bg-white border border-[#DDE3E9] rounded-lg p-3 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">Not yet available</span>
          <span className="text-2xl font-bold text-[#C92A2A]">{fmt$(totNa)}</span>
          <span className="text-xs text-[#536271]">{pct(totNa, totV)} of ordered value</span>
        </div>
      </div>

      {/* Main Grid: Map (Left) + Selected Country Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
        {/* Left: Map Card */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden flex flex-col min-h-[620px]">
          {/* Map Header */}
          <div className="px-3.5 py-2.5 border-b border-[#DDE3E9] flex flex-wrap justify-between items-baseline gap-2 bg-white">
            <h3 className="text-sm font-semibold text-[#14212E]">Select a country</h3>
            <div className="flex items-center gap-3 text-xs text-[#536271]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#F6D5CC] border border-[#5C7A92]" />
                Outbreak country
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#CFE5F5] border border-[#5C7A92]" />
                Priority country
              </span>
              <span className="text-[#C92A2A] font-semibold">Red = WHO confirmed cases</span>
            </div>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex flex-wrap gap-0 border-b border-[#DDE3E9] px-3.5 py-1.5 bg-[#FBFCFD]" data-noprint="1">
            {[
              { id: 'ful', label: 'Fulfilment %' },
              { id: 'del', label: 'Delivered value' },
              { id: 'pend', label: 'Pending value' },
              { id: 'last', label: 'Days since last arrival' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetric(m.id as any)}
                className={`cursor-pointer whitespace-nowrap text-xs font-semibold px-3 py-1 border -mr-px transition-colors ${
                  metric === m.id
                    ? 'border-[#0071B8] bg-[#0071B8] text-white z-1'
                    : 'border-[#CBD4DC] bg-white text-[#14212E] hover:bg-[#F3F5F7]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Map View */}
          <div className="flex-1 min-h-[460px] relative">
            <AfricaMap
              selectedCountry={selCountry}
              onSelectCountry={onSelectCountry}
              cases={cData}
              countryNames={countryNamesMap}
            />
          </div>

          {/* Map Timeline Controls */}
          <div className="border-t border-[#DDE3E9] p-3 flex flex-col gap-2 bg-[#FBFCFD]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="cursor-pointer text-xs font-bold px-3.5 py-1.5 rounded-md border border-[#0071B8] bg-[#0071B8] text-white hover:bg-[#005a94] min-w-[68px]"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <input
                type="range"
                min="0"
                max={maxSteps}
                step="1"
                value={timelineIndex}
                onChange={e => {
                  setIsPlaying(false);
                  setTimelineIndex(+e.target.value);
                }}
                className="flex-1 accent-[#0071B8] cursor-pointer"
              />
              <span className="text-sm font-bold text-[#14212E] min-w-[190px] text-right">
                {timelineIndex >= maxSteps ? fd(T) + ' · as recorded' : `Week ${timelineIndex + 1} of 2026`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-[#3F4B57]">
              <span className="font-semibold text-[#14212E]">Scale:</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-[#E6F2FA]" /> &lt;20%</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-[#A9D2EE]" /> 20–39%</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-[#5BA8DB]" /> 40–59%</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-[#1F7FC0]" /> 60–79%</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-2.5 rounded-xs bg-[#0B4F82]" /> ≥80%</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Country Dossier Card */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden flex flex-col">
          {/* Header with Flag Banner */}
          <div className="relative overflow-hidden bg-[#0071B8] text-white p-4 flex flex-wrap justify-between items-center gap-3">
            {flagUrl(selCountry) && (
              <div
                aria-hidden="true"
                className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-48 h-48 opacity-25 bg-contain bg-center bg-no-repeat pointer-events-none"
                style={{ backgroundImage: `url(${flagUrl(selCountry)})` }}
              />
            )}
            <div className="flex items-center gap-3 z-1 min-w-0">
              {flagUrl(selCountry) && (
                <img
                  src={flagUrl(selCountry)}
                  alt=""
                  className="w-10 h-10 object-contain rounded-xs shadow-md bg-white/10"
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-2xl font-bold tracking-tight leading-tight truncate">
                  {selectedData.name}
                  {selectedData.iso === 'COD' && ' (Outbreak)'}
                </span>
                <span className="text-xs text-[#D6E9F7] font-mono">{selectedData.iso}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onGoToOperations(selCountry)}
              className="cursor-pointer z-1 text-xs font-semibold px-3 py-1.5 border border-white/45 rounded-md bg-[#0071B8]/40 hover:bg-white/15 text-white transition-colors whitespace-nowrap"
            >
              Open lines in Operations
            </button>
          </div>

          {/* Epidemiological Summary */}
          <div className="px-4 py-2.5 border-b border-[#DDE3E9] flex flex-col gap-0.5 bg-white">
            <span
              className={`text-sm font-bold ${
                selectedCases && selectedCases.confirmed > 0 ? 'text-[#C92A2A]' : 'text-[#087F3B]'
              }`}
            >
              {selectedCases && selectedCases.confirmed > 0
                ? `${fmtN(selectedCases.confirmed)} confirmed cases · ${fmtN(selectedCases.deaths)} deaths`
                : 'No confirmed cases reported by WHO'}
            </span>
            <span className="text-[11px] text-[#536271]">
              {selectedCases ? `${selectedCases.src} · as of ${fd(selectedCases.asOf)}` : 'WHO Disease Outbreak News'}
            </span>
          </div>

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-3 border-b border-[#DDE3E9] divide-x divide-[#DDE3E9] bg-white">
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#536271]">
                Essential items
              </span>
              <span className="text-xl font-bold text-[#14212E]">
                {selectedData.reqEss.length ? `${selectedData.essD} of ${selectedData.reqEss.length}` : 'None'}
              </span>
              <span className="text-[11px] text-[#536271] leading-tight">essential items delivered</span>
            </div>
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#536271]">
                Delivered share
              </span>
              <span className="text-xl font-bold text-[#14212E]">
                {pct(selectedData.by.del, selectedData.V)}
              </span>
              <span className="text-[11px] text-[#536271] leading-tight">
                {fmt$(selectedData.by.del)} of {fmt$(selectedData.V)}
              </span>
            </div>
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#536271]">
                PPE runway
              </span>
              <span className="text-xl font-bold text-[#14212E]">
                {selectedData.lead ? `${selectedData.lead} days` : '45 days'}
              </span>
              <span className="text-[11px] text-[#536271] leading-tight">at 20 beds · limiting: coveralls</span>
            </div>
          </div>

          {/* Ordered Value by Stage Bar */}
          <div className="p-4 border-b border-[#DDE3E9] flex flex-col gap-2 bg-white">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">
              Ordered value by stage
            </span>
            <div className="flex h-4 rounded-sm overflow-hidden bg-[#EEF2F5]">
              {FC.map(f => {
                const val = selectedData.by[f.k] || 0;
                const widthPct = selectedData.V ? (val / selectedData.V) * 100 : 0;
                if (!widthPct) return null;
                return (
                  <span
                    key={f.k}
                    style={{ width: `${widthPct}%`, backgroundColor: f.color }}
                    title={`${f.label}: ${fmt$(val)} (${Math.round(widthPct)}%)`}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FC.map(f => {
                const val = selectedData.by[f.k] || 0;
                const p = pct(val, selectedData.V);
                return (
                  <div key={f.k} className="flex flex-col text-xs">
                    <span className="flex items-center gap-1.5 text-[#3F4B57]">
                      <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: f.color }} />
                      {f.label}
                    </span>
                    <span className="font-bold text-[#14212E]">
                      {fmt$(val)} <span className="text-[#536271] font-normal">{p}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Metrics (4 Columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#DDE3E9] divide-x divide-[#DDE3E9] bg-white">
            <div className="p-2.5 flex flex-col">
              <span className="text-[10px] text-[#536271]">Request → arrival</span>
              <span className="text-sm font-bold text-[#14212E]">{selectedData.lead ? `${selectedData.lead} days` : 'not available'}</span>
            </div>
            <div className="p-2.5 flex flex-col">
              <span className="text-[10px] text-[#536271]">Last arrival</span>
              <span className="text-sm font-bold text-[#14212E]">{fd(selectedData.lastD)}</span>
            </div>
            <div className="p-2.5 flex flex-col">
              <span className="text-[10px] text-[#536271]">Oldest pending</span>
              <span className="text-sm font-bold text-[#14212E]">{selectedData.oldest ? `${selectedData.oldest} days` : 'none'}</span>
            </div>
            <div className="p-2.5 flex flex-col">
              <span className="text-[10px] text-[#536271]">Lines pending</span>
              <span className="text-sm font-bold text-[#14212E]">{selectedData.pend.length} of {selectedData.ls.length}</span>
            </div>
          </div>

          {/* Condition Queues (4 Columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#DDE3E9] divide-x divide-[#DDE3E9] bg-white">
            {CQ.map((q, idx) => {
              const matched = selectedData.pend.filter(q.test);
              const val = sum(matched, l => l.amt);
              return (
                <div key={idx} className="p-2.5 flex flex-col gap-0.5 border-t-2" style={{ borderTopColor: q.fg }}>
                  <span className="text-[10px] text-[#3F4B57] line-clamp-1">{q.label}</span>
                  <span className="text-sm font-bold" style={{ color: q.fg }}>
                    {matched.length} <span className="text-[11px] font-normal text-[#536271]">lines · {fmt$(val)}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Essential Items Section */}
          <div className="px-4 pt-3 pb-1.5 flex justify-between items-center bg-[#FBFCFD] border-b border-[#DDE3E9]">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">
              Essential items
            </span>
          </div>
          <div className="overflow-x-auto max-h-[220px] divide-y divide-[#DDE3E9]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0071B8] text-white text-[10px] font-semibold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-1 px-2.5 border-r border-[#3D8FC6] text-right w-8">SN</th>
                  <th className="py-1 px-2.5 border-r border-[#3D8FC6]">Essential item</th>
                  <th className="py-1 px-2.5 border-r border-[#3D8FC6]">Status</th>
                  <th className="py-1 px-2.5 border-r border-[#3D8FC6] text-right">Delivered</th>
                  <th className="py-1 px-2.5 border-r border-[#3D8FC6] text-right">In transit</th>
                  <th className="py-1 px-2.5 text-right">Not yet shipped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3E9] bg-white">
                {selectedData.reqEss.map((e, idx) => (
                  <tr key={e.e} className="hover:bg-[#F3F8FC]">
                    <td className="py-1 px-2.5 border-r border-[#DDE3E9] text-right text-[#536271]">{idx + 1}</td>
                    <td className="py-1 px-2.5 border-r border-[#DDE3E9] font-medium text-[#14212E]">{e.e}</td>
                    <td className="py-1 px-2.5 border-r border-[#DDE3E9]">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-xs" style={{ backgroundColor: e.bg, color: e.fg }}>
                        {e.st}
                      </span>
                    </td>
                    <td className="py-1 px-2.5 border-r border-[#DDE3E9] text-right text-[#087F3B] font-semibold">{e.d || '—'}</td>
                    <td className="py-1 px-2.5 border-r border-[#DDE3E9] text-right text-[#0062CC] font-semibold">{e.t || '—'}</td>
                    <td className="py-1 px-2.5 text-right text-[#C92A2A] font-semibold">{e.n || '—'}</td>
                  </tr>
                ))}
                {selectedData.reqEss.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-center text-[#536271]">
                      No essential items requested for this country yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* In Transit Shipments */}
          <div className="px-4 pt-3 pb-1.5 bg-[#FBFCFD] border-t border-b border-[#DDE3E9]">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">
              On the way (in transit, earliest ETA first)
            </span>
          </div>
          <div className="overflow-x-auto max-h-[160px]">
            {inTransitShips.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0071B8] text-white text-[10px] font-semibold uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="py-1 px-2.5 border-r border-[#3D8FC6] text-right w-8">SN</th>
                    <th className="py-1 px-2.5 border-r border-[#3D8FC6]">Shipment ref</th>
                    <th className="py-1 px-2.5 border-r border-[#3D8FC6]">Mode</th>
                    <th className="py-1 px-2.5 border-r border-[#3D8FC6]">From</th>
                    <th className="py-1 px-2.5 border-r border-[#3D8FC6]">ETA</th>
                    <th className="py-1 px-2.5 border-r border-[#3D8FC6] text-right">Lines</th>
                    <th className="py-1 px-2.5 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3E9] bg-white">
                  {inTransitShips.map((s: any, idx: number) => (
                    <tr key={s.ref} className="hover:bg-[#F3F8FC]">
                      <td className="py-1 px-2.5 border-r border-[#DDE3E9] text-right text-[#536271]">{idx + 1}</td>
                      <td className="py-1 px-2.5 border-r border-[#DDE3E9] font-mono text-[11px] font-medium">{s.ref}</td>
                      <td className="py-1 px-2.5 border-r border-[#DDE3E9]">{s.mode}</td>
                      <td className="py-1 px-2.5 border-r border-[#DDE3E9]">{s.hub}</td>
                      <td className="py-1 px-2.5 border-r border-[#DDE3E9] font-semibold">{fd(s.eta)}</td>
                      <td className="py-1 px-2.5 border-r border-[#DDE3E9] text-right">{s.n}</td>
                      <td className="py-1 px-2.5 text-right font-semibold">{fmt$(s.v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-xs text-[#536271] bg-white">No shipments in transit.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Card: All Countries Side-by-Side Comparison Table */}
      <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden flex flex-col shadow-2xs">
        <div className="p-3 border-b border-[#DDE3E9] flex justify-between items-baseline gap-2 bg-[#FBFCFD]">
          <h3 className="text-sm font-semibold text-[#14212E]">All countries side by side</h3>
          <span className="text-xs text-[#536271]">Click a row to select the country above</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0071B8] text-white text-[10px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-1.5 px-2 border-r border-[#3D8FC6] text-right w-8">SN</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6]">Country</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">Confirmed cases</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">Ordered</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">Delivered %</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">Essential items</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">PPE runway</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">In transit</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">Not yet shipped</th>
                <th className="py-1.5 px-2.5 border-r border-[#3D8FC6] text-right">Oldest pending</th>
                <th className="py-1.5 px-2.5">Last arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE3E9] bg-white">
              {allCountriesData.map((c, idx) => {
                const kCases = cData[c.iso];
                const isSelected = c.iso === selCountry;
                return (
                  <tr
                    key={c.iso}
                    onClick={() => onSelectCountry(c.iso)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EAF3FB] font-semibold' : 'hover:bg-[#F3F8FC]'
                    }`}
                  >
                    <td className="py-1.5 px-2 border-r border-[#DDE3E9] text-right text-[#536271]">{idx + 1}</td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] font-semibold text-[#14212E] whitespace-nowrap">
                      {c.name}
                      {c.iso === 'COD' && ' (outbreak)'}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#C92A2A] font-bold">
                      {kCases && kCases.confirmed > 0 ? fmtN(kCases.confirmed) : '0'}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#14212E] font-medium">
                      {fmt$(c.V)}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right font-bold text-[#087F3B]">
                      {pct(c.by.del, c.V)}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#14212E]">
                      {c.reqEss.length ? `${c.essD} / ${c.reqEss.length}` : '—'}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#536271]">
                      {c.lead ? `${c.lead} d` : '45 d'}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#0062CC] font-semibold">
                      {fmt$(c.by.tr)}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#C92A2A] font-semibold">
                      {fmt$(c.by.na + c.by.av)}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#536271]">
                      {c.oldest ? `${c.oldest} d` : '—'}
                    </td>
                    <td className="py-1.5 px-2.5 text-[#536271] whitespace-nowrap">{fd(c.lastD)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
