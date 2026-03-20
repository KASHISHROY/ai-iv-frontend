import { useState, useEffect, useRef } from 'react'

const COMPANIES = ['Google', 'Amazon', 'Microsoft']
const TOPICS = ['Arrays', 'System Design', 'Behavioral', 'Dynamic Programming']
const QUESTION_TIME = 120

export default function VideoInterview({ onHome }) {
  const [screen, setScreen] = useState('setup')
  const [company, setCompany] = useState('Google')
  const [topic, setTopic] = useState('Behavioral')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [webcamActive, setWebcamActive] = useState(false)
  const [webcamError, setWebcamError] = useState(false)
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [questionCount, setQuestionCount] = useState(5)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setWebcamActive(true)
    } catch (err) {
      setWebcamError(true)
    }
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setWebcamActive(false)
  }

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const fetched = []
      for (let i = 0; i < questionCount; i++) {
        const res = await fetch('https://ai-iv-backend.onrender.com/start-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company, topic })
        })
        const data = await res.json()
        fetched.push(data.question.question)
      }
      setQuestions(fetched)
      setNotes(new Array(fetched.length).fill(''))
      await startWebcam()
      setScreen('interview')
      setCurrentIndex(0)
      setTimeLeft(QUESTION_TIME)
    } catch (err) {
      alert('Backend not reachable!')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (screen !== 'interview') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion()
          return QUESTION_TIME
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen, currentIndex])

  const handleNextQuestion = () => {
    clearInterval(timerRef.current)
    setNotes(prev => {
      const updated = [...prev]
      updated[currentIndex] = currentNote
      return updated
    })
    setCurrentNote('')
    if (currentIndex + 1 >= questions.length) {
      stopWebcam()
      setScreen('summary')
    } else {
      setCurrentIndex(prev => prev + 1)
      setTimeLeft(QUESTION_TIME)
    }
  }

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const progressPct = ((QUESTION_TIME - timeLeft) / QUESTION_TIME) * 100

  // SETUP SCREEN
  if (screen === 'setup') return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4" style={{
      backgroundImage: 'radial-gradient(ellipse at 60% 30%, rgba(139,92,246,0.08) 0%, transparent 60%)'
    }}>
      <div className="w-full max-w-md">
        <button onClick={onHome}
          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-600 text-sm mb-8 transition-colors">
          ← Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-fuchsia-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">IV</span>
            </div>
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">InterviewOS</span>
          </div>
          <h1 className="text-2xl font-bold text-violet-950 tracking-tight mb-1">Video Interview</h1>
          <p className="text-violet-400 text-sm">Simulate a real interview under camera pressure</p>
        </div>

        <div className="bg-white border border-violet-100 rounded-2xl p-6 shadow-sm space-y-6">

          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">Company</label>
            <div className="flex gap-2">
              {COMPANIES.map(c => (
                <button key={c} onClick={() => setCompany(c)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    company === c
                      ? 'bg-fuchsia-600 border-fuchsia-600 text-white'
                      : 'bg-violet-50 border-violet-200 text-violet-600 hover:border-violet-400'
                  }`}>{c}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">Topic</label>
            <select value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full bg-violet-50 border border-violet-200 text-violet-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 transition-colors">
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">
              Number of Questions — {questionCount}
            </label>
            <input type="range" min="3" max="10" value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full accent-fuchsia-600" />
            <div className="flex justify-between text-xs text-violet-400 mt-1">
              <span>3 min</span>
              <span>~{questionCount * 2} min total</span>
              <span>10 max</span>
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2">
            <p className="text-violet-500 text-xs font-semibold uppercase tracking-wider mb-2">How it works</p>
            {[
              '2 minutes per question — timer counts down live',
              'Your webcam turns on — answer out loud',
              'Take notes in the text box if needed',
              'Skip anytime or let timer auto-advance'
            ].map(s => (
              <div key={s} className="flex items-start gap-2 text-xs text-violet-400">
                <div className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></div>
                {s}
              </div>
            ))}
          </div>

          <button onClick={fetchQuestions} disabled={loading}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            {loading ? `Loading ${questionCount} questions...` : `Start ${company} Video Interview →`}
          </button>

        </div>
      </div>
    </div>
  )

  // INTERVIEW SCREEN
  if (screen === 'interview') return (
    <div className="min-h-screen bg-violet-950 flex flex-col">

      {/* Header */}
      <div className="border-b border-violet-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-fuchsia-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">IV</span>
          </div>
          <span className="text-white font-semibold text-sm">{company} Video Interview</span>
          <span className="text-violet-400 text-xs">· {topic}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-violet-400 text-xs">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className={`font-mono font-bold text-sm px-3 py-1.5 rounded-lg border ${
            timeLeft <= 15
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : timeLeft <= 30
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>{formatTime(timeLeft)}</div>
          <button onClick={() => { stopWebcam(); onHome() }}
            className="text-violet-500 hover:text-violet-300 text-xs transition-colors">
            ← Exit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-violet-800">
        <div className="h-full bg-fuchsia-500 transition-all duration-1000"
          style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Question + Notes */}
        <div className="flex-1 flex flex-col justify-between p-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-fuchsia-400 text-xs font-semibold uppercase tracking-wider">
                Question {currentIndex + 1}
              </span>
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentIndex ? 'bg-fuchsia-500' :
                    i === currentIndex ? 'bg-white' :
                    'bg-violet-700'
                  }`} />
                ))}
              </div>
            </div>

            <p className="text-white text-xl font-medium leading-relaxed mb-8">
              {questions[currentIndex]}
            </p>

            <p className="text-violet-500 text-sm mb-3">
              Answer out loud — jot key points below if needed
            </p>
            <textarea
              value={currentNote}
              onChange={e => setCurrentNote(e.target.value)}
              placeholder="Optional notes..."
              rows={4}
              className="w-full bg-violet-900 border border-violet-700 text-violet-200 placeholder-violet-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500 resize-none transition-colors"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleNextQuestion}
              className="flex-1 bg-violet-800 hover:bg-violet-700 border border-violet-700 text-violet-300 font-medium py-3 rounded-xl text-sm transition-colors">
              Skip →
            </button>
            <button onClick={handleNextQuestion}
              className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              {currentIndex + 1 >= questions.length ? 'Finish Session →' : 'Next Question →'}
            </button>
          </div>
        </div>

        {/* RIGHT — Webcam */}
        <div className="w-80 border-l border-violet-800 p-5 flex flex-col gap-4">

          {/* Webcam */}
          <div className="relative rounded-2xl overflow-hidden bg-violet-900 border border-violet-700 aspect-video">
            {webcamActive ? (
              <video ref={videoRef} autoPlay muted playsInline
                className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-violet-500 text-xs">
                    {webcamError ? 'Camera unavailable' : 'Starting camera...'}
                  </p>
                </div>
              </div>
            )}
            {webcamActive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black bg-opacity-60 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-white text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="bg-violet-900 border border-violet-700 rounded-2xl p-4 text-center">
            <p className="text-violet-500 text-xs uppercase tracking-wider mb-2">Time remaining</p>
            <div className={`text-3xl font-mono font-bold ${
              timeLeft <= 15 ? 'text-rose-400' :
              timeLeft <= 30 ? 'text-amber-400' :
              'text-emerald-400'
            }`}>{formatTime(timeLeft)}</div>
            <div className="mt-3 h-1.5 bg-violet-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${
                timeLeft <= 15 ? 'bg-rose-500' :
                timeLeft <= 30 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`} style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }} />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-violet-900 border border-violet-700 rounded-2xl p-4">
            <p className="text-violet-500 text-xs uppercase tracking-wider mb-3">Interview tips</p>
            <div className="space-y-2">
              {[
                'Maintain eye contact with camera',
                'Speak clearly and at steady pace',
                'Use STAR format for behavioral',
                'Think aloud — show your process'
              ].map(t => (
                <div key={t} className="flex items-start gap-2 text-xs text-violet-400">
                  <div className="w-1 h-1 rounded-full bg-fuchsia-500 mt-1.5 flex-shrink-0"></div>
                  {t}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )

  // SUMMARY SCREEN
  return (
    <div className="min-h-screen bg-violet-50 p-6" style={{
      backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)'
    }}>
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-fuchsia-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">IV</span>
              </div>
              <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">InterviewOS</span>
            </div>
            <h1 className="text-2xl font-bold text-violet-950 tracking-tight">Session Complete</h1>
            <p className="text-violet-400 text-sm mt-1">
              {company} · {questions.length} questions · {topic}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              setScreen('setup'); setQuestions([])
              setCurrentIndex(0); setCurrentNote('')
            }}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
              New Session
            </button>
            <button onClick={onHome}
              className="bg-white border border-violet-200 hover:border-violet-400 text-violet-600 px-4 py-2 rounded-xl text-sm transition-colors">
              ← Home
            </button>
          </div>
        </div>

        {/* Completion card */}
        <div className="bg-white border border-violet-100 rounded-2xl p-8 mb-5 shadow-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-violet-950 font-bold text-xl mb-2">
            You completed all {questions.length} questions
          </h2>
          <p className="text-violet-400 text-sm">
            Review your notes below and reflect on each answer
          </p>
        </div>

        {/* Questions + notes */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-fuchsia-500 text-xs font-semibold uppercase tracking-wider">
                  Question {i + 1}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-emerald-500 text-xs font-medium">Completed</span>
              </div>
              <p className="text-violet-900 text-sm font-medium leading-relaxed mb-3">{q}</p>
              {notes[i] ? (
                <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5">
                  <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">Your notes</p>
                  <p className="text-violet-600 text-xs leading-relaxed">{notes[i]}</p>
                </div>
              ) : (
                <p className="text-violet-300 text-xs italic">No notes taken</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => {
            setScreen('setup'); setQuestions([])
            setCurrentIndex(0); setCurrentNote('')
          }}
            className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
            Practice Again
          </button>
          <button onClick={onHome}
            className="flex-1 bg-white border border-violet-200 hover:border-violet-400 text-violet-600 font-semibold py-3 rounded-xl text-sm transition-colors">
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  )
}