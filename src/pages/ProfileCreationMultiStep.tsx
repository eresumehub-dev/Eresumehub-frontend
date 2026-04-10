import React, { useState, forwardRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Upload, CheckCircle, ArrowLeft,
    User as UserIcon, Mail, Briefcase, GraduationCap, Award, Code, Globe, BookOpen, Star, MapPin, X, AlertTriangle, Linkedin, Loader2, Sparkles, ChevronRight
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
      /* Executive Slate - Obsidian Theme Tokens */
      --background: 240 10% 3.9%; /* #0A0A0B */
      --foreground: 0 0% 98%;
      
      --card: 240 10% 3.9%;
      --card-foreground: 0 0% 98%;
      
      --popover: 240 10% 3.9%;
      --popover-foreground: 0 0% 98%;
      
      --primary: 210 100% 50%; /* Electric Blue #0066CC */
      --primary-foreground: 0 0% 100%;
      
      --secondary: 240 3.7% 15.9%;
      --secondary-foreground: 0 0% 98%;
      
      --muted: 240 3.7% 15.9%;
      --muted-foreground: 240 5% 64.9%;
      
      --accent: 240 3.7% 15.9%;
      --accent-foreground: 0 0% 98%;
      
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 0% 98%;
      
      --border: 240 3.7% 15.9%;
      --input: 240 3.7% 15.9%;
      --ring: 240 4.9% 83.9%;
      
      --radius: 1.25rem;
    }

    body {
      background-color: #0A0A0B;
      color: #F8F8F8;
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    .glass-panel-elevated {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .input-glass {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .input-glass:focus {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(0, 102, 204, 0.4);
      box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1);
    }

    @keyframes shine {
      0% { transform: translateX(-100%) skewX(-15deg); }
      100% { transform: translateX(200%) skewX(-15deg); }
    }

    .animate-shine {
      animation: shine 3s infinite;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0A0A0B;
    }
    ::-webkit-scrollbar-thumb {
      background: #2D2D30;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3D3D41;
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
            <div className="relative w-full overflow-hidden select-none py-4">
                <div className="relative px-2 md:px-6">
                    <div className="relative mx-4">
                        {/* Connecting Lines Container */}
                        <div className="absolute top-1/2 left-[15px] right-[15px] h-[2px] -translate-y-1/2 flex items-center z-0">
                            {steps.slice(0, -1).map((_, i) => {
                                const stepId = i + 1;
                                const isPast = currentStep > stepId;
                                const status = stepValidity[stepId];

                                return (
                                    <div key={i} className="h-full flex-1 relative bg-white/5 overflow-hidden">
                                        <motion.div
                                            className={`absolute inset-y-0 left-0 h-full ${status === 'invalid'
                                                ? 'bg-amber-500/50'
                                                : 'bg-gradient-to-r from-[#0066CC] to-[#4DCFFF]'
                                                }`}
                                            initial={{ width: "0%" }}
                                            animate={{ width: isPast ? "101%" : "0%" }}
                                            transition={{ duration: 0.6, delay: i * 0.05, ease: "circOut" }}
                                        />
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
                                    >
                                        <div
                                            className={`
                                                w-10 h-10 md:w-12 md:h-12 rounded-2xl 
                                                flex items-center justify-center transition-all duration-500
                                                ${isCompleted ? (isValid ? 'bg-[#0066CC]/20 border-[#0066CC]/30 text-[#4DCFFF]' : 'bg-amber-500/10 border-amber-500/30 text-amber-400') : ''}
                                                ${isCurrent ? 'bg-white text-[#0A0A0B] border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-110' : ''}
                                                ${!isCompleted && !isCurrent ? 'bg-[#1D1D1F] border-white/5 text-gray-500' : ''}
                                                border z-20
                                            `}
                                        >
                                            {isCompleted ? (
                                                isValid ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
                                            ) : (
                                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                            )}
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
                relative rounded-[2rem] overflow-hidden
                ${elevated ? 'glass-panel-elevated' : 'glass-panel'}
                ${interactive ? 'cursor-pointer hover:bg-white/[0.07] hover:border-white/20' : ''}
                ${className}
            `}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={springConfig}
            whileHover={interactive ? { y: -4 } : undefined}
            {...motionProps}
        >
            <div className={`relative z-10 ${header ? 'p-8' : 'p-0'}`}>
                {header && (
                    <div className="flex items-start justify-between mb-8 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-5">
                            {header.icon && (
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-[#4DCFFF]">
                                    <header.icon className="w-6 h-6" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-medium text-white tracking-tight">
                                    {header.title}
                                </h3>
                                {header.subtitle && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {header.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {header.action && <div className="flex-shrink-0">{header.action}</div>}
                    </div>
                )}
                <div className={header ? '' : 'p-8'}>{children}</div>
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
            <div className="space-y-2.5">
                {label && (
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            {label}
                            {props.required && <span className="text-red-500/80">*</span>}
                        </label>
                        {labelAction}
                    </div>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#0066CC] transition-colors duration-300">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full px-5 py-4 input-glass rounded-2xl text-white text-[15px]
                            placeholder:text-gray-700 outline-none
                            ${Icon ? 'pl-14' : ''}
                            ${monospace ? 'font-mono' : ''}
                            ${error ? 'border-red-500/50 focus:border-red-500' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-400 font-medium pl-1">{error}</p>}
            </div>
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
            <div className="space-y-2.5">
                {label && (
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            {label}
                            {props.required && <span className="text-red-500/80">*</span>}
                        </label>
                        {labelAction}
                    </div>
                )}
                <textarea
                    ref={ref}
                    className={`
                        w-full px-5 py-4 input-glass rounded-2xl text-white text-[15px]
                        placeholder:text-gray-700 outline-none resize-none
                        ${monospace ? 'font-mono' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
        );
    }
);
GlassTextarea.displayName = 'GlassTextarea';

// --- COMPONENT: MAGNETIC BUTTON ---
const MagneticButton: React.FC<any> = ({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                relative overflow-hidden px-10 py-5 rounded-2xl font-bold text-[16px] transition-all duration-300 flex items-center justify-center gap-3
                ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                ${variant === 'primary'
                    ? 'bg-white text-[#0A0A0B]'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
                ${className}
            `}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            {variant === 'primary' && !disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-[-15deg] translate-x-[-100%] animate-shine" />
            )}
        </motion.button>
    )
}

// --- MAIN APP ---
const STEPS = [
    { id: 1, title: 'Identity', icon: UserIcon },
    { id: 2, title: 'Contact', icon: Mail },
    { id: 3, title: 'Career', icon: Briefcase },
    { id: 4, title: 'Education', icon: GraduationCap },
    { id: 5, title: 'Skills', icon: Code },
    { id: 6, title: 'Languages', icon: Globe },
    { id: 7, title: 'Projects', icon: BookOpen },
    { id: 8, title: 'Awards', icon: Award },
    { id: 9, title: 'Values', icon: Star },
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

const ProfileCreationMultiStep: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);

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
        } catch (err: any) {
            console.error('Photo upload failed:', err);
            setProfile(prev => ({ ...prev, photo_url: undefined }));
            toast.error("Failed to upload photo.");
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleAutoSave = async () => {
        if (!profile.full_name) return;
        try {
            await createOrUpdateProfile(profile as APIUserProfile);
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
            const uiExtras = {
                interests: importedProfile.extras?.interests || [],
                awards: importedProfile.extras?.awards?.map(a => typeof a === 'string' ? a : a.title) || [],
                publications: importedProfile.extras?.publications?.map(p => typeof p === 'string' ? p : p.title) || [],
                volunteering: importedProfile.extras?.volunteering?.map(v => typeof v === 'string' ? v : v.organization) || []
            };

            setProfile(prev => ({
                ...prev, ...importedProfile, certifications: importedProfile.certifications || [], extras: uiExtras
            } as any));

            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
        } catch (err: any) {
            toast.error('Failed to analyze resume.');
        } finally {
            setLoading(false);
            e.target.value = '';
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
            setSuccess(true);
            toast.success("Profile Activated");
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            toast.error("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const { summary } = await generateSummary(profile as APIUserProfile);
            setProfile(prev => ({ ...prev, professional_summary: summary }));
        } catch (err) {
            console.error("Failed to generate summary:", err);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const stepValidity = (() => {
        const validity: Record<number, 'valid' | 'invalid'> = {};
        const p = profile;
        validity[1] = (p.full_name?.trim() && p.professional_summary?.trim()) ? 'valid' : 'invalid';
        validity[2] = p.email?.trim() ? 'valid' : 'invalid';
        validity[3] = p.work_experiences?.some((w: any) => !w.job_title?.trim() || !w.company?.trim()) ? 'invalid' : 'valid';
        validity[4] = p.educations?.some((e: any) => !e.degree?.trim() || !e.institution?.trim()) ? 'invalid' : 'valid';
        [5, 6, 7, 8, 9, 10].forEach(i => validity[i] = 'valid');
        return validity;
    })();

    const [newSkill, setNewSkill] = useState('');

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
            setProfile({ ...profile, skills: [...(profile.skills || []), newSkill.trim()] });
            setNewSkill('');
        }
    };


    const updateItem = (section: string, id: string, field: string, value: any) => {
        setProfile({
            ...profile,
            [section]: (profile as any)[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
        });
    };

    const removeItem = (section: string, id: string) => {
        setProfile({ ...profile, [section]: (profile as any)[section].filter((item: any) => item.id !== id) });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        exit: { opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.2 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <motion.div variants={itemVariants}>
                                <h1 className="text-[2.5rem] font-medium text-white tracking-tight leading-none mb-3">Identity</h1>
                                <p className="text-gray-500 text-lg font-light">The foundation of your professional profile.</p>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('resume-upload')?.click()}
                                    className="flex items-center gap-3 px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all font-bold text-sm"
                                >
                                    <Upload className="w-4 h-4 text-[#4DCFFF]" /> Fast Import
                                </button>
                                <input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={handleImportResume} />
                            </motion.div>
                        </div>

                        <div className="grid lg:grid-cols-[160px_1fr] gap-12 items-start">
                            <motion.div variants={itemVariants} className="flex flex-col items-center">
                                <label className="relative group cursor-pointer">
                                    <div className="w-40 h-40 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#0066CC]/50 group-hover:bg-white/[0.08]">
                                        {photoUploading ? (
                                            <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
                                        ) : profile.photo_url ? (
                                            <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-gray-700 group-hover:text-white transition-colors" />
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} disabled={photoUploading} />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-[#0A0A0B]">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </label>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-600 mt-6">Professional Portrait</p>
                            </motion.div>

                            <div className="space-y-10">
                                <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                                    <GlassInput label="Full Legal Name" placeholder="e.g. Jean-Luc Picard" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} onBlur={handleAutoSave} required className="md:col-span-2" />
                                    <GlassInput label="Birth Date" type="date" value={profile.date_of_birth || ''} onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })} onBlur={handleAutoSave} required />
                                    <GlassInput label="Primary Citizenship" placeholder="e.g. French" value={profile.nationality || ''} onChange={e => setProfile({ ...profile, nationality: e.target.value })} onBlur={handleAutoSave} required />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <GlassTextarea
                                        label="Professional Bio"
                                        placeholder="Briefly describe your expertise..."
                                        rows={6}
                                        value={profile.professional_summary || ''}
                                        onChange={e => setProfile({ ...profile, professional_summary: e.target.value })}
                                        required
                                        labelAction={
                                            <button
                                                type="button"
                                                onClick={handleGenerateSummary}
                                                disabled={isGeneratingSummary}
                                                className="flex items-center gap-2 text-[10px] font-bold text-[#4DCFFF] uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                                            >
                                                {isGeneratingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                Generate with AI
                                            </button>
                                        }
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                        <motion.div variants={itemVariants}>
                            <h1 className="text-[2.5rem] font-medium text-white tracking-tight leading-none mb-3">Reach</h1>
                            <p className="text-gray-500 text-lg font-light">Global reachability starts here.</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
                            <GlassInput label="Professional Email" icon={Mail} value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} onBlur={handleAutoSave} required />
                            <GlassInput label="Mobile Number" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} onBlur={handleAutoSave} placeholder="+X XXX-XXX-XXXX" />
                            <GlassInput label="Location (Street)" value={profile.street_address || ''} onChange={e => setProfile({ ...profile, street_address: e.target.value })} onBlur={handleAutoSave} placeholder="123 Silicon Valley Way" />
                            <div className="grid grid-cols-2 gap-4">
                                <GlassInput label="Zip Code" value={profile.postal_code || ''} onChange={e => setProfile({ ...profile, postal_code: e.target.value })} onBlur={handleAutoSave} />
                                <GlassInput label="City" icon={MapPin} value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} onBlur={handleAutoSave} />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest px-1">Market Region</label>
                                <select
                                    className="w-full px-5 py-4 input-glass rounded-2xl text-white outline-none appearance-none"
                                    value={profile.country || 'Germany'}
                                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                >
                                    {availableCountries.map(c => <option key={c} value={c} className="bg-[#1D1D1F]">{c}</option>)}
                                </select>
                            </div>
                            <GlassInput label="Social Architecture (LinkedIn)" icon={Linkedin} value={profile.linkedin_url || ''} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} onBlur={handleAutoSave} placeholder="linkedin.com/in/username" />
                        </motion.div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                        <div className="flex justify-between items-center">
                            <motion.div variants={itemVariants}>
                                <h1 className="text-[2.5rem] font-medium text-white tracking-tight leading-none mb-3">Career History</h1>
                                <p className="text-gray-500 text-lg font-light">Your professional trajectory.</p>
                            </motion.div>
                            <MagneticButton variant="secondary" onClick={() => setProfile({
                                ...profile, work_experiences: [...(profile.work_experiences || []), { id: Date.now().toString(), job_title: '', company: '', city: '', country: profile.country || '', start_date: '', end_date: '', is_current: false, achievements: [] }]
                            })} className="!px-6 !py-3">
                                <Plus className="w-4 h-4" /> Add
                            </MagneticButton>
                        </div>

                        <div className="space-y-6">
                            {profile.work_experiences?.map((exp: any) => (
                                <GlassCard key={exp.id} header={{ title: exp.job_title || 'New Assignment', subtitle: exp.company || 'Organization Name', icon: Briefcase, action: <button onClick={() => removeItem('work_experiences', exp.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><X className="w-5 h-5" /></button> }}>
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <GlassInput label="Executive Title" value={exp.job_title} onChange={e => updateItem('work_experiences', exp.id, 'job_title', e.target.value)} />
                                        <GlassInput label="Organization" value={exp.company} onChange={e => updateItem('work_experiences', exp.id, 'company', e.target.value)} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <GlassInput label="Arrival" type="month" value={(exp.start_date || '').substring(0, 7)} onChange={e => updateItem('work_experiences', exp.id, 'start_date', e.target.value)} />
                                            <GlassInput label="Departure" type="month" value={(exp.end_date || '').substring(0, 7)} disabled={exp.is_current} onChange={e => updateItem('work_experiences', exp.id, 'end_date', e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-3 pt-8 px-2">
                                            <input type="checkbox" checked={exp.is_current} onChange={e => updateItem('work_experiences', exp.id, 'is_current', e.target.checked)} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 accent-[#0066CC]" />
                                            <span className="text-sm text-gray-400 font-medium">Currently Engaged</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Performance Benchmarks</label>
                                        <div className="space-y-3">
                                            {(exp.achievements || []).map((ach: string, aIdx: number) => (
                                                <div key={aIdx} className="flex gap-3 group">
                                                    <GlassInput
                                                        className="flex-1"
                                                        placeholder="Quantified achievement..."
                                                        value={ach}
                                                        onChange={e => {
                                                            const n = [...exp.achievements];
                                                            n[aIdx] = e.target.value;
                                                            updateItem('work_experiences', exp.id, 'achievements', n);
                                                        }}
                                                    />
                                                    <button onClick={() => { const n = exp.achievements.filter((_: any, i: number) => i !== aIdx); updateItem('work_experiences', exp.id, 'achievements', n); }} className="p-3 text-gray-700 hover:text-red-400"><X className="w-5 h-5" /></button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => updateItem('work_experiences', exp.id, 'achievements', [...(exp.achievements || []), ''])}
                                                className="w-full py-4 border border-dashed border-white/5 rounded-2xl text-[11px] font-bold text-gray-600 uppercase tracking-widest hover:border-white/20 hover:text-white transition-all"
                                            >
                                                + Document Milestone
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                        <motion.div variants={itemVariants}>
                            <h1 className="text-[2.5rem] font-medium text-white tracking-tight leading-none mb-3">Core Stack</h1>
                            <p className="text-gray-500 text-lg font-light">Your technical and operational expertise.</p>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <GlassCard>
                                <div className="flex gap-4 mb-8">
                                    <GlassInput className="flex-1" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Architectural Skill..." />
                                    <MagneticButton onClick={addSkill} className="!px-8">Register</MagneticButton>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {profile.skills?.map(s => (
                                        <motion.span
                                            layout
                                            key={s}
                                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-[14px] font-medium hover:border-[#0066CC]/50 transition-all cursor-default group"
                                        >
                                            {s}
                                            <X className="w-4 h-4 text-gray-600 cursor-pointer group-hover:text-red-400" onClick={() => setProfile({ ...profile, skills: profile.skills?.filter(sk => sk !== s) })} />
                                        </motion.span>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                );
            case 10:
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                        <motion.div variants={itemVariants} className="text-center">
                            <h1 className="text-[3rem] font-medium text-white tracking-tight leading-none mb-4">Final Audit</h1>
                            <p className="text-gray-500 text-xl font-light">Verify your career narrative before activation.</p>
                        </motion.div>

                        <div className="grid gap-10">
                            <motion.div variants={itemVariants}>
                                <GlassCard elevated className="border-[#0066CC]/20 bg-gradient-to-br from-white/10 to-transparent">
                                    <div className="flex flex-col md:flex-row gap-10 items-center">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-white overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0">
                                            {profile.photo_url ? <img src={profile.photo_url} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-8 text-black" />}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h2 className="text-[2.5rem] font-medium text-white tracking-tight mb-2">{profile.full_name}</h2>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 text-sm font-medium">
                                                <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</span>
                                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile.city}, {profile.country}</span>
                                                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {profile.work_experiences?.length} Roles</span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>

                            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-[0.2em] px-1">Identity Tokens</h3>
                                    <div className="space-y-3">
                                        {profile.skills?.slice(0, 6).map(s => (
                                            <div key={s} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                                <span className="text-sm text-gray-300 font-medium">{s}</span>
                                                <div className="w-2 h-2 rounded-full bg-[#0066CC]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-[0.2em] px-1">Career Logic</h3>
                                    <div className="bg-[#1D1D1F] p-8 rounded-[2rem] border border-white/5">
                                        <p className="text-sm text-gray-400 leading-relaxed font-light line-clamp-6 italic">
                                            "{profile.professional_summary}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                );
            default:
                return (
                    <motion.div variants={itemVariants} className="py-20 text-center">
                        <h2 className="text-2xl font-light text-gray-500 italic">Advanced configurations coming soon.</h2>
                        <MagneticButton variant="secondary" onClick={() => setCurrentStep(currentStep + 1)} className="mt-8">Skip to Audit</MagneticButton>
                    </motion.div>
                );
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0B] text-white">
                <GlobalStyles />
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-[#0A0A0B] mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-[3rem] font-medium tracking-tight mb-4">Profile Activated</h1>
                    <p className="text-gray-500 text-xl font-light">Redirecting to your command center...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-[#F8F8F8] selection:bg-white selection:text-black">
            <GlobalStyles />
            
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#0066CC]/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#AF52DE]/5 rounded-full blur-[120px]" />
            </div>

            <AnimatePresence>
                {(loading || importSuccess) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#0A0A0B]/80 backdrop-blur-xl flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-white mb-6 mx-auto" />
                            <h3 className="text-xl font-medium tracking-tight">{importSuccess ? 'Intelligence Integrated' : 'Processing Profile...'}</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-[1800px] mx-auto px-6 h-28 flex flex-col justify-center">
                    <FlightStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} stepValidity={stepValidity} />
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-6 py-20 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div key={currentStep} className="min-h-[60vh]">
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between items-center mt-24">
                    {currentStep > 1 ? (
                        <MagneticButton variant="secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                            <ArrowLeft className="w-5 h-5" /> Reverse
                        </MagneticButton>
                    ) : <div />}
                    
                    <div className="flex gap-4">
                        {currentStep < STEPS.length ? (
                            <MagneticButton onClick={() => setCurrentStep(currentStep + 1)}>
                                Proceed <ChevronRight className="w-5 h-5 ml-1" />
                            </MagneticButton>
                        ) : (
                            <MagneticButton onClick={handleFinalSubmit}>
                                Activate Profile <Sparkles className="w-5 h-5 text-[#4DCFFF] ml-2" />
                            </MagneticButton>
                        )}
                    </div>
                </div>
            </main>

            {cropImage && (
                <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
                    <div className="max-w-xl w-full">
                        <ImageCropper imageSrc={cropImage} onCropComplete={handleCropComplete} onCancel={() => setCropImage(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCreationMultiStep;
