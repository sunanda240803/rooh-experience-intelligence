import React from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Compass, 
  ArrowRight, 
  ExternalLink,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { Experience, DashboardStats } from '../types';

interface DashboardPageProps {
  stats: DashboardStats | null;
  recentExperiences: Experience[];
  onSelectExperience: (id: string) => void;
  onNavigateDiscover: () => void;
  onSeedDemo: () => void;
  loading: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  recentExperiences,
  onSelectExperience,
  onNavigateDiscover,
  onSeedDemo,
  loading
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-rooh-950 p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-rooh-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rooh-500/10 border border-rooh-500/20 text-rooh-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Founding Product Assignment Slice</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Intentional Experience Intelligence Pipeline
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Automated web content extraction, AI structuring, data quality validation, and duplicate detection for rooh growth experiences — with mandatory human-in-the-loop review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateDiscover}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rooh-500 hover:bg-rooh-600 text-white font-medium text-sm shadow-glow transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Analyze New URL</span>
            </button>
            <button
              onClick={onSeedDemo}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all"
            >
              <span>Reset Demo Experiences</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Discovered */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Discovered</span>
            <Sparkles className="w-4 h-4 text-rooh-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {stats ? stats.total_discovered : 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Experiences extracted</p>
        </div>

        {/* Pending Review */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-sm hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300">
            {stats ? stats.pending_review : 0}
          </div>
          <p className="text-xs text-amber-500/80 mt-1">Requires human approval</p>
        </div>

        {/* Approved */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-sm hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300">
            {stats ? stats.approved : 0}
          </div>
          <p className="text-xs text-emerald-500/80 mt-1">Ready for rooh CMS</p>
        </div>

        {/* Rejected */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-rose-500/30 shadow-sm hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-300">
            {stats ? stats.rejected : 0}
          </div>
          <p className="text-xs text-rose-500/80 mt-1">Filtered out by reviewer</p>
        </div>

        {/* Low Confidence */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-orange-500/30 shadow-sm hover:border-orange-500/50 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-orange-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Low Confidence</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-orange-300">
            {stats ? stats.low_confidence : 0}
          </div>
          <p className="text-xs text-orange-500/80 mt-1">Score &lt; 60%</p>
        </div>

      </div>

      {/* Recently Discovered Experiences Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recently Discovered Experiences</h2>
            <p className="text-xs text-slate-400">Live feed of extracted and structured experience records</p>
          </div>
          <button
            onClick={onNavigateDiscover}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rooh-400 hover:text-rooh-300 transition-colors"
          >
            <span>Analyze New Experience</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-rooh-400 border-t-transparent rounded-full mb-2" />
            <p className="text-sm">Loading discovered experiences...</p>
          </div>
        ) : recentExperiences.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No experiences in system yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click below to analyze a webpage URL or load demo experiences.</p>
            <button
              onClick={onNavigateDiscover}
              className="px-4 py-2 bg-rooh-500 text-white rounded-lg text-xs font-medium"
            >
              Start Experience Discovery
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Experience</th>
                  <th className="py-3.5 px-6 font-semibold">Location</th>
                  <th className="py-3.5 px-6 font-semibold">Category</th>
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold">Confidence</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentExperiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-850/60 transition-colors group">
                    
                    {/* Title & Source */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-semibold text-white group-hover:text-rooh-300 transition-colors truncate">
                        {exp.title || 'Untitled Experience'}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="truncate max-w-[180px]">{exp.organizer || exp.source_name || 'Web Source'}</span>
                        {exp.is_demo && (
                          <span className="px-1.5 py-0.2 text-[10px] font-medium bg-slate-800 text-slate-400 rounded">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-slate-300">
                      {exp.location ? (
                        <span>{exp.location}</span>
                      ) : (
                        <span className="text-slate-500 italic">Not specified</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-rooh-300 border border-slate-700">
                        {exp.category || 'Mindfulness'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-300 whitespace-nowrap">
                      {exp.date ? (
                        <span>{exp.date}</span>
                      ) : (
                        <span className="text-slate-500 italic">Date unknown</span>
                      )}
                    </td>

                    {/* Confidence Score Pill */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            exp.confidence_score >= 80
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : exp.confidence_score >= 60
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {exp.confidence_score}% ({exp.confidence_label || 'Low'})
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {exp.status === 'approved' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                      {exp.status === 'rejected' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}
                      {exp.status === 'needs_review' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Needs Review</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectExperience(exp.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rooh-500 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
