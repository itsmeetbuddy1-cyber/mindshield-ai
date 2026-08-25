import React from 'react';

const SIHExplainerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-200 selection:text-blue-900">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold tracking-wider uppercase border border-blue-200 dark:border-blue-800 mb-2">
            SIH 2026 Technical Deep Dive
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            MindShield AI Architecture
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A privacy-first, multimodal stress detection and intervention platform engineered for edge computing.
          </p>
          <div className="flex justify-center gap-4 pt-6">
            <a href="/" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
              Launch Demo
            </a>
            <a href="/dashboard" className="px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors shadow-sm">
              Back to Dashboard
            </a>
          </div>
        </header>

        {/* Section 1: Multimodal Architecture */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🧩</span> 1. Multimodal Architecture
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            MindShield AI does not rely on single-point metrics. It uses a <strong>Weighted Fusion Engine</strong> to aggregate signals from four distinct sources, providing a holistic view of the user's psychological state.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold mb-2">📝 Explicit Signals (NLP)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Self-report check-ins and conversational text processed via LLMs for sentiment, anxiety markers, and trauma keywords.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold mb-2">🎙️ Vocal Prosody (WebAudio)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Client-side extraction of speech intensity, pitch variance, and pause ratios to detect agitation.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold mb-2">📷 Visual Micro-expressions</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">On-device canvas API calculates luminance variance and rapid head motion simulating restlessness.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold mb-2">⌨️ Interaction Dynamics</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Typing speed, backspace frequency, and UI interaction intensity tracking.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Math / Formula */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🧮</span> 2. Signal Weighting Formula
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            The final fusion score dynamically adapts based on sensor availability. If a user denies camera access, weights are re-normalized mathematically.
          </p>
          <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-x-auto shadow-inner">
            <p className="mb-4 text-green-400"># Core Equation</p>
            <p className="text-lg text-white mb-4">Score = Σ (W<sub>i</sub> * S<sub>i</sub>)</p>
            <p className="mb-2">Where:</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-400">
              <li><span className="text-blue-300">S<sub>i</sub></span> = Normalized signal score (0-100)</li>
              <li><span className="text-purple-300">W<sub>i</sub></span> = Dynamic weight based on confidence</li>
            </ul>
            <p className="mt-4 text-slate-500">Default Weights: Text(40%), Voice(30%), Interaction(20%), Camera(10%)</p>
          </div>
        </section>

        {/* Section 3: Privacy */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🛡️</span> 3. Privacy & Edge Computing
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                In mental health tech, privacy is a clinical requirement, not just a feature. MindShield AI processes all high-bandwidth sensor data (Audio, Video) <strong>exclusively on the client device</strong> using HTML5 APIs and WebAssembly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span> <strong>Zero Telemetry Upload:</strong> Raw A/V data never leaves the browser.
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span> <strong>Ephemeral Processing:</strong> Video frames are drawn to an off-screen canvas, analyzed, and immediately discarded.
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span> <strong>Granular Opt-In:</strong> Sensors default to off.
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/3 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <div className="text-blue-600 dark:text-blue-400 font-bold mb-2">Edge vs Cloud</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <p>Instead of streaming 1MB/s of video to a cloud server, we extract a 4-byte numeric array `[luminance, motion, blink_rate]` in-browser.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Guardrails */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">⚖️</span> 4. Clinical Guardrails & Triage
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            MindShield AI implements a deterministic safety firewall to prevent the generative AI from providing medical diagnoses or mishandling crisis situations.
          </p>
          
          <div className="space-y-4">
            <div className="flex border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10 p-4 rounded-r-lg">
              <div className="ml-2">
                <h4 className="font-bold text-green-800 dark:text-green-400">Tier 1: General Distress (Score 0-55)</h4>
                <p className="text-sm text-green-700 dark:text-green-500/80 mt-1">Action: AI provides conversational grounding, breathing exercises, and cognitive reframing.</p>
              </div>
            </div>
            
            <div className="flex border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-r-lg">
              <div className="ml-2">
                <h4 className="font-bold text-amber-800 dark:text-amber-400">Tier 2: Elevated Risk (Score 56-80)</h4>
                <p className="text-sm text-amber-700 dark:text-amber-500/80 mt-1">Action: Suggests human intervention, provides local support contacts, switches to highly constrained empathetic responses.</p>
              </div>
            </div>
            
            <div className="flex border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-r-lg">
              <div className="ml-2">
                <h4 className="font-bold text-red-800 dark:text-red-400">Tier 3: Crisis Escalation (Score 81-100 or Keyword Match)</h4>
                <p className="text-sm text-red-700 dark:text-red-500/80 mt-1">Action: AI chat is locked. Immediate display of crisis lifeline buttons (e.g., 988, local emergency services) bypassing generative components entirely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Team INSIGHT-X */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">👥</span> 5. Engineering Team — INSIGHT-X
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            MindShield AI was conceptualized, engineered, and presented by <strong>TEAM INSIGHT-X</strong> for the Smart India Hackathon.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Team Leader */}
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500/50 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-2">
                  👑 Team Leader
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  PATEL MEETKUMAR CHIRAGKUMAR
                </h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Lead Architect & Full-Stack AI Engineer</p>
              </div>
            </div>

            {/* Kashvi Pahwa */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  KASHVI PAHWA
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Core Developer & Researcher</p>
              </div>
            </div>

            {/* Harshit Singh */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  HARSHIT SINGH
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Core Developer & Engineer</p>
              </div>
            </div>

            {/* Yogendra Singh */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  YOGENDRA SINGH
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Core Developer & Systems</p>
              </div>
            </div>

            {/* Abhiraj Singh */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  ABHIRAJ SINGH
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Core Developer & QA</p>
              </div>
            </div>

            {/* Priyank Taunk */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  PRIYANK TAUNK
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Core Developer & Integrations</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SIHExplainerPage;
