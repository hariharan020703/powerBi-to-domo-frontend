import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell';
import { usePowerBIWorkspaces } from '../hooks/usePowerBI';
import { apiClient } from '../config/api';

import { startMigration, subscribeToMigrationStatus, stopMigration } from '../services/migrationService';

type Complexity = 'easy' | 'medium' | 'complex';
type Status = 'in-progress' | 'migrated' | 'error' | 'pending';

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

  // Live SSE tracking state
  const [liveProgress, setLiveProgress] = useState<Record<string, number>>({});
  const [liveStep, setLiveStep] = useState<Record<string, string>>({});
  const [liveResult, setLiveResult] = useState<Record<string, any>>({});
  const [subscriptions, setSubscriptions] = useState<Record<string, any>>({});

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

  // Listen to live progress from SSE streams for all reports running in the background
  useEffect(() => {
    const inProgressReports = reports.filter(r => migrationStatuses[r.id] === 'in-progress');
    
    inProgressReports.forEach(report => {
      if (subscriptions[report.id]) return; // already subscribed
      
      console.log(`[MIGRATION STATUS] Subscribing to live updates for report ${report.id}`);
      
      const sub = subscribeToMigrationStatus(
        report.id,
        (update) => {
          if (update.progress !== undefined) {
            setLiveProgress(prev => ({ ...prev, [report.id]: update.progress! }));
          }
          if (update.status) {
            setLiveStep(prev => ({ ...prev, [report.id]: update.status }));
          }
        },
        (result) => {
          setLiveProgress(prev => ({ ...prev, [report.id]: 100 }));
          setLiveStep(prev => ({ ...prev, [report.id]: 'Migration completed successfully.' }));
          setLiveResult(prev => ({ ...prev, [report.id]: result }));
          
          const saved = localStorage.getItem('powerbi_migration_statuses');
          const statuses = saved ? JSON.parse(saved) : {};
          statuses[report.id] = 'migrated';
          localStorage.setItem('powerbi_migration_statuses', JSON.stringify(statuses));
          setMigrationStatuses(statuses);
        },
        (errorMsg) => {
          setLiveStep(prev => ({ ...prev, [report.id]: errorMsg }));
          
          const saved = localStorage.getItem('powerbi_migration_statuses');
          const statuses = saved ? JSON.parse(saved) : {};
          statuses[report.id] = 'error';
          localStorage.setItem('powerbi_migration_statuses', JSON.stringify(statuses));
          setMigrationStatuses(statuses);
        }
      );
      
      setSubscriptions(prev => ({ ...prev, [report.id]: sub }));
    });
  }, [reports, migrationStatuses]);

  // Clean up all active subscriptions on unmount
  useEffect(() => {
    return () => {
      Object.values(subscriptions).forEach((sub: any) => {
        if (sub && typeof sub.close === 'function') {
          sub.close();
        }
      });
    };
  }, [subscriptions]);

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

  const totalCount = activeReportsMapped.length;
  const migratedCount = activeReportsMapped.filter(r => r.status === 'migrated').length;
  const inProgressCount = activeReportsMapped.filter(r => r.status === 'in-progress').length;
  const errorsCount = activeReportsMapped.filter(r => r.status === 'error').length;

  const Breadcrumb = (
    <div className="flex items-center gap-1" style={{ fontSize: 11 }}>
      <span style={{ color: 'var(--muted)' }}>Projects</span>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--muted)' }}>All Power BI Workspaces</span>
      <ChevronRight size={11} style={{ color: 'var(--muted)' }} />
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>Migration Progress</span>
    </div>
  );

  return (
    <AppShell topbarLeft={Breadcrumb}>
      <div className="p-5 flex gap-5 h-full">

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard label="TOTAL REPORTS" value={totalCount.toString()} valueColor="rgba(190, 136, 255, 1)" sub="Assigned for migration" />
            <StatCard label="MIGRATED" value={migratedCount.toString()} valueColor="#34d399" sub="Complete in Domo" subColor="#34d399" />
            <StatCard label="IN PROGRESS" value={inProgressCount.toString()} valueColor="#a78bfa" sub="Active background streams" subColor="#a78bfa" />
            <StatCard label="ERRORS" value={errorsCount.toString()} valueColor="#f87171" sub="Need credential retry" subColor="#f87171" />
          </div>

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
            ) : activeReportsMapped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-1.5" style={{ color: '#8fa0dd', fontSize: 12 }}>
                <span className="text-white font-semibold">No Active Migrations Found</span>
                <span>Go to the "Dashboards" page and click "Start" on any report to begin migration.</span>
              </div>
            ) : (
              activeReportsMapped.map(report => {
                const progress = liveProgress[report.id] !== undefined
                  ? liveProgress[report.id]
                  : report.status === 'migrated'
                    ? 100
                    : 0;

                const currentStep = liveStep[report.id] || 
                  (report.status === 'migrated'
                    ? 'Migration completed successfully.'
                    : report.status === 'error'
                      ? 'Migration stopped with warnings.'
                      : 'Pending migration initialization...');

                const result = liveResult[report.id] || null;

                const handleStop = async () => {
                  try {
                    await stopMigration(report.id);
                    if (subscriptions[report.id]) {
                      subscriptions[report.id].close();
                      setSubscriptions(prev => {
                        const next = { ...prev };
                        delete next[report.id];
                        return next;
                      });
                    }
                    const saved = localStorage.getItem('powerbi_migration_statuses');
                    const statuses = saved ? JSON.parse(saved) : {};
                    statuses[report.id] = 'error';
                    localStorage.setItem('powerbi_migration_statuses', JSON.stringify(statuses));
                    setMigrationStatuses(statuses);
                    setLiveStep(prev => ({ ...prev, [report.id]: 'Migration cancelled by user.' }));
                  } catch (err) {
                    console.error('Failed to stop migration:', err);
                  }
                };

                const handleMigrate = async () => {
                  try {
                    const saved = localStorage.getItem('powerbi_migration_statuses');
                    const statuses = saved ? JSON.parse(saved) : {};
                    statuses[report.id] = 'in-progress';
                    localStorage.setItem('powerbi_migration_statuses', JSON.stringify(statuses));
                    setMigrationStatuses(statuses);

                    setLiveProgress(prev => ({ ...prev, [report.id]: 5 }));
                    setLiveStep(prev => ({ ...prev, [report.id]: 'Initializing migration pipeline...' }));

                    await startMigration({
                      reportId: report.id,
                      reportName: report.name || 'Power BI Report',
                      datasetId: report.datasetId,
                      workspaceId: report.workspaceId || '',
                      isDashboard: false
                    });
                  } catch (err) {
                    console.error('Failed to restart migration:', err);
                  }
                };

                return (
                  <ExecCard
                    key={report.id}
                    report={report}
                    progress={progress}
                    currentStep={currentStep}
                    result={result}
                    onStop={handleStop}
                    onMigrate={handleMigrate}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

interface ExecCardProps {
  report: any;
  progress: number;
  currentStep: string;
  result: any;
  onStop: () => void;
  onMigrate: () => void;
}

function ExecCard({ report, progress, currentStep, result, onStop, onMigrate }: ExecCardProps) {
  const isActive = report.status === 'in-progress';
  const isDone = report.status === 'migrated';
  const isError = report.status === 'error';

  return (
    <div
      style={{
        background: isActive ? 'rgba(108,71,255,0.03)' : 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isActive ? 'rgba(0, 240, 255, 0.25)' : isError ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '16px 20px',
        boxShadow: '0 4px 16px rgba(15,23,60,0.03)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Header section */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: isActive ? 'rgba(0, 240, 255, 0.1)' : isDone ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${isActive ? 'rgba(0, 240, 255, 0.25)' : isDone ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isActive && <RefreshCw className="animate-spin text-cyan-400" size={14} />}
              {isDone && <CheckCircle size={14} style={{ color: '#34d399' }} />}
              {isError && <AlertCircle size={14} style={{ color: '#ef4444' }} />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{report.name}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{report.workspaceName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{
                background: isActive
                  ? 'rgba(0, 240, 255, 0.1)'
                  : isDone
                    ? 'rgba(52, 211, 153, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                color: isActive ? '#00f0ff' : isDone ? '#34d399' : '#ef4444',
                border: `1px solid ${isActive ? 'rgba(0,240,255,0.2)' : isDone ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`
              }}
            >
              {isActive ? 'In Progress' : isDone ? 'Migrated' : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Info detail and progress bar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--muted)' }} className="max-w-[80%] truncate">
              {currentStep}
            </span>
            <span className="font-bold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: isError
                  ? 'linear-gradient(90deg, #ff4d4f, #ff7875)'
                  : isDone
                    ? 'linear-gradient(90deg, #52c41a, #95de64)'
                    : 'linear-gradient(90deg, #00f0ff, #7000ff)',
              }}
            />
          </div>
        </div>

        {/* Link / Stop buttons footer */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
          </div>
          {/* <div className="flex items-center gap-3">
            {isActive && (
              <button
                onClick={onStop}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border"
                style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                }}
              >
                Stop
              </button>
            )}

            {isError && (
              <button
                onClick={onMigrate}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer hover:shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
                  color: 'white',
                  border: 'none',
                }}
              >
                Migrate
              </button>
            )}

            {isDone && (result?.domoCardUrl || report.domoCardUrl) && (
              <a
                href={result?.domoCardUrl || report.domoCardUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                Open in Domo →
              </a>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueColor, sub, subColor }: {
  label: string; value: string; valueColor?: string; sub?: string; subColor?: string;
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
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: valueColor || 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 9, color: subColor || 'var(--muted)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}
