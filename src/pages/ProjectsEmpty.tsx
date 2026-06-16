import { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import AppShell from '../components/AppShell';
import ConnectModal from '../components/ConnectModal';

const tools = ['Tableau', 'Power BI', 'Looker', 'Quicksight'];

const steps = [
  { n: '01', label: 'Connect' },
  { n: '02', label: 'Audit' },
  { n: '03', label: 'Migrate' },
  { n: '04', label: 'Validate' },
];

export default function ProjectsEmpty() {
  const [modalOpen, setModalOpen] = useState(false);

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
        dimSidebar
      >
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
          {/* Ghost card stack illustration */}
          <div className="relative w-64 h-40 mb-8">
            {/* Background cards */}
            <div
              className="absolute rounded-2xl"
              style={{
                inset: 0,
                background: 'rgba(13,17,39,0.3)',
                border: '1px solid rgba(255,255,255,0.04)',
                transform: 'rotate(-4deg) translateY(10px)',
                opacity: 0.4,
              }}
            />
            <div
              className="absolute rounded-2xl"
              style={{
                inset: 0,
                background: 'rgba(13,17,39,0.5)',
                border: '1px solid rgba(255,255,255,0.05)',
                transform: 'rotate(-2deg) translateY(5px)',
                opacity: 0.6,
              }}
            />
            {/* Front card */}
            <div
              className="absolute rounded-2xl flex flex-col justify-center items-center gap-3"
              style={{
                inset: 0,
                background: 'rgba(13,17,39,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
              <div
                className="w-28 h-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
              <div
                className="w-20 h-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
            </div>

            {/* Floating plus orb */}
            <div
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
                boxShadow: '0 0 16px rgba(0,240,255,0.4)',
                animation: 'pulseGlow 2.5s ease-in-out infinite',
                zIndex: 10,
              }}
            >
              <Plus size={16} color="white" />
            </div>
          </div>

          {/* Headline */}
          <h2
            className="font-extrabold text-xl mb-3 text-center"
            style={{ color: 'var(--text)' }}
          >
            Your first migration starts{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #a5c0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              right here
            </span>
          </h2>

          <p
            className="text-sm text-center max-w-sm mb-8 leading-relaxed"
            style={{ color: '#8fa0dd' }}
          >
            migrationIQ connects to your BI tool via MCP and automatically rebuilds every dashboard,
            calculated field, and data relationship in Domo. No scripts, no lost logic.
          </p>

          {/* Steps */}
          <div className="flex items-center gap-0 mb-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      border: '1px solid rgba(112,0,255,0.3)',
                      color: '#00f0ff',
                      background: 'rgba(13,17,39,1)',
                    }}
                  >
                    {s.n}
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: '#8fa0dd' }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-10 h-[1px] mb-4 mx-1"
                    style={{ background: 'rgba(112,0,255,0.2)' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold"
            >
              Connect your first account <ArrowRight size={14} />
            </button>
            <button className="btn-ghost flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium">
              Watch demo
            </button>
          </div>

          {/* Tool pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {tools.map(t => (
              <span
                key={t}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(112,0,255,0.08)',
                  border: '1px solid rgba(112,0,255,0.15)',
                  color: '#c084fc',
                }}
              >
                {t}
              </span>
            ))}
            <ArrowRight size={12} style={{ color: '#8fa0dd' }} />
            <span
              className="text-[10px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,153,0,0.08)',
                border: '1px solid rgba(255,153,0,0.2)',
                color: '#ff9900',
              }}
            >
              Domo
            </span>
          </div>
        </div>
      </AppShell>

      {modalOpen && <ConnectModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
