import React from 'react';

interface BackOrdersTabProps {
  bo: {
    kpis: Array<{ label: string; value: string; sub: string; color?: string }>;
    funnel: {
      total: string;
      segs: Array<{ label: string; color: string; w: string; v: string; p: string; lines: string }>;
    };
    queues: Array<{
      label: string;
      sub: string;
      fg: string;
      bg: string;
      bd: string;
      n: string;
      v: string;
      reqs: string;
      oldest: string;
      pick: () => void;
    }>;
    ageing: Array<{
      label: string;
      v: string;
      n: string;
      segs: Array<{ color: string; w: string; title: string }>;
    }>;
    topItems: Array<{
      sn: number;
      code: string;
      desc: string;
      v: string;
      q: string;
      n: string;
      cs: string;
      w: string;
      bg: string;
      pick: () => void;
    }>;
    countries: Array<{
      sn: number;
      label: string;
      reqs: string;
      lines: string;
      v: string;
      segs: Array<{ w: string; color: string; title: string }>;
      oldest: string;
      bg: string;
      pick: () => void;
    }>;
    suppliers: Array<{
      sn: number;
      label: string;
      chan: string;
      pos: string;
      lines: string;
      v: string;
      segs: Array<{ w: string; color: string; title: string }>;
      oldest: string;
      bg: string;
      pick: () => void;
    }>;
    note: string;
    hasFilter: boolean;
    clear: () => void;
    exportCsv: () => void;
    rows: Array<{
      grp: number;
      country: string;
      orRef: string;
      srRef: string;
      poNum: string;
      code: string;
      desc: string;
      o: string;
      na: string;
      av: string;
      tr: string;
      d: string;
      pend: string;
      v: string;
      st: string;
      stFg: string;
      days: string;
      src: string;
      chan: string;
      ship: string;
      itemTot: string;
      why: string;
      top: string;
      bg: string;
      open: () => void;
    }>;
    more: boolean;
    showMore: () => void;
  };
}

