import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ChevronRight, Search, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell';
import { usePowerBIWorkspaces } from '../hooks/usePowerBI';
import { apiClient } from '../config/api';
import { startMigration, subscribeToMigrationStatus } from '../services/migrationService';

type Complexity = 'easy' | 'medium' | 'complex';
type Status = 'in-progress' | 'migrated' | 'error' | 'pending';

interface Dashboard {
  id: string;
  name: string;
  workbook: string;
  source: string;
  complexity: Complexity;
  status: Status;
  fields: number;
  dataSource: string;
  datasetId?: string;
}

const MAX_FIELDS = 41;

const complexityConfig: Record<Complexity, { bg: string; border: string; color: string; label: string }> = {
  easy: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', color: '#34d399', label: 'Easy' },
  medium: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24', label: 'Medium' },
  complex: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#f87171', label: 'Complex' },
};

const statusConfig: Record<Status, { dot: string; glow: string; label: string; blink?: boolean }> = {
  'migrated': { dot: '#00f0ff', glow: 'rgba(0,240,255,0.5)', label: 'Migrated' },
  'in-progress': { dot: '#a78bfa', glow: 'rgba(167,139,250,0.5)', label: 'In progress', blink: true },
  'pending': { dot: 'rgba(255,255,255,0.2)', glow: 'transparent', label: 'Pending' },
  'error': { dot: '#f87171', glow: 'rgba(248,113,113,0.5)', label: 'Error' },
};

const fieldBarColor: Record<Status, string> = {
  'migrated': 'linear-gradient(90deg, #34d399, #00f0ff)',
  'in-progress': 'linear-gradient(90deg, #7000ff, #a78bfa)',
  'error': '#f87171',
  'pending': '#fbbf24',
};

type Tab = 'All' | 'Easy' | 'Medium' | 'Complex' | 'Migrated' | 'Errors';

function StatusPill({ status, progressMessage }: { status: Status; progressMessage?: string }) {
  const cfg = statusConfig[status];
  const labelText = (status === 'in-progress' && progressMessage) ? progressMessage : cfg.label;
  return (
    <div className="flex items-center gap-1.5">
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: cfg.dot,
          boxShadow: cfg.glow !== 'transparent' ? `0 0 5px ${cfg.glow}` : 'none',
          animation: cfg.blink ? 'blink 2s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 9, fontWeight: 700, color: cfg.dot === 'rgba(255,255,255,0.2)' ? '#8fa0dd' : cfg.dot }}>
        {labelText}
      </span>
    </div>
  );
}

function ComplexityBadge({ c }: { c: Complexity }) {
  const cfg = complexityConfig[c];
  return (
    <span
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        borderRadius: 100,
        fontSize: 9,
        fontWeight: 700,
        padding: '2px 7px',
      }}
    >
      {cfg.label}
    </span>
  );
}

function ActionButtons({ status, onAction, cardUrl }: { status: Status; onAction?: (action: string) => void; cardUrl?: string }) {
  const actionStyle = {
    background: 'rgba(0,240,255,0.08)',
    border: '1px solid rgba(0,240,255,0.2)',
    color: '#00f0ff',
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 5,
    padding: '3px 7px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
  } as const;

  const dangerStyle = {
    ...actionStyle,
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
    color: '#f87171',
  } as const;

  const ghostStyle = {
    ...actionStyle,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#8fa0dd',
  } as const;

  if (status === 'in-progress') return (
    <div className="flex gap-1 row-actions">
      <button style={actionStyle}>View</button>
      <button style={ghostStyle} onClick={() => onAction?.('pause')}>Pause</button>
    </div>
  );
  if (status === 'migrated') return (
    <div className="flex gap-1 row-actions">
      <button 
        style={actionStyle}
        onClick={() => {
          if (cardUrl) {
            window.open(cardUrl, '_blank');
          } else {
            console.warn('Card URL is not available.');
          }
        }}
      >
        View in Domo
      </button>
    </div>
  );
  if (status === 'error') return (
    <div className="flex gap-1 row-actions">
      <button style={dangerStyle} onClick={() => onAction?.('retry')}>Retry</button>
      <button style={ghostStyle}>Debug</button>
    </div>
  );
  return (
    <div className="flex gap-1 row-actions">
      <button style={actionStyle} onClick={() => onAction?.('start')}>Start</button>
    </div>
  );
}

