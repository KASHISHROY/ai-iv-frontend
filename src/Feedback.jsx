export default function Feedback({ sessionFeedback, company, onRestart }) {
  if (sessionFeedback.length === 0) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
        <p className="text-gray-400 mb-4">No feedback yet. Answer some questions first!</p>
        <button onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl">
          Back to Interview
        </button>
      </div>
    </div>
  )

  const avgScore = Math.round(
    sessionFeedback.reduce((sum, f) => sum + f.evaluation.score, 0) / sessionFeedback.length
  )

  const allStrengths = sessionFeedback.flatMap(f => f.evaluation.strengths)
  const allWeaknesses = sessionFeedback.flatMap(f => f.evaluation.weaknesses)

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Interview Report</h1>
            <p className="text-gray-400">{company} · {sessionFeedback.length} questions answered</p>
          </div>
          <button onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl">
            New Interview
          </button>
        </div>

        {/* Overall score */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Overall Score</p>
          <div className={`text-6xl font-bold mb-2 ${
            avgScore >= 8 ? 'text-green-400' :
            avgScore >= 5 ? 'text-yellow-400' : 'text-red-400'
          }`}>{avgScore}<span className="text-2xl text-gray-500">/10</span></div>
          <p className="text-gray-400">
            {avgScore >= 8 ? '🎉 Excellent performance!' :
             avgScore >= 5 ? '👍 Good effort, room to improve' :
             '💪 Keep practicing!'}
          </p>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 border border-green-800 rounded-2xl p-5">
            <h3 className="text-green-400 font-bold mb-3">✅ Strengths</h3>
            <ul className="space-y-2">
              {[...new Set(allStrengths)].slice(0, 5).map((s, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-2">
                  <span className="text-green-500 mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 border border-red-800 rounded-2xl p-5">
            <h3 className="text-red-400 font-bold mb-3">⚠️ Weaknesses</h3>
            <ul className="space-y-2">
              {[...new Set(allWeaknesses)].slice(0, 5).map((w, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-2">
                  <span className="text-red-500 mt-0.5">•</span>{w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Per question breakdown */}
        <h2 className="text-white font-bold text-xl mb-4">Question Breakdown</h2>
        <div className="space-y-4">
          {sessionFeedback.map((item, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium">Q{i + 1}</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  item.evaluation.score >= 8 ? 'bg-green-900 text-green-300' :
                  item.evaluation.score >= 5 ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>{item.evaluation.score}/10</span>
              </div>
              <p className="text-white text-sm font-medium mb-2">{item.question}</p>
              <p className="text-gray-400 text-sm mb-3 italic">"{item.answer.slice(0, 120)}{item.answer.length > 120 ? '...' : ''}"</p>
              <div className="bg-gray-700 rounded-xl p-3">
                <p className="text-gray-300 text-xs">
                  <span className="text-blue-400 font-medium">Tip: </span>
                  {item.evaluation.improvement}
                </p>
              </div>
              {item.evaluation.followUpQuestion && (
                <p className="text-gray-500 text-xs mt-2">
                  <span className="text-purple-400">Follow-up: </span>
                  {item.evaluation.followUpQuestion}
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}