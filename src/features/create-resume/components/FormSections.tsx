import React from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';

interface FormSectionsProps {
    currentStep: number;
    formData: any;
    setFormData: (val: any) => void;
    countries: string[];
}

const FormSections: React.FC<FormSectionsProps> = ({
    formData, setFormData, countries
}) => {
    
    const roleExamples = ["Software Engineer", "Marketing Manager", "UX Designer", "Sales Director"];

    const isJDLongEnough = formData.jobDescription.length >= 100;

    return (
        <div className="space-y-16">
            
            {/* 1. Job Role Section */}
            <section className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        What role are you targeting?
                    </label>
                    <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="e.g. Senior Product Manager"
                        className="w-full text-lg font-medium p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none text-slate-900 placeholder:text-slate-300"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {roleExamples.map(role => (
                        <button
                            key={role}
                            onClick={() => setFormData({ ...formData, jobTitle: role })}
                            className="px-3 py-1.5 rounded-full border border-slate-100 text-xs font-medium text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all bg-white"
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </section>

            {/* 2. Country & Lang Selection */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        Where are you applying?
                    </label>
                    <div className="relative group">
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="w-full appearance-none text-sm font-medium p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-slate-900 transition-all outline-none text-slate-900 pr-12"
                        >
                            <option value="">Select a country</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-900" />
                    </div>
                    <p className="text-xs text-slate-400 font-normal">This helps us tailor your resume to regional hiring standards.</p>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        In which language?
                    </label>
                    <div className="relative group">
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full appearance-none text-sm font-medium p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-slate-900 transition-all outline-none text-slate-900 pr-12"
                        >
                            <option value="English">English</option>
                            <option value="German">German</option>
                            <option value="Japanese">Japanese</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-slate-900" />
                    </div>
                </div>
            </section>

            {/* 3. Template Selection (Visual Miniatures) */}
            <section className="space-y-6">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    Choose a resume style
                </label>
                <div className="grid grid-cols-2 gap-6">
                    {['executive', 'modern'].map((style) => (
                        <button
                            key={style}
                            onClick={() => setFormData({ ...formData, template: style })}
                            className={`
                                relative p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 h-full group
                                ${formData.template === style 
                                    ? 'border-slate-900 bg-white shadow-xl shadow-slate-900/5' 
                                    : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                                }
                            `}
                        >
                            {/* Grayscale Thumbnail Placeholder */}
                            <div className={`w-12 h-16 shrink-0 border border-slate-200 rounded p-1 flex flex-col gap-1 transition-all ${formData.template === style ? 'bg-slate-100' : 'bg-white opacity-40 group-hover:opacity-100'}`}>
                                <div className="w-full h-1 bg-slate-300 rounded-full" />
                                <div className="w-2/3 h-1 bg-slate-200 rounded-full" />
                                <div className="mt-1 w-full flex-1 border border-slate-200/50 border-dashed rounded" />
                            </div>
                            
                            <div>
                                <p className={`text-sm font-bold uppercase tracking-tight mb-1 ${formData.template === style ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {style}
                                </p>
                                <p className="text-xs text-slate-500 leading-normal font-normal">
                                    {style === 'executive' ? 'Classic, high-impact layout for experienced professionals.' : 'A contemporary, clean design for a competitive edge.'}
                                </p>
                            </div>
                            
                            {formData.template === style && (
                                <div className="absolute top-4 right-4 bg-slate-900 rounded-full p-1">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* 4. Job Description */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        (Optional) Paste a job description
                    </label>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded transition-colors ${isJDLongEnough ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {formData.jobDescription.length} chars
                    </span>
                </div>
                <div className="relative">
                    <textarea
                        value={formData.jobDescription}
                        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                        placeholder="Paste the job requirements here. We'll use this to optimize your match score."
                        className="w-full h-48 p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none text-sm font-medium leading-relaxed text-slate-900 placeholder:text-slate-300 resize-none"
                    />
                    {!isJDLongEnough && formData.jobDescription.length > 5 && (
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-600 font-medium">
                            <Sparkles className="w-3 h-3" />
                            A longer description allows for better AI matching.
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
};

export default FormSections;
