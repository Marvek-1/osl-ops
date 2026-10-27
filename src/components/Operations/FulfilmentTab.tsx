import React from 'react';

interface FulfilmentTabProps {
  ful: {
    note: string;
    dims: Array<{ label: string; bd: string; bg: string; fg: string; pick: () => void }>;
    sorts: Array<{ label: string; bd: string; bg: string; fg: string; pick: () => void }>;
    kpis: Array<{ label: string; v: string; sub: string }>;
    countries: Array<{
      sn: number;
      name: string;
      req: string;
      del: string;
      tr: string;
      gap: string;
      rate: string;
      w: string;
      fg: string;
      lines: string;
      pick: () => void;
    }>;
    cats: Array<{
      sn: number;
      name: string;
      req: string;
      del: string;
      tr: string;
      gap: string;
      rate: string;
      w: string;
      fg: string;
      lines: string;
    }>;
    matrix: {
      cats: string[];
      rows: Array<{
        name: string;
        cells: Array<{ t: string; bg: string; fg: string; title: string }>;
      }>;
    };
    nItems: string;
    q: string;
    onQ: (e: React.ChangeEvent<HTMLInputElement>) => void;
    items: Array<{
      sn: number;
      code: string;
      desc: string;
      cat: string;
      uom: string;
      qReq: string;
      qDel: string;
      req: string;
      del: string;
      gap: string;
      rate: string;
      w: string;
      fg: string;
      lines: string;
      cs: string;
    }>;
  };
}

