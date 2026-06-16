import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const tools = [
  {
    id: 'tableau',
    name: 'Tableau',
    desc: 'Connect via Tableau REST API and MCP bridge',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
        <line x1="32" y1="8" x2="32" y2="56" stroke="rgba(143,160,221,0.6)" strokeWidth="1"/>
        <line x1="8" y1="32" x2="56" y2="32" stroke="rgba(143,160,221,0.6)" strokeWidth="1"/>
        <circle cx="32" cy="18" r="3" fill="none" stroke="rgba(0,240,255,0.6)" strokeWidth="1"/>
        <circle cx="20" cy="32" r="3" fill="none" stroke="rgba(0,240,255,0.6)" strokeWidth="1"/>
        <circle cx="44" cy="26" r="3" fill="none" stroke="rgba(0,240,255,0.6)" strokeWidth="1"/>
        <circle cx="38" cy="44" r="3" fill="none" stroke="rgba(0,240,255,0.6)" strokeWidth="1"/>
        <polyline points="20,32 32,18 44,26 38,44" fill="none" stroke="rgba(143,160,221,0.4)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'powerbi',
    name: 'Power BI',
    desc: 'Authenticate via Microsoft OAuth and DAX engine',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
        <rect x="10" y="40" width="8" height="16" stroke="rgba(143,160,221,0.6)" strokeWidth="1"/>
        <rect x="22" y="30" width="8" height="26" stroke="rgba(143,160,221,0.6)" strokeWidth="1"/>
        <rect x="34" y="20" width="8" height="36" stroke="rgba(0,240,255,0.5)" strokeWidth="1"/>
        <rect x="46" y="10" width="8" height="46" stroke="rgba(0,240,255,0.5)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'looker',
    name: 'Looker',
    desc: 'Connect via Looker API with client credentials',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
        <polygon points="32,8 56,20 56,44 32,56 8,44 8,20" stroke="rgba(143,160,221,0.6)" strokeWidth="1" fill="none"/>
        <polygon points="32,18 48,26 48,42 32,50 16,42 16,26" stroke="rgba(0,240,255,0.3)" strokeWidth="1" fill="none" strokeDasharray="3 3"/>
        <circle cx="32" cy="32" r="4" stroke="rgba(0,240,255,0.6)" strokeWidth="1" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'quicksight',
    name: 'Quicksight',
    desc: 'Connect via AWS credentials and QuickSight API',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
        <line x1="8" y1="48" x2="56" y2="48" stroke="rgba(143,160,221,0.4)" strokeWidth="1"/>
        <path d="M8,40 Q20,20 36,28 Q48,36 56,16" stroke="rgba(143,160,221,0.7)" strokeWidth="1.5" fill="none"/>
        <path d="M8,44 Q24,30 40,36 Q50,40 56,28" stroke="rgba(0,240,255,0.5)" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
      </svg>
    ),
  },
];

const logLines = [
  { text: 'MCP server initialised — Tableau REST API v3.19', highlight: 'Tableau REST API v3.19' },
  { text: 'Authenticated as mcp-migration-token', highlight: 'mcp-migration-token' },
  { text: 'Connected to site AcmeCorp (Default)', highlight: 'AcmeCorp' },
  { text: 'Discovered 3 workbooks across 2 projects', highlight: '3 workbooks' },
  { text: 'Scanning 48 dashboards and 186 sheets...', highlight: '48 dashboards' },
  { text: 'Extracted 214 calculated fields', highlight: '214 calculated fields' },
  { text: 'Found 9 data sources (7 live, 2 extracts)', highlight: '9 data sources' },
  { text: 'Claude scoring complexity — 22 easy · 18 medium · 8 complex', highlight: '22 easy · 18 medium · 8 complex' },
  { text: 'Field mapping index built — ready for migration', highlight: 'ready for migration' },
];

