import React, { useState, forwardRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Upload, CheckCircle, ArrowLeft, ArrowRight,
    User as UserIcon, Mail, Briefcase, GraduationCap, Award, Code, Globe, BookOpen, Star, MapPin, X, AlertTriangle, Linkedin, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence, LayoutGroup, MotionProps } from 'framer-motion';

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
    <style>{`
    :root {
      /* Ceramic White Theme */
      --background: 240 5% 98%;
      --foreground: 240 10% 3.9%;
      
      --card: 0 0% 100%;
      --card-foreground: 240 10% 3.9%;
      
      --popover: 0 0% 100%;
      --popover-foreground: 240 10% 3.9%;
      
      --primary: 240 5.9% 10%;
      --primary-foreground: 0 0% 98%;
      
      --secondary: 240 5% 96%;
      --secondary-foreground: 240 5.9% 10%;
      
      --muted: 240 4.8% 95.9%;
      --muted-foreground: 240 3.8% 46.1%;
      
      --accent: 240 4.8% 95.9%;
      --accent-foreground: 240 5.9% 10%;
      
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      
      --border: 240 5.9% 90%;
      --input: 240 5.9% 90%;
      --ring: 240 5.9% 10%;
      
      --radius: 0.75rem;
      
      /* Glass Variables */
      --glass-border: 0 0% 0% / 0.08;
      --glass-glow: 0 0% 0% / 0.03;
    }
 
    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: 'Inter', sans-serif;
    }

    /* Utility Class Mappings */
    .bg-background { background-color: hsl(var(--background)); }
    .bg-card { background-color: hsl(var(--card)); }
    .bg-primary { background-color: hsl(var(--primary)); }
    .text-primary-foreground { color: hsl(var(--primary-foreground)); }
    .bg-secondary { background-color: hsl(var(--secondary)); }
    .text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
    .text-muted-foreground { color: hsl(var(--muted-foreground)); }
    .border-border { border-color: hsl(var(--border)); }
    .bg-muted { background-color: hsl(var(--muted)); }
    .text-foreground { color: hsl(var(--foreground)); }
    .bg-destructive { background-color: hsl(var(--destructive)); }
    .text-destructive { color: hsl(var(--destructive)); }
    .border-destructive { border-color: hsl(var(--destructive)); }

    /* Light Mode Glass Panel */
    .glass-panel {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }

    .glass-panel-elevated {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.05),
        0 10px 10px -5px rgba(0, 0, 0, 0.02),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
    
    .noise-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 50;
      opacity: 0.02;
    }

    .gradient-mesh {
      background-image: 
        radial-gradient(at 0% 0%, hsla(240, 20%, 95%, 1) 0, transparent 50%), 
        radial-gradient(at 100% 100%, hsla(220, 30%, 96%, 1) 0, transparent 50%);
    }

    /* Laser Line Animation */
    @keyframes laser-flow {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
  `}</style>
);

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

const springConfig = {
    type: "spring" as const,
    mass: 1,
    stiffness: 80,
    damping: 20,
};

