import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
    ChevronLeft, Sparkles, Check, 
    Upload, Briefcase, MapPin, FileText, Target, XCircle,
    CheckCircle2, AlertTriangle, Edit3
} from 'lucide-react';

// Services
import { createResumeFromData } from '../services/resume';
import { getAvailableCountries } from '../services/schema';

// Hooks
import { useFileUpload } from '../hooks/useFileUpload';
import { useATSAnalysis } from '../hooks/useATSAnalysis';

const ATSChecker = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'upload' | 'options' | 'analyzing' | 'results'>('upload');
    const [countries, setCountries] = useState<string[]>([]);
    const [targetCountry, setTargetCountry] = useState('United States');
    const [targetRole, setTargetRole] = useState('');
    
    const { file, handleFileChange } = useFileUpload();
    const { analyzeResume, results } = useATSAnalysis(targetCountry);

    useEffect(() => {
        const loadCountries = async () => {
            try {
                const data = await getAvailableCountries();
                setCountries(data);
            } catch (err) {
                console.error("Failed to load countries");
            }
        };
        loadCountries();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e);
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setStep('options');
        }
    };

    const startAnalysis = async () => {
        if (!file || !targetRole) {
            toast.error("Please enter a target role");
            return;
        }

        setStep('analyzing');
        try {
            // Perform ATS Analysis
            await analyzeResume(file, targetRole, "");
            setStep('results');
        } catch (err: any) {
            toast.error(err.message || "Analysis failed");
            setStep('options');
        }
    };

    const handleRepair = async () => {
        if (!results || !results.debug_parsed_profile) {
            toast.error("Missing analysis data for repair");
            return;
        }
        
        const loadingToast = toast.loading("Creating your optimized resume...");
        try {
            const newResume = await createResumeFromData(
                results.debug_parsed_profile, 
                targetRole, 
                targetCountry, 
                "", 
                results
            );
            toast.success("Resume created! Redirecting to editor...", { id: loadingToast });
            navigate(`/resume/edit/${newResume.id}`);
        } catch (err) {
            toast.error("Failed to create optimized resume", { id: loadingToast });
        }
    };

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="bg-[#F5F5F7] min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white pt-24 pb-20 px-6">
            
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button 
                    onClick={() => step === 'upload' ? navigate('/dashboard') : setStep('upload')}
                    className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors mb-12 group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[14px] font-medium">Back to {step === 'upload' ? 'Dashboard' : 'Upload'}</span>
                </button>

                <AnimatePresence mode="wait">
                    {/* --- STEP 1: UPLOAD --- */}
                    {step === 'upload' && (
                        <motion.div 
                            key="upload" initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                            className="text-center max-w-2xl mx-auto mb-12 mt-8"
                        >
                            <h1 className="text-[2.5rem] md:text-[3.5rem] font-medium text-[#1D1D1F] tracking-tight leading-tight mb-4">
                                Will your resume pass<br />the software?
                            </h1>
                            <p className="text-[1.125rem] text-[#86868B] font-light mb-12">
                                75% of resumes are rejected by ATS before a human even sees them. Let's see how yours stacks up.
                            </p>

                            <div className="relative group">
                                <label className="block w-full border-2 border-dashed border-black/[0.08] hover:border-[#0066CC]/40 bg-white rounded-[2rem] p-16 transition-all cursor-pointer group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)]">
                                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 bg-[#F5F5F7] rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                            <Upload className="w-8 h-8 text-[#1D1D1F]" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-[1.25rem] font-medium text-[#1D1D1F] mb-2">Drop your resume here</h3>
                                        <p className="text-[14px] text-[#86868B] font-light">Supports PDF format only</p>
                                    </div>
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {/* --- STEP 2: OPTIONS --- */}
                    {step === 'options' && (
                        <motion.div 
                            key="options" initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                            className="max-w-xl mx-auto"
                        >
                            <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                                <h2 className="text-[1.75rem] font-medium text-[#1D1D1F] tracking-tight mb-8">Target Job Details</h2>
                                
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5" /> Target Role
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Senior Software Engineer" 
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            className="w-full px-6 py-4 bg-[#F5F5F7] border border-black/[0.03] rounded-2xl focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10 transition-all outline-none font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5" /> Target Market
                                        </label>
                                        <select 
                                            value={targetCountry}
                                            onChange={(e) => setTargetCountry(e.target.value)}
                                            className="w-full px-6 py-4 bg-[#F5F5F7] border border-black/[0.03] rounded-2xl focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10 transition-all outline-none font-medium appearance-none cursor-pointer"
                                        >
                                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            onClick={startAnalysis}
                                            disabled={!targetRole}
                                            className="w-full bg-[#1D1D1F] text-white py-5 rounded-[1.25rem] font-bold text-[16px] hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            Start Forensic Scan <Sparkles className="w-4 h-4 text-[#4DCFFF]" />
                                        </button>
                                        <p className="text-[12px] text-[#86868B] text-center mt-6 font-light">
                                            This uses our most advanced AI to simulate actual ATS logic for the selected market.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- STEP 3: ANALYZING --- */}
                    {step === 'analyzing' && (
                        <motion.div 
                            key="analyzing" initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                            className="text-center py-20"
                        >
                            <div className="relative w-24 h-24 mx-auto mb-12">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-[#0066CC]/30"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-[#1D1D1F] animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight mb-4">Analyzing Compliance...</h2>
                            <p className="text-[1.125rem] text-[#86868B] font-light max-md mx-auto">
                                Cross-referencing your experience against {targetCountry} standard ATS heuristics.
                            </p>
                        </motion.div>
                    )}

                    {/* --- STEP 4: RESULTS --- */}
                    {step === 'results' && results && (
                        <motion.div 
                            key="results" initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                            className="space-y-8"
                        >
                            {/* Score Card */}
                            <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_15px_50px_rgb(0,0,0,0.06)] border border-black/[0.02] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0066CC]/5 to-transparent rounded-bl-full pointer-events-none" />
                                
                                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#F5F5F7]" />
                                            <motion.circle 
                                                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                                strokeDasharray={552}
                                                initial={{ strokeDashoffset: 552 }}
                                                animate={{ strokeDashoffset: 552 - (552 * results.score) / 100 }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                className={results.score >= 80 ? "text-[#34C759]" : results.score >= 50 ? "text-[#FF9F0A]" : "text-[#FF3B30]"}
                                            />
                                        </svg>
                                        <div className="absolute text-center">
                                            <span className="text-[3.5rem] font-bold tracking-tighter text-[#1D1D1F]">{results.score}</span>
                                            <span className="block text-[11px] font-bold text-[#86868B] uppercase tracking-widest mt-[-8px]">Match Score</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 bg-[#F5F5F7] px-3.5 py-1.5 rounded-lg mb-6">
                                            <Target className="w-4 h-4 text-[#1D1D1F]" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1D1D1F]">{targetRole} • {targetCountry}</span>
                                        </div>
                                        <h2 className="text-[2.25rem] font-medium text-[#1D1D1F] tracking-tight mb-4 leading-none">Analysis Complete.</h2>
                                        <p className="text-[1.125rem] text-[#86868B] font-light leading-relaxed mb-8">
                                            Your resume has {results.errors.length > 0 ? "some critical friction points" : "excellent compliance"} that could prevent success in the {targetCountry} market.
                                        </p>
                                        <button 
                                            onClick={handleRepair}
                                            className="bg-[#1D1D1F] text-white px-10 py-4 rounded-2xl font-bold text-[16px] hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center gap-3 mx-auto md:mx-0"
                                        >
                                            <Sparkles className="w-4 h-4 text-[#4DCFFF]" /> Fix All Compliance Issues
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Failure Details */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-[2rem] p-10 border border-[#FF3B30]/10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-[#FF3B30]/10 rounded-full flex items-center justify-center">
                                            <XCircle className="w-5 h-5 text-[#FF3B30]" />
                                        </div>
                                        <h3 className="text-[18px] font-bold text-[#1D1D1F]">Critical Failures</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {results.errors.map((f, i) => (
                                            <div key={i} className="flex gap-4 p-4 bg-[#F5F5F7]/50 rounded-2xl border border-black/[0.02]">
                                                <div className="w-6 h-6 bg-[#FF3B30] text-white rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i+1}</div>
                                                <p className="text-[14px] text-[#434345] font-medium leading-relaxed">{f}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] p-10 border border-black/[0.04]">
                                    <div className="space-y-10">
                                        <div>
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] mb-6 flex items-center gap-2">
                                                <Target className="w-3.5 h-3.5" /> High Impact Insights
                                            </h4>
                                            <div className="space-y-6">
                                                {results.warnings.slice(0, 3).map((s, i) => (
                                                    <div key={i} className="flex items-start gap-4">
                                                        <div className="w-2 h-2 rounded-full bg-[#0066CC] mt-2 shrink-0" />
                                                        <p className="text-[14px] text-[#434345] font-medium leading-relaxed">{s}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-black/[0.04] grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-[#F5F5F7] rounded-2xl">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B]">Parsing Status</span>
                                                </div>
                                                <div className="text-[15px] font-bold text-[#1D1D1F]">Successful</div>
                                            </div>
                                            <div className="p-4 bg-[#F5F5F7] rounded-2xl">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF9F0A]" />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B]">Market Friction</span>
                                                </div>
                                                <div className="text-[15px] font-bold text-[#1D1D1F]">{results.score < 70 ? "High" : "Optimal"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Suggestions */}
                            <div className="bg-[#1D1D1F] text-white rounded-[2.5rem] p-10 md:p-14">
                                <h3 className="text-[1.75rem] font-medium tracking-tight mb-8">Structural Recommendations</h3>
                                <div className="space-y-6">
                                    {(results.warnings || []).map((s, i) => (
                                        <div key={i} className="flex items-start gap-5 p-6 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                                <Check className="w-4 h-4 text-[#4DCFFF]" />
                                            </div>
                                            <div>
                                                <p className="text-[15px] text-white/90 leading-relaxed font-light">{s}</p>
                                                <button 
                                                    onClick={handleRepair}
                                                    className="mt-4 text-[12px] font-bold text-[#4DCFFF] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                                                >
                                                    Auto-Apply Fix <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ATSChecker;
