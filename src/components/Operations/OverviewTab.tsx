import React from 'react';
import { fmt$, fmtN, pct } from '../../utils/engine';
import { BN, SRC } from '../../utils/constants';

interface OverviewTabProps {
  ov: {
    total: string;
    scope: string;
    bar: Array<{ label: string; color: string; w: string; pct: string; inLabel: string }>;
    legend: Array<{ label: string; color: string; value: string; pct: string; n: string; sub?: string }>;
    alerts: Array<{ label: string; value: string; unit?: string; sub: string; color: string }>;
    sk: {
      vb: string;
      links: Array<{ d: string; fill: string; title: string }>;
      l: Array<{ x: number; y: number; h: number; color: string; label: string; value: string; right: string; top: string }>;
      r: Array<{ x: number; y: number; h: number; color: string; label: string; value: string; left: string; top: string }>;
    };
    bnCards: Array<{ label: string; stage: string; q: string; color: string; value: string; n: string; w: string; bg: string; border: string; pick: () => void }>;
    bnFilter?: string;
    hasBnF: boolean;
    clearBn: () => void;
    attAll: Array<{
      country: string;
      id: string;
      typeShort: string;
      typeBg: string;
      typeFg: string;
      n: string;
      value: string;
      bn: string;
      bnBg: string;
      bnFg: string;
      bnColor: string;
      bnStage: string;
      bnDays: string;
      bnWho: string;
      bnItem: string;
      others: string;
      hasOthers: boolean;
      open: () => void;
    }>;
    noAtt: boolean;
    tiles: Array<{
      name: string;
      value: string;
      pct: string;
      segs: Array<{ label: string; w: string; color: string }>;
      hasLate?: boolean;
      late?: string;
      pick: () => void;
    }>;
  };
  onSelectCountryBrief: (iso: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ ov, onSelectCountryBrief }) => {
  return (
    <div className="flex-1 min-h-[600px] grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr] grid-rows-[auto_minmax(0,1fr)] gap-4">
      {/* Top Banner: Total requested and Stage Breakdown */}
      <div className="col-span-1 lg:col-span-2 bg-[#14212E] rounded-xl p-5 text-white flex gap-5 md:gap-8 flex-wrap items-center">
        <div className="flex flex-col gap-1 flex-none">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7CC4EC]">Total requested</span>
          <span className="text-4xl md:text-5xl font-semibold tracking-tight leading-none">{ov.total}</span>
          <span className="text-[13px] text-[#C9D3DC] max-w-[260px]">{ov.scope}</span>
        </div>
        <div className="flex-1 min-w-[280px] flex flex-col gap-3">
          <div className="flex h-[26px] rounded-md overflow-hidden bg-[#2A3A4A]">
            {ov.bar.map((s, idx) => (
              <div
                key={idx}
                title={`${s.label} · ${s.pct}`}
                style={{ width: s.w, backgroundColor: s.color }}
                className="flex items-center px-2 text-xs font-bold text-white overflow-hidden whitespace-nowrap transition-all"
              >
                {s.inLabel}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ov.legend.map((g, idx) => (
              <div key={idx} className="flex flex-col gap-0.5 min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ backgroundColor: g.color }} />
                  {g.label}
                </span>
                <span className="text-xl font-semibold text-white">{g.value}</span>
                <span className="text-[11px] text-[#AEBBC7]">{g.pct} · {g.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exceptions Card */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-4 flex flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271] mb-1">Exceptions</span>
        {ov.alerts.map((k, idx) => (
          <div key={idx} className="flex justify-between items-center gap-2.5 py-2 border-t border-[#EEF2F5] first:border-0">
            <span className="flex flex-col gap-0.5 min-w-0">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-[#14212E]">
                <span className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: k.color }} />
                {k.label}
              </span>
              <span className="text-xs text-[#536271]">{k.sub}</span>
            </span>
            <span className="text-3xl font-semibold" style={{ color: k.color }}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* From Source to Status: Sankey Flow */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-4 flex flex-col gap-1 min-h-[300px]">
        <h2 className="m-0 text-base font-semibold text-[#14212E]">From source to status</h2>
        <span className="text-xs text-[#536271]">Where items are fulfilled from → where they are now (by value)</span>
        <div className="relative flex-1 min-h-[220px] my-2">
          <svg viewBox={ov.sk.vb} preserveAspectRatio="none" className="absolute inset-0 w-full h-full block">
            {ov.sk.links.map((p, idx) => (
              <path key={idx} d={p.d} fill={p.fill} fillOpacity={0.32}>
                <title>{p.title}</title>
              </path>
            ))}
            {ov.sk.l.map((n, idx) => (
              <rect key={'l' + idx} x={n.x} y={n.y} width={14} height={n.h} fill={n.color} rx={2} />
            ))}
            {ov.sk.r.map((n, idx) => (
              <rect key={'r' + idx} x={n.x} y={n.y} width={14} height={n.h} fill={n.color} rx={2} />
            ))}
          </svg>
          {ov.sk.l.map((n, idx) => (
            <span
              key={'lt' + idx}
              style={{ right: n.right, top: n.top, transform: 'translateY(-50%)' }}
              className="absolute text-xs whitespace-nowrap text-right leading-tight select-none pointer-events-none"
            >
              <strong className="font-semibold text-[#14212E]">{n.label}</strong>
              <br />
              <span className="text-[#536271]">{n.value}</span>
            </span>
          ))}
          {ov.sk.r.map((n, idx) => (
            <span
              key={'rt' + idx}
              style={{ left: n.left, top: n.top, transform: 'translateY(-50%)' }}
              className="absolute text-xs whitespace-nowrap leading-tight select-none pointer-events-none"
            >
              <strong className="font-semibold text-[#14212E]">{n.label}</strong>
              <br />
              <span className="text-[#536271]">{n.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Needs Attention · What's Holding It Up */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl flex flex-col min-h-[300px] overflow-hidden">
        <div className="p-3 border-b border-[#DDE3E9] flex flex-col gap-2">
          <div className="flex justify-between items-baseline gap-2">
            <h2 className="m-0 text-base font-semibold text-[#14212E]">Needs attention · what&apos;s holding it up</h2>
            {ov.hasBnF && (
              <button
                type="button"
                onClick={ov.clearBn}
                className="cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-[#0071B8] hover:underline whitespace-nowrap"
              >
                Show all
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {ov.bnCards.map((b, idx) => (
              <button
                type="button"
                key={idx}
                onClick={b.pick}
                title={b.q}
                style={{ backgroundColor: b.bg, borderColor: b.border }}
                className="cursor-pointer border rounded-md px-2 py-1.5 grid grid-cols-[118px_minmax(0,1fr)_auto] gap-2 items-center text-left text-[#14212E] hover:opacity-90 transition-opacity"
              >
                <span className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold whitespace-nowrap">{b.label}</span>
                  <span className="text-[10px] text-[#536271] uppercase tracking-wider">{b.stage}</span>
                </span>
                <span className="h-2 rounded-full bg-[#F3F5F7] overflow-hidden">
                  <span className="block h-full" style={{ width: b.w, backgroundColor: b.color }} />
                </span>
                <span className="flex flex-col items-end">
                  <span className="text-xs font-semibold">{b.value}</span>
                  <span className="text-[10px] text-[#536271] whitespace-nowrap">{b.n}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {ov.attAll.map((i, idx) => (
            <button
              type="button"
              key={idx}
              onClick={i.open}
              style={{ borderLeftColor: i.bnColor }}
              className="cursor-pointer w-full border-0 border-b border-[#EEF2F5] border-l-4 bg-white p-2.5 text-left flex flex-col gap-1 text-[#14212E] hover:bg-[#F7F9FA] transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <strong className="text-[13px] font-semibold whitespace-nowrap">{i.country}</strong>
                <span
                  style={{ backgroundColor: i.typeBg, color: i.typeFg }}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                >
                  {i.typeShort}
                </span>
                <span className="font-mono text-xs text-[#536271] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                  {i.id}
                </span>
                <span className="text-[13px] font-semibold">{i.value}</span>
              </span>
              <span className="flex items-center gap-1.5 flex-wrap">
                <span
                  style={{ backgroundColor: i.bnBg, color: i.bnFg }}
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                >
                  Stuck at: {i.bn}
                </span>
                <span className="text-xs font-semibold text-[#C92A2A]">{i.bnDays}</span>
              </span>
              <span className="text-xs text-[#3F4B57] leading-relaxed">
                {i.bnItem} · <span className="text-[#536271]">With: {i.bnWho}</span>
              </span>
              {i.hasOthers && <span className="text-[11px] text-[#536271]">Also: {i.others}</span>}
            </button>
          ))}
          {ov.noAtt && (
            <div className="p-4 text-sm text-[#0FA958] font-medium">No delayed items for this selection.</div>
          )}
        </div>
      </div>

      {/* Countries list */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl flex flex-col min-h-[300px] overflow-hidden">
        <div className="p-3 border-b border-[#EEF2F5] flex justify-between items-baseline gap-2">
          <h2 className="m-0 text-base font-semibold text-[#14212E]">Countries</h2>
          <span className="text-xs text-[#536271]">Click for the brief</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#EEF2F5]">
          {ov.tiles.map((c, idx) => (
            <button
              type="button"
              key={idx}
              onClick={c.pick}
              className="cursor-pointer w-full bg-white px-4 py-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-1 text-left text-[#14212E] items-center hover:bg-[#F3F8FC] transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-semibold min-w-0">
                {c.name}
                {c.hasLate && (
                  <span title={c.late} className="w-2 h-2 rounded-full bg-[#E8590C] flex-none" />
                )}
              </span>
              <span className="text-[13px] font-semibold text-right">{c.value}</span>
              <span className="flex h-1.5 rounded-full overflow-hidden bg-[#EEF2F5]">
                {c.segs.map((s, si) => (
                  <span key={si} title={s.label} style={{ width: s.w, backgroundColor: s.color }} />
                ))}
              </span>
              <span className="text-xs text-[#087F3B] font-semibold text-right">{c.pct}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
