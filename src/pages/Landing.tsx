import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, CheckCircle, Menu, X } from 'lucide-react';
import CanvasBackground from '../components/CanvasBackground';

function useCountUp(target: number, suffix: string, inView: boolean) {
  const [display, setDisplay] = useState('0');
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1800;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(eased * target);
      setDisplay(val + suffix);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, target, suffix]);

  return display;
}

function StatItem({
  target, suffix, label, inView,
}: { target: number; suffix: string; label: string; inView: boolean }) {
  const display = useCountUp(target, suffix, inView);
  return (
    <div className="flex flex-col items-center px-8 py-6">
      <span
        className="text-4xl font-extrabold mb-1"
        style={{ color: '#00f0ff' }}
      >
        {display}
      </span>
      <span className="text-sm text-center" style={{ color: '#8fa0dd' }}>{label}</span>
    </div>
  );
}

const stats = [
  { target: 73, suffix: '%', label: 'Faster migration vs manual' },
  { target: 214, suffix: '', label: 'Avg calculated fields translated' },
  { target: 48, suffix: 'h', label: 'Avg time to first live dashboard' },
  { target: 100, suffix: '%', label: 'Beast Mode code coverage' },
];

const archCards = [
  {
    route: 'Tableau → Domo',
    title: 'Workbook semantic compiler',
    bullets: [
      'Parses TWB/TWBX files and maps every calculated field, LOD expression, and set to Domo Beast Mode',
      'Preserves filters, parameters, and dashboard layout metadata during conversion',
    ],
  },
  {
    route: 'Power BI → Domo',
    title: 'DAX & semantic engine',
    bullets: [
      'Translates DAX measures and calculated columns to equivalent Domo SQL and Beast Mode formulas',
      'Reconstructs semantic model relationships and hierarchies in Domo schemas',
    ],
  },
  {
    route: 'All sources → Domo',
    title: 'Universal schema orchestrator',
    bullets: [
      'Normalises cross-source data models into a unified Domo DataFlow graph automatically',
      'Scores each object by migration complexity — easy, medium, or complex — before execution',
    ],
  },
];

const steps = [
  { n: '01', title: 'Connect', desc: 'Link your source BI tool via MCP in under 2 minutes.' },
  { n: '02', title: 'Audit', desc: 'Claude scans every dashboard, field, and data source automatically.' },
  { n: '03', title: 'Migrate', desc: 'One-click migration with live progress and log output.' },
  { n: '04', title: 'Validate', desc: 'Side-by-side comparison ensures nothing is lost.' },
];

const tableRows = [
  { name: 'Executive Overview', source: 'Tableau', complexity: 'complex', status: 'In review' },
  { name: 'Sales Pipeline Q2', source: 'Tableau', complexity: 'easy', status: 'Migrated' },
  { name: 'ARR Dashboard', source: 'Power BI', complexity: 'medium', status: 'Queued' },
  { name: 'Retention Cohorts', source: 'Looker', complexity: 'complex', status: 'In review' },
];

