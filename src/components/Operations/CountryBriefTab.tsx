import React from 'react';

interface CountryBriefTabProps {
  cs: {
    name: string;
    flag?: string;
    headline: string;
    bar: Array<{ label: string; w: string; color: string }>;
    statusCards: Array<{
      short: string;
      label: string;
      color: string;
      value: string;
      n: string;
      pct: string;
      bg: string;
      border: string;
      pick: () => void;
    }>;
    srcLegend: Array<{ label: string; color: string; value: string; pct: string }>;
    rowsNote: string;
    reqF: string;
    reqOpts: Array<{ v: string; label: string }>;
    onReq: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    dLabel: string;
    dBg: string;
    dFg: string;
    dBorder: string;
    toggleD: () => void;
    hasFilter: boolean;
    clearFilter: () => void;
    rows: Array<{
      num: number;
      orRef: string;
      srRef: string;
      poNum: string;
      desc: string;
      code: string;
      stLabel: string;
      stBg: string;
      stFg: string;
      dot: string;
      qty: string;
      uom: string;
      value: string;
      src: string;
      srcColor: string;
      ship: string;
      detail: string;
      delayed: boolean;
      delayText: string;
      open: () => void;
    }>;
    reqCols: Array<{
      title: string;
      sub: string;
      n: string;
      value: string;
      meta: string;
      bg: string;
      fg: string;
      empty: boolean;
      rows: Array<{
        num: number;
        id: string;
        rd: string;
        items: string;
        src: string;
        status: string;
        statusFg: string;
        value: string;
        segs: Array<{ label: string; w: string; color: string }>;
        open: () => void;
      }>;
    }>;
  };
}

