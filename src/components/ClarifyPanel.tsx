import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

const messages = [
  {
    role: 'ai' as const,
    text: 'Hi! I\'m Clarify, your AI migration assistant. I can help you understand complexity scores, translate calculated fields, and answer questions about your migration.',
  },
  {
    role: 'user' as const,
    text: 'What does "complex" complexity mean for a dashboard?',
  },
  {
    role: 'ai' as const,
    text: 'A complex dashboard typically has 15+ calculated fields, nested LOD expressions, cross-datasource joins, or custom SQL. These take ~2–4 hours to migrate and are reviewed by a human before deployment.',
  },
];

const suggestions = [
  'Show me complex dashboards',
  'Explain LOD expressions',
];

export default function ClarifyPanel() {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');

  return (
    <>
      {/* Orb button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-[46px] h-[46px] rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
          animation: 'pulseRing 2.5s ease-out infinite',
          border: 'none',
        }}
        aria-label="Toggle Clarify panel"
      >
        <Sparkles size={20} color="white" />
        {!open && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
            style={{ background: '#f87171', border: '2px solid #070913' }}
          >
            3
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-[300px] flex flex-col"
          style={{
            background: 'rgba(13,17,39,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,240,255,0.2)',
            borderRadius: 14,
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
            maxHeight: '480px',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 p-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #7000ff)' }}
            >
              <Sparkles size={13} color="white" />
            </div>
            <span className="font-semibold text-sm text-white flex-1">Clarify</span>
            <span
              className="text-[10px] font-600 px-1.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.2)',
                color: '#34d399',
              }}
            >
              online
            </span>
            <button
              onClick={() => setOpen(false)}
              className="ml-1 text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className="text-xs leading-relaxed px-2.5 py-2"
                style={
                  msg.role === 'ai'
                    ? {
                        background: 'rgba(255,255,255,0.04)',
                        color: '#c0bfe8',
                        borderRadius: '8px 8px 8px 2px',
                      }
                    : {
                        background: 'rgba(0,240,255,0.08)',
                        color: '#00f0ff',
                        border: '1px solid rgba(0,240,255,0.15)',
                        borderRadius: '8px 8px 2px 8px',
                        alignSelf: 'flex-end',
                      }
                }
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Suggestion chips */}
          <div className="px-3 pb-2 flex flex-col gap-1.5 flex-shrink-0">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg transition-all duration-300"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,240,255,0.2)',
                  color: '#00f0ff',
                  cursor: 'pointer',
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,240,255,0.08)';
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="p-2 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Ask anything..."
                className="miq-input flex-1 text-xs px-3 py-2"
                style={{ fontSize: 12 }}
                onKeyDown={e => { if (e.key === 'Enter') setInputVal(''); }}
              />
              <button
                onClick={() => setInputVal('')}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Send size={12} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
