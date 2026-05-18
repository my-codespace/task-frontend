import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API = 'https://task-api-xo97.onrender.com/tasks';

/* ─────────────────────────────────────────────
   SPEAK
───────────────────────────────────────────── */
const speak = (text) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const brit = voices.find(v => v.lang.includes('en-GB') || v.name.toLowerCase().includes('uk'));
  if (brit) u.voice = brit;
  u.pitch = 0.8; u.rate = 0.95;
  window.speechSynthesis.speak(u);
};

/* ─────────────────────────────────────────────
   WEATHER CODE → LABEL
───────────────────────────────────────────── */
const weatherLabel = (code) => {
  if (code === 0) return { label: 'CLEAR', icon: '☀' };
  if (code <= 3)  return { label: 'CLOUDY', icon: '⛅' };
  if (code <= 67) return { label: 'RAIN', icon: '🌧' };
  if (code <= 77) return { label: 'SNOW', icon: '❄' };
  if (code <= 99) return { label: 'STORM', icon: '⛈' };
  return { label: 'UNKNOWN', icon: '?' };
};

/* ─────────────────────────────────────────────
   LIVE CLOCK
───────────────────────────────────────────── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="text-center">
      <div className="text-4xl tracking-[0.2em] text-cyan-300 tabular-nums"
        style={{ textShadow: '0 0 20px rgba(34,211,238,0.9)' }}>
        {pad(time.getHours())}<span className="animate-pulse">:</span>{pad(time.getMinutes())}
        <span className="text-xl text-cyan-700">:{pad(time.getSeconds())}</span>
      </div>
      <div className="text-[10px] text-cyan-700 tracking-[0.3em] mt-1">
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ARC REACTOR
───────────────────────────────────────────── */
const ArcReactor = ({ hulkMode, pomodoroActive }) => {
  // When pomodoro is running, reactor pulses faster to signal focus mode
  const pulseDuration = pomodoroActive ? 1.2 : 2.5;
  const c = hulkMode ? '#22c55e' : '#22d3ee';
  const cFaint = hulkMode ? 'rgba(34,197,94,0.3)' : 'rgba(34,211,238,0.3)';
  const cGlow  = hulkMode ? 'rgba(34,197,94,' : 'rgba(34,211,238,';
  return (
    <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
      {pomodoroActive && (
        <motion.div
          animate={{ opacity: [0, 0.15, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-44 h-44 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)' }}
        />
      )}
      <svg className="absolute w-full h-full" viewBox="0 0 176 176">
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180, r1 = 84, r2 = i % 3 === 0 ? 78 : 80;
          return <line key={i} x1={88 + r1 * Math.cos(a)} y1={88 + r1 * Math.sin(a)}
            x2={88 + r2 * Math.cos(a)} y2={88 + r2 * Math.sin(a)}
            stroke={cFaint} strokeWidth={i % 3 === 0 ? 1.5 : 0.8} />;
        })}
      </svg>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: pomodoroActive ? 12 : 25, repeat: Infinity, ease: 'linear' }}
        className="absolute w-40 h-40 rounded-full"
        style={{ border: `1px dashed ${cFaint}` }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: pomodoroActive ? 6 : 12, repeat: Infinity, ease: 'linear' }}
        className="absolute w-32 h-32 rounded-full border-2"
        style={{ borderColor: hulkMode ? '#166534' : '#155e75', borderTopColor: c, boxShadow: `0 0 10px ${cGlow}0.2) inset` }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: pomodoroActive ? 2.5 : 5, repeat: Infinity, ease: 'linear' }}
        className="absolute w-24 h-24 rounded-full"
        style={{ border: '2px solid transparent', borderTopColor: c, borderLeftColor: cFaint }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: pomodoroActive ? 2 : 4, repeat: Infinity, ease: 'linear' }}
        className="absolute w-32 h-32 rounded-full"
        style={{ background: `conic-gradient(from 0deg, ${cGlow}0.5) 0%, ${cGlow}0.1) 25%, transparent 45%)` }} />
      <motion.div
        animate={{ borderRadius: ['30% 70% 70% 30%/30% 30% 70% 70%', '70% 30% 30% 70%/70% 70% 30% 30%', '30% 70% 70% 30%/30% 30% 70% 70%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-16 h-16 border"
        style={{ borderColor: c, boxShadow: `0 0 10px ${cGlow}0.3)` }} />
      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-9 h-9 rounded-full"
        style={{ background: hulkMode ? '#86efac' : '#67e8f9', boxShadow: `0 0 12px #fff, 0 0 30px ${c}, 0 0 60px ${cGlow}0.7)` }}>
        <div className="absolute inset-1 rounded-full bg-cyan-950" />
        <div className="absolute inset-2 rounded-full opacity-80" style={{ background: hulkMode ? '#86efac' : '#67e8f9' }} />
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   POMODORO TIMER
   States: idle | focus | break
   Circular SVG progress ring + JARVIS controls
───────────────────────────────────────────── */
const FOCUS_SECS  = 25 * 60;
const BREAK_SECS  = 5  * 60;

const PomodoroTimer = ({ onStateChange }) => {
  const [mode, setMode]           = useState('idle');   // idle | focus | break
  const [remaining, setRemaining] = useState(FOCUS_SECS);
  const [sessions, setSessions]   = useState(0);
  const intervalRef  = useRef(null);
  // FIX 1: store mode in a ref so the interval callback always reads the
  // latest value without needing to be recreated every time mode changes.
  const modeRef      = useRef('idle');
  // FIX 2: store onStateChange in a ref so it never triggers the notify
  // effect just because the parent re-rendered and passed a new function ref.
  const onChangeRef  = useRef(onStateChange);
  useEffect(() => { onChangeRef.current = onStateChange; }, [onStateChange]);

  const total    = mode === 'break' ? BREAK_SECS : FOCUS_SECS;
  const progress = 1 - remaining / total;

  // Notify parent whenever mode changes (ArcReactor speed-up)
  useEffect(() => {
    onChangeRef.current?.(mode === 'focus');
  }, [mode]);

  // FIX 3: interval is created ONCE on mount and never recreated.
  // It reads modeRef.current (always fresh) instead of the stale closure.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (modeRef.current === 'idle') return;   // paused — do nothing
      setRemaining(r => {
        if (r <= 1) {
          // Transition on the next tick so we don't call setState inside setState
          setTimeout(() => {
            if (modeRef.current === 'focus') {
              setSessions(s => s + 1);
              speak('Focus protocol complete. Rest period initiated, sir.');
              modeRef.current = 'break';
              setMode('break');
              setRemaining(BREAK_SECS);
            } else {
              speak('Rest period complete. Ready for your next focus session, sir.');
              modeRef.current = 'idle';
              setMode('idle');
              setRemaining(FOCUS_SECS);
            }
          }, 0);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);   // ← empty deps: single interval for entire lifetime of component

  const startFocus = () => {
    speak('Focus protocol engaged. All distractions suppressed, sir.');
    modeRef.current = 'focus';
    setMode('focus');
    setRemaining(FOCUS_SECS);
  };

  const abort = () => {
    speak('Focus protocol aborted.');
    modeRef.current = 'idle';
    setMode('idle');
    setRemaining(FOCUS_SECS);
  };

  const skipBreak = () => {
    speak('Break skipped. Ready for next session.');
    modeRef.current = 'idle';
    setMode('idle');
    setRemaining(FOCUS_SECS);
  };

  const pad = n => String(n).padStart(2, '0');
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  // SVG ring
  const R = 44, CIRC = 2 * Math.PI * R;
  const dash = CIRC * (1 - progress);
  const ringColor = mode === 'break' ? '#22c55e' : mode === 'focus' ? '#22d3ee' : '#164e63';
  const ringGlow  = mode === 'break' ? 'rgba(34,197,94,0.7)' : mode === 'focus' ? 'rgba(34,211,238,0.7)' : 'transparent';

  return (
    <div className="border border-cyan-900 p-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] tracking-widest text-cyan-700">
        <span>FOCUS PROTOCOL</span>
        <div className="flex items-center gap-2">
          <span className="text-cyan-900">SESSIONS:</span>
          <span className="text-cyan-400 font-bold">{sessions}</span>
        </div>
      </div>

      {/* Circular progress + time display */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="5" />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r={R} fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dash}
              style={{ filter: `drop-shadow(0 0 4px ${ringGlow})`, transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          {/* Time in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold tabular-nums tracking-wider"
              style={{ color: ringColor, textShadow: `0 0 8px ${ringGlow}` }}>
              {pad(mins)}:{pad(secs)}
            </div>
            <div className="text-[8px] tracking-widest text-cyan-800 mt-0.5">
              {mode === 'idle' ? 'STANDBY' : mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 flex-1">
          {mode === 'idle' && (
            <button onClick={startFocus}
              className="border border-cyan-600 text-cyan-400 text-[10px] tracking-[0.2em] font-bold py-2 px-3 hover:bg-cyan-900/40 hover:border-cyan-300 transition-all w-full"
              style={{ boxShadow: '0 0 8px rgba(34,211,238,0.1)' }}>
              ▶ ENGAGE
            </button>
          )}
          {mode === 'focus' && (
            <button onClick={abort}
              className="border border-red-800 text-red-600 text-[10px] tracking-[0.2em] font-bold py-2 px-3 hover:bg-red-950/40 hover:border-red-500 hover:text-red-400 transition-all w-full">
              ■ ABORT
            </button>
          )}
          {mode === 'break' && (
            <>
              <div className="text-[9px] text-green-600 tracking-widest text-center animate-pulse">REST INITIATED</div>
              <button onClick={skipBreak}
                className="border border-cyan-900 text-cyan-700 text-[10px] tracking-widest py-1.5 px-3 hover:border-cyan-600 hover:text-cyan-400 transition-all w-full">
                SKIP REST
              </button>
            </>
          )}
          {/* Mode indicator dots */}
          <div className="flex gap-1 justify-center mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{ background: i < sessions % 4 ? '#22d3ee' : 'rgba(34,211,238,0.15)', boxShadow: i < sessions % 4 ? '0 0 4px #22d3ee' : 'none' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   EFFICIENCY REPORT — 7-day bar chart
   Reads from localStorage: jarvisStats
   { "2025-05-17": 3, "2025-05-18": 5, ... }
───────────────────────────────────────────── */
const loadStats = () => {
  try { return JSON.parse(localStorage.getItem('jarvisStats') || '{}'); }
  catch { return {}; }
};

const saveStatDay = (dateKey, count) => {
  const s = loadStats();
  s[dateKey] = count;
  localStorage.setItem('jarvisStats', JSON.stringify(s));
};

const EfficiencyReport = ({ completedToday }) => {
  // Build last 7 days array
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3);
    return { key, label };
  });

  const stats = loadStats();
  // Inject today's live count
  const todayKey = new Date().toISOString().slice(0, 10);
  stats[todayKey] = completedToday;

  const maxVal = Math.max(1, ...days.map(d => stats[d.key] || 0));
  const totalWeek = days.reduce((s, d) => s + (stats[d.key] || 0), 0);

  return (
    <div className="border border-cyan-900 p-3 space-y-2">
      <div className="flex items-center justify-between text-[10px] tracking-widest">
        <span className="text-cyan-700">EFFICIENCY REPORT</span>
        <div className="flex items-center gap-2">
          <span className="text-cyan-900">7-DAY:</span>
          <span className="text-cyan-400 font-bold">{totalWeek}</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-16">
        {days.map(({ key, label }) => {
          const val = stats[key] || 0;
          const heightPct = (val / maxVal) * 100;
          const isToday = key === todayKey;
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              {/* Value label on hover — show if > 0 */}
              {val > 0 && (
                <div className="text-[8px] text-cyan-600 tabular-nums">{val}</div>
              )}
              <div className="w-full flex-1 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, val > 0 ? 8 : 0)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="w-full rounded-sm"
                  style={{
                    background: isToday ? '#22d3ee' : 'rgba(34,211,238,0.35)',
                    boxShadow: isToday ? '0 0 6px rgba(34,211,238,0.8)' : 'none',
                    minHeight: val > 0 ? '4px' : '1px',
                  }}
                />
              </div>
              <div className={`text-[8px] tracking-wider ${isToday ? 'text-cyan-400' : 'text-cyan-800'}`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Efficiency rating */}
      <div className="flex justify-between text-[9px] tracking-widest border-t border-cyan-950 pt-2">
        <span className="text-cyan-900">TODAY</span>
        <span className="text-cyan-400 font-bold">{completedToday} COMPLETED</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   RADAR
───────────────────────────────────────────── */
const Radar = ({ taskCount }) => {
  const blips = [
    { top: '28%', left: '62%', color: '#ef4444' },
    { top: '65%', left: '22%', color: '#22d3ee' },
    { top: '45%', left: '75%', color: '#facc15' },
    { top: '72%', left: '58%', color: '#22d3ee' },
  ];
  return (
    <div className="relative w-36 h-36 mx-auto">
      {[36, 27, 18, 9].map((r, i) => (
        <div key={i} className="absolute rounded-full border border-cyan-900 opacity-60"
          style={{ width: r * 4, height: r * 4, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-cyan-900 opacity-40" /></div>
      <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-px bg-cyan-900 opacity-40" /></div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(34,211,238,0.5) 0%, rgba(34,211,238,0.15) 20%, transparent 45%)' }} />
      {blips.slice(0, Math.min(taskCount, blips.length)).map((b, i) => (
        <motion.div key={i} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ top: b.top, left: b.left, background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SEGMENTED BAR
───────────────────────────────────────────── */
const SegBar = ({ label, value, accent = '#22d3ee' }) => {
  const segments = 24, filled = Math.round((value / 100) * segments);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] tracking-widest text-cyan-700">
        <span>{label}</span><span style={{ color: accent }}>{value}%</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-sm"
            style={{ background: i < filled ? accent : 'rgba(34,211,238,0.1)', boxShadow: i < filled ? `0 0 4px ${accent}` : 'none' }} />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   HEX GRID BG
───────────────────────────────────────────── */
const HexGrid = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
        <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#22d3ee" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

/* ─────────────────────────────────────────────
   CIRCUIT LINES
───────────────────────────────────────────── */
const CircuitLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="30%" x2="8%" y2="30%" stroke="#22d3ee" strokeWidth="0.5" />
    <line x1="8%" y1="30%" x2="8%" y2="45%" stroke="#22d3ee" strokeWidth="0.5" />
    <circle cx="8%" cy="45%" r="2" fill="#22d3ee" />
    <line x1="92%" y1="55%" x2="100%" y2="55%" stroke="#22d3ee" strokeWidth="0.5" />
    <line x1="92%" y1="40%" x2="92%" y2="55%" stroke="#22d3ee" strokeWidth="0.5" />
    <circle cx="92%" cy="40%" r="2" fill="#22d3ee" />
    <line x1="50%" y1="0" x2="50%" y2="1.5%" stroke="#22d3ee" strokeWidth="1" />
    <circle cx="50%" cy="1.5%" r="2" fill="#22d3ee" />
  </svg>
);

/* ─────────────────────────────────────────────
   TARGETING RETICLE
───────────────────────────────────────────── */
const TargetReticle = () => (
  <div className="relative w-32 h-32 mx-auto">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 rounded-full" style={{ border: '1px dashed rgba(34,211,238,0.3)' }} />
    <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-4 rounded-full border border-cyan-700"
      style={{ borderTopColor: 'rgba(34,211,238,0.9)', borderBottomColor: 'rgba(34,211,238,0.9)' }} />
    {[['top-0 left-0','border-t border-l'],['top-0 right-0','border-t border-r'],
      ['bottom-0 left-0','border-b border-l'],['bottom-0 right-0','border-b border-r']].map(([p,b],i) => (
      <div key={i} className={`absolute ${p} w-4 h-4 ${b} border-cyan-400`} />
    ))}
    <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-cyan-900 opacity-50" /></div>
    <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-px bg-cyan-900 opacity-50" /></div>
    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
      className="absolute w-3 h-3 rounded-full bg-red-500"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 0 10px #ef4444' }} />
  </div>
);

/* ─────────────────────────────────────────────
   NETWORK ACTIVITY
───────────────────────────────────────────── */
const NetBars = () => {
  const [bars, setBars] = useState(Array.from({ length: 24 }, () => Math.random()));
  useEffect(() => {
    const t = setInterval(() => setBars(p => [...p.slice(1), Math.random()]), 300);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      <div className="text-[10px] tracking-widest text-cyan-700 mb-1">NET ACTIVITY</div>
      <div className="flex items-end gap-0.5 h-10">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 bg-cyan-400 rounded-sm transition-all duration-300"
            style={{ height: `${v * 100}%`, opacity: 0.3 + v * 0.7, boxShadow: v > 0.7 ? '0 0 4px #22d3ee' : 'none' }} />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   HUD CORNER ACCENT
───────────────────────────────────────────── */
const HC = ({ pos }) => {
  const cls = {
    tl: 'top-0 left-0 border-t-2 border-l-2',
    tr: 'top-0 right-0 border-t-2 border-r-2',
    bl: 'bottom-0 left-0 border-b-2 border-l-2',
    br: 'bottom-0 right-0 border-b-2 border-r-2',
  };
  return <div className={`absolute ${cls[pos]} w-8 h-8 border-cyan-400`}
    style={{ boxShadow: '0 0 6px rgba(34,211,238,0.4)' }} />;
};

/* ─────────────────────────────────────────────
   VOICE INDICATOR
───────────────────────────────────────────── */
const VoiceIndicator = ({ active, transcript, error }) => (
  <div className={`flex items-center gap-2 border px-3 py-2 text-[10px] tracking-widest flex-1 transition-all
    ${active ? 'border-red-500 bg-red-950/20' : 'border-cyan-900'}`}>
    <motion.div
      animate={active ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
      className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-red-500' : 'bg-cyan-900'}`}
      style={active ? { boxShadow: '0 0 8px #ef4444' } : {}} />
    <span className={`truncate ${active ? 'text-red-400' : error ? 'text-yellow-600' : 'text-cyan-800'}`}>
      {error ? `⚠ ${error}` : active ? (transcript ? `"${transcript}"` : 'LISTENING...') : 'MIC STANDBY'}
    </span>
  </div>
);

/* ─────────────────────────────────────────────
   WEATHER WIDGET
───────────────────────────────────────────── */
const WeatherWidget = ({ data }) => {
  if (!data) return (
    <div className="border border-cyan-950 p-2 text-[10px] text-cyan-900 tracking-widest animate-pulse">
      FETCHING METEOROLOGICAL DATA...
    </div>
  );
  const { label, icon } = weatherLabel(data.code);
  return (
    <div className="border border-cyan-900 p-2 space-y-1">
      <div className="text-[9px] text-cyan-800 tracking-widest">METEOROLOGICAL // GHZ</div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl text-cyan-300 font-bold" style={{ textShadow: '0 0 10px rgba(34,211,238,0.6)' }}>
            {data.temp}°C
          </div>
          <div className="text-[10px] text-cyan-600 tracking-widest">{label}</div>
        </div>
        <div className="text-3xl opacity-70">{icon}</div>
      </div>
      <div className="text-[9px] text-cyan-800">WIND: {data.wind} km/h</div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   CRYPTO TICKER
───────────────────────────────────────────── */
const CryptoTicker = ({ data }) => {
  if (!data) return (
    <div className="border border-cyan-950 p-2 text-[10px] text-cyan-900 tracking-widest animate-pulse">
      FETCHING MARKET DATA...
    </div>
  );
  return (
    <div className="border border-cyan-900 p-2 space-y-1.5">
      <div className="text-[9px] text-cyan-800 tracking-widest">MARKET FEED // LIVE</div>
      {data.map(coin => (
        <div key={coin.id} className="flex justify-between items-center text-[10px] tracking-widest">
          <span className="text-cyan-700">{coin.symbol}</span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">${coin.price.toLocaleString()}</span>
            <span className={coin.change >= 0 ? 'text-green-500' : 'text-red-500'}>
              {coin.change >= 0 ? '▲' : '▼'}{Math.abs(coin.change).toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MISSION ACCOMPLISHED OVERLAY
───────────────────────────────────────────── */
const MissionOverlay = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0.88) 70%)' }}>
        <motion.div initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-green-400" />
        {[['top-8 left-8','border-t-4 border-l-4'],['top-8 right-8','border-t-4 border-r-4'],
          ['bottom-8 left-8','border-b-4 border-l-4'],['bottom-8 right-8','border-b-4 border-r-4']].map(([p,b],i) => (
          <div key={i} className={`absolute ${p} w-16 h-16 ${b} border-green-400`} />
        ))}
        <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-center px-4">
          <div className="text-green-300 text-[10px] tracking-[0.5em] mb-4">// DIRECTIVE STATUS</div>
          <div className="text-4xl sm:text-6xl font-bold tracking-[0.15em] text-green-400 mb-2"
            style={{ textShadow: '0 0 20px rgba(34,197,94,1), 0 0 50px rgba(34,197,94,0.6)' }}>MISSION</div>
          <div className="text-4xl sm:text-6xl font-bold tracking-[0.15em] text-green-300 mb-6"
            style={{ textShadow: '0 0 20px rgba(134,239,172,1), 0 0 50px rgba(134,239,172,0.5)' }}>ACCOMPLISHED</div>
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: 2 }}
            className="text-green-600 text-sm tracking-[0.4em]">— SIR —</motion.div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────────
   HULK MODE OVERLAY
───────────────────────────────────────────── */
const HulkOverlay = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 1 } }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at center, rgba(22,101,52,0.95) 0%, rgba(0,0,0,0.98) 80%)' }}>
        <motion.div initial={{ opacity: 0.8 }} animate={{ opacity: [0.8, 0, 0.5, 0] }}
          transition={{ duration: 0.6 }} className="absolute inset-0 bg-red-600" />
        <motion.div
          animate={{ x: [0,-8,8,-8,8,-5,5,-3,3,0], y: [0,4,-4,4,-4,2,-2,1,-1,0] }}
          transition={{ duration: 0.5, repeat: 4 }}
          className="text-center relative z-10 px-4">
          <div className="text-8xl mb-4">💚</div>
          <motion.div
            animate={{ scale: [1,1.05,1] }} transition={{ duration: 0.5, repeat: 6 }}
            className="text-5xl sm:text-7xl font-black tracking-[0.1em] text-green-400 mb-2"
            style={{ textShadow: '0 0 30px rgba(34,197,94,1), 0 0 60px rgba(34,197,94,0.5)' }}>
            HULK
          </motion.div>
          <div className="text-5xl sm:text-7xl font-black tracking-[0.1em] text-green-300"
            style={{ textShadow: '0 0 30px rgba(134,239,172,1)' }}>
            SMASH!!!
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-8 text-green-700 text-sm tracking-[0.3em]">
            PURGING ALL DIRECTIVES...
          </motion.div>
        </motion.div>
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: '50vw', y: '50vh', scale: 0 }}
            animate={{ opacity: [0,1,0], x: `${Math.random()*100}vw`, y: `${Math.random()*100}vh`, scale: [0,1.5,0] }}
            transition={{ duration: 1.2, delay: Math.random() * 0.5, ease: 'easeOut' }}
            className="absolute w-2 h-2 bg-green-400 rounded-sm top-0 left-0"
            style={{ boxShadow: '0 0 8px #22c55e' }} />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────────
   LOGIN SCREEN
───────────────────────────────────────────── */
const LoginScreen = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const response = await fetch(`https://task-api-xo97.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authorization failed.');
      if (isRegistering) {
        setIsRegistering(false);
        setError('REGISTRATION SUCCESSFUL. PLEASE AUTHENTICATE.');
      } else {
        localStorage.setItem('jarvisToken', data.token);
        setToken(data.token);
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance("Welcome back, sir. All systems online.");
          u.pitch = 0.8;
          window.speechSynthesis.speak(u);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono p-4 relative overflow-hidden text-cyan-400">
      <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" style={{ background: 'linear-gradient(rgba(34,211,238,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="border border-cyan-800 p-6 sm:p-8 max-w-md w-full relative bg-cyan-950/10" style={{ boxShadow: '0 0 30px rgba(34,211,238,0.05) inset' }}>
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
        <div className="text-center mb-8 border-b border-cyan-900 pb-4">
          <h2 className="text-xl sm:text-2xl tracking-[0.3em] font-bold text-cyan-300" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>STARK MAINFRAME</h2>
          <p className="text-xs tracking-[0.4em] text-cyan-700 mt-2">AUTHORIZATION REQUIRED</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] tracking-widest text-cyan-700 mb-2">IDENTIFIER</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full bg-transparent border-b border-cyan-800 text-cyan-200 px-2 py-2 outline-none focus:border-cyan-400 transition-all tracking-widest uppercase"
              placeholder="ENTER USERNAME" />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-cyan-700 mb-2">PASSCODE</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-transparent border-b border-cyan-800 text-cyan-200 px-2 py-2 outline-none focus:border-cyan-400 transition-all tracking-widest"
              placeholder="••••••••" />
          </div>
          {error && (
            <div className={`text-[10px] tracking-widest text-center animate-pulse ${error.includes('SUCCESS') ? 'text-green-500' : 'text-red-500'}`}>
              {error}
            </div>
          )}
          <div className="pt-4 flex flex-col gap-4">
            <button type="submit" className="w-full border border-cyan-600 py-3 text-xs tracking-[0.3em] font-bold hover:bg-cyan-900/40 hover:border-cyan-300 transition-all" style={{ boxShadow: '0 0 15px rgba(34,211,238,0.1)' }}>
              {isRegistering ? 'INITIALIZE CREDENTIALS' : 'AUTHENTICATE'}
            </button>
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-[10px] text-cyan-700 hover:text-cyan-400 tracking-widest transition-colors">
              {isRegistering ? 'RETURN TO LOGIN' : 'REQUEST NEW CLEARANCE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   AUDIO CONTROLLER
───────────────────────────────────────────── */
const AudioController = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const audioRef = useRef(new Audio('/theme.mp3'));

  useEffect(() => {
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("Audio blocked:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, volume]);

  return (
    <div className="border border-cyan-900 p-2 space-y-2 mt-3">
      <div className="text-[10px] tracking-[0.25em] text-cyan-700 flex justify-between">
        <span>AMBIENT AUDIO</span>
        <span className={isPlaying ? "text-cyan-400 animate-pulse" : "text-cyan-800"}>
          {isPlaying ? "PLAYING" : "MUTED"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setIsPlaying(!isPlaying)}
          className={`border px-3 py-1 text-[10px] font-bold tracking-widest transition-all ${
            isPlaying ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300' : 'border-cyan-800 text-cyan-600 hover:border-cyan-500'
          }`}>
          {isPlaying ? '■ STOP' : '▶ PLAY'}
        </button>
        <input type="range" min="0" max="1" step="0.05" value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 accent-cyan-500 h-1 bg-cyan-950 appearance-none rounded-full cursor-pointer" />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SORTABLE TASK CARD
───────────────────────────────────────────── */
const SortableTask = ({ task, index, onComplete, onDelete, isCompleted }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };
  return (
    <motion.div ref={setNodeRef} style={style}
      initial={{ opacity: 0, x: -40, filter: 'blur(4px)' }}
      animate={{ opacity: isCompleted ? 0.4 : 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 80, filter: 'blur(6px)' }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`border bg-cyan-950/15 p-3 sm:p-4 transition-all group relative
        ${isDragging ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
          : isCompleted ? 'border-green-900'
          : 'border-cyan-900 hover:border-cyan-600 hover:bg-cyan-950/30'}`}>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-700 group-hover:border-cyan-400 transition-colors" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-700 group-hover:border-cyan-400 transition-colors" />
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners}
          className="text-cyan-800 hover:text-cyan-500 cursor-grab active:cursor-grabbing flex flex-col gap-0.5 shrink-0 select-none"
          title="Drag to reorder">
          {[0,1,2].map(i => (
            <div key={i} className="flex gap-0.5">
              {[0,1].map(j => <div key={j} className="w-1 h-1 rounded-full bg-current" />)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-cyan-800 text-xs w-5 shrink-0 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <div className="w-0.5 h-6 bg-cyan-800 group-hover:bg-cyan-500 transition-colors shrink-0" />
          <span className={`text-sm tracking-wider uppercase truncate transition-colors
            ${isCompleted ? 'text-green-600 line-through' : 'text-cyan-200 group-hover:text-cyan-50'}`}>
            {task.title}
          </span>
        </div>
        {/* Desktop hover buttons */}
        <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2">
          {!isCompleted && (
            <button onClick={() => onComplete(task)}
              className="text-green-500/70 hover:text-green-400 border border-green-500/30 hover:border-green-400 hover:bg-green-950/30 px-3 py-1 text-[10px] tracking-[0.15em] font-bold transition-all">
              ✓ DONE
            </button>
          )}
          <button onClick={() => onDelete(task._id)}
            className="text-red-500/70 hover:text-red-400 border border-red-500/30 hover:border-red-400 hover:bg-red-950/30 px-3 py-1 text-[10px] tracking-[0.15em] font-bold transition-all">
            PURGE
          </button>
        </div>
      </div>
      {/* Mobile always-visible buttons */}
      <div className="flex sm:hidden gap-2 mt-2 justify-end">
        {!isCompleted && (
          <button onClick={() => onComplete(task)}
            className="text-green-400 border border-green-500/40 bg-green-950/20 px-3 py-1 text-[10px] tracking-[0.15em] font-bold active:bg-green-950/50 transition-all">
            ✓ DONE
          </button>
        )}
        <button onClick={() => onDelete(task._id)}
          className="text-red-400 border border-red-500/40 bg-red-950/20 px-3 py-1 text-[10px] tracking-[0.15em] font-bold active:bg-red-950/50 transition-all">
          PURGE
        </button>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [tasks, setTasks]               = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [completedIds, setCompletedIds] = useState(new Set());
  const [missionVisible, setMissionVisible] = useState(false);
  const [hulkMode, setHulkMode]         = useState(false);
  const [token, setToken]               = useState(localStorage.getItem('jarvisToken'));
  const [mobilePanel, setMobilePanel]   = useState('tasks');
  const [pomodoroActive, setPomodoroActive] = useState(false);

  // completedToday: live count for efficiency chart, persisted to localStorage
  const [completedToday, setCompletedToday] = useState(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const stats = loadStats();
    return stats[todayKey] || 0;
  });

  // Voice
  const [voiceActive, setVoiceActive]       = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError]         = useState('');
  const recognitionRef = useRef(null);

  // Ambient data
  const [weather, setWeather] = useState(null);
  const [crypto, setCrypto]   = useState(null);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ── Persist completedToday to localStorage whenever it changes ── */
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    saveStatDay(todayKey, completedToday);
  }, [completedToday]);

  /* ── Logout ── */
  const handleLogout = useCallback(() => {
    localStorage.removeItem('jarvisToken');
    setToken(null);
    setTasks([]);
    speak('Authorization revoked. Goodbye, sir.');
  }, []);

  /* ── Fetch tasks ── */
  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(API, { headers: { 'Authorization': `Bearer ${token}` } });
      if (r.status === 401 || r.status === 403) { handleLogout(); return; }
      const data = await r.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (error) { console.error('fetchTasks failed:', error); }
  }, [token, handleLogout]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* ── Ambient data ── */
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=28.67&longitude=77.45&current=temperature_2m,weather_code,wind_speed_10m')
      .then(r => r.json())
      .then(d => setWeather({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, wind: Math.round(d.current.wind_speed_10m) }))
      .catch(console.error);

    // CoinGecko blocks browser requests with 429/CORS on free tier.
    // Binance public ticker endpoint is CORS-open and doesn't need a key.
    Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT').then(r => r.json()),
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT').then(r => r.json()),
    ]).then(([btc, eth]) => setCrypto([
      { id: 'bitcoin',  symbol: 'BTC', price: Math.round(parseFloat(btc.lastPrice)),  change: +parseFloat(btc.priceChangePercent).toFixed(2) },
      { id: 'ethereum', symbol: 'ETH', price: Math.round(parseFloat(eth.lastPrice)), change: +parseFloat(eth.priceChangePercent).toFixed(2) },
    ])).catch(console.error);
  }, []);

  /* ── Create task ── */
  const createTask = useCallback((title) => {
    if (!token || !title?.trim()) return;
    speak('Directive logged.');
    fetch(API, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
      .then(() => { setNewTaskTitle(''); fetchTasks(); })
      .catch(console.error);
  }, [fetchTasks, token]);

  /* ── Delete task ── */
  const deleteTask = useCallback((id) => {
    if (!token) return;
    speak('Directive purged.');
    fetch(`${API}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      .then(fetchTasks).catch(console.error);
  }, [fetchTasks, token]);

  /* ── Complete task (increments efficiency counter) ── */
  const completeTask = useCallback((task) => {
    if (!token) return;
    speak('Mission accomplished, sir.');
    setCompletedIds(prev => new Set([...prev, task._id]));
    setMissionVisible(true);
    setCompletedToday(n => n + 1);   // ← live stat increment
    setTimeout(() => setMissionVisible(false), 2800);
    setTimeout(() => {
      fetch(`${API}/${task._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        .then(() => {
          setCompletedIds(prev => { const n = new Set(prev); n.delete(task._id); return n; });
          fetchTasks();
        }).catch(console.error);
    }, 3200);
  }, [fetchTasks, token]);

  /* ── HULK MODE ── */
  const triggerHulk = useCallback(async () => {
    if (!token) return;
    speak('Code green, sir. Initiating Hulk protocol.');
    setHulkMode(true);
    setTimeout(async () => {
      try {
        const r = await fetch(API, { headers: { 'Authorization': `Bearer ${token}` } });
        const current = await r.json();
        if (Array.isArray(current)) {
          await Promise.all(current.map(t =>
            fetch(`${API}/${t._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
          ));
        }
        fetchTasks();
      } catch (e) { console.error(e); }
    }, 2000);
    setTimeout(() => { setHulkMode(false); speak('Hulk contained. All directives purged, sir.'); }, 5200);
  }, [fetchTasks, token]);

  /* ── Drag end ── */
  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setTasks(prev => {
        const oldIdx = prev.findIndex(t => t._id === active.id);
        const newIdx = prev.findIndex(t => t._id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  /* ── Voice control ── */
  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError('BROWSER UNSUPPORTED'); return; }
    if (voiceActive) return;
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    rec.onstart  = () => { setVoiceActive(true); setVoiceError(''); setVoiceTranscript(''); };
    rec.onend    = () => { setVoiceActive(false); setVoiceTranscript(''); };
    rec.onerror  = (e) => {
      setVoiceActive(false);
      setVoiceError(e.error === 'not-allowed' ? 'MIC ACCESS DENIED' : e.error === 'no-speech' ? 'NO SPEECH DETECTED' : `ERR: ${e.error.toUpperCase()}`);
    };
    rec.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('').toLowerCase().trim();
      setVoiceTranscript(transcript);
      if (!event.results[event.results.length - 1].isFinal) return;
      if (transcript.includes('hulk')) { triggerHulk(); return; }
      const addMatch = transcript.match(/^(?:add|log|new task|jarvis add)\s+(.+)/);
      if (addMatch) { createTask(addMatch[1]); speak(`Logging: ${addMatch[1]}.`); return; }
      const completeMatch = transcript.match(/^(?:complete|done|finished|mark done)\s+(.+)/);
      if (completeMatch) { const found = tasks.find(t => t.title.toLowerCase().includes(completeMatch[1])); found ? completeTask(found) : speak('Directive not found, sir.'); return; }
      const purgeMatch = transcript.match(/^(?:purge|delete|remove)\s+(.+)/);
      if (purgeMatch) { const found = tasks.find(t => t.title.toLowerCase().includes(purgeMatch[1])); found ? deleteTask(found._id) : speak('Could not locate that directive, sir.'); return; }
      if (transcript.includes('status') || transcript.includes('how many')) { speak(`You have ${tasks.length} active directive${tasks.length !== 1 ? 's' : ''}, sir.`); return; }
      speak('Command not recognised, sir. Please try again.');
    };
    try { rec.start(); } catch { setVoiceError('RECOGNITION FAILED'); }
  }, [voiceActive, tasks, triggerHulk, createTask, completeTask, deleteTask]);

  const stopVoice = () => { recognitionRef.current?.stop(); };

  /* ── Form submit ── */
  const handleExecute = (e) => {
    e.preventDefault();
    if (newTaskTitle.toLowerCase().includes('hulk smash')) { triggerHulk(); setNewTaskTitle(''); return; }
    createTask(newTaskTitle);
  };

  /* ── Left panel content (shared between desktop and mobile SYSTEMS tab) ── */
  const LeftPanelContent = () => (
    <>
      <div className="text-[10px] tracking-[0.25em] text-cyan-700 border-b border-cyan-950 pb-2">POWER CORE // DIAGNOSTICS</div>

      {/* Arc reactor — speeds up when pomodoro is active */}
      <ArcReactor hulkMode={hulkMode} pomodoroActive={pomodoroActive} />

      {/* Seg bars */}
      <div className="space-y-3">
        <SegBar label="CPU LOAD"  value={37} />
        <SegBar label="RAM USAGE" value={62} />
        <SegBar label="NET I/O"   value={81} accent="#f97316" />
        <SegBar label="ARC OUTPUT" value={100} />
      </div>

      {/* System status */}
      <div className="space-y-1.5 text-[10px] tracking-widest border-t border-cyan-950 pt-3">
        <div className="flex justify-between"><span className="text-cyan-800">NEURAL LINK</span><span className="text-green-400">ESTABLISHED</span></div>
        <div className="flex justify-between"><span className="text-cyan-800">ENCRYPTION</span><span className="text-cyan-400">AES-256</span></div>
        <div className="flex justify-between"><span className="text-cyan-800">FIGHT SYS</span><span className="text-cyan-700">OFFLINE</span></div>
        <div className="flex justify-between"><span className="text-cyan-800">REPULSOR</span>
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-red-500">CHARGING</motion.span>
        </div>
      </div>

      {/* ── POMODORO TIMER ── */}
      <div className="border-t border-cyan-950 pt-3">
        <PomodoroTimer onStateChange={setPomodoroActive} />
      </div>

      {/* ── EFFICIENCY REPORT ── */}
      <div className="border-t border-cyan-950 pt-3">
        <EfficiencyReport completedToday={completedToday} />
      </div>

      {/* Radar */}
      <div className="border-t border-cyan-950 pt-3">
        <div className="text-[10px] tracking-[0.25em] text-cyan-700 mb-2">PROXIMITY SCAN</div>
        <Radar taskCount={tasks.length} />
      </div>
    </>
  );

  /* ══════════════════════════
     RENDER
  ══════════════════════════ */
  return (
    token ? (
    <div className={`min-h-screen font-mono overflow-hidden relative transition-colors duration-700 ${hulkMode ? 'bg-green-950' : 'bg-black'} text-cyan-400`}>

      <HexGrid />
      <CircuitLines />

      {/* Binary stream */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <motion.div animate={{ y: [0, -1800] }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="text-[10px] text-cyan-400 leading-4 whitespace-pre-wrap break-all p-4">
          {Array.from({ length: 400 }).map(() => Math.random().toString(2).substring(2, 18)).join(' ')}
        </motion.div>
      </div>

      {/* Scan line */}
      <motion.div animate={{ top: ['-2%', '102%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 w-full h-px pointer-events-none z-50"
        style={{ background: `linear-gradient(90deg, transparent, ${hulkMode ? 'rgba(34,197,94,0.5)' : 'rgba(34,211,238,0.4)'}, transparent)` }} />

      <MissionOverlay visible={missionVisible} />
      <HulkOverlay visible={hulkMode} />

      {/* ════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════ */}
      <div className="hidden sm:flex relative z-10 p-3 h-screen flex-col">

        {/* Top bar */}
        <div className="flex justify-between items-center mb-2 px-2 text-[10px] tracking-[0.3em] text-cyan-800 border-b border-cyan-950 pb-2">
          <span>STARK INDUSTRIES // CLASSIFIED</span>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-red-500">● LIVE FEED</motion.span>
          <div className="flex items-center gap-4">
            <span>MARK VIII // J.A.R.V.I.S. v4.2</span>
            <button onClick={handleLogout}
              className="border border-red-900 text-red-700 hover:bg-red-950/50 hover:text-red-400 hover:border-red-500 px-2 py-0.5 transition-all">
              [ OVERRIDE ]
            </button>
          </div>
        </div>

        {/* Three-column grid */}
        <div className="flex-1 grid grid-cols-[260px_1fr_230px] gap-3 min-h-0">

          {/* ═══ LEFT PANEL ═══ */}
          <div className="border border-cyan-900 relative p-4 flex flex-col gap-4 overflow-y-auto"
            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.04) inset' }}>
            <HC pos="tl" /><HC pos="tr" /><HC pos="bl" /><HC pos="br" />
            <LeftPanelContent />
          </div>

          {/* ═══ CENTER PANEL ═══ */}
          <div className="border border-cyan-900 relative p-5 flex flex-col gap-3 overflow-hidden"
            style={{ boxShadow: '0 0 30px rgba(34,211,238,0.05) inset' }}>
            <HC pos="tl" /><HC pos="tr" /><HC pos="bl" /><HC pos="br" />

            <div className="flex justify-between items-start border-b-2 border-cyan-900 pb-4">
              <div>
                <div className="text-[10px] tracking-[0.4em] text-cyan-700 mb-1">// OPERATIONAL INTERFACE</div>
                <motion.h1
                  animate={{ textShadow: ['0 0 10px rgba(34,211,238,0.5)', '0 0 30px rgba(34,211,238,0.9)', '0 0 10px rgba(34,211,238,0.5)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl tracking-[0.2em] font-bold text-cyan-300">
                  J.A.R.V.I.S.
                </motion.h1>
                <div className="text-xs tracking-[0.3em] text-cyan-700 mt-0.5">DIRECTIVE MANAGEMENT PROTOCOL</div>
              </div>
              <div className="text-right space-y-1">
                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-2 text-xs tracking-widest text-red-400 justify-end">
                  <div className="w-2 h-2 bg-red-500 rounded-full" style={{ boxShadow: '0 0 6px #ef4444' }} />
                  SYSTEM ACTIVE
                </motion.div>
                <div className="text-[10px] text-cyan-800 tracking-widest">LOCATION: GHZ // IN</div>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <VoiceIndicator active={voiceActive} transcript={voiceTranscript} error={voiceError} />
              <button onMouseDown={startVoice} onMouseUp={stopVoice} onMouseLeave={stopVoice}
                onTouchStart={startVoice} onTouchEnd={stopVoice}
                className={`border px-4 py-2 text-[10px] tracking-[0.2em] font-bold transition-all select-none shrink-0
                  ${voiceActive ? 'border-red-500 bg-red-950/40 text-red-400' : 'border-cyan-800 hover:border-cyan-500 hover:bg-cyan-950/30 text-cyan-600 hover:text-cyan-300'}`}>
                {voiceActive ? '● REC' : '🎤 HOLD'}
              </button>
            </div>
            <div className="text-[9px] text-cyan-900 tracking-widest leading-relaxed">
              VOICE: "ADD [task]" · "COMPLETE [task]" · "PURGE [task]" · "STATUS" · "HULK SMASH"
            </div>

            <form onSubmit={handleExecute}
              className="flex gap-3 border border-cyan-800 bg-cyan-950/10 p-3 relative"
              style={{ boxShadow: '0 0 15px rgba(34,211,238,0.05) inset' }}>
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500" />
              <span className="text-cyan-500 mt-2 text-xs">&gt;_</span>
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="AWAITING DIRECTIVE..." required
                className="flex-1 bg-transparent border-b border-cyan-800 text-cyan-200 px-2 py-1 outline-none focus:border-cyan-400 transition-all uppercase placeholder-cyan-900 text-sm tracking-widest" />
              <button type="submit"
                className="border border-cyan-600 px-6 py-2 text-xs tracking-[0.2em] font-bold hover:bg-cyan-900/40 hover:border-cyan-300 hover:text-cyan-200 transition-all"
                style={{ boxShadow: '0 0 10px rgba(34,211,238,0.1)' }}>
                EXECUTE
              </button>
            </form>

            <div className="flex items-center gap-4 text-[10px] tracking-widest text-cyan-800">
              <span>ACTIVE:</span><span className="text-cyan-400 font-bold">{tasks.length}</span>
              <span>COMPLETE:</span><span className="text-green-600 font-bold">{completedIds.size}</span>
              <div className="flex-1 h-px bg-cyan-950" />
              <button onClick={triggerHulk}
                className="text-[9px] border border-green-900 text-green-900 hover:border-green-500 hover:text-green-500 px-2 py-0.5 transition-all tracking-widest">
                💚 HULK MODE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 min-h-0 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    {tasks.length === 0 ? (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-40 gap-2">
                        <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                          className="text-cyan-800 tracking-[0.3em] text-sm">NO PENDING DIRECTIVES</motion.div>
                        <div className="text-[10px] text-cyan-900 tracking-widest">SYSTEM STANDING BY...</div>
                      </motion.div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task, idx) => (
                          <SortableTask key={task._id} task={task} index={idx}
                            onComplete={completeTask} onDelete={deleteTask}
                            isCompleted={completedIds.has(task._id)} />
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          {/* ═══ RIGHT PANEL ═══ */}
          <div className="border border-cyan-900 relative p-4 flex flex-col gap-4 overflow-y-auto"
            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.04) inset' }}>
            <HC pos="tl" /><HC pos="tr" /><HC pos="bl" /><HC pos="br" />
            <div className="text-[10px] tracking-[0.25em] text-cyan-700 border-b border-cyan-950 pb-2">SITUATIONAL AWARENESS</div>
            <LiveClock />
            <div className="grid grid-cols-2 gap-1.5 text-[10px] tracking-widest">
              {[['SYS.MGR','border-cyan-800 text-cyan-600',false],['API.CON','border-cyan-800 text-cyan-600',false],
                ['WAR.DRV','border-red-800 text-red-500',true],['NET.MON','border-cyan-800 text-cyan-600',false]].map(([l,c,pulse],i) => (
                <div key={i} className={`border px-2 py-1 text-center ${c} ${pulse?'animate-pulse':''}`}>{l}</div>
              ))}
            </div>
            <WeatherWidget data={weather} />
            <CryptoTicker data={crypto} />
            <AudioController />
            <div className="border-t border-cyan-950 pt-3">
              <div className="text-[10px] tracking-[0.25em] text-cyan-700 mb-2">TARGETING GRID</div>
              <TargetReticle />
              <div className="mt-1 text-[9px] text-cyan-900 tracking-widest text-center">LOCK ACQUISITION IN PROGRESS</div>
            </div>
            <div className="border-t border-cyan-950 pt-3"><NetBars /></div>
            <div className="border-t border-cyan-950 pt-3 space-y-2 text-[10px] tracking-widest">
              <div className="flex justify-between"><span className="text-cyan-900">GLOBAL NET</span><span className="text-green-400">ACTIVE</span></div>
              <div className="flex justify-between"><span className="text-cyan-900">THREAT LVL</span><span className="text-yellow-400">MODERATE</span></div>
              <div className="flex justify-between"><span className="text-cyan-900">SHIELD</span>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="text-cyan-400">ONLINE</motion.span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex justify-between items-center mt-2 px-2 text-[9px] tracking-[0.25em] text-cyan-900 border-t border-cyan-950 pt-2">
          <span>91.219.164.5 // UPLINK SECURE</span>
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>◈ ALL SYSTEMS NOMINAL ◈</motion.span>
          <span>BUILD 4.2.1 // LEVEL 7 CLEARANCE</span>
        </div>
      </div>

      {/* ════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════ */}
      <div className="flex sm:hidden relative z-10 flex-col h-screen">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-950 shrink-0">
          <div className="flex items-center gap-2">
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 4px #ef4444' }} />
            <motion.h1
              animate={{ textShadow: ['0 0 8px rgba(34,211,238,0.5)', '0 0 20px rgba(34,211,238,0.9)', '0 0 8px rgba(34,211,238,0.5)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-lg tracking-[0.2em] font-bold text-cyan-300">
              J.A.R.V.I.S.
            </motion.h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-cyan-800 tracking-widest">{tasks.length} ACTIVE</span>
            <button onClick={handleLogout}
              className="border border-red-900 text-red-700 text-[9px] tracking-widest px-2 py-0.5 active:bg-red-950/50 transition-all">
              OVERRIDE
            </button>
          </div>
        </div>

        {/* Mobile panel content */}
        <div className="flex-1 overflow-hidden">

          {/* TASKS PANEL */}
          {mobilePanel === 'tasks' && (
            <div className="h-full flex flex-col p-3 gap-3">
              <div className="flex justify-between items-center shrink-0">
                <div className="text-[9px] tracking-[0.3em] text-cyan-700">// DIRECTIVE MANAGEMENT</div>
                <div className="flex items-center gap-3 text-[9px] tracking-widest">
                  <span className="text-cyan-800">DONE: <span className="text-green-600 font-bold">{completedToday}</span></span>
                  <button onClick={triggerHulk}
                    className="border border-green-900 text-green-900 px-2 py-0.5 text-[9px] tracking-widest active:border-green-500 active:text-green-500 transition-all">
                    💚 HULK
                  </button>
                </div>
              </div>
              <form onSubmit={handleExecute}
                className="flex gap-2 border border-cyan-800 bg-cyan-950/10 p-2.5 relative shrink-0"
                style={{ boxShadow: '0 0 15px rgba(34,211,238,0.05) inset' }}>
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-500" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-500" />
                <span className="text-cyan-500 text-xs self-center">&gt;_</span>
                <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="AWAITING DIRECTIVE..." required
                  className="flex-1 bg-transparent border-b border-cyan-800 text-cyan-200 px-1 py-1 outline-none focus:border-cyan-400 transition-all uppercase placeholder-cyan-900 text-xs tracking-widest" />
                <button type="submit"
                  className="border border-cyan-600 px-3 py-1 text-[10px] tracking-[0.15em] font-bold active:bg-cyan-900/40 transition-all"
                  style={{ boxShadow: '0 0 8px rgba(34,211,238,0.1)' }}>
                  LOG
                </button>
              </form>
              <div className="flex gap-2 items-center shrink-0">
                <VoiceIndicator active={voiceActive} transcript={voiceTranscript} error={voiceError} />
                <button onMouseDown={startVoice} onMouseUp={stopVoice} onMouseLeave={stopVoice}
                  onTouchStart={startVoice} onTouchEnd={stopVoice}
                  className={`border px-3 py-2 text-[10px] tracking-[0.15em] font-bold transition-all select-none shrink-0
                    ${voiceActive ? 'border-red-500 bg-red-950/40 text-red-400' : 'border-cyan-800 text-cyan-600'}`}>
                  {voiceActive ? '● REC' : '🎤'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                      {tasks.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-32 gap-2">
                          <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                            className="text-cyan-800 tracking-[0.3em] text-xs">NO PENDING DIRECTIVES</motion.div>
                          <div className="text-[9px] text-cyan-900 tracking-widest">SYSTEM STANDING BY...</div>
                        </motion.div>
                      ) : (
                        <div className="space-y-2 pb-2">
                          {tasks.map((task, idx) => (
                            <SortableTask key={task._id} task={task} index={idx}
                              onComplete={completeTask} onDelete={deleteTask}
                              isCompleted={completedIds.has(task._id)} />
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}

          {/* SYSTEMS PANEL — now includes Pomodoro + Efficiency */}
          {mobilePanel === 'systems' && (
            <div className="h-full overflow-y-auto p-4 space-y-4">
              <LeftPanelContent />
            </div>
          )}

          {/* INTEL PANEL */}
          {mobilePanel === 'intel' && (
            <div className="h-full overflow-y-auto p-4 space-y-4">
              <div className="text-[10px] tracking-[0.25em] text-cyan-700 border-b border-cyan-950 pb-2">SITUATIONAL AWARENESS</div>
              <LiveClock />
              <div className="grid grid-cols-2 gap-1.5 text-[10px] tracking-widest">
                {[['SYS.MGR','border-cyan-800 text-cyan-600',false],['API.CON','border-cyan-800 text-cyan-600',false],
                  ['WAR.DRV','border-red-800 text-red-500',true],['NET.MON','border-cyan-800 text-cyan-600',false]].map(([l,c,pulse],i) => (
                  <div key={i} className={`border px-2 py-1 text-center ${c} ${pulse?'animate-pulse':''}`}>{l}</div>
                ))}
              </div>
              <WeatherWidget data={weather} />
              <CryptoTicker data={crypto} />
              <AudioController />
              <div className="border-t border-cyan-950 pt-3">
                <div className="text-[10px] tracking-[0.25em] text-cyan-700 mb-2">TARGETING GRID</div>
                <TargetReticle />
                <div className="mt-1 text-[9px] text-cyan-900 tracking-widest text-center">LOCK ACQUISITION IN PROGRESS</div>
              </div>
              <div className="border-t border-cyan-950 pt-3"><NetBars /></div>
              <div className="border-t border-cyan-950 pt-3 space-y-2 text-[10px] tracking-widest pb-2">
                <div className="flex justify-between"><span className="text-cyan-900">GLOBAL NET</span><span className="text-green-400">ACTIVE</span></div>
                <div className="flex justify-between"><span className="text-cyan-900">THREAT LVL</span><span className="text-yellow-400">MODERATE</span></div>
                <div className="flex justify-between"><span className="text-cyan-900">SHIELD</span>
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="text-cyan-400">ONLINE</motion.span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom tab bar */}
        <div className="shrink-0 border-t border-cyan-900 grid grid-cols-3"
          style={{ boxShadow: '0 0 20px rgba(34,211,238,0.05) inset' }}>
          {[
            { id: 'systems', label: 'SYSTEMS',    icon: '⚙' },
            { id: 'tasks',   label: 'DIRECTIVES', icon: '◈' },
            { id: 'intel',   label: 'INTEL',      icon: '◉' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setMobilePanel(tab.id)}
              className={`flex flex-col items-center justify-center py-3 gap-1 text-[9px] tracking-widest font-bold transition-all
                ${mobilePanel === tab.id
                  ? 'text-cyan-300 bg-cyan-950/40 border-t-2 border-cyan-400'
                  : 'text-cyan-800 border-t-2 border-transparent active:bg-cyan-950/20'}`}
              style={mobilePanel === tab.id ? { textShadow: '0 0 8px rgba(34,211,238,0.8)' } : {}}>
              <span className="text-base leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
    ) : (
      <LoginScreen setToken={setToken} />
    )
  );
}