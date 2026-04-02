import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, FileText, Globe, Languages, Sparkles } from 'lucide-react';
import Input from '../../../components/shared/ui/Input';
import Textarea from '../../../components/shared/ui/Textarea';
import Select from '../../../components/shared/ui/Select';
import Card from '../../../components/shared/ui/Card';

interface FormSectionsProps {
    currentStep: number;
    formData: any;
    setFormData: (data: any) => void;
    countries: string[];
    readinessScore: number;
}

const FormSections: React.FC<FormSectionsProps> = ({ currentStep, formData, setFormData, countries, readinessScore }) => {
    
    // Step 0: Role
    const RoleSection = (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-foreground">Defining your target role</h3>
            </div>
            <Input 
                autoFocus
                label="Target Position"
                placeholder="e.g. Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                hint="Used to optimize skills and keywords"
            />
            {formData.jobTitle.trim().length > 3 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Position locked — +5% Readiness
                </motion.p>
            )}
        </motion.div>
    );

    // Step 1: Context
    const ContextSection = (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Matching context (Optional but Powerful)</h3>
            </div>
            <Textarea 
                label="Full Job Description"
                placeholder="Paste the requirements here to let AI prioritize your best-matching achievements..."
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                rows={12}
                hint="AI uses this for keyword injection"
            />
            {formData.jobDescription.trim().length > 100 && (
                <Card variant="muted" padding="sm" className="bg-emerald-50/50 border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> JD match active — +25% ATS Projection
                    </p>
                </Card>
            )}
        </motion.div>
    );

    // Step 2: Customize
    const CustomizeSection = (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-slate-500" />
                    <h3 className="text-sm font-bold text-foreground">Market & Localization</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Select 
                        label="Target Market"
                        value={formData.country}
                        options={countries.map(c => ({ value: c, label: c }))}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                    <Select 
                        label="Document Language"
                        value={formData.language}
                        options={[
                            { value: 'English', label: 'English' },
                            { value: 'German', label: 'German' },
                            { value: 'French', label: 'French' },
                        ]}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-bold text-foreground">Visual Style</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {['executive', 'modern'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFormData({ ...formData, template: t })}
                            className={`
                                p-4 rounded-xl border text-left transition-all relative overflow-hidden group
                                ${formData.template === t 
                                    ? 'bg-foreground/5 border-foreground ring-1 ring-foreground/20' 
                                    : 'border-border hover:border-foreground/20'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-bold uppercase tracking-widest ${formData.template === t ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {t}
                                </span>
                                {formData.template === t && <Check className="w-3 h-3 text-foreground" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground group-hover:text-foreground/70 transition-colors">
                                {t === 'executive' ? 'ATS-optimized, clean' : 'Modern, contemporary layout'}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-xl mx-auto py-8">
            <AnimatePresence mode="wait">
                {currentStep === 0 && RoleSection}
                {currentStep === 1 && ContextSection}
                {currentStep === 2 && CustomizeSection}
            </AnimatePresence>
            
            {/* Step Guidance Footer */}
            <div className="mt-12 flex items-center justify-center gap-4">
               {currentStep < 2 && formData.jobTitle.trim() && (
                   <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                        Ready to proceed? Click the indicator or use the sidebar.
                   </motion.p>
               )}
            </div>
        </div>
    );
};

export default FormSections;
