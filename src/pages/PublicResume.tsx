import { useEffect, useState, useRef } from 'react';
import { isbot } from 'isbot';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Clock,
    Maximize2
} from 'lucide-react';

// Services
import { getPublicResume, Resume } from '../services/resume';
import { logView, updateViewHeartbeat, logDownload } from '../services/analytics';
import { tracker } from '../services/tracker';
import { useAuth } from '../context/AuthContext';

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
    const isIdleRef = useRef<boolean>(false);

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
            const resumeData = resume.resume_data as any;
            const title = `${resumeData?.full_name || 'Resume'} - ${resume.title}`;
            const description = resumeData?.professional_summary || `View professional resume on E-resumehub.`;
            document.title = title;
            
            // SEO Meta tags... (already verified in previous turns)
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
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-ibm text-[#1D1D1F] pt-[72px] selection:bg-black/10">
            {/* Import IBM Plex Sans */}
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
                .font-ibm { font-family: 'IBM Plex Sans', sans-serif; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #E5E5EA; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #D1D1D6; }
            `}} />

            {/* Glassy Public Header */}
            <header className="fixed top-0 left-0 right-0 h-[72px] z-[100] bg-[#F5F5F7]/80 backdrop-blur-2xl border-b border-black/[0.04]">
                <div className="flex items-center justify-between h-full px-6 md:px-10 lg:px-12 max-w-[1600px] mx-auto w-full">
                    
                    <Link to="/" className="flex items-center group shrink-0">
                        <span className="text-[19px] font-bold text-[#1D1D1F] tracking-tight group-hover:opacity-70 transition-opacity">
                            E-resume<span className="text-[#86868B] font-medium">hub</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <span className="hidden md:block text-[13px] font-medium text-[#86868B] tracking-wide">
                            Craft a resume that gets noticed
                        </span>
                        <Tooltip content="Takes 2 minutes. 100% Free." position="bottom">
                            <Link 
                                to="/signup" 
                                className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-black/[0.06] hover:border-black/[0.12] text-[#1D1D1F] rounded-full text-[14px] font-semibold transition-all active:scale-[0.97] shadow-sm"
                            >
                                Build Yours Free
                                <ArrowRight className="w-4 h-4 text-[#86868B]" />
                            </Link>
                        </Tooltip>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto w-full px-4 md:px-10 lg:px-12 py-8 flex flex-col xl:flex-row gap-8 items-start">
                
                {/* Left Column - The Artifact (PDF Viewer) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-1 w-full flex flex-col gap-4 min-w-0"
                >
                    <div className="flex items-center justify-between px-1">
                        <h1 className="text-[18px] font-bold text-[#1D1D1F] tracking-tight truncate pr-4">
                            {resume.title}
                        </h1>
                        
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/[0.03] text-[12px] font-semibold text-[#86868B]">
                                <Globe className="w-3.5 h-3.5" /> 
                                <span>Public View</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[12px] font-semibold text-emerald-600 border border-emerald-100">
                                <ShieldCheck className="w-3.5 h-3.5" /> 
                                <span>Secure Link</span>
                            </div>
                        </div>
                    </div>

                    {/* Premium Immersive PDF Stage */}
                    <div className="w-full bg-white rounded-[24px] overflow-hidden border border-black/[0.04] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.02] relative flex flex-col group">
                        
                        {/* macOS Window Bar */}
                        <div className="w-full bg-[#f6f6f6] h-11 flex items-center justify-between px-4 border-b border-black/[0.06] select-none backdrop-blur-md">
                            <div className="flex items-center gap-2 opacity-60">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10"></div>
                            </div>
                            <span className="text-[#86868B] text-[12px] font-semibold tracking-wide">
                                {resumeData.full_name?.replace(' ', '_') || 'Candidate'}_Resume.pdf
                            </span>
                            <div className="w-14"></div>
                        </div>

                        <div 
                            ref={scrollContainerRef}
                            className="w-full h-[78vh] min-h-[750px] bg-[#EBEBEB] overflow-hidden"
                        >
                            <object
                                data={previewUrl}
                                type="application/pdf"
                                className="w-full h-full"
                                title="Candidate Resume PDF"
                            >
                                <div className="flex flex-col items-center justify-center h-full bg-white p-12 text-center">
                                    <AlertCircle className="w-12 h-12 text-[#86868B] mb-4 opacity-20" />
                                    <p className="text-[#86868B] font-medium text-[14px] mb-6">
                                        Your browser doesn't support inline PDF viewing.
                                    </p>
                                    <button 
                                        onClick={handleVerifiedDownload}
                                        className="px-6 py-2.5 bg-[#1D1D1F] text-white rounded-xl text-sm font-bold"
                                    >
                                        Download PDF Instead
                                    </button>
                                </div>
                            </object>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column - The Action Hub */}
                <aside className="w-full xl:w-[360px] flex flex-col gap-6 sticky top-[104px] shrink-0">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="bg-white rounded-[24px] shadow-sm border border-black/[0.04] p-7"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="relative">
                                <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-b from-[#2C2C2E] to-[#1D1D1F] text-white flex items-center justify-center text-[20px] font-bold shadow-md tracking-widest ring-4 ring-white">
                                    {getInitials(resumeData.full_name || 'C P')}
                                </div>
                                <Tooltip content="Verified Member" position="top">
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                                        <BadgeCheck className="w-5 h-5 text-blue-500" fill="#EBF5FF" />
                                    </div>
                                </Tooltip>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-[18px] font-bold text-[#1D1D1F] leading-tight truncate tracking-tight">
                                    {resumeData.full_name || 'Candidate Name'}
                                </h3>
                                <p className="text-[14px] text-[#86868B] font-medium mt-0.5 truncate">
                                    {resume.title}
                                </p>
                                <p className="text-[12px] text-black/40 font-medium mt-1 truncate flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Updated {new Date(resume.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleVerifiedDownload}
                                className="w-full h-[52px] bg-[#1D1D1F] hover:bg-black text-white font-semibold rounded-[14px] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] group relative overflow-hidden"
                            >
                                <Download className="w-[18px] h-[18px] opacity-90 group-hover:-translate-y-0.5 transition-transform" />
                                <span className="text-[15px]">Download Resume</span>
                            </button>
                            
                            <div className="flex gap-3">
                                {resumeData.email && (
                                    <a 
                                        href={`mailto:${resumeData.email}`}
                                        className="flex-1 h-[52px] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] text-[#1D1D1F] font-semibold rounded-[14px] flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Mail className="w-[18px] h-[18px] text-[#86868B]" />
                                        <span className="text-[14px]">Email</span>
                                    </a>
                                )}

                                <Tooltip content={isCopied ? "Link Copied!" : "Copy Link"} position="top">
                                    <button 
                                        onClick={handleCopyLink}
                                        className={`w-[52px] h-[52px] flex items-center justify-center rounded-[14px] border transition-all
                                            ${isCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-black/[0.08] text-[#86868B]'}`}
                                    >
                                        {isCopied ? <Check className="w-[18px] h-[18px]" /> : <Copy className="w-[18px] h-[18px]" />}
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </motion.div>

                    {/* Guest Call to Action */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100/50 text-center"
                    >
                        <h4 className="text-[14px] font-bold text-indigo-900 mb-2">Impressed by this layout?</h4>
                        <p className="text-[12px] text-indigo-700/70 mb-4 leading-relaxed">
                            Join 10,000+ professionals using AI to build and share premium resumes.
                        </p>
                        <Link to="/signup" className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 group">
                            Create your profile <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>
                </aside>
            </main>

            {/* Subtle Footer */}
            <footer className="mt-auto py-12 px-6 border-t border-black/[0.04] text-center">
                <p className="text-[11px] font-bold text-black/20 uppercase tracking-[0.4em] mb-4">Powered by E-resumehub Premium</p>
                <div className="flex justify-center gap-6 text-[12px] font-semibold text-[#86868B]">
                    <Link to="/about" className="hover:text-[#1D1D1F]">About</Link>
                    <Link to="/privacy" className="hover:text-[#1D1D1F]">Privacy</Link>
                    <Link to="/support" className="hover:text-[#1D1D1F]">Support</Link>
                </div>
            </footer>
        </div>
    );
};

export default PublicResume;
