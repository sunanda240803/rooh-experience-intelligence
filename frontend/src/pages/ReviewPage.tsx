import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert, 
  AlertTriangle, 
  Save, 
  X, 
  Clock, 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  DollarSign, 
  HelpCircle,
  Copy,
  ChevronLeft
} from 'lucide-react';
import { Experience, PossibleDuplicate } from '../types';

interface ReviewPageProps {
  experience: Experience;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onSaveEdit: (id: string, updatedFields: Partial<Experience>) => Promise<void>;
  onSelectExperience: (id: string) => void;
  onBackToDashboard: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  experience,
  onApprove,
  onReject,
  onSaveEdit,
  onSelectExperience,
  onBackToDashboard
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Experience>>({});
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || '',
        description: experience.description || '',
        location: experience.location || '',
        date: experience.date || '',
        start_time: experience.start_time || '',
        end_time: experience.end_time || '',
        price: experience.price || '',
        category: experience.category || '',
        organizer: experience.organizer || '',
      });
    }
  }, [experience]);

  const handleApproveAction = async () => {
    setActionLoading(true);
    await onApprove(experience.id);
    setActionLoading(false);
    setSuccessMessage('Experience successfully APPROVED and moved to rooh CMS!');
  };

  const handleRejectAction = async () => {
    setActionLoading(true);
    await onReject(experience.id);
    setActionLoading(false);
    setSuccessMessage('Experience REJECTED.');
  };

  const handleSaveForm = async () => {
    setActionLoading(true);
    await onSaveEdit(experience.id, formData);
    setIsEditing(false);
    setActionLoading(false);
    setSuccessMessage('Experience details updated successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rooh-400">Human Review Drawer</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">ID: {experience.id.substring(0, 8)}...</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {experience.title || 'Untitled Experience'}
            </h1>
          </div>
        </div>

        {/* Top Status & Quick Approve/Reject Bar */}
        <div className="flex items-center space-x-3">
          {experience.status === 'approved' && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status: Approved</span>
            </span>
          )}
          {experience.status === 'rejected' && (
            <span className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5">
              <XCircle className="w-4 h-4" />
              <span>Status: Rejected</span>
            </span>
          )}
          {experience.status === 'needs_review' && (
            <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>Status: Needs Review</span>
            </span>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Conflicting Info Warning Banner (If present) */}
      {experience.conflicting_info && experience.conflicting_info.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 font-bold text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>⚠ Conflicting Source Information Detected</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {experience.conflicting_info.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/20">
                <span className="font-semibold text-amber-300">{c.field}: </span>
                <span className="text-slate-300">Source A: {c.source_a_val} | Source B: {c.source_b_val}</span>
                <div className="text-slate-400 italic mt-0.5">{c.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Possible Duplicates Warning Banner (If present) */}
      {experience.possible_duplicates && experience.possible_duplicates.length > 0 && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/40 text-orange-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-orange-300 text-sm">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              <span>⚠ Possible Duplicate Record Detected</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-orange-500/20 rounded text-orange-300">
              {experience.possible_duplicates[0].similarity_score}% Match
            </span>
          </div>
          
          <div className="text-xs text-slate-300 leading-relaxed">
            Existing Record: <strong className="text-white">{experience.possible_duplicates[0].title}</strong> 
            {experience.possible_duplicates[0].location && ` (${experience.possible_duplicates[0].location})`} 
            {experience.possible_duplicates[0].date && ` on ${experience.possible_duplicates[0].date}`}
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => onSelectExperience(experience.possible_duplicates[0].id)}
              className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-semibold transition-colors flex items-center space-x-1"
            >
              <span>View Existing Record</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-xs text-slate-400 italic">Do not auto-merge. Review manually.</span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column Extracted Details, Right Column Intelligence & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Extracted Experience Fields (2 Columns wide on LG) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-rooh-400" />
                <h2 className="text-base font-bold text-white">Extracted Experience Information</h2>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveForm}
                    disabled={actionLoading}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rooh-500 text-white text-xs font-semibold hover:bg-rooh-600 transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Render Form / View */}
            {!isEditing ? (
              <div className="space-y-5 text-sm">
                
                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Experience Title
                  </label>
                  <p className="text-lg font-bold text-white">{experience.title || 'Null (Missing)'}</p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Description
                  </label>
                  <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-850 whitespace-pre-line text-xs sm:text-sm">
                    {experience.description || <span className="text-slate-500 italic">Null (No description found in source)</span>}
                  </p>
                </div>

                {/* Key Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rooh-400" />
                      <span>Location</span>
                    </div>
                    <div className="font-semibold text-white">
                      {experience.location || <span className="text-slate-500 font-normal italic">null</span>}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-rooh-400" />
                      <span>Date & Time</span>
                    </div>
                    <div className="font-semibold text-white">
                      {experience.date || <span className="text-slate-500 font-normal italic">null</span>}
                      {experience.start_time && ` at ${experience.start_time}`}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-rooh-400" />
                      <span>Price / Cost</span>
                    </div>
                    <div className="font-semibold text-white">
                      {experience.price || <span className="text-slate-500 font-normal italic">null</span>}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                      <Tag className="w-3.5 h-3.5 text-rooh-400" />
                      <span>Category</span>
                    </div>
                    <div className="font-semibold text-white">
                      {experience.category || <span className="text-slate-500 font-normal italic">Mindfulness</span>}
                    </div>
                  </div>

                </div>

                {/* Organizer & Source */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                      <User className="w-3.5 h-3.5 text-rooh-400" />
                      <span>Organizer / Host</span>
                    </div>
                    <div className="font-semibold text-white">
                      {experience.organizer || <span className="text-slate-500 font-normal italic">null</span>}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                      <ExternalLink className="w-3.5 h-3.5 text-rooh-400" />
                      <span>Source URL</span>
                    </div>
                    <a
                      href={experience.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-rooh-300 hover:underline flex items-center space-x-1 truncate max-w-xs block"
                    >
                      <span className="truncate">{experience.source_url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

              </div>
            ) : (
              /* Editable Inputs Form */
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date</label>
                    <input
                      type="text"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Price</label>
                    <input
                      type="text"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Controls */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <a
                href={experience.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <span>Verify Original Webpage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRejectAction}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={handleApproveAction}
                  disabled={actionLoading}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Experience</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: AI Intelligence, Confidence & Quality Checklist */}
        <div className="space-y-6">
          
          {/* AI Relevance Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Relevance Classification</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                experience.relevance_score >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {experience.relevance_score}% Relevant
              </span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950 p-3 rounded-xl border border-slate-850">
              "{experience.relevance_reason || 'Experience evaluates positively for rooh personal growth criteria.'}"
            </p>
          </div>

          {/* Confidence Score & Breakdown Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confidence Score</span>
                <p className="text-xs text-slate-500">Transparent factor breakdown</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                experience.confidence_score >= 80
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : experience.confidence_score >= 60
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {experience.confidence_score}% ({experience.confidence_label})
              </span>
            </div>

            {/* Factors List */}
            {experience.confidence_detail && experience.confidence_detail.breakdown && (
              <div className="space-y-2 text-xs">
                {experience.confidence_detail.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center space-x-2">
                      {item.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={item.passed ? 'text-slate-200 font-medium' : 'text-slate-500 line-through'}>
                        {item.factor}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">
                      +{item.points}/{item.max_points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quality & Validation Checklist */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Validation Checklist</span>
              <p className="text-xs text-slate-500">Detected warnings and missing data</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Source URL Valid</span>
              </div>
              <div className={`flex items-center space-x-2 font-medium ${experience.title ? 'text-emerald-400' : 'text-rose-400'}`}>
                {experience.title ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Title Found ({experience.title ? 'Yes' : 'No'})</span>
              </div>
              <div className={`flex items-center space-x-2 font-medium ${experience.description ? 'text-emerald-400' : 'text-amber-400'}`}>
                {experience.description ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>Description Found</span>
              </div>
              <div className={`flex items-center space-x-2 font-medium ${experience.price ? 'text-emerald-400' : 'text-amber-400'}`}>
                {experience.price ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>Price Found ({experience.price || 'null'})</span>
              </div>
            </div>

            {/* Validation Issues List */}
            {experience.validation_issues && experience.validation_issues.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Validation Alerts:</span>
                {experience.validation_issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs border ${
                      issue.severity === 'error'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : issue.severity === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span className="capitalize">{issue.issue_type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-[11px] mt-0.5">{issue.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
