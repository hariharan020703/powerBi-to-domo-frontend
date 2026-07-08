import { useState, useEffect } from 'react';
import { ChevronRight, Plus, BarChart, RefreshCw, Zap, AlertTriangle, Unlink, Database, Link2, AlertCircle, Link2Off } from 'lucide-react';
import AppShell from '../components/AppShell';
import ConnectModal from '../components/ConnectModal';
import { apiClient } from '../config/api';
import { usePowerBIWorkspaces } from '../hooks/usePowerBI';

interface Connection {
  id: string;
  name: string;
  url: string;
  project: string;
  status: 'connected' | 'warning' | 'disconnected';
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  stats: { label: string; value: string }[];
  syncInfo: string;
  warning?: string;
  error?: string;
  cardBorder?: string;
  accentGradient: string;
}

const statusConfig = {
  connected: { dot: '#34d399', glow: 'rgba(52,211,153,0.5)', label: 'Connected', blink: true },
  warning: { dot: '#fbbf24', glow: 'rgba(251,191,36,0.4)', label: 'Expiring', blink: false },
  disconnected: { dot: '#f87171', glow: 'rgba(248,113,113,0.5)', label: 'Disconnected', blink: false },
};

function StatusBadge({ status }: { status: Connection['status'] }) {
  const cfg = statusConfig[status];
  return (
    <div className="flex items-center gap-1.5">
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot,
        boxShadow: `0 0 5px ${cfg.glow}`,
        animation: cfg.blink ? 'blink 2s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 9, fontWeight: 700,
        color: cfg.dot,
        background: status === 'connected' ? 'rgba(52,211,153,0.08)' : status === 'warning' ? 'rgba(251,191,36,0.08)' : 'rgba(248,113,113,0.08)',
        border: `1px solid ${status === 'connected' ? 'rgba(52,211,153,0.2)' : status === 'warning' ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)'}`,
        padding: '2px 6px',
        borderRadius: 100,
      }}>
        {cfg.label}
      </span>
    </div>
  );
}

