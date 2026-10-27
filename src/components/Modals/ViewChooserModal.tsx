import React from 'react';
import { LayoutDashboard, Compass, CheckCircle2, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface ViewChooserModalProps {
  isOpen: boolean;
  currentMode: 'brief' | 'ops';
  onSelectMode: (mode: 'brief' | 'ops') => void;
  onClose: () => void;
}

export const ViewChooserModal: React.FC<ViewChooserModalProps> = ({
  isOpen,
  currentMode,
  onSelectMode,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#00205B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-blue-300" />
            <h2 className="text-base font-bold text-white tracking-tight">Select Dashboard Perspective</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-xs text-slate-600">
            Choose the operational depth appropriate for your audience:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Executive Brief Card */}
            <div
              onClick={() => {
                onSelectMode('brief');
                onClose();
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                currentMode === 'brief'
                  ? 'border-[#0071B8] bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 rounded-lg text-[#0071B8]">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  {currentMode === 'brief' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071B8] bg-blue-100/60 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">Executive Brief</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tailored for the Regional Director, Incident Management System, and health ministers. Shows the Africa map, 5 macro KPIs, essential item runways, and all-country comparisons.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#0071B8] pt-2 border-t border-slate-100">
                <span>Open Executive Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Operations Tracker Card */}
            <div
              onClick={() => {
                onSelectMode('ops');
                onClose();
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                currentMode === 'ops'
                  ? 'border-[#0071B8] bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                    <Compass className="w-5 h-5" />
                  </div>
                  {currentMode === 'ops' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">Operations Tracker</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Engineered for OSL supply chain officers, hub logisticians, and procurement teams. 11 technical tabs with line-level tracking, cargo manifests, and Sankey flows.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#0071B8] pt-2 border-t border-slate-100">
                <span>Open Operations View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
