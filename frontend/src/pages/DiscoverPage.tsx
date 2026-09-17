import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { AnalyzeRequest, Experience } from '../types';

interface DiscoverPageProps {
  onAnalyze: (payload: AnalyzeRequest) => Promise<Experience>;
  onSelectExperience: (id: string) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onAnalyze, onSelectExperience }) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const steps = [
    { label: 'Fetching source webpage...', duration: 600 },
    { label: 'Extracting readable content...', duration: 700 },
    { label: 'Analyzing with AI & classifying relevance...', duration: 1000 },
    { label: 'Validating data completeness...', duration: 600 },
    { label: 'Checking duplicate records...', duration: 600 },
    { label: 'Ready for human review!', duration: 400 },
  ];

  const handleAnalyze = async (customUrl?: string, isDemo: boolean = false, demoId?: string) => {
    const targetUrl = customUrl || urlInput;
    if (!isDemo && !targetUrl.trim()) {
      setErrorMessage('Please enter a valid experience URL.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentStep(0);

    // Simulate animated progress steps for visual feedback
    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration));
    }

    try {
      const result = await onAnalyze({
        url: targetUrl || 'https://example.com/events/mindfulness-hyderabad',
        is_demo: isDemo,
        demo_template_id: demoId
      });

      setCurrentStep(steps.length - 1);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Automatically navigate to Review Page for the newly analyzed experience
      onSelectExperience(result.id);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(
        err?.response?.data?.detail || 
        'We couldn\'t analyze this webpage. Please verify the URL or try Demo Mode.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rooh-500/10 border border-rooh-500/20 text-rooh-300 text-xs font-semibold">
          <Compass className="w-4 h-4" />
          <span>Content Extraction & Intelligence</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
          Discover Growth Experience
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Enter an experience webpage URL to extract, structure, validate, and evaluate intentional growth experiences.
        </p>
      </div>

      {/* Input Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }} 
          className="space-y-4"
        >
          <label className="block text-sm font-semibold text-slate-200">
            Experience Webpage URL:
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/event-page-url"
              disabled={isProcessing}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rooh-400 focus:ring-1 focus:ring-rooh-400 text-sm font-mono transition-all disabled:opacity-50"
            />
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-rooh-500 hover:bg-rooh-600 text-white font-semibold text-sm shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Experience...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Experience</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAnalyze('https://example.com/events/mindfulness-hyderabad', true, 'demo-mindfulness-hyd')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Use Demo Experience</span>
            </button>
          </div>
        </form>

        {/* Preset Sample URLs section */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rooh-400" />
            <span>Or test with sample growth experiences:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              disabled={isProcessing}
              onClick={() => {
                setUrlInput('https://example.com/events/mindfulness-hyderabad');
                handleAnalyze('https://example.com/events/mindfulness-hyderabad', true, 'demo-mindfulness-hyd');
              }}
              className="p-3 text-left rounded-xl bg-slate-950/60 hover:bg-slate-850 border border-slate-800 hover:border-rooh-500/40 transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-rooh-300">
                Mindfulness Workshop (Hyderabad)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">High confidence demo case</div>
            </button>

            <button
              disabled={isProcessing}
              onClick={() => {
                setUrlInput('https://example.com/events/yoga-retreat-bangalore');
                handleAnalyze('https://example.com/events/yoga-retreat-bangalore', true, 'demo-yoga-retreat-blr');
              }}
              className="p-3 text-left rounded-xl bg-slate-950/60 hover:bg-slate-850 border border-slate-800 hover:border-rooh-500/40 transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-rooh-300">
                Yoga & Wellness Retreat (Bangalore)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Multi-day wellness retreat</div>
            </button>

            <button
              disabled={isProcessing}
              onClick={() => {
                setUrlInput('https://example.com/events/personal-leadership-delhi');
                handleAnalyze('https://example.com/events/personal-leadership-delhi', true, 'demo-leadership-masterclass');
              }}
              className="p-3 text-left rounded-xl bg-slate-950/60 hover:bg-slate-850 border border-slate-800 hover:border-rooh-500/40 transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-rooh-300">
                Personal Leadership Masterclass (Delhi)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Emotional intelligence focus</div>
            </button>

            <button
              disabled={isProcessing}
              onClick={() => {
                setUrlInput('https://example.com/events/holistic-breathwork-workshop');
                handleAnalyze('https://example.com/events/holistic-breathwork-workshop', true, 'demo-conflicting-source-case');
              }}
              className="p-3 text-left rounded-xl bg-slate-950/60 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500/60 transition-all group"
            >
              <div className="text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                ⚠️ Conflicting Info Test Case
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Price conflict across sources</div>
            </button>
          </div>
        </div>

      </div>

      {/* Live Stepper Progress Status UI */}
      {isProcessing && (
        <div className="rounded-2xl bg-slate-900 border border-rooh-500/30 p-6 sm:p-8 shadow-glow space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-rooh-400" />
              <span>Experience Extraction Pipeline in Progress</span>
            </h2>
            <span className="text-xs font-mono text-rooh-300 bg-rooh-500/20 px-2.5 py-1 rounded-full border border-rooh-500/30">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isUpcoming = idx > currentStep;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-rooh-500/20 border-rooh-500/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 text-rooh-400 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono">
                        {idx + 1}
                      </div>
                    )}
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>

                  {isDone && <span className="text-xs text-emerald-400 font-semibold">Done</span>}
                  {isCurrent && <span className="text-xs text-rooh-300 font-semibold animate-pulse">Running</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
