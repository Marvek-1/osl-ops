import React from 'react';

interface ParkingLotTabProps {
  pk: {
    noImports: boolean;
    imports: Array<{
      date: string;
      summary: string;
      files: Array<{
        file: string;
        role: string;
        scope: string;
        rows: string;
        matched: string;
        added: string;
        replaced: string;
        fv: string;
        dv: string;
        res: string;
        bg: string;
        fg: string;
      }>;
      notes?: string[];
    }>;
    liveCount: string;
    live: Array<{
      sn: number;
      rule: string;
      field: string;
      n: string;
      g: string;
      ex: string;
      src: string;
    }>;
    liveNone: boolean;
    issues: Array<{
      sn: number;
      date: string;
      file: string;
      field: string;
      v: string;
      why: string;
      n: string;
      refs: string;
    }>;
    ref: Array<{
      date: string;
      source: string;
      filters: string;
      figures: Array<{ k: string; p: string; d: string }>;
    }>;
    exportCsv: () => void;
  };
  lv: {
    note: string;
    reload: () => void;
    rows: Array<{
      sn: number;
      ds: string;
      name: string;
      url: string;
      status: string;
      bg: string;
      fg: string;
      mod: string;
      rows: string;
      value: string;
      cols: string;
      filters: string;
    }>;
  };
  dq: {
    total: string;
    rows: Array<{
      sn: number;
      field: string;
      v: string;
      why: string;
      n: string;
      refs: string;
      src: string;
    }>;
    exportCsv: () => void;
  };
  onGoSchema: () => void;
}

