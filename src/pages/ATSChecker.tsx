import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertTriangle, XCircle, BarChart3, Target, MapPin, Briefcase, FileText, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { createResumeFromData, uploadResumePDF } from '../services/resume';
import { getAvailableCountries } from '../services/schema';

interface JobDetails {
    jobRole: string;
    targetCountry: string;
    jobDescription: string;
}

const ATSChecker: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Upload, 2: Job Details, 3: Results
    const [file, setFile] = useState<File | null>(null);
    const [jobDetails, setJobDetails] = useState<JobDetails>({
        jobRole: '',
        targetCountry: 'Germany',
        jobDescription: ''
    });
    const [analyzing, setAnalyzing] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [results, setResults] = useState<any>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const loadingStages = [
        "Reading Resume Content...",
        `Scanning for ${jobDetails.targetCountry} Norms...`,
        "Comparing with Role Requirements...",
        "Crunching AI Analytics...",
        "Finalizing Your Report..."
    ];

    React.useEffect(() => {
        const fetchCountries = async () => {
            const countries = await getAvailableCountries();
            setAvailableCountries(countries);
            if (countries.length > 0 && !jobDetails.targetCountry) {
                setJobDetails(prev => ({ ...prev, targetCountry: countries[0] }));
            }
        };
        fetchCountries();
    }, []);

    React.useEffect(() => {
        let interval: any;
        if (analyzing) {
            setLoadingStage(0);
            interval = setInterval(() => {
                setLoadingStage((prev) => (prev + 1) % loadingStages.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [analyzing, jobDetails.targetCountry]);

    const proceedToJobDetails = () => {
        if (file) setStep(2);
    };

    const analyzeResume = async () => {
        if (!file) return;

        setAnalyzing(true);
        setStep(3);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('job_role', jobDetails.jobRole);
            formData.append('target_country', jobDetails.targetCountry);
            formData.append('job_description', jobDetails.jobDescription);

            // Use the centralized API client which handles Auth and Base URL (proxied)
            const response = await api.post('/ats/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Increase timeout for AI processing (e.g., 60 seconds)
                timeout: 60000
            });

            if (response.data.success) {
                setResults(response.data.data);
            } else {
                throw new Error(response.data.error || 'Analysis failed');
            }
        } catch (error: any) {
            console.error('ATS Analysis Error:', error);

            // Extract meaningful error message
            let errorMessage = "Please check your connection and try again";
            if (error.response) {
                // Server responded with non-2xx code
                errorMessage = error.response.data?.detail || error.response.data?.error || `Server Error: ${error.response.status}`;
            } else if (error.request) {
                // Request made but no response (timeout or network error)
                errorMessage = "Network Error - No response from server. processing timed out?";
            } else {
                errorMessage = error.message;
            }

            setResults({
                score: 0,
                country: jobDetails.targetCountry,
                jobRole: jobDetails.jobRole,
                strengths: [],
                warnings: ["Analysis Failed"],
                errors: [errorMessage],
                keywords: { found: 0, recommended: 0, missing: [] },
                countrySpecific: ["Connection Failed"]
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleEditResume = async () => {
        if (!results || !results.debug_parsed_profile) {
            // Fallback to old behavior if no data
            navigate('/create');
            return;
        }

        try {
            setIsRedirecting(true);
            // 1. Create a "Draft" Resume in the background
            const newResume = await createResumeFromData(
                results.debug_parsed_profile,
                jobDetails.jobRole || "Imported Profile",
                jobDetails.targetCountry,
                jobDetails.jobDescription,
                results // Pass entire ATS report for AI context
            );

            // 2. Upload the Original PDF Reference (Crucial for User Fidelity)
            if (file) {
                try {
                    // We upload the original file so the editor shows "The Same Fucking Resume" initially
                    await uploadResumePDF(newResume.id, file);
                } catch (uploadError) {
                    console.error("Failed to upload original PDF reference", uploadError);
                    // Non-blocking failure
                }
            }

            // 3. Direct Navigation to the Editor
            if (newResume && newResume.id) {
                navigate(`/resume/edit/${newResume.id}`);
            } else {
                throw new Error("Resume creation returned no ID");
            }

        } catch (error: any) {
            console.error("Direct Edit failed, falling back:", error);
            alert(`Redirect failed: ${error.message || "Unknown error"}`);
            // Fallback to wizard
            navigate('/create', {
                state: {
                    editMode: true,
                    ATSResults: results,
                    importedData: results.debug_parsed_profile
                }
            });
        } finally {
            // setIsRedirecting(false); // No need if navigated away
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
                        Upload your resume and get country-specific feedback tailored to {jobDetails.targetCountry}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-12">
                    {['Upload Resume', 'Job Details', 'Get Report'].map((label, i) => (
                        <React.Fragment key={i}>
                            <div className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step > i ? 'bg-[#4DCFFF] text-white' : step === i + 1 ? 'bg-[#0A2A6B] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {i + 1}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${step >= i + 1 ? 'text-[#0A2A6B]' : 'text-gray-500'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < 2 && (
                                <div className={`w-16 h-1 mx-4 ${step > i + 1 ? 'bg-[#4DCFFF]' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Upload Resume */}
                {step === 1 && (
                    <div className="bg-white rounded-[30px] p-10 shadow-xl border border-gray-100">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#4DCFFF] transition-colors">
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Upload Your Resume
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Supports PDF, DOCX formats (Max 5MB)
                            </p>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                                id="resume-upload"
                            />
                            <label
                                htmlFor="resume-upload"
                                className="inline-block bg-gradient-to-r from-[#4DCFFF] to-[#A855F7] text-white px-8 py-4 rounded-2xl font-semibold cursor-pointer hover:shadow-lg hover:shadow-[#4DCFFF]/50 transition-all"
                            >
                                Choose File
                            </label>
                            {file && (
                                <p className="mt-4 text-sm text-gray-600">
                                    Selected: <span className="font-semibold text-[#0A2A6B]">{file.name}</span>
                                </p>
                            )}
                        </div>

                        {file && (
                            <button
                                onClick={proceedToJobDetails}
                                className="w-full mt-6 bg-[#0A2A6B] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#0A2A6B]/90 transition-all"
                            >
                                Next: Job Details →
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: Job Details */}
                {step === 2 && (
                    <div className="bg-white rounded-[30px] p-10 shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#0A2A6B] mb-6">Tell Us About Your Target Job</h2>

                        <div className="space-y-6">
                            {/* Job Role */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Briefcase className="w-4 h-4 text-[#4DCFFF]" />
                                    Job Role / Position
                                </label>
                                <input
                                    type="text"
                                    value={jobDetails.jobRole}
                                    onChange={(e) => setJobDetails({ ...jobDetails, jobRole: e.target.value })}
                                    placeholder="e.g., Senior Software Engineer"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4DCFFF] focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Target Country */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 text-[#4DCFFF]" />
                                    Target Country
                                </label>
                                <select
                                    value={jobDetails.targetCountry}
                                    onChange={(e) => setJobDetails({ ...jobDetails, targetCountry: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4DCFFF] focus:outline-none transition-colors"
                                >
                                    {availableCountries.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <p className="mt-2 text-sm text-gray-500">
                                    We'll analyze your resume against {jobDetails.targetCountry}-specific standards
                                </p>
                            </div>

                            {/* Job Description (Optional) */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-[#4DCFFF]" />
                                    Job Description (Optional)
                                </label>
                                <textarea
                                    value={jobDetails.jobDescription}
                                    onChange={(e) => setJobDetails({ ...jobDetails, jobDescription: e.target.value })}
                                    placeholder="Paste the job description here for better keyword matching..."
                                    rows={6}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4DCFFF] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={analyzeResume}
                                disabled={!jobDetails.jobRole}
                                className="flex-1 bg-gradient-to-r from-[#0A2A6B] to-[#4DCFFF] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-[#4DCFFF]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Analyze Resume →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 3 && !analyzing && results && (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className="bg-gradient-to-br from-[#0A2A6B] to-[#1e3a8a] rounded-[30px] p-10 shadow-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-6 h-6" />
                                        <h2 className="text-2xl font-bold">ATS Score for {results.country}</h2>
                                    </div>
                                    <p className="text-gray-200">Job Role: {results.jobRole}</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-[#4DCFFF]">
                                        {results.score}
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">out of 100</p>
                                </div>
                            </div>
                        </div>

                        {/* Country-Specific Rules */}
                        <div className="bg-gradient-to-r from-[#4DCFFF]/10 to-[#A855F7]/10 rounded-[25px] p-8 border border-[#4DCFFF]/30">
                            <h3 className="text-xl font-bold text-[#0A2A6B] mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                {results.country}-Specific Requirements
                            </h3>
                            <ul className="space-y-2">
                                {results.countrySpecific.map((rule: string, i: number) => (
                                    <li key={i} className="text-gray-700 flex items-start gap-2">
                                        <span className="text-[#4DCFFF] mt-1">•</span>
                                        <span>{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Strengths */}
                        <div className="bg-white rounded-[25px] p-8 shadow-lg border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                <h3 className="text-xl font-bold text-[#0A2A6B]">Strengths</h3>
                            </div>
                            <ul className="space-y-3">
                                {results.strengths.map((strength: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Warnings */}
                        {results.warnings.length > 0 && (
                            <div className="bg-white rounded-[25px] p-8 shadow-lg border border-yellow-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                    <h3 className="text-xl font-bold text-[#0A2A6B]">Suggestions for {results.country}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {results.warnings.map((warning: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{warning}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Errors */}
                        {results.errors.length > 0 && (
                            <div className="bg-white rounded-[25px] p-8 shadow-lg border border-red-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <XCircle className="w-6 h-6 text-red-500" />
                                    <h3 className="text-xl font-bold text-[#0A2A6B]">Critical Issues</h3>
                                </div>
                                <ul className="space-y-3">
                                    {results.errors.map((error: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{error}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA - Edit Resume */}
                        <div className="bg-gradient-to-r from-[#4DCFFF] to-[#A855F7] rounded-[25px] p-10 text-center text-white">
                            <Edit3 className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-3xl font-bold mb-3">Want to Fix These Issues?</h3>
                            <p className="mb-6 text-lg text-gray-100">
                                Use our AI-powered resume builder to create a {results.country}-optimized resume
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleEditResume}
                                    className="inline-flex items-center gap-2 bg-white text-[#0A2A6B] px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all"
                                >
                                    <Edit3 className="w-5 h-5" />
                                    {isRedirecting ? "Importing..." : "Edit & Improve Resume"}
                                </button>
                                <button
                                    onClick={() => navigate('/create')}
                                    className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
                                >
                                    Create New Resume
                                </button>
                            </div>
                        </div>

                        {/* Re-upload Button */}
                        <button
                            onClick={() => {
                                setStep(1);
                                setFile(null);
                                setResults(null);
                            }}
                            className="w-full text-center text-gray-600 hover:text-[#0A2A6B] font-semibold transition-colors py-4"
                        >
                            ← Check Another Resume
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {analyzing && (
                    <div className="bg-white rounded-[30px] p-20 shadow-xl border border-gray-100 text-center">
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 border-4 border-[#4DCFFF]/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[#4DCFFF] border-t-transparent rounded-full animate-spin"></div>
                            <FileText className="absolute inset-0 m-auto w-8 h-8 text-[#0A2A6B]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0A2A6B] mb-2">{loadingStages[loadingStage]}</h3>
                        <p className="text-gray-600">Please wait, our AI is performing a deep scan...</p>

                        <div className="mt-8 flex justify-center gap-2">
                            {loadingStages.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === loadingStage ? 'w-8 bg-[#4DCFFF]' : 'bg-gray-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ATSChecker;
