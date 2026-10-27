import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ViewMode, TabId, Dataset, CaseData, ImpactData, ParkingLotData, Order, LineItem } from './types';
import { filterLines, buildProcessedData } from './utils/engine';
import { exportExecutiveWorkbook } from './utils/export';
import { Header } from './components/Header';
import { ExecutiveBriefView } from './components/ExecutiveBrief/ExecutiveBriefView';
import { OverviewTab } from './components/Operations/OverviewTab';
import { CountryBriefTab } from './components/Operations/CountryBriefTab';
import { LineDetailsTab } from './components/Operations/LineDetailsTab';
import { ShipmentInfoTab } from './components/Operations/ShipmentInfoTab';
import { ProcurementTab } from './components/Operations/ProcurementTab';
import { CriticalItemsTab } from './components/Operations/CriticalItemsTab';
import { FulfilmentTab } from './components/Operations/FulfilmentTab';
import { BackOrdersTab } from './components/Operations/BackOrdersTab';
import { BeneficiariesRiskTab } from './components/Operations/BeneficiariesRiskTab';
import { DataSchemaTab } from './components/Operations/DataSchemaTab';
import { ParkingLotTab } from './components/Operations/ParkingLotTab';
import { GlossaryTab } from './components/Operations/GlossaryTab';
import { OrderModal } from './components/Modals/OrderModal';
import { LineModal } from './components/Modals/LineModal';
import { ViewChooserModal } from './components/Modals/ViewChooserModal';
import { PresentationOverlay } from './components/Presentation/PresentationOverlay';
import { BRIEF, BRIEF_DEFAULT, SRC, WHO_ST } from './utils/constants';

