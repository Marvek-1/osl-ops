import React from 'react';

interface ProcurementTabProps {
  proc: {
    flag?: string;
    title: string;
    where: string;
    mV: { bg: string; fg: string; pick: () => void };
    mN: { bg: string; fg: string; pick: () => void };
    exportCsv: () => void;
    stats: Array<{ label: string; value: string; sub: string; color?: string }>;
    hasActive: boolean;
    active: Array<{ k: string; v: string; clear: () => void }>;
    clearAll: () => void;
    dSt: {
      vb: string;
      center: string;
      centerSub: string;
      segs: Array<{ d: string; fill: string; title: string; pick: () => void }>;
      labels: Array<{
        pts: string;
        color: string;
        dotX: string;
        dotY: string;
        left: string;
        top: string;
        tf: string;
        align: string;
        name: string;
        full: string;
        val: string;
        weight: number;
        fg: string;
        vfg: string;
        pick: () => void;
      }>;
    };
    dTy: {
      vb: string;
      center: string;
      centerSub: string;
      segs: Array<{ d: string; fill: string; title: string; pick: () => void }>;
      labels: Array<{
        pts: string;
        color: string;
        dotX: string;
        dotY: string;
        left: string;
        top: string;
        tf: string;
        align: string;
        name: string;
        full: string;
        val: string;
        weight: number;
        fg: string;
        vfg: string;
        pick: () => void;
      }>;
    };
    hasReqBars: boolean;
    reqBars: Array<{
      id: string;
      value: string;
      w: string;
      dw: string;
      cname: string;
      meta: string;
      pick: () => void;
    }>;
    reqMore: string;
    line: {
      sub: string;
      vb: string;
      w: number;
      h: number;
      left: number;
      right: number;
      top: number;
      bottom: number;
      hasToday: boolean;
      todayX: string;
      gap: string;
      note: string;
      series: Array<{
        label: string;
        color: string;
        total: string;
        area: string;
        areaFill: string;
        d: string;
        pts: Array<{ x: string; y: string; r: number; title: string }>;
      }>;
      yTicks: Array<{ y: string; right: string; top: string; label: string }>;
      xTicks: Array<{ x: string; left: string; top: string; label: string }>;
    };
    tCum: { bg: string; fg: string; pick: () => void };
    tWk: { bg: string; fg: string; pick: () => void };
    prq: string;
    onPrq: (e: React.ChangeEvent<HTMLInputElement>) => void;
    preq: string;
    onReq: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    reqOpts: Array<{ v: string; label: string }>;
    reqOptsNote: string;
    hasMoreItems: boolean;
    moreItems: () => void;
    itemsNote: string;
    items: Array<{
      num: number;
      orRef: string;
      srRef: string;
      poNum: string;
      code: string;
      desc: string;
      st: string;
      stBg: string;
      stFg: string;
      dot: string;
      ty: string;
      tyColor: string;
      qty: string;
      uom: string;
      value: string;
      sup: string;
      po: string;
      cname: string;
      ship: string;
      dates: string;
      rem: string;
      open: () => void;
    }>;
    noItems: boolean;
  };
}