export const FulfilmentTab: React.FC<FulfilmentTabProps> = ({ ful }) => {
  return (
    <div data-screen-label="Fulfilment" className="flex flex-col gap-3.5">
      {/* Header and Controls */}
      <div className="flex justify-between gap-2.5 flex-wrap items-end">
        <div className="flex flex-col gap-0.5 max-w-[900px]">
          <h2 className="m-0 text-lg font-semibold text-[#14212E]">
            Fulfilment · requested against delivered
          </h2>
          <span className="text-xs text-[#536271]">{ful.note}</span>
        </div>
        <div data-noprint="1" className="flex gap-2.5 flex-wrap">
          <div className="flex">
            {ful.dims.map((t, idx) => (
              <button
                type="button"
                key={idx}
                onClick={t.pick}
                style={{ borderColor: t.bd, backgroundColor: t.bg, color: t.fg }}
                className="cursor-pointer flex-none whitespace-nowrap text-xs font-semibold py-1.5 px-3 border -mr-[1px] first:rounded-l-md last:rounded-r-md transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex">
            {ful.sorts.map((t, idx) => (
              <button
                type="button"
                key={idx}
                onClick={t.pick}
                style={{ borderColor: t.bd, backgroundColor: t.bg, color: t.fg }}
                className="cursor-pointer flex-none whitespace-nowrap text-xs font-semibold py-1.5 px-3 border -mr-[1px] first:rounded-l-md last:rounded-r-md transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {ful.kpis.map((k, idx) => (
          <div key={idx} className="bg-white border border-[#DDE3E9] rounded-lg p-3 flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#536271]">{k.label}</span>
            <span className="text-2xl font-bold text-[#14212E]">{k.v}</span>
            <span className="text-xs text-[#536271]">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* By Country & By Category Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
        {/* By Country */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2 flex-wrap items-baseline">
            <h3 className="m-0 text-sm font-semibold text-[#14212E]">By country</h3>
            <span className="text-[11px] text-[#536271]">Click a country to filter the whole dashboard</span>
          </div>
          <div className="overflow-auto max-h-[460px]">
            <div className="grid grid-cols-[repeat(7,max-content)_minmax(max-content,1fr)] w-max min-w-full">
              <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Country</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Requested</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Delivered</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">In transit</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Gap</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Fulfilment</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Lines delivered</span>
              </div>
              {ful.countries.map((x) => (
                <div
                  key={x.sn}
                  className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] text-[#14212E] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
                >
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.sn}</span>
                  <button
                    type="button"
                    onClick={x.pick}
                    className="cursor-pointer border-0 border-r border-[#DDE3E9] bg-transparent text-left py-1 px-1.5 font-semibold text-[#0062CC] hover:underline"
                  >
                    {x.name}
                  </button>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">{x.req}</span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#087F3B]">
                    {x.del}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#0062CC]">{x.tr}</span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-bold text-[#C92A2A]">
                    {x.gap}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-1.5">
                    <span className="w-[70px] h-1.5 rounded-full bg-[#EEF2F5] overflow-hidden flex">
                      <span style={{ width: x.w, backgroundColor: x.fg }} />
                    </span>
                    <span style={{ color: x.fg }} className="font-bold">
                      {x.rate}
                    </span>
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.lines}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
          <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2 flex-wrap items-baseline">
            <h3 className="m-0 text-sm font-semibold text-[#14212E]">By category</h3>
            <span className="text-[11px] text-[#536271]">Category as recorded</span>
          </div>
          <div className="overflow-auto max-h-[460px]">
            <div className="grid grid-cols-[repeat(7,max-content)_minmax(max-content,1fr)] w-max min-w-full">
              <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Category</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Requested</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Delivered</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">In transit</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Gap</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Fulfilment</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Lines delivered</span>
              </div>
              {ful.cats.map((x) => (
                <div
                  key={x.sn}
                  className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] text-[#14212E] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
                >
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.sn}</span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold">{x.name}</span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">{x.req}</span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#087F3B]">
                    {x.del}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#0062CC]">{x.tr}</span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-bold text-[#C92A2A]">
                    {x.gap}
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-1.5">
                    <span className="w-[70px] h-1.5 rounded-full bg-[#EEF2F5] overflow-hidden flex">
                      <span style={{ width: x.w, backgroundColor: x.fg }} />
                    </span>
                    <span style={{ color: x.fg }} className="font-bold">
                      {x.rate}
                    </span>
                  </span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.lines}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Country × Category Heatmap Matrix */}
      <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-[#DDE3E9] flex flex-col gap-0.5">
          <h3 className="m-0 text-sm font-semibold text-[#14212E]">
            Country × category · value fulfilment
          </h3>
          <span className="text-[11px] text-[#536271]">
            Delivered ÷ requested value · green ≥80%, amber 50–79%, red under 50% · — = nothing requested · hover a cell for values · 8 largest categories
          </span>
        </div>
        <div className="overflow-auto max-h-[520px]">
          <table className="border-collapse text-[11px] whitespace-nowrap w-max min-w-full">
            <thead>
              <tr>
                <th className="py-1 px-1.5 border-r border-[#3D8FC6] text-left sticky top-0 bg-[#0071B8] text-white">
                  Country
                </th>
                {ful.matrix.cats.map((c, idx) => (
                  <th
                    key={idx}
                    className="py-1 px-1.5 border-r border-[#3D8FC6] sticky top-0 bg-[#0071B8] text-white text-[10px] uppercase tracking-wider text-center"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ful.matrix.rows.map((m, ri) => (
                <tr key={ri} className="hover:bg-[#F7F9FA]">
                  <td className="py-1 px-1.5 border-r border-b border-[#DDE3E9] font-semibold text-[#14212E]">
                    {m.name}
                  </td>
                  {m.cells.map((c, ci) => (
                    <td
                      key={ci}
                      title={c.title}
                      style={{ backgroundColor: c.bg, color: c.fg }}
                      className="py-1 px-1.5 border-r border-b border-[#DDE3E9] text-center font-bold"
                    >
                      {c.t}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By Item Table */}
      <div className="bg-white border border-[#DDE3E9] rounded-lg overflow-hidden">
        <div className="p-3 border-b border-[#DDE3E9] flex justify-between gap-2 flex-wrap items-center">
          <div className="flex flex-col gap-0.5">
            <h3 className="m-0 text-sm font-semibold text-[#14212E]">By item</h3>
            <span className="text-[11px] text-[#536271]">
              {ful.nItems} items · top 200 on screen, all rows in the Excel export · quantity in each
            </span>
          </div>
          <input
            type="text"
            value={ful.q}
            onChange={ful.onQ}
            placeholder="Search item code or name"
            className="text-xs py-1.5 px-2.5 border border-[#CBD4DC] rounded-md min-w-[240px]"
          />
        </div>
        <div className="overflow-auto max-h-[70vh]">
          <div className="grid grid-cols-[repeat(12,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            <div className="sticky top-0 z-10 col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">SN</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Item code</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Item</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Category</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">UoM</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Qty requested</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Qty delivered</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Value requested</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Value delivered</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Value gap</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Value fulfilment</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Countries</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Lines delivered</span>
            </div>
            {ful.items.map((x) => (
              <div
                key={x.sn}
                className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] text-[#14212E] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
              >
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.sn}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[10px]">{x.code}</span>
                <span
                  title={x.desc}
                  className="py-1 px-1.5 border-r border-[#DDE3E9] max-w-[380px] overflow-hidden text-ellipsis font-medium"
                >
                  {x.desc}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">{x.cat}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-[#536271]">{x.uom}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{x.qReq}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#087F3B]">{x.qDel}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">{x.req}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold text-[#087F3B]">
                  {x.del}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-bold text-[#C92A2A]">
                  {x.gap}
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] flex items-center gap-1.5">
                  <span className="w-[70px] h-1.5 rounded-full bg-[#EEF2F5] overflow-hidden flex">
                    <span style={{ width: x.w, backgroundColor: x.fg }} />
                  </span>
                  <span style={{ color: x.fg }} className="font-bold">
                    {x.rate}
                  </span>
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{x.cs}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.lines}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