export const ParkingLotTab: React.FC<ParkingLotTabProps> = ({ pk, lv, dq, onGoSchema }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 max-w-[900px]">
        <h2 className="m-0 text-xl font-semibold text-[#14212E]">Parking Lot</h2>
        <span className="text-xs text-[#536271] leading-relaxed">
          Data inconsistencies found in the source exports, and a receipt for each update comparing every file with the dashboard. Values are listed as recorded. Nothing is corrected in the source.
        </span>
      </div>

      {/* Update Receipts */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
        <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8]">
          Update receipts
        </h3>
        {pk.imports.map((im, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline">
              <strong className="text-sm text-[#14212E]">{im.date}</strong>
              <span className="text-xs text-[#3F4B57]">{im.summary}</span>
            </div>
            <div className="overflow-x-auto border border-[#DDE3E9] border-r-0 rounded">
              <div className="grid grid-cols-[repeat(9,max-content)_minmax(max-content,1fr)] w-max min-w-full">
                <div className="col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">File</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Content</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Scope</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Rows in file</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Matched</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Added</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Replaced</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Value in file</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Value in dash</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Result</span>
                </div>
                {im.files.map((f, fi) => (
                  <div
                    key={fi}
                    className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
                  >
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold">{f.file}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{f.role}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{f.scope}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{f.rows}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{f.matched}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{f.added}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{f.replaced}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{f.fv}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{f.dv}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9]">
                      <span
                        style={{ backgroundColor: f.bg, color: f.fg }}
                        className="inline-block py-0.5 px-2 rounded-full font-semibold text-[10px]"
                      >
                        {f.res}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {pk.noImports && <span className="text-xs text-[#536271]">No update receipts recorded.</span>}
      </div>

      {/* Live Sources · SharePoint */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
        <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8] flex justify-between gap-2.5 items-baseline">
          <span>Live sources · SharePoint</span>
          <button
            type="button"
            onClick={lv.reload}
            className="cursor-pointer text-[11px] py-1 px-2.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] font-medium tracking-normal capitalize"
          >
            Read again
          </button>
        </h3>
        <span className="text-xs text-[#3F4B57] leading-relaxed">{lv.note}</span>
        <div className="overflow-x-auto border border-[#DDE3E9] border-r-0 rounded">
          <div className="grid grid-cols-[repeat(9,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            <div className="col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">SN</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Source</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Export</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Status</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Last modified</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Rows</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Value in file</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Columns</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Applied filters</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Open</span>
            </div>
            {lv.rows.map((x) => (
              <div
                key={x.sn}
                className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] items-center hover:bg-[#F3F8FC]"
              >
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.sn}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] whitespace-nowrap">{x.ds}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold whitespace-nowrap">{x.name}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] whitespace-nowrap">
                  <span
                    style={{ backgroundColor: x.bg, color: x.fg }}
                    className="inline-block py-0.5 px-2 rounded-full font-semibold text-[10px]"
                  >
                    {x.status}
                  </span>
                </span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] whitespace-nowrap">{x.mod}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{x.rows}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{x.value}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] whitespace-nowrap">{x.cols}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] whitespace-nowrap">{x.filters}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] whitespace-nowrap">
                  <a href={x.url} target="_blank" rel="noopener noreferrer" className="text-[#0071B8] hover:underline">
                    File →
                  </a>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reference Power BI OSL Monitoring */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
        <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8]">
          Reference · Power BI OSL monitoring (OSL_AF)
        </h3>
        {pk.ref.map((rf, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <span className="text-xs text-[#3F4B57]">
              <strong className="text-[#14212E]">{rf.date}</strong> · {rf.source} · {rf.filters}
            </span>
            <div className="overflow-x-auto border border-[#DDE3E9] border-r-0 rounded">
              <div className="grid grid-cols-[max-content_max-content_minmax(max-content,1fr)] w-max min-w-full">
                <div className="col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Figure</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Power BI</span>
                  <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">This dashboard (all tags)</span>
                </div>
                {rf.figures.map((fg, fi) => (
                  <div
                    key={fi}
                    className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
                  >
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{fg.k}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">{fg.p}</span>
                    <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{fg.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checks on the Current Dataset */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
        <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8] flex justify-between gap-2.5 items-baseline">
          <span>Checks on the current dataset · {pk.liveCount} lines</span>
          <button
            type="button"
            onClick={pk.exportCsv}
            className="cursor-pointer text-[11px] py-1 px-2.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] font-medium tracking-normal capitalize hover:bg-[#F3F5F7]"
          >
            Export for data cleaning (CSV)
          </button>
        </h3>
        <span className="text-xs text-[#3F4B57] leading-relaxed">
          Run on every line in the dataset, all emergency tags, each time the dashboard loads. Nothing is removed: every value stays as recorded.
        </span>
        <div className="overflow-x-auto border border-[#DDE3E9] border-r-0 rounded">
          <div className="grid grid-cols-[repeat(6,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            <div className="col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">SN</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Check</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Field</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Lines</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">G013 lines</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Example ref</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Sources</span>
            </div>
            {pk.live.map((x) => (
              <div
                key={x.sn}
                className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
              >
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{x.sn}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{x.rule}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold">{x.field}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">{x.n}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{x.g}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono">{x.ex}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{x.src}</span>
              </div>
            ))}
          </div>
        </div>
        {pk.liveNone && <span className="text-xs text-[#536271]">No inconsistencies found by these checks.</span>}
      </div>

      {/* Inconsistent Values in the Export */}
      <div className="bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
        <h3 className="m-0 pb-2 border-b-2 border-[#C92A2A] text-[11px] font-bold tracking-wider uppercase text-[#C92A2A] flex justify-between gap-2.5 items-baseline">
          <span>Inconsistent values in the export · {dq.total} cells</span>
          <button
            type="button"
            onClick={dq.exportCsv}
            className="cursor-pointer text-[11px] py-1 px-2.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] font-medium tracking-normal capitalize hover:bg-[#F3F5F7]"
          >
            Export for data cleaning (CSV)
          </button>
        </h3>
        <span className="text-xs text-[#3F4B57] leading-relaxed">
          Values that cannot be what the column says. They are shown in the dashboard as &quot;Inconsistent (recorded as …)&quot; and are not used in any calculation.
        </span>
        <div className="overflow-x-auto border border-[#DDE3E9] border-r-0 rounded">
          <div className="grid grid-cols-[repeat(6,max-content)_minmax(max-content,1fr)] w-max min-w-full">
            <div className="col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">SN</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Field</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Value as recorded</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Issue</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6] text-right">Lines</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Shipments</span>
              <span className="py-1 px-1.5 border-r border-[#3D8FC6]">Sources</span>
            </div>
            {dq.rows.map((q) => (
              <div
                key={q.sn}
                className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
              >
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right text-[#536271]">{q.sn}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold">{q.field}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-mono text-[#C92A2A]">{q.v}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{q.why}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold">{q.n}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{q.refs}</span>
                <span className="py-1 px-1.5 border-r border-[#DDE3E9]">{q.src}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onGoSchema}
        className="cursor-pointer border-0 bg-transparent text-xs text-[#0071B8] hover:underline self-start font-medium"
      >
        Data schema: sources, fields and mapping →
      </button>
    </div>
  );
};