export const BackOrdersTab: React.FC<BackOrdersTabProps> = ({ bo }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* 5 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {bo.kpis.map((k, idx) => (
          <div key={idx} className="bg-white border border-[#DDE3E9] rounded-lg p-3 flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">{k.label}</span>
            <span className="text-xl font-semibold" style={{ color: k.color || '#14212E' }}>
              {k.value}
            </span>
            <span className="text-xs text-[#536271]">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Where the Ordered Value is Now (Funnel) */}
      <div className="bg-white border border-[#DDE3E9] rounded-lg p-3.5 flex flex-col gap-2.5">
        <div className="flex justify-between gap-2.5 flex-wrap items-baseline">
          <h2 className="m-0 text-sm font-semibold text-[#14212E]">Where the ordered value is now</h2>
          <span className="text-xs text-[#536271]">{bo.funnel.total} ordered · canceled lines excluded</span>
        </div>
        <div className="flex h-5 rounded-md overflow-hidden bg-[#EEF2F5]">
          {bo.funnel.segs.map((s, idx) => (
            <span key={idx} title={`${s.label} · ${s.v}`} style={{ width: s.w, backgroundColor: s.color }} />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
          {bo.funnel.segs.map((s, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <span className="w-2.5 h-2.5 rounded-xs mt-1 flex-none" style={{ backgroundColor: s.color }} />
              <span className="flex flex-col">
                <span className="text-xs text-[#3F4B57]">{s.label}</span>
                <span className="text-base font-bold text-[#14212E]">
                  {s.v} <span className="text-xs font-semibold text-[#536271]">{s.p}</span>
                </span>
                <span className="text-[11px] text-[#536271]">{s.lines}</span>
              </span>
            </div>
          ))}
        </div>
        <span className="text-[11px] text-[#536271]">
          Not yet available = WHO status 00, 01, 01d, 12 or missing · Available, not shipped = 01b, 02, 04, 06, 07 · In transit = 01c, 08 · Delivered = 09, 10. The original requested quantity is not available in the export; ordered is the sum of each request&apos;s lines.
        </span>
      </div>

      {/* Lines by Condition (Queues) */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2.5 flex-wrap items-baseline">
          <h2 className="m-0 text-sm font-semibold text-[#14212E]">Lines by condition</h2>
          <span className="text-[11px] text-[#536271]">Click a card to filter the lines below</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bo.queues.map((q, idx) => (
            <button
              type="button"
              key={idx}
              onClick={q.pick}
              style={{
                backgroundColor: q.bg,
                borderColor: q.bd,
                borderTopColor: q.fg,
              }}
              className="cursor-pointer text-left border border-t-4 rounded-lg p-3 flex flex-col gap-1 text-[#14212E] hover:bg-[#F7F9FA] transition-colors"
            >
              <span className="text-xs font-semibold" style={{ color: q.fg }}>
                {q.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{q.n}</span>
                <span className="text-xs text-[#536271]">lines</span>
                <span className="ml-auto text-base font-bold">{q.v}</span>
              </span>
              <span className="text-[11px] text-[#536271]">
                {q.reqs} · {q.oldest}
              </span>
              <span className="text-[10px] text-[#6B7884]">{q.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ageing & Top 10 Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Age of Remaining Value */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-[#14212E]">Age of remaining value</h2>
            <span className="text-[11px] text-[#536271]">Days since Request Date</span>
          </div>
          <div className="p-3 grid grid-cols-[max-content_minmax(0,1fr)_max-content_max-content] gap-x-3 gap-y-2 items-center text-xs">
            {bo.ageing.map((a, idx) => (
              <React.Fragment key={idx}>
                <span className="text-[#3F4B57] whitespace-nowrap">{a.label}</span>
                <span className="flex h-3.5 rounded-xs overflow-hidden bg-[#F3F5F7]">
                  {a.segs.map((s, si) => (
                    <span key={si} title={s.title} style={{ width: s.w, backgroundColor: s.color }} />
                  ))}
                </span>
                <span className="text-right font-bold whitespace-nowrap">{a.v}</span>
                <span className="text-right text-[#536271] whitespace-nowrap">{a.n}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Top 10 Items by Remaining Value */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-[#14212E]">Top 10 items by remaining value</h2>
            <span className="text-[11px] text-[#536271]">Click an item to filter the lines below</span>
          </div>
          <div className="flex flex-col divide-y divide-[#EEF2F5]">
            {bo.topItems.map((t) => (
              <button
                type="button"
                key={t.sn}
                onClick={t.pick}
                title={t.desc}
                style={{ backgroundColor: t.bg }}
                className="cursor-pointer border-0 py-1.5 px-3.5 grid grid-cols-[20px_minmax(0,1fr)_120px_max-content] gap-2.5 items-center text-left text-[11px] text-[#14212E] hover:bg-[#F3F8FC] transition-colors"
              >
                <span className="text-[#536271] text-right">{t.sn}</span>
                <span className="flex flex-col min-w-0">
                  <span className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{t.desc}</span>
                  <span className="text-[#536271] whitespace-nowrap overflow-hidden text-ellipsis text-[10px]">
                    <span className="font-mono">{t.code}</span> · {t.q} pending · {t.n} lines · {t.cs}
                  </span>
                </span>
                <span className="h-2 rounded-full bg-[#EEF2F5] overflow-hidden flex">
                  <span style={{ width: t.w }} className="bg-[#C92A2A]" />
                </span>
                <span className="font-bold text-right whitespace-nowrap">{t.v}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Remaining by Country & Remaining by Supplier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Remaining by Country */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-[#14212E]">Remaining by country</h2>
            <span className="text-[11px] text-[#536271]">Click a row to filter the lines below</span>
          </div>
          <div className="overflow-auto max-h-[360px]">
            <div className="grid grid-cols-[repeat(6,max-content)_minmax(max-content,1fr)] w-max min-w-full">
              <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Country</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Requests</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Lines</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Remaining value</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Where it sits</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Oldest</span>
              </div>
              {bo.countries.map((c) => (
                <button
                  type="button"
                  key={c.sn}
                  onClick={c.pick}
                  style={{ backgroundColor: c.bg }}
                  className="cursor-pointer col-span-full grid grid-cols-subgrid border-0 border-t border-[#DDE3E9] py-1 px-0 text-left text-[11px] text-[#14212E] whitespace-nowrap hover:bg-[#F3F8FC] transition-colors"
                >
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{c.sn}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] font-semibold">{c.label}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right">{c.reqs}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right">{c.lines}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#C92A2A]">
                    {c.v}
                  </span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] flex items-center">
                    <span className="w-[120px] h-2 rounded-full bg-[#EEF2F5] overflow-hidden flex">
                      {c.segs.map((s, si) => (
                        <span key={si} title={s.title} style={{ width: s.w, backgroundColor: s.color }} />
                      ))}
                    </span>
                  </span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right">{c.oldest}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Remaining by Supplier */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-[#14212E]">Remaining by supplier / hub</h2>
            <span className="text-[11px] text-[#536271]">Click a row to filter the lines below</span>
          </div>
          <div className="overflow-auto max-h-[360px]">
            <div className="grid grid-cols-[repeat(7,max-content)_minmax(max-content,1fr)] w-max min-w-full">
              <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Hub / supplier</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Channel</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">POs</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Lines</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Remaining value</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Where it sits</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Oldest</span>
              </div>
              {bo.suppliers.map((c) => (
                <button
                  type="button"
                  key={c.sn}
                  onClick={c.pick}
                  style={{ backgroundColor: c.bg }}
                  className="cursor-pointer col-span-full grid grid-cols-subgrid border-0 border-t border-[#DDE3E9] py-1 px-0 text-left text-[11px] text-[#14212E] whitespace-nowrap hover:bg-[#F3F8FC] transition-colors"
                >
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{c.sn}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] font-semibold">{c.label}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">{c.chan}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right">{c.pos}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right">{c.lines}</span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#C92A2A]">
                    {c.v}
                  </span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] flex items-center">
                    <span className="w-[120px] h-2 rounded-full bg-[#EEF2F5] overflow-hidden flex">
                      {c.segs.map((s, si) => (
                        <span key={si} title={s.title} style={{ width: s.w, backgroundColor: s.color }} />
                      ))}
                    </span>
                  </span>
                  <span className="py-0.5 px-1.5 border-r border-[#DDE3E9] text-right">{c.oldest}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back-Order Lines Table */}
      <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2.5 flex-wrap items-center">
          <span className="flex items-baseline gap-2.5">
            <h2 className="m-0 text-sm font-semibold text-[#14212E]">Back-order lines</h2>
            <span className="text-xs text-[#536271]">{bo.note}</span>
          </span>
          <span className="flex gap-2 items-center">
            {bo.hasFilter && (
              <button
                type="button"
                onClick={bo.clear}
                className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-[#0071B8] hover:underline"
              >
                Clear filter
              </button>
            )}
            <button
              type="button"
              onClick={bo.exportCsv}
              className="cursor-pointer text-xs py-1.5 px-3 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] font-medium hover:bg-[#F3F5F7] transition-colors"
            >
              Export CSV
            </button>
          </span>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <div className="grid grid-cols-[repeat(20,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Item #</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Country</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">OR Ref</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">SR Ref</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">PO No.</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Item code</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Item</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Ordered</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Not yet available</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Available, not shipped</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">In transit</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Delivered</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Pending</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Pending value</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">WHO Status</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Days since</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Hub / supplier</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Channel</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Shipment ref</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Item total</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Why pending (as recorded)</span>
            </div>

            {/* Rows */}
            {bo.rows.map((l, li) => (
              <button
                type="button"
                key={li}
                onClick={l.open}
                style={{
                  borderTop: l.top,
                  backgroundColor: l.bg,
                }}
                className="cursor-pointer col-span-full grid grid-cols-subgrid border-0 p-0 text-left text-[11px] text-[#14212E] whitespace-nowrap hover:bg-[#F3F8FC] transition-colors"
              >
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{l.grp}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{l.country}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.orRef}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.srRef}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.poNum}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.code}</span>
                <span
                  title={l.desc}
                  className="py-1 px-1.5 border-r border-[#DDE3E9] max-w-[380px] overflow-hidden text-ellipsis font-medium"
                >
                  {l.desc}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-bold bg-[#F3F5F7]">{l.o}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#C92A2A]">
                  {l.na}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#B54708]">
                  {l.av}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#0062CC]">
                  {l.tr}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#087F3B]">
                  {l.d}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-bold text-[#C92A2A]">
                  {l.pend}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{l.v}</span>
                <span style={{ color: l.stFg }} className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold">
                  {l.st}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{l.days}</span>
                <span
                  title={l.src}
                  className="py-1 px-1.5 border-r border-[#DDE3E9] max-w-[200px] overflow-hidden text-ellipsis"
                >
                  {l.src}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">{l.chan}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.ship}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-[#536271] text-[10px]">{l.itemTot}</span>
                <span
                  title={l.why}
                  className="py-1 px-1.5 border-r border-[#DDE3E9] max-w-[520px] overflow-hidden text-ellipsis text-[#3F4B57]"
                >
                  {l.why}
                </span>
              </button>
            ))}
          </div>
        </div>

        {bo.more && (
          <div className="p-3 border-t border-[#DDE3E9]">
            <button
              type="button"
              onClick={bo.showMore}
              className="cursor-pointer text-xs py-1.5 px-3.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] font-medium hover:bg-[#F3F5F7]"
            >
              Show 200 more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
