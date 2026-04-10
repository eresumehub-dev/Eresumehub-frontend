import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
    Upload, CheckCircle2, AlertTriangle, XCircle, 
    BarChart3, Target, MapPin, Briefcase, FileText, Edit3,
    ChevronLeft, Sparkles, Check, File, Loader2
} from 'lucide-react';

// Services
import { createResumeFromData, uploadResumePDF } from '../services/resume';
import { getAvailableCountries } from '../services/schema';

// Hooks
import { useFileUpload } from '../hooks/useFileUpload';
import { useATSAnalysis } from '../hooks/useATSAnalysis';

type Stage = 'upload' | 'details' | 'analyzing' | 'results';

const ATSChecker: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Stage>('upload');
    const [jobDetails, setJobDetails] = useState({
        jobRole: '',
        targetCountry: 'Germany',
        jobDescription: ''
    });
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    // Custom Hooks
    const { file, setFile, handleFileChange, handleDrop, handleDragOver } = useFileUpload();
    const { 
        analyzing, stageText, results, error: analysisError, 
        analyzeResume, setResults 
    } = useATSAnalysis(jobDetails.targetCountry);

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countries = await getAvailableCountries();
                setAvailableCountries(countries);
                if (countries.length > 0 && !jobDetails.targetCountry) {
                    setJobDetails(prev => ({ ...prev, targetCountry: countries[0] }));
                }
            } catch (err) {
                console.error("Failed to fetch countries", err);
            }
        };
        fetchCountries();
    }, []);

    // Sync state stage with analysis hook
    useEffect(() => {
        if (analyzing) {
            setStep('analyzing');
        } else if (results) {
            setStep('results');
        } else if (analysisError) {
            setStep('results'); // Show error in results state
        }
    }, [analyzing, results, analysisError]);

    const handleRunAnalysis = async () => {
        if (!file) {
            toast.error("Please upload a resume first.");
            return;
        }
        await analyzeResume(file, jobDetails.jobRole, jobDetails.jobDescription);
    };

    const handleEditResume = async () => {
        if (!results || !results.debug_parsed_profile) {
            navigate('/create');
            return;
        }

        let didNavigate = false;
        setIsRedirecting(true);

        try {
            const newResume = await createResumeFromData(
                results.debug_parsed_profile,
                jobDetails.jobRole || "Imported Profile",
                jobDetails.targetCountry,
                jobDetails.jobDescription,
                results
            );

            if (file) {
                try {
                    await uploadResumePDF(newResume.id, file);
                } catch { /* Non-blocking upload failure */ }
            }

            if (newResume?.id) {
                didNavigate = true;
                navigate(`/resume/edit/${newResume.id}`);
            } else {
                throw new Error("Resume creation returned no ID");
            }
        } catch (error: any) {
            console.error("Import failed:", error);
            toast.error(`Import failed: ${error.message || "Unknown error"}`);
            navigate('/create', { 
                state: { 
                    editMode: true, 
                    ATSResults: results,
                    importedData: results.debug_parsed_profile 
                } 
            });
        } finally {
            if (!didNavigate) setIsRedirecting(false);
        }
    };

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-['IBM_Plex_Sans'] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white flex flex-col">
            
            {/* Minimalist Isolation Header */}
            <header className="w-full px-6 md:px-12 py-8 relative z-20 flex justify-between items-center max-w-[1800px] mx-auto shrink-0">
                <button 
                    onClick={() => navigate('/')} 
                    className="text-[19px] font-bold tracking-tight text-[#1D1D1F] hover:opacity-70 transition-opacity focus:outline-none"
                >
                    E-resumeHub
                </button>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-[14px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors focus:outline-none flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center px-4 sm:px-6 relative z-10 pb-20">
                
                {/* Header Text */}
                <AnimatePresence mode="wait">
                    {(step === 'upload' || step === 'details') && (
                        <motion.div 
                            initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                            className="text-center max-w-2xl mx-auto mb-12 mt-8"
                        >
                            <h1 className="text-[2.5rem] md:text-[3.5rem] font-medium text-[#1D1D1F] tracking-tight leading-tight mb-4">
                                Will your resume pass<br />the software?
                            </h1>
                            <p className="text-[1.125rem] text-[#86868B] font-light leading-relaxed">
                                Upload your document to see exactly what hiring managers—and their automated filters—see.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- THE INTERACTIVE STAGES --- */}
                <div className="w-full max-w-[700px] relative">
                    <AnimatePresence mode="wait">
                        
                        {/* STAGE 1: UPLOAD */}
                        {step === 'upload' && (
                            <motion.div 
                                key="upload"
                                initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-black/[0.04]"
                            >
                                <div 
                                    onDrop={(e) => {
                                        handleDrop(e);
                                        // Transition delay handled in hook or here
                                        setTimeout(() => setStep('details'), 400);
                                    }}
                                    onDragOver={handleDragOver}
                                    className="border-2 border-dashed border-black/[0.08] rounded-[1.5rem] p-12 text-center hover:border-[#0066CC]/50 hover:bg-[#0066CC]/[0.02] transition-all duration-300 cursor-pointer group relative flex flex-col items-center justify-center min-h-[300px]"
                                >
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                            handleFileChange(e);
                                            setTimeout(() => setStep('details'), 400);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        id="resume-upload"
                                    />
                                    
                                    <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
                                        <Upload className="w-8 h-8 text-[#86868B] group-hover:text-[#0066CC] transition-colors" />
                                    </div>
                                    
                                    <h3 className="text-[1.25rem] font-medium text-[#1D1D1F] mb-2 tracking-tight">
                                        Drop your resume here
                                    </h3>
                                    <p className="text-[14px] text-[#86868B] font-light mb-8 max-w-xs">
                                        We accept PDF and DOCX files up to 5MB.
                                    </p>
                                    
                                    <label htmlFor="resume-upload" className="inline-block bg-[#1D1D1F] text-white px-6 py-3.5 rounded-xl text-[14px] font-medium cursor-pointer shadow-md group-hover:bg-black transition-colors pointer-events-none">
                                        Browse Files
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* STAGE 2: JOB DETAILS */}
                        {step === 'details' && (
                            <motion.div 
                                key="details"
                                initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-black/[0.04]"
                            >
                                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/[0.04]">
                                    <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center">
                                        <File className="w-5 h-5 text-[#1D1D1F]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#34C759] mb-1 flex items-center gap-1"><Check className="w-3 h-3"/> File Attached</p>
                                        <p className="text-[15px] font-medium text-[#1D1D1F] truncate">{file?.name || "resume_final.pdf"}</p>
                                    </div>
                                    <button onClick={() => { setFile(null); setStep('upload'); }} className="text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors">Change</button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-[13px] font-medium text-[#1D1D1F] mb-2 pl-1">
                                            <Briefcase className="w-4 h-4 text-[#86868B]" />
                                            What role are you applying for?
                                        </label>
                                        <input
                                            type="text"
                                            value={jobDetails.jobRole}
                                            onChange={(e) => setJobDetails({ ...jobDetails, jobRole: e.target.value })}
                                            placeholder="e.g. Senior Software Engineer"
                                            className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] text-[#1D1D1F] placeholder-[#86868B]/50 font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-[13px] font-medium text-[#1D1D1F] mb-2 pl-1">
                                            <MapPin className="w-4 h-4 text-[#86868B]" />
                                            Where is the job located?
                                        </label>
                                        <select
                                            value={jobDetails.targetCountry}
                                            onChange={(e) => setJobDetails({ ...jobDetails, targetCountry: e.target.value })}
                                            className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] text-[#1D1D1F] cursor-pointer font-medium appearance-none"
                                        >
                                            {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center justify-between text-[13px] font-medium text-[#1D1D1F] mb-2 pl-1 pr-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-[#86868B]" />
                                                Paste the job description
                                            </div>
                                            <span className="text-[#86868B] text-[11px] uppercase tracking-wider">Highly Recommended</span>
                                        </label>
                                        <textarea
                                            value={jobDetails.jobDescription}
                                            onChange={(e) => setJobDetails({ ...jobDetails, jobDescription: e.target.value })}
                                            placeholder="Copy and paste the full job posting here. Our AI will analyze your keyword match..."
                                            rows={4}
                                            className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[14px] text-[#1D1D1F] placeholder-[#86868B]/50 leading-relaxed resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={!jobDetails.jobRole}
                                    className="w-full mt-8 flex justify-center items-center gap-2 bg-[#1D1D1F] text-white px-8 py-4 rounded-[1.25rem] font-medium text-[16px] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Sparkles className="w-4 h-4" /> Scan My Resume
                                </button>
                            </motion.div>
                        )}

                        {/* STAGE 3: ANALYZING (The Scan State) */}
                        {step === 'analyzing' && (
                            <motion.div 
                                key="analyzing"
                                initial="hidden" animate="visible" exit="exit" variants={fadeUp}
                                className="bg-white rounded-[2.5rem] p-16 shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-black/[0.04] text-center relative overflow-hidden"
                            >
                                {/* Sweeping Laser Animation */}
                                <motion.div 
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-[2px] bg-[#0066CC] shadow-[0_0_20px_#0066CC] z-20 opacity-50"
                                />

                                <div className="relative w-24 h-24 mx-auto mb-8">
                                    <div className="absolute inset-0 border-[3px] border-[#0066CC]/10 rounded-full"></div>
                                    <div className="absolute inset-0 border-[3px] border-[#0066CC] border-t-transparent rounded-full animate-spin"></div>
                                    <Target className="absolute inset-0 m-auto w-8 h-8 text-[#1D1D1F]" />
                                </div>
                                <h3 className="text-[1.5rem] font-medium text-[#1D1D1F] tracking-tight mb-2">Analyzing Document</h3>
                                <p className="text-[15px] text-[#86868B] font-light animate-pulse">
                                    {stageText || "Initializing deep scan..."}
                                </p>
                            </motion.div>
                        )}

                        {/* STAGE 4: RESULTS (Bento Box Layout) */}
                        {step === 'results' && (
                            <motion.div 
                                key="results"
                                initial="hidden" animate="visible" variants={fadeUp}
                                className="w-full max-w-[1000px] mx-auto space-y-6"
                            >
                                {analysisError ? (
                                    <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-rose-100 text-center">
                                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <XCircle className="w-10 h-10 text-rose-500" />
                                        </div>
                                        <h3 className="text-[1.5rem] font-medium text-[#1D1D1F] mb-2">Analysis Failed</h3>
                                        <p className="text-[15px] text-[#86868B] mb-8 max-w-sm mx-auto">{analysisError}</p>
                                        <button
                                            onClick={() => { setResults(null); setStep('details'); }}
                                            className="bg-[#1D1D1F] text-white px-8 py-4 rounded-xl font-medium hover:bg-black transition-all"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : results ? (
                                    <>
                                        {/* Score Header Card */}
                                        <div className="bg-[#1D1D1F] rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#AF52DE]/20 to-transparent rounded-bl-full pointer-events-none" />
                                            
                                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                                                <div>
                                                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg mb-4 backdrop-blur-md border border-white/10">
                                                        <Target className="w-4 h-4 text-white" />
                                                        <span className="text-[11px] font-bold uppercase tracking-widest text-white">Scan Complete</span>
                                                    </div>
                                                    <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-white tracking-tight leading-tight">
                                                        Resume Score
                                                    </h2>
                                                    <p className="text-[15px] text-white/60 mt-2 font-light">
                                                        Analyzed for a <strong className="text-white font-medium">{results.jobRole}</strong> role in {results.country}.
                                                    </p>
                                                </div>
                                                
                                                <div className="flex flex-col items-center md:items-end">
                                                    <div className="text-[5rem] md:text-[6rem] font-medium leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                                                        {results.score}<span className="text-[2rem] text-white/40">%</span>
                                                    </div>
                                                    <p className="text-[13px] font-medium text-white/60 mt-2">
                                                        Match Potential
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bento Grid for Feedback */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            
                                            {/* What you did right */}
                                            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                                                <h3 className="text-[1.25rem] font-medium text-[#1D1D1F] mb-6 flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-[#34C759]" strokeWidth={2.5}/>
                                                    What you did right
                                                </h3>
                                                <ul className="space-y-4">
                                                    {(results.strengths || []).map((s, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-[14px] text-[#1D1D1F]/80 leading-relaxed font-light text-justify">
                                                            <div className="w-1.5 h-1.5 bg-[#34C759] rounded-full mt-2 shrink-0" />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* What needs fixing */}
                                            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FF3B30]/10">
                                                <h3 className="text-[1.25rem] font-medium text-[#1D1D1F] mb-6 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-[#FF3B30]" strokeWidth={2.5}/>
                                                    What needs fixing
                                                </h3>
                                                <ul className="space-y-4">
                                                    {[...(results.errors || []), ...(results.warnings || [])].map((w, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-[14px] text-[#1D1D1F]/80 leading-relaxed font-light text-justify">
                                                            <div className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full mt-2 shrink-0" />
                                                            {w}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Action CTA */}
                                        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.04] text-center mt-6">
                                            <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Sparkles className="w-8 h-8 text-[#1D1D1F]" />
                                            </div>
                                            <h3 className="text-[1.75rem] font-medium text-[#1D1D1F] tracking-tight mb-2">Fix these issues automatically</h3>
                                            <p className="text-[15px] text-[#86868B] font-light max-w-md mx-auto mb-8">
                                                Let our AI engine rewrite your document to match exactly what hiring systems are looking for.
                                            </p>
                                            
                                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                <button
                                                    onClick={handleEditResume}
                                                    disabled={isRedirecting}
                                                    className="flex items-center justify-center gap-2 bg-[#1D1D1F] text-white px-8 py-4 rounded-[1.25rem] font-medium text-[15px] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] disabled:opacity-50"
                                                >
                                                    {isRedirecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                                    {isRedirecting ? "Importing..." : "Polish with AI"}
                                                </button>
                                                <button
                                                    onClick={() => { setResults(null); setStep('upload'); setFile(null); }}
                                                    className="flex items-center justify-center gap-2 bg-white text-[#1D1D1F] border border-black/[0.08] px-8 py-4 rounded-[1.25rem] font-medium text-[15px] hover:bg-[#F5F5F7] active:scale-[0.98] transition-all"
                                                >
                                                    Check another resume
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default ATSChecker;
