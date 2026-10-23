'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  CloudRain,
  Database,
  LayoutDashboard,
  Leaf,
  MapPin,
  Menu,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Waves,
  X,
} from 'lucide-react';
import { clockTime, uiCopy, number, useBlueLoop } from './BlueLoopProvider';
import { simulatedTime } from '@/lib/simulation';
import { SPEEDS } from '@/lib/session';

const destinations = [
  { href: '/', title: 'Overview', icon: LayoutDashboard },
  { href: '/scenarios', title: 'Scenario studio', icon: CloudRain },
  { href: '/network', title: 'Water network', icon: Waves },
  { href: '/impact', title: 'Impact & results', icon: Leaf },
  { href: '/activity', title: 'Telemetry & events', icon: Activity },
  { href: '/data', title: 'Data sources', icon: Database },
];
export function LoopMark() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 4a11 11 0 1 1-7 12M3 10l1 6 6-1"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 9s-5 6-5 9a5 5 0 0 0 10 0c0-3-5-9-5-9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    router = useRouter(),
    [menu, setMenu] = useState(false);
  const {
    s,
    site,
    dataset,
    speed,
    setSession,
    playing,
    setPlaying,
    ended,
    ready,
    resetRun,
    command,
    guidedDemo,
    notice,
  } = useBlueLoop();
  const current = destinations.find((d) =>
    d.href === '/' ? pathname === '/' : pathname.startsWith(d.href)
  );
  return (
    <div className="workspace-shell">
      <aside className={`sidebar ${menu ? 'is-open' : ''}`}>
        <Link className="wordmark" href="/" onClick={() => setMenu(false)}>
          <LoopMark />
          <span>
            BlueLoop<span className="wordmark-dot">.</span>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-identity">
          <span className="workspace-symbol">
            <Waves size={18} />
          </span>
          <div>
            <strong>Township intelligence</strong>
            <span>Elmina workspace</span>
          </div>
        </div>
        <div className="nav-group-label">Workspace</div>
        <nav aria-label="Main navigation">
          {destinations.map((d, i) => (
            <div key={d.href}>
              {i === 4 && (
                <div className="nav-group-label evidence-label">Evidence</div>
              )}
              <Link
                href={d.href}
                onClick={() => setMenu(false)}
                className={
                  (
                    d.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(d.href)
                  )
                    ? 'nav-link active'
                    : 'nav-link'
                }
                aria-current={
                  (
                    d.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(d.href)
                  )
                    ? 'page'
                    : undefined
                }
              >
                <d.icon size={17} strokeWidth={1.6} />
                {d.title}
                {d.href === '/scenarios' && (
                  <span className="nav-chapters">5</span>
                )}
              </Link>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="site-mini">
            <MapPin size={16} />
            <div>
              <strong>Elmina Central Park</strong>
              <span>Shah Alam, Selangor</span>
            </div>
          </div>
          <div className="coordinates">
            {site.latitude.toFixed(3)}° N, {site.longitude.toFixed(3)}° E
          </div>
          <div className="prototype-label">
            <span />
            Hackathon prototype
            <ArrowUpRight size={13} />
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace-body">
        <header className="context-bar">
          <div>
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb-root">Elmina workspace</span>
            <ChevronRight size={13} />
            <span>{current?.title ?? 'Overview'}</span>
          </div>
          <div>
            <span className="source-state">
              <i />
              {dataset.kind === 'synthetic' ? 'Simulation' : 'Rainfall replay'}
            </span>
            <span className="context-date">
              {clockTime(simulatedTime(dataset, s.hour))} MYT
            </span>
          </div>
        </header>
        <main className="workspace-content">{children}</main>
        <div className="replay-dock" aria-label="Simulation playback">
          <div className="dock-run">
            <span className={`play-state ${playing ? 'running' : ''}`} />
            <div>
              <strong>{uiCopy(dataset.name)}</strong>
              <span>
                {playing ? 'Running' : ended ? 'Complete' : 'Paused'}{' '}
                {number(s.hour, 1)} / {dataset.points.length} h
              </span>
            </div>
          </div>
          <div className="dock-controls">
            <button
              className="play-button"
              aria-label={playing ? 'Pause playback' : 'Play playback'}
              disabled={!ready || ended}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause size={15} />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
            </button>
            <button
              className="icon-button"
              aria-label="Advance 15 minutes"
              disabled={ended}
              onClick={() => {
                setPlaying(false);
                command((current) => {
                  /* Keep simulation integration in the shared model. */ return advanceModel(
                    current,
                    site,
                    dataset
                  );
                });
              }}
            >
              <SkipForward size={16} />
            </button>
            <button
              className="icon-button"
              aria-label="Reset run"
              onClick={() => resetRun()}
            >
              <RotateCcw size={15} />
            </button>
            <label className="speed-control">
              <span>Speed</span>
              <select
                aria-label="Playback speed"
                value={speed}
                onChange={(e) =>
                  setSession((c) => ({ ...c, speed: Number(e.target.value) }))
                }
              >
                {SPEEDS.map((v) => (
                  <option key={v} value={v}>
                    {number(v)}×
                  </option>
                ))}
              </select>
            </label>
          </div>
          <progress
            max={dataset.points.length}
            value={s.hour}
            aria-label="Replay progress"
          />
          <button
            className="guided-button"
            onClick={() => {
              guidedDemo();
              router.push('/scenarios/pre-storm');
            }}
          >
            <Play size={13} />
            Guided demo
          </button>
        </div>
        <div className="sr-only" role="status">
          {uiCopy(notice)}
        </div>
      </div>
    </div>
  );
}
import {
  advance as advanceSimulation,
  RainDataset,
  Simulation,
  Site,
} from '@/lib/simulation';
function advanceModel(state: Simulation, site: Site, dataset: RainDataset) {
  return advanceSimulation(state, site, dataset, 0.25);
}