export const CountryBriefTab: React.FC<CountryBriefTabProps> = ({ cs }) => {
  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      <div
        data-dossier="1"
        className="flex-1 min-h-[600px] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(240px,340px)] grid-rows-[auto_minmax(0,1fr)] gap-4"
      >
        {/* Country Header Card */}
        <div
          data-clip="1"
          className="relative isolate overflow-hidden bg-[#14212E] text-white rounded-xl p-3 md:p-4 flex flex-col gap-2.5 min-w-0"
        >
          {cs.flag && (
            <div
              data-clip="1"
              aria-hidden="true"
              className="absolute inset-0 -z-10 pointer-events-none overflow-hidden rounded-[inherit]"
            >
              <div
                style={{
                  backgroundImage: `url(${cs.flag})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: 0.2,
                  filter: 'saturate(0.9)',
                }}
                className="absolute -right-16 top-1/2 w-[300px] h-[300px] -translate-y-1/2"
              />
              <div
                style={{
                  background: 'radial-gradient(circle at 100% 50%, rgba(20,33,46,0) 0%, rgba(20,33,46,0.35) 45%, rgba(20,33,46,0) 70%)',
                }}
                className="absolute inset-0"
              />
            </div>
          )}

          <div className="flex flex-col gap-1 min-w-0">
            <span className="flex items-baseline gap-2 md:gap-3.5 flex-wrap">
              {cs.flag && (
                <span
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url(${cs.flag})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                  }}
                  className="flex-none self-center w-10 h-10"
                />
              )}
              <span className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">{cs.name}</span>
              <span className="text-xs text-[#C9D3DC]">{cs.headline}</span>
            </span>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-[#2A3A4A] mt-1">
              {cs.bar.map((s, idx) => (
                <span key={idx} title={s.label} style={{ width: s.w, backgroundColor: s.color }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cs.statusCards.map((k, idx) => (
              <button
                type="button"
                key={idx}
                onClick={k.pick}
                style={{ borderColor: k.border, backgroundColor: k.bg }}
                className="cursor-pointer text-left border rounded-lg p-2 flex flex-col gap-0.5 text-white min-w-0 hover:opacity-90 transition-opacity"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap min-w-0">
                  <span className="w-2 h-2 rounded-xs flex-none" style={{ backgroundColor: k.color }} />
                  <span className="overflow-hidden text-ellipsis">{k.short}</span>
                </span>
                <span className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-lg font-semibold">{k.value}</span>
                  <span className="text-[11px] text-[#AEBBC7] whitespace-nowrap">{k.n} · {k.pct}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Fulfilled From Card */}
        <div className="bg-white border border-[#DDE3E9] rounded-xl p-3.5 flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">Fulfilled from</span>
          {cs.srcLegend.map((p, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <span className="flex justify-between gap-2 text-xs">
                <span className="font-medium text-[#14212E]">{p.label}</span>
                <span className="text-[#536271]">
                  <strong className="text-[#14212E] font-semibold">{p.value}</strong> · {p.pct}
                </span>
              </span>
              <span className="h-1.5 rounded-full bg-[#EEF2F5] overflow-hidden">
                <span className="block h-full" style={{ width: p.pct, backgroundColor: p.color }} />
              </span>
            </div>
          ))}
        </div>

        {/* Items Table Card */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-[#DDE3E9] rounded-xl flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-[#DDE3E9] flex flex-wrap gap-2 items-center justify-between">
            <span className="flex items-baseline gap-2.5">
              <h3 className="m-0 text-base font-semibold text-[#14212E]">Items</h3>
              <span className="text-xs text-[#536271]">{cs.rowsNote}</span>
            </span>
            <span className="flex gap-2 items-center flex-wrap">
              <select
                value={cs.reqF}
                onChange={cs.onReq}
                className="text-xs py-1.5 px-2.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] max-w-[240px]"
              >
                <option value="">All requests</option>
                {cs.reqOpts.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={cs.toggleD}
                style={{ borderColor: cs.dBorder, backgroundColor: cs.dBg, color: cs.dFg }}
                className="cursor-pointer text-xs py-1.5 px-3 rounded-md border font-medium whitespace-nowrap transition-colors"
              >
                {cs.dLabel}
              </button>
              {cs.hasFilter && (
                <button
                  type="button"
                  onClick={cs.clearFilter}
                  className="cursor-pointer border-0 bg-transparent text-xs font-medium text-[#0071B8] hover:underline"
                >
                  Show all
                </button>
              )}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            <div className="grid grid-cols-[repeat(10,max-content)_minmax(max-content,1fr)] w-max min-w-full">
              {/* Sticky Table Header */}
              <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] border-b border-[#005A93] text-[10px] font-semibold tracking-wider uppercase text-white">
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">OR Ref</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">SR Ref</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">PO No.</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Item</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Status</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Qty</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Value</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Source</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Shipment</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Where it is / why</span>
              </div>

              {cs.rows.map((l) => (
                <button
                  type="button"
                  key={l.num}
                  onClick={l.open}
                  className="cursor-pointer col-span-full border-0 border-b border-[#DDE3E9] bg-white grid grid-cols-subgrid p-0 text-left items-stretch text-[11px] text-[#14212E] whitespace-nowrap hover:bg-[#F3F8FC] transition-colors"
                >
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271] tabular-nums">
                    {l.num}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">
                    {l.orRef}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">
                    {l.srRef}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">
                    {l.poNum}
                  </span>
                  <span
                    title={l.desc}
                    className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-2 max-w-[520px] overflow-hidden"
                  >
                    <span className="font-mono text-[10px] text-[#536271] flex-none">{l.code}</span>
                    <span className="font-medium overflow-hidden text-ellipsis">{l.desc}</span>
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center">
                    <span
                      style={{ backgroundColor: l.stBg, color: l.stFg }}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.dot }} />
                      {l.stLabel}
                    </span>
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">
                    {l.qty} <span className="text-[10px] text-[#536271]">{l.uom}</span>
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">
                    {l.value}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: l.srcColor }} />
                    {l.src}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">
                    {l.ship}
                  </span>
                  <span
                    title={l.detail}
                    className="py-1 px-1.5 border-r border-[#DDE3E9] max-w-[560px] overflow-hidden flex items-center gap-1.5 text-[#3F4B57] text-[11px]"
                  >
                    {l.delayed && (
                      <span className="flex-none text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDEBE2] text-[#C92A2A] whitespace-nowrap">
                        {l.delayText}
                      </span>
                    )}
                    <span className="overflow-hidden text-ellipsis">{l.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Request Columns: OR vs SR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cs.reqCols.map((g, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#DDE3E9] rounded-xl overflow-hidden flex flex-col min-w-0"
          >
            <div
              style={{ backgroundColor: g.bg }}
              className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2.5 flex-wrap items-start"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-bold" style={{ color: g.fg }}>
                  {g.title}
                </span>
                <span className="text-xs text-[#3F4B57]">
                  {g.sub} · {g.n}
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-lg font-bold text-[#14212E]">{g.value}</span>
                <span className="text-[11px] text-[#3F4B57]">{g.meta}</span>
              </span>
            </div>
            <div className="max-h-[340px] overflow-y-auto divide-y divide-[#DDE3E9]">
              {g.rows.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={r.open}
                  className="cursor-pointer w-full bg-white px-3 py-1.5 flex items-center gap-2.5 text-left text-[#14212E] whitespace-nowrap text-[11px] hover:bg-[#F3F8FC] transition-colors"
                >
                  <span className="flex-none w-7 text-right text-[#536271] tabular-nums">{r.num}</span>
                  <span className="flex-none font-mono text-[11px] font-semibold">{r.id}</span>
                  <span className="flex-none w-[60px] flex h-1.5 rounded-full overflow-hidden bg-[#EEF2F5]">
                    {r.segs.map((s, si) => (
                      <span key={si} title={s.label} style={{ width: s.w, backgroundColor: s.color }} />
                    ))}
                  </span>
                  <span
                    title={`Requested ${r.rd} · ${r.items} · ${r.src}`}
                    className="flex-1 min-w-0 overflow-hidden text-ellipsis text-[#536271]"
                  >
                    Requested {r.rd} · {r.items} · {r.src}
                  </span>
                  <span className="flex-none font-semibold" style={{ color: r.statusFg }}>
                    {r.status}
                  </span>
                  <span className="flex-none font-bold">{r.value}</span>
                </button>
              ))}
              {g.empty && (
                <div className="p-4 text-xs text-[#536271]">None for this country.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
