import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import AppShell from '../components/AppShell';

interface Props {
  pageName: string;
}

export default function Phase2Placeholder({ pageName }: Props) {
  return (
    <AppShell topbarLeft={<h1 className="font-bold text-base text-white">{pageName}</h1>}>
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-20 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: 'rgba(112,0,255,0.08)',
            border: '1px solid rgba(112,0,255,0.2)',
          }}
        >
          <Clock size={22} style={{ color: '#c084fc' }} />
        </div>

        <h2 className="font-extrabold text-xl mb-2 text-white">Coming in Phase 2</h2>
        <p className="text-sm mb-1" style={{ color: '#8fa0dd' }}>
          <span style={{ color: '#00f0ff' }}>{pageName}</span> is part of the next release.
        </p>
        <p className="text-sm mb-8" style={{ color: '#8fa0dd' }}>
          Stay tuned — we're building it now.
        </p>

        <Link
          to="/app"
          className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-sm font-medium"
        >
          <ArrowLeft size={14} /> Back to projects
        </Link>
      </div>
    </AppShell>
  );
}