const FlightStepper: React.FC<FlightStepperProps> = ({ steps, currentStep, onStepClick, stepValidity }) => {
    return (
        <LayoutGroup>
            <div className="relative w-full overflow-hidden select-none">
                {/* Main Stepper Content */}
                <div className="relative px-2 pt-2 pb-10 md:px-6">

                    {/* Progress Track (Segmented) */}
                    <div className="relative mx-4">

                        {/* Connecting Lines Container - Aligned to button centers */}
                        <div className="absolute top-1/2 left-[15px] right-[15px] h-[3px] -translate-y-1/2 flex items-center z-0">
                            {steps.slice(0, -1).map((_, i) => {
                                const stepId = i + 1;
                                const isPast = currentStep > stepId; // Segment is "filled" if we have passed this step
                                const status = stepValidity[stepId];

                                return (
                                    <div key={i} className="h-full flex-1 relative bg-black/5 first:rounded-l-full last:rounded-r-full overflow-hidden">
                                        {/* Filled Progress Segment */}
                                        <motion.div
                                            className={`absolute inset-y-0 left-0 h-full ${status === 'invalid'
                                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                                                }`}
                                            initial={{ width: "0%" }}
                                            animate={{ width: isPast ? "101%" : "0%" }} // 101% to prevent sub-pixel gaps
                                            transition={{ duration: 0.6, delay: i * 0.1, ease: "circOut" }}
                                        >
                                            {/* Shine Effect */}
                                            {isPast && (
                                                <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-full animate-[shimmer_2s_infinite]" />
                                            )}
                                        </motion.div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Step Gauges */}
                        <div className="relative flex items-center justify-between z-10">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const stepNumber = index + 1;
                                const isCompleted = stepNumber < currentStep;
                                const isCurrent = stepNumber === currentStep;

                                const isValid = stepValidity[stepNumber] !== 'invalid';

                                return (
                                    <motion.button
                                        key={step.id}
                                        type="button"
                                        onClick={() => onStepClick(step.id)}
                                        className="relative flex flex-col items-center group focus:outline-none cursor-pointer"
                                        whileTap={{ scale: 0.9 }}
                                        whileHover={{ scale: 1.05 }}
                                        transition={springConfig}
                                    >
                                        {/* Gauge Container */}
                                        <div
                                            className={`
                        w-10 h-10 md:w-14 md:h-14 rounded-full 
                        flex items-center justify-center transition-all duration-300 bg-white
                        ${isCompleted ? (isValid ? 'border-emerald-500 bg-emerald-50' : 'border-amber-400 bg-amber-50') : ''}
                        ${isCurrent ? 'border-primary text-primary-foreground shadow-xl shadow-primary/30 bg-primary scale-110' : ''}
                        ${!isCompleted && !isCurrent ? 'border-black/10' : ''}
                        border-[2px] z-20
                      `}
                                        >
                                            <motion.div layout transition={springConfig}>
                                                {isCompleted ? (
                                                    isValid ? (
                                                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                                                    )
                                                ) : (
                                                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                                )}
                                            </motion.div>
                                        </div>

                                        {/* Step Label */}
                                        <div className="absolute top-[4.5rem] text-center hidden md:block w-32">
                                            <motion.span
                                                className={`
                          block text-xs font-mono uppercase tracking-widest
                          transition-colors duration-300
                          ${isCurrent ? 'text-foreground font-bold' : 'text-muted-foreground/70'}
                        `}
                                            >
                                                {step.title}
                                            </motion.span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </LayoutGroup>
    );
};

// --- COMPONENT: GLASS CARD ---
interface GlassCardProps extends MotionProps {
    children: React.ReactNode;
    className?: string;
    elevated?: boolean;
    interactive?: boolean;
    header?: {
        icon?: any;
        title: string;
        subtitle?: string;
        action?: React.ReactNode;
    };
    onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    elevated = false,
    interactive = false,
    header,
    onClick,
    ...motionProps
}) => {
    return (
        <motion.div
            className={`
        relative rounded-3xl overflow-hidden
        ${elevated ? 'glass-panel-elevated' : 'glass-panel'}
        ${interactive ? 'cursor-pointer hover:border-black/10 hover:bg-white/80' : ''}
        ${className}
      `}
            onClick={onClick}
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={springConfig}
            whileHover={interactive ? {
                y: -2,
                transition: { ...springConfig, stiffness: 200 }
            } : undefined}
            whileTap={interactive ? { scale: 0.99 } : undefined}
            {...motionProps}
        >
            <div className="relative z-10 p-6 md:p-8">
                {header && (
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {header.icon && (
                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-black/5">
                                    <header.icon className="w-5 h-5 text-foreground" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-base font-bold text-foreground tracking-tight">
                                    {header.title}
                                </h3>
                                {header.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {header.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {header.action && (
                            <div className="flex-shrink-0">
                                {header.action}
                            </div>
                        )}
                    </div>
                )}
                {children}
            </div>
        </motion.div>
    );
};

// --- COMPONENT: GLASS INPUTS ---
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: any;
    error?: string;
    monospace?: boolean;
    labelAction?: React.ReactNode;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
    ({ label, icon: Icon, error, monospace, labelAction, className = '', ...props }, ref) => {
        return (
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springConfig}
            >
                {label && (
                    <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1">
                            {label}
                            {props.required && <span className="text-destructive">*</span>}
                        </label>
                        {labelAction}
                    </div>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 
                          group-focus-within:text-foreground transition-colors duration-300">
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full px-4 py-3.5 bg-white/50 backdrop-blur-md rounded-xl text-foreground text-sm
              placeholder:text-muted-foreground/60 transition-all duration-300 
              border border-black/5
              hover:bg-white hover:border-black/10
              focus:outline-none focus:bg-white focus:border-black/20
              focus:shadow-[0_0_0_3px_rgba(0,0,0,0.03)]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
              ${Icon ? 'pl-11' : ''}
              ${monospace ? 'font-mono tracking-wide' : ''}
              ${error ? 'border-destructive focus:border-destructive' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-destructive font-medium pl-1">{error}</p>}
            </motion.div>
        );
    }
);
GlassInput.displayName = 'GlassInput';

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    monospace?: boolean;
    labelAction?: React.ReactNode;
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
    ({ label, error, monospace, labelAction, className = '', ...props }, ref) => {
        return (
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springConfig}
            >
                {label && (
                    <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1">
                            {label}
                            {props.required && <span className="text-destructive">*</span>}
                        </label>
                        {labelAction}
                    </div>
                )}
                <textarea
                    ref={ref}
                    className={`
            w-full px-4 py-3.5 bg-white/50 backdrop-blur-md rounded-xl text-foreground text-sm
            placeholder:text-muted-foreground/60 transition-all duration-300 
            border border-black/5 resize-none
            hover:bg-white hover:border-black/10
            focus:outline-none focus:bg-white focus:border-black/20
            focus:shadow-[0_0_0_3px_rgba(0,0,0,0.03)]
            ${monospace ? 'font-mono tracking-wide' : ''}
            ${className}
          `}
                    {...props}
                />
            </motion.div>
        );
    }
);
GlassTextarea.displayName = 'GlassTextarea';

// --- COMPONENT: MAGNETIC BUTTON ---
const MagneticButton: React.FC<any> = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
         relative overflow-hidden px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2
         ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
         ${variant === 'primary'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10'
                    : 'bg-white text-foreground border border-black/10 hover:bg-gray-50'}
         ${className}
       `}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            {variant === 'primary' && !disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-15deg] translate-x-[-100%] hover:animate-shimmer" />
            )}
        </motion.button>
    )
}

// --- MAIN APP ---
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

// Local UserProfile with flexible extras to match UI
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

const ProfileCreationMultiStep: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();


    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const [photoUploading, setPhotoUploading] = useState(false);

    const [importSuccess, setImportSuccess] = useState(false);

    // Master profile state
    const [profile, setProfile] = useState<Partial<LocalUserProfile>>({
        full_name: '',
        email: user?.email || '',
        phone: '',
        street_address: '',
        postal_code: '',
        city: '',
        country: 'Germany',
        nationality: '',
        date_of_birth: '',
        linkedin_url: '',
        photo_url: '',
        skills: [],
        languages: [],
        links: [],
        work_experiences: [],
        educations: [],
        projects: [],
        certifications: [],
        motivation: '',
        self_pr: '',
        extras: {
            interests: [],
            awards: [],
            publications: [],
            volunteering: []
        }
    });

    const [availableCountries, setAvailableCountries] = useState<string[]>([]);


    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countries = await getAvailableCountries();
                setAvailableCountries(countries);
            } catch (err) {
                setAvailableCountries(['Germany', 'India', 'USA', 'UK', 'Canada']);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { profile: backendProfile, exists } = await getProfile();
                if (exists && backendProfile) {
                    // ADAPTER: Transform Backend Objects -> Frontend Strings
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
                        photo_url: backendProfile.photo_url || '', // Explicit mapping
                        extras: uiExtras
                    } as LocalUserProfile);
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            }
        };
        loadProfile();
    }, []);

    const [cropImage, setCropImage] = useState<string | null>(null);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImage(reader.result as string);
            });
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropImage(null);
        const objectUrl = URL.createObjectURL(croppedBlob);
        // Optimistic updatet
        setProfile(prev => ({ ...prev, photo_url: objectUrl }));

        try {
            setPhotoUploading(true);
            const file = new File([croppedBlob], "profile_photo.jpg", { type: "image/jpeg" });
            const { photo_url } = await uploadProfilePicture(file);

            // Critical: Update state with the SERVER returned URL, which is the public one
            setProfile(prev => ({ ...prev, photo_url }));

            // Force a profile refresh to ensure consistency
            const { profile: updatedProfile } = await getProfile();
            if (updatedProfile?.photo_url) {
                setProfile(prev => ({ ...prev, photo_url: updatedProfile.photo_url }));
            }

        } catch (err: any) {
            console.error('Photo upload failed:', err);
            // Revert optimistic update on failure
            setProfile(prev => ({ ...prev, photo_url: undefined }));
            toast.error(err.response?.data?.detail || "Failed to upload photo. Please try again.");
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleAutoSave = async () => {
        // Debounce or just fire? For onBlur, immediate fire is fine.
        // Don't block UI, just save in background.
        if (!profile.full_name) return; // Don't save empty profiles

        try {
            await createOrUpdateProfile(profile as APIUserProfile);
            // Optional: minimal feedback like a small toast or just silent consistency
            console.log("Auto-saved");
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const { profile: importedProfile } = await createProfileFromResume(file);

            // Merge imported data - Need same transformation
            const uiExtras = {
                interests: importedProfile.extras?.interests || [],
                awards: importedProfile.extras?.awards?.map(a => typeof a === 'string' ? a : a.title) || [],
                publications: importedProfile.extras?.publications?.map(p => typeof p === 'string' ? p : p.title) || [],
                volunteering: importedProfile.extras?.volunteering?.map(v => typeof v === 'string' ? v : v.organization) || []
            };

            setProfile(prev => ({
                ...prev,
                ...importedProfile,
                certifications: importedProfile.certifications || [],
                extras: uiExtras
            } as any));

            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
        } catch (err: any) {
            console.error('Import failed:', err);
            const detail = err.response?.data?.detail;
            toast.error(detail || 'Failed to analyze resume. Please try again or construct your profile manually.');
        } finally {
            setLoading(false);
            e.target.value = ''; // Reset input to allow retrying the same file
        }
    };

    const handleFinalSubmit = async () => {
        if (!profile.full_name || !profile.email) return;

        setLoading(true);
        try {
            // ADAPTER: Transform Frontend Strings -> Backend Objects
            const backendExtras = {
                interests: profile.extras?.interests || [],
                awards: profile.extras?.awards?.map(title => ({ title, issuer: '', date: new Date().toISOString() })) || [],
                publications: profile.extras?.publications?.map(title => ({ title, publisher: '', date: new Date().toISOString() })) || [],
                volunteering: profile.extras?.volunteering?.map(org => ({ organization: org, role: 'Volunteer', start_date: new Date().toISOString(), description: '' })) || []
            };

            const payload = {
                ...profile,
                links: profile.links || [],
                extras: backendExtras
            };

            await createOrUpdateProfile(payload as any);
            setSuccess(true);
            toast.success("Profile saved successfully!");
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            console.error('Save profile error:', err);
            toast.error(err.response?.data?.detail || "Failed to save profile. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            // Send current profile state to backend
            const { summary } = await generateSummary(profile as APIUserProfile);
            // Simulate typing effect? Or just set it. Just set it for now.
            setProfile(prev => ({ ...prev, professional_summary: summary }));
        } catch (err) {
            console.error("Failed to generate summary:", err);
            // Optionally set an error state or toast here
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const getStepValidityMap = () => {
        const validity: Record<number, 'valid' | 'invalid'> = {};
        const p = profile;
        validity[1] = (p.full_name?.trim() && p.professional_summary?.trim()) ? 'valid' : 'invalid';
        validity[2] = p.email?.trim() ? 'valid' : 'invalid';
        validity[3] = p.work_experiences?.some((w: any) => !w.job_title?.trim() || !w.company?.trim()) ? 'invalid' : 'valid';
        validity[4] = p.educations?.some((e: any) => !e.degree?.trim() || !e.institution?.trim()) ? 'invalid' : 'valid';
        [5, 6, 7, 8, 9, 10].forEach(i => validity[i] = 'valid');
        return validity;
    };

    const stepValidity = getStepValidityMap();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        exit: { opacity: 0, filter: "blur(5px)", transition: { duration: 0.15 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: springConfig },
    };

    const nextStep = () => currentStep < STEPS.length && setCurrentStep(c => c + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(c => c - 1);

    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [newAward, setNewAward] = useState('');

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
            setProfile({ ...profile, skills: [...(profile.skills || []), newSkill.trim()] });
            setNewSkill('');
        }
    };

    const addExtraItem = (field: 'interests' | 'awards' | 'publications' | 'volunteering', value: string) => {
        if (value.trim()) {
            const currentList = profile.extras?.[field] || [];
            setProfile({
                ...profile,
                extras: {
                    ...profile.extras!,
                    [field]: [...currentList, value.trim()]
                }
            });
        }
    };

    const removeExtraItem = (field: 'interests' | 'awards' | 'publications' | 'volunteering', idx: number) => {
        if (!profile.extras?.[field]) return;
        setProfile({ ...profile, extras: { ...profile.extras!, [field]: profile.extras[field].filter((_: any, i: number) => i !== idx) } });
    };

    const addLink = () => {
        setProfile({ ...profile, links: [...(profile.links || []), { label: '', url: '' }] });
    };

    const updateLink = (idx: number, field: 'label' | 'url', value: string) => {
        const newLinks = [...(profile.links || [])];
        newLinks[idx] = { ...newLinks[idx], [field]: value };
        setProfile({ ...profile, links: newLinks });
    };

    const removeLink = (idx: number) => {
        setProfile({ ...profile, links: profile.links?.filter((_, i) => i !== idx) });
    };

    const addExperience = () => {
        setProfile({
            ...profile,
            work_experiences: [...(profile.work_experiences || []), {
                id: Date.now().toString(),
                job_title: '',
                company: '',
                city: '',
                country: 'Germany',
                location: '',
                start_date: '',
                end_date: '',
                is_current: false,
                achievements: []
            }]
        });
    };

    const addEducation = () => {
        setProfile({
            ...profile,
            educations: [...(profile.educations || []), {
                id: Date.now().toString(),
                degree: '',
                institution: '',
                city: '',
                country: 'Germany',
                location: '',
                graduation_date: '',
                gpa: ''
            }]
        });
    };

    const addProject = () => {
        setProfile({ ...profile, projects: [...(profile.projects || []), { id: Date.now().toString(), title: '', role: '', description: '', technologies: [], link: '', start_date: '', end_date: '' }] });
    };
    const addCertification = () => {
        setProfile({ ...profile, certifications: [...(profile.certifications || []), { id: Date.now().toString(), name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '' }] });
    };
    const addLanguage = () => {
        setProfile({ ...profile, languages: [...(profile.languages || []), { name: '', level: '' }] });
    };

    const updateItem = (section: string, id: string, field: string, value: any) => {
        setProfile({
            ...profile,
            [section]: (profile as any)[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
        });
    };
    const removeItem = (section: string, id: string) => {
        setProfile({
            ...profile,
            [section]: (profile as any)[section].filter((item: any) => item.id !== id)
        });
    };

    const renderContent = () => {
        switch (currentStep) {
            case 1: // Personal Information
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                        <motion.div variants={itemVariants} className="flex justify-between">
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
                        </motion.div>
                        <div className="flex flex-col md:flex-row gap-8">
                            <motion.div variants={itemVariants} className="w-full md:w-auto flex flex-col items-center gap-3">
                                <div className="space-y-4">
                                    <div className="w-32 h-32 rounded-2xl bg-white border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors shadow-sm group relative overflow-hidden">
                                        {photoUploading ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                                                <span className="text-[10px] text-muted-foreground">Uploading...</span>
                                            </div>
                                        ) : profile.photo_url ? (
                                            <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mx-auto mb-2" />
                                                <span className="text-[10px] text-muted-foreground">Upload Photo</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoSelect} disabled={photoUploading} />
                                    </div>

                                    {/* German CV Preview Thumbnail */}
                                    {profile.photo_url && (
                                        <div className="w-32 p-2 bg-slate-50 rounded-lg border border-black/5 opacity-80 scale-90 origin-top">
                                            <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                                                <CheckCircle className="w-2 h-2 text-emerald-500" /> DE CV Placement
                                            </p>
                                            <div className="aspect-[3/4] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-[2px] p-1 relative">
                                                <div className="h-0.5 w-6 bg-slate-200 mb-0.5" />
                                                <div className="h-0.5 w-4 bg-slate-100 mb-1" />
                                                <img src={profile.photo_url} className="absolute top-1 right-1 w-4 h-4 rounded-[1px] object-cover" />
                                                <div className="space-y-0.5 mt-2">
                                                    <div className="h-0.5 w-full bg-slate-50" />
                                                    <div className="h-0.5 w-full bg-slate-50" />
                                                    <div className="h-0.5 w-2/3 bg-slate-50" />
                                                </div>
                                            </div>
                                            <p className="text-[7px] text-center text-muted-foreground mt-1.5">Top-Right Standard</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                            <div className="flex-1 space-y-5">
                                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <GlassInput label="Full Name" placeholder="e.g. Elon Musk" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} onBlur={handleAutoSave} icon={UserIcon} required className="md:col-span-2" />
                                    <GlassInput
                                        label="Date of Birth"
                                        type="date"
                                        value={profile.date_of_birth || ''}
                                        onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })}
                                        onBlur={handleAutoSave}
                                        monospace
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
                                </motion.div>
                                <motion.div variants={itemVariants}>
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
                                                <div className="absolute bottom-full right-0 mb-2 w-52 p-2.5 bg-slate-800 text-white text-[10px] leading-relaxed rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-slate-700">
                                                    <div className="font-semibold mb-0.5 text-indigo-300">Unsure what to write?</div>
                                                    Skip this for now! Fill out your Experience & Skills first, then come back and click this button to have AI write it for you.
                                                    <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                                </div>
                                            </div>
                                        }
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 2: // Contact
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                        <motion.div variants={itemVariants}><h2 className="text-2xl font-bold">Contact Information</h2></motion.div>
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassInput label="Email" icon={Mail} value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} onBlur={handleAutoSave} required />
                            <GlassInput label="Phone" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} onBlur={handleAutoSave} />

                            <GlassInput label="Street & Number" value={profile.street_address || ''} onChange={e => setProfile({ ...profile, street_address: e.target.value })} placeholder="e.g. Friedrichstra\u00df123" required onBlur={handleAutoSave} />
                            <GlassInput label="Postal Code" value={profile.postal_code || ''} onChange={e => setProfile({ ...profile, postal_code: e.target.value })} placeholder="e.g. 10117" required onBlur={handleAutoSave} />

                            <GlassInput label="City" icon={MapPin} value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} required onBlur={handleAutoSave} />
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
                            <GlassInput label="LinkedIn URL" icon={Linkedin} value={profile.linkedin_url || ''} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} className="md:col-span-2" />
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-4 pt-4 border-t border-black/5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Personal Links (Portfolio, Behance, etc.)</h3>
                                <button onClick={addLink} className="p-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.links?.map((link, idx) => (
                                    <div key={idx} className="relative group p-4 bg-white/40 border border-black/5 rounded-2xl space-y-3">
                                        <button onClick={() => removeLink(idx)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <GlassInput label="Label" placeholder="e.g. Portfolio" value={link.label} onChange={e => updateLink(idx, 'label', e.target.value)} />
                                        <GlassInput label="Link URL" placeholder="https://..." value={link.url} onChange={e => updateLink(idx, 'url', e.target.value)} />
                                    </div>
                                ))}
                                {(!profile.links || profile.links.length === 0) && (
                                    <div className="md:col-span-2 py-8 text-center border-2 border-dashed border-black/5 rounded-2xl text-muted-foreground/50 text-sm">
                                        No personal links added yet. Click + to add your portfolio, Behance, or GitHub.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                );
            case 3: // Work
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Work Experience</h2><button onClick={addExperience} className="p-2 bg-secondary rounded-xl"><Plus className="w-4 h-4" /></button></div>
                        <div className="space-y-4">
                            {profile.work_experiences?.map((exp: any) => (
                                <GlassCard key={exp.id} interactive className="relative group">
                                    <button onClick={() => removeItem('work_experiences', exp.id)} className="absolute top-4 right-4"><X className="w-4 h-4 text-muted-foreground" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <GlassInput label="Job Title" value={exp.job_title || ''} onChange={(e) => updateItem('work_experiences', exp.id, 'job_title', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Company" value={exp.company || ''} onChange={(e) => updateItem('work_experiences', exp.id, 'company', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="City" value={exp.city || ''} onChange={(e) => updateItem('work_experiences', exp.id, 'city', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Country" value={exp.country || ''} onChange={(e) => updateItem('work_experiences', exp.id, 'country', e.target.value)} onBlur={handleAutoSave} />
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
                                    {/* Still Working Here Toggle omitted for brevity/reuse */}

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
                                                        placeholder={aIdx === 0 ? "e.g. Entwickelte eine neue API..." : "Additional achievement..."}
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
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Education</h2><button onClick={addEducation} className="p-2 bg-secondary rounded-xl"><Plus className="w-4 h-4" /></button></div>
                        <div className="space-y-4">
                            {profile.educations?.map((edu: any) => (
                                <GlassCard key={edu.id} interactive className="relative group">
                                    <button onClick={() => removeItem('educations', edu.id)} className="absolute top-4 right-4"><X className="w-4 h-4 text-muted-foreground" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <GlassInput label="Degree" value={edu.degree || ''} onChange={(e) => updateItem('educations', edu.id, 'degree', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Institution" value={edu.institution || ''} onChange={(e) => updateItem('educations', edu.id, 'institution', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="City" value={edu.city || ''} onChange={(e) => updateItem('educations', edu.id, 'city', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Country" value={edu.country || ''} onChange={(e) => updateItem('educations', edu.id, 'country', e.target.value)} onBlur={handleAutoSave} />
                                        <GlassInput label="Grad Date" type="month" value={edu.graduation_date || ''} onChange={(e) => updateItem('educations', edu.id, 'graduation_date', e.target.value)} onBlur={handleAutoSave} />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                );
            case 5: // Skills
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <h2 className="text-2xl font-bold">Skills</h2>
                        <GlassCard>
                            <div className="flex gap-3 mb-6">
                                <GlassInput className="flex-1" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add a skill" />
                                <MagneticButton onClick={addSkill}>Add</MagneticButton>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map(s => (
                                    <span key={s} className="px-3 py-1 bg-white border rounded-lg flex items-center gap-2">{s} <X className="w-3 h-3 cursor-pointer" onClick={() => setProfile({ ...profile, skills: profile.skills?.filter(sk => sk !== s) })} /></span>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                );
            case 9: // Extras
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Extras</h2>
                            <p className="text-muted-foreground text-base">Interests, Awards, Publications, etc.</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-6">
                            {/* Interests */}
                            <GlassCard>
                                <h3 className="font-bold mb-4">Interests</h3>
                                <div className="flex gap-3 mb-4">
                                    <GlassInput
                                        value={newInterest}
                                        onChange={e => setNewInterest(e.target.value)}
                                        placeholder="Add interest"
                                        onKeyDown={(e) => { if (e.key === 'Enter') { addExtraItem('interests', newInterest); setNewInterest(''); } }}
                                    />
                                    <MagneticButton onClick={() => { addExtraItem('interests', newInterest); setNewInterest(''); }}>Add</MagneticButton>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.extras?.interests?.map((item: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-900 flex items-center gap-2">
                                            {item}
                                            <button onClick={() => removeExtraItem('interests', i)}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>

                            {/* Awards */}
                            <GlassCard>
                                <h3 className="font-bold mb-4">Awards & Honors</h3>
                                <div className="flex gap-3 mb-4">
                                    <GlassInput
                                        value={newAward}
                                        onChange={e => setNewAward(e.target.value)}
                                        placeholder="Add award..."
                                        onKeyDown={(e) => { if (e.key === 'Enter') { addExtraItem('awards', newAward); setNewAward(''); } }}
                                    />
                                    <MagneticButton onClick={() => { addExtraItem('awards', newAward); setNewAward(''); }}>Add</MagneticButton>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {profile.extras?.awards?.map((item: string, i: number) => (
                                        <div key={i} className="flex justify-between p-3 bg-secondary/30 rounded-lg text-sm">
                                            <span>{item}</span>
                                            <button onClick={() => removeExtraItem('awards', i)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            {/* Motivation & Self-PR for Japan/Global */}
                            <GlassCard className="space-y-6">
                                <h3 className="font-bold text-lg border-b pb-2">Japan Market Reliability (Self-PR & Motivation)</h3>
                                <p className="text-xs text-muted-foreground italic mb-4">
                                    Important: For Japanese resumes, these two sections are mandatory.
                                    If left empty, the AI will generate them for you. If you fill them, the AI will strictly respect and use your text.
                                </p>

                                <GlassTextarea
                                    label="Self-PR (自己PR)"
                                    placeholder="e.g. 5年以上の経験を持つシニアデザイナー..."
                                    rows={5}
                                    value={profile.self_pr || ''}
                                    onChange={e => setProfile({ ...profile, self_pr: e.target.value })}
                                    onBlur={handleAutoSave}
                                />

                                <GlassTextarea
                                    label="Motivation (志望動機)"
                                    placeholder="e.g. 日本の職人技に対する情熱を持っており..."
                                    rows={5}
                                    value={profile.motivation || ''}
                                    onChange={e => setProfile({ ...profile, motivation: e.target.value })}
                                    onBlur={handleAutoSave}
                                />
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                );

            // ... (Other cases simplified for brevity in this plan, but included in full code)
            case 6: // Languages
            case 7: // Projects
            case 8: // Certifications (Similar structure)
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <div className="flex justify-between"><h2 className="text-2xl font-bold">{STEPS[currentStep - 1].title}</h2>
                            <button onClick={() => {
                                if (currentStep === 6) addLanguage();
                                if (currentStep === 7) addProject();
                                if (currentStep === 8) addCertification();
                            }} className="p-2 bg-secondary rounded-xl"><Plus /></button></div>

                        {currentStep === 6 && profile.languages?.map((l: any, idx: number) => (
                            <GlassCard key={l.id || idx} className="relative">
                                <button onClick={() => setProfile({ ...profile, languages: profile.languages?.filter(x => x !== l) })} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlassInput label="Language" placeholder="e.g. Japanese" value={l.name || ''} onChange={e => setProfile({ ...profile, languages: profile.languages?.map((x: any) => x === l ? { ...x, name: e.target.value } : x) })} />
                                    <GlassInput label="Proficiency Level" placeholder="e.g. Native, JLPT N2, C1" value={l.level || ''} onChange={e => setProfile({ ...profile, languages: profile.languages?.map((x: any) => x === l ? { ...x, level: e.target.value } : x) })} />
                                </div>
                            </GlassCard>
                        ))}

                        {currentStep === 7 && profile.projects?.map((p: any) => (
                            <GlassCard key={p.id} className="relative">
                                <button onClick={() => removeItem('projects', p.id)} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <GlassInput label="Title" value={p.title || ''} onChange={e => updateItem('projects', p.id, 'title', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Role" placeholder="e.g. Lead Designer" value={p.role || ''} onChange={e => updateItem('projects', p.id, 'role', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Project Link" icon={Globe} placeholder="https://..." value={p.link || ''} onChange={e => updateItem('projects', p.id, 'link', e.target.value)} onBlur={handleAutoSave} className="md:col-span-2" />
                                </div>
                                <GlassTextarea label="Description" value={p.description || ''} onChange={e => updateItem('projects', p.id, 'description', e.target.value)} onBlur={handleAutoSave} />
                            </GlassCard>
                        ))}

                        {currentStep === 8 && profile.certifications?.map((c: any) => (
                            <GlassCard key={c.id} className="relative">
                                <button onClick={() => removeItem('certifications', c.id)} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlassInput label="Name" value={c.name || ''} onChange={e => updateItem('certifications', c.id, 'name', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Issuing Organization" value={c.issuing_organization || ''} onChange={e => updateItem('certifications', c.id, 'issuing_organization', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Issue Date" type="month" value={c.issue_date || ''} onChange={e => updateItem('certifications', c.id, 'issue_date', e.target.value)} onBlur={handleAutoSave} />
                                    <GlassInput label="Credential URL" icon={Globe} placeholder="https://..." value={c.credential_url || ''} onChange={e => updateItem('certifications', c.id, 'credential_url', e.target.value)} onBlur={handleAutoSave} />
                                </div>
                            </GlassCard>
                        ))}
                    </motion.div>
                );

            case 10: // Review
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-foreground">Review Your Profile</h2>
                            <p className="text-muted-foreground">Please review your information before submitting.</p>
                        </div>

                        {/* Personal Info */}
                        <GlassCard>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {profile.photo_url && (
                                    <img src={profile.photo_url} alt="Profile" className="w-24 h-24 rounded-xl object-cover border border-black/5" />
                                )}
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-xl font-bold">{profile.full_name}</h3>
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
                                        {(profile.date_of_birth || profile.nationality) && (
                                            <div className="flex items-center gap-2 md:col-span-2 text-xs italic">
                                                <UserIcon className="w-3 h-3" />
                                                <span>
                                                    {[
                                                        profile.date_of_birth ? `Born: ${profile.date_of_birth}` : null,
                                                        profile.nationality ? `Nationality: ${profile.nationality}` : null
                                                    ].filter(Boolean).join(' | ')}
                                                </span>
                                            </div>
                                        )}
                                        {profile.linkedin_url && <div className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> {profile.linkedin_url}</div>}
                                        {profile.links && profile.links.map((link: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                <span className="font-medium">{link.label}:</span>
                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[150px]">{link.url}</a>
                                            </div>
                                        ))}
                                    </div>
                                    {profile.professional_summary && (
                                        <p className="text-sm mt-4 text-foreground/80 leading-relaxed bg-secondary/30 p-3 rounded-lg">
                                            <span className="block font-bold text-[10px] uppercase text-muted-foreground mb-1 tracking-wider">Professional Summary</span>
                                            {profile.professional_summary}
                                        </p>
                                    )}
                                    {profile.self_pr && (
                                        <p className="text-sm mt-3 text-foreground/80 leading-relaxed bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                            <span className="block font-bold text-[10px] uppercase text-emerald-700 mb-1 tracking-wider">Self-PR (自己PR)</span>
                                            {profile.self_pr}
                                        </p>
                                    )}
                                    {profile.motivation && (
                                        <p className="text-sm mt-3 text-foreground/80 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                            <span className="block font-bold text-[10px] uppercase text-indigo-700 mb-1 tracking-wider">Motivation (志望動機)</span>
                                            {profile.motivation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>

                        {/* Experience */}
                        {profile.work_experiences && profile.work_experiences.length > 0 && (
                            <GlassCard className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Experience</h3>
                                <div className="divide-y divide-border/50">
                                    {profile.work_experiences.map((exp: any, i: number) => (
                                        <div key={i} className="py-4 first:pt-0 last:pb-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold">{exp.job_title}</h4>
                                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{exp.start_date} - {exp.end_date || 'Present'}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                                            {exp.achievements && <p className="text-sm text-foreground/80 whitespace-pre-line">{exp.achievements}</p>}
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* Education */}
                        {profile.educations && profile.educations.length > 0 && (
                            <GlassCard className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Education</h3>
                                <div className="grid gap-4">
                                    {profile.educations.map((edu: any, i: number) => (
                                        <div key={i} className="p-3 bg-secondary/20 rounded-xl border border-black/5">
                                            <h4 className="font-semibold">{edu.degree}</h4>
                                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                                <span>{edu.graduation_date}</span>
                                                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <GlassCard>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Code className="w-5 h-5 text-primary" /> Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-sm font-medium text-primary">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* Other Sections (Projects, Certs, Languages) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.projects && profile.projects.length > 0 && (
                                <GlassCard>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Projects</h3>
                                    <ul className="space-y-2">
                                        {profile.projects.map((p: any, i: number) => (
                                            <li key={i} className="text-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-semibold">{p.title}</span>
                                                    {p.link && (
                                                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">View Project</a>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{p.role}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            )}
                            {profile.certifications && profile.certifications.length > 0 && (
                                <GlassCard>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Award className="w-4 h-4" /> Certifications</h3>
                                    <ul className="space-y-2">
                                        {profile.certifications.map((c: any, i: number) => (
                                            <li key={i} className="text-sm">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-semibold">{c.name}</span>
                                                    {c.credential_url && (
                                                        <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">View</a>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{c.issuing_organization}</p>
                                                {c.issue_date && <p className="text-xs text-muted-foreground mt-0.5">{c.issue_date}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            )}
                            {profile.languages && profile.languages.length > 0 && (
                                <GlassCard>
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Languages</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.languages.map((l: any, i: number) => (
                                            <span key={i} className="text-sm bg-secondary px-2 py-1 rounded flex items-center gap-1">
                                                <span className="font-semibold">{l.name}</span>
                                                {l.level && <span className="text-xs text-muted-foreground">({l.level})</span>}
                                            </span>
                                        ))}
                                    </div>
                                </GlassCard>
                            )}
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <GlobalStyles />
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Profile Saved!</h1>
                    <p>Redirecting to Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-black/5 selection:text-black">
            <GlobalStyles />
            <div className="noise-overlay" />
            <div className="gradient-mesh absolute inset-0 pointer-events-none" />

            {/* Loading Overlay */}
            <AnimatePresence>{(loading || importSuccess) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
                        <p className="font-bold">{importSuccess ? 'Resume Imported!' : 'Syncing Profile...'}</p>
                    </div>
                </motion.div>
            )}</AnimatePresence>

            <header className="sticky top-0 z-40 glass-panel border-b border-black/5">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
                    <FlightStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} stepValidity={stepValidity} />
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 relative z-10">
                <GlassCard elevated className="min-h-[600px]">
                    <AnimatePresence mode="wait"><motion.div key={currentStep} className="h-full">{renderContent()}</motion.div></AnimatePresence>
                </GlassCard>
                <div className="flex justify-between mt-8 gap-4">
                    {currentStep > 1 ? <MagneticButton variant="secondary" onClick={prevStep}><ArrowLeft className="w-4 h-4" /> Back</MagneticButton> : <div />}
                    {currentStep < STEPS.length ? <MagneticButton onClick={nextStep}>Continue <ArrowRight className="w-4 h-4" /></MagneticButton> : <MagneticButton onClick={handleFinalSubmit}>Finish & Save</MagneticButton>}
                </div>
            </main>

            {cropImage && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center">
                    <ImageCropper imageSrc={cropImage} onCropComplete={handleCropComplete} onCancel={() => setCropImage(null)} />
                </div>
            )}
        </div>
    );
};

export default ProfileCreationMultiStep;
