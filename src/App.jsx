import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Live Clock ─── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
  return (
    <div className="text-center">
      <div className="text-4xl tracking-[0.2em] text-cyan-300 tabular-nums" style={{ textShadow: '0 0 20px rgba(34,211,238,0.9)' }}>
        {hh}<span className="animate-pulse">:</span>{mm}<span className="text-2xl text-cyan-600">:{ss}</span>
      </div>
      <div className="text-xs text-cyan-700 tracking-[0.3em] mt-1">{dateStr}</div>
    </div>
  );
};

/* ─── Arc Reactor (5 rings) ─── */
const ArcReactor = () => (
  <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
    {/* Tick marks outer ring */}
    <svg className="absolute w-full h-full" viewBox="0 0 176 176">
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10 * Math.PI) / 180;
        const r1 = 84, r2 = i % 3 === 0 ? 78 : 80;
        return (
          <line
            key={i}
            x1={88 + r1 * Math.cos(angle)} y1={88 + r1 * Math.sin(angle)}
            x2={88 + r2 * Math.cos(angle)} y2={88 + r2 * Math.sin(angle)}
            stroke="rgba(34,211,238,0.3)" strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
          />
        );
      })}
    </svg>

    {/* Ring 1 — slowest CCW */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="absolute w-40 h-40 rounded-full"
      style={{ border: '1px dashed rgba(34,211,238,0.2)' }}
    />

    {/* Ring 2 — medium CW, segmented */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      className="absolute w-32 h-32 rounded-full border-2 border-cyan-800"
      style={{ borderTopColor: 'rgba(34,211,238,0.9)', borderRightColor: 'rgba(34,211,238,0.2)', boxShadow: '0 0 10px rgba(34,211,238,0.2) inset' }}
    />

    {/* Ring 3 — fast CCW */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      className="absolute w-24 h-24 rounded-full"
      style={{ border: '2px solid transparent', borderTopColor: 'rgba(34,211,238,1)', borderLeftColor: 'rgba(34,211,238,0.4)' }}
    />

    {/* Conic sweep */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      className="absolute w-32 h-32 rounded-full"
      style={{ background: 'conic-gradient(from 0deg, rgba(34,211,238,0.5) 0%, rgba(34,211,238,0.1) 25%, transparent 45%)' }}
    />

    {/* Ring 4 — morphing blob ring */}
    <motion.div
      animate={{ borderRadius: ['30% 70% 70% 30%/30% 30% 70% 70%', '70% 30% 30% 70%/70% 70% 30% 30%', '30% 70% 70% 30%/30% 30% 70% 70%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute w-16 h-16 border border-cyan-500"
      style={{ boxShadow: '0 0 10px rgba(34,211,238,0.3)' }}
    />

    {/* Core */}
    <motion.div
      animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-9 h-9 rounded-full bg-cyan-300"
      style={{ boxShadow: '0 0 12px #fff, 0 0 30px rgba(34,211,238,1), 0 0 60px rgba(34,211,238,0.7), 0 0 90px rgba(34,211,238,0.3)' }}
    >
      <div className="absolute inset-1 rounded-full bg-cyan-950" />
      <div className="absolute inset-2 rounded-full bg-cyan-300 opacity-80" />
    </motion.div>
  </div>
);

/* ─── Radar ─── */
const Radar = () => {
  const blips = [
    { top: '28%', left: '62%', color: 'bg-red-500' },
    { top: '65%', left: '22%', color: 'bg-cyan-400' },
    { top: '45%', left: '75%', color: 'bg-yellow-400' },
    { top: '72%', left: '58%', color: 'bg-cyan-400' },
  ];
  return (
    <div className="relative w-36 h-36 mx-auto mt-2">
      {[36, 27, 18, 9].map((r, i) => (
        <div key={i} className="absolute rounded-full border border-cyan-900 opacity-60"
          style={{ width: r * 4, height: r * 4, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-cyan-900 opacity-40" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-full w-px bg-cyan-900 opacity-40" />
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(34,211,238,0.5) 0%, rgba(34,211,238,0.15) 20%, transparent 45%)' }}
      />
      {blips.map((b, i) => (
        <motion.div key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}
          className={`absolute w-1.5 h-1.5 rounded-full ${b.color}`}
          style={{ top: b.top, left: b.left, boxShadow: '0 0 6px currentColor' }}
        />
      ))}
    </div>
  );
};

/* ─── Segmented Bar ─── */
const SegBar = ({ label, value, accent = '#22d3ee' }) => {
  const segments = 24;
  const filled = Math.round((value / 100) * segments);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] tracking-widest text-cyan-700">
        <span>{label}</span>
        <span style={{ color: accent }}>{value}%</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-sm"
            style={{ background: i < filled ? accent : 'rgba(34,211,238,0.1)', boxShadow: i < filled ? `0 0 4px ${accent}` : 'none' }}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Hex Background ─── */
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

/* ─── Circuit Lines decoration ─── */
const CircuitLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="30%" x2="8%" y2="30%" stroke="#22d3ee" strokeWidth="0.5" />
    <line x1="8%" y1="30%" x2="8%" y2="45%" stroke="#22d3ee" strokeWidth="0.5" />
    <circle cx="8%" cy="45%" r="2" fill="#22d3ee" />
    <line x1="92%" y1="55%" x2="100%" y2="55%" stroke="#22d3ee" strokeWidth="0.5" />
    <line x1="92%" y1="40%" x2="92%" y2="55%" stroke="#22d3ee" strokeWidth="0.5" />
    <circle cx="92%" cy="40%" r="2" fill="#22d3ee" />
    <line x1="20%" y1="0" x2="20%" y2="3%" stroke="#22d3ee" strokeWidth="0.5" />
    <line x1="75%" y1="97%" x2="75%" y2="100%" stroke="#22d3ee" strokeWidth="0.5" />
    <line x1="50%" y1="0" x2="50%" y2="1.5%" stroke="#22d3ee" strokeWidth="1" />
    <circle cx="50%" cy="1.5%" r="2" fill="#22d3ee" />
  </svg>
);

/* ─── Targeting Reticle ─── */
const TargetReticle = () => (
  <div className="relative w-32 h-32 mx-auto">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 rounded-full"
      style={{ border: '1px dashed rgba(34,211,238,0.3)' }}
    />
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-4 rounded-full border border-cyan-700"
      style={{ borderTopColor: 'rgba(34,211,238,0.9)', borderBottomColor: 'rgba(34,211,238,0.9)' }}
    />
    {/* Corner brackets */}
    {[['top-0 left-0', 'border-t border-l'], ['top-0 right-0', 'border-t border-r'], ['bottom-0 left-0', 'border-b border-l'], ['bottom-0 right-0', 'border-b border-r']].map(([pos, border], i) => (
      <div key={i} className={`absolute ${pos} w-4 h-4 ${border} border-cyan-400`} />
    ))}
    {/* Center crosshairs */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-px bg-cyan-900 opacity-50" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-full w-px bg-cyan-900 opacity-50" />
    </div>
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-red-500"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 0 10px #ef4444' }}
    />
  </div>
);

/* ─── Network Activity Bars ─── */
const NetBars = () => {
  const [bars, setBars] = useState(Array.from({ length: 24 }, () => Math.random()));
  useEffect(() => {
    const t = setInterval(() => setBars(prev => [...prev.slice(1), Math.random()]), 300);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      <div className="text-[10px] tracking-widest text-cyan-700 mb-1">NET ACTIVITY</div>
      <div className="flex items-end gap-0.5 h-10">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 bg-cyan-400 rounded-sm transition-all duration-300"
            style={{ height: `${v * 100}%`, opacity: 0.3 + v * 0.7, boxShadow: v > 0.7 ? '0 0 4px #22d3ee' : 'none' }}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── HUD Corner Accent ─── */
const HudCorner = ({ pos }) => {
  const classes = {
    tl: 'top-0 left-0 border-t-2 border-l-2',
    tr: 'top-0 right-0 border-t-2 border-r-2',
    bl: 'bottom-0 left-0 border-b-2 border-l-2',
    br: 'bottom-0 right-0 border-b-2 border-r-2',
  };
  return <div className={`absolute ${classes[pos]} w-8 h-8 border-cyan-400`} style={{ boxShadow: '0 0 6px rgba(34,211,238,0.4)' }} />;
};

/* ─── Main App ─── */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [cpuVal] = useState(37);
  const [ramVal] = useState(62);
  const [netVal] = useState(81);
  const [pwr] = useState(100);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = window.speechSynthesis.getVoices();
      const brit = v.find(x => x.lang.includes('en-GB') || x.name.includes('UK'));
      if (brit) u.voice = brit;
      u.pitch = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const fetchTasks = () => {
    fetch('https://task-api-xo97.onrender.com/tasks')
      .then(r => r.json())
      .then(d => setTasks(d))
      .catch(e => console.error('API Error:', e));
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    speak('Directive logged.');
    fetch('https://task-api-xo97.onrender.com/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle }),
    }).then(() => { setNewTaskTitle(''); fetchTasks(); });
  };

  const handleDelete = (id) => {
    speak('Directive purged.');
    fetch(`https://task-api-xo97.onrender.com/tasks/${id}`, { method: 'DELETE' })
      .then(() => fetchTasks());
  };

  return (
    <div className="min-h-screen bg-black font-mono text-cyan-400 overflow-hidden relative">
      {/* ── BG LAYERS ── */}
      <HexGrid />
      <CircuitLines />

      {/* Binary stream */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <motion.div
          animate={{ y: [0, -1800] }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="text-[10px] text-cyan-400 leading-4 whitespace-pre-wrap break-all p-4"
        >
          {Array.from({ length: 400 }).map(() => Math.random().toString(2).substring(2, 18)).join(' ')}
        </motion.div>
      </div>

      {/* Horizontal scan line */}
      <motion.div
        animate={{ top: ['-2%', '102%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 w-full h-px pointer-events-none z-50"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)' }}
      />

      {/* ── OUTER FRAME ── */}
      <div className="relative z-10 p-3 h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-2 px-2 text-[10px] tracking-[0.3em] text-cyan-800 border-b border-cyan-950 pb-2">
          <span>STARK INDUSTRIES // CLASSIFIED</span>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-red-500">● LIVE FEED</motion.span>
          <span>MARK VIII // J.A.R.V.I.S. v4.2</span>
        </div>

        {/* Three-column main grid */}
        <div className="flex-1 grid grid-cols-[260px_1fr_220px] gap-3 min-h-0">

          {/* ═══ LEFT PANEL ═══ */}
          <div className="border border-cyan-900 relative p-4 flex flex-col gap-5 overflow-hidden"
            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.04) inset' }}>
            <HudCorner pos="tl" /><HudCorner pos="tr" /><HudCorner pos="bl" /><HudCorner pos="br" />

            <div className="text-[10px] tracking-[0.25em] text-cyan-700 border-b border-cyan-950 pb-2">
              POWER CORE // DIAGNOSTICS
            </div>

            <ArcReactor />

            {/* System stats */}
            <div className="space-y-3">
              <SegBar label="CPU LOAD" value={cpuVal} />
              <SegBar label="RAM USAGE" value={ramVal} />
              <SegBar label="NET THROUGHPUT" value={netVal} accent="#f97316" />
              <SegBar label="ARC OUTPUT" value={pwr} accent="#22d3ee" />
            </div>

            {/* Status lines */}
            <div className="space-y-1.5 text-[10px] tracking-widest border-t border-cyan-950 pt-3">
              <div className="flex justify-between"><span className="text-cyan-800">NEURAL LINK</span><span className="text-green-400">ESTABLISHED</span></div>
              <div className="flex justify-between"><span className="text-cyan-800">ENCRYPTION</span><span className="text-cyan-400">AES-256</span></div>
              <div className="flex justify-between"><span className="text-cyan-800">FIGHT SYS</span><span className="text-cyan-700">OFFLINE</span></div>
              <div className="flex justify-between"><span className="text-cyan-800">REPULSOR</span><motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-red-500">CHARGING</motion.span></div>
            </div>

            {/* Radar */}
            <div className="border-t border-cyan-950 pt-3">
              <div className="text-[10px] tracking-[0.25em] text-cyan-700 mb-2">PROXIMITY SCAN</div>
              <Radar />
            </div>
          </div>

          {/* ═══ CENTER PANEL ═══ */}
          <div className="border border-cyan-900 relative p-5 flex flex-col gap-4 overflow-hidden"
            style={{ boxShadow: '0 0 30px rgba(34,211,238,0.05) inset' }}>
            <HudCorner pos="tl" /><HudCorner pos="tr" /><HudCorner pos="bl" /><HudCorner pos="br" />

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-cyan-900 pb-4">
              <div>
                <div className="text-[10px] tracking-[0.4em] text-cyan-700 mb-1">// OPERATIONAL INTERFACE</div>
                <motion.h1
                  animate={{ textShadow: ['0 0 10px rgba(34,211,238,0.5)', '0 0 30px rgba(34,211,238,0.9)', '0 0 10px rgba(34,211,238,0.5)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl tracking-[0.2em] font-bold text-cyan-300"
                >
                  J.A.R.V.I.S.
                </motion.h1>
                <div className="text-xs tracking-[0.35em] text-cyan-700 mt-0.5">DIRECTIVE MANAGEMENT PROTOCOL</div>
              </div>
              <div className="text-right space-y-1">
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-2 text-xs tracking-widest text-red-400"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full" style={{ boxShadow: '0 0 6px #ef4444' }} />
                  SYSTEM ACTIVE
                </motion.div>
                <div className="text-[10px] text-cyan-800 tracking-widest">LOCATION: GHZ // IN</div>
                <div className="text-[10px] text-cyan-800 tracking-widest">UPLINK: SECURE</div>
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleCreate}
              className="flex gap-3 border border-cyan-800 bg-cyan-950/10 p-3 relative"
              style={{ boxShadow: '0 0 15px rgba(34,211,238,0.05) inset' }}>
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500" />
              <span className="text-cyan-500 mt-2 text-xs">&gt;_</span>
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="AWAITING DIRECTIVE..."
                required
                className="flex-1 bg-transparent border-b border-cyan-800 text-cyan-200 px-2 py-1 outline-none focus:border-cyan-400 transition-all uppercase placeholder-cyan-900 text-sm tracking-widest"
              />
              <button type="submit"
                className="border border-cyan-600 px-6 py-2 text-xs tracking-[0.2em] font-bold hover:bg-cyan-900/40 hover:border-cyan-300 hover:text-cyan-200 transition-all relative"
                style={{ boxShadow: '0 0 10px rgba(34,211,238,0.1)' }}>
                EXECUTE
              </button>
            </form>

            {/* Directive count badge */}
            <div className="flex items-center gap-4 text-[10px] tracking-widest text-cyan-800">
              <span>ACTIVE DIRECTIVES:</span>
              <span className="text-cyan-400 text-sm font-bold">{tasks.length}</span>
              <div className="flex-1 h-px bg-cyan-950" />
              <span className="text-cyan-900">PRIORITY: HIGH</span>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-48 gap-3"
                  >
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-cyan-800 tracking-[0.3em] text-sm"
                    >
                      NO PENDING DIRECTIVES
                    </motion.div>
                    <div className="text-[10px] text-cyan-900 tracking-widest">SYSTEM STANDING BY...</div>
                  </motion.div>
                ) : (
                  tasks.map((task, idx) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, x: -40, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, x: 80, filter: 'blur(6px)' }}
                      transition={{ duration: 0.35, delay: idx * 0.06 }}
                      className="flex justify-between items-center border border-cyan-900 bg-cyan-950/15 p-4 hover:border-cyan-600 hover:bg-cyan-950/30 transition-all group relative"
                      style={{ boxShadow: 'inset 0 0 20px rgba(34,211,238,0.02)' }}
                    >
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-700 group-hover:border-cyan-400 transition-colors" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-700 group-hover:border-cyan-400 transition-colors" />

                      {/* Index + title */}
                      <div className="flex items-center gap-4">
                        <span className="text-cyan-800 text-xs w-6 text-right">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="w-1 h-6 bg-cyan-800 group-hover:bg-cyan-500 transition-colors" />
                        <span className="text-cyan-200 tracking-wider uppercase text-sm group-hover:text-cyan-50 transition-colors">
                          {task.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(task._id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500/70 hover:text-red-400 border border-red-500/30 hover:border-red-400 hover:bg-red-950/30 px-3 py-1 text-[10px] tracking-[0.2em] font-bold transition-all"
                      >
                        PURGE
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ═══ RIGHT PANEL ═══ */}
          <div className="border border-cyan-900 relative p-4 flex flex-col gap-5 overflow-hidden"
            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.04) inset' }}>
            <HudCorner pos="tl" /><HudCorner pos="tr" /><HudCorner pos="bl" /><HudCorner pos="br" />

            <div className="text-[10px] tracking-[0.25em] text-cyan-700 border-b border-cyan-950 pb-2">
              SITUATIONAL AWARENESS
            </div>

            <LiveClock />

            {/* Status chips */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] tracking-widest">
              {[
                { label: 'SYS.MGR', color: 'border-cyan-800 text-cyan-600' },
                { label: 'API.CON', color: 'border-cyan-800 text-cyan-600' },
                { label: 'WAR.DRV', color: 'border-red-800 text-red-500 animate-pulse' },
                { label: 'NET.MON', color: 'border-cyan-800 text-cyan-600' },
              ].map((chip, i) => (
                <div key={i} className={`border px-2 py-1 text-center ${chip.color}`}>{chip.label}</div>
              ))}
            </div>

            {/* Targeting Reticle */}
            <div className="border-t border-cyan-950 pt-3">
              <div className="text-[10px] tracking-[0.25em] text-cyan-700 mb-2">TARGETING GRID</div>
              <TargetReticle />
              <div className="mt-2 text-[9px] text-cyan-900 tracking-widest text-center">
                LOCK: ACQUISITION IN PROGRESS
              </div>
            </div>

            {/* Network activity */}
            <div className="border-t border-cyan-950 pt-3">
              <NetBars />
            </div>

            {/* Global status */}
            <div className="border-t border-cyan-950 pt-3 space-y-2 text-[10px] tracking-widest mt-auto">
              <div className="flex justify-between"><span className="text-cyan-900">GLOBAL NET</span><span className="text-green-400">ACTIVE</span></div>
              <div className="flex justify-between"><span className="text-cyan-900">THREAT LVL</span><span className="text-yellow-400">MODERATE</span></div>
              <div className="flex justify-between"><span className="text-cyan-900">SHIELD</span><motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="text-cyan-400">ONLINE</motion.span></div>
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="flex justify-between items-center mt-2 px-2 text-[9px] tracking-[0.25em] text-cyan-900 border-t border-cyan-950 pt-2">
          <span>91.219.164.5 // UPLINK SECURE</span>
          <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
            ◈ ALL SYSTEMS NOMINAL ◈
          </motion.span>
          <span>BUILD 4.2.1 // CLEARED LEVEL 7</span>
        </div>
      </div>
    </div>
  );
}