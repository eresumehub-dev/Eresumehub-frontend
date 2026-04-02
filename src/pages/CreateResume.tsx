import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, AlertCircle, ChevronDown, ChevronUp, ExternalLink,
    Loader2, ArrowUpRight, Sparkles, Zap,
    Shield, Clock, Check, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SERVICES ---
import { createResume } from '../services/resume';
import { getProfile, UserProfile } from '../services/profile';
import { getAvailableCountries } from '../services/schema';

// ==========================================
// 1. SUB-COMPONENTS (UI Layer)
// ==========================================

// --- Step Indicator (Compact) ---
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Role', 'Context', 'Generate'];

    return (
        <div className="flex items-center gap-1">
            {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                    <React.Fragment key={step}>
                        <div className={`
                            px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-all
                            ${isActive
                                ? 'text-foreground'
                                : isComplete
                                    ? 'text-foreground/60'
                                    : 'text-muted-foreground/50'
                            }
                        `}>
                            {isComplete && <Check className="w-3 h-3 inline mr-1" />}
                            {step}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-4 h-px ${index < currentStep ? 'bg-foreground/30' : 'bg-border'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// --- Technical Input ---
const TechInput: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </label>
        <input
            type="text"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

// --- Technical Textarea ---
const TechTextarea: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    placeholder?: string;
    hint?: string;
}> = ({ label, value, onChange, rows = 8, placeholder, hint }) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </label>
            {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
        </div>
        <textarea
            rows={rows}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm font-normal text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all resize-none leading-relaxed"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

// --- Technical Select ---
const TechSelect: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </label>
        <select
            className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm font-medium text-foreground focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all cursor-pointer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

// --- Error Banner ---
interface ErrorBannerProps {
    message: string;
    cooldown?: number;
    onRetry?: () => void;
    onDismiss?: () => void;
}
const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, cooldown = 0, onRetry, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="px-3 py-2.5 bg-destructive/5 border border-destructive/20 rounded-md flex items-center gap-3 mb-6"
    >
        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">{message}</p>
            {cooldown > 0 && <p className="text-xs text-destructive/70">Retry in {cooldown}s</p>}
        </div>
        {onRetry && cooldown === 0 && (
            <button onClick={onRetry} className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Retry
            </button>
        )}
        {onDismiss && (
            <button onClick={onDismiss} className="p-1 hover:bg-destructive/10 rounded transition-colors">
                <X className="w-3.5 h-3.5 text-destructive/60" />
            </button>
        )}
    </motion.div>
);

// --- Compliance Warnings ---
export interface ComplianceWarning {
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
    actionLink?: string;
}

const ComplianceWarnings: React.FC<{
    warnings: ComplianceWarning[];
    isExpanded: boolean;
    onToggle: () => void;
    onDismiss: (id: string) => void;
    onDismissAll: () => void;
}> = ({ warnings, isExpanded, onToggle, onDismiss, onDismissAll }) => {
    if (warnings.length === 0) return null;

    return (
        <div className="border border-amber-300/50 bg-amber-50/50 rounded-md overflow-hidden mb-6">
            <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-50 transition-colors">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-foreground">{warnings.length} recommendation{warnings.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span onClick={(e) => { e.stopPropagation(); onDismissAll(); }} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                        Dismiss all
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-amber-200/50 overflow-hidden"
                    >
                        <div className="p-2 space-y-1.5">
                            {warnings.map((warning) => (
                                <div key={warning.id} className="px-3 py-2 rounded bg-amber-50 flex items-start gap-2 text-sm">
                                    <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium text-foreground">{warning.title}: </span>
                                        <span className="text-muted-foreground">{warning.message}</span>
                                        {warning.actionLink && (
                                            <Link to={warning.actionLink} className="ml-1 text-foreground font-medium hover:underline inline-flex items-center gap-0.5">
                                                {warning.actionLabel || 'Fix'} <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                    <button onClick={() => onDismiss(warning.id)} className="text-xs text-muted-foreground hover:text-foreground">×</button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Template Card (Sharp) ---
const TemplateCard: React.FC<{
    id: string;
    name: string;
    description: string;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ name, description, isSelected, onSelect }) => (
    <button
        onClick={onSelect}
        className={`
            w-full p-3 rounded-md border text-left transition-all
            ${isSelected
                ? 'bg-background border-foreground ring-2 ring-foreground shadow-sm'
                : 'bg-background border-border hover:border-foreground/30'
            }
        `}
    >
        {/* Mini Resume Preview - Sharp */}
        <div className="w-full aspect-[4/5] rounded border border-border bg-muted/30 mb-3 p-2">
            <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded-sm bg-foreground/10" />
                <div className="flex-1 space-y-0.5">
                    <div className="h-1 w-12 bg-foreground/15 rounded-sm" />
                    <div className="h-0.5 w-8 bg-foreground/10 rounded-sm" />
                </div>
            </div>
            <div className="space-y-1">
                <div className="h-0.5 w-full bg-foreground/8 rounded-sm" />
                <div className="h-0.5 w-4/5 bg-foreground/8 rounded-sm" />
                <div className="h-0.5 w-3/5 bg-foreground/8 rounded-sm" />
            </div>
            <div className="mt-2 space-y-1">
                <div className="h-0.5 w-6 bg-foreground/12 rounded-sm" />
                <div className="h-0.5 w-full bg-foreground/5 rounded-sm" />
                <div className="h-0.5 w-full bg-foreground/5 rounded-sm" />
            </div>
        </div>

        <div className="flex items-center justify-between">
            <div>
                <h4 className="text-sm font-semibold text-foreground">{name}</h4>
                <p className="text-[11px] text-muted-foreground">{description}</p>
            </div>
            {isSelected && (
                <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-background" />
                </div>
            )}
        </div>
    </button>
);

// --- Progress Ring (Compact) ---
const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
    const size = 36;
    const strokeWidth = 2.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--border))"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--foreground))"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-foreground">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

// --- Checklist (Dense) ---
interface ChecklistItem { id: string; label: string; isComplete: boolean; fixLink?: string; }

const PreflightChecklist: React.FC<{ items: ChecklistItem[] }> = ({ items }) => {
    const completedCount = items.filter(item => item.isComplete).length;
    const progress = (completedCount / items.length) * 100;

    return (
        <div className="p-3 rounded-md border border-border bg-background">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Readiness</h3>
                </div>
                <ProgressRing progress={progress} />
            </div>
            <div className="space-y-1">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center justify-between py-1.5 px-2 rounded text-sm ${item.isComplete ? 'bg-emerald-50/50' : 'bg-destructive/5'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.isComplete ? 'bg-emerald-500' : 'bg-destructive/20'
                                }`}>
                                {item.isComplete
                                    ? <Check className="w-2.5 h-2.5 text-white" />
                                    : <X className="w-2.5 h-2.5 text-destructive" />
                                }
                            </div>
                            <span className={`text-sm ${item.isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {item.label}
                            </span>
                        </div>
                        {!item.isComplete && item.fixLink && (
                            <Link to={item.fixLink} className="text-[11px] font-semibold text-foreground hover:underline">
                                Add →
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Hero Generate Button ---
const GenerateButton: React.FC<{
    isGenerating: boolean;
    cooldown: number;
    canGenerate: boolean;
    onGenerate: () => void;
}> = ({ isGenerating, cooldown, canGenerate, onGenerate }) => {
    const isDisabled = !canGenerate || isGenerating || cooldown > 0;

    return (
        <motion.button
            onClick={onGenerate}
            disabled={isDisabled}
            className={`
                w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-md font-semibold text-sm
                transition-all duration-150
                ${isDisabled
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md active:scale-[0.98]'
                }
            `}
            whileHover={!isDisabled ? { y: -1 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                </>
            ) : cooldown > 0 ? (
                <>
                    <Clock className="w-4 h-4" />
                    <span>Wait {cooldown}s</span>
                </>
            ) : (
                <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Resume</span>
                    <ArrowUpRight className="w-4 h-4" />
                </>
            )}
        </motion.button>
    );
};

// --- Engine Stats ---
const EngineStats: React.FC<{
    country: string;
    template: string;
    atsScore: number;
    estTime: string;
}> = ({ country, template, atsScore, estTime }) => (
    <div className="p-3 rounded-md border border-border bg-muted/30">
        <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Engine</span>
        </div>
        <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{template}</span> format for{' '}
            <span className="font-medium text-foreground">{country}</span>
        </p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {estTime}
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${atsScore > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                <Shield className="w-3 h-3" /> ~{atsScore}% ATS
            </div>
        </div>
    </div>
);

// ==========================================
// 2. MAIN COMPONENT (Logic Layer)
// ==========================================

const CreateResume: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [creating, setCreating] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [generationDuration, setGenerationDuration] = useState<number>(0);

    // Error & Status State
    const [initError, setInitError] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState<number>(0);

    // Warnings State
    const [warnings, setWarnings] = useState<ComplianceWarning[]>([]);
    const [warningsExpanded, setWarningsExpanded] = useState(false);
    const [complianceErrors, setComplianceErrors] = useState<string[]>([]);
    const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());

    // Form State
    const [availableCountries, setAvailableCountries] = useState<string[]>(['Germany', 'India', 'Japan']);
    const [formData, setFormData] = useState({
        jobDescription: '',
        country: 'Germany',
        language: 'English',
        template: 'executive',
        jobTitle: ''
    });

    // Dynamic Metrics
    const [readinessScore, setReadinessScore] = useState(100);
    const [projectedAtsScore, setProjectedAtsScore] = useState(99);

    // Calculate current step
    const currentStep = formData.jobTitle.trim() ? (formData.jobDescription.trim() ? 2 : 1) : 0;

    // Fetch available countries
    useEffect(() => {
        const fetchCountries = async () => {
            const countries = await getAvailableCountries(); // Assuming getAvailableCountries is imported
            setAvailableCountries(countries);
            // Set default country if not already set and countries are available
            if (countries.length > 0 && !formData.country) {
                setFormData(prev => ({ ...prev, country: countries[0] }));
            }
        };
        fetchCountries();
    }, []); // Empty dependency array means this runs once on mount

    // 1. Fetch Profile on Mount
    useEffect(() => {
        let mounted = true;

        const fetchProfile = async () => {
            try {
                const profilePromise = getProfile();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Profile fetch timeout. Server might be waking up (cold start).')), 45000)
                );

                const { profile: fetchedProfile, exists } = await Promise.race([
                    profilePromise,
                    timeoutPromise,
                ]) as { profile: UserProfile | null; exists: boolean };

                if (!mounted) return;

                if (!exists || !fetchedProfile || !fetchedProfile.full_name || !fetchedProfile.email) {
                    navigate('/profile', {
                        state: { message: 'Incomplete profile. Name and Email are required.', returnTo: '/create' }
                    });
                    return;
                }

                setProfile(fetchedProfile);
                if (fetchedProfile.country) {
                    setFormData(prev => ({ ...prev, country: fetchedProfile.country! }));
                }

            } catch (err: any) {
                if (mounted) {
                    const isTimeout = err instanceof Error && err.message.includes('timeout');
                    const errorMsg = isTimeout 
                        ? 'Backend server is waking up. Please refresh the page in a few seconds.' 
                        : 'Unable to synchronize profile. Remote server unreachable.';
                    setInitError(errorMsg);
                }
            } finally {
                if (mounted) setLoadingProfile(false);
            }
        };

        setGenerationError(null);
        setInitError(null);
        fetchProfile();

        return () => { mounted = false; };
    }, [navigate]);

    // 2. Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // 2b. Generation Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (creating) {
            const startTime = Date.now();
            interval = setInterval(() => {
                setGenerationDuration(Math.floor((Date.now() - startTime) / 1000));
            }, 100);
        } else {
            setGenerationDuration(0);
        }
        return () => clearInterval(interval);
    }, [creating]);

    // 3. Compliance Logic & Metrics Calculation
    const calculateMetrics = useCallback((userProfile: UserProfile, jobDesc: string, currentWarnings: ComplianceWarning[]) => {
        // --- Readiness Score ---
        let rScore = 100;

        // Critical Penalties
        if (!userProfile.full_name) rScore -= 10;
        if (!userProfile.email) rScore -= 10;
        if ((userProfile.work_experiences?.length || 0) === 0) rScore -= 20;
        if ((userProfile.skills?.length || 0) === 0) rScore -= 15;
        if ((userProfile.educations?.length || 0) === 0) rScore -= 10;

        // Warning Penalties
        rScore -= (currentWarnings.length * 5); // 5 points per warning

        setReadinessScore(Math.max(0, Math.min(100, rScore)));

        // --- Projected ATS Score ---
        let ats = 85; // Base score for a good template

        // Profile Strength Boost
        if ((userProfile.work_experiences?.length || 0) > 1) ats += 5;
        if ((userProfile.skills?.length || 0) > 5) ats += 5;

        // Job Description Matching
        if (jobDesc.trim().length > 50) {
            const jdLower = jobDesc.toLowerCase();
            const profileSkills = (userProfile.skills || []).map(s => s.toLowerCase());

            // Extract potential keywords from JD (simple heuristic: words > 4 chars)
            const jdWords = jdLower.match(/\b\w{4,}\b/g) || [];
            const uniqueJdKeywords = new Set(jdWords);

            if (uniqueJdKeywords.size > 0) {
                let matches = 0;
                profileSkills.forEach(skill => {
                    if (jdLower.includes(skill)) matches++;
                });

                // Density Factor
                const matchRatio = Math.min(1, matches / (uniqueJdKeywords.size * 0.2)); // Assume we need 20% coverage for max boost
                ats = 70 + (matchRatio * 25); // Range 70-95 based on match
            }
        }

        // Compliance Penalty
        if (currentWarnings.some(w => w.type === 'error')) ats -= 20;
        if (currentWarnings.some(w => w.type === 'warning')) ats -= 5;

        setProjectedAtsScore(Math.floor(Math.max(0, Math.min(99, ats))));
    }, []);

    const generateComplianceWarnings = useCallback((userProfile: UserProfile, targetCountry: string) => {
        const newWarnings: ComplianceWarning[] = [];

        if (targetCountry === 'Germany') {
            if (!userProfile.photo_url) {
                newWarnings.push({
                    id: 'photo-missing',
                    type: 'info',
                    title: 'Photo',
                    message: 'German employers expect a professional headshot.',
                    actionLabel: 'Upload',
                    actionLink: '/profile',
                });
            }

            const germanLang = userProfile.languages?.find((l: any) => {
                const name = typeof l === 'string' ? l : (l.name || l.language || '');
                return name.toLowerCase().includes('german');
            });

            if (germanLang) {
                let level = typeof germanLang === 'string' ? 'Native' : ((germanLang as any).level || (germanLang as any).proficiency_cefr || 'Native');
                const upper = level.toUpperCase();

                const cefrScore: { [key: string]: number } = {
                    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'NATIVE': 7,
                    'FLUENT': 6, 'PROFICIENT': 5, 'ADVANCED': 5, 'INTERMEDIATE': 3, 'BASIC': 1, 'BEGINNER': 1
                };

                const cefrMatch = upper.match(/\b([A-C][1-2])\b/g);
                let detectedLevel = 'NATIVE';
                if (cefrMatch && cefrMatch.length > 0) {
                    detectedLevel = cefrMatch.sort()[cefrMatch.length - 1].toUpperCase();
                } else {
                    if (upper.includes('FLUENT') || upper.includes('PROFICIENT')) detectedLevel = 'C2';
                    else if (upper.includes('ADVANCED')) detectedLevel = 'C1';
                    else if (upper.includes('INTERMEDIATE')) detectedLevel = 'B2';
                    else if (upper.includes('BASIC') || upper.includes('BEGINNER')) detectedLevel = 'A1';
                }

                const userScore = cefrScore[detectedLevel] || 0;
                if (userScore > 0 && userScore < 3) {
                    newWarnings.push({
                        id: 'german-level-low',
                        type: 'warning',
                        title: 'German level',
                        message: `B1+ typically required. Detected: ${detectedLevel}.`,
                        actionLabel: 'Update',
                        actionLink: '/profile#languages',
                    });
                }
            }

            if (!userProfile.educations || userProfile.educations.length === 0) {
                const text = (userProfile.professional_summary || '') + ' ' + (userProfile.work_experiences?.map(e => e.achievements.join(' ')).join(' ') || '');
                const lower = text.toLowerCase();
                const eduKeywords = ['bachelor', 'university', 'degree', 'master', 'phd', 'mba', 'b.tech', 'diploma'];

                if (eduKeywords.some(kw => lower.includes(kw))) {
                    newWarnings.push({
                        id: 'education-detected',
                        type: 'warning',
                        title: 'Education',
                        message: 'Keywords detected but no education entries.',
                        actionLabel: 'Add',
                        actionLink: '/profile#education',
                    });
                }
            }
        }

        const activeWarnings = newWarnings.filter(w => !dismissedWarnings.has(w.id));
        setWarnings(activeWarnings);
        if (activeWarnings.length > 0 && !warningsExpanded) {
            setWarningsExpanded(true);
        }

        // Recalculate metrics whenever warnings or dependencies change
        calculateMetrics(userProfile, formData.jobDescription, activeWarnings);

    }, [dismissedWarnings, warningsExpanded, formData.jobDescription, calculateMetrics]); // Added calculateMetrics dependency

    useEffect(() => {
        if (profile) {
            generateComplianceWarnings(profile, formData.country);
        }
    }, [formData.country, profile, generateComplianceWarnings, formData.jobDescription]); // Added jobDescription to trigger updates


    // 4. Handle Submit
    const handleSubmit = async (override: any = {}) => {
        // Fix: If called from onClick, override is a SyntheticEvent. We must ignore it.
        const isEvent = override && (override.preventDefault || override.target);
        const safeOverride = isEvent ? {} : override;

        if (creating || cooldown > 0) return;
        setCreating(true);
        setGenerationError(null);

        try {
            const userData = profile ? {
                full_name: profile.full_name || '',
                contact: {
                    email: profile.email || '',
                    phone: profile.phone || '',
                    linkedin: profile.linkedin_url,
                    city: profile.city || '',
                },
                professional_summary: profile.professional_summary,
                skills: profile.skills || [],
                work_experiences: profile.work_experiences || [],
                educations: profile.educations || [],
                languages: Array.isArray(profile.languages)
                    ? profile.languages.map((l: any) => {
                        let level = typeof l === 'string' ? 'Native' : (l.level || 'Native');
                        const upper = level.toUpperCase();

                        // Robust Mapping for Compliance
                        const cefrMap: { [key: string]: string } = {
                            'NATIVE': 'Native', 'FLUENT': 'C2', 'PROFICIENT': 'C2',
                            'FULL PROFESSIONAL': 'C2', 'PROFESSIONAL': 'C1',
                            'ADVANCED': 'C1', 'INTERMEDIATE': 'B2', 'BASIC': 'A2', 'BEGINNER': 'A1'
                        };

                        // 1. Check for exact CEFR code match first
                        const cefrMatch = upper.match(/\b([A-C][1-2])\b/g);
                        if (cefrMatch && cefrMatch.length > 0) {
                            level = cefrMatch.sort()[cefrMatch.length - 1]; // Take highest if multiple
                        } else {
                            // 2. Try to map descriptive terms
                            let mapped = 'Native'; // Default backup
                            for (const [key, val] of Object.entries(cefrMap)) {
                                if (upper.includes(key)) {
                                    mapped = val;
                                    break; // Stop at first match (ordered by priority if needed, but keys are distinct enough)
                                }
                            }
                            level = mapped;
                        }
                        return typeof l === 'string'
                            ? { language: l, proficiency_cefr: 'Native' }
                            : { language: l.name, proficiency_cefr: level };
                    })
                    : [],
                certifications: profile.certifications || [],
                profile_pic_url: profile.photo_url
            } : {
                full_name: 'User',
                contact: { email: '', phone: '', linkedin: '', city: '' },
                professional_summary: '', skills: [], work_experiences: [], educations: [], languages: [], certifications: [], profile_pic_url: null
            };

            const response = await createResume({
                title: formData.jobTitle || 'New Resume',
                country: formData.country,
                language: formData.language,
                template_style: formData.template,
                user_data: userData,
                job_description: formData.jobDescription,
                job_title: formData.jobTitle,
                ...safeOverride
            });

            if (response && response.data && response.data.id) {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (err: any) {
            const status = err.response?.status;
            const detail = err.response?.data?.detail;

            if (status === 429) {
                setGenerationError('Request in progress. Wait 30 seconds.');
                setCooldown(30);
            } else if (status === 503) {
                setGenerationError('AI service recovering. Try again shortly.');
                setCooldown(30);
            } else if (status === 400 && detail?.code === 'COMPLIANCE_ERROR') {
                // Parse errors from detail.errors (which is a list of strings)
                setComplianceErrors(detail.errors || [detail.message]);
            } else {
                // DEBUG: Show actual error
                const errorMsg = detail?.message || detail || err.message || 'Unknown error';
                setGenerationError(`Generation failed (${status || 'Net'}): ${typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}`);
            }
        } finally {
            setCreating(false);
        }
    };

    const checklistItems: ChecklistItem[] = [
        { id: 'name', label: 'Name', isComplete: !!profile?.full_name, fixLink: '/profile' },
        { id: 'email', label: 'Email', isComplete: !!profile?.email, fixLink: '/profile' },
        { id: 'experience', label: 'Experience', isComplete: (profile?.work_experiences?.length || 0) > 0, fixLink: '/profile#experience' },
        { id: 'skills', label: 'Skills', isComplete: (profile?.skills?.length || 0) > 0, fixLink: '/profile#skills' },
    ];

    const templates = [
        { id: 'executive', name: 'Executive', description: 'ATS-optimized' },
        { id: 'modern', name: 'Modern', description: 'Contemporary' },
    ];

    if (loadingProfile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="w-5 h-5 animate-spin text-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="border-b border-border">
                    <div className="flex items-center justify-between px-6 py-4">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                            <span>Back</span>
                        </Link>
                        <StepIndicator currentStep={currentStep} />
                    </div>
                </header>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] min-h-[calc(100vh-57px)]">

                    {/* Left: Form */}
                    <main className="p-6 lg:p-8 lg:border-r border-border">
                        {/* Title */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Create Resume
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                AI-tailored to your target position
                            </p>
                        </div>

                        <AnimatePresence>
                            {initError && <ErrorBanner message={initError} onDismiss={() => setInitError(null)} />}
                            {generationError && (
                                <ErrorBanner
                                    message={generationError}
                                    cooldown={cooldown}
                                    onRetry={cooldown === 0 ? handleSubmit : undefined}
                                    onDismiss={() => setGenerationError(null)}
                                />
                            )}
                        </AnimatePresence>

                        <ComplianceWarnings
                            warnings={warnings}
                            isExpanded={warningsExpanded}
                            onToggle={() => setWarningsExpanded(!warningsExpanded)}
                            onDismiss={(id) => {
                                setDismissedWarnings(prev => new Set([...prev, id]));
                                setWarnings(prev => prev.filter(w => w.id !== id));
                            }}
                            onDismissAll={() => {
                                const allIds = warnings.map(w => w.id);
                                setDismissedWarnings(prev => new Set([...prev, ...allIds]));
                                setWarnings([]);
                            }}
                        />

                        {/* Form Fields */}
                        <div className="space-y-6">
                            <TechInput
                                label="Target Position"
                                value={formData.jobTitle}
                                onChange={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}
                                placeholder="e.g. Senior Product Designer"
                            />

                            <TechTextarea
                                label="Job Description"
                                value={formData.jobDescription}
                                onChange={(value) => setFormData(prev => ({ ...prev, jobDescription: value }))}
                                rows={10}
                                placeholder="Paste the full job description here for AI tailoring..."
                                hint="Optional but recommended"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <TechSelect
                                    label="Market"
                                    value={formData.country}
                                    options={availableCountries.map(c => ({ value: c, label: c }))}
                                    onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                                />
                                <TechSelect
                                    label="Language"
                                    value={formData.language}
                                    options={[
                                        { value: 'English', label: 'English' },
                                        { value: 'German', label: 'German' },
                                        { value: 'French', label: 'French' },
                                    ]}
                                    onChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                                />
                            </div>
                        </div>
                    </main>

                    {/* Right: Sidebar */}
                    <aside className="bg-muted/30 p-6 lg:p-6 hidden lg:flex flex-col">
                        <div className="flex-1 space-y-4">
                            {/* Templates */}
                            <div>
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Template</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {templates.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            id={template.id}
                                            name={template.name}
                                            description={template.description}
                                            isSelected={formData.template === template.id}
                                            onSelect={() => setFormData(prev => ({ ...prev, template: template.id }))}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Checklist */}
                            <PreflightChecklist items={[
                                ...checklistItems,
                                { id: 'readiness', label: `Start (${readinessScore}%)`, isComplete: readinessScore >= 80, fixLink: '#' }
                            ].filter(i => i.id !== 'readiness')} />
                            <div className="mt-1 px-1">
                                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                                    <span>Readiness</span>
                                    <span>{readinessScore}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 rounded-full ${readinessScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${readinessScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Engine Stats */}
                            <EngineStats
                                country={formData.country}
                                template={formData.template}
                                atsScore={projectedAtsScore}
                                estTime={creating ? `${generationDuration}s` : "~12s"}
                            />
                        </div>

                        {/* Generate Button */}
                        <div className="mt-6 pt-4 border-t border-border">
                            <GenerateButton
                                isGenerating={creating}
                                cooldown={cooldown}
                                canGenerate={formData.jobTitle.trim().length > 0 && !!profile}
                                onGenerate={handleSubmit}
                            />
                        </div>
                    </aside>

                    {/* Mobile Generate */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                        <GenerateButton
                            isGenerating={creating}
                            cooldown={cooldown}
                            canGenerate={formData.jobTitle.trim().length > 0 && !!profile}
                            onGenerate={handleSubmit}
                        />
                    </div>
                </div>
            </div>

            {/* Compliance Modal */}
            <AnimatePresence>
                {complianceErrors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setComplianceErrors([])}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-lg bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            {/* Header: Context & Stakes */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-200 text-slate-600">
                                            {formData.country}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            • Resume Compliance Check
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <span className="bg-red-100 text-red-600 p-1 rounded-md">
                                            <AlertCircle className="w-4 h-4" />
                                        </span>
                                        Compliance Issues Detected
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setComplianceErrors([])}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                </button>
                            </div>

                            {/* Error List */}
                            <div className="p-6 space-y-3 max-h-[40vh] overflow-y-auto">
                                {complianceErrors.map((err: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="bg-red-50/50 rounded-xl p-4 border border-red-100 relative"
                                    >
                                        <div className="absolute top-3 right-3 opacity-50">
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                        </div>
                                        <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-1.5">
                                            DETECTED ISSUE
                                        </p>
                                        <p className="font-medium text-slate-700 text-sm leading-relaxed">
                                            {typeof err === 'string' ? err : err.message}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer: Dark Dominator */}
                            <div className="bg-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex gap-3">
                                    <div className="mt-0.5 shrink-0">
                                        <AlertCircle className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                            COMPLIANCE WARNING
                                        </p>
                                        <p className="text-sm font-medium text-slate-200 leading-snug max-w-sm">
                                            Missing requirements may cause rejection. Fix or proceed at your own risk.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => {
                                            setComplianceErrors([]);
                                            handleSubmit({ skip_compliance: true });
                                        }}
                                        className="px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-700"
                                    >
                                        Skip Anyway
                                    </button>
                                    <button
                                        onClick={() => setComplianceErrors([])}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 active:scale-95 transition-all shadow-lg shadow-white/10"
                                    >
                                        Fix Now <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreateResume;
