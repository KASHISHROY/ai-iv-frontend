import { useState, useEffect } from 'react'
import Feedback from './Feedback'

const COMPANIES = ['Google', 'Amazon', 'Microsoft']
const TOPICS = ['Arrays', 'Trees', 'System Design', 'Behavioral', 'Dynamic Programming']

export default function Interview({ onHome }) {
  const [screen, setScreen] = useState('setup')
  const [company, setCompany] = useState('Google')
  const [topic, setTopic] = useState('Arrays')
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [chat, setChat] = useState([])
  const [difficulty, setDifficulty] = useState(5)
  const [sessionFeedback, setSessionFeedback] = useState([])
  const [isFollowUp, setIsFollowUp] = useState(false)
  const [keystrokes, setKeystrokes] = useState(0)
  const [backspaces, setBackspaces] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let interval = null
    if (isTyping && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.round((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTyping, startTime])

  const startInterview = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://ai-iv-backend.onrender.com/start-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, topic })
      })
      const data = await res.json()
      setCurrentQuestion(data.question)
      setIsFollowUp(false)
      setChat([{ role: 'interviewer', text: data.question.question, type: data.question.type }])
      setScreen('interview')
    } catch (err) {
      alert('Backend not reachable.')
    }
    setLoading(false)
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setLoading(true)
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
    setKeystrokes(0); setBackspaces(0); setStartTime(null); setIsTyping(false); setElapsed(0)
    const savedAnswer = answer
    setChat(prev => [...prev, { role: 'candidate', text: answer }])
    setAnswer('')
    try {
      const res = await fetch('https://ai-iv-backend.onrender.com/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: savedAnswer,
          company,
          previousQuestions: chat.filter(m => m.role === 'interviewer').map(m => m.text),
          currentDifficulty: difficulty,
          timeTaken, keystrokes, backspaces, isFollowUp
        })
      })
      const data = await res.json()
      setSessionFeedback(prev => [...prev, {
        question: currentQuestion.question,
        answer: savedAnswer,
        evaluation: data.evaluation
      }])
      setDifficulty(data.nextDifficulty)
      setIsFollowUp(data.nextQuestion.type === 'follow-up')
      setCurrentQuestion(data.nextQuestion)
      setChat(prev => [
        ...prev,
        {
          role: 'evaluator',
          text: data.evaluation.feedback,
          score: data.evaluation.score,
          confidence: data.evaluation.confidence_level,
          behavior: data.evaluation.behavior_analysis,
          tip: data.evaluation.improvement_tip,
          companyFeedback: data.evaluation.company_feedback
        },
        { role: 'interviewer', text: data.nextQuestion.question, type: data.nextQuestion.type }
      ])
    } catch (err) {
      alert('Error submitting answer.')
    }
    setLoading(false)
  }

  if (screen === 'feedback') return (
    <Feedback
      sessionFeedback={sessionFeedback}
      company={company}
      onRestart={() => {
        setScreen('setup'); setChat([]); setSessionFeedback([])
        setDifficulty(5); setIsFollowUp(false)
      }}
      onHome={onHome}
    />
  )

  if (screen === 'setup') return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4" style={{
      backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.08) 0%, transparent 60%)'
    }}>
      <div className="w-full max-w-md">
        <button onClick={onHome}
          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-600 text-sm mb-8 transition-colors">
          ← Back to home
        </button>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">IV</span>
            </div>
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">InterviewOS</span>
          </div>
          <h1 className="text-2xl font-bold text-violet-950 tracking-tight mb-1">Chat Interview</h1>
          <p className="text-violet-400 text-sm">Configure your session below</p>
        </div>
        <div className="bg-white border border-violet-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">Company Profile</label>
            <div className="flex gap-2">
              {COMPANIES.map(c => (
                <button key={c} onClick={() => setCompany(c)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    company === c
                      ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                      : 'bg-violet-50 border-violet-200 text-violet-600 hover:border-violet-400'
                  }`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">Topic Area</label>
            <select value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full bg-violet-50 border border-violet-200 text-violet-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 transition-colors">
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={startInterview} disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm">
            {loading ? 'Initializing...' : `Start ${company} Interview →`}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Adaptive difficulty', 'Behavioral tracking', 'Smart follow-ups'].map(f => (
            <div key={f} className="bg-white border border-violet-100 rounded-xl p-2.5 text-center">
              <p className="text-violet-400 text-xs">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      <div className="bg-white border-b border-violet-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">IV</span>
          </div>
          <span className="text-violet-950 font-semibold text-sm">{company} Interview</span>
          <span className="text-violet-200">·</span>
          <span className="text-violet-400 text-xs">{topic}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-violet-400 text-xs">Difficulty</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            difficulty <= 3 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            difficulty <= 6 ? 'bg-amber-50 text-amber-600 border-amber-200' :
            'bg-rose-50 text-rose-600 border-rose-200'
          }`}>{difficulty}/10</span>
          <button onClick={() => setScreen('feedback')}
            className="bg-violet-100 hover:bg-violet-200 text-violet-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            View Report
          </button>
          <button onClick={onHome}
            className="text-violet-400 hover:text-violet-600 text-xs transition-colors">
            ← Exit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl w-full mx-auto">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl px-4 py-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'candidate'
                ? 'bg-violet-600 text-white shadow-sm'
                : msg.role === 'evaluator'
                ? `border ${
                    msg.score >= 8 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                    msg.score >= 5 ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    'bg-rose-50 border-rose-200 text-rose-900'
                  }`
                : 'bg-white border border-violet-100 text-violet-900 shadow-sm'
            }`}>
              {msg.role === 'interviewer' && (
                <div className="text-xs text-violet-400 mb-1.5 font-medium">
                  {company} Interviewer
                  {msg.type === 'follow-up' ? ' · Follow-up' : msg.type ? ` · ${msg.type}` : ''}
                </div>
              )}
              {msg.role === 'evaluator' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">Evaluation</div>
                  <div className="font-bold text-base">{msg.score}/10</div>
                  <p>{msg.text}</p>
                  {msg.confidence && (
                    <div className="flex items-center gap-2 pt-2 border-t border-current border-opacity-10">
                      <span className="text-xs opacity-60">Confidence</span>
                      <span className="text-xs font-semibold">{msg.confidence}</span>
                    </div>
                  )}
                  {msg.behavior && <p className="text-xs opacity-70">{msg.behavior}</p>}
                  {msg.tip && (
                    <div className="text-xs bg-black bg-opacity-5 rounded-lg px-3 py-2">
                      Tip — {msg.tip}
                    </div>
                  )}
                  {msg.companyFeedback && (
                    <div className="text-xs opacity-60 pt-2 border-t border-current border-opacity-10">
                      {company} — {msg.companyFeedback}
                    </div>
                  )}
                </div>
              )}
              {msg.role !== 'evaluator' && msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-violet-100 px-4 py-3 rounded-2xl text-violet-400 text-sm shadow-sm">
              <span className="animate-pulse">Analyzing response...</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-violet-100 p-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) submitAnswer()
              if (!isTyping) { setIsTyping(true); setStartTime(Date.now()) }
              if (e.key === 'Backspace') setBackspaces(prev => prev + 1)
              setKeystrokes(prev => prev + 1)
            }}
            placeholder="Type your response here..."
            rows={3}
            className="flex-1 bg-violet-50 border border-violet-200 text-violet-900 placeholder-violet-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 resize-none transition-colors"
          />
          <button onClick={submitAnswer} disabled={loading || !answer.trim()}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-200 disabled:text-violet-400 text-white font-semibold px-6 rounded-xl transition-colors text-sm">
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <div className="flex justify-center gap-6 mt-2.5 text-xs text-violet-300">
          <span>Keystrokes: {keystrokes}</span>
          <span>Backspaces: {backspaces}</span>
          <span>Elapsed: {elapsed}s</span>
          <span>Ctrl+Enter to submit</span>
        </div>
      </div>
    </div>
  )
}