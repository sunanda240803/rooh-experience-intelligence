import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ReviewPage } from './pages/ReviewPage';
import { CMSPage } from './pages/CMSPage';
import { api } from './api/client';
import { Experience, DashboardStats, AnalyzeRequest } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'discover' | 'cms' | 'review'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExperiences, setRecentExperiences] = useState<Experience[]>([]);
  const [cmsExperiences, setCmsExperiences] = useState<Experience[]>([]);
  const [cmsTotal, setCmsTotal] = useState<number>(0);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load stats and dashboard list on initial mount
  const refreshData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getStats();
      setStats(statsRes);

      const recentRes = await api.getExperiences({ limit: 10 });
      setRecentExperiences(recentRes.items);

      const cmsRes = await api.getExperiences({ status: 'approved', limit: 50 });
      setCmsExperiences(cmsRes.items);
      setCmsTotal(cmsRes.total);
    } catch (err) {
      console.error('Failed to load experience data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handle URL Analysis / Demo Trigger
  const handleAnalyze = async (payload: AnalyzeRequest): Promise<Experience> => {
    const result = await api.analyzeExperience(payload);
    await refreshData();
    return result;
  };

  // Handle selecting an experience for human review detail page
  const handleSelectExperience = async (id: string) => {
    setLoading(true);
    try {
      const exp = await api.getExperienceById(id);
      setSelectedExperience(exp);
      setActiveTab('review');
    } catch (err) {
      console.error('Failed to load experience detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Approve transition
  const handleApprove = async (id: string) => {
    const updated = await api.approveExperience(id);
    setSelectedExperience(updated);
    await refreshData();
  };

  // Handle Reject transition
  const handleReject = async (id: string) => {
    const updated = await api.rejectExperience(id);
    setSelectedExperience(updated);
    await refreshData();
  };

  // Handle Edit Save
  const handleSaveEdit = async (id: string, updatedFields: Partial<Experience>) => {
    const updated = await api.updateExperience(id, updatedFields);
    setSelectedExperience(updated);
    await refreshData();
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    await api.deleteExperience(id);
    await refreshData();
  };

  // Handle CMS search & filter queries
  const handleCMSSearch = async (search: string, category: string, status: string) => {
    setLoading(true);
    try {
      const res = await api.getExperiences({ search, category, status, limit: 50 });
      setCmsExperiences(res.items);
      setCmsTotal(res.total);
    } catch (err) {
      console.error('Search query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Seed Demo Data
  const handleSeedDemo = async () => {
    await api.seedDemo();
    await refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          refreshData();
        }}
        pendingCount={stats?.pending_review || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            recentExperiences={recentExperiences}
            onSelectExperience={handleSelectExperience}
            onNavigateDiscover={() => setActiveTab('discover')}
            onSeedDemo={handleSeedDemo}
            loading={loading}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverPage
            onAnalyze={handleAnalyze}
            onSelectExperience={handleSelectExperience}
          />
        )}

        {activeTab === 'review' && selectedExperience && (
          <ReviewPage
            experience={selectedExperience}
            onApprove={handleApprove}
            onReject={handleReject}
            onSaveEdit={handleSaveEdit}
            onSelectExperience={handleSelectExperience}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'cms' && (
          <CMSPage
            experiences={cmsExperiences}
            totalCount={cmsTotal}
            onSearch={handleCMSSearch}
            onSelectExperience={handleSelectExperience}
            onDeleteExperience={handleDelete}
            loading={loading}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Rooh Experience Intelligence &copy; 2026</span>
          <span className="text-slate-400 font-mono">Founding Product Engineer Assignment Slice</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
