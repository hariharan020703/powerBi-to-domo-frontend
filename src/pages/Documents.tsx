import { useState } from 'react';
import {
  ChevronRight, ChevronDown, Download, RefreshCw, Share2,
  FileText, Table, Code, Database, AlertTriangle, BarChart2,
  Package, FileCheck, CheckCircle2, AlertCircle, Trash2
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
    freshColor: '#16a34a',
    accentGradient: 'linear-gradient(90deg, #f87171, #fb923c)',
  },
  {
    id: 'migration-register',
    name: 'Migration Register',
    type: 'Excel',
    typeColor: '#16a34a',
    icon: <Table size={16} style={{ color: '#16a34a' }} />,
    iconBg: 'rgba(22,163,74,0.1)',
    desc: 'Full inventory of all 48 dashboards — complexity, status, date, data source, Beast Mode count.',
    statA: '48 dashboards',
    statB: '380 KB',
    freshLabel: 'Updated 2h ago',
    freshColor: '#16a34a',
    accentGradient: 'linear-gradient(90deg, #16a34a, #4ade80)',
  },
  {
    id: 'beast-mode-lib',
    name: 'Beast Mode Library',
    type: 'Excel',
    typeColor: '#16a34a',
    icon: <Code size={16} style={{ color: '#16a34a' }} />,
    iconBg: 'rgba(22,163,74,0.1)',
    desc: 'All Beast Mode formulas written during migration with source formula and plain-English description.',
    statA: '214 formulas',
    statB: '1.1 MB',
    freshLabel: 'Updated 2h ago',
    freshColor: '#16a34a',
    accentGradient: 'linear-gradient(90deg, #16a34a, #4ade80)',
  },
  {
    id: 'datasource-mapping',
    name: 'Data Source Mapping',
    type: 'CSV',
    typeColor: '#2563eb',
    icon: <Database size={16} style={{ color: '#2563eb' }} />,
    iconBg: 'rgba(37,99,235,0.1)',
    desc: 'Source connections mapped to Domo connectors/DataFlows. Includes refresh schedules.',
    statA: '9 sources',
    statB: '48 KB',
    freshLabel: 'Updated 3h ago',
    freshColor: '#16a34a',
    accentGradient: 'linear-gradient(90deg, #2563eb, #60a5fa)',
  },
  {
    id: 'known-diffs',
    name: 'Known Differences Log',
    type: 'PDF',
    typeColor: '#d97706',
    icon: <AlertTriangle size={16} style={{ color: '#d97706' }} />,
    iconBg: 'rgba(217,119,6,0.1)',
    desc: 'Dashboards where Domo output differs from source — reason and accepted workaround.',
    statA: '7 differences',
    statB: '210 KB',
    freshLabel: 'Stale — regenerate needed',
    freshColor: '#d97706',
    stale: true,
    cardBorder: 'rgba(217,119,6,0.25)',
    accentGradient: 'linear-gradient(90deg, #d97706, #fbbf24)',
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
    freshColor: '#16a34a',
    accentGradient: 'linear-gradient(90deg, #f87171, #fb923c)',
  },
];

function DocCardComponent({ doc }: { doc: DocCard }) {
  const [hovered, setHovered] = useState(false);

  const btnPrimary = {
    background: 'rgba(108,71,255,0.10)',
    border: '1px solid rgba(108,71,255,0.22)',
    color: '#6c47ff',
    fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;

  const btnGhost = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--muted)',
    fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;

  const btnShare = {
    background: 'rgba(108,71,255,0.08)',
    border: '1px solid rgba(108,71,255,0.20)',
    color: '#6c47ff',
    fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;

  const btnAmber = {
    background: 'rgba(217,119,6,0.08)',
    border: '1px solid rgba(217,119,6,0.22)',
    color: '#d97706',
    fontSize: 9, fontWeight: 700, borderRadius: 5,
    padding: '4px 8px', cursor: 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', gap: 3,
  } as const;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${doc.cardBorder ?? (hovered ? 'rgba(108,71,255,0.20)' : 'var(--border)')}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 28px rgba(108,71,255,0.10)' : '0 1px 8px rgba(15,23,60,0.06)',
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
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{doc.name}</p>
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
                color: '#6c47ff',
                background: 'rgba(108,71,255,0.09)',
                border: '1px solid rgba(108,71,255,0.20)',
                borderRadius: 4, padding: '1px 5px',
              }}>
                Auto
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{doc.desc}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-2">
          <span style={{
            fontSize: 9, color: 'var(--muted)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 6px',
          }}>
            {doc.statA}
          </span>
          <span style={{
            fontSize: 9, color: 'var(--muted)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 6px',
          }}>
            {doc.statB}
          </span>
        </div>

        {/* Freshness */}
        <p style={{ fontSize: 9, color: doc.freshColor, marginBottom: 10, fontWeight: 600 }}>{doc.freshLabel}</p>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button style={btnPrimary}><Download size={9} /> Download</button>
          {doc.stale ? (
            <button style={btnAmber}><RefreshCw size={9} /> Regen now</button>
          ) : (
            <>
              <button style={btnGhost}><RefreshCw size={9} /> Regen</button>
              <button style={btnShare}><Share2 size={9} /> Share</button>
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
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>Documents</span>
    </div>
  );

  const TopRight = (
    <div className="flex items-center gap-2">
      {/* Project selector */}
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
        Acme Corp — Tableau
        <ChevronDown size={11} style={{ color: 'var(--muted)' }} />
      </button>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300"
        style={{
          background: 'rgba(108,71,255,0.08)',
          border: '1px solid rgba(108,71,255,0.22)',
          color: '#6c47ff',
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
          <StatCard icon={<FileCheck size={12} />} label="TOTAL DOCS" value="6" />
          <StatCard icon={<CheckCircle2 size={12} />} label="AUTO-GENERATED" value="5" valueColor="#6c47ff" sub="By migrationIQ" subColor="#6c47ff" />
          <StatCard icon={<AlertCircle size={12} />} label="LAST UPDATED" value="2h ago" valueColor="#16a34a" sub="All up to date" subColor="#16a34a" />
          <StatCard icon={<Trash2 size={12} />} label="STALE" value="1" valueColor="#d97706" sub="Regenerate needed" subColor="#d97706" />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Project deliverables
          </p>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
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
            background: 'var(--card-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(108,71,255,0.18)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(108,71,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6c47ff, #0066cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Package size={16} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Download complete package</p>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>All 6 documents bundled as zip</p>
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

function StatCard({ icon, label, value, valueColor, sub, subColor }: {
  icon?: React.ReactNode; label: string; value: string; valueColor?: string; sub?: string; subColor?: string;
}) {
  return (
    <div 
      className="relative overflow-hidden transition-all duration-300 cursor-default"
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 12px',
        boxShadow: '0 1px 6px rgba(15,23,60,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(111,43,139,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 6px rgba(15,23,60,0.05)';
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        {icon && (
          <div className="flex items-center justify-center rounded-md w-6 h-6" style={{ background: 'rgba(111,43,139,0.08)', color: 'var(--purple)' }}>
            {icon}
          </div>
        )}
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: valueColor || 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 9, color: subColor || 'var(--muted)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}
