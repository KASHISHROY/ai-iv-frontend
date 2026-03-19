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

  const highConfidence = sessionFeedback.filter(f => f.evaluation.confidence_level === 'High').length
  const lowConfidence = sessionFeedback.filter(f => f.evaluation.confidence_level === 'Low').length

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

        {/* Confidence summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 border border-green-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{highConfidence}</div>
            <div className="text-xs text-gray-400">High Confidence</div>
          </div>
          <div className="bg-gray-800 border border-yellow-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {sessionFeedback.filter(f => f.evaluation.confidence_level === 'Medium').length}
            </div>
            <div className="text-xs text-gray-400">Medium Confidence</div>
          </div>
          <div className="bg-gray-800 border border-red-800 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{lowConfidence}</div>
            <div className="text-xs text-gray-400">Low Confidence</div>
          </div>
        </div>

        {/* Per question breakdown */}
        <h2 className="text-white font-bold text-xl mb-4">Question Breakdown</h2>
        <div className="space-y-4">
          {sessionFeedback.map((item, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">

              {/* Score + confidence badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium">Q{i + 1}</span>
                <div className="flex gap-2">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    item.evaluation.score >= 8 ? 'bg-green-900 text-green-300' :
                    item.evaluation.score >= 5 ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>{item.evaluation.score}/10</span>
                  {item.evaluation.confidence_level && (
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      item.evaluation.confidence_level === 'High' ? 'bg-green-900 text-green-300' :
                      item.evaluation.confidence_level === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>🧠 {item.evaluation.confidence_level}</span>
                  )}
                </div>
              </div>

              {/* Question */}
              <p className="text-white text-sm font-medium mb-2">{item.question}</p>

              {/* Answer preview */}
              <p className="text-gray-400 text-sm mb-3 italic">
                "{item.answer.slice(0, 120)}{item.answer.length > 120 ? '...' : ''}"
              </p>

              {/* Feedback */}
              {item.evaluation.feedback && (
                <div className="bg-gray-700 rounded-xl p-3 mb-2">
                  <p className="text-gray-300 text-xs">
                    <span className="text-blue-400 font-medium">💬 Feedback: </span>
                    {item.evaluation.feedback}
                  </p>
                </div>
              )}

              {/* Behavior analysis */}
              {item.evaluation.behavior_analysis && (
                <div className="bg-gray-700 rounded-xl p-3 mb-2">
                  <p className="text-gray-300 text-xs">
                    <span className="text-purple-400 font-medium">🔍 Behavior: </span>
                    {item.evaluation.behavior_analysis}
                  </p>
                </div>
              )}

              {/* Improvement tip */}
              {item.evaluation.improvement_tip && (
                <div className="bg-gray-700 rounded-xl p-3">
                  <p className="text-gray-300 text-xs">
                    <span className="text-yellow-400 font-medium">💡 Tip: </span>
                    {item.evaluation.improvement_tip}
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
