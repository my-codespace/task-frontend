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
   SPEAK  (British JARVIS voice)
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
   ARC REACTOR (5 rings, hulk-aware)
───────────────────────────────────────────── */
const ArcReactor = ({ hulkMode }) => {
  const c = hulkMode ? '#22c55e' : '#22d3ee';
  const cFaint = hulkMode ? 'rgba(34,197,94,0.3)' : 'rgba(34,211,238,0.3)';
  const cGlow  = hulkMode ? 'rgba(34,197,94,' : 'rgba(34,211,238,';
  return (
    <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
      <svg className="absolute w-full h-full" viewBox="0 0 176 176">
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180, r1 = 84, r2 = i % 3 === 0 ? 78 : 80;
          return <line key={i} x1={88 + r1 * Math.cos(a)} y1={88 + r1 * Math.sin(a)}
            x2={88 + r2 * Math.cos(a)} y2={88 + r2 * Math.sin(a)}
            stroke={cFaint} strokeWidth={i % 3 === 0 ? 1.5 : 0.8} />;
        })}
      </svg>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute w-40 h-40 rounded-full"
        style={{ border: `1px dashed ${cFaint}` }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute w-32 h-32 rounded-full border-2"
        style={{ borderColor: hulkMode ? '#166534' : '#155e75', borderTopColor: c, boxShadow: `0 0 10px ${cGlow}0.2) inset` }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        className="absolute w-24 h-24 rounded-full"
        style={{ border: '2px solid transparent', borderTopColor: c, borderLeftColor: cFaint }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute w-32 h-32 rounded-full"
        style={{ background: `conic-gradient(from 0deg, ${cGlow}0.5) 0%, ${cGlow}0.1) 25%, transparent 45%)` }} />
      <motion.div
        animate={{ borderRadius: ['30% 70% 70% 30%/30% 30% 70% 70%', '70% 30% 30% 70%/70% 70% 30% 30%', '30% 70% 70% 30%/30% 30% 70% 70%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-16 h-16 border"
        style={{ borderColor: c, boxShadow: `0 0 10px ${cGlow}0.3)` }} />
      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-9 h-9 rounded-full"
        style={{ background: hulkMode ? '#86efac' : '#67e8f9', boxShadow: `0 0 12px #fff, 0 0 30px ${c}, 0 0 60px ${cGlow}0.7)` }}>
        <div className="absolute inset-1 rounded-full bg-cyan-950" />
        <div className="absolute inset-2 rounded-full opacity-80" style={{ background: hulkMode ? '#86efac' : '#67e8f9' }} />
      </motion.div>
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
        {/* Flash */}
        <motion.div initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-green-400" />
        {/* Corner brackets */}
        {[['top-8 left-8','border-t-4 border-l-4'],['top-8 right-8','border-t-4 border-r-4'],
          ['bottom-8 left-8','border-b-4 border-l-4'],['bottom-8 right-8','border-b-4 border-r-4']].map(([p,b],i) => (
          <div key={i} className={`absolute ${p} w-16 h-16 ${b} border-green-400`} />
        ))}
        <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-center">
          <div className="text-green-300 text-[10px] tracking-[0.5em] mb-4">// DIRECTIVE STATUS</div>
          <div className="text-6xl font-bold tracking-[0.15em] text-green-400 mb-2"
            style={{ textShadow: '0 0 20px rgba(34,197,94,1), 0 0 50px rgba(34,197,94,0.6)' }}>MISSION</div>
          <div className="text-6xl font-bold tracking-[0.15em] text-green-300 mb-6"
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
          className="text-center relative z-10">
          <div className="text-8xl mb-4">💚</div>
          <motion.div
            animate={{ scale: [1,1.05,1] }} transition={{ duration: 0.5, repeat: 6 }}
            className="text-7xl font-black tracking-[0.1em] text-green-400 mb-2"
            style={{ textShadow: '0 0 30px rgba(34,197,94,1), 0 0 60px rgba(34,197,94,0.5)' }}>
            HULK
          </motion.div>
          <div className="text-7xl font-black tracking-[0.1em] text-green-300"
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
      className={`flex justify-between items-center border bg-cyan-950/15 p-4 transition-all group relative
        ${isDragging
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
          : isCompleted
            ? 'border-green-900'
            : 'border-cyan-900 hover:border-cyan-600 hover:bg-cyan-950/30'}`}>

      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-700 group-hover:border-cyan-400 transition-colors" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-700 group-hover:border-cyan-400 transition-colors" />

      {/* Drag handle */}
      <div {...attributes} {...listeners}
        className="text-cyan-800 hover:text-cyan-500 cursor-grab active:cursor-grabbing mr-3 flex flex-col gap-0.5 shrink-0 select-none"
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

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2">
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
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [completedIds, setCompletedIds] = useState(new Set());
  const [missionVisible, setMissionVisible] = useState(false);
  const [hulkMode, setHulkMode] = useState(false);

  // Voice
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);

  // Ambient data
  const [weather, setWeather] = useState(null);
  const [crypto, setCrypto] = useState(null);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ── Fetch tasks ── */
  const fetchTasks = useCallback(() => {
    fetch(API).then(r => r.json()).then(setTasks).catch(console.error);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* ── Ambient data ── */
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=28.67&longitude=77.45&current=temperature_2m,weather_code,wind_speed_10m')
      .then(r => r.json())
      .then(d => setWeather({
        temp: Math.round(d.current.temperature_2m),
        code: d.current.weather_code,
        wind: Math.round(d.current.wind_speed_10m),
      })).catch(console.error);

    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
      .then(r => r.json())
      .then(d => setCrypto([
        { id: 'bitcoin',  symbol: 'BTC', price: Math.round(d.bitcoin.usd),  change: +(d.bitcoin.usd_24h_change  || 0).toFixed(2) },
        { id: 'ethereum', symbol: 'ETH', price: Math.round(d.ethereum.usd), change: +(d.ethereum.usd_24h_change || 0).toFixed(2) },
      ])).catch(console.error);
  }, []);

  /* ── Create task ── */
  const createTask = useCallback((title) => {
    if (!title?.trim()) return;
    speak('Directive logged.');
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
      .then(() => { setNewTaskTitle(''); fetchTasks(); });
  }, [fetchTasks]);

  /* ── Delete task ── */
  const deleteTask = useCallback((id) => {
    speak('Directive purged.');
    fetch(`${API}/${id}`, { method: 'DELETE' }).then(fetchTasks);
  }, [fetchTasks]);

  /* ── Complete task → Mission Accomplished ── */
  const completeTask = useCallback((task) => {
    speak('Mission accomplished, sir.');
    setCompletedIds(prev => new Set([...prev, task._id]));
    setMissionVisible(true);
    setTimeout(() => setMissionVisible(false), 2800);
    setTimeout(() => {
      fetch(`${API}/${task._id}`, { method: 'DELETE' }).then(() => {
        setCompletedIds(prev => { const n = new Set(prev); n.delete(task._id); return n; });
        fetchTasks();
      });
    }, 3200);
  }, [fetchTasks]);

  /* ── HULK MODE ── */
  const triggerHulk = useCallback(async () => {
    speak('Code green, sir. Initiating Hulk protocol.');
    setHulkMode(true);
    setTimeout(async () => {
      try {
        const current = await fetch(API).then(r => r.json());
        await Promise.all(current.map(t => fetch(`${API}/${t._id}`, { method: 'DELETE' })));
        fetchTasks();
      } catch (e) { console.error(e); }
    }, 2000);
    setTimeout(() => {
      setHulkMode(false);
      speak('Hulk contained. All directives purged, sir.');
    }, 5200);
  }, [fetchTasks]);

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
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => { setVoiceActive(true); setVoiceError(''); setVoiceTranscript(''); };
    rec.onend   = () => { setVoiceActive(false); setVoiceTranscript(''); };
    rec.onerror = (e) => {
      setVoiceActive(false);
      setVoiceError(e.error === 'not-allowed' ? 'MIC ACCESS DENIED' : e.error === 'no-speech' ? 'NO SPEECH DETECTED' : `ERR: ${e.error.toUpperCase()}`);
    };
    rec.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('').toLowerCase().trim();
      setVoiceTranscript(transcript);
      if (!event.results[event.results.length - 1].isFinal) return;

      // Commands
      if (transcript.includes('hulk')) { triggerHulk(); return; }

      const addMatch = transcript.match(/^(?:add|log|new task|jarvis add)\s+(.+)/);
      if (addMatch) { createTask(addMatch[1]); speak(`Logging: ${addMatch[1]}.`); return; }

      const completeMatch = transcript.match(/^(?:complete|done|finished|mark done)\s+(.+)/);
      if (completeMatch) {
        const found = tasks.find(t => t.title.toLowerCase().includes(completeMatch[1]));
        found ? completeTask(found) : speak('Directive not found, sir.');
        return;
      }

      const purgeMatch = transcript.match(/^(?:purge|delete|remove)\s+(.+)/);
      if (purgeMatch) {
        const found = tasks.find(t => t.title.toLowerCase().includes(purgeMatch[1]));
        found ? deleteTask(found._id) : speak('Could not locate that directive, sir.');
        return;
      }

      if (transcript.includes('status') || transcript.includes('how many')) {
        speak(`You have ${tasks.length} active directive${tasks.length !== 1 ? 's' : ''}, sir.`); return;
      }

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

  /* ══════════════════════════
     RENDER
  ══════════════════════════ */
  return (
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

      {/* Horizontal scan line */}
      <motion.div animate={{ top: ['-2%', '102%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 w-full h-px pointer-events-none z-50"
        style={{ background: `linear-gradient(90deg, transparent, ${hulkMode ? 'rgba(34,197,94,0.5)' : 'rgba(34,211,238,0.4)'}, transparent)` }} />

      {/* Overlays */}
      <MissionOverlay visible={missionVisible} />
      <HulkOverlay visible={hulkMode} />

      {/* ── LAYOUT ── */}
      <div className="relative z-10 p-3 h-screen flex flex-col">

        {/* Top bar */}
        <div className="flex justify-between items-center mb-2 px-2 text-[10px] tracking-[0.3em] text-cyan-800 border-b border-cyan-950 pb-2">
          <span>STARK INDUSTRIES // CLASSIFIED</span>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-red-500">● LIVE FEED</motion.span>
          <span>MARK VIII // J.A.R.V.I.S. v4.2</span>
        </div>

        {/* Three-column grid */}
        <div className="flex-1 grid grid-cols-[260px_1fr_230px] gap-3 min-h-0">

          {/* ═══ LEFT PANEL ═══ */}
          <div className="border border-cyan-900 relative p-4 flex flex-col gap-4 overflow-hidden"
            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.04) inset' }}>
            <HC pos="tl" /><HC pos="tr" /><HC pos="bl" /><HC pos="br" />
            <div className="text-[10px] tracking-[0.25em] text-cyan-700 border-b border-cyan-950 pb-2">POWER CORE // DIAGNOSTICS</div>
            <ArcReactor hulkMode={hulkMode} />
            <div className="space-y-3">
              <SegBar label="CPU LOAD" value={37} />
              <SegBar label="RAM USAGE" value={62} />
              <SegBar label="NET I/O" value={81} accent="#f97316" />
              <SegBar label="ARC OUTPUT" value={100} />
            </div>
            <div className="space-y-1.5 text-[10px] tracking-widest border-t border-cyan-950 pt-3">
              <div className="flex justify-between"><span className="text-cyan-800">NEURAL LINK</span><span className="text-green-400">ESTABLISHED</span></div>
              <div className="flex justify-between"><span className="text-cyan-800">ENCRYPTION</span><span className="text-cyan-400">AES-256</span></div>
              <div className="flex justify-between"><span className="text-cyan-800">FIGHT SYS</span><span className="text-cyan-700">OFFLINE</span></div>
              <div className="flex justify-between"><span className="text-cyan-800">REPULSOR</span>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-red-500">CHARGING</motion.span>
              </div>
            </div>
            <div className="border-t border-cyan-950 pt-3">
              <div className="text-[10px] tracking-[0.25em] text-cyan-700 mb-2">PROXIMITY SCAN</div>
              <Radar taskCount={tasks.length} />
            </div>
          </div>

          {/* ═══ CENTER PANEL ═══ */}
          <div className="border border-cyan-900 relative p-5 flex flex-col gap-3 overflow-hidden"
            style={{ boxShadow: '0 0 30px rgba(34,211,238,0.05) inset' }}>
            <HC pos="tl" /><HC pos="tr" /><HC pos="bl" /><HC pos="br" />

            {/* Header */}
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

            {/* Voice row */}
            <div className="flex gap-2 items-center">
              <VoiceIndicator active={voiceActive} transcript={voiceTranscript} error={voiceError} />
              <button
                onMouseDown={startVoice} onMouseUp={stopVoice} onMouseLeave={stopVoice}
                onTouchStart={startVoice} onTouchEnd={stopVoice}
                className={`border px-4 py-2 text-[10px] tracking-[0.2em] font-bold transition-all select-none shrink-0
                  ${voiceActive
                    ? 'border-red-500 bg-red-950/40 text-red-400'
                    : 'border-cyan-800 hover:border-cyan-500 hover:bg-cyan-950/30 text-cyan-600 hover:text-cyan-300'}`}>
                {voiceActive ? '● REC' : '🎤 HOLD'}
              </button>
            </div>
            <div className="text-[9px] text-cyan-900 tracking-widest leading-relaxed">
              VOICE: "ADD [task]" · "COMPLETE [task]" · "PURGE [task]" · "STATUS" · "HULK SMASH"
            </div>

            {/* Text input */}
            <form onSubmit={handleExecute}
              className="flex gap-3 border border-cyan-800 bg-cyan-950/10 p-3 relative"
              style={{ boxShadow: '0 0 15px rgba(34,211,238,0.05) inset' }}>
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500" />
              <span className="text-cyan-500 mt-2 text-xs">&gt;_</span>
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="AWAITING DIRECTIVE..."
                required
                className="flex-1 bg-transparent border-b border-cyan-800 text-cyan-200 px-2 py-1 outline-none focus:border-cyan-400 transition-all uppercase placeholder-cyan-900 text-sm tracking-widest" />
              <button type="submit"
                className="border border-cyan-600 px-6 py-2 text-xs tracking-[0.2em] font-bold hover:bg-cyan-900/40 hover:border-cyan-300 hover:text-cyan-200 transition-all"
                style={{ boxShadow: '0 0 10px rgba(34,211,238,0.1)' }}>
                EXECUTE
              </button>
            </form>

            {/* Stats + Hulk trigger */}
            <div className="flex items-center gap-4 text-[10px] tracking-widest text-cyan-800">
              <span>ACTIVE:</span><span className="text-cyan-400 font-bold">{tasks.length}</span>
              <span>COMPLETE:</span><span className="text-green-600 font-bold">{completedIds.size}</span>
              <div className="flex-1 h-px bg-cyan-950" />
              <button onClick={triggerHulk}
                className="text-[9px] border border-green-900 text-green-900 hover:border-green-500 hover:text-green-500 px-2 py-0.5 transition-all tracking-widest">
                💚 HULK MODE
              </button>
            </div>

            {/* Task list — draggable */}
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
    </div>
  );
}