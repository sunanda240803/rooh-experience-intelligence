import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Trash2, 
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Experience } from '../types';

interface CMSPageProps {
  experiences: Experience[];
  totalCount: number;
  onSearch: (search: string, category: string, status: string) => void;
  onSelectExperience: (id: string) => void;
  onDeleteExperience: (id: string) => void;
  loading: boolean;
}

export const CMSPage: React.FC<CMSPageProps> = ({
  experiences,
  totalCount,
  onSearch,
  onSelectExperience,
  onDeleteExperience,
  loading
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('approved');

  const categories = [
    'All',
    'Mindfulness',
    'Yoga',
    'Mental Wellness',
    'Personal Development',
    'Leadership',
    'Fitness',
    'Meditation'
  ];

  const handleFilterChange = (newSearch: string, newCat: string, newStatus: string) => {
    setSearchInput(newSearch);
    setCategoryFilter(newCat);
    setStatusFilter(newStatus);
    onSearch(newSearch, newCat, newStatus);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-rooh-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Experiences CMS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curate and manage verified growth experiences for rooh platform users
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span>Total Records: <strong className="text-white">{totalCount}</strong></span>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleFilterChange(e.target.value, categoryFilter, statusFilter)}
              placeholder="Search title, location, organizer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rooh-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(searchInput, e.target.value, statusFilter)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rooh-400"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(searchInput, categoryFilter, e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rooh-400"
            >
              <option value="all">Status: All Statuses</option>
              <option value="approved">Status: Approved Only</option>
              <option value="needs_review">Status: Needs Review</option>
              <option value="rejected">Status: Rejected</option>
            </select>
          </div>

        </div>
      </div>

      {/* Experiences Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rooh-400 mx-auto mb-2" />
            <p className="text-sm">Fetching experience catalog...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Database className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-base font-semibold text-slate-300">No matching experiences found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, status filter, or category selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Title</th>
                  <th className="py-3.5 px-6 font-semibold">Category</th>
                  <th className="py-3.5 px-6 font-semibold">Location</th>
                  <th className="py-3.5 px-6 font-semibold">Date & Price</th>
                  <th className="py-3.5 px-6 font-semibold">Confidence</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-850/60 transition-colors group">
                    
                    {/* Title */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-semibold text-white group-hover:text-rooh-300 transition-colors truncate">
                        {exp.title || 'Untitled Experience'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {exp.organizer || exp.source_name || 'Web Source'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-rooh-300 border border-slate-700">
                        {exp.category || 'Mindfulness'}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-slate-300">
                      {exp.location || <span className="text-slate-500 italic">null</span>}
                    </td>

                    {/* Date & Price */}
                    <td className="py-4 px-6 text-xs text-slate-300">
                      <div>{exp.date || <span className="text-slate-500 italic">Date unknown</span>}</div>
                      <div className="text-slate-400 font-mono mt-0.5">{exp.price || 'Free / Unspecified'}</div>
                    </td>

                    {/* Confidence */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        exp.confidence_score >= 80
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : exp.confidence_score >= 60
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}>
                        {exp.confidence_score}%
                      </span>
                    </td>

                    {/* Status */}
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

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onSelectExperience(exp.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rooh-500 text-xs font-medium text-slate-200 hover:text-white transition-all"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteExperience(exp.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
