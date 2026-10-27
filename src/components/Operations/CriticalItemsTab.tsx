import React from 'react';

interface CriticalItemsTabProps {
  crit: {
    sub: string;
    empty: boolean;
    rows: Array<{
      sn: number;
      name: string;
      req: string;
      d: string;
      pend: string;
      pendFg: string;
      w: string;
      pct: string;
      pctFg: string;
      t: string;
      prep: string;
      p: string;
      open: boolean;
      arrow: string;
      countries: string;
      delayed: string;
      since: string;
      eta: string;
      why: string;
      toggle: () => void;
      lines: Array<{
        n: number;
        country: string;
        orRef: string;
        srRef: string;
        poNum: string;
        qty: string;
        st: string;
        stFg: string;
        rd: string;
        eta: string;
        why: string;
        late: string;
        bg: string;
        openLine: () => void;
      }>;
    }>;
  };
}

export const CriticalItemsTab: React.FC<CriticalItemsTabProps> = ({ crit }) => {
  return (
    <div className="bg-white border border-[#DDE3E9] rounded-lg p-4 flex flex-col gap-3.5">
      <div className="flex flex-col gap-0.5">
        <h2 className="m-0 text-base font-semibold text-[#14212E]">Critical items</h2>
        <span className="text-xs text-[#536271]">{crit.sub}</span>
      </div>

      <div className="overflow-auto max-h-[72vh] border border-[#DDE3E9] border-r-0 rounded">
        <div className="grid grid-cols-[max-content_max-content_repeat(3,max-content)_minmax(320px,1fr)_max-content] w-max min-w-full">
          {/* Header */}
          <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[11px] font-semibold tracking-wider uppercase text-white">
            <span className="py-1.5 px-2.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
            <span className="py-1.5 px-2.5 border-r border-[#3D8FC6] whitespace-nowrap">Essential item</span>
            <span className="py-1.5 px-2.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Requested</span>
            <span className="py-1.5 px-2.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Delivered</span>
            <span className="py-1.5 px-2.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Pending</span>
            <span className="py-1.5 px-2.5 border-r border-[#3D8FC6] whitespace-nowrap">Delivered vs requested</span>
            <span className="py-1.5 px-2.5 border-r border-[#3D8FC6] whitespace-nowrap">
              Pending is · in transit / preparing / not ready
            </span>
          </div>

          {/* Rows */}
          {crit.rows.map((r) => (
            <React.Fragment key={r.sn}>
              <button
                type="button"
                onClick={r.toggle}
                className="cursor-pointer col-span-full grid grid-cols-subgrid border-0 border-b border-[#DDE3E9] bg-white p-0 text-left text-xs text-[#14212E] whitespace-nowrap items-stretch hover:bg-[#F3F8FC] transition-colors"
              >
                <span className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right text-[#536271]">{r.sn}</span>
                <span className="py-1.5 px-2.5 border-r border-[#DDE3E9] font-semibold flex gap-1.5 items-center">
                  <span className="w-2.5 text-[#536271] font-mono">{r.arrow}</span>
                  {r.name}
                </span>
                <span className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right font-bold text-xs">{r.req}</span>
                <span className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right font-bold text-xs text-[#087F3B]">
                  {r.d}
                </span>
                <span
                  style={{ color: r.pendFg }}
                  className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-right font-bold text-xs"
                >
                  {r.pend}
                </span>
                <span className="py-1.5 px-2.5 border-r border-[#DDE3E9] flex items-center gap-2">
                  <span
                    title={`Delivered ${r.d} of ${r.req} requested`}
                    className="flex-1 min-w-[200px] h-3 rounded-xs bg-[#F8D7D3] overflow-hidden flex"
                  >
                    <span style={{ width: r.w }} className="bg-[#0FA958]" />
                  </span>
                  <span style={{ color: r.pctFg }} className="font-bold w-10 text-right">
                    {r.pct}
                  </span>
                </span>
                <span className="py-1.5 px-2.5 border-r border-[#DDE3E9] text-[#3F4B57]">
                  <span className="text-[#0062CC] font-semibold">{r.t}</span> /{' '}
                  <span className="text-[#B54708] font-semibold">{r.prep}</span> /{' '}
                  <span className="text-[#C92A2A] font-semibold">{r.p}</span>
                </span>
              </button>

              {r.open && (
                <div className="col-span-full bg-[#F7F9FA] border-b border-[#DDE3E9] p-2.5 pl-8">
                  <div className="flex gap-x-4 gap-y-1.5 flex-wrap text-xs text-[#3F4B57] mb-2">
                    <span>
                      <strong className="text-[#14212E]">Countries:</strong> {r.countries}
                    </span>
                    <span>
                      <strong className="text-[#14212E]">Delayed lines:</strong> {r.delayed}
                    </span>
                    <span>
                      <strong className="text-[#14212E]">Oldest pending request:</strong> {r.since}
                    </span>
                    <span>
                      <strong className="text-[#14212E]">Next ETA:</strong> {r.eta}
                    </span>
                    <span>
                      <strong className="text-[#14212E]">Pending lines by status:</strong> {r.why}
                    </span>
                  </div>

                  <div className="grid grid-cols-[repeat(9,max-content)_minmax(240px,1fr)] w-max min-w-full border border-[#DDE3E9] border-r-0 bg-white rounded overflow-hidden">
                    <div className="col-span-full grid grid-cols-subgrid bg-[#3F4B57] text-[10px] font-semibold tracking-wider uppercase text-white">
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap text-right">#</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">Country</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">OR Ref</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">SR Ref</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">PO No.</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap text-right">Qty</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">WHO Status</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">Requested</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">ETA / ATA</span>
                      <span className="py-1 px-1.5 border-r border-[#536271] whitespace-nowrap">Why · remark</span>
                    </div>

                    {r.lines.map((l) => (
                      <button
                        type="button"
                        key={l.n}
                        onClick={l.openLine}
                        style={{ backgroundColor: l.bg }}
                        className="cursor-pointer col-span-full grid grid-cols-subgrid border-0 border-t border-[#DDE3E9] p-0 text-left text-[11px] text-[#14212E] whitespace-nowrap hover:bg-[#F3F8FC] transition-colors"
                      >
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">
                          {l.n}
                        </span>
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-medium">{l.country}</span>
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.orRef}</span>
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.srRef}</span>
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{l.poNum}</span>
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-medium">{l.qty}</span>
                        <span
                          style={{ color: l.stFg }}
                          className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold"
                        >
                          {l.st}
                        </span>
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">{l.rd}</span>
                        <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">{l.eta}</span>
                        <span
                          title={l.why}
                          className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-1.5 max-w-[640px] overflow-hidden text-[#3F4B57]"
                        >
                          {l.late && (
                            <span className="flex-none text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDEBE2] text-[#C92A2A]">
                              {l.late}
                            </span>
                          )}
                          <span className="overflow-hidden text-ellipsis">{l.why}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {crit.empty && (
        <span className="text-sm text-[#536271]">No essential items for these filters.</span>
      )}
    </div>
  );
};