function ConnectionCard({ conn }: { conn: Connection; }) {
  const [hovered, setHovered] = useState(false);

  const btnCyan = {
    background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)',
    color: '#00f0ff', fontSize: 10, fontWeight: 600, borderRadius: 6,
    padding: '5px 10px', cursor: 'pointer', transition: 'all 0.3s',
  } as const;
  const btnGhost = {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    color: '#8fa0dd', fontSize: 10, fontWeight: 600, borderRadius: 6,
    padding: '5px 10px', cursor: 'pointer', transition: 'all 0.3s',
  } as const;
  const btnDanger = {
    background: 'transparent', border: '1px solid rgba(248,113,113,0.2)',
    color: '#f87171', fontSize: 10, fontWeight: 600, borderRadius: 6,
    padding: '5px 10px', cursor: 'pointer', transition: 'all 0.3s',
  } as const;
  const btnAmber = {
    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
    color: '#fbbf24', fontSize: 10, fontWeight: 600, borderRadius: 6,
    padding: '5px 10px', cursor: 'pointer', transition: 'all 0.3s',
  } as const;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${conn.cardBorder ?? 'var(--border)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 8px rgba(15,23,60,0.06)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Accent line */}
      <div style={{
        height: 2,
        background: hovered ? conn.accentGradient : 'transparent',
        transition: 'background 0.3s',
      }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: conn.iconBg,
              border: `1px solid ${conn.iconBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {conn.icon}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{conn.name}</p>
              <p style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{conn.url}</p>
              <span style={{
                fontSize: 9, color: 'var(--muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 4, padding: '1px 5px',
                marginTop: 3, display: 'inline-block',
              }}>
                {conn.project}
              </span>
            </div>
          </div>
          <StatusBadge status={conn.status} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {conn.stats.map(s => (
            <div key={s.label} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 8px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{s.value}</p>
              <p style={{ fontSize: 8, color: 'var(--muted)', marginTop: 1 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Warning / Error */}
        {conn.warning && (
          <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg" style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}>
            <AlertTriangle size={11} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: '#fbbf24' }}>{conn.warning}</span>
          </div>
        )}
        {conn.error && (
          <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg" style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
          }}>
            <AlertTriangle size={11} style={{ color: '#f87171', flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: '#f87171' }}>{conn.error}</span>
          </div>
        )}

        {/* Sync info */}
        <p style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>{conn.syncInfo}</p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {conn.status === 'connected' && (
            <>
              <button style={btnCyan} className="flex items-center gap-1">
                <RefreshCw size={9} /> Re-sync
              </button>
              <button style={btnGhost}>Test</button>
            </>
          )}
          {conn.status === 'warning' && (
            <>
              <button style={btnAmber}>Renew token</button>
              <button style={btnGhost}>Test</button>
            </>
          )}
          {conn.status === 'disconnected' && (
            <>
              <button style={btnCyan} className="flex items-center gap-1">
                <Zap size={9} /> Reconnect
              </button>
              <button style={btnGhost}>View logs</button>
              <button style={btnDanger} className="ml-auto">Remove</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Connections() {
  const [modalOpen, setModalOpen] = useState(false);
  const [newHovered, setNewHovered] = useState(false);

  // Fetch all workspaces
  const { workspaces, loading: loadingWorkspaces, error: errorWorkspaces } = usePowerBIWorkspaces();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Fetch report and dataset counts for each workspace
  useEffect(() => {
    if (workspaces.length === 0) {
      setConnections([]);
      return;
    }

    let active = true;

    async function loadWorkspaceDetails() {
      try {
        setLoadingDetails(true);
        const resolvedConnections: Connection[] = await Promise.all(
          workspaces.map(async (ws) => {
            let reportsCount = 0;
            let datasetsCount = 0;
            let dashboardsCount = 0;

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

            try {
              const dashboardRes = await apiClient.get(`/api/powerbi/workspaces/${ws.id}/dashboards`);
              dashboardsCount = dashboardRes.value?.length || 0;
            } catch (err) {
              console.error(`Failed to load dashboards for workspace ${ws.id}`, err);
            }

            return {
              id: ws.id,
              name: `Power BI — ${ws.name}`,
              url: `Workspace ID: ${ws.id}`,
              project: 'Power BI Migration',
              status: 'connected',
              icon: <BarChart size={16} style={{ color: '#fbbf24' }} />,
              iconBg: 'rgba(245,158,11,0.12)',
              iconBorder: 'rgba(245,158,11,0.2)',
              stats: [
                { label: 'Reports', value: reportsCount.toString() },
                { label: 'Datasets', value: datasetsCount.toString() },
                { label: 'Dashboards', value: dashboardsCount.toString() },
              ],
              syncInfo: 'Last synced just now · Service Principal Auth',
              accentGradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            };
          })
        );

        if (active) {
          setConnections(resolvedConnections);
        }
      } catch (err) {
        console.error('Error fetching details for workspace connections:', err);
      } finally {
        if (active) {
          setLoadingDetails(false);
        }
      }
    }

    loadWorkspaceDetails();

    return () => {
      active = false;
    };
  }, [workspaces]);

  const loading = loadingWorkspaces || loadingDetails;

  // Calculate top statistics counts
  const totalConnections = connections.length;
  const connectedConnections = connections.filter(c => c.status === 'connected').length;
  const warningConnections = connections.filter(c => c.status === 'warning').length;
  const disconnectedConnections = connections.filter(c => c.status === 'disconnected').length;

  const Breadcrumb = (
    <div className="flex items-center gap-1" style={{ fontSize: 11 }}>
      <span style={{ color: 'white', fontWeight: 600 }}>Connections</span>
      <ChevronRight size={11} style={{ color: '#8fa0dd' }} />
      <span style={{ color: '#8fa0dd' }}>Power BI accounts</span>
    </div>
  );

  return (
    <>
      <AppShell
        topbarLeft={Breadcrumb}
      >
        <div className="p-5 flex flex-col gap-5">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <StatCard icon={<Database size={12} />} label="TOTAL CONNECTIONS" value={totalConnections.toString()} valueColor="rgba(190, 136, 255, 1)" sub="Workspaces loaded" />
            <StatCard icon={<Link2 size={12} />} label="CONNECTED" value={connectedConnections.toString()} valueColor="#34d399" sub={connectedConnections > 0 ? "All systems go" : "No active links"} subColor="#34d399" />
          </div>

          {/* Section label */}
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8fa0dd', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active connections
          </p>

          {/* Cards grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
              <div className="md:col-span-2 flex items-center justify-center py-20 gap-2.5" style={{ color: '#00f0ff', fontSize: 12 }}>
                <RefreshCw className="animate-spin text-cyan-400" size={16} />
                <span className="text-slate-300">Retrieving Power BI workspaces and visual counts...</span>
              </div>
            ) : errorWorkspaces ? (
              <div className="md:col-span-2 flex flex-col items-center justify-center py-16 px-4 text-center gap-2" style={{ fontSize: 12 }}>
                <span className="text-red-400 font-semibold">⚠️ Connection Fetch Failed</span>
                <span className="text-slate-400">{errorWorkspaces}</span>
              </div>
            ) : connections.length === 0 ? (
              <div className="md:col-span-2 flex flex-col items-center justify-center py-16 px-4 text-center gap-1" style={{ color: '#8fa0dd', fontSize: 12 }}>
                <span className="text-white font-semibold">No Power BI Connections Configured</span>
                <span>Workspace index returned empty. Make sure credentials are configured.</span>
              </div>
            ) : (
              connections.map(conn => (
                <ConnectionCard key={conn.id} conn={conn} />
              ))
            )}
          </div>
        </div>
      </AppShell>

      {modalOpen && <ConnectModal onClose={() => setModalOpen(false)} />}
    </>
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
