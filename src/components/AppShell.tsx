import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FolderOpen,
  LayoutDashboard,
  ArrowRightLeft,
  Plug,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import CanvasBackground from './CanvasBackground';
import ClarifyPanel from './ClarifyPanel';

interface NavItem {
  label: string;
  icon: ReactNode;
  to: string;
  badge?: string | number;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Projects', icon: <FolderOpen size={15} />, to: '/app' },
  { label: 'Dashboards', icon: <LayoutDashboard size={15} />, to: '/app/dashboards', badge: 48 },
  { label: 'Migration', icon: <ArrowRightLeft size={15} />, to: '/app/migration' },
  { label: 'Connections', icon: <Plug size={15} />, to: '/app/connections' },
  { label: 'Documents', icon: <FileText size={15} />, to: '/app/documents' },
];

const configItems: NavItem[] = [
  { label: 'Settings', icon: <Settings size={15} />, to: '/app/settings' },
];

interface AppShellProps {
  children: ReactNode;
  topbarLeft?: ReactNode;
  topbarRight?: ReactNode;
  dimSidebar?: boolean;
}

export default function AppShell({ children, topbarLeft, topbarRight, dimSidebar }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--bg)' }}>
      <CanvasBackground />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          flex flex-col flex-shrink-0 relative z-40
          fixed md:static inset-y-0 left-0
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          width: 200,
          background: '#04060d',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          opacity: dimSidebar ? 0.35 : 1,
          transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-4 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #7000ff)' }}
          >
            <ArrowRightLeft size={14} color="white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            migration<span style={{ color: '#00f0ff' }}>IQ</span>
          </span>
          <div
            className="w-[5px] h-[5px] rounded-full ml-auto"
            style={{
              background: '#7000ff',
              boxShadow: '0 0 6px #7000ff',
            }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-4">
            <p
              className="text-[9px] font-semibold tracking-widest px-2 mb-2"
              style={{ color: 'rgba(143,160,221,0.4)' }}
            >
              WORKSPACE
            </p>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: 'rgba(0,240,255,0.08)',
                        color: '#00f0ff',
                        border: '1px solid rgba(0,240,255,0.12)',
                      }
                    : {}
                }
              >
                <span style={{ opacity: 0.7 }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(0,240,255,0.1)',
                      border: '1px solid rgba(0,240,255,0.2)',
                      color: '#00f0ff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div>
            <p
              className="text-[9px] font-semibold tracking-widest px-2 mb-2"
              style={{ color: 'rgba(143,160,221,0.4)' }}
            >
              CONFIG
            </p>
            {configItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: 'rgba(0,240,255,0.08)',
                        color: '#00f0ff',
                        border: '1px solid rgba(0,240,255,0.12)',
                      }
                    : {}
                }
              >
                <span style={{ opacity: 0.7 }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User */}
        <div
          className="px-3 py-3 flex-shrink-0 flex items-center gap-2.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #7000ff)' }}
          >
            GA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">Gowtham AR</p>
            <p className="text-[9px] truncate" style={{ color: '#8fa0dd' }}>Solution Architect</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        {/* Topbar */}
        <header
          className="flex items-center gap-3 px-5 flex-shrink-0"
          style={{
            height: 52,
            background: 'rgba(7,9,19,0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/60 hover:text-white mr-1"
            onClick={() => setSidebarOpen(o => !o)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex-1">{topbarLeft}</div>
          <div className="flex items-center gap-2">{topbarRight}</div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>

      <ClarifyPanel />
    </div>
  );
}
