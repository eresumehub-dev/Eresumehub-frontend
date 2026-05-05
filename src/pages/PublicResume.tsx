import React, { useEffect, useState, useRef } from 'react';
import { isbot } from 'isbot';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Download, 
    Mail, 
    ArrowRight, 
    Globe, 
    Loader2, 
    AlertCircle, 
    Check, 
    Copy, 
    ShieldCheck,
    BadgeCheck,
    Clock
} from 'lucide-react';

// Services
import { getPublicResume, Resume } from '../services/resume';
import { logView, updateViewHeartbeat, logDownload } from '../services/analytics';
import { tracker } from '../services/tracker';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/shared/Footer';

// --- SHARED UI COMPONENTS ---

const Tooltip = ({ children, content, position = 'top' }: { children: React.ReactNode, content: string, position?: 'top' | 'bottom' }) => {
    return (
        <div className="group relative flex items-center justify-center">
            {children}
            <div className={`
                absolute z-50 px-2.5 py-1.5 bg-[#1D1D1F] text-white text-[11px] font-medium tracking-wide rounded-md 
                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl whitespace-nowrap
                ${position === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'}
            `}>
                {content}
                <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1D1D1F] rotate-45 
                    ${position === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'}`} 
                />
            </div>
        </div>
    );
};

