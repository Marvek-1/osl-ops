import React from 'react';
import { ViewMode, TabId } from '../types';
import { fd } from '../utils/engine';

interface HeaderProps {
  asOf: string;
  tabLabel: string;
  mode: ViewMode;
  onSetMode: (m: ViewMode) => void;
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  // Filters
  q: string;
  onQChange: (q: string) => void;
  country: string;
  onCountryChange: (c: string) => void;
  countryOpts: Array<{ v: string; label: string }>;
  src: string;
  onSrcChange: (s: string) => void;
  srcOpts: Array<{ v: string; label: string }>;
  em: string;
  onEmChange: (em: string) => void;
  emOpts: Array<{ v: string; label: string }>;
  type: string;
  onTypeChange: (t: string) => void;
  typeOpts: Array<{ v: string; label: string }>;
  stage: string;
  onStageChange: (s: string) => void;
  stageOpts: Array<{ v: string; label: string }>;
  dFrom: string;
  onDFromChange: (d: string) => void;
  dTo: string;
  onDToChange: (d: string) => void;
  issuesOnly: boolean;
  onToggleIssues: () => void;
  anyFilter: boolean;
  onClearAll: () => void;
  showMoreFilters: boolean;
  onToggleMoreFilters: () => void;
  // Actions
  onExportPdf: () => void;
  onExportXlsx: () => void;
  onStartPresent: () => void;
  isExportingXlsx?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  asOf,
  tabLabel,
  mode,
  onSetMode,
  activeTab,
  onSelectTab,
  q,
  onQChange,
  country,
  onCountryChange,
  countryOpts,
  src,
  onSrcChange,
  srcOpts,
  em,
  onEmChange,
  emOpts,
  type,
  onTypeChange,
  typeOpts,
  stage,
  onStageChange,
  stageOpts,
  dFrom,
  onDFromChange,
  dTo,
  onDToChange,
  issuesOnly,
  onToggleIssues,
  anyFilter,
  onClearAll,
  showMoreFilters,
  onToggleMoreFilters,
  onExportPdf,
  onExportXlsx,
  onStartPresent,
  isExportingXlsx = false
}) => {
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'visuals', label: 'Overview' },
    { id: 'countries', label: 'Country brief' },
    { id: 'lines', label: 'Line details' },
    { id: 'ships', label: 'Shipment info' },
    { id: 'proc', label: 'Procurement' },
    { id: 'critical', label: 'Critical items' },
    { id: 'fulfil', label: 'Fulfilment' },
    { id: 'backorders', label: 'Back orders' },
    { id: 'impact', label: 'Beneficiaries & risk' },
    { id: 'glossary', label: 'Glossary' },
    { id: 'parking', label: 'Parking Lot' },
    { id: 'schema', label: 'Data Schema' }
  ];

  const activeFiltersCount = [src, stage, type, dFrom, dTo].filter(Boolean).length;

  return (
    <header className="bg-white border-b border-[#DDE3E9] flex-none select-none" data-screen-header="1">
      {/* Top Banner */}
      <div className="bg-[#00205B] text-white">
        <div className="px-6 py-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src="/assets/who-afro.png"
              alt="World Health Organization African Region"
              className="w-11 h-11 flex-none rounded-full bg-white ring-2 ring-white object-contain"
            />
            <span className="w-px h-8 bg-white/28 flex-none" />
            <div className="flex flex-col min-w-0">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#8FD3F4] truncate">
                WHO AFRO · Health Emergencies · 2026-G013 Ebola (Bundibugyo)
              </div>
              <h1 className="text-[19px] font-semibold tracking-tight text-white leading-tight truncate">
                Ebola Preparedness · Order Request Tracker
              </h1>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-[#C7D3E6] whitespace-nowrap">
              Data as of <strong className="text-white font-semibold">{fd(asOf)}</strong> ·{' '}
              <span className="text-white/90">{mode === 'brief' ? 'Executive brief' : tabLabel}</span>
            </span>

            {/* Mode Switcher */}
            <div className="flex border border-white/35 rounded-md overflow-hidden bg-transparent">
              <button
                type="button"
                onClick={() => onSetMode('brief')}
                className={`cursor-pointer whitespace-nowrap text-xs font-semibold px-3 py-1.5 transition-colors ${
                  mode === 'brief' ? 'bg-white text-[#00205B]' : 'bg-transparent text-white hover:bg-white/10'
                }`}
              >
                Executive brief
              </button>
              <button
                type="button"
                onClick={() => onSetMode('ops')}
                className={`cursor-pointer whitespace-nowrap text-xs font-semibold px-3 py-1.5 transition-colors ${
                  mode === 'ops' ? 'bg-white text-[#00205B]' : 'bg-transparent text-white hover:bg-white/10'
                }`}
              >
                Operations
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={onExportPdf}
                title="Export this page to PDF (print dialog)"
                className="cursor-pointer whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-md border border-white/35 bg-transparent text-white hover:bg-white/15 transition-colors"
              >
                PDF
              </button>
              <button
                type="button"
                onClick={onExportXlsx}
                title="Export every table on this page to Excel, all rows"
                className="cursor-pointer whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-md border border-white/35 bg-transparent text-white hover:bg-white/15 transition-colors"
              >
                {isExportingXlsx ? 'Exporting…' : 'Excel'}
              </button>
            </div>

            {/* Present Button */}
            <button
              type="button"
              onClick={onStartPresent}
              className="cursor-pointer flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-md bg-[#009ADE] text-white hover:bg-[#0087c5] transition-colors whitespace-nowrap shadow-xs"
            >
              <span className="w-0 h-0 border-l-[7px] border-l-white border-t-[4.5px] border-t-transparent border-b-[4.5px] border-b-transparent" />
              Present
            </button>
          </div>
        </div>
        {/* Accent Bar */}
        <div className="h-[3px] bg-[#009ADE]" />
      </div>

      {/* Tabs Row (Operations Mode Only) */}
      {mode === 'ops' && (
        <nav className="flex gap-0.5 overflow-x-auto px-4 bg-white border-b border-[#EEF2F5] scrollbar-none" data-noprint="1">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTab(t.id)}
                className={`cursor-pointer whitespace-nowrap text-sm px-3 pt-2.5 pb-2 transition-all border-b-[3px] ${
                  isActive
                    ? 'text-[#00205B] font-semibold border-[#0071B8]'
                    : 'text-[#536271] font-medium border-transparent hover:text-[#14212E] hover:border-[#CBD4DC]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Filter Toolbar (Operations Mode Only) */}
      {mode === 'ops' && (
        <div className="px-6 py-2 bg-[#FBFCFD] border-t border-[#EEF2F5] flex flex-wrap gap-2 items-center text-sm" data-noprint="1">
          <input
            type="text"
            value={q}
            onChange={e => onQChange(e.target.value)}
            placeholder="Search request, shipment, AWB, PO or item"
            className="flex-1 min-w-[180px] max-w-[320px] text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] focus:outline-hidden focus:border-[#0071B8]"
          />

          {/* Country Selector */}
          <select
            value={country}
            onChange={e => onCountryChange(e.target.value)}
            className="text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] focus:outline-hidden focus:border-[#0071B8]"
          >
            <option value="">All countries</option>
            {countryOpts.map(o => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Source Hub Selector */}
          <select
            value={src}
            onChange={e => onSrcChange(e.target.value)}
            className="text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] focus:outline-hidden focus:border-[#0071B8]"
          >
            <option value="">All sources</option>
            {srcOpts.map(o => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Emergency Tag Selector */}
          <select
            value={em}
            onChange={e => onEmChange(e.target.value)}
            title="Emergencies/Activities"
            className="text-[13px] px-2.5 py-1.5 border border-[#0A84FF] rounded-md bg-[#EAF3FB] text-[#0062CC] font-semibold max-w-[260px] focus:outline-hidden"
          >
            <option value="G013">2026-G013 Ebola Bundibugyo</option>
            {emOpts.map(o => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Supply Type Selector */}
          <select
            value={type}
            onChange={e => onTypeChange(e.target.value)}
            className="text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] focus:outline-hidden focus:border-[#0071B8]"
          >
            <option value="">SR + OR</option>
            {typeOpts.map(o => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={onToggleMoreFilters}
            className="cursor-pointer text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] font-medium whitespace-nowrap hover:bg-[#F3F5F7]"
          >
            {showMoreFilters ? 'Fewer filters' : 'More filters'}
            {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
          </button>

          {/* Needs Attention Toggle */}
          <button
            type="button"
            onClick={onToggleIssues}
            className={`cursor-pointer text-[13px] px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors border ${
              issuesOnly
                ? 'border-[#E8590C] bg-[#FDEBE2] text-[#C92A2A]'
                : 'border-[#CBD4DC] bg-white text-[#14212E] hover:bg-[#F3F5F7]'
            }`}
          >
            Needs attention only
          </button>

          {/* Clear Button */}
          {anyFilter && (
            <button
              type="button"
              onClick={onClearAll}
              className="cursor-pointer text-xs px-2 py-1 text-[#0071B8] font-semibold hover:underline"
            >
              Clear
            </button>
          )}

          {/* Expanded Secondary Filters */}
          {showMoreFilters && (
            <div className="w-full pt-1 flex flex-wrap gap-2 items-center text-[13px] border-t border-[#EEF2F5] mt-1">
              <select
                value={stage}
                onChange={e => onStageChange(e.target.value)}
                className="text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] focus:outline-hidden focus:border-[#0071B8]"
              >
                <option value="">All statuses</option>
                {stageOpts.map(o => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>

              <span className="text-xs text-[#536271] font-medium">Requested</span>
              <input
                type="date"
                value={dFrom}
                onChange={e => onDFromChange(e.target.value)}
                className="text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] focus:outline-hidden focus:border-[#0071B8]"
              />
              <span className="text-xs text-[#536271]">–</span>
              <input
                type="date"
                value={dTo}
                onChange={e => onDToChange(e.target.value)}
                className="text-[13px] px-2.5 py-1.5 border border-[#CBD4DC] rounded-md bg-white text-[#14212E] focus:outline-hidden focus:border-[#0071B8]"
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
};
