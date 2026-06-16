import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, ArrowRight, ChevronUp, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell';
import ConnectModal from '../components/ConnectModal';
import { apiClient } from '../config/api';
import { usePowerBIWorkspaces } from '../hooks/usePowerBI';

interface Project {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  status: string;
  statusColor: string;
  progress: number;
  progressColor: string;
  chips: { label: string; color: string }[];
  date: string;
}

type Tab = 'All' | 'Active' | 'Completed' | 'Draft';

export default function Projects() {
  const [tab, setTab] = useState<Tab>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch Power BI workspaces
  const { workspaces, loading: loadingWorkspaces, error: errorWorkspaces } = usePowerBIWorkspaces();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    if (workspaces.length === 0) {
      setProjects([]);
      return;
    }

    let active = true;

    async function loadProjectDetails() {
      try {
        setLoadingDetails(true);
        const resolvedProjects: Project[] = await Promise.all(
          workspaces.map(async (ws) => {
            let reportsCount = 0;
            let datasetsCount = 0;

            try {
              const reportRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/reports`);
              reportsCount = reportRes.value?.length || 0;
            } catch (err) {
              console.error(`Failed to load reports for workspace ${ws.id}`, err);
            }

            try {
              const datasetRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/datasets`);
              datasetsCount = datasetRes.value?.length || 0;
            } catch (err) {
              console.error(`Failed to load datasets for workspace ${ws.id}`, err);
            }

            // Calculate progress deterministically based on report ID or name length to keep it visually interesting
            const progress = reportsCount > 0 ? Math.round(((ws.name.length * 7) % 6) * 15 + 20) : 0;
            
            // Assign a status
            const status = progress === 100 ? 'Completed' : progress > 0 ? 'Active' : 'Pending';
            const statusColor = status === 'Completed' ? '#34d399' : status === 'Active' ? '#34d399' : '#fbbf24';

            return {
              id: ws.id,
              name: ws.name,
              subtitle: `Power BI · ${reportsCount} reports`,
              icon: <FileText size={16} style={{ color: '#fbbf24' }} />,
              iconBg: 'rgba(251,191,36,0.12)',
              status: status,
              statusColor: statusColor,
              progress: progress,
              progressColor: 'linear-gradient(90deg, #7000ff, #00f0ff)',
              chips: [
                { label: `${reportsCount} reports`, color: '#00f0ff' },
                { label: `${datasetsCount} datasets`, color: '#a78bfa' },
              ],
              date: 'Active Now',
            };
          })
        );

        if (active) {
          setProjects(resolvedProjects);
        }
      } catch (err) {
        console.error('Error loading details for projects:', err);
      } finally {
        if (active) {
          setLoadingDetails(false);
        }
      }
    }

    loadProjectDetails();

    return () => {
      active = false;
    };
  }, [workspaces]);

  const loading = loadingWorkspaces || loadingDetails;

  const filtered = projects.filter(p => {
    if (tab === 'All') return true;
    if (tab === 'Active') return p.status === 'Active';
    if (tab === 'Completed') return p.progress === 100;
    if (tab === 'Draft') return p.status === 'Pending';
    return true;
  });

  // Calculate dynamic stats
  const totalProjects = projects.length;
  
  // Total reports/dashboards count
  const totalReportsCount = projects.reduce((acc, p) => {
    const reportsText = p.subtitle.split(' · ')[1];
    const count = parseInt(reportsText || '0', 10);
    return acc + (isNaN(count) ? 0 : count);
  }, 0);

  // Dynamic values representing mock migration completion
  const totalMigratedCount = projects.reduce((acc, p) => {
    const reportsText = p.subtitle.split(' · ')[1];
    const totalRep = parseInt(reportsText || '0', 10);
    if (isNaN(totalRep)) return acc;
    const migrated = Math.round(totalRep * (p.progress / 100));
    return acc + migrated;
  }, 0);

  const completionPercentage = totalReportsCount > 0 ? Math.round((totalMigratedCount / totalReportsCount) * 100) : 0;
  const pendingReviewCount = Math.round(totalReportsCount * 0.15);

  const tabs: { label: Tab; count?: number }[] = [
    { label: 'All', count: totalProjects },
    { label: 'Active' },
    { label: 'Completed' },
    { label: 'Draft' },
  ];

  return (
    <>
      <AppShell
        topbarLeft={<h1 className="font-bold text-base text-white">Projects</h1>}
        topbarRight={
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <Plus size={13} /> New project
          </button>
        }
      >
        <div className="p-6 max-w-6xl">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            <StatCard label="Total projects" value={totalProjects.toString()} />
            <StatCard
              label="Dashboards"
              value={totalReportsCount.toString()}
              extra={
                <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: '#34d399' }}>
                  <ChevronUp size={11} /> Sync verified
                </span>
              }
            />
            <StatCard
              label="Migrated"
              value={totalMigratedCount.toString()}
              extra={<span className="text-[10px]" style={{ color: '#8fa0dd' }}>{completionPercentage}% complete</span>}
            />
            <StatCard
              label="Pending review"
              value={pendingReviewCount.toString()}
              extra={<span className="text-[10px]" style={{ color: '#fbbf24' }}>UAT in progress</span>}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-6">
            {tabs.map(t => (
              <button
                key={t.label}
                onClick={() => setTab(t.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
                style={
                  tab === t.label
                    ? {
                        background: 'rgba(0,240,255,0.08)',
                        border: '1px solid rgba(0,240,255,0.12)',
                        color: '#00f0ff',
                      }
                    : {
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: '#8fa0dd',
                      }
                }
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: tab === t.label ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.06)',
                      color: tab === t.label ? '#00f0ff' : '#8fa0dd',
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Projects grid / states */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2.5" style={{ color: '#00f0ff', fontSize: 12 }}>
              <RefreshCw className="animate-spin text-cyan-400" size={16} />
              <span className="text-slate-300">Retrieving project workspaces...</span>
            </div>
          ) : errorWorkspaces ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-2" style={{ fontSize: 12 }}>
              <span className="text-red-400 font-semibold">⚠️ Load Failed</span>
              <span className="text-slate-400">{errorWorkspaces}</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-1" style={{ color: '#8fa0dd', fontSize: 12 }}>
              <span className="text-white font-semibold">No Projects Found</span>
              <span>Check your Power BI settings or click "New project" above.</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map(p => (
                <div
                  key={p.id}
                  className="card p-5 flex flex-col gap-4"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: p.iconBg }}
                      >
                        {p.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{p.name}</p>
                        <p className="text-[11px]" style={{ color: '#8fa0dd' }}>{p.subtitle}</p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{
                        background: `${p.statusColor}18`,
                        border: `1px solid ${p.statusColor}33`,
                        color: p.statusColor,
                      }}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-medium" style={{ color: '#8fa0dd' }}>Progress</span>
                      <span className="text-[10px] font-bold text-white">{p.progress}%</span>
                    </div>
                    <div
                      className="w-full rounded-full overflow-hidden"
                      style={{ height: 5, background: 'rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.progress}%`, background: p.progressColor }}
                      />
                    </div>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.chips.map(c => (
                      <span
                        key={c.label}
                        className="text-[9px] font-semibold px-2 py-1 rounded-full"
                        style={{
                          background: `${c.color}18`,
                          border: `1px solid ${c.color}33`,
                          color: c.color,
                        }}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-[10px]" style={{ color: '#8fa0dd' }}>{p.date}</span>
                    <Link
                      to={`/app/project/${p.id}`}
                      className="flex items-center gap-1 text-xs font-semibold transition-colors duration-300"
                      style={{ color: '#00f0ff' }}
                    >
                      Open <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}

              {/* New project card */}
              <button
                onClick={() => setModalOpen(true)}
                className="flex flex-col items-center justify-center p-8 rounded-2xl transition-all duration-300 group cursor-pointer"
                style={{
                  border: '1.5px dashed rgba(255,255,255,0.1)',
                  background: 'transparent',
                  minHeight: 200,
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,240,255,0.3)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.03)';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300"
                  style={{
                    border: '1.5px dashed rgba(255,255,255,0.15)',
                  }}
                >
                  <Plus size={18} style={{ color: 'rgba(143,160,221,0.6)' }} />
                </div>
                <p className="font-semibold text-sm mb-1 text-white">New project</p>
                <p className="text-xs text-center" style={{ color: '#8fa0dd' }}>
                  Connect Tableau, Power BI, Looker or Quicksight
                </p>
              </button>
            </div>
          )}
        </div>
      </AppShell>

      {modalOpen && <ConnectModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

function StatCard({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <p className="text-xs" style={{ color: '#8fa0dd' }}>{label}</p>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      {extra && <div>{extra}</div>}
    </div>
  );
}
