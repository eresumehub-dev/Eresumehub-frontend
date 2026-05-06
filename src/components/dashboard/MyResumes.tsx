import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Share2, 
  Trash2, 
  Eye, 
  Download, 
  Sparkles, 
  Clock,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Star,
  Check,
  X,
  TrendingUp,
  Award,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useResumesQuery } from '../../hooks/queries/useResumesQuery';
import { useBootstrapQuery } from '../../hooks/queries/useBootstrapQuery';
import { Resume, downloadResumePDF } from '../../services/resume';
import Footer from '../shared/Footer';

interface MyResumesProps {
  onEdit: (id: string) => void;
  onPreview: (resume: Resume) => void;
  onShare: (resume: Resume) => void;
  onDelete: (id: string) => Promise<boolean>;
  onEnhance: (id: string) => void;
}

type SortOption = 'updated' | 'views' | 'score';

/**
 * MyResumes Component (v1.3.0)
 * High-density grid with Pinning, Batch Actions, and Smart Sorting.
 */
const MyResumes: React.FC<MyResumesProps> = ({
  onEdit, onPreview, onShare, onDelete, onEnhance
}) => {
  const navigate = useNavigate();
  const { isLoading: bootLoading } = useBootstrapQuery();
  const { resumes: allResumes, isLoading: resumesLoading } = useResumesQuery();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Persistence for Pins (LocalStorage for now as requested)
  useEffect(() => {
    const savedPins = localStorage.getItem('pinned_resumes');
    if (savedPins) {
      try {
        setPinnedIds(new Set(JSON.parse(savedPins)));
      } catch (e) {
        console.error("Failed to load pins:", e);
      }
    }
  }, []);

  const togglePin = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('pinned_resumes', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  // Filter, Pin, and Sort Logic
  const filteredAndSortedResumes = useMemo(() => {
    // 1. Initial filter (archived + search)
    let list = allResumes.filter(r => !r.archived_at);
    if (searchQuery) {
      list = list.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.country && r.country.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 2. Sort logic
    list = [...list].sort((a, b) => {
      // Primary: Pinned status
      const aPinned = pinnedIds.has(a.id);
      const bPinned = pinnedIds.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // Secondary: Chosen sort option
      if (sortBy === 'views') {
        return (b.view_count || 0) - (a.view_count || 0);
      }
      if (sortBy === 'score') {
        return (b.ats_score || 0) - (a.ats_score || 0);
      }
      // Default: Updated date
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    });

    return list;
  }, [allResumes, searchQuery, pinnedIds, sortBy]);

  // Batch Selection Logic
  const toggleSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedIds(new Set());

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (window.confirm(`Are you sure you want to delete ${ids.length} resumes?`)) {
      for (const id of ids) {
        await onDelete(id);
      }
      clearSelection();
    }
  };

  const handleDownload = useCallback(async (r: Resume) => {
    try {
      await downloadResumePDF(r.id);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    }
  }, []);

  // Helper Preview Component
  const DocumentPreview = ({ theme }: { theme?: string }) => {
    const themeColors: Record<string, string> = {
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      purple: 'bg-purple-500',
      gray: 'bg-gray-400'
    };
    const colorClass = themeColors[theme || 'blue'] || themeColors.gray;
    return (
      <div className="w-full h-full bg-white rounded-[12px] border border-black/[0.04] p-4 flex flex-col gap-2.5 relative overflow-hidden group-hover:bg-[#F9F9FB] transition-colors duration-300">
        <div className="w-1/3 h-1.5 rounded-full bg-gray-100"></div>
        <div className={`w-1/2 h-2 rounded-full ${colorClass} opacity-60`}></div>
        <div className="space-y-1.5 mt-2">
          <div className="w-full h-1 rounded-full bg-gray-100"></div>
          <div className="w-5/6 h-1 rounded-full bg-gray-100"></div>
          <div className="w-full h-1 rounded-full bg-gray-100"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent group-hover:from-[#F9F9FB]/80 transition-colors duration-300"></div>
      </div>
    );
  };

  if (bootLoading || resumesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D1D1F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative pb-32">
      
      {/* 1. Header Section */}
      <div className="flex flex-col gap-6">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[14px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-[2.5rem] font-medium text-[#1D1D1F] tracking-tight leading-tight">
              My Resumes
            </h1>
            <p className="text-[17px] text-[#86868B] font-light mt-2">
              Manage, track, and optimize your career artifacts.
            </p>
          </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/create')}
            className="h-[48px] px-6 bg-[#1D1D1F] hover:bg-black text-white rounded-[14px] flex shrink-0 items-center gap-2.5 text-[15px] font-medium shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all duration-200 active:scale-[0.98] group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2} />
            <span>Create New</span>
          </button>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1D1D1F] transition-colors" />
            <input 
              type="text" 
              placeholder="Search resumes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[48px] pl-11 pr-4 rounded-[14px] bg-white border border-black/[0.06] text-[14px] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/[0.04] transition-all w-full md:w-[240px]"
            />
          </div>
          
          {/* Smart Sort / Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`h-[48px] px-4 flex shrink-0 items-center gap-2 rounded-[14px] border transition-all ${isFilterMenuOpen ? 'bg-[#1D1D1F] text-white border-transparent' : 'bg-white border-black/[0.06] text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-[14px] font-medium capitalize">{sortBy === 'updated' ? 'Recent' : sortBy}</span>
            </button>

            <AnimatePresence>
              {isFilterMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-black/[0.04] py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 text-[11px] font-bold text-[#86868B] uppercase tracking-widest">Sort By</div>
                  <button onClick={() => { setSortBy('updated'); setIsFilterMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-medium transition-colors ${sortBy === 'updated' ? 'text-[#1D1D1F] bg-[#F5F5F7]' : 'text-gray-600 hover:bg-[#F5F5F7]'}`}>
                    <div className="flex items-center gap-3"><Clock className="w-4 h-4" /> Recently Updated</div>
                    {sortBy === 'updated' && <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setSortBy('views'); setIsFilterMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-medium transition-colors ${sortBy === 'views' ? 'text-[#1D1D1F] bg-[#F5F5F7]' : 'text-gray-600 hover:bg-[#F5F5F7]'}`}>
                    <div className="flex items-center gap-3"><TrendingUp className="w-4 h-4" /> Most Viewed</div>
                    {sortBy === 'views' && <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setSortBy('score'); setIsFilterMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 text-[14px] font-medium transition-colors ${sortBy === 'score' ? 'text-[#1D1D1F] bg-[#F5F5F7]' : 'text-gray-600 hover:bg-[#F5F5F7]'}`}>
                    <div className="flex items-center gap-3"><Award className="w-4 h-4" /> Highest Score</div>
                    {sortBy === 'score' && <Check className="w-4 h-4" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>

      {/* 2. Grid Layout */}
      {filteredAndSortedResumes.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border border-black/[0.03] shadow-sm">
          <h3 className="text-2xl font-medium text-[#1D1D1F] mb-2">No resumes found</h3>
          <p className="text-[#86868B] font-light mb-8">Try a different search or create a new one.</p>
          <button onClick={() => navigate('/create')} className="px-8 py-3.5 bg-[#1D1D1F] text-white rounded-[14px] font-medium">
            Create Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedResumes.map((resume) => {
            const isPinned = pinnedIds.has(resume.id);
            const isSelected = selectedIds.has(resume.id);
            const score = resume.ats_score || 0;
            const updatedAt = resume.updated_at 
                ? new Date(resume.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : 'Recently';

            return (
              <motion.div 
                key={resume.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative bg-white rounded-[24px] p-5 border transition-all duration-500 flex flex-col h-[320px] ${
                  isSelected ? 'border-[#1D1D1F] shadow-[0_0_0_2px_#1D1D1F] scale-[0.98]' : 'border-black/[0.04] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5'
                }`}
              >
                {/* Visual Preview Section */}
                <div 
                  className="h-[140px] w-full mb-5 relative cursor-pointer overflow-hidden rounded-[16px]" 
                  onClick={() => onEdit(resume.id)}
                >
                  <DocumentPreview theme={resume.template_style === 'professional' ? 'blue' : 'emerald'} />
                  
                  {/* Pin/Star Button */}
                  <button 
                    onClick={(e) => togglePin(resume.id, e)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                      isPinned ? 'bg-[#FF9F0A] text-white' : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#FF9F0A]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                  </button>

                  {/* Multi-Select Checkbox */}
                  <button 
                    onClick={(e) => toggleSelect(resume.id, e)}
                    className={`absolute top-3 left-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#1D1D1F] text-white' : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[#1D1D1F]'
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded border-2 border-current" />}
                  </button>

                  {/* Viewed Status */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-black/5 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${resume.view_count && resume.view_count > 0 ? 'bg-[#34C759] animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-[9px] font-bold text-[#1D1D1F] uppercase tracking-wider">
                      {resume.view_count && resume.view_count > 0 ? 'Viewed' : 'Unseen'}
                    </span>
                  </div>
                  
                  {/* Score Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 px-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white flex items-center gap-2 text-[13px] font-semibold text-[#1D1D1F]">
                      Open Editor <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-col flex-1 cursor-pointer" onClick={() => onEdit(resume.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight leading-tight line-clamp-1 mb-1">
                      {resume.title}
                    </h3>
                    {score > 0 && (
                      <span className={`text-[11px] font-bold ${score >= 90 ? 'text-[#34C759]' : 'text-[#FF9F0A]'}`}>
                        {score}%
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-[#86868B] font-light line-clamp-1">
                    {resume.country || 'Global'} • {resume.language || 'English'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#86868B] mt-3 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                    Edited {updatedAt}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-auto pt-4 border-t border-black/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1D1D1F]" title="Views">
                      <Eye className={`w-4 h-4 ${resume.view_count && resume.view_count > 0 ? 'text-[#34C759]' : 'text-[#86868B]'}`} />
                      {resume.view_count || 0}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1D1D1F]" title="Downloads">
                      <Download className="w-4 h-4 text-[#86868B]" />
                      {resume.download_count || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(resume.id)}
                      className="px-4 py-1.5 bg-[#F5F5F7] hover:bg-[#1D1D1F] text-[#1D1D1F] hover:text-white text-[12px] font-bold rounded-full transition-all active:scale-[0.95]"
                    >
                      Edit
                    </button>

                    <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === resume.id ? null : resume.id);
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                          activeMenu === resume.id ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E8E8ED]'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {activeMenu === resume.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-black/[0.04] py-2 z-50 overflow-hidden"
                          >
                            <button onClick={() => { onEnhance(resume.id); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors group">
                              <Sparkles className="w-4 h-4 text-[#0066CC] group-hover:scale-110" /> Enhance with AI
                            </button>
                            <div className="h-px bg-black/[0.04] my-1 mx-2"></div>
                            <button onClick={() => onPreview(resume)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors">
                              <ExternalLink className="w-4 h-4 text-[#86868B]" /> View Live
                            </button>
                            <button onClick={() => onShare(resume)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors">
                              <Share2 className="w-4 h-4 text-[#86868B]" /> Share Link
                            </button>
                            <button onClick={() => handleDownload(resume)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors">
                              <Download className="w-4 h-4 text-[#86868B]" /> Download PDF
                            </button>
                            <div className="h-px bg-black/[0.04] my-1 mx-2"></div>
                            <button onClick={() => onDelete(resume.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-colors">
                              <Trash2 className="w-4 h-4" /> Delete Permanent
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. Floating Batch Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-6 py-4 bg-[#1D1D1F] text-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[14px] font-bold">
                {selectedIds.size}
              </div>
              <span className="text-[14px] font-medium text-white/80">Documents selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBatchDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF3B30]/10 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-white text-[13px] font-bold transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete Bulk
              </button>
              
              <button 
                onClick={clearSelection}
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 4. Global Footer (Minimal) */}
      <Footer minimal />
    </div>
  );
}

export default MyResumes;
