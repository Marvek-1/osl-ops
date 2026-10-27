import React from 'react';
import { X, AlertTriangle, ArrowRight, ExternalLink, Calendar, CheckCircle, Package } from 'lucide-react';
import { LineItem, Order } from '../../types';
import { SRC, GM, SI } from '../../utils/constants';
import { fmt$, fmtN, fd } from '../../utils/engine';

interface LineModalProps {
  line: LineItem | null;
  order?: Order;
  onClose: () => void;
  onOpenOrder: (orderKey: string) => void;
}

export const LineModal: React.FC<LineModalProps> = ({ line, order, onClose, onOpenOrder }) => {
  if (!line) return null;

  const g = GM[line.j.g] || GM.pending;
  const isProc = line.type === 'Procurement';
  const viaTransit = line.st === 'prelg' || line.st === 'thub' || /transit hub/i.test(line.stRaw || '');

  // Step milestones
  const steps: { label: string; date: string | null; isDone: boolean; isCurrent: boolean }[] = [
    { label: 'Requested', date: line.rd, isDone: true, isCurrent: false },
    { label: isProc ? 'PO Created with Supplier' : 'Stock Request Created', date: line.poDate, isDone: !!line.poDate, isCurrent: line.st === 'planned' },
    { label: 'Committed Readiness', date: line.commit, isDone: !!line.commit, isCurrent: false },
    { label: isProc ? 'Ready at Supplier' : 'Goods Available at Hub', date: line.ready, isDone: !!line.ready, isCurrent: line.st === 'hub' },
    { label: 'Greenlight & Booking', date: null, isDone: ['depart', 'transit', 'arrived', 'received'].includes(line.st), isCurrent: line.st === 'gl' || line.st === 'depart' },
    { label: 'Departed', date: line.etd || (line.ship && line.ship.etd) || null, isDone: ['transit', 'arrived', 'received'].includes(line.st), isCurrent: line.st === 'depart' }
  ];

  if (viaTransit) {
    steps.push({
      label: 'At Transit Hub',
      date: null,
      isDone: ['transit', 'arrived', 'received'].includes(line.st),
      isCurrent: line.st === 'thub'
    });
  }

  steps.push(
    {
      label: line.ata ? 'Arrived in Country' : 'Expected Arrival (ETA)',
      date: line.ata || line.eta || (line.ship && (line.ship.ata || line.ship.eta)) || null,
      isDone: ['arrived', 'received'].includes(line.st),
      isCurrent: line.st === 'transit'
    },
    {
      label: 'Received',
      date: line.st === 'received' ? line.ata : null,
      isDone: line.st === 'received',
      isCurrent: line.st === 'arrived'
    }
  );

  const facts = [
    { k: 'Quantity', v: `${fmtN(line.qty)} ${line.uom}` },
    { k: 'Quantity in each', v: line.each ? fmtN(line.each) : '—' },
    { k: 'Unit Goods Value', v: line.unit ? `$${line.unit.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—' },
    { k: 'Line Amount', v: fmt$(line.amt) },
    { k: 'Category', v: line.cat || '—' },
    { k: 'Essential Item', v: line.ess || 'No' },
    { k: 'Supply Type', v: line.type || '—' },
    { k: 'WHO Shipping Status', v: line.stRaw || line.st },
    { k: 'Committed Readiness', v: fd(line.commit) },
    { k: 'Last Readiness', v: fd(line.ready) },
    { k: 'ETA / ATA', v: line.ata ? `ATA ${fd(line.ata)}` : line.eta ? `ETA ${fd(line.eta)}` : '—' },
    { k: 'PI Number', v: line.pi || '—' },
    { k: 'Donor', v: line.donor || '—' },
    { k: 'Award Expiration', v: fd(line.awardEnd) },
    { k: 'Fulfilled From', v: SRC[line.src]?.label || line.src },
    { k: 'Hub / Supplier', v: line.hub || '—' },
    { k: 'Origin PO', v: line.po || '—' },
    { k: 'OPR / PO Ref', v: line.opr || '—' },
    { k: 'Shipment Reference', v: line.ref },
    { k: 'Transport Mode', v: line.mode || '—' },
    { k: 'Transporter (3PL)', v: line.tpl || '—' },
    { k: 'AWB / BOL', v: line.awb || '—' },
    { k: 'Incoterm Route', v: [line.from, line.to].filter(Boolean).join(' → ') || '—' },
    { k: 'Registration No', v: line.reg || '—' },
    { k: 'PTAEO Funding', v: line.proj ? `${line.proj} · task ${line.task || '—'}` : '—' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#00205B] text-white p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                line.t === 'sr' ? 'bg-[#E0EEF8] text-[#00508A]' : 'bg-[#FAF1DA] text-[#C92A2A]'
              }`}>
                {line.t === 'sr' ? 'Stock Release' : 'Order Request'}
              </span>
              <span className="font-mono text-xs text-blue-200">{line.or}</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-200">{line.c}</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                style={{ backgroundColor: g.bg, color: g.fg }}
              >
                {line.stRaw || line.j.label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">{line.desc}</h2>
            <div className="flex items-center gap-2 text-xs text-blue-200 font-mono mt-1">
              <span>Code: {line.code || 'Not coded'}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-300">{fmt$(line.amt)}</span>
              <span>•</span>
              <span>{fmtN(line.qty)} {line.uom}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Delay / Bottleneck Alert */}
          {line.j.delayed && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-none mt-0.5" />
              <div className="flex flex-col">
                <strong className="text-xs font-bold text-rose-800">
                  {line.j.delayText || 'Delayed Item'}
                </strong>
                <p className="text-xs text-rose-700 mt-0.5">{line.j.detail}</p>
              </div>
            </div>
          )}

          {/* Journey detail quote */}
          {!line.j.delayed && line.j.detail && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 italic">
              “{line.j.detail}”
            </div>
          )}

          {/* Stepper Progress */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Journey Progress</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {steps.map((st, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                    st.isCurrent
                      ? 'border-[#0071B8] bg-blue-50/60 ring-1 ring-[#0071B8]'
                      : st.isDone
                      ? 'border-emerald-200 bg-emerald-50/40 text-slate-700'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`font-semibold text-[11px] ${st.isCurrent ? 'text-[#0071B8]' : st.isDone ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {st.label}
                    </span>
                    {st.isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-none" />}
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {st.date ? fd(st.date) : st.isDone ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Facts Grid */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Detailed Specifications & Logistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {facts.map((f, i) => (
                <div key={i} className="p-2.5 border border-slate-100 rounded-lg bg-slate-50/70 flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400">{f.k}</span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 truncate" title={f.v}>
                    {f.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Open Order Link */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenOrder(line.okey);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#0071B8] text-white rounded-lg hover:bg-[#00508A] transition-colors shadow-2xs"
          >
            <span>Open Parent Request ({line.or})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
