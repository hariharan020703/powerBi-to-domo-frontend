import { useState } from 'react';
import {
  User, Palette, Bell, Cpu, FileOutput, Shield, HelpCircle,
  Check, Sparkles, Globe, AlertTriangle,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { useTheme } from '../context/ThemeContext';

type SettingsNav =
  | 'Profile'
  | 'Appearance'
  | 'Notifications'
  | 'MCP & API'
  | 'Exports'
  | 'Security'
  | 'Help & docs';

const navItems: { label: SettingsNav; icon: React.ReactNode }[] = [
  { label: 'Profile', icon: <User size={13} /> },
  { label: 'Appearance', icon: <Palette size={13} /> },
  { label: 'Notifications', icon: <Bell size={13} /> },
  { label: 'MCP & API', icon: <Cpu size={13} /> },
  { label: 'Exports', icon: <FileOutput size={13} /> },
  { label: 'Security', icon: <Shield size={13} /> },
  { label: 'Help & docs', icon: <HelpCircle size={13} /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? 'linear-gradient(135deg, #00f0ff, #7000ff)' : 'rgba(255,255,255,0.1)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.3s cubic-bezier(0.16,1,0.3,1)',
        padding: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: checked ? 19 : 3,
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function SettingRow({
  icon, iconBg, label, sub, control,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub?: string;
  control: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        background: 'rgba(13,17,39,0.5)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{label}</p>
        {sub && <p style={{ fontSize: 9, color: '#8fa0dd', marginTop: 1 }}>{sub}</p>}
      </div>
      {control}
    </div>
  );
}

function GroupHeader({ title }: { title: string }) {
  return (
    <p style={{
      fontSize: 9, fontWeight: 600,
      color: '#8fa0dd',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 8,
      paddingBottom: 8,
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {title}
    </p>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeNav, setActiveNav] = useState<SettingsNav>('Appearance');
  const [animBg, setAnimBg] = useState(true);
  const [notifMigration, setNotifMigration] = useState(true);
  const [notifError, setNotifError] = useState(true);
  const [notifToken, setNotifToken] = useState(true);
  const [autoRegen, setAutoRegen] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TopbarLeft = (
    <h1 style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Settings</h1>
  );

  const TopbarRight = (
    <button
      onClick={handleSave}
      className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
    >
      <Check size={12} />
      {saved ? 'Saved!' : 'Save changes'}
    </button>
  );

  const selectStyle = {
    background: 'rgba(14,14,28,1)',
    border: '1px solid rgba(34,34,54,1)',
    color: '#c0bfe8',
    borderRadius: 6,
    fontSize: 11,
    padding: '5px 8px',
    outline: 'none',
    cursor: 'pointer',
  } as const;

  return (
    <AppShell topbarLeft={TopbarLeft} topbarRight={TopbarRight}>
      <div className="p-5 flex gap-5 min-h-full">
        {/* Settings nav */}
        <aside style={{ width: 160, flexShrink: 0 }}>
          <div className="flex flex-col gap-0.5">
            {navItems.map(item => {
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-300 w-full text-left"
                  style={isActive ? {
                    background: 'rgba(0,240,255,0.08)',
                    border: '1px solid rgba(0,240,255,0.12)',
                    color: '#00f0ff',
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: '#8fa0dd',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ opacity: 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Body */}
        <div className="flex-1 flex flex-col gap-5 min-w-0 max-w-xl">
          {/* Profile card */}
          <div
            style={{
              background: 'rgba(13,17,39,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: 'white',
                flexShrink: 0,
              }}
            >
              GA
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Gowtham AR</p>
              <p style={{ fontSize: 10, color: '#8fa0dd' }}>gowtham@migrationiq.io</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(0,240,255,0.08)',
                  border: '1px solid rgba(0,240,255,0.2)',
                }}
              >
                <Sparkles size={10} style={{ color: '#00f0ff' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#00f0ff' }}>Pro plan</span>
              </div>
              <button
                className="btn-ghost text-xs px-3 py-1.5"
                style={{ fontSize: 10 }}
              >
                Edit profile
              </button>
            </div>
          </div>

          {/* Appearance group */}
          <div>
            <GroupHeader title="Appearance" />
            <div className="flex flex-col gap-2">
              {/* Theme picker */}
              <div
                style={{
                  background: 'rgba(13,17,39,0.5)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  padding: '10px 14px',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(112,0,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Palette size={13} style={{ color: '#c084fc' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>Theme mode</p>
                    <p style={{ fontSize: 9, color: '#8fa0dd' }}>Controls the overall color scheme</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(['light', 'dark', 'dual'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 7,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        background: theme === t ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${theme === t ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: theme === t ? '#00f0ff' : '#8fa0dd',
                        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow
                icon={<Sparkles size={13} style={{ color: '#00f0ff' }} />}
                iconBg="rgba(0,240,255,0.1)"
                label="Animated background"
                sub="Canvas particle animation on all screens"
                control={<Toggle checked={animBg} onChange={setAnimBg} />}
              />

              <SettingRow
                icon={<Globe size={13} style={{ color: '#60a5fa' }} />}
                iconBg="rgba(96,165,250,0.1)"
                label="Language"
                sub="Display language for the interface"
                control={
                  <select style={selectStyle}>
                    <option>English (US)</option>
                    <option>English (UK)</option>
                  </select>
                }
              />
            </div>
          </div>

          {/* Notifications group */}
          <div>
            <GroupHeader title="Notifications" />
            <div className="flex flex-col gap-2">
              <SettingRow
                icon={<Check size={13} style={{ color: '#34d399' }} />}
                iconBg="rgba(52,211,153,0.1)"
                label="Migration complete alerts"
                sub="Notify when a dashboard finishes migrating"
                control={<Toggle checked={notifMigration} onChange={setNotifMigration} />}
              />
              <SettingRow
                icon={<AlertTriangle size={13} style={{ color: '#fbbf24' }} />}
                iconBg="rgba(251,191,36,0.1)"
                label="Error & warning alerts"
                sub="Notify on migration errors or stalled jobs"
                control={<Toggle checked={notifError} onChange={setNotifError} />}
              />
              <SettingRow
                icon={<Cpu size={13} style={{ color: '#a78bfa' }} />}
                iconBg="rgba(167,139,250,0.1)"
                label="MCP token expiry reminders"
                sub="Warn 7 days before tokens expire"
                control={<Toggle checked={notifToken} onChange={setNotifToken} />}
              />
            </div>
          </div>

          {/* Exports group */}
          <div>
            <GroupHeader title="Exports & documents" />
            <div className="flex flex-col gap-2">
              <SettingRow
                icon={<FileOutput size={13} style={{ color: '#60a5fa' }} />}
                iconBg="rgba(96,165,250,0.1)"
                label="Default export format"
                sub="Format used for auto-generated documents"
                control={
                  <select style={selectStyle}>
                    <option>PDF + Excel</option>
                    <option>PDF only</option>
                    <option>Excel only</option>
                    <option>CSV</option>
                  </select>
                }
              />
              <SettingRow
                icon={<Sparkles size={13} style={{ color: '#00f0ff' }} />}
                iconBg="rgba(0,240,255,0.1)"
                label="Auto-regenerate documents"
                sub="Regenerate docs automatically after each migration wave"
                control={<Toggle checked={autoRegen} onChange={setAutoRegen} />}
              />
            </div>
          </div>

          {/* Danger zone */}
          <div>
            <GroupHeader title="Danger zone" />
            <div
              style={{
                background: 'rgba(248,113,113,0.04)',
                border: '1px solid rgba(248,113,113,0.15)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>Delete account</p>
                <p style={{ fontSize: 9, color: '#8fa0dd', marginTop: 2 }}>
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <button className="btn-danger text-xs px-3 py-2" style={{ fontSize: 10, flexShrink: 0 }}>
                Delete account
              </button>
            </div>
          </div>

          {/* Version line */}
          <div
            className="flex items-center justify-between"
            style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p style={{ fontSize: 9, color: 'rgba(143,160,221,0.3)' }}>© 2026 migrationIQ</p>
            <span style={{
              fontSize: 9, color: 'rgba(143,160,221,0.4)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 4,
              padding: '2px 6px',
            }}>
              v0.1-wireframe
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
