import React from 'react';

interface LineDetailsTabProps {
  lt: {
    kpis: Array<{ label: string; value: string; sub: string; color?: string }>;
    range: string;
    total: string;
    prev: () => void;
    next: () => void;
    prevOp: number;
    nextOp: number;
    exportCsv: () => void;
    head: Array<{ label: string; arrow: string; align: string; pick: () => void }>;
    rows: Array<{
      open: () => void;
      cells: Array<{
        v: string | number;
        align: string;
        fam: string;
        size: string;
        fg: string;
        weight: number;
        bg?: string;
        tip?: string;
        go?: (e: React.MouseEvent) => void;
      }>;
    }>;
  };
}

export const LineDetailsTab: React.FC<LineDetailsTabProps> = ({ lt }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {lt.kpis.map((k, idx) => (
          <div key={idx} className="bg-white border border-[#DDE3E9] rounded-lg p-3.5 flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#536271]">{k.label}</span>
            <span className="text-2xl font-semibold" style={{ color: k.color || '#14212E' }}>
              {k.value}
            </span>
            <span className="text-xs text-[#536271]">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
        <div className="p-3.5 flex justify-between items-center gap-3 flex-wrap border-b border-[#DDE3E9]">
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-base font-semibold text-[#14212E]">Line details</h2>
            <span className="text-xs text-[#536271]">
              {lt.range} · {lt.total} · click a header to sort, a row for the item journey
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={lt.prev}
              style={{ opacity: lt.prevOp }}
              className="cursor-pointer text-xs py-1.5 px-3 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] hover:bg-[#F3F5F7] transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={lt.next}
              style={{ opacity: lt.nextOp }}
              className="cursor-pointer text-xs py-1.5 px-3 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] hover:bg-[#F3F5F7] transition-colors"
            >
              Next
            </button>
            <button
              type="button"
              onClick={lt.exportCsv}
              className="cursor-pointer text-xs py-1.5 px-3 border border-[#0071B8] rounded-md bg-[#0071B8] text-white font-medium whitespace-nowrap hover:bg-[#005A93] transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <div className="grid grid-cols-[repeat(25,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] border-b border-[#005A93]">
              {lt.head.map((h, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={h.pick}
                  style={{ justifyContent: h.align }}
                  className="cursor-pointer border-0 border-r border-[#3D8FC6] bg-transparent py-1 px-1.5 whitespace-nowrap flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-white text-left hover:bg-white/10"
                >
                  <span>{h.label}</span>
                  {h.arrow && <span>{h.arrow}</span>}
                </button>
              ))}
            </div>

            {/* Rows */}
            {lt.rows.map((r, ri) => (
              <button
                type="button"
                key={ri}
                onClick={r.open}
                className="cursor-pointer col-span-full border-0 border-b border-[#DDE3E9] bg-white grid grid-cols-subgrid p-0 text-left items-stretch hover:bg-[#F3F8FC] transition-colors"
              >
                {r.cells.map((c, ci) => (
                  <span
                    key={ci}
                    title={c.tip || String(c.v)}
                    onClick={c.go}
                    style={{
                      backgroundColor: c.bg || 'transparent',
                      textAlign: c.align as any,
                      fontFamily: c.fam,
                      fontSize: c.size,
                      color: c.fg,
                      fontWeight: c.weight,
                    }}
                    className="py-1 px-1.5 border-r border-[#DDE3E9] whitespace-nowrap max-w-[480px] overflow-hidden text-ellipsis leading-tight"
                  >
                    {c.v}
                  </span>
                ))}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
