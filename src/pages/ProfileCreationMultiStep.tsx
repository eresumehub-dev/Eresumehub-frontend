import React, { useState, forwardRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    Plus, Upload, CheckCircle, ArrowLeft, ArrowRight,
    User as UserIcon, Mail, Briefcase, GraduationCap, Award, Code, Globe, 
    BookOpen, Star, MapPin, X, AlertTriangle, Linkedin, Loader2, Sparkles, CheckCircle2, HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Real Imports
import { useAuth } from '../context/AuthContext';
import {
    getProfile, createOrUpdateProfile, createProfileFromResume,
    uploadProfilePicture, UserProfile as APIUserProfile, generateSummary
} from '../services/profile';
import { getAvailableCountries } from '../services/schema';
import ImageCropper from '../components/ImageCropper';

// --- STYLES & UTILITIES ---
const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
    :root {
      --background: 240 5% 98%;
      --foreground: 240 10% 3.9%;
    }
 
    .glass-panel {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }

    .glass-panel-elevated {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
    }

    .shimmer {
      animation: shimmer 2s infinite linear;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%) skewX(-15deg); }
      100% { transform: translateX(200%) skewX(-15deg); }
    }
  `}} />
);

const springConfig = { type: "spring", mass: 1, stiffness: 80, damping: 20 };

// --- COMPONENT: TOOLTIP ---
interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, side = 'top' }) => {
    return (
        <div className="relative group/tt inline-flex items-center justify-center">
            {children}
            <div className={`
                absolute hidden group-hover/tt:block w-max max-w-[240px] text-left px-3 py-2
                bg-[#1D1D1F] text-white text-[12px] font-medium leading-relaxed rounded-lg shadow-xl z-[100] pointer-events-none
                ${side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2.5' : ''}
                ${side === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2.5' : ''}
                ${side === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2.5' : ''}
                ${side === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2.5' : ''}
            `}>
                {content}
                <div className={`
                    absolute border-[5px] border-transparent
                    ${side === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-[1px] border-t-[#1D1D1F]' : ''}
                    ${side === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-[1px] border-b-[#1D1D1F]' : ''}
                    ${side === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-[1px] border-l-[#1D1D1F]' : ''}
                    ${side === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-[1px] border-r-[#1D1D1F]' : ''}
                `} />
            </div>
        </div>
    );
};

// --- COMPONENT: FLIGHT STEPPER ---
// --- COMPONENT: FLIGHT STEPPER ---
interface Step {
    id: number;
    title: string;
    icon: any;
}

interface FlightStepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (stepId: number) => void;
    stepValidity: Record<number, 'valid' | 'invalid'>;
}

const FlightStepper: React.FC<FlightStepperProps> = ({ steps, currentStep, onStepClick, stepValidity }) => {
    return (
        <LayoutGroup>
            <div className="relative w-full overflow-hidden select-none py-6">
                <div className="relative px-2 md:px-6 max-w-5xl mx-auto">
                    <div className="relative mx-4 md:mx-6">
                        <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 flex items-center z-0">
                            {steps.slice(0, -1).map((_: any, i: number) => {
                                const stepId = i + 1;
                                const isPast = currentStep > stepId;
                                const status = stepValidity[stepId];

                                return (
                                    <div key={i} className="h-full flex-1 relative bg-black/5 overflow-hidden">
                                        <motion.div
                                            className={`absolute inset-y-0 left-0 h-full ${status === 'invalid'
                                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                                                : 'bg-gradient-to-r from-[#0066CC] to-[#4DCFFF]'
                                            }`}
                                            initial={{ width: "0%" }}
                                            animate={{ width: isPast ? "101%" : "0%" }}
                                            transition={{ duration: 0.6, delay: i * 0.05, ease: "circOut" }}
                                        >
                                            {isPast && <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-full shimmer" />}
                                        </motion.div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="relative flex items-center justify-between z-10">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const stepNumber = index + 1;
                                const isCompleted = stepNumber < currentStep;
                                const isCurrent = stepNumber === currentStep;
                                const isValid = stepValidity[stepNumber] !== 'invalid';

                                return (
                                    <Tooltip key={step.id} content={`Step ${stepNumber}: ${step.title}`} side="top">
                                        <motion.button
                                            key={step.id}
                                            type="button"
                                            onClick={() => onStepClick(step.id)}
                                            className="relative flex flex-col items-center group focus:outline-none cursor-pointer"
                                            whileTap={{ scale: 0.9 }}
                                            whileHover={{ scale: 1.1 }}
                                            transition={springConfig}
                                        >
                                            <div
                                                className={`
                                                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-20
                                                    ${isCompleted ? (isValid ? 'border-[#0066CC] bg-[#F0F7FF]' : 'border-amber-400 bg-amber-50') : ''}
                                                    ${isCurrent ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-xl shadow-black/10 scale-110' : ''}
                                                    ${!isCompleted && !isCurrent ? 'border-black/10 bg-white text-[#86868B]' : ''}
                                                `}
                                                style={isCurrent ? { backgroundColor: '#1D1D1F' } : {}}
                                            >
                                                <motion.div layout transition={springConfig}>
                                                    {isCompleted ? (
                                                        isValid ? <CheckCircle className="w-5 h-5 text-[#0066CC]" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                    ) : (
                                                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isCurrent ? 'text-white' : 'currentColor'}`} />
                                                    )}
                                                </motion.div>
                                            </div>
                                            <div className="absolute top-14 text-center hidden md:block w-32">
                                                <span className={`block text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isCurrent ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                                                    {step.title}
                                                </span>
                                            </div>
                                        </motion.button>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </LayoutGroup>
    );
};

// --- COMPONENT: GLASS INPUTS ---
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: any;
    error?: string;
    tooltip?: string;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    ({ label, icon: Icon, error, tooltip, className = '', ...props }, ref) => (
        <motion.div className="space-y-1.5 w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={springConfig}>
            {label && (
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#86868B] uppercase tracking-wider pl-1">
                    {label} {props.required && <span className="text-[#FF3B30]">*</span>}
                    {tooltip && (
                        <Tooltip content={tooltip}>
                            <HelpCircle className="w-3.5 h-3.5 text-[#86868B] cursor-help hover:text-[#1D1D1F] transition-colors" />
                        </Tooltip>
                    )}
                </label>
            )}
            <div className="relative group">
                {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] group-focus-within:text-[#1D1D1F] transition-colors"><Icon className="w-4 h-4" /></div>}
                <input
                    ref={ref}
                    className={`
                        w-full px-4 py-3.5 bg-white/60 backdrop-blur-md rounded-xl text-[#1D1D1F] text-[14px] font-medium placeholder:text-[#86868B]/50 transition-all duration-300 border border-black/[0.04]
                        hover:bg-white hover:border-black/10 focus:outline-none focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10
                        ${Icon ? 'pl-11' : ''} ${error ? 'border-[#FF3B30] focus:border-[#FF3B30]' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
        </motion.div>
    ));
GlassInput.displayName = 'GlassInput';

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    labelAction?: React.ReactNode;
    tooltip?: string;
    error?: string;
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
    ({ label, labelAction, tooltip, error, className = '', ...props }, ref) => (
        <motion.div className="space-y-1.5 w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={springConfig}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#86868B] uppercase tracking-wider pl-1">
                        {label} {props.required && <span className="text-[#FF3B30]">*</span>}
                        {tooltip && (
                            <Tooltip content={tooltip}>
                                <HelpCircle className="w-3.5 h-3.5 text-[#86868B] cursor-help hover:text-[#1D1D1F] transition-colors" />
                            </Tooltip>
                        )}
                    </label>
                    {labelAction}
                </div>
            )}
            <textarea
                ref={ref}
                className={`
                    w-full px-4 py-3.5 bg-white/60 backdrop-blur-md rounded-xl text-[#1D1D1F] text-[14px] font-medium placeholder:text-[#86868B]/50 transition-all duration-300 border border-black/[0.04] resize-none leading-relaxed
                    hover:bg-white hover:border-black/10 focus:outline-none focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10
                    ${error ? 'border-[#FF3B30] focus:border-[#FF3B30]' : ''}
                    ${className}
                `}
                {...props}
            />
        </motion.div>
    ));
GlassTextarea.displayName = 'GlassTextarea';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
    <motion.div 
        className={`glass-panel rounded-3xl p-6 md:p-8 relative ${className}`}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springConfig}
    >
        {children}
    </motion.div>
);

// --- MAIN APP / MULTI-STEPPER ---
const STEPS = [
    { id: 1, title: 'Personal', icon: UserIcon },
    { id: 2, title: 'Contact', icon: Mail },
    { id: 3, title: 'Experience', icon: Briefcase },
    { id: 4, title: 'Education', icon: GraduationCap },
    { id: 5, title: 'Skills', icon: Code },
    { id: 6, title: 'Languages', icon: Globe },
    { id: 7, title: 'Projects', icon: BookOpen },
    { id: 8, title: 'Certificates', icon: Award },
    { id: 9, title: 'Extras', icon: Star },
    { id: 10, title: 'Review', icon: CheckCircle }
];

interface LocalUserProfile extends Omit<APIUserProfile, 'extras'> {
    links?: { label: string; url: string }[];
    street_address?: string;
    postal_code?: string;
    professional_summary?: string;
    motivation?: string;
    self_pr?: string;
    extras: {
        interests: string[];
        awards: string[];
        publications: string[];
        volunteering: string[];
    };
}

const ProfileCreationMultiStep = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    
    const [photoUploading, setPhotoUploading] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);

    // Master profile state
    const [profile, setProfile] = useState<Partial<LocalUserProfile>>({
        full_name: '', email: user?.email || '', phone: '', street_address: '', postal_code: '', city: '', country: 'Germany',
        nationality: '', date_of_birth: '', linkedin_url: '', photo_url: '',
        professional_summary: '', motivation: '', self_pr: '',
        skills: [], languages: [], links: [], work_experiences: [], educations: [], projects: [], certifications: [],
        extras: { interests: [], awards: [], publications: [], volunteering: [] }
    });

    useEffect(() => {
        getAvailableCountries().then(setAvailableCountries);
        getProfile().then(({ profile: backendProfile, exists }) => {
            if (exists && backendProfile) {
                const uiExtras = {
                    interests: backendProfile.extras?.interests || [],
                    awards: backendProfile.extras?.awards?.map(a => typeof a === 'string' ? a : a.title) || [],
                    publications: backendProfile.extras?.publications?.map(p => typeof p === 'string' ? p : p.title) || [],
                    volunteering: backendProfile.extras?.volunteering?.map(v => typeof v === 'string' ? v : v.role + ' at ' + v.organization) || []
                };

                setProfile({
                    ...backendProfile,
                    work_experiences: backendProfile.work_experiences || [],
                    educations: backendProfile.educations || [],
                    projects: backendProfile.projects || [],
                    certifications: backendProfile.certifications || [],
                    skills: backendProfile.skills || [],
                    languages: backendProfile.languages || [],
                    photo_url: backendProfile.photo_url || '',
                    extras: uiExtras
                } as LocalUserProfile);
            }
        });
    }, []);

    const updateItem = (section: string, id: string, field: string, value: any) => {
        setProfile(prev => ({ ...prev, [section]: (prev as any)[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item) }));
    };
    const removeItem = (section: string, id: string) => {
        setProfile(prev => ({ ...prev, [section]: (prev as any)[section].filter((item: any) => item.id !== id) }));
    };

    const nextStep = () => setCurrentStep(c => Math.min(c + 1, STEPS.length));
    const prevStep = () => setCurrentStep(c => Math.max(c - 1, 1));

    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [newAward, setNewAward] = useState('');

    const stepValidity: Record<number, 'valid' | 'invalid'> = {
        1: (profile.full_name?.trim() && profile.professional_summary?.trim()) ? 'valid' : 'invalid',
        2: profile.email?.trim() ? 'valid' : 'invalid',
        3: profile.work_experiences?.some((w: any) => !w.job_title?.trim() || !w.company?.trim()) ? 'invalid' : 'valid',
        4: profile.educations?.some((e: any) => !e.degree?.trim() || !e.institution?.trim()) ? 'invalid' : 'valid',
        5: 'valid', 6: 'valid', 7: 'valid', 8: 'valid', 9: 'valid', 10: 'valid'
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setCropImage(reader.result as string));
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropImage(null);
        const objectUrl = URL.createObjectURL(croppedBlob);
        setProfile(prev => ({ ...prev, photo_url: objectUrl }));
        try {
            setPhotoUploading(true);
            const file = new File([croppedBlob], "profile_photo.jpg", { type: "image/jpeg" });
            const { photo_url } = await uploadProfilePicture(file);
            setProfile(prev => ({ ...prev, photo_url }));
        } catch (err) {
            toast.error("Photo upload failed");
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const { profile: importedProfile } = await createProfileFromResume(file);
            const uiExtras = {
                interests: importedProfile.extras?.interests || [],
                awards: importedProfile.extras?.awards?.map(a => typeof a === 'string' ? a : a.title) || [],
                publications: importedProfile.extras?.publications?.map(p => typeof p === 'string' ? p : p.title) || [],
                volunteering: importedProfile.extras?.volunteering?.map(v => typeof v === 'string' ? v : v.organization) || []
            };
            setProfile(prev => ({ ...prev, ...importedProfile, certifications: importedProfile.certifications || [], extras: uiExtras } as any));
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
        } catch (err) {
            toast.error("Import failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSave = async () => {
        if (!profile.full_name) return;
        try { await createOrUpdateProfile(profile as APIUserProfile); } catch (err) { console.error("Auto-save failed", err); }
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const { summary } = await generateSummary(profile as APIUserProfile);
            setProfile(prev => ({ ...prev, professional_summary: summary }));
        } catch (err) {
            toast.error("Summary generation failed");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!profile.full_name || !profile.email) return;
        setLoading(true);
        try {
            const backendExtras = {
                interests: profile.extras?.interests || [],
                awards: profile.extras?.awards?.map(title => ({ title, issuer: '', date: new Date().toISOString() })) || [],
                publications: profile.extras?.publications?.map(title => ({ title, publisher: '', date: new Date().toISOString() })) || [],
                volunteering: profile.extras?.volunteering?.map(org => ({ organization: org, role: 'Volunteer', start_date: new Date().toISOString(), description: '' })) || []
            };
            const payload = { ...profile, links: profile.links || [], extras: backendExtras };
            await createOrUpdateProfile(payload as any);
            setIsFinished(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            toast.error("Save failed");
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case 1: // Personal Information
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="flex justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">Personal Information</h2>
                                <p className="text-muted-foreground text-base">Let's start with the basics</p>
                            </div>
                            <div className="relative">
                                <button onClick={() => document.getElementById('resume-upload')?.click()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
                                    <Upload className="w-4 h-4" /> Import from Resume
                                </button>
                                <input id="resume-upload" type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleImportResume} />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-auto flex flex-col items-center gap-3">
                                <div className="space-y-4">
                                    <Tooltip content="Upload a professional headshot. Max size 2MB. Often expected in DACH regions." side="right">
                                        <div className="w-32 h-32 rounded-2xl bg-white border-2 border-dashed border-black/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors shadow-sm group relative overflow-hidden">
                                            {photoUploading ? (
                                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            ) : profile.photo_url ? (
                                                <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-2" />
                                                    <span className="text-[10px] text-muted-foreground">Upload Photo</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoSelect} />
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex-1 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <GlassInput label="Full Name" placeholder="e.g. Allen Samuel" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} onBlur={handleAutoSave} icon={UserIcon} required className="md:col-span-2" />
                                    <GlassInput
                                        label="Date of Birth"
                                        type="date"
                                        value={profile.date_of_birth || ''}
                                        onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })}
                                        onBlur={handleAutoSave}
                                        required
                                    />
                                    <GlassInput
                                        label="Nationality"
                                        placeholder="e.g. American"
                                        value={profile.nationality || ''}
                                        onChange={e => setProfile({ ...profile, nationality: e.target.value })}
                                        onBlur={handleAutoSave}
                                        required
                                    />
                                </div>
                                <div>
                                    <GlassTextarea
                                        label="Professional Summary"
                                        placeholder="Experienced software engineer..."
                                        rows={4}
                                        value={profile.professional_summary || ''}
                                        onChange={e => setProfile({ ...profile, professional_summary: e.target.value })}
                                        required
                                        labelAction={
                                            <div className="relative group">
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateSummary}
                                                    disabled={isGeneratingSummary}
                                                    className="flex items-center gap-1.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 border border-indigo-100"
                                                >
                                                    {isGeneratingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                    {isGeneratingSummary ? 'Writing...' : 'Write with AI'}
                                                </button>
                                            </div>
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-black/5">
                                    <div className="col-span-full">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                            Regional Requirements (DACH & Japan)
                                        </p>
                                    </div>
                                    <GlassTextarea
                                        label="Self-PR (自己PR)"
                                        placeholder="Highlight your core strengths and character..."
                                        value={profile.self_pr || ''}
                                        onChange={e => setProfile({ ...profile, self_pr: e.target.value })}
                                        onBlur={handleAutoSave}
                                        rows={3}
                                    />
                                    <GlassTextarea
                                        label="Motivation (志望動機)"
                                        placeholder="Why do you want to work in this industry/role?"
                                        value={profile.motivation || ''}
                                        onChange={e => setProfile({ ...profile, motivation: e.target.value })}
                                        onBlur={handleAutoSave}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 2: // Contact
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div><h2 className="text-2xl font-bold">Contact Information</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassInput label="Email" icon={Mail} value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="e.g. allen@example.com" onBlur={handleAutoSave} required />
                            <GlassInput label="Phone" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="e.g. +1 (555) 123-4567" onBlur={handleAutoSave} />

                            <GlassInput label="Street & Number" value={profile.street_address || ''} onChange={e => setProfile({ ...profile, street_address: e.target.value })} placeholder="e.g. 123 Innovation Drive, Apt 4B" required onBlur={handleAutoSave} />
                            <GlassInput label="Postal Code" value={profile.postal_code || ''} onChange={e => setProfile({ ...profile, postal_code: e.target.value })} placeholder="e.g. 94105" required onBlur={handleAutoSave} />

                            <GlassInput label="City" icon={MapPin} value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} placeholder="e.g. San Francisco" required onBlur={handleAutoSave} />
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase">Country</label>
                                <select
                                    className="w-full px-4 py-3.5 bg-white/50 rounded-xl text-sm border border-black/5"
                                    value={profile.country || 'Germany'}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProfile({ ...profile, country: e.target.value })}
                                >
                                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <GlassInput label="LinkedIn URL" icon={Linkedin} value={profile.linkedin_url || ''} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} placeholder="e.g. https://linkedin.com/in/allensamuel" className="md:col-span-2" />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-black/5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Personal Links (Portfolio, Behance, etc.)</h3>
                                <button onClick={() => setProfile(prev => ({ ...prev, links: [...(prev.links || []), { label: '', url: '' }] }))} className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.links?.map((link, idx) => (
                                    <div key={idx} className="relative group p-4 bg-white/40 border border-black/5 rounded-2xl space-y-3">
                                        <button onClick={() => setProfile(prev => ({ ...prev, links: prev.links?.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <GlassInput label="Label" placeholder="e.g. GitHub, Portfolio" value={link.label} onChange={e => {
                                            const newLinks = [...(profile.links || [])]; newLinks[idx].label = e.target.value; setProfile(prev => ({ ...prev, links: newLinks }));
                                        }} />
                                        <GlassInput label="Link URL" placeholder="e.g. https://github.com/allensamuel" value={link.url} onChange={e => {
                                            const newLinks = [...(profile.links || [])]; newLinks[idx].url = e.target.value; setProfile(prev => ({ ...prev, links: newLinks }));
                                        }} />
                                    </div>
                                ))}
                                {(!profile.links || profile.links.length === 0) && (
                                    <div className="md:col-span-2 py-8 text-center border-2 border-dashed border-black/5 rounded-2xl text-muted-foreground/50 text-sm">
                                        No personal links added yet. Click + to add your portfolio, Behance, or GitHub.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            case 3: // Work
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Work Experience</h2><button onClick={() => setProfile(prev => ({ ...prev, work_experiences: [...(prev.work_experiences || []), { id: Date.now().toString(), job_title: '', company: '', city: '', country: profile.country || '', start_date: '', end_date: '', is_current: false, achievements: [] }] }))} className="p-2 bg-secondary rounded-xl"><Plus className="w-4 h-4" /></button></div>
                        <div className="space-y-4">
                            {profile.work_experiences?.map((exp: any) => (
                                <GlassCard key={exp.id} className="relative group">
                                    <button onClick={() => removeItem('work_experiences', exp.id)} className="absolute top-4 right-4"><X className="w-4 h-4 text-muted-foreground" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <GlassInput label="Job Title" value={exp.job_title || ''} placeholder="e.g. Senior Frontend Developer" onChange={(e) => updateItem('work_experiences', exp.id, 'job_title', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Company" value={exp.company || ''} placeholder="e.g. TechNova Inc." onChange={(e) => updateItem('work_experiences', exp.id, 'company', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="City" value={exp.city || ''} placeholder="e.g. Berlin" onChange={(e) => updateItem('work_experiences', exp.id, 'city', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Country" value={exp.country || ''} placeholder="e.g. Germany" onChange={(e) => updateItem('work_experiences', exp.id, 'country', e.target.value)} onBlur={handleAutoSave} />
                                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                            <GlassInput label="Start Date" type="month" value={(exp.start_date || '').substring(0, 7)} onChange={(e) => updateItem('work_experiences', exp.id, 'start_date', e.target.value)} onBlur={handleAutoSave} />
                                            <GlassInput label="End Date" type="month" value={(exp.end_date || '').substring(0, 7)} onChange={(e) => updateItem('work_experiences', exp.id, 'end_date', e.target.value)} disabled={exp.is_current} onBlur={handleAutoSave} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={exp.is_current || false}
                                                onChange={(e) => updateItem('work_experiences', exp.id, 'is_current', e.target.checked)}
                                                onBlur={handleAutoSave}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-xs">Current Role</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Key Achievements (Bullet Points)</label>
                                            <span className="text-[9px] text-indigo-500 font-medium">3-5 bullets with metrics recommended</span>
                                        </div>
                                        <div className="space-y-2">
                                            {(Array.isArray(exp.achievements) ? exp.achievements : [exp.achievements]).map((achievement: string, aIdx: number) => (
                                                <div key={aIdx} className="flex gap-2">
                                                    <GlassInput
                                                        className="flex-1"
                                                        placeholder={aIdx === 0 ? "e.g. Spearheaded the migration to React 18..." : "e.g. Mentored 3 junior developers..."}
                                                        value={achievement}
                                                        onChange={(e) => {
                                                            const newAchievements = [...(Array.isArray(exp.achievements) ? exp.achievements : [])];
                                                            newAchievements[aIdx] = e.target.value;
                                                            updateItem('work_experiences', exp.id, 'achievements', newAchievements);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newAchievements = exp.achievements.filter((_: any, i: number) => i !== aIdx);
                                                            updateItem('work_experiences', exp.id, 'achievements', newAchievements);
                                                        }}
                                                        className="p-2 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newAchievements = [...(Array.isArray(exp.achievements) ? exp.achievements : []), ''];
                                                    updateItem('work_experiences', exp.id, 'achievements', newAchievements);
                                                }}
                                                className="w-full py-2 border-2 border-dashed border-black/5 rounded-xl text-xs text-muted-foreground hover:bg-black/5 transition-colors"
                                            >
                                                + Add Achievement Bullet
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                );
            case 4: // Education
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Education</h2><button onClick={() => setProfile(prev => ({ ...prev, educations: [...(prev.educations || []), { id: Date.now().toString(), degree: '', institution: '', city: '', country: profile.country || '', graduation_date: '', gpa: '' }] }))} className="p-2 bg-secondary rounded-xl"><Plus className="w-4 h-4" /></button></div>
                        <div className="space-y-4">
                            {profile.educations?.map((edu: any) => (
                                <GlassCard key={edu.id} className="relative group">
                                    <button onClick={() => removeItem('educations', edu.id)} className="absolute top-4 right-4"><X className="w-4 h-4 text-muted-foreground" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <GlassInput label="Degree" value={edu.degree || ''} placeholder="e.g. M.S. in Computer Science" onChange={(e) => updateItem('educations', edu.id, 'degree', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Institution" value={edu.institution || ''} placeholder="e.g. Technical University of Munich" onChange={(e) => updateItem('educations', edu.id, 'institution', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="City" value={edu.city || ''} placeholder="e.g. Munich" onChange={(e) => updateItem('educations', edu.id, 'city', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Country" value={edu.country || ''} placeholder="e.g. Germany" onChange={(e) => updateItem('educations', edu.id, 'country', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Grad Date" type="month" value={edu.graduation_date || ''} onChange={(e) => updateItem('educations', edu.id, 'graduation_date', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="GPA (Optional)" placeholder="e.g. 3.8/4.0 or 1.2 (German scale)" value={edu.gpa || ''} onChange={(e) => updateItem('educations', edu.id, 'gpa', e.target.value)} onBlur={handleAutoSave} />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                );
            case 5: // Skills
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <h2 className="text-2xl font-bold">Skills</h2>
                        <GlassCard>
                            <div className="flex gap-3 mb-6">
                                <GlassInput className="flex-1" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => {
                                    if (e.key === 'Enter' && newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
                                        setProfile(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill.trim()] }));
                                        setNewSkill('');
                                    }
                                }} placeholder="Add a skill (e.g. React.js, Agile Leadership, Figma)" />
                                <button onClick={() => {
                                    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
                                        setProfile(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill.trim()] }));
                                        setNewSkill('');
                                    }
                                }} className="px-6 py-3.5 bg-[#1D1D1F] text-white rounded-xl font-medium shadow-md hover:bg-black transition-all">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map(s => (
                                    <span key={s} className="px-3 py-1 bg-white border rounded-lg flex items-center gap-2">{s} <X className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-red-500" onClick={() => setProfile(prev => ({ ...prev, skills: prev.skills?.filter(sk => sk !== s) }))} /></span>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                );
            case 6: // Languages
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex justify-between"><h2 className="text-2xl font-bold">Languages</h2>
                            <button onClick={() => setProfile(prev => ({ ...prev, languages: [...(prev.languages || []), { name: '', level: 'Native' }] }))} className="p-2 bg-secondary rounded-xl"><Plus /></button></div>
                        {profile.languages?.map((l: any, idx: number) => (
                            <GlassCard key={idx} className="relative">
                                <button onClick={() => setProfile(prev => ({ ...prev, languages: prev.languages?.filter((_, i) => i !== idx) }))} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlassInput label="Language" placeholder="e.g. English, Spanish" value={l.name || ''} onChange={e => setProfile(prev => ({ ...prev, languages: prev.languages?.map((x: any, i: number) => i === idx ? { ...x, name: e.target.value } : x) }))} />
                                    <GlassInput label="Proficiency Level" placeholder="e.g. Native, Fluent, B2" value={l.level || ''} onChange={e => setProfile(prev => ({ ...prev, languages: prev.languages?.map((x: any, i: number) => i === idx ? { ...x, level: e.target.value } : x) }))} />
                                </div>
                            </GlassCard>
                        ))}
                    </motion.div>
                );
            case 7: // Projects
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex justify-between"><h2 className="text-2xl font-bold">Projects</h2>
                            <button onClick={() => setProfile(prev => ({ ...prev, projects: [...(prev.projects || []), { id: Date.now().toString(), title: '', role: '', link: '', description: '' }] }))} className="p-2 bg-secondary rounded-xl"><Plus /></button></div>
                        {profile.projects?.map((p: any) => (
                            <GlassCard key={p.id} className="relative">
                                <button onClick={() => removeItem('projects', p.id)} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <GlassInput label="Title" placeholder="e.g. AI-Powered Analytics Dashboard" value={p.title || ''} onChange={e => updateItem('projects', p.id, 'title', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Role" placeholder="e.g. Lead Architect" value={p.role || ''} onChange={e => updateItem('projects', p.id, 'role', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Project Link" icon={Globe} placeholder="e.g. https://github.com/your-repo" value={p.link || ''} onChange={e => updateItem('projects', p.id, 'link', e.target.value)} onBlur={handleAutoSave} className="md:col-span-2" />
                                </div>
                                <GlassTextarea label="Description" placeholder="e.g. Built a real-time analytics dashboard using Next.js and WebSockets..." value={p.description || ''} onChange={e => updateItem('projects', p.id, 'description', e.target.value)} onBlur={handleAutoSave} />
                            </GlassCard>
                        ))}
                    </motion.div>
                );
            case 8: // Certifications
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex justify-between"><h2 className="text-2xl font-bold">Certifications</h2>
                            <button onClick={() => setProfile(prev => ({ ...prev, certifications: [...(prev.certifications || []), { id: Date.now().toString(), name: '', issuing_organization: '', issue_date: '', credential_url: '' }] }))} className="p-2 bg-secondary rounded-xl"><Plus /></button></div>
                        {profile.certifications?.map((c: any) => (
                            <GlassCard key={c.id} className="relative">
                                <button onClick={() => removeItem('certifications', c.id)} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlassInput label="Name" placeholder="e.g. AWS Certified Solutions Architect" value={c.name || ''} onChange={e => updateItem('certifications', c.id, 'name', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Issuing Organization" placeholder="e.g. Amazon Web Services" value={c.issuing_organization || ''} onChange={e => updateItem('certifications', c.id, 'issuing_organization', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Issue Date" type="month" value={c.issue_date || ''} onChange={e => updateItem('certifications', c.id, 'issue_date', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Credential URL" icon={Globe} placeholder="e.g. https://aws.amazon.com/verify/..." value={c.credential_url || ''} onChange={e => updateItem('certifications', c.id, 'credential_url', e.target.value)} onBlur={handleAutoSave} />
                                </div>
                            </GlassCard>
                        ))}
                    </motion.div>
                );
            case 9: // Extras
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Extras</h2>
                            <p className="text-muted-foreground text-base">Interests, Awards, Publications, etc.</p>
                        </div>

                        <div className="space-y-6">
                            <GlassCard>
                                <h3 className="font-bold mb-4">Interests</h3>
                                <div className="flex gap-3 mb-4">
                                    <GlassInput
                                        value={newInterest}
                                        onChange={e => setNewInterest((e.target as HTMLInputElement).value)}
                                        placeholder="Add an interest (e.g. Rock Climbing)"
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter' && newInterest.trim()) { 
                                                setProfile(prev => ({ ...prev, extras: { ...prev.extras!, interests: [...(prev.extras?.interests || []), newInterest.trim()] } }));
                                                setNewInterest(''); 
                                            } 
                                        }}
                                    />
                                    <button onClick={() => { if(newInterest.trim()) { setProfile(prev => ({ ...prev, extras: { ...prev.extras!, interests: [...(prev.extras?.interests || []), newInterest.trim()] } })); setNewInterest(''); } }} className="px-6 py-3.5 bg-[#1D1D1F] text-white rounded-xl font-medium shadow-md hover:bg-black transition-all">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.extras?.interests?.map((item, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900 flex items-center gap-2">
                                            {item}
                                            <button onClick={() => setProfile(prev => ({ ...prev, extras: { ...prev.extras!, interests: prev.extras!.interests.filter((_, idx) => idx !== i) } }))}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard>
                                <h3 className="font-bold mb-4">Awards & Honors</h3>
                                <div className="flex gap-3 mb-4">
                                    <GlassInput
                                        value={newAward}
                                        onChange={e => setNewAward((e.target as HTMLInputElement).value)}
                                        placeholder="Add an award (e.g. Hackathon Winner 2023)"
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter' && newAward.trim()) { 
                                                setProfile(prev => ({ ...prev, extras: { ...prev.extras!, awards: [...(prev.extras?.awards || []), newAward.trim()] } }));
                                                setNewAward(''); 
                                            } 
                                        }}
                                    />
                                    <button onClick={() => { if(newAward.trim()) { setProfile(prev => ({ ...prev, extras: { ...prev.extras!, awards: [...(prev.extras?.awards || []), newAward.trim()] } })); setNewAward(''); } }} className="px-6 py-3.5 bg-[#1D1D1F] text-white rounded-xl font-medium shadow-md hover:bg-black transition-all">Add</button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {profile.extras?.awards?.map((item, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-secondary/30 rounded-lg text-sm">
                                            <span>{item}</span>
                                            <button onClick={() => setProfile(prev => ({ ...prev, extras: { ...prev.extras!, awards: prev.extras!.awards.filter((_, idx) => idx !== i) } }))} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>
                );

            case 10: // Review
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-foreground">Review Your Profile</h2>
                            <p className="text-muted-foreground">Please review your information before submitting.</p>
                        </div>

                        <GlassCard>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {profile.photo_url && (
                                    <img src={profile.photo_url} alt="Profile" className="w-24 h-24 rounded-xl object-cover border border-black/5" />
                                )}
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-xl font-bold">{profile.full_name || 'Your Name'}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        {profile.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</div>}
                                        {profile.phone && <div className="flex items-center gap-2">Phone: {profile.phone}</div>}
                                        <div className="flex items-center gap-2 md:col-span-2">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                {[profile.street_address, (profile.postal_code ? profile.postal_code + ' ' : '') + (profile.city || ''), profile.country]
                                                    .filter(item => item && item.trim() !== '')
                                                    .join(', ')}
                                            </span>
                                        </div>
                                        {profile.linkedin_url && <div className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> {profile.linkedin_url}</div>}
                                    </div>
                                    {profile.professional_summary && (
                                        <p className="text-sm mt-4 text-foreground/80 leading-relaxed bg-secondary/30 p-3 rounded-lg">
                                            <span className="block font-bold text-[10px] uppercase text-muted-foreground mb-1 tracking-wider">Professional Summary</span>
                                            {profile.professional_summary}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                );
            default: return null;
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center text-center p-6">
                <GlobalStyles />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springConfig} className="w-24 h-24 bg-[#34C759] rounded-full flex items-center justify-center mb-8 shadow-[0_10px_40px_rgba(52,199,89,0.3)]">
                    <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springConfig, delay: 0.2 }} className="text-[3rem] font-medium tracking-tight mb-4 text-[#1D1D1F]">Profile Complete.</motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springConfig, delay: 0.3 }} className="text-[16px] text-[#86868B]">Your global professional dossier is ready. Redirecting to Dashboard...</motion.p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-black/5 selection:text-black">
            <GlobalStyles />
            <AnimatePresence>
                {(loading || importSuccess) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                            <p className="font-bold">{importSuccess ? 'Resume Imported!' : 'Syncing Profile...'}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-black/5">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    <span className="text-xl font-bold tracking-tight text-[#1D1D1F]">E-resumehub</span>
                    <div className="flex-1 max-w-2xl">
                        <FlightStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} stepValidity={stepValidity} />
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 relative z-10">
                <GlassCard className="min-h-[600px] glass-panel-elevated">
                    <AnimatePresence mode="wait"><motion.div key={currentStep} className="h-full">{renderContent()}</motion.div></AnimatePresence>
                </GlassCard>
                <div className="flex justify-between mt-8 gap-4">
                    {currentStep > 1 ? <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3.5 bg-white border border-black/[0.06] rounded-[1.25rem] font-medium text-[15px] hover:bg-[#F5F5F7] transition-all shadow-sm"><ArrowLeft className="w-4 h-4" /> Back</button> : <div />}
                    {currentStep < STEPS.length ? <button onClick={nextStep} className="flex items-center gap-2 bg-[#1D1D1F] text-white px-8 py-3.5 rounded-[1.25rem] font-medium text-[15px] hover:bg-black transition-all shadow-md">Continue <ArrowRight className="w-4 h-4" /></button> : <button onClick={handleFinalSubmit} className="flex items-center gap-2 bg-[#34C759] text-white px-10 py-3.5 rounded-[1.25rem] font-bold text-[15px] hover:bg-[#2FB350] transition-all shadow-md">Finish & Save <CheckCircle2 className="w-4 h-4" /></button>}
                </div>
            </main>

            {cropImage && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center">
                    <div className="max-w-xl w-full">
                        <ImageCropper imageSrc={cropImage} onCropComplete={handleCropComplete} onCancel={() => setCropImage(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCreationMultiStep;
