import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { BRIEF, BRIEF_DEFAULT } from '../../utils/constants';

interface AfricaMapProps {
  selectedCountry: string;
  onSelectCountry: (iso: string) => void;
  cases: Record<string, { confirmed: number; deaths: number }>;
  countryNames: Record<string, string>;
}

// Map ISO-3166-1 numeric IDs in world-atlas countries-110m to ISO3 codes
const ID_TO_ISO: Record<number, string> = {
  24: 'AGO',
  108: 'BDI',
  204: 'BEN',
  854: 'BFA',
  72: 'BWA',
  140: 'CAF',
  384: 'CIV',
  120: 'CMR',
  180: 'COD',
  178: 'COG',
  174: 'COM',
  132: 'CPV',
  262: 'DJI',
  12: 'DZA',
  818: 'EGY',
  232: 'ERI',
  231: 'ETH',
  266: 'GAB',
  288: 'GHA',
  324: 'GIN',
  270: 'GMB',
  624: 'GNB',
  226: 'GNQ',
  404: 'KEN',
  430: 'LBR',
  434: 'LBY',
  426: 'LSO',
  504: 'MAR',
  450: 'MDG',
  466: 'MLI',
  508: 'MOZ',
  478: 'MRT',
  480: 'MUS',
  454: 'MWI',
  516: 'NAM',
  562: 'NER',
  566: 'NGA',
  646: 'RWA',
  729: 'SDN',
  686: 'SEN',
  694: 'SLE',
  706: 'SOM',
  728: 'SSD',
  678: 'STP',
  748: 'SWZ',
  690: 'SYC',
  148: 'TCD',
  768: 'TGO',
  834: 'TZA',
  800: 'UGA',
  710: 'ZAF',
  894: 'ZMB',
  716: 'ZWE'
};

// Precise centroid coordinates for African countries for reliable rendering
const CENTROIDS: Record<string, [number, number]> = {
  COD: [23.6, -2.8],
  UGA: [32.3, 1.4],
  KEN: [37.9, 0.0],
  SSD: [31.3, 6.9],
  RWA: [29.9, -1.9],
  BDI: [29.9, -3.4],
  TZA: [34.8, -6.4],
  CAF: [20.9, 6.6],
  COG: [15.8, -0.2],
  AGO: [17.9, -12.3],
  ZMB: [27.8, -13.1],
  NGA: [8.7, 9.1],
  ETH: [39.6, 9.1],
  SOM: [46.2, 5.2],
  MOZ: [35.5, -18.7],
  CMR: [12.4, 5.7],
  TCD: [18.7, 15.5],
  NER: [8.1, 17.6],
  MLI: [-4.0, 17.6],
  GHA: [-1.0, 7.9],
  CIV: [-5.5, 7.5],
  GIN: [-9.7, 9.9],
  SLE: [-11.8, 8.5],
  LBR: [-9.4, 6.4],
  ZAF: [25.1, -29.0],
  ZWE: [29.9, -19.0],
  MDG: [46.9, -18.8],
  SDN: [30.2, 12.9],
  EGY: [30.8, 26.8],
  LBY: [17.2, 26.3],
  DZA: [1.7, 28.0],
  MAR: [-7.1, 31.8],
  MRT: [-10.9, 21.0],
  SEN: [-14.5, 14.5]
};

export const AfricaMap: React.FC<AfricaMapProps> = ({
  selectedCountry,
  onSelectCountry,
  cases,
  countryNames
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [topo, setTopo] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 540 });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
      .then(r => r.json())
      .then(data => setTopo(data))
      .catch(err => console.warn('World atlas fetch error, using centroids:', err));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.round(width), height: Math.max(500, Math.round(height)) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const sel = selectedCountry || BRIEF_DEFAULT;
  const set = new Set(BRIEF);

  // D3 Projection for Africa
  const proj = d3
    .geoMercator()
    .fitExtent(
      [
        [16, 16],
        [dimensions.width - 16, dimensions.height - 16]
      ],
      {
        type: 'MultiPoint',
        coordinates: [
          [-18, -35],
          [52, 30]
        ]
      }
    );

  const pathGenerator = d3.geoPath(proj);

  const features = topo
    ? (topojson.feature(topo, topo.objects.countries) as any).features
    : [];

  const centroidsMap: Record<string, [number, number]> = {};

  return (
    <div ref={containerRef} className="w-full h-full min-h-[520px] relative bg-[#FAFCFD]">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="block w-full h-full"
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {/* Country Polygons */}
        <g>
          {features.map((f: any) => {
            const iso = ID_TO_ISO[+f.id] || '';
            const isSelected = iso === sel;
            const isOutbreak = iso === 'COD';
            const isPriority = set.has(iso);

            const d = pathGenerator(f);
            if (!d) return null;

            if (isPriority) {
              const c = pathGenerator.centroid(f);
              if (c && !isNaN(c[0]) && !isNaN(c[1])) {
                centroidsMap[iso] = c;
              }
            }

            const fill = isSelected
              ? '#0071B8'
              : isOutbreak
              ? '#F6D5CC'
              : isPriority
              ? '#CFE5F5'
              : '#F1F3F5';

            const stroke = isSelected
              ? '#00205B'
              : isPriority
              ? '#5C7A92'
              : '#E2E7EC';

            const strokeWidth = isSelected ? 2 : isPriority ? 1.1 : 0.6;

            return (
              <path
                key={f.id}
                d={d}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                className={isPriority ? 'cursor-pointer transition-colors duration-150' : 'cursor-default'}
                onClick={() => {
                  if (isPriority) onSelectCountry(iso);
                }}
              >
                <title>{(countryNames[iso] || iso) + (isSelected ? ' (Selected)' : '')}</title>
              </path>
            );
          })}
        </g>

        {/* Labels & Cases */}
        <g className="pointer-events-none select-none">
          {BRIEF.map(iso => {
            let pt = centroidsMap[iso];
            if (!pt && CENTROIDS[iso]) {
              pt = proj(CENTROIDS[iso]) || [0, 0];
            }
            if (!pt || isNaN(pt[0])) return null;

            const isSelected = iso === sel;
            const nudge: Record<string, [number, number]> = {
              RWA: [-18, -4],
              BDI: [-18, 12],
              UGA: [0, -2],
              KEN: [6, 0]
            };
            const [dx, dy] = nudge[iso] || [0, 0];
            const x = pt[0] + dx;
            const y = pt[1] + dy;
            const k = cases[iso];

            return (
              <g key={iso} transform={`translate(${x}, ${y})`}>
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={isSelected ? '#FFFFFF' : '#14212E'}
                  stroke={isSelected ? '#0071B8' : '#FFFFFF'}
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontFamily="'IBM Plex Sans', sans-serif"
                >
                  {iso}
                </text>
                {k && k.confirmed > 0 && (
                  <text
                    x={0}
                    y={17}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill="#C92A2A"
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    paintOrder="stroke"
                    fontFamily="'IBM Plex Sans', sans-serif"
                  >
                    {k.confirmed.toLocaleString('en-US')} {k.confirmed === 1 ? 'case' : 'cases'}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
