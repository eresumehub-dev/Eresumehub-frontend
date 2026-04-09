import React from 'react';
import { motion } from 'framer-motion';
import { Target, FileText, Globe, Sparkles, Check, ChevronDown } from 'lucide-react';

interface FormSectionsProps {
    currentStep: number;
    formData: any;
    setFormData: (data: any) => void;
    countries: string[];
}

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    })
};

const templateStyles = [
    {
        id: 'executive',
        label: 'Executive',
        desc: 'ATS-optimized, clean & traditional',
        badge: 'Most Popular',
        gradient: 'from-slate-700 to-slate-900',
        preview: ['─────────────', '  ████ ████  ', '  ─────────  ', '  ███ ████   ', '  ████ ██    ']
    },
    {
        id: 'modern',
        label: 'Modern',
        desc: 'Contemporary, bold sidebar layout',
        badge: 'Trending',
        gradient: 'from-[#0A2A6B] to-[#4DCFFF]',
        preview: ['█ ──────────', '█ ████ ████ ', '█ ─────────  ', '█ ███ ████  ', '█ ████ ██   ']
    }
];

const FormSections: React.FC<FormSectionsProps> = ({ formData, setFormData, countries }) => {
    return (
        <div className="max-w-2xl space-y-6 pb-24 lg:pb-10">

            {/* ── SECTION 1: Target Role ── */}
            <motion.div
                custom={0}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden"
            >
                <div className="px-7 pt-7 pb-2">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Target className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Target Role</h2>
                            <p className="text-[11px] text-slate-400">What position are you applying for?</p>
                        </div>
                        <div className="ml-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">Step 1</span>
                        </div>
                    </div>

                    <div className="relative mb-5">
                        <input
                            autoFocus
                            type="text"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            placeholder="e.g. Senior Software Engineer"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#0A2A6B]/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,42,107,0.06)] transition-all"
                        />
                        {formData.jobTitle.trim().length > 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
                            >
                                <Check className="w-3.5 h-3.5 text-white" />
                            </motion.div>
                        )}
                    </div>

                    {formData.jobTitle.trim().length > 3 ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl mb-5"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                                Position locked — AI will optimize keywords for this role
                            </p>
                        </motion.div>
                    ) : (
                        <p className="text-[11px] text-slate-400 mb-5 px-1">
                            Enter your job title. This drives keyword selection across the entire resume.
                        </p>
                    )}
                </div>
            </motion.div>

            {/* ── SECTION 2: Market & Localization ── */}
            <motion.div
                custom={1}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden"
            >
                <div className="px-7 pt-7 pb-7">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Market & Format</h2>
                            <p className="text-[11px] text-slate-400">Select your target country and language</p>
                        </div>
                        <div className="ml-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Step 2</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Country Select */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                                Target Market <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full appearance-none px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0A2A6B]/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,42,107,0.06)] transition-all pr-10 cursor-pointer"
                                >
                                    <option value="">Select country...</option>
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Language Select */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                                Document Language
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full appearance-none px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0A2A6B]/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,42,107,0.06)] transition-all pr-10 cursor-pointer"
                                >
                                    <option value="English">🇬🇧 English</option>
                                    <option value="German">🇩🇪 German</option>
                                    <option value="French">🇫🇷 French</option>
                                    <option value="Japanese">🇯🇵 Japanese</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {formData.country && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-3 p-4 bg-[#0A2A6B]/5 border border-[#0A2A6B]/10 rounded-2xl"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#0A2A6B] mt-0.5 shrink-0" />
                            <p className="text-[11px] font-semibold text-[#0A2A6B]/80 leading-relaxed">
                                AI will apply <strong>{formData.country}</strong> formatting rules — including date formats, section order, and regional keywords.
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* ── Visual Style Sub-section ── */}
                <div className="px-7 pb-7 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Visual Style</h3>
                            <p className="text-[11px] text-slate-400">Choose your resume template</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {templateStyles.map((t) => {
                            const isSelected = formData.template === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setFormData({ ...formData, template: t.id })}
                                    className={`
                                        relative text-left p-5 rounded-2xl border-2 transition-all duration-200 overflow-hidden group
                                        ${isSelected
                                            ? 'border-[#0A2A6B] bg-[#0A2A6B]/5 shadow-md shadow-[#0A2A6B]/10'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    {/* Mini Resume Preview */}
                                    <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${t.gradient} mb-3 p-2.5 flex flex-col gap-1 opacity-80`}>
                                        {t.preview.map((line, i) => (
                                            <div key={i} className="text-[7px] text-white/70 font-mono tracking-widest">{line}</div>
                                        ))}
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${isSelected ? 'text-[#0A2A6B]' : 'text-slate-700'}`}>
                                                {t.label}
                                            </p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">{t.desc}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-[#0A2A6B] flex items-center justify-center shrink-0 ml-2 mt-0.5">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Badge */}
                                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest
                                        ${isSelected ? 'bg-[#0A2A6B] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {t.badge}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* ── SECTION 3: Job Description ── */}
            <motion.div
                custom={2}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden"
            >
                <div className="px-7 pt-7 pb-7">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Job Description</h2>
                            <p className="text-[11px] text-slate-400">Optional, but dramatically improves match</p>
                        </div>
                        <div className="ml-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Optional</span>
                        </div>
                    </div>

                    <textarea
                        value={formData.jobDescription}
                        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                        placeholder="Paste the full job description here. The AI will read through the requirements and match your experience to the exact keywords the recruiter used..."
                        rows={8}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#0A2A6B]/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,42,107,0.06)] transition-all resize-none leading-relaxed"
                    />

                    {formData.jobDescription.trim().length > 100 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-emerald-800">JD Match Active</p>
                                <p className="text-[11px] text-emerald-600">+25% projected ATS score improvement from keyword injection</p>
                            </div>
                        </motion.div>
                    ) : (
                        <p className="mt-3 text-[11px] text-slate-400 px-1 leading-relaxed">
                            💡 Tip: Pasting a full job description is the single biggest thing you can do to improve your ATS score.
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Footer Badge */}
            <div className="text-center pt-4 pb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    Intelligence Engine Active · v16.4.9
                </p>
            </div>
        </div>
    );
};

export default FormSections;