const complexityColors: Record<string, string> = {
  easy: '#34d399',
  medium: '#fbbf24',
  complex: '#f87171',
};

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true); },
      { threshold: 0.3 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <CanvasBackground />

      {/* Fixed Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 md:px-10 transition-all duration-500"
        style={{
          height: scrolled ? 64 : 80,
          background: scrolled ? 'rgba(7,9,19,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #7000ff)' }}
          >
            <Zap size={14} color="white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            migration<span style={{ color: '#00f0ff' }}>IQ</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 mx-auto">
          {['Products', 'How it Works', 'Metrics', 'Enterprise'].map(l => (
            <a
              key={l}
              href="#"
              className="text-sm font-medium transition-colors duration-300"
              style={{ color: '#8fa0dd' }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = '#f1f3f9')}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = '#8fa0dd')}
            >
              {l}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link to="/app" className="text-sm font-medium" style={{ color: '#8fa0dd' }}>
            Sign in
          </Link>
          <Link
            to="/app"
            className="btn-primary text-sm font-semibold px-4 py-2"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="ml-auto md:hidden text-white"
          onClick={() => setMobileNav(o => !o)}
        >
          {mobileNav ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Nav overlay */}
      {mobileNav && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-20 px-6 gap-4 md:hidden"
          style={{ background: 'rgba(7,9,19,0.97)', backdropFilter: 'blur(16px)' }}
        >
          {['Products', 'How it Works', 'Metrics', 'Enterprise'].map(l => (
            <a key={l} href="#" className="text-lg font-medium text-white py-2"
              onClick={() => setMobileNav(false)}
            >{l}</a>
          ))}
          <Link to="/app" className="btn-primary text-center py-3 text-sm font-semibold mt-4"
            onClick={() => setMobileNav(false)}
          >
            Get started
          </Link>
        </div>
      )}

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6" style={{ paddingTop: 180 }}>
          {/* Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest mb-6"
            style={{
              background: 'rgba(0,240,255,0.08)',
              border: '1px solid rgba(0,240,255,0.2)',
              color: '#00f0ff',
            }}
          >
            <Sparkles size={11} />
            CLAUDE AI + MCP POWERED
          </div>

          {/* H1 */}
          <h1
            className="font-extrabold leading-tight mb-5 max-w-3xl gradient-text-hero"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-0.03em' }}
          >
            Migrate your BI dashboards.{' '}
            <br className="hidden md:block" />
            Zero logic lost.
          </h1>

          {/* Subtext */}
          <p
            className="max-w-xl mb-8 leading-relaxed"
            style={{ fontSize: 19, color: '#8fa0dd' }}
          >
            migrationIQ connects to your Tableau, Power BI, Looker, or Quicksight instance via MCP and
            intelligently rebuilds every dashboard, calculated field, and data relationship inside Domo —
            automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Link to="/app" className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-semibold">
              Start migrating <ArrowRight size={15} />
            </Link>
            <a href="#how" className="btn-ghost flex items-center gap-2 px-6 py-3 text-sm font-semibold">
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <p className="text-xs font-medium" style={{ color: 'rgba(143,160,221,0.7)' }}>
            Trusted by 40+ data teams · Average migration time reduced by 73%
          </p>
        </section>

        {/* Flow Visualiser */}
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <div
            className="relative flex items-stretch gap-0"
            style={{
              background: 'rgba(13,17,39,0.60)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: '32px 24px',
            }}
          >
            {/* Left node — Source */}
            <div
              className="flex-1 flex flex-col items-center justify-center p-5 rounded-xl"
              style={{ border: '1px solid rgba(112,0,255,0.3)', boxShadow: '0 0 24px rgba(112,0,255,0.08)' }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: '#8fa0dd' }}>Source</p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-[180px]">
                {['Tableau', 'Power BI', 'Looker', 'Quicksight'].map(t => (
                  <span
                    key={t}
                    className="text-center text-[10px] font-semibold px-2 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(112,0,255,0.1)',
                      border: '1px solid rgba(112,0,255,0.2)',
                      color: '#c084fc',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Connector left */}
            <div className="flex items-center flex-shrink-0 mx-3 relative" style={{ width: 50 }}>
              <div
                className="w-full"
                style={{
                  height: 2,
                  backgroundImage: 'repeating-linear-gradient(90deg, #00f0ff 0, #00f0ff 6px, transparent 6px, transparent 12px)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#00f0ff',
                    transform: 'translateY(-50%)',
                    animation: 'travelDot 2s linear infinite',
                    boxShadow: '0 0 6px #00f0ff',
                  }}
                />
              </div>
            </div>

            {/* Middle node — Claude */}
            <div
              className="flex-[1.4] flex flex-col items-center justify-center p-5 rounded-xl"
              style={{ border: '1px solid rgba(0,240,255,0.3)', boxShadow: '0 0 32px rgba(0,240,255,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} style={{ color: '#00f0ff' }} />
                <p className="text-sm font-bold text-white">Claude via MCP</p>
              </div>
              <div className="flex flex-col gap-1.5 text-center">
                {['Reads metadata', 'Translates logic', 'Scores complexity'].map(b => (
                  <div key={b} className="flex items-center gap-1.5">
                    <CheckCircle size={11} style={{ color: '#34d399', flexShrink: 0 }} />
                    <span className="text-xs" style={{ color: '#c0bfe8' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connector right */}
            <div className="flex items-center flex-shrink-0 mx-3 relative" style={{ width: 50 }}>
              <div
                className="w-full"
                style={{
                  height: 2,
                  backgroundImage: 'repeating-linear-gradient(90deg, #ff9900 0, #ff9900 6px, transparent 6px, transparent 12px)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#ff9900',
                    transform: 'translateY(-50%)',
                    animation: 'travelDot 2s linear infinite 1s',
                    boxShadow: '0 0 6px #ff9900',
                  }}
                />
              </div>
            </div>

            {/* Right node — Domo */}
            <div
              className="flex-1 flex flex-col items-center justify-center p-5 rounded-xl"
              style={{ border: '1px solid rgba(255,153,0,0.3)', boxShadow: '0 0 24px rgba(255,153,0,0.06)' }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: '#8fa0dd' }}>Destination</p>
              <p
                className="text-xl font-extrabold"
                style={{ color: '#ff9900' }}
              >
                Domo
              </p>
            </div>
          </div>
        </section>

        {/* Architecture cards */}
        <section className="px-6 pb-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {archCards.map((c, i) => (
              <div
                key={i}
                className="card p-6 flex flex-col relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: 'linear-gradient(90deg, #00f0ff, transparent)' }}
                />
                <span
                  className="text-[10px] font-semibold tracking-wider mb-3 self-start px-2 py-1 rounded-full"
                  style={{
                    background: 'rgba(0,240,255,0.08)',
                    border: '1px solid rgba(0,240,255,0.15)',
                    color: '#00f0ff',
                  }}
                >
                  {c.route}
                </span>
                <h3 className="font-bold text-base mb-3 text-white">{c.title}</h3>
                <ul className="flex flex-col gap-2">
                  {c.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 items-start">
                      <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[7px]"
                        style={{ background: '#00f0ff' }} />
                      <span className="text-xs leading-relaxed" style={{ color: '#8fa0dd' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-6 pb-24 max-w-5xl mx-auto">
          <h2 className="text-center font-extrabold text-3xl mb-14 text-white">How it works</h2>
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0">
            {/* Connecting line */}
            <div
              className="absolute top-5 left-5 right-5 h-[1px] hidden md:block"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(112,0,255,0.4), transparent)' }}
            />
            {steps.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center text-center px-4 relative z-10 group">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-3 transition-all duration-500"
                  style={{
                    border: '1px solid rgba(112,0,255,0.4)',
                    color: '#00f0ff',
                    background: 'rgba(13,17,39,1)',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 6px rgba(112,0,255,0.15)';
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                  }}
                >
                  {s.n}
                </div>
                <h3 className="font-bold text-sm mb-1 text-white">{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#8fa0dd' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats bar */}
        <section
          ref={statsRef}
          className="relative"
          style={{
            background: '#04060d',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center px-6 py-8"
                  style={{
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <StatItem
                    target={s.target}
                    suffix={s.suffix}
                    label={s.label}
                    inView={statsInView}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Complexity scoring */}
        <section className="px-6 py-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-extrabold text-3xl mb-4 text-white">
                AI-powered complexity scoring
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#8fa0dd' }}>
                Before a single dashboard is touched, Claude analyses every object in your workspace
                and produces a complexity score — so you know exactly what to expect.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  { color: '#34d399', label: 'Easy', desc: 'Standard charts, simple calculated fields, no LODs' },
                  { color: '#fbbf24', label: 'Medium', desc: 'Complex filters, sets, cross-datasource blends' },
                  { color: '#f87171', label: 'Complex', desc: 'Nested LODs, custom SQL, advanced parameters' },
                ].map(({ color, label, desc }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{
                        background: `${color}18`,
                        border: `1px solid ${color}33`,
                        color,
                      }}
                    >
                      {label}
                    </span>
                    <span className="text-sm" style={{ color: '#8fa0dd' }}>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Dashboard Name', 'Source', 'Complexity', 'Status'].map(h => (
                      <th key={h} className="text-left pb-3 font-semibold" style={{ color: '#8fa0dd' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-2.5 font-medium text-white">{row.name}</td>
                      <td className="py-2.5" style={{ color: '#8fa0dd' }}>{row.source}</td>
                      <td className="py-2.5">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: `${complexityColors[row.complexity]}18`,
                            border: `1px solid ${complexityColors[row.complexity]}33`,
                            color: complexityColors[row.complexity],
                          }}
                        >
                          {row.complexity}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: row.status === 'Migrated' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                            border: `1px solid ${row.status === 'Migrated' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                            color: row.status === 'Migrated' ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#04060d', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #00f0ff, #7000ff)' }}
                  >
                    <Zap size={12} color="white" />
                  </div>
                  <span className="font-bold text-sm text-white">
                    migration<span style={{ color: '#00f0ff' }}>IQ</span>
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#8fa0dd' }}>
                  AI-powered BI migration.<br />Zero logic lost.
                </p>
              </div>
              {[
                { heading: 'Product', links: ['Tableau Connector', 'Power BI Connector', 'Looker Connector', 'Quicksight Connector'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { heading: 'Resources', links: ['Documentation', 'API Reference', 'Changelog', 'Status'] },
              ].map(col => (
                <div key={col.heading}>
                  <p className="font-semibold text-xs tracking-wider mb-4" style={{ color: '#8fa0dd' }}>{col.heading}</p>
                  {col.links.map(l => (
                    <a
                      key={l}
                      href="#"
                      className="block text-xs mb-2.5 transition-colors duration-300"
                      style={{ color: 'rgba(143,160,221,0.6)' }}
                      onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = '#f1f3f9')}
                      onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(143,160,221,0.6)')}
                    >
                      {l}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div
              className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <p className="text-xs" style={{ color: 'rgba(143,160,221,0.4)' }}>
                © 2026 migrationIQ. All rights reserved.
              </p>
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(112,0,255,0.1)',
                  border: '1px solid rgba(112,0,255,0.2)',
                  color: '#c084fc',
                }}
              >
                Built with Claude AI
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
