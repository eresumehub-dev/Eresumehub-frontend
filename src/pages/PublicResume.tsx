import { useEffect, useState, useRef } from 'react';
import { isbot } from 'isbot';
import { useParams, Link } from 'react-router-dom';
import { getPublicResume, Resume } from '../services/resume';
import { logView, updateViewHeartbeat, logDownload } from '../services/analytics';
import { tracker } from '../services/tracker';
import { Download, Globe, Clock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicResume: React.FC = () => {
    const { username, slug } = useParams<{ username: string; slug: string }>();
    const { user } = useAuth();
    const [resume, setResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mutable Refs for persistent tracking across renders
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

    useEffect(() => {
        if (username && slug) {
            loadResume(username, slug);
        }
    }, [username, slug]);

    // EFFECT 1: Log View (Once per Resume)
    useEffect(() => {
        if (!resume || analyticsInitialized.current) return;
        analyticsInitialized.current = true;

        // Reset Ref for new resume
        viewIdRef.current = null;
        startTimeRef.current = Date.now();


        // Generate ID
        let sessionId = sessionStorage.getItem('resumey_session_id');
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!sessionId || !uuidRegex.test(sessionId)) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('resumey_session_id', sessionId);
        }

        const initTracking = async () => {
            // Staff+ Bot Guard: Prevent crawlers and automated browsers from skewing analytics (v16.5.0)
            const isBotUserAgent = isbot(navigator.userAgent);
            const isWebdriver = navigator.webdriver;
            
            if (isBotUserAgent || isWebdriver) {
                console.log("[Analytics] Bot detected (UA or Webdriver). View logging suppressed.");
                return;
            }

            try {
                // Initialize v12 standardized tracking
                await tracker.trackEvent('resume_view_started', {
                    resume_id: resume.id,
                    entry_point: document.referrer ? 'link' : 'direct',
                    is_unique: !sessionStorage.getItem(`viewed_${resume.id}`)
                }, user?.id);
                
                sessionStorage.setItem(`viewed_${resume.id}`, 'true');

                // Legacy fallback (v12 shim)
                const viewData = {
                    resume_id: resume.id,
                    session_id: sessionStorage.getItem('eresume_session_id'),
                    viewer_user_id: user?.id || null,
                    referrer: document.referrer,
                    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                    browser: navigator.userAgent.slice(0, 50),
                    screen_size: `${window.innerWidth}x${window.innerHeight}`,
                    max_scroll_depth: 0
                };

                const response = await logView(viewData);

                if (response.success && response.view_id) {
                    viewIdRef.current = response.view_id; // Update Ref

                }
            } catch (e: any) {
                console.error(`[Analytics] View Error:`, e);
            }
        };

        initTracking();

        // SCROLL DEPTH TRACKING (v11.0.0)
        const handleScroll = () => {
            if (!scrollContainerRef.current) return;
            const element = scrollContainerRef.current;
            const scrollPercentage = element.scrollTop / (element.scrollHeight - element.clientHeight);
            if (scrollPercentage > maxScrollRef.current) {
                maxScrollRef.current = Math.min(1, parseFloat(scrollPercentage.toFixed(2)));
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        // IDLE DETECTION (v14.0.0)
        const updateActivity = () => {
            lastActivityRef.current = Date.now();
            isIdleRef.current = false;
        };

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('scroll', updateActivity);

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('scroll', updateActivity);
        };
    }, [resume]); // Only runs if Resume Object changes

    // EFFECT 2: Heartbeat Interval (Runs on Mount, restarts on Remount)
    useEffect(() => {
        // Only run if we have a resume loaded (to check start time etc)
        if (!resume) return;

        const intervalId = setInterval(() => {
            // Check for Idle state (5 minutes = 300,000ms)
            const idleTime = Date.now() - lastActivityRef.current;
            if (idleTime > 300000) {
                if (!isIdleRef.current) {
                    console.log("[Analytics] Idle detected, pausing heartbeat.");
                    isIdleRef.current = true;
                }
                return;
            }

            if (!document.hidden && viewIdRef.current) {
                const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

                // Only send pulse if time > 0
                if (duration > 0) {
                    // Map scroll depth to "Virtual Sections" (0-1.0)
                    let currentSection = 'summary';
                    if (maxScrollRef.current > 0.15) currentSection = 'experience';
                    if (maxScrollRef.current > 0.60) currentSection = 'skills';
                    if (maxScrollRef.current > 0.85) currentSection = 'education';

                    // Standardized V12/V13 Heartbeat
                    tracker.trackEvent('resume_view_heartbeat', {
                        resume_id: resume.id,
                        duration_increment: 5,
                        total_duration: duration,
                        scroll_depth: maxScrollRef.current,
                        current_section: currentSection,
                        active: !document.hidden && !isIdleRef.current
                    }, user?.id);

                    // Legacy Heartbeat pulse (v12 shim)
                    const heartbeatData = { 
                        duration_seconds: duration,
                        max_scroll_depth: maxScrollRef.current,
                        is_active: !document.hidden && !isIdleRef.current
                    };
                    
                    updateViewHeartbeat(viewIdRef.current, heartbeatData as any)
                        .catch(e => console.error(`[Analytics] Heartbeat Fail`, e));
                }
            }
        }, 5000); // 5s pulse

        return () => {
            clearInterval(intervalId);
            // Final pulse on unmount
            if (viewIdRef.current) {
                const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
                if (duration > 0) {
                    updateViewHeartbeat(viewIdRef.current, duration).catch(() => { });
                }
            }
        };
    }, [resume]); // Re-starts if resume changes, or component remounts

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0A2A6B] mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading resume...</p>
                </div>
            </div>
        );
    }

    if (error || !resume) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Unavailable</h2>
                    <p className="text-slate-500 mb-6">{error || "This resume is either private or doesn't exist."}</p>
                    <Link to="/" className="inline-flex items-center text-[#0A2A6B] font-bold">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const previewUrl = resume.pdf_url
        ? `${resume.pdf_url}${resume.pdf_url.includes('?') ? '&' : '?'}t=${Date.now()}&inline=true`
        : '';

    const handleVerifiedDownload = async () => {
        if (!resume || !previewUrl) return;

        try {
            // Check if modern File System Access API is supported (Chrome/Edge/Opera)
            if ((window as any).showSaveFilePicker) {
                // 1. Ask user for file handle FIRST (The "Save As" Dialog)
                // If they cancel here, it throws an AbortError, and we catch it (No Log)
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `${resume.title}.pdf`,
                    types: [{
                        description: 'PDF Document',
                        accept: { 'application/pdf': ['.pdf'] },
                    }],
                });

                // 2. User selected a path! Now we download the data.
                // We add skip_logging=true so backend DOES NOT log this stream
                const response = await fetch(`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}skip_logging=true`);
                if (!response.ok) throw new Error('Download failed');

                const blob = await response.blob();

                // 3. Write data to the file handle
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                // 4. NOW we log explicitly (Standardized V12)
                await tracker.trackEvent('resume_download', {
                    resume_id: resume.id,
                    file_format: 'pdf',
                    download_source: 'button'
                }, user?.id);

                // Legacy log (v12 shim)
                const sessionId = sessionStorage.getItem('eresume_session_id');
                await logDownload({
                    resume_id: resume.id,
                    session_id: sessionId,
                    visitor_ip: 'Verified Download',
                    device_type: 'Desktop',
                });

            } else {
                // Fallback for Firefox/Safari/Mobile (Classic Link Trigger)
                const link = document.createElement('a');
                link.href = previewUrl;
                link.download = `${resume.title}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err: any) {
            // If user Cancelled, err.name is 'AbortError' -> We do nothing (Correct!)
            if (err.name !== 'AbortError') {
                console.error("Download verified failed:", err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            {/* Minimal Public Navy Header */}
            <div className="bg-[#0A2A6B] text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
                        <span className="bg-white text-[#0A2A6B] px-2 py-0.5 rounded">E</span>
                        <span>ResumeHub</span>
                    </Link>
                    <div className="hidden md:flex h-6 w-px bg-white/20 mx-2"></div>
                    <div className="hidden md:block">
                        <h1 className="text-sm font-bold opacity-90 truncate max-w-[200px]">{resume.title}</h1>
                        <p className="text-[10px] opacity-60 font-bold uppercase tracking-wider">Candidate Profile</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold text-white/60 uppercase tracking-widest mr-4">
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Public</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last updated {new Date(resume.created_at).toLocaleDateString()}</span>
                    </div>
                    <button
                        onClick={handleVerifiedDownload}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#0A2A6B] rounded-full text-sm font-bold shadow-xl hover:scale-105 transition-all"
                    >
                        <Download className="h-4 w-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Viewer Content */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 p-4 md:p-8 flex justify-center overflow-y-auto"
            >
                {/* PDF Viewer Container with Causal Tracking Zone */}
                <div 
                    className="w-full max-w-5xl bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 relative"
                    onMouseEnter={() => {
                        tracker.trackEvent('content_interaction', {
                            resume_id: resume.id,
                            type: 'hover',
                            section: 'viewer_container'
                        });
                    }}
                >
                    <iframe
                        src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}preview=true`}
                        className="w-full h-[1122px] border-none"
                        title="Resume View"
                        sandbox="allow-scripts allow-same-origin"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Subtle Footer */}
            <div className="p-8 text-center bg-white border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mb-4">Powered by EResumeHub AI</p>
                <div className="flex justify-center gap-4">
                    <Link to="/signup" className="text-[11px] font-bold text-[#0A2A6B] hover:underline uppercase tracking-widest">Create your own</Link>
                    <span className="text-slate-200">-</span>
                    <Link to="/login" className="text-[11px] font-bold text-slate-500 hover:underline uppercase tracking-widest">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default PublicResume;
