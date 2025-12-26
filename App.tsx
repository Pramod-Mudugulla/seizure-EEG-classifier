
import React, { useState, useRef } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { EEGData, EEGAnalysisResult, PredictionLabel } from './types';
import { parseCSV, analyzeEEGSignal, analyzeEEGImage } from './services/eegAnalysis';

type FileType = 'csv' | 'image' | null;
type View = 'analyze' | 'research';

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
            onClick={() => setView('research')} 
            className={`${view === 'research' ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Research
          </button>
        </div>
      </nav>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className={`rounded-3xl p-10 flex flex-col justify-between ${
                        result.prediction === PredictionLabel.SEIZURE ? 'bg-red-50 text-red-600' : 'bg-black text-white'
                      }`}>
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Classification</h3>
                          <p className="text-7xl font-black uppercase italic tracking-tighter">
                            {result.prediction}
                          </p>
                        </div>
                        <div className="mt-8">
                          <p className="text-sm font-bold uppercase tracking-widest mb-1">Confidence Score</p>
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-black">{result.confidence.toFixed(1)}%</span>
                            <div className="flex-1 bg-white/20 h-2 rounded-full mb-3 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${result.prediction === PredictionLabel.SEIZURE ? 'bg-red-500' : 'bg-white'}`} 
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Response" value={`${result.inferenceTimeMs}ms`} />
                        <StatCard label="Dominant Band" value={result.dominantBand} />
                        <StatCard label="Signal Quality" value={result.signalQuality} />
                        <StatCard label="Entropy" value={result.stats.entropy.toFixed(2)} />
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
