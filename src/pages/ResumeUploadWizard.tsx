import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createProfileFromResume } from '../services/profile';

interface ProgressStep {
    message: string;
    completed: boolean;
}

const ResumeUploadWizard: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<ProgressStep[]>([]);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const progressSteps = [
        'Uploading your resume...',
        'Extracting text and sections...',
        'Identifying work experience...',
        'Analyzing education history...',
        'Extracting skills...',
        'Enhancing with AI...',
        'Building your profile...',
        'Profile ready!'
    ];

    const handleFileChange = (selectedFile: File) => {
        if (selectedFile) {
            const fileType = selectedFile.type;
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!validTypes.includes(fileType)) {
                setError('Please upload a PDF or DOCX file');
                return;
            }

            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            setFile(selectedFile);
            setError('');
        }
    };

    const simulateProgress = () => {
        const initialProgress = progressSteps.map((msg, i) => ({
            message: msg,
            completed: i === 0
        }));
        setProgress(initialProgress);

        // Simulate progress over time
        progressSteps.forEach((_, index) => {
            setTimeout(() => {
                setProgress(prev => prev.map((step, i) => ({
                    ...step,
                    completed: i <= index
                })));
            }, (index + 1) * 600);
        });
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');
        simulateProgress();

        try {
            const result = await createProfileFromResume(file);

            // Wait for progress animation to complete
            setTimeout(() => {
                navigate('/profile', {
                    state: {
                        importedData: {
                            ...result.profile,
                            warnings: result.warnings // Pass logic warnings to next step
                        },
                        fromResume: true
                    }
                });
            }, 5000);

        } catch (err: any) {
            setError(err.message || 'Failed to process resume. Please try again.');
            setUploading(false);
            setProgress([]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {!uploading ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="inline-block"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Upload className="w-10 h-10 text-white" />
                                </div>
                            </motion.div>

                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                Upload Your Resume
                            </h1>
                            <p className="text-xl text-gray-600 mb-2">
                                Save <span className="font-bold text-blue-600">85% of your time</span>
                            </p>
                            <p className="text-gray-500">
                                We'll extract and enhance everything for you with AI ✨
                            </p>
                        </div>

                        {/* Upload Area */}
                        <div
                            className={`relative border-3 border-dashed rounded-2xl p-12 transition-all duration-300 ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : file
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                                className="hidden"
                                id="resume-upload"
                            />

                            {!file ? (
                                <label htmlFor="resume-upload" className="cursor-pointer block">
                                    <div className="text-center">
                                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-lg font-semibold text-gray-700 mb-2">
                                            Drag & drop your resume here
                                        </p>
                                        <p className="text-gray-500 mb-4">or</p>
                                        <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                                            Browse Files
                                        </div>
                                        <p className="text-sm text-gray-500 mt-4">
                                            PDF or DOCX • Max 10MB
                                        </p>
                                    </div>
                                </label>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center"
                                >
                                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                    <p className="text-lg font-semibold text-gray-900 mb-1">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {(file.size / 1024).toFixed(0)} KB
                                    </p>
                                    <label
                                        htmlFor="resume-upload"
                                        className="text-blue-600 font-semibold hover:underline cursor-pointer"
                                    >
                                        Change file
                                    </label>
                                </motion.div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <span className="text-red-800">{error}</span>
                            </motion.div>
                        )}

                        {/* Upload Button */}
                        {file && !error && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleUpload}
                                className="mt-8 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Extract & Build Profile
                            </motion.button>
                        )}

                        {/* Alternative Option */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600 text-sm mb-2">
                                Don't have a resume yet?
                            </p>
                            <button
                                onClick={() => navigate('/profile')}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Create profile from scratch instead →
                            </button>
                        </div>

                        {/* Features */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: Sparkles, title: 'AI Enhanced', desc: 'Automatically improve content' },
                                { icon: CheckCircle, title: 'ATS Optimized', desc: 'Formatted for applicant systems' },
                                { icon: FileText, title: 'Country Ready', desc: 'Adapts to any region' }
                            ].map((feature, i) => (
                                <div key={i} className="text-center">
                                    <feature.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                                    <p className="text-xs text-gray-500">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-12"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="inline-block mb-6"
                            >
                                <Loader className="w-16 h-16 text-blue-600" />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Building Your Profile...
                            </h2>
                            <p className="text-gray-600 mb-8">
                                This will only take a few seconds
                            </p>

                            <div className="space-y-3 max-w-md mx-auto">
                                <AnimatePresence>
                                    {progress.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${step.completed
                                                ? 'bg-green-50 border-2 border-green-200'
                                                : 'bg-gray-50 border-2 border-gray-200'
                                                }`}
                                        >
                                            {step.completed ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            ) : (
                                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0 animate-pulse" />
                                            )}
                                            <span
                                                className={`text-sm font-medium ${step.completed ? 'text-green-900' : 'text-gray-600'
                                                    }`}
                                            >
                                                {step.message}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ResumeUploadWizard;
