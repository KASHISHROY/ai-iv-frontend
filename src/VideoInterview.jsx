export default function VideoInterview({ onHome }) {
  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={onHome}
          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-600 text-sm mb-8 transition-colors">
          ← Back
        </button>
        <div className="bg-white border border-violet-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 flex items-center justify-center text-2xl mx-auto mb-5">
            🎥
          </div>
          <h1 className="text-xl font-bold text-violet-950 tracking-tight mb-2">Video Interview</h1>
          <p className="text-violet-400 text-sm mb-1">Coming in Phase 6</p>
          <p className="text-violet-300 text-xs mb-7">Webcam · Live timer · Company questions</p>
          <div className="space-y-2 mb-7 text-left">
            {['Webcam with live preview', 'Timed question display', 'Pressure simulation', 'Company-specific banks'].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-xs text-violet-400">
                <div className="w-1 h-1 rounded-full bg-violet-300"></div>{f}
              </div>
            ))}
          </div>
          <button onClick={onHome}
            className="w-full bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 font-medium py-2.5 rounded-xl text-sm transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}