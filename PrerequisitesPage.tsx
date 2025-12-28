import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const PrerequisitesPage: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('seizures');
  const [selectedBand, setSelectedBand] = useState<string>('delta');

  // Generate sample EEG waveforms for different frequency bands
  const generateWaveform = (frequency: number, amplitude: number, samples: number = 300) => {
    const data = [];
    for (let i = 0; i < samples; i++) {
      data.push({
        time: (i / 50).toFixed(2),
        value: amplitude * Math.sin((2 * Math.PI * frequency * i) / 50)
      });
    }
    return data;
  };

  const frequencyBands = {
    delta: {
      name: 'Delta (δ)',
      range: '0.5 - 4 Hz',
      color: '#ef4444',
      description: 'Very slow waves, largest amplitude. Associated with deep sleep, unconsciousness, and brain injury.',
      clinical: 'High amplitude delta waves in adults when awake = abnormal. Normal in infants and during sleep.',
      examples: ['Deep sleep', 'Coma', 'Brain disorders'],
      waveform: generateWaveform(1.5, 100)
    },
    theta: {
      name: 'Theta (θ)',
      range: '4 - 8 Hz',
      color: '#f97316',
      description: 'Slow waves with medium amplitude. Associated with drowsiness, meditation, and memory.',
      clinical: 'Excessive theta = drowsiness or abnormal brain activity. Normal during sleep transitions.',
      examples: ['Drowsiness', 'Memory processing', 'Sleep stage 1-2'],
      waveform: generateWaveform(5, 75)
    },
    alpha: {
      name: 'Alpha (α)',
      range: '8 - 12 Hz',
      color: '#eab308',
      description: 'Moderate speed waves. The "relaxation" rhythm. Most prominent in posterior regions with eyes closed.',
      clinical: 'Healthy brain rhythm in awake, relaxed state. Loss of alpha = attention or abnormality.',
      examples: ['Relaxed awake state', 'Eyes closed', 'Meditation'],
      waveform: generateWaveform(10, 50)
    },
    beta: {
      name: 'Beta (β)',
      range: '12 - 30 Hz',
      color: '#3b82f6',
      description: 'Faster waves with low amplitude. Associated with active thinking, concentration, and movement.',
      clinical: 'Dominant during normal wakefulness and mental activity. Increases with attention.',
      examples: ['Active thinking', 'Concentration', 'Problem solving'],
      waveform: generateWaveform(20, 30)
    },
    gamma: {
      name: 'Gamma (γ)',
      range: '30 - 100 Hz',
      color: '#8b5cf6',
      description: 'Very fast waves with very low amplitude. Associated with higher cognitive processing.',
      clinical: 'Related to attention, perception, and consciousness. Can indicate seizure activity if abnormal.',
      examples: ['High attention', 'Visual processing', 'Cognitive binding'],
      waveform: generateWaveform(50, 15)
    }
  };

  const parameters = [
    {
      id: 'amplitude',
      title: 'Amplitude (Voltage)',
      unit: 'μV (microvolts)',
      description: 'The height of the EEG wave, measured in microvolts. Represents the strength of electrical activity.',
      visual: 'Higher peaks = stronger electrical signals',
      normal: '10 - 100 μV typical for awake state',
      abnormal: ['>300 μV = very abnormal (possible seizure)',
                 '<5 μV = too quiet (poor signal or brain issue)'],
      icon: '📈'
    },
    {
      id: 'frequency',
      title: 'Frequency (Hz)',
      unit: 'Hz (cycles per second)',
      description: 'How fast the waves oscillate. Measured in Hz (cycles per second). Different frequencies indicate different brain states.',
      visual: 'Wavy = slow (Delta/Theta), Squiggly = fast (Beta/Gamma)',
      normal: '1 - 30 Hz normal in adults',
      abnormal: ['<0.5 Hz = severe abnormality',
                 '>100 Hz = possible seizure activity'],
      icon: '⏱️'
    },
    {
      id: 'stddev',
      title: 'Standard Deviation (STD)',
      unit: 'μV',
      description: 'Measures how much the signal varies around the average. Higher STD = more variable, active brain. Lower STD = more stable, less activity.',
      visual: 'High STD = wide, tall waves | Low STD = small, flat waves',
      normal: '20 - 60 μV for normal EEG',
      abnormal: ['>100 μV = high variability (possible seizure)',
                 '<5 μV = monotonous signal (concerning)'],
      icon: '📊'
    },
    {
      id: 'entropy',
      title: 'Spectral Entropy',
      unit: 'bits/Hz',
      description: 'Measures randomness/complexity in the signal. Higher entropy = more random (normal). Lower entropy = more regular (may indicate seizure).',
      visual: 'Chaotic waves = high entropy | Regular pattern = low entropy',
      normal: '0.4 - 0.8 (reasonably random)',
      abnormal: ['<0.2 = highly regular (abnormal)',
                 '>0.95 = pure noise (poor signal quality)'],
      icon: '🎲'
    },
    {
      id: 'centroid',
      title: 'Spectral Centroid',
      unit: 'Hz',
      description: 'The "center of mass" of the frequency spectrum. Shows which frequencies dominate. Higher = more high-frequency content.',
      visual: 'Alpha dominant = 8-12 Hz centroid | Gamma dominant = 50+ Hz centroid',
      normal: '8 - 20 Hz for relaxed awake state',
      abnormal: ['>50 Hz = abnormally fast (possible seizure)',
                 '<5 Hz = abnormally slow (possible abnormality)'],
      icon: '🎯'
    },
    {
      id: 'snr',
      title: 'Signal-to-Noise Ratio (SNR)',
      unit: 'dB (decibels)',
      description: 'Compares the actual brain signal strength to background noise. Higher SNR = better quality signal. Lower SNR = lots of interference.',
      visual: 'High SNR = clear waves | Low SNR = blurry, noisy signal',
      normal: '>5 dB is acceptable',
      abnormal: ['<0 dB = noise > signal (unusable)',
                 '>20 dB = excellent quality (ideal)'],
      icon: '📡'
    }
  ];

  const seizureMarkers = [
    {
      name: 'Spike',
      description: 'Sharp, brief (20-70ms) upward deflection. Followed by slow wave.',
      visual: '⚡',
      clinical: 'Classic seizure marker'
    },
    {
      name: 'Spike & Wave',
      description: 'Sharp spike followed by slow wave. 3 Hz = absence seizure, varied = focal seizure.',
      visual: '⚡➡️〰️',
      clinical: 'Highly specific for seizure'
    },
    {
      name: 'High Frequency Bursts',
      description: 'Sudden increase in fast activity (>20 Hz). Brief, intense bursts.',
      visual: '〰️〰️〰️',
      clinical: 'Ictal (seizure) activity'
    },
    {
      name: 'Amplitude Increase',
      description: 'Sudden increase in wave height across multiple channels.',
      visual: '📈📈',
      clinical: 'Possible onset marker'
    },
    {
      name: 'Focal Slowing',
      description: 'Abnormally slow activity (delta/theta) in one area while rest is normal.',
      visual: '🎯〰️',
      clinical: 'Possible lesion location'
    }
  ];

  const readingTips = [
    {
      title: 'Look at the Baseline',
      tip: 'The flat line or gentle waves represent the baseline. Abnormalities stand out from this.',
      icon: '〰️'
    },
    {
      title: 'Scan Horizontally',
      tip: 'Move your eyes across all channels left-to-right. Look for sudden changes or sharp points.',
      icon: '👀'
    },
    {
      title: 'Compare Left vs Right',
      tip: 'If one side is very different from the other, it might indicate a specific problem on that side.',
      icon: '⚖️'
    },
    {
      title: 'Watch for Patterns',
      tip: 'Seizures often show repetitive, rhythmic patterns. Random noise is usually just artifact.',
      icon: '🔄'
    },
    {
      title: 'Note the Timing',
      tip: 'Record when abnormalities occur (timestamps matter for diagnosis).',
      icon: '⏰'
    },
    {
      title: 'Check Signal Quality',
      tip: 'Too much noise? Could be movement artifact, loose electrode, or poor connection.',
      icon: '🔌'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-8 border-2 border-blue-300 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center text-5xl shadow-md">
              🧠
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Comprehensive EEG & Seizure Guide</h1>
              <p className="text-lg text-gray-700 mt-2 font-bold">
                From Basics to Advanced Analysis - Everything You Need to Know
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-800 leading-relaxed">
              Welcome to NeuroDetect's comprehensive learning center. Whether you're a healthcare professional, student, or curious learner, this guide will take you through seizure types, EEG fundamentals, and how our AI system analyzes brain activity. Start with seizure basics and progress through advanced topics.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Section 1: What is a Seizure? */}
        <section className="bg-white rounded-2xl p-8 border-2 border-red-300 shadow-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'seizures' ? null : 'seizures')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg hover:from-red-100 hover:to-orange-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚡</span>
              <h2 className="text-2xl font-black text-gray-900">What is a Seizure?</h2>
            </div>
            <span className="text-2xl font-bold">{expandedSection === 'seizures' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'seizures' && (
            <div className="mt-6 space-y-6">
              {/* Basic Definition */}
              <div className="p-6 rounded-lg bg-red-50 border-2 border-red-200">
                <h3 className="text-xl font-black text-red-800 mb-3">🧠 Core Definition</h3>
                <p className="text-gray-800 leading-relaxed mb-4">
                  A seizure is a sudden, temporary change in brain function caused by abnormal electrical activity in the brain. During a seizure, groups of neurons fire rapidly and synchronously (together), disrupting normal brain function. This can cause various symptoms depending on which part of the brain is affected.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  <strong>Key Point:</strong> A seizure is NOT a disease itself—it's a symptom. Epilepsy is the tendency to have recurrent seizures.
                </p>
              </div>

              {/* What Happens During Seizure */}
              <div className="p-6 rounded-lg bg-orange-50 border-2 border-orange-200">
                <h3 className="text-xl font-black text-orange-800 mb-3">⚙️ What Happens During a Seizure?</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Normal State</p>
                      <p className="text-sm text-gray-700">Billions of neurons communicate in an organized, controlled way through electrical and chemical signals.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Abnormal Activity Begins</p>
                      <p className="text-sm text-gray-700">A group of neurons suddenly starts firing in an abnormal, synchronized pattern—like a "neurological storm."</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Spread & Symptoms</p>
                      <p className="text-sm text-gray-700">The abnormal activity spreads to other brain regions, causing visible symptoms (convulsions, loss of consciousness, behavioral changes, etc.).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">4️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Recovery</p>
                      <p className="text-sm text-gray-700">The seizure activity stops, neurons return to normal firing patterns, and brain function recovers.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Seizures Happen */}
              <div className="p-6 rounded-lg bg-yellow-50 border-2 border-yellow-200">
                <h3 className="text-xl font-black text-yellow-800 mb-3">❓ Common Causes of Seizures</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-yellow-300">
                    <p className="font-bold text-gray-800 mb-2">Structural Causes:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Brain tumor or lesion</li>
                      <li>• Stroke or brain injury</li>
                      <li>• Brain malformation</li>
                      <li>• Scar tissue in brain</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-300">
                    <p className="font-bold text-gray-800 mb-2">Triggers (Acute):</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• High fever (febrile seizures)</li>
                      <li>• Lack of sleep</li>
                      <li>• Low blood sugar</li>
                      <li>• Alcohol withdrawal</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-300">
                    <p className="font-bold text-gray-800 mb-2">Genetic/Neurological:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Epilepsy syndromes</li>
                      <li>• Genetic disorders</li>
                      <li>• Neurodevelopmental conditions</li>
                      <li>• Unknown cause (idiopathic)</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-300">
                    <p className="font-bold text-gray-800 mb-2">Other Causes:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Infections (meningitis, encephalitis)</li>
                      <li>• Metabolic disorders</li>
                      <li>• Medication effects</li>
                      <li>• Hypoxia (low oxygen)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Types of Seizures (ILAE Classification) */}
        <section className="bg-white rounded-2xl p-8 border-2 border-purple-300 shadow-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'types' ? null : 'types')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏥</span>
              <h2 className="text-2xl font-black text-gray-900">Types of Seizures (ILAE 2017)</h2>
            </div>
            <span className="text-2xl font-bold">{expandedSection === 'types' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'types' && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
                <p className="text-sm text-gray-700">
                  The International League Against Epilepsy (ILAE) classifies seizures into three main categories based on where the seizure starts and spreads in the brain.
                </p>
              </div>

              {/* Focal Seizures */}
              <div className="rounded-lg overflow-hidden border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="p-6 bg-blue-100 border-b-2 border-blue-200">
                  <h3 className="text-2xl font-black text-blue-900">🎯 Focal Seizures</h3>
                  <p className="text-sm text-blue-800 mt-2">Start in one specific area of the brain</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-black text-blue-800 mb-2">Focal Aware (Conscious)</h4>
                    <p className="text-sm text-gray-700 mb-3">Person remains aware and remembers the seizure</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>Focal Motor:</strong> Jerking in one limb or body part, often spreads gradually</li>
                      <li>• <strong>Focal Sensory:</strong> Tingling, numbness, visual disturbances</li>
                      <li>• <strong>Autonomic:</strong> Heart rate changes, sweating, nausea</li>
                      <li>• <strong>Behavioral:</strong> Automatisms (lip smacking, picking motions)</li>
                      <li>• <strong>Cognitive:</strong> Speech difficulty, memory lapses</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-black text-blue-800 mb-2">Focal Impaired Awareness</h4>
                    <p className="text-sm text-gray-700 mb-3">Person's awareness is altered or lost (previously called Complex Partial Seizures)</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Most common type of partial seizure</li>
                      <li>• Often originates in temporal lobe</li>
                      <li>• Characterized by blank stare, unresponsiveness</li>
                      <li>• May have automatisms (repetitive movements)</li>
                      <li>• Post-ictal confusion common (after seizure confusion)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-black text-blue-800 mb-2">Focal to Bilateral Tonic-Clonic</h4>
                    <p className="text-sm text-gray-700">Focal seizure that spreads to both sides of the brain, becoming a generalized seizure</p>
                  </div>
                </div>
              </div>

              {/* Generalized Seizures */}
              <div className="rounded-lg overflow-hidden border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="p-6 bg-red-100 border-b-2 border-red-200">
                  <h3 className="text-2xl font-black text-red-900">🌍 Generalized Seizures</h3>
                  <p className="text-sm text-red-800 mt-2">Start in both sides of the brain simultaneously</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-black text-red-800 mb-2">⚡ Tonic-Clonic (Grand Mal)</h4>
                    <p className="text-sm text-gray-700 mb-3">Most dramatic and recognizable seizure type</p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Phases:</strong></p>
                      <ul className="ml-4 space-y-1">
                        <li>1. <strong>Prodrome:</strong> May have warning signs (hours before)</li>
                        <li>2. <strong>Aura:</strong> Strange sensation right before seizure starts</li>
                        <li>3. <strong>Tonic Phase:</strong> Body stiffens, lasts 10-20 seconds</li>
                        <li>4. <strong>Clonic Phase:</strong> Rhythmic jerking movements, lasts 20-30 seconds</li>
                        <li>5. <strong>Post-ictal:</strong> Recovery phase with confusion, fatigue (30 min - hours)</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700 mt-3"><strong>EEG Pattern:</strong> 3 Hz spike-and-wave discharges, high amplitude activity</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-black text-red-800 mb-2">🧿 Absence (Petit Mal)</h4>
                    <p className="text-sm text-gray-700 mb-3">Brief lapses in consciousness, mostly in children</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Lasts 5-20 seconds, often multiple per day</li>
                      <li>• No warning or post-ictal confusion</li>
                      <li>• Person appears to "blank out" or stare</li>
                      <li>• May have subtle automatisms</li>
                      <li>• Can interfere with learning if frequent</li>
                      <li>• <strong>EEG Pattern:</strong> 3 Hz spike-and-wave (characteristic)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-black text-red-800 mb-2">💪 Myoclonic</h4>
                    <p className="text-sm text-gray-700">Brief jerks of muscles, often symmetrical</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Single or brief series of jerks</li>
                      <li>• No loss of consciousness (usually)</li>
                      <li>• Commonly occur upon awakening</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-black text-red-800 mb-2">🪨 Tonic</h4>
                    <p className="text-sm text-gray-700">Sustained muscle stiffness without jerking</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Muscles remain rigid</li>
                      <li>• Often during sleep</li>
                      <li>• Brief duration (10-20 seconds)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-black text-red-800 mb-2">📉 Atonic (Drop Attacks)</h4>
                    <p className="text-sm text-gray-700">Sudden loss of muscle tone</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Head or body suddenly drops/falls</li>
                      <li>• Person may fall unexpectedly</li>
                      <li>• Risk of injury, protective headgear recommended</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-black text-red-800 mb-2">⚪ Clonic</h4>
                    <p className="text-sm text-gray-700">Repetitive jerking without initial stiffness (rare, usually in infants)</p>
                  </div>
                </div>
              </div>

              {/* Unknown Seizures */}
              <div className="rounded-lg overflow-hidden border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50">
                <div className="p-6 bg-gray-200 border-b-2 border-gray-300">
                  <h3 className="text-2xl font-black text-gray-900">❓ Unknown Onset</h3>
                  <p className="text-sm text-gray-800 mt-2">Cannot be classified as focal or generalized (incomplete information)</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: What is EEG? */}
        <section className="bg-white rounded-2xl p-8 border-2 border-cyan-300 shadow-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'whateeg' ? null : 'whateeg')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg hover:from-cyan-100 hover:to-blue-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">🧠</span>
              <h2 className="text-2xl font-black text-gray-900">What is an EEG & How Does It Work?</h2>
            </div>
            <span className="text-2xl font-bold">{expandedSection === 'whateeg' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'whateeg' && (
            <div className="mt-6 space-y-6">
              <div className="p-6 rounded-lg bg-cyan-50 border-2 border-cyan-200">
                <h3 className="text-xl font-black text-cyan-800 mb-3">📊 EEG Definition</h3>
                <p className="text-gray-800 leading-relaxed">
                  <strong>EEG (Electroencephalogram)</strong> is a medical test that records electrical activity in the brain using small metal discs (electrodes) attached to the scalp. These electrodes detect the electrical signals produced by neurons and display them as wavy lines on a monitor—each line (channel) represents activity from a different brain region.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-blue-50 border-2 border-blue-200">
                <h3 className="text-xl font-black text-blue-800 mb-3">🔌 How Does EEG Work?</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-2xl">1️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Electrode Placement</p>
                      <p className="text-sm text-gray-700">Small electrodes are placed on the scalp in standard positions (10-20 system). Electrode paste ensures good contact with the skin.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">2️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Signal Detection</p>
                      <p className="text-sm text-gray-700">Electrodes pick up tiny electrical potentials (measured in microvolts, μV) generated by neural activity beneath the scalp.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">3️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Amplification</p>
                      <p className="text-sm text-gray-700">The signals are too weak to see directly, so they're amplified (usually 1,000-10,000 times) to make them visible.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">4️⃣</span>
                    <div>
                      <p className="font-bold text-gray-800">Recording & Display</p>
                      <p className="text-sm text-gray-700">The amplified signals are displayed as wavy lines. Modern systems store data digitally for analysis.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-indigo-50 border-2 border-indigo-200">
                <h3 className="text-xl font-black text-indigo-800 mb-3">🗺️ EEG Electrode Positions (10-20 System)</h3>
                <p className="text-sm text-gray-800 mb-4">
                  The international 10-20 system places electrodes at specific locations based on percentages of the distance from nasion to inion (front to back) and left to right preauricular points.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-indigo-300">
                    <p className="font-bold text-gray-800 mb-2">🟢 Lobe Regions:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>F (Frontal):</strong> Front, decision-making</li>
                      <li>• <strong>T (Temporal):</strong> Sides, memory & language</li>
                      <li>• <strong>P (Parietal):</strong> Top-back, sensation</li>
                      <li>• <strong>O (Occipital):</strong> Back, vision</li>
                      <li>• <strong>C (Central):</strong> Center, motor control</li>
                      <li>• <strong>A (Auricular):</strong> Ear reference point</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-indigo-300">
                    <p className="font-bold text-gray-800 mb-2">🔢 Position Numbers:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>Odd numbers (1, 3, 5...):</strong> Left side of brain</li>
                      <li>• <strong>Even numbers (2, 4, 6...):</strong> Right side of brain</li>
                      <li>• <strong>Z (zero):</strong> Midline (center)</li>
                      <li>• Example: <strong>Fp1</strong> = Frontal pole, left</li>
                      <li>• Example: <strong>T4</strong> = Temporal, right</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Frequency Bands Section */}
        <section className="bg-white rounded-2xl p-8 border-2 border-purple-300 shadow-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'bands' ? null : 'bands')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">📡</span>
              <h2 className="text-2xl font-black text-gray-900">Brain Wave Bands (Frequency Ranges)</h2>
            </div>
            <span className="text-2xl font-bold">{expandedSection === 'bands' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'bands' && (
            <div className="mt-6 space-y-8">
              {/* Frequency Band Selection */}
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
                {Object.entries(frequencyBands).map(([key, band]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedBand(key)}
                    className={`px-4 py-2 rounded-lg font-bold transition ${
                      selectedBand === key
                        ? 'bg-white border-2'
                        : 'bg-white border-2 border-gray-300 text-gray-600'
                    }`}
                    style={{
                      borderColor: selectedBand === key ? frequencyBands[key as keyof typeof frequencyBands].color : undefined,
                      color: selectedBand === key ? frequencyBands[key as keyof typeof frequencyBands].color : undefined
                    }}
                  >
                    {band.name}
                  </button>
                ))}
              </div>

              {/* Selected Band Details */}
              {Object.entries(frequencyBands).map(([key, band]) => (
                selectedBand === key && (
                  <div key={key} className="space-y-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 rounded-lg border-2" style={{ borderColor: band.color, backgroundColor: band.color + '10' }}>
                        <p className="text-sm font-bold text-gray-600 mb-2">Frequency Range</p>
                        <p className="text-2xl font-black" style={{ color: band.color }}>{band.range}</p>
                      </div>
                      <div className="p-6 rounded-lg bg-blue-50 border-2 border-blue-200">
                        <p className="text-sm font-bold text-gray-600 mb-2">Clinical Description</p>
                        <p className="text-base font-bold text-gray-800">{band.description}</p>
                      </div>
                    </div>

                    {/* Clinical Significance */}
                    <div className="p-6 rounded-lg bg-teal-50 border-2 border-teal-200">
                      <p className="text-sm font-bold text-gray-600 mb-2">📋 Clinical Significance</p>
                      <p className="text-base text-gray-800">{band.clinical}</p>
                    </div>

                    {/* Examples */}
                    <div className="p-6 rounded-lg bg-cyan-50 border-2 border-cyan-200">
                      <p className="text-sm font-bold text-gray-600 mb-3">✓ Common Examples</p>
                      <ul className="space-y-2">
                        {band.examples.map((ex, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-800">
                            <span className="text-lg">→</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="p-6 rounded-lg border-2 border-gray-200 bg-gray-50">
                      <p className="text-sm font-bold text-gray-600 mb-4">📊 Visual Representation</p>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={band.waveform}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="time" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '2px solid ' + band.color }}
                            cursor={{ stroke: band.color, strokeWidth: 2 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={band.color} 
                            dot={false}
                            strokeWidth={3}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </section>

        {/* Parameters Section */}
        <section className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'params' ? null : 'params')}
            className="w-full flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔬</span>
              <h2 className="text-2xl font-black text-gray-900">Key EEG Parameters</h2>
            </div>
            <span className="text-2xl">{expandedSection === 'params' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'params' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {parameters.map((param) => (
                <div
                  key={param.id}
                  className="p-6 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-green-300 transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{param.icon}</span>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{param.title}</h3>
                      <p className="text-sm text-gray-600">{param.unit}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-gray-600 mb-2">Definition</p>
                      <p className="text-sm text-gray-700">{param.description}</p>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-600 mb-2">Visual Representation</p>
                      <p className="text-sm text-gray-700">{param.visual}</p>
                    </div>

                    <div className="p-3 bg-white rounded border border-gray-300">
                      <p className="text-sm font-bold text-green-700 mb-1">✓ Normal Range</p>
                      <p className="text-sm text-gray-700">{param.normal}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-bold text-red-700">⚠ Abnormal Signs</p>
                      {param.abnormal.map((sign, i) => (
                        <div key={i} className="p-2 bg-red-50 rounded border border-red-200">
                          <p className="text-sm text-red-700">{sign}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seizure Markers Section */}
        <section className="bg-white rounded-2xl p-8 border-2 border-red-200 shadow-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'seizure' ? null : 'seizure')}
            className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <h2 className="text-2xl font-black text-gray-900">Seizure Markers & Abnormal Patterns</h2>
            </div>
            <span className="text-2xl">{expandedSection === 'seizure' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'seizure' && (
            <div className="mt-6 space-y-4">
              {seizureMarkers.map((marker, i) => (
                <div key={i} className="p-6 rounded-lg bg-red-50 border-2 border-red-200">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{marker.visual}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900 mb-2">{marker.name}</h3>
                      <p className="text-sm text-gray-700 mb-3">{marker.description}</p>
                      <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                        {marker.clinical}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How to Read EEG Section */}
        <section className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
          <button
            onClick={() => setExpandedSection(expandedSection === 'reading' ? null : 'reading')}
            className="w-full flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">👁️</span>
              <h2 className="text-2xl font-black text-gray-900">How to Read an EEG</h2>
            </div>
            <span className="text-2xl">{expandedSection === 'reading' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'reading' && (
            <div className="mt-6 space-y-6">
              {/* Step-by-step guide */}
              <div className="space-y-4">
                {readingTips.map((tip, i) => (
                  <div key={i} className="p-6 rounded-lg bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400 transition">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{tip.icon}</span>
                      <h3 className="text-lg font-black text-gray-900">{tip.title}</h3>
                    </div>
                    <p className="text-gray-700 ml-16">{tip.tip}</p>
                  </div>
                ))}
              </div>

              {/* Sample EEG Interpretation */}
              <div className="p-8 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300">
                <h3 className="text-xl font-black text-gray-900 mb-4">📊 Sample EEG Interpretation</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-indigo-200">
                    <p className="text-sm font-bold text-gray-700 mb-2">NORMAL EEG (Awake, Eyes Closed)</p>
                    <p className="text-sm text-gray-600">
                      • Alpha waves (8-12 Hz) prominent in posterior regions<br/>
                      • Regular, symmetric patterns<br/>
                      • Background activity 10-50 μV<br/>
                      • No sharp waves or spikes
                    </p>
                  </div>
                    <div className="p-4 bg-white rounded-lg border border-orange-200">
                      <p className="text-sm font-bold text-gray-700 mb-2">ABNORMAL EEG (Possible Seizure Activity)</p>
                      <p className="text-sm text-gray-600">
                        • Spike and wave discharges (sharp 20-70ms followed by slow wave)<br/>
                        • High amplitude bursts ({`>`}100 μV)<br/>
                        • Abnormal rhythmic patterns (2-3 Hz repetitive)<br/>
                        • Focal abnormalities (activity in one region)
                      </p>
                    </div>
                </div>
              </div>

              {/* Visual EEG Diagram */}
              <div className="p-8 rounded-lg bg-gray-50 border-2 border-gray-300">
                <h3 className="text-xl font-black text-gray-900 mb-6">🎨 Visual EEG Patterns</h3>
                <div className="space-y-8">
                  {/* Normal EEG */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">Normal Awake EEG (Alpha Rhythm)</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={generateWaveform(10, 40, 400)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-600 mt-2">Regular sine-wave pattern = healthy, relaxed state</p>
                  </div>

                  {/* Abnormal EEG - High Frequency */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">Abnormal: High Frequency Burst (Seizure)</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={generateWaveform(40, 80, 400)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-red-600 mt-2">⚠️ Rapid oscillations indicate abnormal activity</p>
                  </div>

                  {/* Delta Waves */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">Abnormal: Delta Waves in Awake Patient</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={generateWaveform(2, 120, 400)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-orange-600 mt-2">⚠️ Slow, large waves abnormal if patient is awake</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Quick Reference Card */}
        <section className="bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100 rounded-2xl p-8 border-2 border-cyan-300 shadow-lg">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            Quick Reference Checklist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border-2 border-green-200">
              <p className="text-lg font-black text-green-700 mb-4">✓ Signs of NORMAL EEG</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Regular, symmetric patterns both sides</li>
                <li>✅ 8-12 Hz alpha rhythm when eyes closed</li>
                <li>✅ 10-50 μV amplitude (not too high, not too low)</li>
                <li>✅ No sharp waves, spikes, or bursts</li>
                <li>✅ Entropy 0.4 - 0.8 (reasonably random)</li>
                <li>✅ SNR {`>`} 5 dB (clear signal)</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-red-200">
              <p className="text-lg font-black text-red-700 mb-4">⚠️ Signs of ABNORMAL EEG</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>🚨 Sharp waves or spike patterns</li>
                <li>🚨 Amplitude {`>`}300 μV (too high)</li>
                <li>🚨 Focal slowing in one region</li>
                <li>🚨 3 Hz spike-and-wave pattern</li>
                <li>🚨 Entropy {`<`}0.2 (too regular/repetitive)</li>
                <li>🚨 Asymmetry between left and right brain</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="bg-white rounded-2xl p-8 border-2 border-gray-200">
          <h3 className="text-xl font-black text-gray-900 mb-4">💡 Important Reminder</h3>
          <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-l-blue-500 space-y-3">
            <p className="text-gray-800">
              <strong>This tool is an AI-assisted screening aid, not a diagnostic tool.</strong> EEG interpretation requires trained neurologists and medical professionals. Always consult with healthcare providers for:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 ml-4">
              <li>• Clinical diagnosis and seizure classification</li>
              <li>• Treatment decisions and medication</li>
              <li>• Prognosis and follow-up care</li>
              <li>• Any concerns about abnormal results</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrerequisitesPage;
