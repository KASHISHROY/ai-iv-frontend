import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

const LANGUAGES = ['python', 'javascript', 'java', 'cpp']
const LANGUAGE_LABELS = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++' }
const COMPANIES = ['Google', 'Amazon', 'Microsoft']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

const DEFAULT_CODE = {
  python: '# Write your Python solution here\n\ndef solution():\n    pass\n',
  javascript: '// Write your JavaScript solution here\n\nfunction solution() {\n    \n}\n',
  java: '// Write your Java solution here\n\nclass Solution {\n    public void solution() {\n        \n    }\n}\n',
  cpp: '// Write your C++ solution here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n'
}

const getMonacoLanguage = (lang) =>
  ({ python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp' }[lang] || 'python')

export default function CodingInterview({ onHome }) {
  const [screen, setScreen] = useState('setup')
  const [company, setCompany] = useState('Google')
  const [difficulty, setDifficulty] = useState('Medium')
  const [language, setLanguage] = useState('python')
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState(DEFAULT_CODE.python)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [hint, setHint] = useState(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [hintNumber, setHintNumber] = useState(1)
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('Medium')
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const fetchQuestion = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://ai-iv-backend.onrender.com/coding-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, difficulty })
      })
      const data = await res.json()
      setQuestion(data.question)
      setCode(DEFAULT_CODE[language])
      setTimer(0); setTimerRunning(true); setHint(null)
      setHintNumber(1); setShowHint(false); setAttempts(0); setResult(null)
      setScreen('coding')
    } catch (err) { alert('Backend not reachable!') }
    setLoading(false)
  }

  const submitCode = async () => {
    if (!code.trim()) return
    setLoading(true); setTimerRunning(false)
    try {
      const res = await fetch('https://ai-iv-backend.onrender.com/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question, code,
          language: LANGUAGE_LABELS[language], company,
          testCases: question.test_cases || []
        })
      })
      const data = await res.json()
      setResult(data.evaluation)
      setAttempts(prev => prev + 1)
      if (data.evaluation.score >= 8) setAdaptiveDifficulty('Hard')
      else if (data.evaluation.score >= 5) setAdaptiveDifficulty('Medium')
      else setAdaptiveDifficulty('Easy')
      setScreen('result')
    } catch (err) { alert('Error submitting!') }
    setLoading(false)
  }

  const getHintFromAI = async () => {
    setHintLoading(true)
    try {
      const res = await fetch('https://ai-iv-backend.onrender.com/get-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.question, code, hintNumber })
      })
      const data = await res.json()
      setHint(data.hint.hint)
      setHintNumber(prev => Math.min(prev + 1, 4))
      setShowHint(true)
    } catch (err) { alert('Error getting hint!') }
    setHintLoading(false)
  }

  if (screen === 'setup') return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4" style={{
      backgroundImage: 'radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.08) 0%, transparent 60%)'
    }}>
      <div className="w-full max-w-md">
        <button onClick={onHome}
          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-600 text-sm mb-8 transition-colors">
          ← Back
        </button>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">IV</span>
            </div>
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">InterviewOS</span>
          </div>
          <h1 className="text-2xl font-bold text-violet-950 tracking-tight mb-1">Coding Interview</h1>
          <p className="text-violet-400 text-sm">Configure your coding session below</p>
        </div>

        {adaptiveDifficulty !== 'Medium' && (
          <div className="bg-violet-100 border border-violet-200 rounded-xl p-3 mb-4 text-xs text-violet-600 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
            Adaptive engine queued <span className="font-semibold">{adaptiveDifficulty}</span> for next session
          </div>
        )}

        <div className="bg-white border border-violet-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">Company</label>
            <div className="flex gap-2">
              {COMPANIES.map(c => (
                <button key={c} onClick={() => setCompany(c)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    company === c
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-violet-50 border-violet-200 text-violet-600 hover:border-violet-400'
                  }`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    difficulty === d
                      ? d === 'Easy' ? 'bg-emerald-500 border-emerald-500 text-white'
                        : d === 'Medium' ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-violet-50 border-violet-200 text-violet-600 hover:border-violet-400'
                  }`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 block">Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => { setLanguage(l); setCode(DEFAULT_CODE[l]) }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    language === l
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'bg-violet-50 border-violet-200 text-violet-600 hover:border-violet-400'
                  }`}>{LANGUAGE_LABELS[l]}</button>
              ))}
            </div>
          </div>
          <button onClick={fetchQuestion} disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            {loading ? 'Loading question...' : `Start ${company} Coding Session →`}
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 'coding') return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      <div className="bg-white border-b border-violet-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">IV</span>
          </div>
          <span className="text-violet-950 font-semibold text-sm">{company}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
            'bg-rose-50 text-rose-600 border-rose-200'
          }`}>{difficulty}</span>
          <span className="text-violet-400 text-xs bg-violet-50 border border-violet-200 px-2 py-1 rounded-lg">
            {LANGUAGE_LABELS[language]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-mono font-semibold text-sm px-3 py-1.5 rounded-lg border ${
            timer > 1800 ? 'bg-rose-50 border-rose-200 text-rose-600' :
            timer > 900 ? 'bg-amber-50 border-amber-200 text-amber-600' :
            'bg-violet-50 border-violet-200 text-violet-600'
          }`}>{formatTime(timer)}</div>
          <button onClick={getHintFromAI} disabled={hintLoading || hintNumber > 3}
            className="bg-amber-50 hover:bg-amber-100 disabled:bg-violet-50 disabled:text-violet-300 text-amber-600 border border-amber-200 disabled:border-violet-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            {hintLoading ? '...' : hintNumber > 3 ? 'All hints used' : `Hint ${hintNumber}/3`}
          </button>
          <button onClick={onHome} className="text-violet-400 hover:text-violet-600 text-xs transition-colors">← Exit</button>
        </div>
      </div>

      {showHint && hint && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between">
          <span className="text-amber-700 text-xs">
            <span className="font-semibold">Hint {hintNumber - 1} —</span> {hint}
          </span>
          <button onClick={() => setShowHint(false)} className="text-amber-400 hover:text-amber-600 text-xs ml-4">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/5 border-r border-violet-100 p-5 overflow-y-auto bg-white">
          <h2 className="text-violet-950 font-semibold text-base tracking-tight mb-3">{question?.title}</h2>
          <p className="text-violet-600 text-sm leading-relaxed mb-5">{question?.question}</p>

          {question?.examples && (
            <div className="mb-5">
              <h3 className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">Examples</h3>
              {question.examples.map((ex, i) => (
                <div key={i} className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-2">
                  <div className="text-violet-400 text-xs font-medium mb-1.5">Example {i + 1}</div>
                  <div className="text-emerald-600 text-xs font-mono mb-1">
                    <span className="text-violet-400">Input: </span>{ex.input}
                  </div>
                  <div className="text-purple-600 text-xs font-mono">
                    <span className="text-violet-400">Output: </span>{ex.output}
                  </div>
                </div>
              ))}
            </div>
          )}

          {question?.test_cases && question.test_cases.length > 0 && (
            <div className="mb-5">
              <h3 className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Test Cases · {question.test_cases.length}
              </h3>
              {question.test_cases.map((tc, i) => (
                <div key={i} className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-2">
                  <div className="text-purple-500 text-xs font-medium mb-1.5">Test {i + 1} — {tc.description}</div>
                  <div className="text-emerald-600 text-xs font-mono mb-0.5">
                    <span className="text-violet-400">In: </span>{tc.input}
                  </div>
                  <div className="text-purple-600 text-xs font-mono">
                    <span className="text-violet-400">Out: </span>{tc.expected}
                  </div>
                </div>
              ))}
            </div>
          )}

          {question?.constraints && (
            <div>
              <h3 className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">Constraints</h3>
              <ul className="space-y-1">
                {question.constraints.map((c, i) => (
                  <li key={i} className="text-violet-400 text-xs font-mono">• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 4,
              lineNumbers: 'on',
              folding: true,
              bracketPairColorization: { enabled: true },
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth'
            }}
          />
          <div className="bg-white border-t border-violet-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-violet-400">
              <span>{code.split('\n').length} lines</span>
              <span>{code.length} chars</span>
              {attempts > 0 && <span className="text-amber-500 font-medium">Attempt {attempts + 1}</span>}
            </div>
            <button onClick={submitCode} disabled={loading || !code.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-violet-200 disabled:text-violet-400 text-white font-semibold px-8 py-2 rounded-xl transition-colors text-sm">
              {loading ? 'Evaluating...' : 'Submit Solution →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-violet-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">IV</span>
              </div>
              <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">InterviewOS</span>
            </div>
            <h1 className="text-2xl font-bold text-violet-950 tracking-tight">Code Review</h1>
            <p className="text-violet-400 text-sm mt-1">
              {company} · {difficulty} · {LANGUAGE_LABELS[language]} · {formatTime(timer)}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setScreen('coding'); setResult(null); setTimerRunning(true) }}
              className="bg-white border border-violet-200 hover:border-violet-400 text-violet-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Retry
            </button>
            <button onClick={() => { setDifficulty(adaptiveDifficulty); setScreen('setup'); setQuestion(null); setResult(null); setTimer(0); setTimerRunning(false) }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Next ({adaptiveDifficulty}) →
            </button>
            <button onClick={onHome}
              className="bg-white border border-violet-200 hover:border-violet-400 text-violet-600 px-4 py-2 rounded-xl text-sm transition-colors">
              ← Home
            </button>
          </div>
        </div>

        <div className="bg-white border border-violet-100 rounded-2xl p-8 mb-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">Score</p>
            <div className={`text-6xl font-bold tracking-tight ${
              result?.score >= 8 ? 'text-emerald-500' :
              result?.score >= 5 ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {result?.score}<span className="text-2xl text-violet-200 font-normal">/10</span>
            </div>
            <p className="text-violet-400 text-sm mt-2">
              {result?.score >= 8 ? `Outstanding — would pass ${company} review` :
               result?.score >= 5 ? 'Solid attempt — improvements identified' :
               'Needs significant work before interview-ready'}
            </p>
            {adaptiveDifficulty !== difficulty && (
              <p className="text-violet-500 text-xs mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                Next: <span className="font-semibold">{adaptiveDifficulty}</span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-center">
              <p className="text-violet-400 text-xs uppercase tracking-wider mb-1">Time</p>
              <p className="text-emerald-600 font-mono font-bold text-lg">{result?.time_complexity}</p>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-center">
              <p className="text-violet-400 text-xs uppercase tracking-wider mb-1">Space</p>
              <p className="text-purple-600 font-mono font-bold text-lg">{result?.space_complexity}</p>
            </div>
          </div>
        </div>

        {result?.test_results && result.test_results.length > 0 && (
          <div className="bg-white border border-violet-100 rounded-2xl p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-violet-950 font-semibold text-sm">Test Results</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                result.test_results.filter(t => t.status === 'pass').length === result.test_results.length
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                {result.test_results.filter(t => t.status === 'pass').length}/{result.test_results.length} passing
              </span>
            </div>
            <div className="space-y-2">
              {result.test_results.map((tc, i) => (
                <div key={i} className={`rounded-xl p-3.5 border ${
                  tc.status === 'pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-semibold ${tc.status === 'pass' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {tc.status === 'pass' ? '✓' : '✗'} {tc.description}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      tc.status === 'pass' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'
                    }`}>{tc.status?.toUpperCase()}</span>
                  </div>
                  <div className={`text-xs font-mono mb-1 ${tc.status === 'pass' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tc.input} → {tc.expected}
                  </div>
                  <div className={`text-xs ${tc.status === 'pass' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tc.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {[
          { key: 'correctness', label: 'Correctness Analysis', color: 'text-violet-950', border: 'border-violet-100' },
          { key: 'code_quality', label: 'Code Quality', color: 'text-violet-950', border: 'border-violet-100' },
          { key: 'improvements', label: 'Recommended Improvements', color: 'text-amber-600', border: 'border-amber-100' },
          { key: 'company_verdict', label: `${company} Verdict`, color: 'text-purple-600', border: 'border-purple-100' },
          { key: 'better_approach', label: 'Optimal Approach', color: 'text-violet-600', border: 'border-violet-100' }
        ].filter(s => result?.[s.key]).map(section => (
          <div key={section.key} className={`bg-white border ${section.border} rounded-2xl p-5 mb-4 shadow-sm`}>
            <h3 className={`font-semibold text-sm mb-2.5 ${section.color}`}>{section.label}</h3>
            <p className="text-violet-600 text-sm leading-relaxed">{result[section.key]}</p>
          </div>
        ))}

        <div className="flex gap-3 mt-6">
          <button onClick={() => { setScreen('coding'); setResult(null); setTimerRunning(true) }}
            className="flex-1 bg-white border border-violet-200 hover:border-violet-400 text-violet-600 font-semibold py-3 rounded-xl text-sm transition-colors">
            Retry Same Problem
          </button>
          <button onClick={() => { setDifficulty(adaptiveDifficulty); setScreen('setup'); setQuestion(null); setResult(null); setTimer(0); setTimerRunning(false) }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
            Next Problem ({adaptiveDifficulty}) →
          </button>
        </div>
      </div>
    </div>
  )
}