import { useState } from 'react';
import {
  ChevronRight, ChevronDown, Download, RefreshCw, Share2,
  FileText, Table, Code, Database, AlertTriangle, BarChart2,
  Package,
} from 'lucide-react';
import AppShell from '../components/AppShell';

interface DocCard {
  id: string;
  name: string;
  type: string;
  typeColor: string;
  icon: React.ReactNode;
  iconBg: string;
  desc: string;
  statA: string;
  statB: string;
  freshLabel: string;
  freshColor: string;
  stale?: boolean;
  cardBorder?: string;
  accentGradient: string;
}

const docs: DocCard[] = [
  {
    id: 'field-mapping',
    name: 'Field Mapping Report',
    type: 'PDF',
    typeColor: '#f87171',
    icon: <FileText size={16} style={{ color: '#f87171' }} />,
    iconBg: 'rgba(248,113,113,0.1)',
    desc: 'Every calculated field and LOD expression mapped to its Domo Beast Mode equivalent.',
    statA: '214 fields',
    statB: '2.4 MB',
    freshLabel: 'Updated 2h ago',
    freshColor: '#34d399',
    accentGradient: 'linear-gradient(90deg, #f87171, #fb923c)',
  },
  {
    id: 'migration-register',
    name: 'Migration Register',
    type: 'Excel',
    typeColor: '#34d399',
    icon: <Table size={16} style={{ color: '#34d399' }} />,
    iconBg: 'rgba(52,211,153,0.1)',
    desc: 'Full inventory of all 48 dashboards — complexity, status, date, data source, Beast Mode count.',
    statA: '48 dashboards',
    statB: '380 KB',
    freshLabel: 'Updated 2h ago',
    freshColor: '#34d399',
    accentGradient: 'linear-gradient(90deg, #34d399, #6ee7b7)',
  },
  {
    id: 'beast-mode-lib',
    name: 'Beast Mode Library',
    type: 'Excel',
    typeColor: '#34d399',
    icon: <Code size={16} style={{ color: '#34d399' }} />,
    iconBg: 'rgba(52,211,153,0.1)',
    desc: 'All Beast Mode formulas written during migration with source formula and plain-English description.',
    statA: '214 formulas',
    statB: '1.1 MB',
    freshLabel: 'Updated 2h ago',
    freshColor: '#34d399',
    accentGradient: 'linear-gradient(90deg, #34d399, #6ee7b7)',
  },
  {
    id: 'datasource-mapping',
    name: 'Data Source Mapping',
    type: 'CSV',
    typeColor: '#60a5fa',
    icon: <Database size={16} style={{ color: '#60a5fa' }} />,
    iconBg: 'rgba(96,165,250,0.1)',
    desc: 'Source connections mapped to Domo connectors/DataFlows. Includes refresh schedules.',
    statA: '9 sources',
    statB: '48 KB',
    freshLabel: 'Updated 3h ago',
    freshColor: '#34d399',
    accentGradient: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
  },
  {
    id: 'known-diffs',
    name: 'Known Differences Log',
    type: 'PDF',
    typeColor: '#fbbf24',
    icon: <AlertTriangle size={16} style={{ color: '#fbbf24' }} />,
    iconBg: 'rgba(251,191,36,0.1)',
    desc: 'Dashboards where Domo output differs from source — reason and accepted workaround.',
    statA: '7 differences',
    statB: '210 KB',
    freshLabel: 'Stale — regenerate needed',
    freshColor: '#fbbf24',
    stale: true,
    cardBorder: 'rgba(245,158,11,0.2)',
    accentGradient: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
  },
  {
    id: 'project-summary',
    name: 'Project Summary Report',
    type: 'PDF',
    typeColor: '#f87171',
    icon: <BarChart2 size={16} style={{ color: '#f87171' }} />,
    iconBg: 'rgba(248,113,113,0.1)',
    desc: 'One-page executive summary — dashboards migrated, time taken, complexity breakdown.',
    statA: '31 migrated',
    statB: '890 KB',
    freshLabel: 'Updated 2h ago',
    freshColor: '#34d399',
    accentGradient: 'linear-gradient(90deg, #f87171, #fb923c)',
  },
];

