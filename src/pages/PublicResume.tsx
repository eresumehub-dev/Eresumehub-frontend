import React, { useEffect, useState, useRef } from 'react';
import { isbot } from 'isbot';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Download, 
    Mail, 
    ArrowRight, 
    Loader2, 
    AlertCircle, 
    Check, 
    BadgeCheck,
    Clock,
    Linkedin
} from 'lucide-react';

// Services
import { getPublicResume, Resume } from '../services/resume';
import { logView, updateViewHeartbeat, logDownload } from '../services/analytics';
import { tracker } from '../services/tracker';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/shared/Footer';
import Navbar from '../components/Navbar';

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
    const { user, session } = useAuth();
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

            {/* Conditional Header: Official App Navbar for Members, Premium CTA for Guests */}
            {session ? (
                <Navbar />
            ) : (
                <header className="fixed top-0 left-0 right-0 h-[72px] z-[100] glass-panel border-b border-black/[0.04]">
                    <div className="flex items-center justify-between h-full px-6 md:px-10 lg:px-12 max-w-[1400px] mx-auto w-full">
                        
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
                        </div>
                    </div>
                </header>
            )}

            <main className={`max-w-[1440px] mx-auto w-full px-4 md:px-10 lg:px-12 flex flex-col xl:flex-row gap-10 md:gap-16 items-start ${session ? 'pt-[92px] md:pt-[104px] pb-16' : 'pt-24 md:pt-16 pb-16'}`}>
                
                {/* Left Column - The Artifact (PDF Viewer) */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 w-full flex flex-col gap-6 md:gap-8 min-w-0"
                >
                    <div className="px-1">
                        <h1 className="text-[28px] md:text-[42px] font-bold text-[#1D1D1F] tracking-tight">
                            {resumeData.job_title || resumeData.title || 'Professional Resume'}
                        </h1>
                    </div>

                    {/* Premium Immersive PDF Stage */}
                    <div className="w-full bg-white rounded-[24px] md:rounded-[28px] overflow-hidden border border-black/[0.04] shadow-2xl shadow-black/5 ring-1 ring-black/[0.02] relative flex flex-col group">
                        
                        {/* macOS Window Bar - Mobile Responsive */}
                        <div className="w-full bg-[#f6f6f6] h-10 md:h-12 flex items-center justify-between px-4 md:px-5 border-b border-black/[0.06] select-none">
                            <div className="flex items-center gap-1.5 md:gap-2 opacity-80">
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F56]"></div>
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27C93F]"></div>
                            </div>
                            <span className="text-[#86868B] text-[10px] md:text-[12px] font-bold tracking-wide truncate max-w-[180px] px-2">
                                {resumeData.full_name || 'Candidate'} Resume.pdf
                            </span>
                            <div className="w-10 md:w-14"></div>
                        </div>

                        {/* Enhanced PDF Bridge - Works on Mobile/Tablet/Desktop */}
                        <div className="w-full aspect-[1/1.4] md:aspect-auto md:h-[800px] lg:h-[1000px] bg-[#525659] relative">
                            <iframe
                                src={window.innerWidth < 768 
                                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(resume.pdf_url)}&embedded=true` 
                                    : `${resume.pdf_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
                                }
                                className="w-full h-full border-none"
                                title="Resume Viewer"
                                loading="eager"
                            />
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
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#1D1D1F] to-[#434345] text-white flex items-center justify-center text-[22px] font-bold shadow-xl border-2 border-white overflow-hidden">
                                    {(resumeData.photo_url || resumeData.personalInfo?.photo_url || resumeData.contact?.photo_url) ? (
                                        <img 
                                            src={resumeData.photo_url || resumeData.personalInfo?.photo_url || resumeData.contact?.photo_url} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : getInitials(resumeData.full_name || 'JD')}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-black/[0.04]">
                                    <BadgeCheck className="w-4 h-4 text-indigo-500" />
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-[18px] font-bold text-[#1D1D1F] leading-tight truncate">
                                    {resumeData.full_name || 'Candidate Name'}
                                </h3>
                                <p className="text-[14px] text-muted-foreground font-medium truncate">
                                    {resumeData.job_title || resumeData.title || 'Professional'}
                                </p>
                                <div className="flex flex-col gap-1.5 mt-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Actively looking for jobs</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        <span>Shared on {new Date(resume.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-8">
                            <button 
                                onClick={handleVerifiedDownload}
                                className="w-full h-[58px] bg-[#1D1D1F] hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-black/10 group overflow-hidden"
                            >
                                <Download className="w-[20px] h-[20px] group-hover:-translate-y-0.5 transition-transform" />
                                <span className="text-[16px]">Download Document</span>
                            </button>
                            
                            <div className="grid grid-cols-3 gap-3">
                                {resumeData.personalInfo?.phone || resumeData.contact?.phone || resumeData.phone ? (
                                    <Tooltip content="Chat on WhatsApp" position="top">
                                        <a 
                                            href={`https://wa.me/${(resumeData.personalInfo?.phone || resumeData.contact?.phone || resumeData.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${resumeData.full_name || 'there'}, I saw your resume on E-resumehub and I'm interested in discussing opportunities with you.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-[58px] flex items-center justify-center rounded-2xl bg-[#25D366]/[0.08] hover:bg-[#25D366]/[0.12] border border-[#25D366]/[0.1] text-[#128C7E] transition-all shadow-sm group"
                                        >
                                            <svg className="w-[24px] h-[24px] fill-[#25D366] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </a>
                                    </Tooltip>
                                ) : null}

                                {(resumeData.personalInfo?.linkedin || resumeData.contact?.linkedin || resumeData.linkedin) ? (
                                    <Tooltip content="View LinkedIn" position="top">
                                        <a 
                                            href={(resumeData.personalInfo?.linkedin || resumeData.contact?.linkedin || resumeData.linkedin).startsWith('http') 
                                                ? (resumeData.personalInfo?.linkedin || resumeData.contact?.linkedin || resumeData.linkedin)
                                                : `https://linkedin.com/in/${(resumeData.personalInfo?.linkedin || resumeData.contact?.linkedin || resumeData.linkedin)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-[58px] flex items-center justify-center rounded-2xl bg-[#0077B5]/[0.08] hover:bg-[#0077B5]/[0.12] border border-[#0077B5]/[0.1] text-[#0077B5] transition-all shadow-sm"
                                        >
                                            <Linkedin className="w-[22px] h-[22px] fill-[#0077B5]/10" />
                                        </a>
                                    </Tooltip>
                                ) : null}

                                {(resumeData.email || resumeData.personalInfo?.email || resumeData.contact?.email) ? (
                                    <Tooltip content={isCopied ? "Email Copied!" : "Send Email"} position="top">
                                        <button 
                                            onClick={() => {
                                                const email = resumeData.email || resumeData.personalInfo?.email || resumeData.contact?.email;
                                                navigator.clipboard.writeText(email);
                                                setIsCopied(true);
                                                setTimeout(() => setIsCopied(false), 2000);
                                                window.location.href = `mailto:${email}`;
                                            }}
                                            className={`w-full h-[58px] flex items-center justify-center rounded-2xl border transition-all shadow-sm
                                                ${isCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-black/[0.08] text-muted-foreground hover:bg-[#F9F9FA]'}`}
                                        >
                                            {isCopied ? <Check className="w-[22px] h-[22px]" /> : <Mail className="w-[22px] h-[22px]" />}
                                        </button>
                                    </Tooltip>
                                ) : null}
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

            {/* Official Shared Footer (Minimal Mode) */}
            <Footer minimal />
        </div>
    );
};

export default PublicResume;