const PublicResume: React.FC = () => {
    const { username, slug } = useParams<{ username: string; slug: string }>();
    const { user } = useAuth();
    const [resume, setResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Analytics Refs
    const viewIdRef = useRef<string | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const analyticsInitialized = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const maxScrollRef = useRef<number>(0);
    const lastActivityRef = useRef<number>(Date.now());

    const loadResume = async (u: string, s: string) => {
        try {
            const data = await getPublicResume(u, s);
            setResume(data);
        } catch (err: any) {
            console.error('Failed to load public resume', err);
            setError(err.response?.data?.detail || 'Resume not found or is private');
        } finally {
            setLoading(false);
        }
    };

    // Helper: Build Initials for Avatar
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Logic: Copy Link
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Logic: Verified Download (Staff+ Hardened)
    const handleVerifiedDownload = async () => {
        if (!resume || !previewUrl) return;

        try {
            if ((window as any).showSaveFilePicker) {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `${resume.title}.pdf`,
                    types: [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }],
                });

                const response = await fetch(`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}skip_logging=true`);
                if (!response.ok) throw new Error('Download failed');
                const blob = await response.blob();
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                await tracker.trackEvent('resume_download', { resume_id: resume.id, file_format: 'pdf', download_source: 'button' }, user?.id);
                await logDownload({ resume_id: resume.id, format: 'pdf' });
            } else {
                const link = document.createElement('a');
                link.href = previewUrl;
                link.download = `${resume.title}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') console.error("Download failed:", err);
        }
    };

    // Helper Logic: URL Building
    const getAbsolutePdfUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://localhost') && window.location.hostname !== 'localhost') {
            const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
            try { return `${base}${new URL(url).pathname}`; } catch { return url; }
        }
        if (url.startsWith('http')) return url;
        const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
        return `${base}${url}`;
    };

    const buildPdfUrl = (rawUrl: string, extraParams: Record<string, string>) => {
        const absolute = getAbsolutePdfUrl(rawUrl);
        if (!absolute) return '';
        try {
            const url = new URL(absolute);
            Object.entries(extraParams).forEach(([k, v]) => url.searchParams.set(k, v));
            return url.toString();
        } catch {
            return `${absolute}${absolute.includes('?') ? '&' : '?'}${new URLSearchParams(extraParams).toString()}`;
        }
    };

    const previewUrl = resume?.pdf_url ? buildPdfUrl(resume.pdf_url, { inline: 'true', preview: 'true' }) : '';

    // --- EFFECTS ---

    useEffect(() => {
        if (username && slug) {
            const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
            loadResume(cleanUsername, slug);
        }
    }, [username, slug]);

    useEffect(() => {
        if (resume) {
            const resumeData = (resume.resume_data as any) || {};
            const title = `${resumeData?.full_name || 'Resume'} - ${resume.title}`;
            const description = resumeData?.professional_summary || `View professional resume on E-resumehub.`;
            
            document.title = title;

            // Update Meta Tags for Social Sharing
            const updateMeta = (name: string, content: string, isProperty = false) => {
                const attr = isProperty ? 'property' : 'name';
                let el = document.querySelector(`meta[${attr}="${name}"]`);
                if (!el) {
                    el = document.createElement('meta');
                    el.setAttribute(attr, name);
                    document.head.appendChild(el);
                }
                el.setAttribute('content', content);
            };

            updateMeta('description', description);
            updateMeta('og:title', title, true);
            updateMeta('og:description', description, true);
            updateMeta('og:url', window.location.href, true);
            updateMeta('twitter:title', title);
            updateMeta('twitter:description', description);
        }
    }, [resume]);

    useEffect(() => {
        if (!resume || analyticsInitialized.current) return;
        analyticsInitialized.current = true;

        const initTracking = async () => {
            if (isbot(navigator.userAgent)) return;
            try {
                await tracker.trackEvent('resume_view_started', { resume_id: resume.id }, user?.id);
                const response = await logView({ resume_id: resume.id, viewer_id: user?.id, referrer: document.referrer });
                if (response.success) viewIdRef.current = response.view_id;
            } catch (e) { console.error(e); }
        };
        initTracking();

        const handleScroll = () => {
            if (!scrollContainerRef.current) return;
            const el = scrollContainerRef.current;
            const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
            if (pct > maxScrollRef.current) maxScrollRef.current = Math.min(1, parseFloat(pct.toFixed(2)));
        };
        
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [resume]);

    useEffect(() => {
        if (!resume) return;
        const interval = setInterval(() => {
            if (Date.now() - lastActivityRef.current > 300000) return;
            if (!document.hidden && viewIdRef.current) {
                const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                if (duration > 0) {
                    updateViewHeartbeat(viewIdRef.current, duration).catch(() => {});
                }
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [resume]);

    // --- RENDERING ---

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center font-ibm">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1D1D1F] mb-4" strokeWidth={2.5} />
                    <p className="text-[#86868B] font-medium text-[14px] tracking-wide animate-pulse">
                        Retrieving secure candidate profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !resume) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 font-ibm">
                <div className="bg-white p-10 rounded-[28px] shadow-sm border border-black/[0.04] text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-8 w-8 text-[#FF3B30]" />
                    </div>
                    <h2 className="text-[20px] font-bold text-[#1D1D1F] mb-2 tracking-tight">Profile Unavailable</h2>
                    <p className="text-[#86868B] text-[14px] mb-8 leading-relaxed">
                        {error || "This resume link has expired or has been set to private."}
                    </p>
                    <Link to="/" className="inline-flex items-center justify-center w-full px-5 py-3.5 bg-[#1D1D1F] text-white rounded-[14px] text-[15px] font-semibold transition-all active:scale-[0.98]">
                        Return to E-resumehub
                    </Link>
                </div>
            </div>
        );
    }

    const resumeData = (resume.resume_data as any) || {};

    return (
        <div className="min-h-screen bg-[#F5F5F7] gradient-mesh flex flex-col font-ibm text-[#1D1D1F] pt-[72px] selection:bg-black/10">
            {/* Import IBM Plex Sans */}
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
                .font-ibm { font-family: 'IBM Plex Sans', sans-serif; }
            `}} />

            {/* Glassy Public Header - Unified with Brand Design */}
            <header className="fixed top-0 left-0 right-0 h-[72px] z-[100] glass-panel border-b border-black/[0.04]">
                <div className="flex items-center justify-between h-full px-6 md:px-10 lg:px-12 max-w-[1800px] mx-auto w-full">
                    
                    <Link to="/" className="flex items-center group shrink-0">
                        <span className="text-[19px] font-bold text-[#1D1D1F] tracking-tight group-hover:opacity-70 transition-opacity">
                            E-resumehub
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <span className="hidden md:block text-[13px] font-medium text-muted-foreground tracking-wide">
                            Want a resume like this?
                        </span>
                        <Tooltip content="Takes 2 minutes. 100% Free." position="bottom">
                            <Link 
                                to="/signup" 
                                className="flex items-center gap-2.5 px-6 py-2.5 bg-[#1D1D1F] text-white rounded-full text-[14px] font-semibold transition-all active:scale-[0.97] shadow-xl shadow-black/10 hover:shadow-black/20"
                            >
                                Build Yours - It's Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Tooltip>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto w-full px-4 md:px-10 lg:px-12 py-10 flex flex-col xl:flex-row gap-10 items-start">
                
                {/* Left Column - The Artifact (PDF Viewer) */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 w-full flex flex-col gap-5 min-w-0"
                >
                    <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col">
                            <h1 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight truncate pr-4">
                                {resume.title}
                            </h1>
                            <p className="text-[13px] text-muted-foreground font-medium">Standardized Candidate Artifact • Secure Stream</p>
                        </div>
                        
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.03] text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                                <Globe className="w-3 h-3" /> 
                                <span>Public Access</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                                <ShieldCheck className="w-3 h-3" /> 
                                <span>Verified SSL</span>
                            </div>
                        </div>
                    </div>

                    {/* Premium Immersive PDF Stage */}
                    <div className="w-full bg-white rounded-[28px] overflow-hidden border border-black/[0.04] shadow-2xl shadow-black/5 ring-1 ring-black/[0.02] relative flex flex-col group">
                        
                        {/* macOS Window Bar - Refined Spacing */}
                        <div className="w-full bg-[#f6f6f6] h-12 flex items-center justify-between px-5 border-b border-black/[0.06] select-none">
                            <div className="flex items-center gap-2 opacity-80">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                            </div>
                            <span className="text-[#86868B] text-[12px] font-bold tracking-widest uppercase">
                                {resumeData.full_name?.replace(/\s/g, '_') || 'PROFILE'}_DOCUMENT.PDF
                            </span>
                            <div className="w-14"></div>
                        </div>

                        <div 
                            ref={scrollContainerRef}
                            className="w-full h-[80vh] min-h-[800px] bg-[#EBEBEB] overflow-hidden"
                        >
                            <object
                                data={previewUrl}
                                type="application/pdf"
                                className="w-full h-full"
                                title="Candidate Resume PDF"
                            >
                                <div className="flex flex-col items-center justify-center h-full bg-white p-12 text-center">
                                    <AlertCircle className="w-16 h-16 text-muted-foreground/20 mb-6" />
                                    <p className="text-muted-foreground font-medium text-[15px] mb-8">
                                        Enhanced PDF preview requires a modern browser.
                                    </p>
                                    <button 
                                        onClick={handleVerifiedDownload}
                                        className="px-8 py-3.5 bg-[#1D1D1F] text-white rounded-2xl text-[15px] font-bold shadow-lg shadow-black/20"
                                    >
                                        Download Secure Copy
                                    </button>
                                </div>
                            </object>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column - The Action Hub */}
                <aside className="w-full xl:w-[380px] flex flex-col gap-8 sticky top-[112px] shrink-0">
                    <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-panel-elevated rounded-[32px] p-8"
                    >
                        <div className="flex items-center gap-5 mb-10">
                            <div className="relative">
                                <div className="w-[72px] h-[72px] rounded-[24px] bg-gradient-to-br from-[#2C2C2E] to-[#000000] text-white flex items-center justify-center text-[24px] font-bold shadow-2xl tracking-tighter ring-4 ring-white">
                                    {getInitials(resumeData.full_name || 'C P')}
                                </div>
                                <Tooltip content="Verified Talent" position="top">
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg border border-black/[0.04]">
                                        <BadgeCheck className="w-6 h-6 text-indigo-600" fill="#EEF2FF" />
                                    </div>
                                </Tooltip>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-[20px] font-bold text-[#1D1D1F] leading-tight truncate tracking-tight">
                                    {resumeData.full_name || 'Candidate Name'}
                                </h3>
                                <p className="text-[14px] text-muted-foreground font-medium mt-1 truncate">
                                    {resume.title}
                                </p>
                                <div className="flex flex-col gap-2 mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest">Available for hire</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        <span>Updated {new Date((resume.updated_at || resume.created_at) as string).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={handleVerifiedDownload}
                                className="w-full h-[58px] bg-[#1D1D1F] hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-black/10 group overflow-hidden"
                            >
                                <Download className="w-[20px] h-[20px] group-hover:-translate-y-0.5 transition-transform" />
                                <span className="text-[16px]">Download Document</span>
                            </button>
                            
                            <div className="flex gap-4">
                                {resumeData.email && (
                                    <a 
                                        href={`mailto:${resumeData.email}`}
                                        className="flex-1 h-[58px] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] text-[#1D1D1F] font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-sm"
                                    >
                                        <Mail className="w-[20px] h-[20px] text-muted-foreground" />
                                        <span className="text-[15px]">Inquire</span>
                                    </a>
                                )}

                                <Tooltip content={isCopied ? "Link Copied!" : "Copy Link"} position="top">
                                    <button 
                                        onClick={handleCopyLink}
                                        className={`w-[58px] h-[58px] flex items-center justify-center rounded-2xl border transition-all shadow-sm
                                            ${isCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-black/[0.08] text-muted-foreground'}`}
                                    >
                                        {isCopied ? <Check className="w-[20px] h-[20px]" /> : <Copy className="w-[20px] h-[20px]" />}
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </motion.div>

                    {/* Guest Call to Action - High Impact Conversion */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="p-8 bg-[#1D1D1F] rounded-[32px] text-center shadow-2xl shadow-black/20 group relative overflow-hidden"
                    >
                        {/* Abstract background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                        
                        <h4 className="text-[16px] font-bold text-white mb-3 relative z-10">Stand out like this.</h4>
                        <p className="text-[13px] text-white/60 mb-6 leading-relaxed relative z-10 px-2">
                            Join the elite 1% of talent using AI to land interviews at top companies.
                        </p>
                        <Link to="/signup" className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1D1D1F] rounded-full text-[14px] font-bold group-hover:scale-105 transition-transform relative z-10">
                            Build Your Free Profile <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </motion.div>
                </aside>
            </main>

            {/* Official Shared Footer */}
            <Footer />
        </div>
    );
};

export default PublicResume;
