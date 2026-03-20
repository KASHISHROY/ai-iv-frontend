export default function Feedback({ sessionFeedback, company, onRestart, onHome }) {
  if (sessionFeedback.length === 0) return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center">
      <div className="bg-white border border-violet-100 rounded-2xl p-10 text-center max-w-sm shadow-sm">
        <p className="text-violet-400 text-sm mb-5">No session data yet. Complete at least one question to generate a report.</p>
        <button onClick={onRestart}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
          Start Interview
        </button>
      </div>
    </div>
  )

  const avgScore = Math.round(
    sessionFeedback.reduce((sum, f) => sum + f.evaluation.score, 0) / sessionFeedback.length
  )
  const highConf = sessionFeedback.filter(f => f.evaluation.confidence_level === 'High').length
  const medConf = sessionFeedback.filter(f => f.evaluation.confidence_level === 'Medium').length
  const lowConf = sessionFeedback.filter(f => f.evaluation.confidence_level === 'Low').length

  return (
    <div className="min-h-screen bg-violet-50 p-6" style={{
      backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)'
    }}>
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">IV</span>
              </div>
              <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">InterviewOS</span>
            </div>
            <h1 className="text-2xl font-bold text-violet-950 tracking-tight">Session Report</h1>
            <p className="text-violet-400 text-sm mt-1">
              {company} · {sessionFeedback.length} question{sessionFeedback.length > 1 ? 's' : ''} completed
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onRestart}
              className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors">
              New Session
            </button>
            {onHome && (
              <button onClick={onHome}
                className="bg-white border border-violet-200 hover:border-violet-400 text-violet-600 font-medium px-4 py-2 rounded-xl text-sm transition-colors">
                ← Home
              </button>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="bg-white border border-violet-100 rounded-2xl p-8 mb-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">Overall Performance</p>
            <div className={`text-6xl font-bold tracking-tight ${
              avgScore >= 8 ? 'text-emerald-500' :
              avgScore >= 5 ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {avgScore}<span className="text-2xl text-violet-200 font-normal">/10</span>
            </div>
            <p className="text-violet-400 text-sm mt-2">
              {avgScore >= 8 ? 'Outstanding — strong candidate signal' :
               avgScore >= 5 ? 'Solid foundation — areas for improvement identified' :
               'Needs development — focused practice recommended'}
            </p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
            <span className="text-violet-200 text-3xl font-black">{company[0]}</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { val: highConf, label: 'High Confidence', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
            { val: medConf, label: 'Medium Confidence', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
            { val: lowConf, label: 'Low Confidence', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-200' }
          ].map(c => (
            <div key={c.label} className={`${c.bg} border rounded-2xl p-4 text-center`}>
              <div className={`text-2xl font-bold mb-1 ${c.color}`}>{c.val}</div>
              <div className="text-xs font-medium text-violet-400 uppercase tracking-wider">{c.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-violet-950 font-semibold text-base mb-4 tracking-tight">Question Breakdown</h2>
        <div className="space-y-4">
          {sessionFeedback.map((item, i) => (
            <div key={i} className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider">Q{i + 1}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    item.evaluation.score >= 8 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    item.evaluation.score >= 5 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>{item.evaluation.score}/10</span>
                  {item.evaluation.confidence_level && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      item.evaluation.confidence_level === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      item.evaluation.confidence_level === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>{item.evaluation.confidence_level}</span>
                  )}
                </div>
              </div>
              <p className="text-violet-900 text-sm font-medium mb-2 leading-relaxed">{item.question}</p>
              <p className="text-violet-400 text-xs mb-4 italic">
                "{item.answer.slice(0, 140)}{item.answer.length > 140 ? '...' : ''}"
              </p>
              <div className="space-y-2">
                {item.evaluation.feedback && (
                  <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5">
                    <p className="text-violet-700 text-xs leading-relaxed">
                      <span className="text-violet-500 font-semibold">Feedback — </span>{item.evaluation.feedback}
                    </p>
                  </div>
                )}
                {item.evaluation.behavior_analysis && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5">
                    <p className="text-purple-700 text-xs leading-relaxed">
                      <span className="text-purple-500 font-semibold">Behavioral — </span>{item.evaluation.behavior_analysis}
                    </p>
                  </div>
                )}
                {item.evaluation.improvement_tip && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <p className="text-amber-700 text-xs leading-relaxed">
                      <span className="text-amber-600 font-semibold">Tip — </span>{item.evaluation.improvement_tip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}