import React from 'react';

interface ShipmentInfoTabProps {
  sh: {
    kpis: Array<{ label: string; value: string; sub: string; color?: string }>;
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
    empty: boolean;
  };
}

export const ShipmentInfoTab: React.FC<ShipmentInfoTabProps> = ({ sh }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sh.kpis.map((k, idx) => (
          <div key={idx} className="bg-white border border-[#DDE3E9] rounded-lg p-3.5 flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#536271]">{k.label}</span>
            <span className="text-2xl font-semibold" style={{ color: k.color || '#14212E' }}>
              {k.value}
            </span>
            <span className="text-xs text-[#536271]">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Shipments Table Card */}
      <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
        <div className="p-3.5 border-b border-[#DDE3E9] flex justify-between gap-3 flex-wrap items-baseline">
          <h2 className="m-0 text-base font-semibold text-[#14212E]">Shipment info</h2>
          <span className="text-xs text-[#536271]">Click a header to sort · click a shipment to open its request</span>
        </div>

        <div className="overflow-auto max-h-[70vh]">
          <div className="grid grid-cols-[repeat(18,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] border-b border-[#005A93]">
              {sh.head.map((h, idx) => (
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
            {sh.rows.map((r, ri) => (
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

        {sh.empty && (
          <div className="p-7 text-center text-[#536271] text-sm">No shipments match these filters.</div>
        )}
      </div>
    </div>
  );
};
