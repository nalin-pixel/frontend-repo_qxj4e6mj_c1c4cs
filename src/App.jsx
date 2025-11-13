import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, CalendarDays, Clock, MapPin, Plus, Loader2, Sparkles, CheckCircle2, PlayCircle, PauseCircle, Brain, Layers3 } from 'lucide-react'
import Spline from '@splinetool/react-spline'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-blue-900/60 to-slate-900/60 border border-white/10 p-4">
      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-300/70">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

function ProgressRing({ progress = 0, size = 80, stroke = 8 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={radius} strokeWidth={stroke} className="fill-none stroke-slate-700/40" />
      <circle cx={size/2} cy={size/2} r={radius} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} className="fill-none stroke-blue-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]" strokeLinecap="round" />
    </svg>
  )
}

function TimetableCard({ item }) {
  return (
    <motion.div layout className="rounded-xl bg-slate-900/70 border border-white/10 p-4 hover:border-blue-500/40 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-white font-semibold leading-tight">{item.title}</h4>
          <p className="text-xs text-slate-300/70">{item.course}</p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">Priority {item.priority ?? 3}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-300/80">
        <div className="flex items-center gap-1.5"><CalendarDays size={14} /> {item.day}</div>
        <div className="flex items-center gap-1.5"><Clock size={14} /> {item.start_time} - {item.end_time}</div>
        {item.location ? (
          <div className="flex items-center gap-1.5"><MapPin size={14} /> {item.location}</div>
        ) : <div />}
      </div>
      {item.notes && <p className="mt-3 text-sm text-slate-300/90">{item.notes}</p>}
    </motion.div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const [entries, setEntries] = useState([])
  const [dayFilter, setDayFilter] = useState('')
  const [form, setForm] = useState({
    title: '', course: '', day: 'Mon', start_time: '09:00', end_time: '10:00', location: '', notes: '', priority: 3,
  })
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const filtered = useMemo(() => {
    return dayFilter ? entries.filter(e => e.day === dayFilter) : entries
  }, [entries, dayFilter])

  const progress = Math.min(100, Math.round((filtered.length / Math.max(1, entries.length)) * 100))

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const url = `${backend}/api/timetable${dayFilter ? `?day=${encodeURIComponent(dayFilter)}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.ok) setEntries(data.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayFilter])

  const addEntry = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await fetch(`${backend}/api/timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.ok) {
        setForm({ title: '', course: '', day: form.day, start_time: '09:00', end_time: '10:00', location: '', notes: '', priority: 3 })
        fetchEntries()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1020] selection:bg-blue-500/30 selection:text-white">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020]/20 via-[#0b1020]/70 to-[#0b1020] pointer-events-none" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-300/20 text-blue-200 text-xs">
              <Sparkles size={14} /> Voice-powered study assistant
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-300">
              StudyMate AI
            </h1>
            <p className="mt-3 md:mt-4 text-slate-300/90 text-sm md:text-base">
              Plan smarter. Learn faster. A modern blue-and-black workspace for engineering students.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <button onClick={() => setVoiceActive(v => !v)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition-all ${voiceActive ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-slate-900/70 text-blue-200 border-white/10 hover:border-blue-400/30'}`}>
                {voiceActive ? <PauseCircle size={18} /> : <PlayCircle size={18} />} Voice Command
              </button>
              <a href="/test" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-slate-900/70 text-slate-200 border border-white/10 hover:border-blue-400/30">Check backend</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="relative px-6 md:px-10 -mt-16 md:-mt-24">
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard icon={CalendarDays} label="This Week Sessions" value={`${entries.length}`} />
          <StatCard icon={Brain} label="Focus Score" value="82" />
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-blue-900/60 to-slate-900/60 border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300"><Layers3 size={20} /></div>
              <div>
                <p className="text-xs text-slate-300/70">Daily Progress</p>
                <p className="text-lg font-semibold text-white">{progress}%</p>
              </div>
            </div>
            <ProgressRing progress={progress} />
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Timetable */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h3 className="text-white text-xl font-semibold flex items-center gap-2"><CalendarDays size={20} /> Timetable</h3>
              <div className="flex items-center gap-2">
                {['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <button key={d || 'all'} onClick={() => setDayFilter(d)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${dayFilter === d ? 'bg-blue-500/30 text-blue-100 border-blue-500/50' : 'bg-slate-800/60 text-slate-300 border-white/10 hover:border-blue-400/30'}`}>
                    {d || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 flex items-center justify-center text-slate-300 py-10"><Loader2 className="animate-spin mr-2" /> Loading...</div>
              ) : filtered.length ? (
                filtered.map((it) => <TimetableCard key={it._id} item={it} />)
              ) : (
                <div className="col-span-2 text-center text-slate-400 text-sm py-8">No sessions yet. Add your first one below.</div>
              )}
            </div>
          </div>

          {/* Quick Add */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <h3 className="text-white text-xl font-semibold flex items-center gap-2"><Plus size={20} /> Quick Add</h3>
            <form onSubmit={addEntry} className="mt-4 space-y-3">
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Title" className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50" required />
              <input value={form.course} onChange={e=>setForm(f=>({...f,course:e.target.value}))} placeholder="Course" className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50" required />
              <div className="grid grid-cols-3 gap-2">
                <select value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))} className="col-span-1 rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} className="col-span-1 rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50" />
                <input type="time" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))} className="col-span-1 rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50" />
              </div>
              <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Location (optional)" className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50" />
              <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notes (optional)" rows={3} className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Mic size={16} className="text-blue-300" /> Voice entry coming soon
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-300" /> Auto AI summaries next
                </div>
              </div>
              <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white border border-blue-400/40 shadow-[0_10px_30px_rgba(37,99,235,0.25)] hover:brightness-110 disabled:opacity-60">
                {loading && <Loader2 className="animate-spin" size={16} />} Add Session
              </button>
            </form>
          </div>
        </div>

        {/* Notes Summarizer (text) */}
        <NotesSummarizer backend={backend} />
      </section>

      <footer className="mt-16 px-6 md:px-10 py-10 text-center text-slate-400 text-xs">
        Built for real-time, cross-platform study flow. Future: voice I/O, OCR, tutoring, and sync.
      </footer>
    </div>
  )
}

function NotesSummarizer({ backend }) {
  const [title, setTitle] = useState('Thermo: Second Law overview')
  const [content, setContent] = useState('In a cyclic process the entropy of the universe increases...')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const onSummarize = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${backend}/api/notes/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      const data = await res.json()
      if (data.ok) setSummary(data.summary || '')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-xl font-semibold flex items-center gap-2"><Sparkles size={20} /> Notes Summarizer</h3>
      </div>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50" />
          <textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} placeholder="Paste text here, PDF text, or transcription..." className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400/50" />
          <button onClick={onSummarize} disabled={loading} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-slate-800/80 text-blue-100 border border-white/10 hover:border-blue-400/30 disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Summarize
          </button>
        </div>
        <div className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-slate-200 min-h-[160px]">
          {summary ? summary : <span className="text-slate-400 text-sm">Summary will appear here.</span>}
        </div>
      </div>
    </div>
  )
}
