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

interface NavItem {
  label: string;
  icon: ReactNode;
  to: string;
  badge?: string | number;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Projects', icon: <FolderOpen size={15} />, to: '/app' },
  { label: 'Dashboards', icon: <LayoutDashboard size={15} />, to: '/app/dashboards' },
  { label: 'Migration', icon: <ArrowRightLeft size={15} />, to: '/app/migration' },
  { label: 'Connections', icon: <Plug size={15} />, to: '/app/connections' },
  // { label: 'Documents', icon: <FileText size={15} />, to: '/app/documents' },
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
          style={{ background: 'rgba(0,0,0,0.3)' }}
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
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          opacity: dimSidebar ? 0.35 : 1,
          transition: 'opacity 0.4s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: '2px 0 16px rgba(15,23,60,0.06)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-4 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6c47ff, #0066cc)' }}
          >
            <ArrowRightLeft size={14} color="white" />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>
            migration<span style={{ color: 'var(--purple)' }}>IQ</span>
          </span>
          <div
            className="w-[5px] h-[5px] rounded-full ml-auto"
            style={{
              background: 'var(--purple)',
              boxShadow: '0 0 6px var(--purple)',
            }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-4">
            <p
              className="text-[9px] font-semibold tracking-widest px-2 mb-2"
              style={{ color: 'var(--muted)', opacity: 0.6 }}
            >
              WORKSPACE
            </p>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-xs font-medium transition-all duration-200"
                style={({ isActive }) =>
                  isActive
                    ? {
                      background: 'rgba(108,71,255,0.10)',
                      color: 'var(--purple)',
                      border: '1px solid rgba(108,71,255,0.18)',
                    }
                    : {
                      color: 'var(--muted)',
                      border: '1px solid transparent',
                    }
                }
                onMouseOver={e => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.active) {
                    el.style.background = 'rgba(108,71,255,0.05)';
                    el.style.color = 'var(--text)';
                  }
                }}
                onMouseOut={e => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.active) {
                    el.style.background = '';
                    el.style.color = 'var(--muted)';
                  }
                }}
              >
                <span style={{ opacity: 0.8 }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(108,71,255,0.10)',
                      border: '1px solid rgba(108,71,255,0.20)',
                      color: 'var(--purple)',
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
              style={{ color: 'var(--muted)', opacity: 0.6 }}
            >
              CONFIG
            </p>
            {configItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-xs font-medium transition-all duration-200"
                style={({ isActive }) =>
                  isActive
                    ? {
                      background: 'rgba(108,71,255,0.10)',
                      color: 'var(--purple)',
                      border: '1px solid rgba(108,71,255,0.18)',
                    }
                    : {
                      color: 'var(--muted)',
                      border: '1px solid transparent',
                    }
                }
                onMouseOver={e => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.active) {
                    el.style.background = 'rgba(108,71,255,0.05)';
                    el.style.color = 'var(--text)';
                  }
                }}
                onMouseOut={e => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.active) {
                    el.style.background = '';
                    el.style.color = 'var(--muted)';
                  }
                }}
              >
                <span style={{ opacity: 0.8 }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User */}
        <div
          className="px-3 py-3 flex-shrink-0 flex items-center gap-2.5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6c47ff, #0066cc)' }}
          >
            GA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text)' }}>Gowtham AR</p>
            <p className="text-[9px] truncate" style={{ color: 'var(--muted)' }}>Solution Architect</p>
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
            background: 'var(--topbar-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 1px 8px rgba(15,23,60,0.06)',
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden mr-1 transition-colors"
            style={{ color: 'var(--muted)' }}
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
    </div>
  );
}
