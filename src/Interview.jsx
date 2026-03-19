import { useState } from 'react'
import Feedback from './Feedback'

const COMPANIES = ['Google', 'Amazon', 'Microsoft']
const TOPICS = ['Arrays', 'Trees', 'System Design', 'Behavioral', 'Dynamic Programming']

export default function Interview() {
  const [screen, setScreen] = useState('setup')
  const [company, setCompany] = useState('Google')
  const [topic, setTopic] = useState('Arrays')
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [chat, setChat] = useState([])
  const [difficulty, setDifficulty] = useState(5)
  const [sessionFeedback, setSessionFeedback] = useState([])

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
      setChat([{ role: 'interviewer', text: data.question.question, type: data.question.type }])
      setScreen('interview')
    } catch (err) {
      alert('Backend not reachable. Make sure server is running.')
    }
    setLoading(false)
  }

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setLoading(true)

    const updatedChat = [...chat, { role: 'candidate', text: answer }]
    setChat(updatedChat)
    setAnswer('')

    try {
      const res = await fetch('https://ai-iv-backend.onrender.com/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer,
          company,
          previousQuestions: chat
            .filter(m => m.role === 'interviewer')
            .map(m => m.text),
          currentDifficulty: difficulty
        })
      })
      const data = await res.json()

      setSessionFeedback(prev => [
        ...prev,
        {
          question: currentQuestion.question,
          answer,
          evaluation: data.evaluation
        }
      ])

      setDifficulty(data.nextDifficulty)

      setChat(prev => [
        ...prev,
        {
          role: 'evaluator',
          text: `Score: ${data.evaluation.score}/10 — ${data.evaluation.improvement}`,
          score: data.evaluation.score
        },
        {
          role: 'interviewer',
          text: data.nextQuestion.question,
          type: data.nextQuestion.type
        }
      ])

      setCurrentQuestion(data.nextQuestion)
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
        setScreen('setup')
        setChat([])
        setSessionFeedback([])
        setDifficulty(5)
      }}
    />
  )

  if (screen === 'setup') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-1">AI Interview</h1>
        <p className="text-gray-400 mb-8">
          Powered by Llama 3.3 · Adaptive difficulty
        </p>

        <div className="mb-5">
          <label className="text-gray-300 text-sm font-medium mb-2 block">
            Company Mode
          </label>
          <div className="flex gap-2">
            {COMPANIES.map(c => (
              <button
                key={c}
                onClick={() => setCompany(c)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  company === c
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-gray-300 text-sm font-medium mb-2 block">
            Topic
          </label>
          <select
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            {TOPICS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <button
          onClick={startInterview}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Starting...' : `Start ${company} Interview →`}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <span className="text-white font-bold">{company} Interview</span>
          <span className="text-gray-400 text-sm ml-3">Topic: {topic}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Difficulty:</span>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            difficulty <= 3
              ? 'bg-green-900 text-green-300'
              : difficulty <= 6
              ? 'bg-yellow-900 text-yellow-300'
              : 'bg-red-900 text-red-300'
          }`}>
            {difficulty}/10
          </span>
          <button
            onClick={() => setScreen('feedback')}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-4 py-1 rounded-lg"
          >
            View Feedback
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-3xl w-full mx-auto">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'candidate'
                ? 'bg-blue-600 text-white'
                : msg.role === 'evaluator'
                ? `border ${
                    msg.score >= 8
                      ? 'bg-green-900 border-green-700 text-green-200'
                      : msg.score >= 5
                      ? 'bg-yellow-900 border-yellow-700 text-yellow-200'
                      : 'bg-red-900 border-red-700 text-red-200'
                  }`
                : 'bg-gray-700 text-gray-100'
            }`}>
              {msg.role === 'interviewer' && (
                <div className="text-xs text-gray-400 mb-1 font-medium">
                  {company} Interviewer {msg.type && `· ${msg.type}`}
                </div>
              )}
              {msg.role === 'evaluator' && (
                <div className="text-xs mb-1 font-medium opacity-70">
                  Evaluation
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-4 py-3 rounded-2xl text-gray-400 text-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) submitAnswer()
            }}
            placeholder="Type your answer... (Ctrl+Enter to submit)"
            rows={3}
            className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={submitAnswer}
            disabled={loading || !answer.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold px-6 rounded-xl transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Ctrl+Enter to submit
        </p>
      </div>

    </div>
  )
}