import React from 'react';

interface GlossaryTabProps {
  srcProfile: Array<{
    label: string;
    n: string;
    cells: Array<{ v: string; fg: string; bg: string }>;
  }>;
  srcHead: Array<{ label: string }>;
}

export const GlossaryTab: React.FC<GlossaryTabProps> = ({ srcProfile, srcHead }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-xl font-semibold text-[#14212E]">Glossary &amp; methods</h2>
        <span className="text-xs text-[#536271]">
          How each tab reads the OSL export and how the estimates are calculated.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        {/* WHO Shipping Status */}
        <div className="col-span-full bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
          <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8]">
            WHO Shipping Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
            <div className="flex flex-col text-[11px] leading-snug border border-[#DDE3E9] border-b-0 rounded overflow-hidden">
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] bg-[#0071B8] text-white text-[10px] font-semibold tracking-wider uppercase">
                <span className="p-1 px-1.5 border-r border-[#3D8FC6]">Status</span>
                <span className="p-1 px-1.5 border-r border-[#3D8FC6]">Meaning</span>
                <span className="p-1 px-1.5">Group</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">00-Planned</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Line planned, nothing sourced yet</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready · planned</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">01-Sourced</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Source identified</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready · planned</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">01b-Awating Pre-leg</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Ready, waiting for the first leg to the transit hub</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#0062CC]">01c-At transit hub</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Arrived at the transit hub, waiting for the final leg</span>
                <span className="p-1 px-1.5 text-[#0062CC] font-semibold">In transit</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#0062CC]">01d-Sourced (at transit hub)</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Sourced from stock already at the transit hub</span>
                <span className="p-1 px-1.5 text-[#0062CC] font-semibold">In transit</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">02-Goods Available at hub or supplier</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Goods ready at the hub or supplier</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">04-GL Requested (if needed)</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Greenlight requested, awaiting approval</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">06-Pending pre-alert request</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Waiting for the pre-alert to the consignee</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready · pending departure</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">07-Pending Departure</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Cleared, waiting to depart</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready · pending departure</span>
              </div>
            </div>

            <div className="flex flex-col text-[11px] leading-snug border border-[#DDE3E9] border-b-0 rounded overflow-hidden">
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] bg-[#0071B8] text-white text-[10px] font-semibold tracking-wider uppercase">
                <span className="p-1 px-1.5 border-r border-[#3D8FC6]">Status</span>
                <span className="p-1 px-1.5 border-r border-[#3D8FC6]">Meaning</span>
                <span className="p-1 px-1.5">Group</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#0062CC]">08-Shipped</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Departed, on the way to the country</span>
                <span className="p-1 px-1.5 text-[#0062CC] font-semibold">In transit</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#087F3B]">09-Arrived</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Arrived in country</span>
                <span className="p-1 px-1.5 text-[#087F3B] font-semibold">Delivered</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#087F3B]">09-Arrived (from transit hub)</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Arrived via transit hub</span>
                <span className="p-1 px-1.5 text-[#087F3B] font-semibold">Delivered</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#087F3B]">10-Received</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Receipt confirmed by the country</span>
                <span className="p-1 px-1.5 text-[#087F3B] font-semibold">Delivered</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#087F3B]">10-Received (from transit hub)</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Receipt confirmed via transit hub</span>
                <span className="p-1 px-1.5 text-[#087F3B] font-semibold">Delivered</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#3F4B57]">11-Canceled</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Line canceled</span>
                <span className="p-1 px-1.5 text-[#536271] font-semibold">Excluded from totals</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">12-On Hold</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">Line on hold</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready · planned</span>
              </div>
              <div className="grid grid-cols-[1.1fr_1.3fr_0.8fr] border-b border-[#DDE3E9]">
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] font-bold text-[#C92A2A]">oo-MIssing</span>
                <span className="p-1 px-1.5 border-r border-[#DDE3E9] text-[#3F4B57]">No status entered in export</span>
                <span className="p-1 px-1.5 text-[#C92A2A] font-semibold">Not ready · planned</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-[#536271] leading-relaxed">
            Statuses are shown exactly as written in the export, including original spelling (Awating, MIssing). The Procurement tab lists all 17.
          </span>
        </div>

        {/* Requests, Shipments, Sources */}
        <div className="col-span-1 md:col-span-6 bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
          <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8]">
            Requests, shipments and sources
          </h3>
          <div className="flex flex-col gap-2 text-xs text-[#3F4B57] leading-relaxed">
            <div>
              <strong className="text-[#14212E]">Request:</strong> Order Request (OR) + Destination Country.
            </div>
            <div>
              <strong className="text-[#14212E]">Order request (OR):</strong> Raised directly by the country office (OR_…, country references).
            </div>
            <div>
              <strong className="text-[#14212E]">Stock release (SR):</strong> Pushed by WHO from hub stock (NBO_SR, DKR_SR, SR_…_hub). Both count toward country total.
            </div>
            <div>
              <strong className="text-[#14212E]">Shipment:</strong> WHO Shipping Reference. Weight, volume and temperature come from Shipping_Info.
            </div>
            <div>
              <strong className="text-[#14212E]">Fulfilled from:</strong> HUB/Supplier: Stock-AF-NBO Nairobi, Stock-AF-DKR Dakar, Stock-HQ-DXB Dubai, Stock-HQ-GVA Geneva, Stock-DRC-KIN Kinshasa; Supply Type Procurement = supplier PO.
            </div>
            <div>
              <strong className="text-[#14212E]">Supply Type:</strong> Stock = WHO hub stock · Stock (free) = free-of-charge stock · Procurement = bought on a PO · Inkind = donated by a partner · 3rd Party = supplied by a third party.
            </div>
            <div>
              <strong className="text-[#14212E]">PTAEO:</strong> Project, Task, Award, Expenditure type, Organisation: funding codes.
            </div>
          </div>
        </div>

        {/* Calculations */}
        <div className="col-span-1 md:col-span-6 bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
          <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8]">
            Calculations
          </h3>
          <div className="flex flex-col gap-2 text-xs text-[#3F4B57] leading-relaxed">
            <div>
              <strong className="text-[#14212E]">Value:</strong> PO Line Amount (USD). Canceled lines excluded from value and line counts.
            </div>
            <div>
              <strong className="text-[#14212E]">Delivered:</strong> Status 09 or 10, including from transit hub. Not yet delivered = every other status except 11.
            </div>
            <div>
              <strong className="text-[#14212E]">Delivered %:</strong> Shown as lines delivered ÷ lines ordered and as delivered value ÷ ordered value.
            </div>
            <div>
              <strong className="text-[#14212E]">Request → arrival:</strong> Median days from Request Date to ATA, over delivered lines with both dates.
            </div>
            <div>
              <strong className="text-[#14212E]">Requested vs delivered:</strong> Line value or count by week of Request Date against week of ATA; cumulative mode shows gap.
            </div>
            <div>
              <strong className="text-[#14212E]">Needs attention:</strong> Greenlight pending &gt; 7 days, status 02 at hub &gt; 14 days without dispatch, supplier readiness passed, or ETA passed while in transit.
            </div>
          </div>
        </div>

        {/* Data Recorded by Source */}
        <div className="col-span-full bg-white border border-[#DDE3E9] rounded-xl p-3.5 md:p-4 flex flex-col gap-2.5">
          <h3 className="m-0 pb-2 border-b-2 border-[#0071B8] text-[11px] font-bold tracking-wider uppercase text-[#0071B8]">
            Data recorded by source
          </h3>
          <span className="text-xs text-[#3F4B57] leading-relaxed">
            Each hub and procurement channel fills different columns. Share of lines with the field filled, from the current export.
          </span>
          <div className="overflow-x-auto border border-[#DDE3E9] border-r-0 rounded">
            <div className="grid grid-cols-[max-content_max-content_repeat(12,max-content)] w-max min-w-full">
              <div className="col-span-full grid grid-cols-subgrid bg-[#0071B8] text-[10px] font-semibold tracking-wider uppercase text-white">
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap">Source</span>
                <span className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">Lines</span>
                {srcHead.map((c, idx) => (
                  <span key={idx} className="py-1 px-1.5 border-r border-[#3D8FC6] whitespace-nowrap text-right">
                    {c.label}
                  </span>
                ))}
              </div>
              {srcProfile.map((p, idx) => (
                <div
                  key={idx}
                  className="col-span-full grid grid-cols-subgrid border-t border-[#DDE3E9] text-[11px] whitespace-nowrap items-center hover:bg-[#F3F8FC]"
                >
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] font-semibold">{p.label}</span>
                  <span className="py-1 px-1.5 border-r border-[#DDE3E9] text-right">{p.n}</span>
                  {p.cells.map((c, ci) => (
                    <span
                      key={ci}
                      style={{ color: c.fg, backgroundColor: c.bg }}
                      className="py-1 px-1.5 border-r border-[#DDE3E9] text-right font-semibold"
                    >
                      {c.v}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
