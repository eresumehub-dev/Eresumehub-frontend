import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
    Upload, CheckCircle2, AlertTriangle, XCircle, 
    BarChart3, Target, MapPin, Briefcase, FileText, Edit3 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Services
import { createResumeFromData, uploadResumePDF } from '../services/resume';
import { getAvailableCountries } from '../services/schema';

// Hooks
import { useFileUpload } from '../hooks/useFileUpload';
import { useATSAnalysis } from '../hooks/useATSAnalysis';

type Step = 'upload' | 'details' | 'results';

const ATSChecker: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('upload');
    const [jobDetails, setJobDetails] = useState({
        jobRole: '',
        targetCountry: 'Germany',
        jobDescription: ''
    });
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    // Custom Hooks
    const { file, handleFileChange, handleDrop, handleDragOver } = useFileUpload();
    const { 
        analyzing, stageText, results, error: analysisError, 
        elapsedTime, analyzeResume, setResults 
    } = useATSAnalysis(jobDetails.targetCountry);

    useEffect(() => {
        const fetchCountries = async () => {
            const countries = await getAvailableCountries();
            setAvailableCountries(countries);
            if (countries.length > 0 && !jobDetails.targetCountry) {
                setJobDetails(prev => ({ ...prev, targetCountry: countries[0] }));
            }
        };
        fetchCountries();
    }, []);

    const handleRunAnalysis = async () => {
        if (!file) {
            toast.error("Please upload a resume first.");
            return;
        }
        setStep('results');
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
            // 1. Create a "Draft" Resume in the background
            const newResume = await createResumeFromData(
                results.debug_parsed_profile,
                jobDetails.jobRole || "Imported Profile",
                jobDetails.targetCountry,
                jobDetails.jobDescription,
                results
            );

            // 2. Upload the Original PDF Reference
            if (file) {
                try {
                    // Optimized: Preserve original PDF for visual fidelity in the editor
                    // Replaces unprofessional comments with logic-driven documentation
                    await uploadResumePDF(newResume.id, file);
                } catch {
                    /* Non-blocking upload failure */
                }
            }

            // 3. Navigation
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
            // Fix: Reset redirecting state only if we haven't already navigated away
            if (!didNavigate) setIsRedirecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[#4DCFFF]/10 px-4 py-2 rounded-full mb-4">
                        <BarChart3 className="w-5 h-5 text-[#4DCFFF]" />
                        <span className="text-sm font-semibold text-[#0A2A6B]">100% Free • Country-Specific Analysis</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0A2A6B] mb-4">
                        Smart ATS Resume Checker
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tailored analysis for <span className="text-[#0A2A6B] font-bold">{jobDetails.targetCountry}</span>
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    {[
                        { label: 'Upload Resume', key: 'upload' }, 
                        { label: 'Job Details', key: 'details' }, 
                        { label: 'Get Report', key: 'results' }
                    ].map((s, i) => (
                        <React.Fragment key={s.key}>
                            <div className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                                    step === s.key ? 'bg-[#0A2A6B] text-white scale-110 shadow-lg' : 
                                    (i === 0 && (step === 'details' || step === 'results')) || (i === 1 && step === 'results') ? 'bg-[#4DCFFF] text-white' : 
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                    {i + 1}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${step === s.key ? 'text-[#0A2A6B] font-bold' : 'text-gray-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < 2 && (
                                <div className={`w-16 h-1 mx-4 transition-colors ${
                                    (i === 0 && (step === 'details' || step === 'results')) || (i === 1 && step === 'results') ? 'bg-[#4DCFFF]' : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                {step === 'upload' && (
                    <div className="bg-white rounded-[30px] p-10 shadow-xl border border-gray-100">
                        <div 
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#4DCFFF] hover:bg-slate-50/50 transition-all cursor-pointer group relative"
                        >
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                id="resume-upload"
                            />
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-[#4DCFFF] transition-colors" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {file ? file.name : "Upload Your Resume"}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {file ? `${(file.size / (1024 * 1024)).toFixed(2)}MB • Ready` : "Drag and drop or click to browse (Max 5MB PDF/DOCX)"}
                            </p>
                            
                            <label
                                htmlFor="resume-upload"
                                className="inline-block bg-[#0A2A6B] text-white px-8 py-4 rounded-2xl font-semibold cursor-pointer hover:shadow-lg hover:bg-[#061A44] transition-all"
                            >
                                {file ? "Change File" : "Choose File"}
                            </label>
                        </div>

                        <button
                            onClick={() => setStep('details')}
                            disabled={!file}
                            className="w-full mt-6 bg-[#4DCFFF] text-[#0A2A6B] px-8 py-4 rounded-2xl font-bold hover:bg-[#3dbbe6] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            Next: Job Details →
                        </button>
                    </div>
                )}

                {step === 'details' && (
                    <div className="bg-white rounded-[30px] p-10 shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#0A2A6B] mb-6">Tell Us About Your Target Job</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#4DCFFF]" />
                                        Job Role / Position
                                    </div>
                                    {!jobDetails.jobRole && <span className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Required</span>}
                                </label>
                                <input
                                    type="text"
                                    value={jobDetails.jobRole}
                                    onChange={(e) => setJobDetails({ ...jobDetails, jobRole: e.target.value })}
                                    placeholder="e.g., Senior Software Engineer"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4DCFFF] focus:outline-none transition-colors font-medium"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 text-[#4DCFFF]" />
                                    Target Country
                                </label>
                                <select
                                    value={jobDetails.targetCountry}
                                    onChange={(e) => setJobDetails({ ...jobDetails, targetCountry: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4DCFFF] focus:outline-none transition-colors cursor-pointer"
                                >
                                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-[#4DCFFF]" />
                                    Job Description (Optional)
                                </label>
                                <textarea
                                    value={jobDetails.jobDescription}
                                    onChange={(e) => setJobDetails({ ...jobDetails, jobDescription: e.target.value })}
                                    placeholder="Paste the job description here for better keyword matching..."
                                    rows={5}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4DCFFF] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setStep('upload')}
                                className="flex-1 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleRunAnalysis}
                                disabled={!jobDetails.jobRole}
                                className="flex-1 bg-[#0A2A6B] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-[#0A2A6B]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Analyze Resume →
                            </button>
                        </div>
                    </div>
                )}

                {step === 'results' && (
                    <>
                        {analyzing ? (
                            <div className="bg-white rounded-[30px] p-20 shadow-xl border border-gray-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                                    <div 
                                        className="h-full bg-[#4DCFFF] transition-all duration-500 ease-out" 
                                        style={{ width: `${Math.min(95, (elapsedTime / 60) * 100)}%` }}
                                    />
                                </div>
                                <div className="relative w-24 h-24 mx-auto mb-8">
                                    <div className="absolute inset-0 border-4 border-[#4DCFFF]/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-[#4DCFFF] border-t-transparent rounded-full animate-spin"></div>
                                    <FileText className="absolute inset-0 m-auto w-8 h-8 text-[#0A2A6B]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0A2A6B] mb-2">{stageText}</h3>
                                <p className="text-gray-500 text-sm font-medium">
                                    {elapsedTime > 15 ? `Searching deep... (${elapsedTime}s elapsed)` : "AI deep scan in progress..."}
                                </p>
                            </div>
                        ) : analysisError ? (
                            <div className="bg-white rounded-[30px] p-12 shadow-xl border border-rose-100 text-center">
                                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle className="w-10 h-10 text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0A2A6B] mb-2">Analysis Failed</h3>
                                <p className="text-gray-600 mb-8 max-w-sm mx-auto">{analysisError}</p>
                                <button
                                    onClick={() => setStep('details')}
                                    className="bg-[#0A2A6B] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : results ? (
                            <div className="space-y-6">
                                {/* Score Card */}
                                <div className="bg-[#0A2A6B] rounded-[30px] p-10 shadow-xl text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl text-[#4DCFFF]" />
                                    <div className="flex items-center justify-between relative z-10 font-sans">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="w-6 h-6 text-[#4DCFFF]" />
                                                <h2 className="text-2xl font-bold">ATS Score for {results.country}</h2>
                                            </div>
                                            <p className="text-gray-300 font-medium">Job Role: {results.jobRole}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-7xl font-bold text-[#4DCFFF] tracking-tighter">
                                                {results.score}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">out of 100</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-[25px] p-8 shadow-lg border border-slate-100">
                                        <h3 className="text-lg font-bold text-[#0A2A6B] mb-6 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            Strengths
                                        </h3>
                                        <ul className="space-y-4">
                                            {results.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium leading-relaxed">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-[25px] p-8 shadow-lg border border-slate-100">
                                        <h3 className="text-lg font-bold text-[#0A2A6B] mb-6 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            Needs Work
                                        </h3>
                                        <ul className="space-y-4">
                                            {[...results.errors, ...results.warnings].map((w, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium leading-relaxed">
                                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="bg-[#0A2A6B] rounded-[25px] p-10 text-center text-white shadow-2xl shadow-[#0A2A6B]/20">
                                    <h3 className="text-3xl font-bold mb-3 tracking-tight">Want to Fix These Issues?</h3>
                                    <p className="mb-8 text-lg text-gray-300">
                                        Use our AI to rewrite your resume for the <span className="text-[#4DCFFF] font-bold">{results.country}</span> market.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={handleEditResume}
                                            disabled={isRedirecting}
                                            className="inline-flex items-center justify-center gap-2 bg-[#4DCFFF] text-[#0A2A6B] px-8 py-4 rounded-2xl font-bold hover:bg-[#3dbbe6] transition-all disabled:opacity-50"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                            {isRedirecting ? "Importing..." : "Edit & Improve Resume"}
                                        </button>
                                        <button
                                            onClick={() => navigate('/create')}
                                            className="inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
                                        >
                                            Create New Resume
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setStep('upload'); setResults(null); }}
                                    className="w-full text-center text-slate-400 hover:text-[#0A2A6B] text-sm font-bold uppercase tracking-widest transition-colors py-8"
                                >
                                    ← Check Another Resume
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
};

export default ATSChecker;
