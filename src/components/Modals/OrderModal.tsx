import React from 'react';
import { X, AlertTriangle, Calendar, DollarSign, Package, Truck, ExternalLink, CheckCircle2 } from 'lucide-react';
import { STG, SRC, SEV } from '../../utils/constants';
import { fmt$, fmtN, fd, pct } from '../../utils/engine';

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onSelectLine?: (lineIndex: number) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ order, onClose, onSelectLine }) => {
  if (!order) return null;

  const fundingCodes = Array.from(
    new Set(
      order.lines
        .filter(l => l.proj)
        .map(l => `${l.proj} · task ${l.task || '—'} · award ${l.award || '—'}`)
    )
  );

  // Timeline events calculation
  const timelineEvents: { date: string; label: string; ref: string; count: number; isFuture: boolean }[] = [];
  const eventMap = new Map<string, { date: string; label: string; ref: string; count: number }>();

  const addEv = (date: string | null | undefined, label: string, ref: string, count: number = 1) => {
    if (!date) return;
    const key = `${date}|${label}|${ref}`;
    const existing = eventMap.get(key);
    if (existing) {
      existing.count += count;
    } else {
      eventMap.set(key, { date, label, ref, count });
    }
  };

  addEv(order.rd, 'Request raised', order.id, order.lines.length);
  order.lines.forEach(l => {
    const r = l.ref.startsWith('(no') ? 'not yet assigned' : l.ref;
    if (l.poDate) addEv(l.poDate, l.type === 'Procurement' ? 'PO created with supplier' : 'Stock request created', r);
    if (l.commit) addEv(l.commit, 'Committed readiness', r);
    if (l.ready) addEv(l.ready, l.type === 'Procurement' ? 'Ready at supplier' : 'Ready at hub', r);
    if (l.etd) addEv(l.etd, 'Departed', r);
    if (l.ata) addEv(l.ata, l.st === 'received' ? 'Arrived · received' : 'Arrived in country', r);
    else if (l.eta && l.st !== 'canceled') addEv(l.eta, 'Expected arrival (ETA)', r);
  });

  const sortedEvents = Array.from(eventMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date) || a.label.localeCompare(b.label)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#00205B] text-white p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                order.t === 'sr' ? 'bg-[#E0EEF8] text-[#00508A]' : 'bg-[#FAF1DA] text-[#C92A2A]'
              }`}>
                {order.t === 'sr' ? 'Stock Release' : 'Order Request'}
              </span>
              <span className="text-xs text-blue-200">
                {order.cname} · {order.id}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">{order.id}</h2>
            <div className="flex items-center gap-3 text-xs text-blue-100 mt-1">
              <span>Requested {fd(order.rd)}</span>
              <span>•</span>
              <span>{order.lines.length} line items</span>
              <span>•</span>
              <span className="font-semibold text-emerald-300">{fmt$(order.value)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { k: 'Requested', v: fd(order.rd) },
              { k: 'Total Value', v: fmt$(order.value) },
              { k: 'Delivered', v: pct(order.delivered, order.value) },
              { k: 'Shipments', v: order.shipments.length },
              { k: 'Line Items', v: order.lines.length },
              { k: 'Sources', v: order.srcs.map(s => SRC[s]?.label || s).join(', ') }
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col">
                <span className="text-[11px] font-medium text-slate-500">{f.k}</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 truncate" title={String(f.v)}>{f.v}</span>
              </div>
            ))}
          </div>

          {/* Operational Issues Alert */}
          {order.issues.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Attention Points ({order.issues.length})</span>
              </h3>
              <div className="flex flex-col gap-1.5">
                {order.issues.map((issue, idx) => {
                  const s = SEV[issue.sev] || SEV[1];
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg text-xs flex items-center justify-between gap-3 border"
                      style={{ backgroundColor: s.bg, color: s.fg, borderColor: s.fg + '40' }}
                    >
                      <span className="font-semibold">{issue.text}</span>
                      <span className="font-mono text-[11px] opacity-80">{issue.ref}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Breakdown */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Stage Fulfilment</h3>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
              {STG.map(st => {
                const amt = order.byStage[st.k] || 0;
                if (!amt || !order.value) return null;
                const share = (amt / order.value) * 100;
                return (
                  <div
                    key={st.k}
                    style={{ width: `${share}%`, backgroundColor: st.color }}
                    title={`${st.label}: ${fmt$(amt)} (${Math.round(share)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600">
              {STG.map(st => {
                const amt = order.byStage[st.k] || 0;
                if (!amt) return null;
                return (
                  <div key={st.k} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    <span>{st.label}: <strong>{fmt$(amt)}</strong></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronological Timeline */}
          {sortedEvents.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Milestone Timeline</h3>
              <div className="relative pl-5 border-l-2 border-slate-200 flex flex-col gap-3 py-1">
                {sortedEvents.map((ev, i) => (
                  <div key={i} className="relative flex flex-col text-xs">
                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#0071B8] border-2 border-white shadow-xs" />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-slate-800">{ev.label}</span>
                      <span className="font-mono text-[11px] text-slate-500">{fd(ev.date)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Ref: <code className="font-mono">{ev.ref}</code></span>
                      <span>•</span>
                      <span>{ev.count} item{ev.count === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Funding Codes (PTAEO) */}
          {fundingCodes.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">PTAEO Funding Allocation</h3>
              <div className="flex flex-wrap gap-2">
                {fundingCodes.map((fc, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
                    {fc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shipments List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Shipments ({order.shipments.length})
            </h3>
            {order.shipments.map(s => {
              const srcObj = SRC[s.src] || SRC.hq;
              return (
                <div key={s.ref} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#0071B8]">{s.ref}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                        style={{ backgroundColor: srcObj.bg, color: srcObj.fg }}
                      >
                        {srcObj.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-700">{fmt$(s.value)}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">
                        {s.lines.length} lines
                      </span>
                    </div>
                  </div>

                  {/* Shipment details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Route / Mode</span>
                      <span className="font-medium text-slate-700 truncate block">
                        {[s.mode, s.tpl].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">AWB / BOL</span>
                      <span className="font-mono text-slate-700 block truncate">{s.awb || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Ready / ETD</span>
                      <span className="text-slate-700 block truncate">
                        {[s.ready ? `Rdy ${fd(s.ready)}` : '', s.etd ? `ETD ${fd(s.etd)}` : ''].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ETA / ATA</span>
                      <span className="text-slate-700 block truncate">
                        {s.ata ? `Arrived ${fd(s.ata)}` : s.eta ? `ETA ${fd(s.eta)}` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">Item Description</th>
                          <th className="py-2 px-2.5">WHO Code</th>
                          <th className="py-2 px-2.5 text-right">Quantity</th>
                          <th className="py-2 px-2.5 text-right">Amount</th>
                          <th className="py-2 px-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {s.lines.map((l, li) => (
                          <tr
                            key={li}
                            onClick={() => onSelectLine && onSelectLine(l.i)}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-2.5 text-slate-800 font-medium max-w-xs truncate" title={l.desc}>
                              {l.desc}
                            </td>
                            <td className="py-2 px-2.5 font-mono text-slate-500 whitespace-nowrap">{l.code || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 whitespace-nowrap">
                              {fmtN(l.qty)} {l.uom}
                            </td>
                            <td className="py-2 px-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                              {fmt$(l.amt)}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {l.stRaw || l.st}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
