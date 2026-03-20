import { useState } from 'react'
import Interview from './Interview'
import CodingInterview from './CodingInterview'
import VideoInterview from './VideoInterview'

function App() {
  const [mode, setMode] = useState('home')

  if (mode === 'chat') return <Interview onHome={() => setMode('home')} />
  if (mode === 'coding') return <CodingInterview onHome={() => setMode('home')} />
  if (mode === 'video') return <VideoInterview onHome={() => setMode('home')} />

  return (
    <div className="min-h-screen bg-violet-50" style={{
      backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(109,40,217,0.06) 0%, transparent 60%)'
    }}>

      {/* Nav */}
      <nav className="border-b border-violet-100 bg-white bg-opacity-70 backdrop-blur-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">IV</span>
          </div>
          <span className="font-semibold text-violet-950 tracking-tight">InterviewOS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-xs text-violet-400 font-medium">All systems operational</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-violet-200">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
          AI-Powered Interview Preparation
        </div>
        <h1 className="text-5xl font-bold text-violet-950 tracking-tight leading-tight mb-5">
          Practice like it's the<br />
          <span className="text-violet-600">real interview</span>
        </h1>
        <p className="text-violet-400 text-lg max-w-xl mx-auto leading-relaxed">
          Adaptive questioning, behavioral intelligence, and real-time feedback — built for top-tier company interviews.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-3 gap-5">

          <div onClick={() => setMode('chat')}
            className="group bg-white border border-violet-100 hover:border-violet-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-violet-100">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-5">
              <span className="text-violet-600 text-lg">💬</span>
            </div>
            <h2 className="text-violet-950 font-semibold text-lg mb-2 tracking-tight">Chat Interview</h2>
            <p className="text-violet-400 text-sm leading-relaxed mb-5">
              Answer adaptive questions conversationally. Your typing patterns reveal your confidence in real time.
            </p>
            <div className="space-y-2 mb-6">
              {['Confidence detection', 'Smart follow-ups', 'Adaptive difficulty', 'Company profiles'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-violet-400">
                  <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                  {f}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-violet-600 text-sm font-semibold group-hover:gap-3 transition-all">
              Begin session <span>→</span>
            </div>
          </div>

          <div onClick={() => setMode('coding')}
            className="group bg-white border border-violet-100 hover:border-purple-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-purple-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-5">
              <span className="text-purple-600 text-lg">💻</span>
            </div>
            <h2 className="text-violet-950 font-semibold text-lg mb-2 tracking-tight">Coding Interview</h2>
            <p className="text-violet-400 text-sm leading-relaxed mb-5">
              Solve problems in a professional editor. AI evaluates your solution for correctness and complexity.
            </p>
            <div className="space-y-2 mb-6">
              {['Monaco code editor', 'Test case validation', 'Complexity analysis', 'AI hints'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-violet-400">
                  <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                  {f}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-purple-600 text-sm font-semibold group-hover:gap-3 transition-all">
              Begin session <span>→</span>
            </div>
          </div>

          <div onClick={() => setMode('video')}
            className="group bg-white border border-violet-100 hover:border-fuchsia-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-fuchsia-100">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center mb-5">
              <span className="text-fuchsia-600 text-lg">🎥</span>
            </div>
            <h2 className="text-violet-950 font-semibold text-lg mb-2 tracking-tight">Video Interview</h2>
            <p className="text-violet-400 text-sm leading-relaxed mb-5">
              Face the camera under timed conditions. Simulate the full pressure of an in-person technical round.
            </p>
            <div className="space-y-2 mb-6">
              {['Live webcam feed', 'Timed questions', 'Pressure simulation', 'Company mode'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-violet-400">
                  <div className="w-1 h-1 rounded-full bg-fuchsia-400"></div>
                  {f}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-fuchsia-600 text-sm font-semibold group-hover:gap-3 transition-all">
              Coming soon <span>→</span>
            </div>
          </div>

        </div>

        {/* Bottom stats */}
        <div className="mt-12 pt-8 border-t border-violet-100 grid grid-cols-4 gap-6 text-center">
          {[
            { val: '3', label: 'Interview modes' },
            { val: 'Google · Amazon · Microsoft', label: 'Company profiles' },
            { val: 'Real-time', label: 'Behavioral analysis' },
            { val: 'Adaptive', label: 'Difficulty engine' }
          ].map(s => (
            <div key={s.label}>
              <div className="text-violet-950 font-semibold text-sm mb-1">{s.val}</div>
              <div className="text-violet-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default App