const formFields: Record<string, { label: string; type: string; placeholder: string; optional?: boolean }[]> = {
  tableau: [
    { label: 'Server URL', type: 'text', placeholder: 'https://tableau.yourcompany.com' },
    { label: 'PAT token name', type: 'text', placeholder: 'mcp-migration-token' },
    { label: 'PAT token secret', type: 'password', placeholder: '••••••••••••••••' },
    { label: 'Site name', type: 'text', placeholder: 'AcmeCorp', optional: true },
  ],
  powerbi: [],
  looker: [
    { label: 'Instance URL', type: 'text', placeholder: 'https://yourco.looker.com' },
    { label: 'Client ID', type: 'text', placeholder: 'abc123def456' },
    { label: 'Client secret', type: 'password', placeholder: '••••••••••••••••' },
  ],
  quicksight: [
    { label: 'AWS Region', type: 'text', placeholder: 'us-east-1' },
    { label: 'Access key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE' },
    { label: 'Secret access key', type: 'password', placeholder: '••••••••••••••••' },
  ],
};

export default function ConnectModal({ onClose }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step !== 3) return;
    setVisibleLines(0);
    setProgress(0);

    const total = logLines.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setVisibleLines(current);
      setProgress(Math.round((current / total) * 100));

      if (current >= total) {
        clearInterval(interval);
        setTimeout(() => setStep(4), 800);
      }
    }, 520);

    return () => clearInterval(interval);
  }, [step]);

  const stepLabels = ['Source', 'Configure', 'Fetching', 'Ready'];

  const getHighlightedText = (text: string, highlight: string) => {
    const idx = text.indexOf(highlight);
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <span style={{ color: '#00f0ff' }}>{highlight}</span>
        {text.slice(idx + highlight.length)}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 580,
          background: 'rgba(10,12,26,0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="font-bold text-base text-white">Connect data source</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(143,160,221,0.6)', background: 'rgba(255,255,255,0.04)' }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(143,160,221,0.6)')}
          >
            <X size={14} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-0">
            {stepLabels.map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500"
                      style={{
                        background: done || active ? 'rgba(112,0,255,0.8)' : 'rgba(255,255,255,0.06)',
                        border: active ? '2px solid rgba(0,240,255,0.6)' : done ? '2px solid rgba(112,0,255,0.8)' : '2px solid transparent',
                        color: done || active ? 'white' : '#8fa0dd',
                        boxShadow: active ? '0 0 0 3px rgba(0,240,255,0.1)' : 'none',
                      }}
                    >
                      {done ? <Check size={12} /> : num}
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: active ? '#00f0ff' : '#8fa0dd' }}>
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div
                      className="flex-1 h-[1px] mx-1 mb-4 transition-all duration-500"
                      style={{ background: step > num + 1 ? '#7000ff' : 'rgba(255,255,255,0.1)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 flex-1">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <p className="text-sm font-semibold mb-1 text-white">Choose your source</p>
              <p className="text-xs mb-5" style={{ color: '#8fa0dd' }}>Select the BI tool you want to migrate from.</p>
              <div className="grid grid-cols-2 gap-3">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className="p-4 rounded-xl flex flex-col items-center gap-3 text-left transition-all duration-300 cursor-pointer"
                    style={{
                      background: selectedTool === tool.id ? 'rgba(22,22,42,1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedTool === tool.id ? '#7F77DD' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {tool.icon}
                    <div>
                      <p className="font-semibold text-sm text-white text-center">{tool.name}</p>
                      <p className="text-[10px] text-center mt-0.5" style={{ color: '#8fa0dd' }}>{tool.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && selectedTool && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">
                  Configure {tools.find(t => t.id === selectedTool)?.name} MCP
                </p>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(0,240,255,0.08)',
                    border: '1px solid rgba(0,240,255,0.2)',
                    color: '#00f0ff',
                  }}
                >
                  MCP
                </span>
              </div>
              <p className="text-xs mb-5" style={{ color: '#8fa0dd' }}>
                Enter your credentials to establish the MCP connection.
              </p>

              {selectedTool === 'powerbi' ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-medium" style={{ color: '#c0bfe8' }}>Tenant ID</label>
                    <input type="text" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="miq-input w-full px-3 py-2.5 text-sm" />
                  </div>
                  <button
                    className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm font-semibold w-full justify-center"
                  >
                    Sign in with Microsoft
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(formFields[selectedTool] || []).map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#c0bfe8' }}>
                        {f.label}
                        {f.optional && (
                          <span className="ml-1.5 text-[10px]" style={{ color: '#8fa0dd' }}>(optional)</span>
                        )}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        className="miq-input w-full px-3 py-2.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <p className="text-sm font-semibold mb-1 text-white">Scanning your workspace</p>
              <p className="text-xs mb-4" style={{ color: '#8fa0dd' }}>
                Claude is analysing your source instance via MCP…
              </p>

              {/* Progress bar */}
              <div
                className="w-full mb-4 rounded-full overflow-hidden"
                style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #00f0ff, #7000ff)',
                  }}
                />
              </div>

              {/* Log box */}
              <div
                className="rounded-xl p-4 font-mono text-xs flex flex-col gap-2 overflow-hidden"
                style={{
                  background: 'rgba(4,6,13,1)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  minHeight: 220,
                }}
              >
                {logLines.slice(0, visibleLines).map((line, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2"
                    style={{ animation: 'fadeInLine 0.3s ease-out both' }}
                  >
                    <Check size={11} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span style={{ color: '#8fa0dd' }}>
                      {getHighlightedText(line.text, line.highlight)}
                    </span>
                  </div>
                ))}
                {visibleLines < logLines.length && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-[11px] h-[11px] rounded-full flex-shrink-0"
                      style={{
                        background: 'rgba(0,240,255,0.3)',
                        animation: 'blink 1s ease-in-out infinite',
                      }}
                    />
                    <span style={{ color: 'rgba(143,160,221,0.4)' }}>Processing…</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ border: '2px solid rgba(112,0,255,0.5)', background: 'rgba(112,0,255,0.08)' }}
              >
                <Check size={24} style={{ color: '#00f0ff' }} />
              </div>
              <h3 className="font-bold text-lg mb-1 text-white">Acme Corp — Tableau connected</h3>
              <p className="text-xs mb-6" style={{ color: '#8fa0dd' }}>
                Your workspace has been fully scanned and indexed. Ready for migration.
              </p>

              <div className="grid grid-cols-3 gap-3 w-full mb-5">
                {[
                  { label: 'Dashboards', value: '48' },
                  { label: 'Calc fields', value: '214' },
                  { label: 'Data sources', value: '9' },
                ].map(s => (
                  <div
                    key={s.label}
                    className="rounded-xl p-3 flex flex-col items-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-xl font-extrabold text-white">{s.value}</span>
                    <span className="text-[10px] mt-0.5" style={{ color: '#8fa0dd' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
                {[
                  { label: '22 easy', color: '#34d399' },
                  { label: '18 medium', color: '#fbbf24' },
                  { label: '8 complex', color: '#f87171' },
                ].map(c => (
                  <span
                    key={c.label}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
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
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              <ChevronLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              onClick={() => selectedTool && setStep(2)}
              className="btn-primary flex items-center gap-1.5 px-5 py-2 text-sm font-semibold"
              style={{ opacity: selectedTool ? 1 : 0.4, cursor: selectedTool ? 'pointer' : 'not-allowed' }}
            >
              Next <ChevronRight size={14} />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="btn-primary flex items-center gap-1.5 px-5 py-2 text-sm font-semibold"
            >
              Connect <ArrowRight size={14} />
            </button>
          )}

          {step === 3 && <div />}

          {step === 4 && (
            <button
              onClick={() => {
                onClose();
                navigate('/app/project/acme');
              }}
              className="btn-primary flex items-center gap-1.5 px-5 py-2 text-sm font-semibold"
            >
              Open project <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