export default function DashboardInventory() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');

  // 1. Fetch workspaces
  const { workspaces, loading: loadingWorkspaces, error: errorWorkspaces } = usePowerBIWorkspaces();

  const [reports, setReports] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Read persisted migration statuses from localStorage
  const [migrationStatuses, setMigrationStatuses] = useState<Record<string, Status>>(() => {
    try {
      const saved = localStorage.getItem('powerbi_migration_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Read persisted Domo card URLs from localStorage
  const [domoCardUrls, setDomoCardUrls] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('powerbi_migration_card_urls');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep track of real-time progress messages streamed from SSE
  const [progressMessages, setProgressMessages] = useState<Record<string, string>>({});

  // Keep track of actively submitting reports to prevent double clicking/submitting
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({});

  // Reset all statuses to pending and clear localStorage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('powerbi_migration_statuses');
      localStorage.removeItem('powerbi_migration_card_urls');
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
    }
    setMigrationStatuses({});
    setDomoCardUrls({});
  }, []);

  const updateMigrationStatus = (reportId: string, status: Status) => {
    setMigrationStatuses(prev => {
      const updated = { ...prev, [reportId]: status };
      localStorage.setItem('powerbi_migration_statuses', JSON.stringify(updated));
      return updated;
    });
  };

  const updateDomoCardUrl = (reportId: string, url: string) => {
    setDomoCardUrls(prev => {
      const updated = { ...prev, [reportId]: url };
      localStorage.setItem('powerbi_migration_card_urls', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAction = async (reportId: string, action: string) => {
    if (action === 'start' || action === 'retry') {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        console.error(`Dashboard matching ID ${reportId} not found in inventory.`);
        return;
      }

      if (submittingIds[reportId] || migrationStatuses[reportId] === 'in-progress') {
        console.warn(`[MIGRATION] Migration already in progress or starting for report: ${reportId}`);
        return;
      }

      setSubmittingIds(prev => ({ ...prev, [reportId]: true }));

      // Change state instantly to show 'In progress'
      updateMigrationStatus(reportId, 'in-progress');
      setProgressMessages(prev => ({ ...prev, [reportId]: 'Initializing...' }));

      // Open SSE connection to start listening to progress updates
      const sseSubscription = subscribeToMigrationStatus(
        reportId,
        (update) => {
          setProgressMessages(prev => ({ ...prev, [reportId]: update.status }));
        },
        (result) => {
          updateMigrationStatus(reportId, 'migrated');
          if (result.domoCardUrl) {
            updateDomoCardUrl(reportId, result.domoCardUrl);
          }
          setProgressMessages(prev => {
            const nextMsg = { ...prev };
            delete nextMsg[reportId];
            return nextMsg;
          });
          setSubmittingIds(prev => {
            const next = { ...prev };
            delete next[reportId];
            return next;
          });
        },
        (errorMsg) => {
          console.error(`[MIGRATION FAILURE] ${errorMsg}`);
          updateMigrationStatus(reportId, 'error');
          setProgressMessages(prev => {
            const nextMsg = { ...prev };
            delete nextMsg[reportId];
            return nextMsg;
          });
          setSubmittingIds(prev => {
            const next = { ...prev };
            delete next[reportId];
            return next;
          });
        }
      );

      // Trigger start API post request
      try {
        await startMigration({
          reportId: report.id,
          reportName: report.name || report.displayName || 'Power BI Report',
          datasetId: report.datasetId,
          workspaceId: report.workspaceId,
          isDashboard: false
        });
      } catch (err) {
        console.error(`Failed to invoke startMigration:`, err);
        updateMigrationStatus(reportId, 'error');
        sseSubscription.close();
        setSubmittingIds(prev => {
          const next = { ...prev };
          delete next[reportId];
          return next;
        });
      }

    } else if (action === 'pause') {
      updateMigrationStatus(reportId, 'pending');
    }
  };

  // 2. Fetch dashboards and datasets for all workspaces in parallel
  useEffect(() => {
    if (workspaces.length === 0) {
      setReports([]);
      return;
    }

    let active = true;

    async function loadAllReportsAndDatasets() {
      try {
        setLoadingDetails(true);
        setDetailsError(null);

        const targetWorkspaces = workspaceId
          ? workspaces.filter(ws => ws.id === workspaceId)
          : workspaces;

        if (targetWorkspaces.length === 0) {
          if (active) {
            setReports([]);
          }
          return;
        }

        const results = await Promise.all(
          targetWorkspaces.map(async (ws) => {
            let wsReports: any[] = [];
            let wsDatasets: any[] = [];

            try {
              const reportsRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/reports`);
              wsReports = reportsRes.value || [];
            } catch (err) {
              console.error(`Failed to load reports for workspace ${ws.id}:`, err);
            }

            try {
              const dsRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/datasets`);
              wsDatasets = dsRes.value || [];
            } catch (err) {
              console.error(`Failed to load datasets for workspace ${ws.id}:`, err);
            }

            // Decorate reports with workspace metadata context
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
          setReports(allReports);
        }
      } catch (err: any) {
        if (active) {
          setDetailsError(err.message || 'Failed to aggregate dashboards and datasets details.');
        }
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
  }, [workspaces, workspaceId]);

  // Combine loading and error states
  const loading = loadingWorkspaces || loadingDetails;
  const error = errorWorkspaces || detailsError;

  // 3. Map reports dynamically to the Dashboard interface
  const dashboards: Dashboard[] = reports.map((report) => {
    const currentStatus = migrationStatuses[report.id] || 'pending';

    return {
      id: report.id,
      name: report.name || report.displayName || 'Untitled Report',
      workbook: report.workspaceName || 'Power BI Workspace', // Workbook shows workspace name
      source: 'Power BI',
      complexity: 'medium',
      status: currentStatus,
      fields: 0,
      dataSource: 'Power BI Report',
      datasetId: report.datasetId,
    };
  });


  const filtered = dashboards.filter(d => {
    const matchTab =
      tab === 'All' ? true :
      tab === 'Easy' ? d.complexity === 'easy' :
      tab === 'Medium' ? d.complexity === 'medium' :
      tab === 'Complex' ? d.complexity === 'complex' :
      tab === 'Migrated' ? d.status === 'migrated' :
      tab === 'Errors' ? d.status === 'error' :
      true;
    const matchSearch = search === '' || d.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Calculate totals and counts dynamically
  const totalCount = dashboards.length;
  const migratedCount = dashboards.filter(d => d.status === 'migrated').length;
  const inProgressCount = dashboards.filter(d => d.status === 'in-progress').length;
  const pendingCount = dashboards.filter(d => d.status === 'pending').length;
  const errorsCount = dashboards.filter(d => d.status === 'error').length;

  const easyCount = dashboards.filter(d => d.complexity === 'easy').length;
  const mediumCount = dashboards.filter(d => d.complexity === 'medium').length;
  const complexCount = dashboards.filter(d => d.complexity === 'complex').length;

  const completionPercentage = totalCount > 0 ? Math.round((migratedCount / totalCount) * 100) : 0;

  const tabs: { label: Tab; count: number }[] = [
    { label: 'All', count: totalCount },
    { label: 'Easy', count: easyCount },
    { label: 'Medium', count: mediumCount },
    { label: 'Complex', count: complexCount },
    { label: 'Migrated', count: migratedCount },
    { label: 'Errors', count: errorsCount },
  ];

  const currentWorkspace = workspaceId ? workspaces.find(w => w.id === workspaceId) : null;
  const workspaceName = currentWorkspace ? currentWorkspace.name : 'All Power BI Workspaces';

  const Breadcrumb = (
    <div className="flex items-center gap-1" style={{ fontSize: 11 }}>
      <span style={{ color: 'var(--muted)' }}>Projects</span>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--muted)' }}>{workspaceName}</span>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>Reports</span>
    </div>
  );

  const TopRight = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#8fa0dd' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="miq-input pl-7 pr-3 py-1.5 text-xs"
          style={{ width: 180 }}
        />
      </div>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300"
        style={{
          background: 'rgba(0,240,255,0.08)',
          border: '1px solid rgba(0,240,255,0.2)',
          color: '#00f0ff',
          cursor: 'pointer',
        }}
      >
        <RefreshCw size={11} />
        Re-sync MCP
      </button>
    </div>
  );

  return (
    <AppShell topbarLeft={Breadcrumb} topbarRight={TopRight}>
      <div className="p-5 flex flex-col gap-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <StatCard icon="📊" label="TOTAL" value={totalCount.toString()} sub="Fetched via API" subColor="#8fa0dd" />
          <StatCard icon="✓" label="MIGRATED" value={migratedCount.toString()} valueColor="#00f0ff" sub={`${completionPercentage}% complete`} subColor="#34d399" />
          <StatCard icon="↻" label="IN PROGRESS" value={inProgressCount.toString()} valueColor="#a78bfa" sub="Migration in progress" subColor="#a78bfa" />
          <StatCard icon="○" label="PENDING" value={pendingCount.toString()} valueColor="white" sub="Not started" subColor="#8fa0dd" />
          <StatCard icon="!" label="ERRORS" value={errorsCount.toString()} valueColor="#f87171" sub="Needs review" subColor="#f87171" />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {tabs.map(t => (
            <button
              key={t.label}
              onClick={() => setTab(t.label)}
              style={tab === t.label ? {
                background: 'rgba(0,240,255,0.1)',
                border: '1px solid rgba(0,240,255,0.3)',
                color: '#00f0ff',
                fontWeight: 600,
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              } : {
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#8fa0dd',
                fontWeight: 400,
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {t.label} <span style={{ opacity: 0.6 }}>({t.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 8px rgba(15,23,60,0.05)',
          }}
        >
          {/* Header */}
          <div
            className="grid text-left"
            style={{
              gridTemplateColumns: '2fr 1fr 80px 90px 110px 90px 100px',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              padding: '8px 14px',
              gap: 8,
            }}
          >
            {['Report', 'Source', 'Complexity', 'Status', 'Calc fields', 'Data source', 'Action'].map(h => (
              <span key={h} style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Table Body States */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2.5" style={{ color: '#00f0ff', fontSize: 12 }}>
              <RefreshCw className="animate-spin text-cyan-400" size={16} />
              <span className="text-slate-300">
                {workspaceId ? 'Scanning project workspace...' : 'Scanning all Power BI workspaces...'}
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2" style={{ fontSize: 12 }}>
              <span className="text-red-400 font-semibold">⚠️ Load Failed</span>
              <span className="text-slate-400 max-w-md">{error}</span>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-1" style={{ color: '#8fa0dd', fontSize: 12 }}>
              <span className="text-white font-semibold">No Power BI Workspaces Found</span>
              <span>Ensure that your service principal credentials have active workspaces.</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-1" style={{ color: '#8fa0dd', fontSize: 12 }}>
              <span className="text-white font-semibold">No Reports Detected</span>
              <span>Your active workspaces do not contain any visual reports.</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-10" style={{ color: '#8fa0dd', fontSize: 12 }}>
              No reports match the current filter or search criteria.
            </div>
          ) : (
            filtered.map((d, i) => {
              const reportId = d.id;
              return (
                <TableRow 
                  key={i} 
                  d={d} 
                  reportId={reportId} 
                  onAction={handleAction} 
                  progressMessage={progressMessages[reportId]}
                  cardUrl={domoCardUrls[reportId]}
                />
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .inventory-row .row-actions { opacity: 0; transition: opacity 0.2s; }
        .inventory-row:hover .row-actions { opacity: 1; }
        .inventory-row:hover { background: rgba(0,240,255,0.03) !important; }
      `}</style>
    </AppShell>
  );
}

function TableRow({ 
  d, 
  reportId, 
  onAction,
  progressMessage,
  cardUrl
}: { 
  d: Dashboard; 
  reportId: string; 
  onAction: (id: string, action: string) => void;
  progressMessage?: string;
  cardUrl?: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="inventory-row grid items-center cursor-pointer relative"
      onClick={(e) => {
        // Prevent navigation if clicking on an action button inside
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
        navigate(`/app/report/${reportId}`, { state: { report: d } });
      }}
      style={{
        gridTemplateColumns: '2fr 1fr 80px 90px 110px 90px 100px',
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        gap: 8,
        transition: 'background 0.2s',
      }}
    >
      {/* Name */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{d.name}</p>
        <p style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{d.workbook}</p>
      </div>

      {/* Source */}
      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{d.source}</span>

      {/* Complexity */}
      <ComplexityBadge c={d.complexity} />

      {/* Status */}
      <StatusPill status={d.status} progressMessage={progressMessage} />

      {/* Calc fields */}
      <div className="flex items-center gap-1.5">
        <div
          className="flex-1 rounded-full overflow-hidden"
          style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            style={{
              width: `${(d.fields / MAX_FIELDS) * 100}%`,
              height: '100%',
              background: fieldBarColor[d.status],
              borderRadius: '100px',
            }}
          />
        </div>
        <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>{d.fields}</span>
      </div>

      {/* Data source */}
      <span style={{ fontSize: 9, color: 'var(--muted)' }}>{d.dataSource}</span>

      {/* Action */}
      <ActionButtons status={d.status} onAction={(action) => onAction(reportId, action)} cardUrl={cardUrl} />
    </div>
  );
}

function StatCard({ icon, label, value, valueColor, sub, subColor }: {
  icon: string; label: string; value: string; valueColor?: string; sub: string; subColor: string;
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
            <span style={{ fontSize: 10 }}>{icon}</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: valueColor || 'var(--text)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 9, color: subColor, marginTop: 3 }}>{sub}</p>
    </div>
  );
}
