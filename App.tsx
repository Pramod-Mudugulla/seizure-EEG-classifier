
import React, { useState, useRef } from 'react';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';
import { EEGData, EEGAnalysisResult, PredictionLabel } from './types';
import { parseCSV, analyzeEEGSignal, analyzeEEGImage } from './services/eegAnalysis';
import PrerequisitesPage from './PrerequisitesPage';

type FileType = 'csv' | 'image' | null;
type View = 'analyze' | 'prerequisites' | 'research';

const App: React.FC = () => {
  const [view, setView] = useState<View>('analyze');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [eegData, setEegData] = useState<EEGData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EEGAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const isCsv = uploadedFile.name.endsWith('.csv');
      const isImage = uploadedFile.type.startsWith('image/');

      if (!isCsv && !isImage) {
        setError('Please upload a .csv file or an image (.png, .jpg, .jpeg)');
        return;
      }

      setFile(uploadedFile);
      setFileType(isCsv ? 'csv' : 'image');
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const resultStr = event.target?.result as string;
        if (isCsv) {
          try {
            const parsed = parseCSV(resultStr);
            setEegData(parsed);
          } catch (err) {
            setError('Failed to parse EEG CSV data.');
          }
        } else {
          setFilePreview(resultStr);
        }
      };

      if (isCsv) {
        reader.readAsText(uploadedFile);
      } else {
        reader.readAsDataURL(uploadedFile);
      }
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      if (fileType === 'csv' && eegData) {
        const analysisResult = await analyzeEEGSignal(eegData);
        setResult(analysisResult);
      } else if (fileType === 'image' && filePreview) {
        const analysisResult = await analyzeEEGImage(filePreview);
        setResult(analysisResult);
      }
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Check your connection or API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setFileType(null);
    setFilePreview(null);
    setEegData(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadReport = () => {
    const reportContent = `
AN ARTIFICIAL ORIENTED SYSTEM TO IDENTIFY TYPE OF EPILEPTIC SEIZURE USING EEG WAVE
----------------------------------------------------------------------------------

CHAPTER 1: INTRODUCTION
Noninvasive neuroimaging techniques including functional magnetic resonance imaging, functional near-infrared spectroscopy, and electroencephalogram (EEG) are emerging as key tools...

CHAPTER 2: LITERATURE SURVEY
Seizure prediction based on classification of EEG synchronization patterns with on-line retraining and post-processing scheme...

CHAPTER 3: SYSTEM ANALYSIS
Drawbacks of existing systems: Always contaminated with artifacts, difficult to analyze, distorted EEG activity. Proposed system uses Regression algorithms and DWT...

CHAPTER 4: SYSTEM DESIGN
Input Signal -> Preprocessing -> Segmentation -> Feature Extraction -> Training -> ANN Classification.

CHAPTER 5: IMPLEMENTATION
Technologies: Discrete Wavelet Transformation (DWT), Artificial Neural Networks (ANN).

CHAPTER 6: TESTING
Functional and Integration testing ensures the system meets the technical requirements...

CHAPTER 7: RESULTS
Successful classification of Normal vs Epilepsy detected cases. Accuracy: 90.9%

CHAPTER 8: CONCLUSION
The project successfully detects seizure patterns from EEG signals using ML architectures.
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'NeuroDetect_Research_Report.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = eegData?.values.slice(0, 1000).map((v, i) => ({
    time: i,
    value: v
  })) || [];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 px-8 py-6 flex justify-between items-center border-b border-gray-100">
        <button onClick={() => setView('analyze')} className="text-2xl font-black tracking-tighter uppercase italic">
          NeuroDetect
        </button>
        <div className="flex space-x-8 text-xs font-bold uppercase tracking-widest">
          <button 
            onClick={() => setView('analyze')} 
            className={`${view === 'analyze' ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Analyzer
          </button>
          <button 
            onClick={() => setView('prerequisites')} 
            className={`${view === 'prerequisites' ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Learn
          </button>
          <button 
            onClick={() => setView('research')} 
            className={`${view === 'research' ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Research
          </button>
        </div>
      </nav>

      {view === 'prerequisites' ? (
        <PrerequisitesPage />
      ) : view === 'research' ? (
        <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
          <section className="mb-16">
            <h2 className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter mb-4">
              Research & Documentation
            </h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl font-medium">
              Project documentation, research papers, and technical specifications for the seizure EEG classifier system.
            </p>
          </section>

          <div className="space-y-12">
            {/* Research Overview */}
            <div className="bg-gray-50 rounded-3xl p-12 border-4 border-gray-200">
              <h3 className="text-3xl font-black uppercase mb-6">Project Overview</h3>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  <strong>NeuroDetect</strong> is an AI-powered EEG analysis system designed to assist in the identification and classification of seizure activity from electroencephalogram signals. This research project combines machine learning, signal processing, and neuroimaging to provide rapid seizure detection and type classification.
                </p>
                <p>
                  The system uses advanced deep learning models trained on publicly available EEG datasets and integrates Google's Gemini API for enhanced image-based EEG analysis and clinical interpretation.
                </p>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-blue-50 rounded-3xl p-12 border-4 border-blue-200">
              <h3 className="text-3xl font-black uppercase mb-6">Technical Architecture</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-black mb-4 text-blue-900">Frontend Stack</h4>
                  <ul className="space-y-2 text-base font-medium">
                    <li>⚛️ React 18+ with TypeScript</li>
                    <li>🎨 Tailwind CSS for styling</li>
                    <li>📊 Recharts for visualization</li>
                    <li>🔧 Vite as build tool</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-black mb-4 text-blue-900">Backend Stack</h4>
                  <ul className="space-y-2 text-base font-medium">
                    <li>🐍 Python 3.8+ with Flask</li>
                    <li>🧠 TensorFlow/Keras for ML</li>
                    <li>🤖 Google Gemini 3-Flash API</li>
                    <li>📈 NumPy, SciPy for signal processing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Methodology */}
            <div className="bg-green-50 rounded-3xl p-12 border-4 border-green-200">
              <h3 className="text-3xl font-black uppercase mb-6">Methodology</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-black mb-2">Signal Processing Pipeline</h4>
                  <p className="text-base leading-relaxed">
                    Raw EEG signals are preprocessed through filtering, artifact removal, and segmentation. Features are extracted using wavelet transform, spectral analysis, and statistical measures. The processed signals are classified using LSTM neural networks.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-black mb-2">Seizure Classification</h4>
                  <p className="text-base leading-relaxed">
                    Classification follows the 2017 ILAE (International League Against Epilepsy) standards, distinguishing between motor seizures, non-motor seizures, and various subtypes. Frequency band analysis (Delta, Theta, Alpha, Beta, Gamma) informs the classification decision.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-black mb-2">AI-Assisted Interpretation</h4>
                  <p className="text-base leading-relaxed">
                    Gemini AI analyzes EEG images to provide detailed clinical context, including seizure type, motor component, awareness status, and recommended next steps.
                  </p>
                </div>
              </div>
            </div>

            {/* Citation & Downloads */}
            <div className="bg-purple-50 rounded-3xl p-12 border-4 border-purple-200">
              <h3 className="text-3xl font-black uppercase mb-6">Resources</h3>
              <button 
                onClick={handleDownloadReport}
                className="px-8 py-4 bg-black text-white font-black uppercase rounded-2xl hover:bg-gray-800 transition-all text-sm"
              >
                📥 Download Research Report
              </button>
              <p className="text-sm text-gray-600 mt-4">
                Contains detailed project documentation, methodology, results, and future work.
              </p>
            </div>
          </div>
        </main>
      ) : (
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        {view === 'analyze' ? (
          <>
            <section className="mb-16">
              <h2 className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter mb-4">
                Just Detect It.
              </h2>
              <p className="text-lg md:text-xl text-gray-500 max-w-2xl font-medium">
                Advanced EEG seizure classification powered by machine learning and visual AI. Minimal interface. Maximum clarity.
              </p>
            </section>

            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-4 border-dashed border-gray-200 rounded-3xl p-20 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all duration-300"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".csv, image/*"
                />
                <div className="bg-black text-white rounded-full p-4 mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-xl font-black uppercase italic tracking-tight">Upload EEG Source</p>
                <p className="text-sm text-gray-400 mt-2">Supports .CSV data or Signal Images (.JPG, .PNG)</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
                        {fileType === 'csv' ? 'Signal Waveform' : 'Image Scan'}
                      </h3>
                      <p className="text-lg font-bold">{file?.name}</p>
                    </div>
                    <button 
                      onClick={reset}
                      className="text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                      Change File
                    </button>
                  </div>
                  
                  {fileType === 'csv' ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis hide />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelClassName="hidden"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#000" 
                            strokeWidth={1.5} 
                            dot={false} 
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="relative h-64 w-full overflow-hidden rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                      <img src={filePreview!} alt="EEG Preview" className="h-full object-contain" />
                    </div>
                  )}
                </div>

                {!result && (
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full py-6 rounded-full text-xl font-black uppercase italic tracking-tighter transition-all ${
                      isAnalyzing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900 active:scale-95'
                    }`}
                  >
                    {isAnalyzing ? 'Processing Signal...' : 'Analyze Signal'}
                  </button>
                )}

                {result && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    {/* CLINICAL WHITE HEADER */}
                    <div className={`rounded-2xl p-10 border-l-8 transition-all ${
                      result.prediction === PredictionLabel.SEIZURE 
                        ? 'bg-white border-l-red-500 shadow-lg' 
                        : 'bg-white border-l-teal-500 shadow-lg'
                    }`}>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* PRIMARY DIAGNOSIS */}
                        <div className="flex flex-col justify-center">
                          <p className="text-xs font-bold uppercase tracking-[2px] text-gray-500 mb-3">Diagnosis</p>
                          <div className={`text-5xl font-black uppercase mb-4 ${
                            result.prediction === PredictionLabel.SEIZURE ? 'text-red-600' : 'text-teal-600'
                          }`}>
                            {result.prediction === PredictionLabel.SEIZURE ? 'SEIZURE' : 'NORMAL'}
                          </div>
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm w-fit ${
                            result.prediction === PredictionLabel.SEIZURE 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                              result.prediction === PredictionLabel.SEIZURE ? 'bg-red-500' : 'bg-teal-500'
                            }`}></span>
                            {result.prediction === PredictionLabel.SEIZURE ? 'ALERT' : 'NORMAL'}
                          </div>
                        </div>

                        {/* METRICS */}
                        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-all">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Confidence</p>
                            <p className="text-4xl font-black text-gray-800 mb-2">{result.confidence.toFixed(1)}%</p>
                            <div className="w-full bg-gray-200 rounded h-1 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  result.confidence > 90 ? 'bg-teal-500' :
                                  result.confidence > 70 ? 'bg-blue-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-all">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Response</p>
                            <p className="text-4xl font-black text-gray-800 mb-2">{result.inferenceTimeMs}</p>
                            <p className="text-xs text-gray-600">milliseconds</p>
                          </div>

                          <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-all">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Signal Quality</p>
                            <p className="text-3xl font-black text-gray-800">{result.signalQuality}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Frequency Band Analysis with Bar Chart */}
                    {result.frequencyAnalysis && (
                      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Frequency Band Distribution</h3>
                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Delta\n(0.5-4 Hz)', value: result.frequencyAnalysis.delta, fill: '#8B5CF6' },
                              { name: 'Theta\n(4-8 Hz)', value: result.frequencyAnalysis.theta, fill: '#3B82F6' },
                              { name: 'Alpha\n(8-12 Hz)', value: result.frequencyAnalysis.alpha, fill: '#10B981' },
                              { name: 'Beta\n(12-30 Hz)', value: result.frequencyAnalysis.beta, fill: '#F59E0B' },
                              { name: 'Gamma\n(30+ Hz)', value: result.frequencyAnalysis.gamma, fill: '#EF4444' }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} />
                              <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: '#fff' }}
                                formatter={(value) => `${typeof value === 'number' ? value.toFixed(2) : value} µV²`}
                              />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {[result.frequencyAnalysis.delta, result.frequencyAnalysis.theta, result.frequencyAnalysis.alpha, result.frequencyAnalysis.beta, result.frequencyAnalysis.gamma].map((_, index) => (
                                  <Cell key={`cell-${index}`} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Frequency Distribution Pie Chart */}
                    {result.frequencyAnalysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Band Power Composition</h3>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Delta', value: result.frequencyAnalysis.delta, fill: '#8B5CF6' },
                                    { name: 'Theta', value: result.frequencyAnalysis.theta, fill: '#3B82F6' },
                                    { name: 'Alpha', value: result.frequencyAnalysis.alpha, fill: '#10B981' },
                                    { name: 'Beta', value: result.frequencyAnalysis.beta, fill: '#F59E0B' },
                                    { name: 'Gamma', value: result.frequencyAnalysis.gamma, fill: '#EF4444' }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, value }) => `${name}: ${typeof value === 'number' ? value.toFixed(0) : value}`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                </Pie>
                                <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(2) : value} µV²`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Cumulative Band Power</h3>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={[
                                { band: 'Delta', power: result.frequencyAnalysis.delta, cumulative: result.frequencyAnalysis.delta },
                                { band: 'Theta', power: result.frequencyAnalysis.theta, cumulative: result.frequencyAnalysis.delta + result.frequencyAnalysis.theta },
                                { band: 'Alpha', power: result.frequencyAnalysis.alpha, cumulative: result.frequencyAnalysis.delta + result.frequencyAnalysis.theta + result.frequencyAnalysis.alpha },
                                { band: 'Beta', power: result.frequencyAnalysis.beta, cumulative: result.frequencyAnalysis.delta + result.frequencyAnalysis.theta + result.frequencyAnalysis.alpha + result.frequencyAnalysis.beta },
                                { band: 'Gamma', power: result.frequencyAnalysis.gamma, cumulative: result.frequencyAnalysis.delta + result.frequencyAnalysis.theta + result.frequencyAnalysis.alpha + result.frequencyAnalysis.beta + result.frequencyAnalysis.gamma }
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="band" fontSize={11} tick={{ fill: '#6b7280' }} />
                                <YAxis fontSize={11} tick={{ fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="cumulative" fill="#6366f1" stroke="#4f46e5" fillOpacity={0.3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Signal Analysis Radar Chart */}
                    {result.signalMetrics && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Signal Profile</h3>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={[
                                { name: 'SNR', value: Math.min((result.signalMetrics.snr + 10) / 2, 100), fullMark: 100 },
                                { name: 'Peak Freq', value: result.signalMetrics.peakFrequency * 2, fullMark: 100 },
                                { name: 'Spectral', value: result.signalMetrics.spectralCentroid * 2, fullMark: 100 },
                                { name: 'Entropy', value: result.stats.entropy * 100, fullMark: 100 },
                                { name: 'Quality', value: result.signalQuality === 'Excellent' ? 100 : result.signalQuality === 'Good' ? 80 : result.signalQuality === 'Fair' ? 60 : 40, fullMark: 100 }
                              ]}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="name" fontSize={11} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                <Radar name="Metrics" dataKey="value" stroke="#000" fill="#000" fillOpacity={0.3} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Signal-to-Noise Ratio</p>
                            <p className="text-3xl font-black text-black mb-2">{result.signalMetrics.snr.toFixed(2)} dB</p>
                            <p className="text-xs text-gray-500">{result.signalMetrics.snr > 10 ? '✓ Clean signal' : '⚠ Noisy signal'}</p>
                          </div>
                          <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Peak Frequency</p>
                            <p className="text-3xl font-black text-black mb-2">{result.signalMetrics.peakFrequency.toFixed(2)} Hz</p>
                            <p className="text-xs text-gray-500">Dominant oscillation frequency</p>
                          </div>
                          <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Spectral Centroid</p>
                            <p className="text-3xl font-black text-black mb-2">{result.signalMetrics.spectralCentroid.toFixed(2)} Hz</p>
                            <p className="text-xs text-gray-500">Center of frequency distribution</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Statistical Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-100">
                      <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Mean Amplitude</p>
                        <p className="text-3xl font-black text-black">{result.stats.mean.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">µV</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-200">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Std. Deviation</p>
                        <p className="text-3xl font-black text-black">{result.stats.std.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">µV</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Signal Entropy</p>
                        <p className="text-3xl font-black text-black">{result.stats.entropy.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Normalized</p>
                      </div>
                    </div>

                    {/* Signal Quality Gauge */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Quality Assessment Metrics</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs font-bold text-gray-600">Signal Quality</span>
                              <span className="text-xs font-bold text-gray-600">{result.signalQuality}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  result.signalQuality === 'Excellent' ? 'bg-green-500 w-full' :
                                  result.signalQuality === 'Good' ? 'bg-green-400 w-3/4' :
                                  result.signalQuality === 'Fair' ? 'bg-yellow-400 w-1/2' :
                                  'bg-red-500 w-1/4'
                                }`}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs font-bold text-gray-600">Classification Confidence</span>
                              <span className="text-xs font-bold text-gray-600">{result.confidence.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  result.confidence > 85 ? 'bg-green-500' :
                                  result.confidence > 70 ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs font-bold text-gray-600">Signal-to-Noise Ratio</span>
                              <span className="text-xs font-bold text-gray-600">{result.signalMetrics?.snr.toFixed(2) || 0} dB</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min((result.signalMetrics?.snr || 0) / 20 * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Frequency Band Comparison</h3>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={[
                              { band: 'Delta', value: result.frequencyAnalysis?.delta || 0 },
                              { band: 'Theta', value: result.frequencyAnalysis?.theta || 0 },
                              { band: 'Alpha', value: result.frequencyAnalysis?.alpha || 0 },
                              { band: 'Beta', value: result.frequencyAnalysis?.beta || 0 },
                              { band: 'Gamma', value: result.frequencyAnalysis?.gamma || 0 }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="band" fontSize={11} tick={{ fill: '#6b7280' }} />
                              <YAxis fontSize={11} tick={{ fill: '#6b7280' }} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Key Findings */}
                    {result.findings && result.findings.length > 0 && (
                      <div className="bg-blue-50 rounded-3xl p-8 border border-blue-200">
                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                          <span className="text-lg">💡</span> Key Findings
                        </h3>
                        <ul className="space-y-3">
                          {result.findings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <span className="text-blue-600 font-black mt-0.5">→</span>
                              <span className="text-gray-700">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Seizure Type Classification - CLINICAL WHITE */}
                    {result.prediction === PredictionLabel.SEIZURE && result.seizureClassification && (
                      <div className="rounded-2xl p-10 bg-white border border-gray-200 shadow-lg">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl ${
                              result.prediction === PredictionLabel.SEIZURE 
                                ? 'bg-red-50 border-2 border-red-200' 
                                : 'bg-teal-50 border-2 border-teal-200'
                            }`}>
                              {result.prediction === PredictionLabel.SEIZURE ? '⚠️' : '✓'}
                            </div>
                            <div>
                              <h3 className="text-2xl font-black uppercase text-gray-800">Seizure Classification</h3>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">ILAE 2017 Standard</p>
                            </div>
                          </div>
                          {result.seizureClassification.urgency && (
                            <div className="bg-red-100 text-red-800 px-5 py-2 rounded-lg text-xs font-black border border-red-300">
                              {result.seizureClassification.urgency}
                            </div>
                          )}
                        </div>
                        
                        {/* Onset Type - Main Classification */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                          <div className="rounded-lg p-6 border-2 border-teal-200 bg-teal-50 text-center">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Seizure Onset</p>
                            <p className="text-xl font-black text-teal-700">
                              {result.seizureClassification.onsetType}
                            </p>
                          </div>

                          <div className="rounded-lg p-6 border-2 border-blue-200 bg-blue-50 text-center">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Consciousness</p>
                            <p className="text-xl font-black text-blue-700">
                              {result.seizureClassification.awarenessStatus}
                            </p>
                          </div>

                          <div className="rounded-lg p-6 border-2 border-cyan-200 bg-cyan-50 text-center">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Motor Component</p>
                            <p className="text-xl font-black text-cyan-700">
                              {result.seizureClassification.motorSubtype}
                            </p>
                          </div>
                        </div>

                        {/* Motor vs Non-Motor Classification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                          {result.seizureClassification.motorTypes.length > 0 && (
                            <div className="rounded-lg p-6 border-2 border-blue-200 bg-blue-50">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-lg">⚡</div>
                                <p className="text-lg font-black text-blue-700 uppercase">Motor</p>
                              </div>
                              <ul className="space-y-2">
                                {result.seizureClassification.motorTypes.map((type, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm font-bold text-gray-700">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span>{type}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {result.seizureClassification.nonMotorTypes.length > 0 && (
                            <div className="rounded-lg p-6 border-2 border-teal-200 bg-teal-50">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center text-lg">✨</div>
                                <p className="text-lg font-black text-teal-700 uppercase">Non-Motor</p>
                              </div>
                              <ul className="space-y-2">
                                {result.seizureClassification.nonMotorTypes.map((type, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm font-bold text-gray-700">
                                    <span className="text-teal-600 mt-1">✓</span>
                                    <span>{type}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Specific Seizure Types & Clinical Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                          <div className="rounded-lg p-6 border-2 border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-lg">🔍</div>
                              <p className="text-lg font-black text-gray-800 uppercase">Detected Types</p>
                            </div>
                            <ul className="space-y-2">
                              {result.seizureClassification.specificTypes.map((type, idx) => (
                                <li key={idx} className="text-sm font-bold text-gray-700 border-l-4 border-gray-400 pl-3">
                                  {type}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {result.seizureClassification.description && (
                            <div className="rounded-lg p-6 border-2 border-blue-200 bg-blue-50">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-lg">📋</div>
                                <p className="text-lg font-black text-blue-800 uppercase">Clinical Profile</p>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {result.seizureClassification.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Focus Location & ILAE Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {result.seizureClassification.focusLocation && (
                            <div className="rounded-lg p-6 border-2 border-purple-200 bg-purple-50">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center text-lg">🧠</div>
                                <p className="text-lg font-black text-purple-800 uppercase">Brain Focus</p>
                              </div>
                              <p className="text-sm font-bold text-gray-700 mb-3">
                                {result.seizureClassification.focusLocation}
                              </p>
                              <div className="p-2 bg-white rounded border border-purple-200">
                                <p className="text-xs text-gray-600">Localized origin point</p>
                              </div>
                            </div>
                          )}

                          <div className="rounded-lg p-6 border-2 border-cyan-200 bg-cyan-50">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-cyan-100 rounded flex items-center justify-center text-lg">🏥</div>
                              <p className="text-lg font-black text-cyan-800 uppercase">ILAE Code</p>
                            </div>
                            <p className="text-sm font-bold text-gray-700 mb-3 bg-white rounded p-2 border border-cyan-200">
                              {result.seizureClassification.ilaClassification}
                            </p>
                            <div className="space-y-2 text-xs">
                              <p className="text-gray-600">Authority: <span className="font-black">2017</span></p>
                              <p className="text-gray-600">Confidence: <span className="font-black">{result.confidence.toFixed(1)}%</span></p>
                              <div className="w-full bg-gray-300 rounded h-1 mt-2 overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    result.confidence > 90 ? 'bg-teal-500' :
                                    result.confidence > 70 ? 'bg-blue-500' :
                                    'bg-orange-500'
                                  }`}
                                  style={{ width: `${result.confidence}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Normative Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Signal vs Normal Range</h3>
                        <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { 
                                metric: 'Mean Amplitude',
                                current: Math.abs(result.stats.mean),
                                normal: 50,
                                critical: 100
                              },
                              { 
                                metric: 'Std Deviation',
                                current: result.stats.std,
                                normal: 150,
                                critical: 400
                              },
                              { 
                                metric: 'Entropy',
                                current: result.stats.entropy * 100,
                                normal: 60,
                                critical: 100
                              }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="metric" fontSize={10} tick={{ fill: '#6b7280' }} />
                              <YAxis fontSize={10} tick={{ fill: '#6b7280' }} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Legend />
                              <Bar dataKey="current" fill="#3B82F6" name="Current" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="normal" fill="#10B981" name="Normal Range" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="critical" fill="#EF4444" name="Critical Threshold" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Risk Level Assessment</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-gray-600">Amplitude Risk</span>
                              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                                Math.abs(result.stats.mean) > 75 ? 'bg-red-100 text-red-700' :
                                Math.abs(result.stats.mean) > 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {Math.abs(result.stats.mean) > 75 ? 'HIGH' :
                                 Math.abs(result.stats.mean) > 50 ? 'MODERATE' : 'LOW'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  Math.abs(result.stats.mean) > 75 ? 'bg-red-500' :
                                  Math.abs(result.stats.mean) > 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((Math.abs(result.stats.mean) / 100) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-gray-600">Variability Risk</span>
                              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                                result.stats.std > 350 ? 'bg-red-100 text-red-700' :
                                result.stats.std > 200 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {result.stats.std > 350 ? 'HIGH' :
                                 result.stats.std > 200 ? 'MODERATE' : 'LOW'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  result.stats.std > 350 ? 'bg-red-500' :
                                  result.stats.std > 200 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((result.stats.std / 400) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-gray-600">Entropy Risk</span>
                              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                                result.stats.entropy > 0.8 ? 'bg-red-100 text-red-700' :
                                result.stats.entropy > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {result.stats.entropy > 0.8 ? 'HIGH' :
                                 result.stats.entropy > 0.5 ? 'MODERATE' : 'LOW'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  result.stats.entropy > 0.8 ? 'bg-red-500' :
                                  result.stats.entropy > 0.5 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${result.stats.entropy * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dominant Band Analysis */}
                    {result.frequencyAnalysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Band Dominance Pattern</h3>
                          <div className="space-y-3">
                            {[
                              { band: 'Delta', value: result.frequencyAnalysis.delta, color: '#8B5CF6', range: '0.5-4 Hz', meaning: 'Deep sleep/Abnormality' },
                              { band: 'Theta', value: result.frequencyAnalysis.theta, color: '#3B82F6', range: '4-8 Hz', meaning: 'Drowsiness/Meditation' },
                              { band: 'Alpha', value: result.frequencyAnalysis.alpha, color: '#10B981', range: '8-12 Hz', meaning: 'Relaxation (Normal)' },
                              { band: 'Beta', value: result.frequencyAnalysis.beta, color: '#F59E0B', range: '12-30 Hz', meaning: 'Active thinking' },
                              { band: 'Gamma', value: result.frequencyAnalysis.gamma, color: '#EF4444', range: '30+ Hz', meaning: 'High cognitive load' }
                            ].map((item, idx) => {
                              const isHighest = item.value === Math.max(
                                result.frequencyAnalysis!.delta,
                                result.frequencyAnalysis!.theta,
                                result.frequencyAnalysis!.alpha,
                                result.frequencyAnalysis!.beta,
                                result.frequencyAnalysis!.gamma
                              );
                              return (
                                <div key={idx} className={`p-4 rounded-xl border-2 ${
                                  isHighest ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                      <span className="font-bold text-sm">{item.band}</span>
                                    </div>
                                    {isHighest && <span className="text-xs font-black bg-black text-white px-2 py-1 rounded">DOMINANT</span>}
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>{item.range}</span>
                                    <span className="font-bold">{item.value.toFixed(2)} µV²</span>
                                  </div>
                                  <p className="text-xs text-gray-500 italic">{item.meaning}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Clinical Interpretation</h3>
                          <div className="space-y-4">
                            <div className="p-5 bg-white rounded-xl border-2 border-gray-200">
                              <p className="text-xs font-black text-gray-400 uppercase mb-2">Seizure Type Assessment</p>
                              <p className="text-sm font-bold text-gray-800 mb-2">
                                {result.dominantBand === 'Delta' && 'Generalized or Focal Onset Seizure'}
                                {result.dominantBand === 'Theta' && 'Temporal Lobe / Focal Aware Seizure'}
                                {result.dominantBand === 'Alpha' && 'Atypical / Unknown Onset Seizure'}
                                {result.dominantBand === 'Beta' && 'Motor / Awareness-Related Seizure'}
                                {result.dominantBand === 'Gamma' && 'Critical High-Frequency Discharge'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {result.dominantBand === 'Delta' && 'Slow-wave dominance suggests either generalized tonic-clonic, absence, or focal seizures with secondary generalization.'}
                                {result.dominantBand === 'Theta' && 'Theta-dominant activity often associated with temporal lobe epilepsy or focal impaired awareness seizures.'}
                                {result.dominantBand === 'Alpha' && 'Alpha-band activity may indicate atypical seizure patterns or unknown-onset seizures requiring further investigation.'}
                                {result.dominantBand === 'Beta' && 'Beta activity suggests motor cortex involvement or seizures with preserved awareness and motor manifestations.'}
                                {result.dominantBand === 'Gamma' && 'High-frequency gamma oscillations indicate critical seizure activity with rapid neuronal firing patterns.'}
                              </p>
                            </div>

                            <div className="p-5 bg-white rounded-xl border-2 border-gray-200">
                              <p className="text-xs font-black text-gray-400 uppercase mb-2">Classification Result</p>
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-4 h-4 rounded-full ${
                                  result.prediction === PredictionLabel.SEIZURE ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                                <span className="text-sm font-bold">
                                  {result.prediction === PredictionLabel.SEIZURE 
                                    ? 'Potential Seizure Activity Detected' 
                                    : 'Normal EEG Pattern'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">
                                Confidence: <span className="font-bold">{result.confidence.toFixed(1)}%</span>
                              </p>
                            </div>

                            <div className="p-5 bg-white rounded-xl border-2 border-gray-200">
                              <p className="text-xs font-black text-gray-400 uppercase mb-2">Suggested Next Steps</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>✓ Correlation with clinical symptoms</li>
                                <li>✓ Review of previous EEG studies</li>
                                <li>✓ Additional monitoring if abnormal</li>
                                <li>✓ Neurologist consultation recommended</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Risk Indicators */}
                    {result.riskIndicators && result.riskIndicators.length > 0 && (
                      <div className={`rounded-3xl p-8 border ${
                        result.prediction === PredictionLabel.SEIZURE 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-orange-50 border-orange-200'
                      }`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${
                          result.prediction === PredictionLabel.SEIZURE 
                            ? 'text-red-600' 
                            : 'text-orange-600'
                        }`}>
                          <span className="text-xl">⚠️</span> Risk Indicators
                        </h3>
                        <ul className="space-y-3">
                          {result.riskIndicators.map((indicator, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <span className={`font-black mt-0.5 ${
                                result.prediction === PredictionLabel.SEIZURE 
                                  ? 'text-red-600' 
                                  : 'text-orange-600'
                              }`}>●</span>
                              <span className="text-gray-700">{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="bg-green-50 rounded-3xl p-8 border border-green-200">
                        <h3 className="text-sm font-black uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                          <span className="text-lg">✓</span> Recommendations
                        </h3>
                        <ul className="space-y-3">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <span className="text-green-600 font-black text-lg mt-0.5">✓</span>
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Comprehensive Analysis Summary */}
                    <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-3xl p-10 border border-gray-700">
                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">📊 Analysis Summary Report</h3>
                      
                      <div className="space-y-6">
                        {/* Executive Summary */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                          <h4 className="text-sm font-black uppercase tracking-widest text-white/70 mb-3">Executive Summary</h4>
                          <p className="text-sm leading-relaxed text-white/90">
                            The EEG analysis reveals a {result.signalQuality} signal quality with {result.dominantBand}-dominant frequency activity. 
                            The classification algorithm detected {result.prediction.toLowerCase()} patterns with {result.confidence.toFixed(1)}% confidence. 
                            {result.stats.std > 350 ? 'The elevated signal variability suggests potential abnormal neural activity.' : 
                             'The signal variability remains within expected parameters.'} 
                            Overall, this analysis indicates a {result.prediction === PredictionLabel.SEIZURE ? 'concerning pattern requiring immediate clinical review.' : 'normal EEG pattern consistent with baseline expectation.'}
                          </p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <p className="text-xs font-bold text-white/60 mb-1">PREDICTION</p>
                            <p className={`text-lg font-black ${
                              result.prediction === PredictionLabel.SEIZURE ? 'text-red-400' : 'text-green-400'
                            }`}>{result.prediction}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <p className="text-xs font-bold text-white/60 mb-1">CONFIDENCE</p>
                            <p className="text-lg font-black text-blue-400">{result.confidence.toFixed(1)}%</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <p className="text-xs font-bold text-white/60 mb-1">SIGNAL QUALITY</p>
                            <p className="text-lg font-black text-yellow-400">{result.signalQuality}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                            <p className="text-xs font-bold text-white/60 mb-1">DOMINANT BAND</p>
                            <p className="text-lg font-black text-purple-400">{result.dominantBand}</p>
                          </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                          <h4 className="text-sm font-black uppercase tracking-widest text-white/70 mb-3">Detailed Findings</h4>
                          <ul className="space-y-2 text-sm text-white/80">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 font-black mt-0.5">→</span>
                              <span>
                                <strong>Signal Characteristics:</strong> Mean amplitude of {result.stats.mean.toFixed(2)} µV with standard deviation of {result.stats.std.toFixed(2)} µV, 
                                indicating {result.stats.std > 300 ? 'high variability' : 'stable'} neural activity.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 font-black mt-0.5">→</span>
                              <span>
                                <strong>Entropy Level:</strong> Signal entropy of {result.stats.entropy.toFixed(2)} reflects 
                                {result.stats.entropy > 0.7 ? ' complex, irregular patterns' : result.stats.entropy > 0.5 ? ' moderately organized patterns' : ' highly organized patterns'} 
                                in neural oscillations.
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 font-black mt-0.5">→</span>
                              <span>
                                <strong>Frequency Analysis:</strong> {result.dominantBand}-dominant activity is most prominent, followed by 
                                {result.frequencyAnalysis ? 
                                  (() => {
                                    const freq = result.frequencyAnalysis!;
                                    const bands = [
                                      { name: 'Delta', value: freq.delta },
                                      { name: 'Theta', value: freq.theta },
                                      { name: 'Alpha', value: freq.alpha },
                                      { name: 'Beta', value: freq.beta },
                                      { name: 'Gamma', value: freq.gamma }
                                    ];
                                    const sorted = bands.sort((a, b) => b.value - a.value);
                                    return ` ${sorted[1].name.toLowerCase()}-band activity.`;
                                  })()
                                : ' other frequency bands.'}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400 font-black mt-0.5">→</span>
                              <span>
                                <strong>Signal Quality:</strong> {result.signalQuality} quality measurement with SNR of {result.signalMetrics?.snr.toFixed(2) || 'N/A'} dB suggests 
                                {result.signalMetrics && result.signalMetrics.snr > 10 ? ' excellent recording conditions.' : ' potential artifact contamination.'}
                              </span>
                            </li>
                          </ul>
                        </div>

                        {/* Clinical Impression */}
                        <div className={`rounded-2xl p-6 border ${
                          result.prediction === PredictionLabel.SEIZURE 
                            ? 'bg-red-500/20 border-red-400/50' 
                            : 'bg-green-500/20 border-green-400/50'
                        }`}>
                          <h4 className="text-sm font-black uppercase tracking-widest text-white/70 mb-3">Clinical Impression</h4>
                          <p className={`text-sm leading-relaxed ${
                            result.prediction === PredictionLabel.SEIZURE 
                              ? 'text-red-200' 
                              : 'text-green-200'
                          }`}>
                            {result.prediction === PredictionLabel.SEIZURE 
                              ? `ALERT: The EEG analysis indicates potential seizure activity with ${result.confidence.toFixed(1)}% confidence. 
                                 The neurophysiological patterns detected are consistent with epileptic discharge activity. Based on the frequency composition and signal characteristics, this may represent:
                                 ${result.dominantBand === 'Delta' ? '• Focal or Generalized seizure with slow-wave activity' : ''}
                                 ${result.dominantBand === 'Theta' ? '• Temporal lobe or partial seizure activity' : ''}
                                 ${result.dominantBand === 'Alpha' ? '• Atypical seizure pattern requiring careful review' : ''}
                                 ${result.dominantBand === 'Beta' ? '• Rapid focal discharge suggesting motor or awareness-related seizure' : ''}
                                 ${result.dominantBand === 'Gamma' ? '• High-frequency oscillations consistent with critical epileptic activity' : ''}
                                 Immediate clinical correlation with patient symptoms and neurologist review are strongly recommended. Consider EEG monitoring and therapeutic intervention.`
                              : `The EEG demonstrates normal background activity characteristic of a healthy state. 
                                 The ${result.dominantBand}-dominant pattern is physiologically appropriate for the recording conditions. 
                                 No abnormal discharges, spike-wave complexes, or ictal activity is detected. 
                                 The recording quality is ${result.signalQuality} and suitable for clinical interpretation. 
                                 Continued routine monitoring is recommended unless clinical symptoms suggest otherwise.`}
                          </p>
                        </div>

                        {/* Risk Score Gauge */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                          <h4 className="text-sm font-black uppercase tracking-widest text-white/70 mb-4">Overall Risk Assessment</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-white/70">Risk Score</span>
                                <span className={`text-xs font-black px-2 py-1 rounded ${
                                  result.prediction === PredictionLabel.SEIZURE ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                }`}>
                                  {result.prediction === PredictionLabel.SEIZURE ? 'HIGH RISK' : 'LOW RISK'}
                                </span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    result.prediction === PredictionLabel.SEIZURE ? 'bg-red-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${result.confidence}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabular Comparison */}
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 overflow-hidden">
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Complete Metric Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-300">
                              <th className="text-left py-3 px-4 font-black text-gray-700 uppercase">Metric</th>
                              <th className="text-center py-3 px-4 font-black text-gray-700 uppercase">Current Value</th>
                              <th className="text-center py-3 px-4 font-black text-gray-700 uppercase">Normal Range</th>
                              <th className="text-center py-3 px-4 font-black text-gray-700 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-200 hover:bg-gray-100 transition">
                              <td className="py-3 px-4 font-bold text-gray-800">Mean Amplitude</td>
                              <td className="py-3 px-4 text-center text-gray-700">{result.stats.mean.toFixed(2)} µV</td>
                              <td className="py-3 px-4 text-center text-gray-600">-50 to 50 µV</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`text-xs font-black px-2 py-1 rounded-full ${
                                  Math.abs(result.stats.mean) > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {Math.abs(result.stats.mean) > 50 ? '⚠ HIGH' : '✓ NORMAL'}
                                </span>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-100 transition">
                              <td className="py-3 px-4 font-bold text-gray-800">Standard Deviation</td>
                              <td className="py-3 px-4 text-center text-gray-700">{result.stats.std.toFixed(2)} µV</td>
                              <td className="py-3 px-4 text-center text-gray-600">50-200 µV</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`text-xs font-black px-2 py-1 rounded-full ${
                                  result.stats.std > 350 ? 'bg-red-100 text-red-700' : result.stats.std > 200 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {result.stats.std > 350 ? '⚠ CRITICAL' : result.stats.std > 200 ? '⚡ ELEVATED' : '✓ NORMAL'}
                                </span>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-100 transition">
                              <td className="py-3 px-4 font-bold text-gray-800">Signal Entropy</td>
                              <td className="py-3 px-4 text-center text-gray-700">{result.stats.entropy.toFixed(2)}</td>
                              <td className="py-3 px-4 text-center text-gray-600">0.3-0.7</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`text-xs font-black px-2 py-1 rounded-full ${
                                  result.stats.entropy > 0.8 ? 'bg-red-100 text-red-700' : result.stats.entropy > 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {result.stats.entropy > 0.8 ? '⚠ IRREGULAR' : result.stats.entropy > 0.5 ? '⚡ MODERATE' : '✓ ORGANIZED'}
                                </span>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-100 transition">
                              <td className="py-3 px-4 font-bold text-gray-800">SNR (dB)</td>
                              <td className="py-3 px-4 text-center text-gray-700">{result.signalMetrics?.snr.toFixed(2) || 'N/A'} dB</td>
                              <td className="py-3 px-4 text-center text-gray-600">&gt; 10 dB</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`text-xs font-black px-2 py-1 rounded-full ${
                                  (result.signalMetrics?.snr || 0) > 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {(result.signalMetrics?.snr || 0) > 10 ? '✓ CLEAN' : '⚡ NOISY'}
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-100 transition">
                              <td className="py-3 px-4 font-bold text-gray-800">Classification</td>
                              <td className="py-3 px-4 text-center font-black text-gray-700">{result.prediction}</td>
                              <td className="py-3 px-4 text-center text-gray-600">Non-Seizure</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`text-xs font-black px-2 py-1 rounded-full ${
                                  result.prediction === PredictionLabel.SEIZURE ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {result.prediction === PredictionLabel.SEIZURE ? '⚠ ABNORMAL' : '✓ NORMAL'}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-center pt-8">
                      <button 
                        onClick={reset}
                        className="px-12 py-4 bg-gray-100 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
                      >
                        Start New Analysis
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">Research Documentation</h2>
              <button 
                onClick={handleDownloadReport}
                className="px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
              >
                Download Full Report
              </button>
            </div>
            
            <div className="space-y-16 text-gray-800">
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Chapter 1 — Introduction</h3>
                <h4 className="text-3xl font-black uppercase mb-4 tracking-tight">An Artificial Oriented System to Identify Type of Epileptic Seizure using EEG Wave</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
                  <p>
                    Noninvasive neuroimaging techniques including functional magnetic resonance imaging, functional near-infrared spectroscopy, and electroencephalogram (EEG) are emerging as key tools with which to explore and understand the functionality and dynamics of the brain. The noninvasiveness, portability, low cost, and high temporal resolution make EEG the most preferred brain-imaging method.
                  </p>
                  <p>
                    EEG measures the joint electrical activity of a population of neurons with amplitude typically on the order of a few microvolts. It is widely used in neuroscience, psychology, and psychophysiology research, as well as clinical research for diagnosis of brain conditions such as sleep disorders, depression, and epileptic activity.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Chapter 3 — System Analysis</h3>
                <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100">
                  <h4 className="text-2xl font-black uppercase mb-6 tracking-tight">Proposed System Architecture</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                    <div className="space-y-2">
                      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black italic rounded-lg mb-2">01</div>
                      <p className="font-bold uppercase tracking-wider">Preprocessing</p>
                      <p className="opacity-60 italic">Noise removal and artifact rejection using regression algorithms.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black italic rounded-lg mb-2">02</div>
                      <p className="font-bold uppercase tracking-wider">Feature Extraction</p>
                      <p className="opacity-60 italic">Utilizing Discrete Wavelet Transformation (DWT) for multi-scale resolution.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black italic rounded-lg mb-2">03</div>
                      <p className="font-bold uppercase tracking-wider">Classification</p>
                      <p className="opacity-60 italic">Artificial Neural Networks (ANN) for distinguishing normal vs. epileptic patterns.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Chapter 5 — System Implementation</h3>
                <div className="space-y-6 text-sm leading-relaxed max-w-3xl">
                  <p>
                    The discrete wavelet transform (DWT) is an implementation of the wavelet transform using a discrete set of the wavelet scales and translations. In numerical analysis and functional analysis, DWT capturing both frequency and location information.
                  </p>
                  <div className="p-8 border-2 border-black rounded-2xl italic font-bold text-center text-xl bg-white shadow-xl">
                    "Accuracy achieved: 90.9% for multi-channel EEG identification."
                  </div>
                  <p>
                    The system implements a Probabilistic Neural Network (PNN) with Radial basis functions, initialized and trained on datasets like CHB-MIT to ensure reliable performance in clinical settings.
                  </p>
                </div>
              </section>

              <section className="border-t border-gray-100 pt-16">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Conclusion</h3>
                <p className="text-xl font-bold max-w-3xl leading-snug">
                  The main theme of the project is to detect seizure activity from EEG signals using support vector machines and neural network architectures. This tool serves as a research prototype for rapid identification of abnormal brain dynamics.
                </p>
              </section>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold animate-pulse">
            {error}
          </div>
        )}

        <p className="mt-24 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
          Research Use Only • Not for Medical Diagnosis
        </p>
      </main>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</span>
    <span className="text-2xl font-black tracking-tight">{value}</span>
  </div>
);

export default App;