export const ProcurementTab: React.FC<ProcurementTabProps> = ({ proc }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Dark Header Banner */}
      <div
        data-clip="1"
        className="relative isolate overflow-hidden bg-[#14212E] text-white rounded-xl p-4 md:p-5 flex flex-col gap-4"
      >
        {proc.flag && (
          <div
            data-clip="1"
            aria-hidden="true"
            className="absolute inset-0 -z-10 pointer-events-none overflow-hidden rounded-[inherit]"
          >
            <div
              style={{
                backgroundImage: `url(${proc.flag})`,
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

        <div className="flex justify-between gap-3 flex-wrap items-start">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7CC4EC]">
              Procurement &amp; supply
            </span>
            <span className="flex items-center gap-3">
              {proc.flag && (
                <span
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url(${proc.flag})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                  }}
                  className="flex-none self-center w-9 h-9"
                />
              )}
              <span className="text-xl md:text-2xl font-semibold tracking-tight leading-snug">
                {proc.title}
              </span>
            </span>
            <span className="text-xs text-[#C9D3DC]">{proc.where}</span>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex border border-[#2F4152] rounded-md overflow-hidden">
              <button
                type="button"
                onClick={proc.mV.pick}
                style={{ backgroundColor: proc.mV.bg, color: proc.mV.fg }}
                className="cursor-pointer border-0 py-1.5 px-3 text-xs font-semibold"
              >
                Value
              </button>
              <button
                type="button"
                onClick={proc.mN.pick}
                style={{ backgroundColor: proc.mN.bg, color: proc.mN.fg }}
                className="cursor-pointer border-0 py-1.5 px-3 text-xs font-semibold"
              >
                Lines
              </button>
            </div>
            <button
              type="button"
              onClick={proc.exportCsv}
              className="cursor-pointer border-0 bg-[#009ADE] text-white rounded-md py-1.5 px-3 text-xs font-semibold hover:bg-[#0082BD] transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* 7 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {proc.stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#1C2B3A] border border-[#2F4152] rounded-lg p-2.5 flex flex-col gap-1 min-w-0"
            >
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#AEBBC7] leading-tight">
                {s.label}
              </span>
              <span className="text-lg font-semibold tracking-tight" style={{ color: s.color || '#fff' }}>
                {s.value}
              </span>
              <span className="text-[11px] text-[#8FA0AF] leading-tight">{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Active Filters */}
        {proc.hasActive && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[11px] text-[#AEBBC7]">Filtered by</span>
            {proc.active.map((f, idx) => (
              <button
                type="button"
                key={idx}
                onClick={f.clear}
                className="cursor-pointer flex gap-1.5 items-center border border-[#7CC4EC] bg-[#1C3346] text-white rounded-full py-1 px-2.5 text-xs"
              >
                <span className="text-[#7CC4EC]">{f.k}</span>
                <strong className="font-semibold">{f.v}</strong>
                <span className="text-[#AEBBC7]">✕</span>
              </button>
            ))}
            <button
              type="button"
              onClick={proc.clearAll}
              className="cursor-pointer border-0 bg-transparent text-[#7CC4EC] text-xs font-semibold hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WHO Shipping Status Donut */}
        <div className="bg-white border border-[#DDE3E9] rounded-xl p-4 flex flex-col gap-3 min-w-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-base font-semibold text-[#14212E]">WHO Shipping Status</h2>
            <span className="text-xs text-[#536271]">Click a slice to filter</span>
          </div>
          <div className="relative w-full max-w-[560px] mx-auto aspect-[760/480]">
            <svg viewBox={proc.dSt.vb} className="absolute inset-0 w-full h-full block">
              {proc.dSt.segs.map((s, idx) => (
                <path
                  key={idx}
                  d={s.d}
                  fill={s.fill}
                  onClick={s.pick}
                  stroke="#fff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors"
                >
                  <title>{s.title}</title>
                </path>
              ))}
              {proc.dSt.labels.map((l, idx) => (
                <g key={idx}>
                  <polyline points={l.pts} fill="none" stroke={l.color} strokeWidth="1.25" />
                  <circle cx={l.dotX} cy={l.dotY} r="2.5" fill={l.color} />
                </g>
              ))}
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center pointer-events-none">
              <span className="text-xl md:text-2xl font-bold text-[#14212E] whitespace-nowrap">
                {proc.dSt.center}
              </span>
              <span className="text-[10px] text-[#536271] whitespace-nowrap">{proc.dSt.centerSub}</span>
            </div>
            {proc.dSt.labels.map((l, idx) => (
              <button
                type="button"
                key={idx}
                onClick={l.pick}
                title={l.full}
                style={{
                  left: l.left,
                  top: l.top,
                  transform: l.tf,
                  textAlign: l.align as any,
                }}
                className="absolute border-0 bg-transparent p-0.5 cursor-pointer flex flex-col leading-tight whitespace-nowrap"
              >
                <span style={{ color: l.fg, fontWeight: l.weight }} className="text-xs">
                  {l.name}
                </span>
                <span style={{ color: l.vfg }} className="text-xs font-bold">
                  {l.val}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Supply Type Donut */}
        <div className="bg-white border border-[#DDE3E9] rounded-xl p-4 flex flex-col gap-3 min-w-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-base font-semibold text-[#14212E]">Supply Type</h2>
            <span className="text-xs text-[#536271]">Click a slice to filter</span>
          </div>
          <div className="relative w-full max-w-[560px] mx-auto aspect-[760/480]">
            <svg viewBox={proc.dTy.vb} className="absolute inset-0 w-full h-full block">
              {proc.dTy.segs.map((s, idx) => (
                <path
                  key={idx}
                  d={s.d}
                  fill={s.fill}
                  onClick={s.pick}
                  stroke="#fff"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors"
                >
                  <title>{s.title}</title>
                </path>
              ))}
              {proc.dTy.labels.map((l, idx) => (
                <g key={idx}>
                  <polyline points={l.pts} fill="none" stroke={l.color} strokeWidth="1.25" />
                  <circle cx={l.dotX} cy={l.dotY} r="2.5" fill={l.color} />
                </g>
              ))}
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center pointer-events-none">
              <span className="text-xl md:text-2xl font-bold text-[#14212E] whitespace-nowrap">
                {proc.dTy.center}
              </span>
              <span className="text-[10px] text-[#536271] whitespace-nowrap">{proc.dTy.centerSub}</span>
            </div>
            {proc.dTy.labels.map((l, idx) => (
              <button
                type="button"
                key={idx}
                onClick={l.pick}
                title={l.full}
                style={{
                  left: l.left,
                  top: l.top,
                  transform: l.tf,
                  textAlign: l.align as any,
                }}
                className="absolute border-0 bg-transparent p-0.5 cursor-pointer flex flex-col leading-tight whitespace-nowrap"
              >
                <span style={{ color: l.fg, fontWeight: l.weight }} className="text-xs">
                  {l.name}
                </span>
                <span style={{ color: l.vfg }} className="text-xs font-bold">
                  {l.val}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Largest Order Requests Card */}
        <div className="col-span-1 md:col-span-2 bg-white border border-[#DDE3E9] rounded-xl p-4 flex flex-col gap-2.5 min-w-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-base font-semibold text-[#14212E]">Largest order requests</h2>
            <span className="text-xs text-[#536271]">Green = delivered · click to focus</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {proc.reqBars.map((r, idx) => (
              <button
                type="button"
                key={idx}
                onClick={r.pick}
                className="cursor-pointer border-0 bg-transparent py-1 flex flex-col gap-1 text-left text-[#14212E] hover:opacity-80 transition-opacity"
              >
                <span className="flex justify-between gap-2 text-xs">
                  <span className="font-mono font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {r.id}
                  </span>
                  <span className="font-semibold whitespace-nowrap">{r.value}</span>
                </span>
                <span className="relative h-2 rounded-full bg-[#EEF2F5] overflow-hidden">
                  <span
                    style={{ width: r.w }}
                    className="absolute left-0 top-0 bottom-0 bg-[#E3C98A] rounded-full"
                  />
                  <span
                    style={{ width: r.dw }}
                    className="absolute left-0 top-0 bottom-0 bg-[#0FA958] rounded-full"
                  />
                </span>
                <span className="text-[11px] text-[#536271]">
                  {r.cname} · {r.meta}
                </span>
              </button>
            ))}
          </div>
          {proc.reqMore && <span className="text-[11px] text-[#536271]">{proc.reqMore}</span>}
        </div>
      </div>

      {/* Requested vs Delivered Timeline Card */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-4 flex flex-col gap-2.5 min-w-0">
        <div className="flex justify-between gap-2.5 items-center flex-wrap">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-base font-semibold text-[#14212E]">Requested vs delivered</h2>
            <span className="text-xs text-[#536271]">{proc.line.sub}</span>
          </div>
          <div className="flex border border-[#CBD4DC] rounded-md overflow-hidden">
            <button
              type="button"
              onClick={proc.tCum.pick}
              style={{ backgroundColor: proc.tCum.bg, color: proc.tCum.fg }}
              className="cursor-pointer border-0 py-1.5 px-3 text-xs font-semibold"
            >
              Cumulative
            </button>
            <button
              type="button"
              onClick={proc.tWk.pick}
              style={{ backgroundColor: proc.tWk.bg, color: proc.tWk.fg }}
              className="cursor-pointer border-0 py-1.5 px-3 text-xs font-semibold"
            >
              Weekly
            </button>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap items-center">
          {proc.line.series.map((s, idx) => (
            <span key={idx} className="flex items-center gap-1.5 text-xs text-[#3F4B57]">
              <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.label} · <strong className="font-semibold text-[#14212E]">{s.total}</strong>
            </span>
          ))}
          {proc.line.gap && <span className="text-xs font-semibold text-[#C92A2A]">{proc.line.gap}</span>}
        </div>

        <div className="relative w-full h-[300px]">
          <svg viewBox={proc.line.vb} className="absolute inset-0 w-full h-full block">
            {proc.line.yTicks.map((y, idx) => (
              <line
                key={idx}
                x1={proc.line.left}
                x2={proc.line.right}
                y1={y.y}
                y2={y.y}
                stroke="#EEF2F5"
                strokeWidth="1"
              />
            ))}
            {proc.line.series.map((s, idx) => (
              <path key={idx} d={s.area} fill={s.areaFill} fillOpacity={0.1} />
            ))}
            {proc.line.hasToday && (
              <line
                x1={proc.line.todayX}
                x2={proc.line.todayX}
                y1={proc.line.top}
                y2={proc.line.bottom}
                stroke="#E8590C"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
            )}
            {proc.line.series.map((s, idx) => (
              <g key={idx}>
                <path
                  d={s.d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {s.pts.map((p, pi) => (
                  <circle
                    key={pi}
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    fill="#fff"
                    stroke={s.color}
                    strokeWidth="1.5"
                  >
                    <title>{p.title}</title>
                  </circle>
                ))}
              </g>
            ))}
          </svg>

          {/* Y-axis tick labels */}
          {proc.line.yTicks.map((y, idx) => (
            <span
              key={idx}
              style={{ right: y.right, top: y.top, transform: 'translateY(-50%)' }}
              className="absolute text-[10px] text-[#536271] whitespace-nowrap"
            >
              {y.label}
            </span>
          ))}

          {/* X-axis tick labels */}
          {proc.line.xTicks.map((x, idx) => (
            <span
              key={idx}
              style={{ left: x.left, top: x.top, transform: 'translateX(-50%)' }}
              className="absolute text-[10px] text-[#536271] whitespace-nowrap"
            >
              {x.label}
            </span>
          ))}
        </div>

        {proc.line.note && <span className="text-[11px] text-[#536271]">{proc.line.note}</span>}
      </div>

      {/* Items & Remarks Table */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl flex flex-col overflow-hidden min-w-0">
        <div className="p-3 border-b border-[#DDE3E9] flex flex-wrap gap-2.5 items-center justify-between">
          <span className="flex items-baseline gap-2.5 flex-wrap">
            <h2 className="m-0 text-base font-semibold text-[#14212E]">Items &amp; remarks</h2>
            <span className="text-xs text-[#536271]">{proc.itemsNote}</span>
          </span>
          <span className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              value={proc.prq}
              onChange={proc.onPrq}
              placeholder="Search requests…"
              className="text-xs py-1.5 px-2.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] w-40"
            />
            <select
              value={proc.preq}
              onChange={proc.onReq}
              className="text-xs py-1.5 px-2.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] max-w-[320px]"
            >
              <option value="">All order requests · {proc.reqOptsNote}</option>
              {proc.reqOpts.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.label}
                </option>
              ))}
            </select>
            {proc.hasMoreItems && (
              <button
                type="button"
                onClick={proc.moreItems}
                className="cursor-pointer text-xs py-1.5 px-2.5 border border-[#CBD4DC] rounded-md bg-white text-[#0071B8] font-semibold hover:bg-[#F3F8FC]"
              >
                Show 150 more
              </button>
            )}
          </span>
        </div>

        <div className="overflow-auto max-h-[640px]">
          <div className="grid grid-cols-[repeat(13,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] border-b border-[#005A93] text-[10px] font-semibold tracking-wider uppercase text-white">
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">OR Ref</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">SR Ref</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">PO No.</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Item</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">WHO Shipping Status</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Supply type</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Qty</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Value</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Hub / supplier · OPR</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Country</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Shipment</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Dates</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Remarks Supply</span>
            </div>

            {/* Rows */}
            {proc.items.map((l) => (
              <button
                type="button"
                key={l.num}
                onClick={l.open}
                className="cursor-pointer col-span-full border-0 border-b border-[#DDE3E9] bg-white grid grid-cols-subgrid p-0 text-left items-stretch text-[11px] text-[#14212E] whitespace-nowrap hover:bg-[#F3F8FC] transition-colors"
              >
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271] tabular-nums">
                  {l.num}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.orRef}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.srRef}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.poNum}</span>
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
                    className="flex items-center gap-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: l.dot }} />
                    {l.st}
                  </span>
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs flex-none" style={{ backgroundColor: l.tyColor }} />
                  {l.ty}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">
                  {l.qty} <span className="text-[10px] text-[#536271]">{l.uom}</span>
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">
                  {l.value}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-2">
                  <span>{l.sup}</span>
                  <span className="font-mono text-[10px] text-[#536271]">{l.po}</span>
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{l.cname}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.ship}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-[10px] text-[#3F4B57]">
                  {l.dates}
                </span>
                <span
                  title={l.rem}
                  className="py-1 px-1.5 border-r border-[#DDE3E9] max-w-[480px] overflow-hidden text-ellipsis text-[#3F4B57]"
                >
                  {l.rem}
                </span>
              </button>
            ))}
          </div>
        </div>

        {proc.noItems && (
          <div className="p-7 text-center text-[#536271] text-sm">No lines match this selection.</div>
        )}
      </div>
    </div>
  );
};