export const App: React.FC = () => {
  // Raw data from JSON files
  const [rawData, setRawData] = useState<Dataset | null>(null);
  const [casesData, setCasesData] = useState<CaseData | null>(null);
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [parkingData, setParkingData] = useState<ParkingLotData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // View state
  const [mode, setMode] = useState<ViewMode>('brief');
  const [activeTab, setActiveTab] = useState<TabId>('visuals');
  const [briefCountry, setBriefCountry] = useState<string>(BRIEF_DEFAULT);

  // Filters
  const [q, setQ] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [src, setSrc] = useState<string>('');
  const [em, setEm] = useState<string>('G013');
  const [type, setType] = useState<string>('');
  const [stage, setStage] = useState<string>('');
  const [dFrom, setDFrom] = useState<string>('');
  const [dTo, setDTo] = useState<string>('');
  const [issuesOnly, setIssuesOnly] = useState<boolean>(false);
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  // Modals & presentation
  const [openOrderKey, setOpenOrderKey] = useState<string | null>(null);
  const [openLineIndex, setOpenLineIndex] = useState<number | null>(null);
  const [isViewChooserOpen, setIsViewChooserOpen] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [presentationSlide, setPresentationSlide] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isExportingXlsx, setIsExportingXlsx] = useState<boolean>(false);

  // Load all 4 data files
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [ordersRes, casesRes, impactRes, parkingRes] = await Promise.all([
          fetch('/data/orders.json').then(r => r.json()),
          fetch('/data/cases.json').then(r => r.json()),
          fetch('/data/impact.json').then(r => r.json()),
          fetch('/data/parking.json').then(r => r.json())
        ]);

        // Process raw orders into Dataset format
        const today = ordersRes.asOf || '2026-10-22';
        const rawCountries = ordersRes.countries || [];
        const countryMap: Record<string, { iso: string; name: string }> = {};
        rawCountries.forEach((c: any) => {
          countryMap[c.iso] = c;
        });

        // Pre-process raw orders lines
        const lines: LineItem[] = (ordersRes.lines || []).map((l: any, i: number) => ({
          ...l,
          i,
          t: /^\s*[O0]R/i.test(l.or || '') ? 'or' : /SR/i.test(l.or || '') ? 'sr' : 'or',
          okey: `${l.c}|${l.or}`
        }));

        const dataset: Dataset = {
          today,
          asOf: today,
          countries: rawCountries,
          cn: countryMap,
          orders: [],
          lines,
          ships: ordersRes.ships || {},
          ems: ordersRes.ems || [],
          allLines: lines,
          allCn: Object.fromEntries(rawCountries.map((c: any) => [c.iso, c.name]))
        };

        setRawData(dataset);
        setCasesData(casesRes);
        setImpactData(impactRes);
        setParkingData(parkingRes);
      } catch (err: any) {
        console.error('Failed to load application data:', err);
        setLoadError(err.message || 'Error loading dashboard dataset');
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // Filtered dataset
  const processedData = useMemo(() => {
    if (!rawData) return null;

    const filtered = filterLines(rawData.lines, {
      country,
      src,
      em,
      type,
      stage,
      q,
      dFrom,
      dTo,
      issuesOnly
    });

    const processed = buildProcessedData(rawData, filtered);
    return processed;
  }, [rawData, country, src, em, type, stage, q, dFrom, dTo, issuesOnly]);

  // Selected Order for Modal
  const selectedOrder = useMemo(() => {
    if (!openOrderKey || !processedData) return null;
    return processedData.orders.find(o => o.key === openOrderKey) || null;
  }, [openOrderKey, processedData]);

  // Selected Line for Modal
  const selectedLine = useMemo(() => {
    if (openLineIndex == null || !processedData) return null;
    return processedData.lines[openLineIndex] || null;
  }, [openLineIndex, processedData]);

  // Options for Dropdowns
  const countryOpts = useMemo(() => {
    if (!rawData) return [];
    return rawData.countries
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(c => ({ v: c.iso, label: c.name }));
  }, [rawData]);

  const srcOpts = useMemo(() => {
    return [
      { v: 'nbo', label: 'Nairobi hub (NBO)' },
      { v: 'dkr', label: 'Dakar hub (DKR)' },
      { v: 'dxb', label: 'Dubai hub (DXB)' },
      { v: 'proc', label: 'Direct supplier PO' },
      { v: 'gva', label: 'Geneva HQ stock' },
      { v: 'hq', label: 'HQ / OSL stock' },
      { v: 'kin', label: 'Kinshasa stock' }
    ];
  }, []);

  const emOpts = useMemo(() => {
    return [
      { v: 'G013', label: '2026-G013 Ebola (Bundibugyo)' },
      { v: 'ebola', label: 'All Ebola / Marburg / VHF tags' },
      { v: 'all', label: 'All emergency tags' }
    ];
  }, []);

  const typeOpts = useMemo(() => {
    return [
      { v: 'or', label: 'Order requests (OR)' },
      { v: 'sr', label: 'Stock releases (SR)' }
    ];
  }, []);

  const stageOpts = useMemo(() => {
    return WHO_ST.map(s => ({ v: s.k, label: s.label }));
  }, []);

  const anyFilter = Boolean(country || src || stage || type || q || dFrom || dTo || issuesOnly || em !== 'G013');

  const handleClearAll = useCallback(() => {
    setCountry('');
    setSrc('');
    setStage('');
    setType('');
    setQ('');
    setDFrom('');
    setDTo('');
    setIssuesOnly(false);
    setEm('G013');
  }, []);

  // Export to Excel handler
  const handleExportXlsx = useCallback(async () => {
    if (!processedData || !casesData || !impactData || !parkingData) return;
    try {
      setIsExportingXlsx(true);
      await exportExecutiveWorkbook(processedData, casesData, impactData, parkingData, {
        filename: `WHO_AFRO_Ebola_Supply_Chain_${processedData.today}.xlsx`
      });
    } catch (e) {
      console.error('Failed to export workbook:', e);
    } finally {
      setIsExportingXlsx(false);
    }
  }, [processedData, casesData, impactData, parkingData]);

  // Export to PDF / Print handler
  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  // Presentation Slide Navigation
  const presentationSlides = useMemo(() => {
    if (!rawData) return ['Overview'];
    return ['Regional Overview', ...BRIEF.map(iso => rawData.cn[iso]?.name || iso)];
  }, [rawData]);

  const handleNextSlide = useCallback(() => {
    setPresentationSlide(prev => Math.min(presentationSlides.length - 1, prev + 1));
  }, [presentationSlides.length]);

  const handlePrevSlide = useCallback(() => {
    setPresentationSlide(prev => Math.max(0, prev - 1));
  }, []);

  const tabLabelMap: Record<TabId, string> = {
    visuals: 'Overview',
    countries: 'Country brief',
    lines: 'Line details',
    ships: 'Shipment info',
    proc: 'Procurement',
    critical: 'Critical items',
    fulfil: 'Fulfilment',
    backorders: 'Back orders',
    impact: 'Beneficiaries & risk',
    glossary: 'Glossary',
    parking: 'Parking Lot',
    schema: 'Data Schema'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F5F7] flex flex-col items-center justify-center gap-4 text-slate-700">
        <div className="w-12 h-12 border-4 border-[#0071B8] border-t-transparent rounded-full animate-spin" />
        <div className="flex flex-col items-center">
          <strong className="text-base font-bold text-[#00205B]">WHO AFRO · OSL Health Emergencies</strong>
          <span className="text-xs text-slate-500 mt-1">Loading Ebola Preparedness & Response Dataset…</span>
        </div>
      </div>
    );
  }

  if (loadError || !processedData || !casesData || !impactData || !parkingData) {
    return (
      <div className="min-h-screen bg-[#F3F5F7] flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl mb-3">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Failed to Load Dashboard Data</h2>
          <p className="text-xs text-rose-700 mb-5">{loadError || 'Missing required dataset files.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0071B8] text-white text-xs font-semibold rounded-lg hover:bg-[#00508A] transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F7] text-[#14212E]">
      {/* Universal Header */}
      <Header
        asOf={processedData.today}
        tabLabel={tabLabelMap[activeTab]}
        mode={mode}
        onSetMode={m => setMode(m)}
        activeTab={activeTab}
        onSelectTab={t => setActiveTab(t)}
        q={q}
        onQChange={val => setQ(val)}
        country={country}
        onCountryChange={val => setCountry(val)}
        countryOpts={countryOpts}
        src={src}
        onSrcChange={val => setSrc(val)}
        srcOpts={srcOpts}
        em={em}
        onEmChange={val => setEm(val)}
        emOpts={emOpts}
        type={type}
        onTypeChange={val => setType(val)}
        typeOpts={typeOpts}
        stage={stage}
        onStageChange={val => setStage(val)}
        stageOpts={stageOpts}
        dFrom={dFrom}
        onDFromChange={val => setDFrom(val)}
        dTo={dTo}
        onDToChange={val => setDTo(val)}
        issuesOnly={issuesOnly}
        onToggleIssues={() => setIssuesOnly(prev => !prev)}
        anyFilter={anyFilter}
        onClearAll={handleClearAll}
        showMoreFilters={showMoreFilters}
        onToggleMoreFilters={() => setShowMoreFilters(prev => !prev)}
        onExportPdf={handleExportPdf}
        onExportXlsx={handleExportXlsx}
        isExportingXlsx={isExportingXlsx}
        onStartPresent={() => {
          setIsPresentationOpen(true);
          setPresentationSlide(0);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-h-0">
        {mode === 'brief' ? (
          <ExecutiveBriefView
            data={processedData}
            cases={casesData}
            selectedCountry={briefCountry}
            onSelectCountry={iso => setBriefCountry(iso)}
            onGoToOperations={iso => {
              if (iso) setCountry(iso);
              setActiveTab('backorders');
              setMode('ops');
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {activeTab === 'visuals' && (
              <OverviewTab
                data={processedData}
                onSelectOrder={key => setOpenOrderKey(key)}
                onSelectCountry={iso => {
                  setCountry(iso);
                  setActiveTab('countries');
                }}
              />
            )}

            {activeTab === 'countries' && (
              <CountryBriefTab
                data={processedData}
                selectedCountry={country || 'UGA'}
                onSelectOrder={key => setOpenOrderKey(key)}
                onSelectLine={idx => setOpenLineIndex(idx)}
              />
            )}

            {activeTab === 'lines' && (
              <LineDetailsTab
                data={processedData}
                onSelectOrder={key => setOpenOrderKey(key)}
                onSelectLine={idx => setOpenLineIndex(idx)}
              />
            )}

            {activeTab === 'ships' && (
              <ShipmentInfoTab
                data={processedData}
                onSelectOrder={key => setOpenOrderKey(key)}
                onSelectLine={idx => setOpenLineIndex(idx)}
              />
            )}

            {activeTab === 'proc' && (
              <ProcurementTab
                data={processedData}
                onSelectOrder={key => setOpenOrderKey(key)}
                onSelectLine={idx => setOpenLineIndex(idx)}
              />
            )}

            {activeTab === 'critical' && (
              <CriticalItemsTab
                data={processedData}
                onSelectLine={idx => setOpenLineIndex(idx)}
              />
            )}

            {activeTab === 'fulfil' && (
              <FulfilmentTab
                data={processedData}
                onSelectCountry={iso => {
                  setCountry(iso);
                  setActiveTab('countries');
                }}
              />
            )}

            {activeTab === 'backorders' && (
              <BackOrdersTab
                data={processedData}
                onSelectOrder={key => setOpenOrderKey(key)}
                onSelectLine={idx => setOpenLineIndex(idx)}
              />
            )}

            {activeTab === 'impact' && (
              <BeneficiariesRiskTab
                data={processedData}
                impact={impactData}
                cases={casesData}
              />
            )}

            {activeTab === 'schema' && <DataSchemaTab />}

            {activeTab === 'parking' && (
              <ParkingLotTab
                data={processedData}
                parking={parkingData}
                onSelectLine={idx => setOpenLineIndex(idx)}
              />
            )}

            {activeTab === 'glossary' && <GlossaryTab />}
          </div>
        )}
      </main>

      {/* Modals */}
      <OrderModal
        order={selectedOrder}
        onClose={() => setOpenOrderKey(null)}
        onSelectLine={idx => {
          setOpenOrderKey(null);
          setOpenLineIndex(idx);
        }}
      />

      <LineModal
        line={selectedLine}
        order={selectedOrder || undefined}
        onClose={() => setOpenLineIndex(null)}
        onOpenOrder={key => {
          setOpenLineIndex(null);
          setOpenOrderKey(key);
        }}
      />

      <ViewChooserModal
        isOpen={isViewChooserOpen}
        currentMode={mode}
        onSelectMode={m => setMode(m)}
        onClose={() => setIsViewChooserOpen(false)}
      />

      {/* Presentation Fullscreen Overlay */}
      <PresentationOverlay
        isOpen={isPresentationOpen}
        slideTitle={presentationSlides[presentationSlide] || 'Slide'}
        currentSlideIndex={presentationSlide}
        totalSlides={presentationSlides.length}
        isAutoPlay={isAutoPlay}
        onPrev={handlePrevSlide}
        onNext={handleNextSlide}
        onToggleAutoPlay={() => setIsAutoPlay(prev => !prev)}
        onGoToSlide={idx => setPresentationSlide(idx)}
        onClose={() => {
          setIsPresentationOpen(false);
          setIsAutoPlay(false);
        }}
      />
    </div>
  );
};
export default App;
