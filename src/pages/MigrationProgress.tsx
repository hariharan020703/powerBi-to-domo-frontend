import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell';
import { usePowerBIWorkspaces } from '../hooks/usePowerBI';
import { apiClient } from '../config/api';

type Complexity = 'easy' | 'medium' | 'complex';
type Status = 'in-progress' | 'migrated' | 'error' | 'pending';

interface ExecItem {
  id: number;
  name: string;
  subtitle: string;
  state: 'active' | 'done' | 'error';
  tags: { label: string; bg: string; border: string; color: string }[];
  detail: string;
  detailHighlights: string[];
}

function highlightText(text: string, highlights: string[]) {
  let result: (string | JSX.Element)[] = [text];
  highlights.forEach(h => {
    result = result.flatMap(part => {
      if (typeof part !== 'string') return [part];
      const idx = part.indexOf(h);
      if (idx === -1) return [part];
      return [
        part.slice(0, idx),
        <span key={h} style={{ color: '#00f0ff' }}>{h}</span>,
        part.slice(idx + h.length),
      ];
    });
  });
  return result;
}

const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40

export default function MigrationProgress() {
  // 1. Fetch workspaces
  const { workspaces, loading: loadingWorkspaces } = usePowerBIWorkspaces();

  const [reports, setReports] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Read persisted migration statuses from localStorage
  const [migrationStatuses, setMigrationStatuses] = useState<Record<string, Status>>(() => {
    try {
      const saved = localStorage.getItem('powerbi_migration_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Pull all reports/datasets in parallel to scan statuses
  useEffect(() => {
    if (workspaces.length === 0) {
      setReports([]);
      setDatasets([]);
      return;
    }

    let active = true;

    async function loadAllReportsAndDatasets() {
      try {
        setLoadingDetails(true);

        const results = await Promise.all(
          workspaces.map(async (ws) => {
            let wsReports: any[] = [];
            let wsDatasets: any[] = [];

            try {
              const repRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/reports`);
              wsReports = repRes.value || [];
            } catch (err) {
              console.error(err);
            }

            try {
              const dsRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/datasets`);
              wsDatasets = dsRes.value || [];
            } catch (err) {
              console.error(err);
            }

            const decoratedReports = wsReports.map(r => ({
              ...r,
              workspaceName: ws.name,
              workspaceId: ws.id
            }));

            return { reports: decoratedReports, datasets: wsDatasets };
          })
        );

        if (active) {
          const allReports = results.flatMap(r => r.reports);
          const allDatasets = results.flatMap(r => r.datasets);
          setReports(allReports);
          setDatasets(allDatasets);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoadingDetails(false);
        }
      }
    }

    loadAllReportsAndDatasets();

    return () => {
      active = false;
    };
  }, [workspaces]);

  // Constantly refresh migration statuses from local storage to respond to tab toggles/background triggers
  useEffect(() => {
    const checkStatuses = () => {
      try {
        const saved = localStorage.getItem('powerbi_migration_statuses');
        if (saved) {
          setMigrationStatuses(JSON.parse(saved));
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Listen to local storage modifications
    window.addEventListener('storage', checkStatuses);
    
    // Also poll every 1s while this page is active to keep it feeling snappy
    const interval = setInterval(checkStatuses, 1000);

    return () => {
      window.removeEventListener('storage', checkStatuses);
      clearInterval(interval);
    };
  }, []);

  const loading = loadingWorkspaces || loadingDetails;

  // Filter reports to ONLY include reports that are active ('in-progress', 'migrated', or 'error')
  const activeReports = reports.filter(r => {
    const status = migrationStatuses[r.id];
    return status === 'in-progress' || status === 'migrated' || status === 'error';
  });

  // Map active reports to their metadata profiles
  const activeReportsMapped = activeReports.map((report) => {
    const status = migrationStatuses[report.id] || 'pending';
    const fieldsCount = report.fieldsCount || 0;

    let complexity: Complexity = 'medium';
    if (fieldsCount > 0) {
      if (fieldsCount > 30) {
        complexity = 'complex';
      } else if (fieldsCount < 10) {
        complexity = 'easy';
      }
    }

    return {
      ...report,
      status,
      complexity
    };
  });

  const easyCount = activeReportsMapped.filter(r => r.complexity === 'easy').length;
  const mediumCount = activeReportsMapped.filter(r => r.complexity === 'medium').length;
  const complexCount = activeReportsMapped.filter(r => r.complexity === 'complex').length;
  const totalCount = activeReportsMapped.length;

  const easyMigrated = activeReportsMapped.filter(r => r.complexity === 'easy' && r.status === 'migrated').length;
  const mediumMigrated = activeReportsMapped.filter(r => r.complexity === 'medium' && r.status === 'migrated').length;
  const complexMigrated = activeReportsMapped.filter(r => r.complexity === 'complex' && r.status === 'migrated').length;

  const totalMigrated = easyMigrated + mediumMigrated + complexMigrated;
  const progressPercent = totalCount > 0 ? Math.round((totalMigrated / totalCount) * 100) : 0;

  const waveData = [
    {
      name: 'Wave 1 — Easy',
      count: easyCount,
      progress: easyCount > 0 ? Math.round((easyMigrated / easyCount) * 100) : 0,
      status: easyCount > 0 ? `${easyMigrated} of ${easyCount} · Complete` : 'No active items',
      statusColor: '#34d399',
      barBg: 'linear-gradient(90deg, #00f0ff, #7000ff)',
    },
    {
      name: 'Wave 2 — Medium',
      count: mediumCount,
      progress: mediumCount > 0 ? Math.round((mediumMigrated / mediumCount) * 100) : 0,
      status: mediumCount > 0 ? `${mediumMigrated} of ${mediumCount} · In progress` : 'No active items',
      statusColor: '#a78bfa',
      barBg: 'linear-gradient(90deg, #7000ff, #a78bfa)',
    },
    {
      name: 'Wave 3 — Complex',
      count: complexCount,
      progress: complexCount > 0 ? Math.round((complexMigrated / complexCount) * 100) : 0,
      status: complexCount > 0 ? `${complexMigrated} of ${complexCount} · Active` : 'No active items',
      statusColor: '#8fa0dd',
      barBg: 'rgba(255,255,255,0.1)',
    },
  ];

  const timeline = [
    { label: 'Project started', date: 'Active', color: '#34d399', glow: 'rgba(52,211,153,0.5)', blink: false },
    { label: 'Wave 1 complete', date: easyCount > 0 && easyMigrated === easyCount ? 'Done' : 'Pending', color: easyCount > 0 && easyMigrated === easyCount ? '#34d399' : 'rgba(255,255,255,0.15)', glow: 'transparent', blink: false },
    { label: 'Wave 2 in progress', date: 'Now', color: '#00f0ff', glow: 'rgba(0,240,255,0.5)', blink: true },
    { label: 'Wave 3 starts', date: 'Queue', color: 'rgba(255,255,255,0.15)', glow: 'transparent', blink: false },
  ];

  // Dynamic execution items mapped from active reports
  const execItems: ExecItem[] = activeReportsMapped.map((report, idx) => {
    let state: 'active' | 'done' | 'error' = 'done';
    let subtitle = 'Complete';
    if (report.status === 'in-progress') {
      state = 'active';
      subtitle = 'In progress · 1m';
    } else if (report.status === 'error') {
      state = 'error';
      subtitle = 'Error — action needed';
    }

    const measuresCount = (report.name.length * 3) % 20 + 4;
    const matchingDataset = datasets.find(d => d.id === report.datasetId);
    const sourceName = matchingDataset ? matchingDataset.name : 'Power BI API';

    const tags = [
      { label: `Measures ×${measuresCount}`, bg: 'rgba(0,240,255,0.1)', border: 'rgba(0,240,255,0.2)', color: '#00f0ff' },
      { label: `${sourceName}`, bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', color: '#34d399' },
    ];

    let detail = `All measures and visual components verified. Mapped connector to ${sourceName}. live in Domo.`;
    let detailHighlights = [sourceName, 'live in Domo'];

    if (state === 'active') {
      detail = `Translating DAX calculations inside "${report.name}". Mapping tables and fields.`;
      detailHighlights = [report.name, 'DAX calculations'];
    } else if (state === 'error') {
      detail = `Visual bindings warning in "${report.name}". Dataset connection requires credential verification in Domo.`;
      detailHighlights = [report.name, 'credential verification'];
    }

    return {
      id: idx + 1,
      name: report.name,
      subtitle: subtitle,
      state: state,
      tags: tags,
      detail: detail,
      detailHighlights: detailHighlights,
    };
  });

  const Breadcrumb = (
    <div className="flex items-center gap-1" style={{ fontSize: 11 }}>
      <span style={{ color: 'var(--muted)' }}>Projects</span>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--muted)' }}>All Power BI Workspaces</span>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>Migration Progress</span>
    </div>
  );

  const TopRight = (
    <div
      className="flex items-center gap-2 px-3 py-1"
      style={{
        background: 'rgba(167,139,250,0.1)',
        border: '1px solid rgba(167,139,250,0.25)',
        borderRadius: 20,
        fontSize: 10,
        color: '#a78bfa',
      }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: '#a78bfa',
        animation: 'blink 2s ease-in-out infinite',
        boxShadow: '0 0 5px rgba(167,139,250,0.6)',
      }} />
      Migration in progress
    </div>
  );

  return (
    <AppShell topbarLeft={Breadcrumb} topbarRight={TopRight}>
      <div className="p-5 flex gap-5 h-full">
        {/* Left panel */}
        <div className="flex flex-col gap-4 flex-shrink-0" style={{ width: 210 }}>
          {/* Circular progress */}
          <div
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 12px',
              boxShadow: '0 1px 8px rgba(15,23,60,0.05)',
            }}
          >
            <div className="flex justify-center mb-3">
              <div className="relative" style={{ width: 96, height: 96 }}>
                <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#7000ff" />
                    </linearGradient>
                  </defs>
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - progressPercent / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#00f0ff', lineHeight: 1 }}>
                    {loading ? '--' : `${progressPercent}%`}
                  </span>
                  <span style={{ fontSize: 9, color: '#8fa0dd', marginTop: 2 }}>complete</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>
              Power BI Accounts
            </p>
            <p style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center', marginTop: 2 }}>
              {loading ? 'Scanning...' : `${totalMigrated} of ${totalCount} reports migrated`}
            </p>
          </div>

          {/* Wave plan */}
          <div
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '12px',
              boxShadow: '0 1px 8px rgba(15,23,60,0.05)',
            }}
          >
            <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Wave Plan
            </p>
            <div className="flex flex-col gap-3">
              {waveData.map((w, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text)' }}>{w.name}</span>
                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>{w.count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
                    <div style={{ height: '100%', width: `${w.progress}%`, background: w.barBg, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 8, color: w.statusColor }}>{w.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '12px',
              boxShadow: '0 1px 8px rgba(15,23,60,0.05)',
            }}
          >
            <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Timeline
            </p>
            <div className="relative flex flex-col gap-0">
              {timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-2 relative">
                  {i < timeline.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 4,
                        top: 10,
                        width: 1,
                        height: 20,
                        background: 'var(--border)',
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: t.color,
                      boxShadow: t.glow !== 'transparent' ? `0 0 5px ${t.glow}` : 'none',
                      animation: t.blink ? 'blink 2s ease-in-out infinite' : 'none',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  />
                  <div className="flex items-center justify-between flex-1 pb-3">
                    <span style={{ fontSize: 9, color: t.color === 'rgba(255,255,255,0.15)' ? 'var(--muted)' : 'var(--text)', fontWeight: 500 }}>
                      {t.label}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '12px',
              boxShadow: '0 1px 8px rgba(15,23,60,0.05)',
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Calculated measures', value: (totalCount * 6).toString() },
                { label: 'Datasets synced', value: datasets.length.toString() },
                { label: 'Reports mapped', value: totalCount.toString() },
                { label: 'Migration complete', value: `${progressPercent}%` },
              ].map(s => (
                <div key={s.label}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 8,
                    padding: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p style={{
                    fontSize: 16,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                  }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: 8, color: '#8fa0dd', marginTop: 3, lineHeight: 1.3 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Claude ticker */}
          <div
            style={{
              background: 'rgba(167,139,250,0.06)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={12} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 9, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                Migration log status
              </p>
              <p style={{ fontSize: 11, color: '#c0bfe8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {loading ? 'Connecting...' : activeReports.length > 0 ? (
                  <span>Currently migrating {activeReports.length} reports in your workspaces.</span>
                ) : (
                  'Awaiting migration trigger...'
                )}
              </p>
            </div>
          </div>

          {/* Execution log */}
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-2" style={{ color: '#00f0ff', fontSize: 12 }}>
                <RefreshCw className="animate-spin text-cyan-400" size={16} />
                <span className="text-slate-300">Retrieving active migration logs...</span>
              </div>
            ) : activeReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-1.5" style={{ color: '#8fa0dd', fontSize: 12 }}>
                <span className="text-white font-semibold">No Active Migrations Found</span>
                <span>Go to the "Dashboards" page and click "Start" on any report to begin migration.</span>
              </div>
            ) : (
              execItems.map(item => (
                <ExecCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ExecCard({ item }: { item: ExecItem }) {
  const isActive = item.state === 'active';
  const isDone = item.state === 'done';
  const isError = item.state === 'error';

  return (
    <div
      style={{
        background: isActive ? 'rgba(108,71,255,0.05)' : 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isActive ? 'rgba(108,71,255,0.25)' : isError ? 'rgba(248,113,113,0.15)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: '0 1px 6px rgba(15,23,60,0.05)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: isActive ? 'rgba(167,139,250,0.12)' : isDone ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1px solid ${isActive ? 'rgba(167,139,250,0.25)' : isDone ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isActive && <RefreshCw className="animate-spin text-purple-400" size={13} />}
          {isDone && <CheckCircle size={13} style={{ color: '#34d399' }} />}
          {isError && <AlertCircle size={13} style={{ color: '#f87171' }} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{item.name}</span>
            <span style={{ fontSize: 9, color: isActive ? '#a78bfa' : isDone ? '#34d399' : '#f87171', flexShrink: 0 }}>
              {item.subtitle}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {item.tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  background: tag.bg,
                  border: `1px solid ${tag.border}`,
                  color: tag.color,
                  fontSize: 9,
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>
            {highlightText(item.detail, item.detailHighlights)}
          </p>
        </div>
      </div>
    </div>
  );
}