function DocCardComponent({ doc }: { doc: DocCard }) {
  const [hovered, setHovered] = useState(false);

  const btnCyan = {
    background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)',
    color: '#00f0ff', fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;
  const btnGhost = {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    color: '#8fa0dd', fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;
  const btnPurple = {
    background: 'rgba(112,0,255,0.08)', border: '1px solid rgba(112,0,255,0.2)',
    color: '#c084fc', fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;
  const btnAmber = {
    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
    color: '#fbbf24', fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(13,17,39,0.60)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${doc.cardBorder ?? (hovered ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.06)')}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Accent line */}
      <div style={{
        height: 2,
        background: hovered ? doc.accentGradient : 'transparent',
        transition: 'background 0.3s',
      }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: doc.iconBg,
            border: `1px solid ${doc.iconBg.replace('0.1)', '0.2)')}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {doc.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{doc.name}</p>
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: doc.typeColor,
                background: `${doc.typeColor}18`,
                border: `1px solid ${doc.typeColor}33`,
                borderRadius: 4, padding: '1px 5px',
              }}>
                {doc.type}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: '#00f0ff',
                background: 'rgba(0,240,255,0.08)',
                border: '1px solid rgba(0,240,255,0.2)',
                borderRadius: 4, padding: '1px 5px',
              }}>
                Auto
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 10, color: '#8fa0dd', lineHeight: 1.5, marginBottom: 10 }}>{doc.desc}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-2">
          <span style={{
            fontSize: 9, color: '#8fa0dd',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 4, padding: '2px 6px',
          }}>
            {doc.statA}
          </span>
          <span style={{
            fontSize: 9, color: '#8fa0dd',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 4, padding: '2px 6px',
          }}>
            {doc.statB}
          </span>
        </div>

        {/* Freshness */}
        <p style={{ fontSize: 9, color: doc.freshColor, marginBottom: 10 }}>{doc.freshLabel}</p>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button style={btnCyan}><Download size={9} /> Download</button>
          {doc.stale ? (
            <button style={btnAmber}><RefreshCw size={9} /> Regen now</button>
          ) : (
            <>
              <button style={btnGhost}><RefreshCw size={9} /> Regen</button>
              <button style={btnPurple}><Share2 size={9} /> Share</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const Breadcrumb = (
    <div className="flex items-center gap-1" style={{ fontSize: 11 }}>
      <span style={{ color: 'white', fontWeight: 600 }}>Documents</span>
    </div>
  );

  const TopRight = (
    <div className="flex items-center gap-2">
      {/* Project selector */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#c0bfe8',
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        <ChevronRight size={11} style={{ color: '#8fa0dd' }} />
        Acme Corp — Tableau
        <ChevronDown size={11} style={{ color: '#8fa0dd' }} />
      </button>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300"
        style={{
          background: 'transparent',
          border: '1px solid rgba(0,240,255,0.2)',
          color: '#00f0ff',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Share2 size={11} />
        Share all
      </button>
    </div>
  );

  return (
    <AppShell topbarLeft={Breadcrumb} topbarRight={TopRight}>
      <div className="p-5 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard label="TOTAL DOCS" value="6" />
          <StatCard label="AUTO-GENERATED" value="5" valueColor="#00f0ff" sub="By migrationIQ" subColor="#00f0ff" />
          <StatCard label="LAST UPDATED" value="2h ago" valueColor="#34d399" sub="All up to date" subColor="#34d399" />
          <StatCard label="STALE" value="1" valueColor="#fbbf24" sub="Regenerate needed" subColor="#fbbf24" />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8fa0dd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Project deliverables
          </p>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8fa0dd',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={11} />
            Regenerate all
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(doc => (
            <DocCardComponent key={doc.id} doc={doc} />
          ))}
        </div>

        {/* Download banner */}
        <div
          style={{
            background: 'rgba(13,17,39,0.60)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,240,255,0.15)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            justifyContent: 'space-between',
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Package size={16} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Download complete package</p>
              <p style={{ fontSize: 10, color: '#8fa0dd', marginTop: 2 }}>All 6 documents bundled as zip</p>
            </div>
          </div>
          <button
            className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold flex-shrink-0"
          >
            <Download size={12} />
            Download all as .zip
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, valueColor, sub, subColor }: {
  label: string; value: string; valueColor?: string; sub?: string; subColor?: string;
}) {
  return (
    <div style={{
      background: 'rgba(13,17,39,0.60)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: '10px 12px',
    }}>
      <p style={{ fontSize: 9, fontWeight: 600, color: '#8fa0dd', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: valueColor || '#f1f3f9', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 9, color: subColor || '#8fa0dd', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}
