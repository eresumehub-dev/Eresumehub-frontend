import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Sparkles } from 'lucide-react';

interface FormSectionsProps {
    currentStep: number;
    formData: any;
    setFormData: (data: any) => void;
    countries: string[];
}

const sectionVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.3 }
    })
};

const FormSections: React.FC<FormSectionsProps> = ({ formData, setFormData, countries }) => {
    return (
        <div className="space-y-10">

            {/* SECTION 1: ROLE */}
            <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#0A2A6B]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Position Integrity</h3>
                </div>
                
                <div className="relative group">
                    <input
                        autoFocus
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="Target Position (e.g. Senior Software Engineer)"
                        className="w-full h-12 px-0 bg-transparent border-b-2 border-slate-100 focus:border-[#0A2A6B] text-lg font-bold text-slate-900 placeholder:text-slate-200 focus:outline-none transition-all"
                    />
                    {formData.jobTitle.trim().length > 3 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Validated</span>
                            <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">This anchors the AI engine's keyword prioritization and skills alignment.</p>
            </motion.div>

            {/* SECTION 2: LOCALIZATION */}
            <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-slate-200" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Regional Optimization</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Market</label>
                        <div className="relative">
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full h-10 appearance-none bg-transparent border-b border-slate-200 focus:border-slate-900 text-xs font-bold text-slate-800 transition-all cursor-pointer focus:outline-none"
                            >
                                <option value="">Select country...</option>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Document Language</label>
                        <div className="relative">
                            <select
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full h-10 appearance-none bg-transparent border-b border-slate-200 focus:border-slate-900 text-xs font-bold text-slate-800 transition-all cursor-pointer focus:outline-none"
                            >
                                <option value="English">English (Global Standand)</option>
                                <option value="German">German (DACH Region)</option>
                                <option value="French">French (EU Directives)</option>
                                <option value="Japanese">Japanese (JIS/Market Standard)</option>
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* SECTION 3: VISUAL STYLE */}
            <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-slate-200" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Presentation Framework</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { id: 'executive', name: 'Executive', desc: 'ATS-focused, high density' },
                        { id: 'modern', name: 'Modern', desc: 'Contemporary sidebar logic' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setFormData({ ...formData, template: t.id })}
                            className={`
                                p-4 border rounded text-left transition-all
                                ${formData.template === t.id 
                                    ? 'border-[#0A2A6B] bg-[#0A2A6B]/[0.02] shadow-[0_4px_12px_rgba(10,42,107,0.05)]' 
                                    : 'border-slate-100 hover:border-slate-300 bg-white'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${formData.template === t.id ? 'text-[#0A2A6B]' : 'text-slate-500'}`}>
                                    {t.name} Architecture
                                </p>
                                {formData.template === t.id && <div className="w-1.5 h-1.5 rounded-full bg-[#0A2A6B]" />}
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium italic">{t.desc}</p>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* SECTION 4: CONTEXT */}
            <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-amber-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Calibration (JD)</h3>
                </div>

                <div className="relative">
                    <textarea
                        value={formData.jobDescription}
                        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                        placeholder="Paste the target job description to enable neural keyword matching..."
                        rows={6}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded text-xs font-medium text-slate-600 focus:outline-none focus:border-slate-300 focus:bg-white transition-all leading-relaxed"
                    />
                    {formData.jobDescription.trim().length > 100 && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded self-start">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest italic">Enhanced Matching Active</span>
                        </div>
                    )}
                </div>
            </motion.div>

        </div>
    );
};

export default FormSections;
