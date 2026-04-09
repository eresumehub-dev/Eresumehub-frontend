import React from 'react';
import { 
    Briefcase, 
    MapPin, 
    AlignLeft, 
    ChevronRight
} from 'lucide-react';

interface FormSectionsProps {
    formData: any;
    setFormData: (val: any) => void;
    countries: string[];
}

const FormSections: React.FC<FormSectionsProps> = ({
    formData, setFormData, countries
}) => {
    
    const roleExamples = ["Product Manager", "Software Engineer", "Marketing Lead", "UX Researcher"];

    return (
        <div className="space-y-10">
            {/* 1. Job Role Section */}
            <div>
                <label className="block text-[15px] font-medium text-[#1D1D1F] mb-3 tracking-tight">
                    Target Role
                </label>
                <div className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86868B] group-focus-within:text-[#1D1D1F] transition-colors">
                        <Briefcase className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="block w-full pl-12 pr-4 py-4 bg-[#F5F5F7]/50 border border-black/[0.04] rounded-2xl text-[16px] text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/10 focus:border-[#1D1D1F]/20 transition-all duration-300"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {roleExamples.map(role => (
                        <button
                            key={role}
                            onClick={() => setFormData({ ...formData, jobTitle: role })}
                            className={`px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${formData.jobTitle === role ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#86868B] border-transparent hover:border-[#1D1D1F]/10 hover:text-[#1D1D1F]'}`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Location & Style (Split Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[15px] font-medium text-[#1D1D1F] mb-2.5 tracking-tight">
                        Target Location
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#86868B] group-focus-within:text-[#1D1D1F] transition-colors">
                            <MapPin className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="block w-full pl-12 pr-10 py-4 bg-[#F5F5F7]/50 border border-black/[0.04] rounded-2xl text-[16px] text-[#1D1D1F] appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/10 focus:border-[#1D1D1F]/20 transition-all duration-300"
                        >
                            <option value="">Select a country</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#86868B]">
                            <ChevronRight className="w-5 h-5 rotate-90" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[15px] font-medium text-[#1D1D1F] mb-2.5 tracking-tight">
                        Visual Style
                    </label>
                    <div className="flex gap-2 p-1.5 bg-[#F5F5F7]/50 rounded-2xl border border-black/[0.02]">
                        {['executive', 'modern'].map((style) => (
                            <button
                                key={style}
                                onClick={() => setFormData({ ...formData, template: style })}
                                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold capitalize transition-all ${formData.template === style ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Job Description Section */}
            <div>
                <label className="block text-[15px] font-medium text-[#1D1D1F] mb-2.5 tracking-tight flex items-center justify-between">
                    <span>Job Description</span>
                    <span className="text-xs text-[#86868B] font-normal italic">Contextual Optimization</span>
                </label>
                <div className="relative group">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none text-[#86868B] group-focus-within:text-[#1D1D1F] transition-colors">
                        <AlignLeft className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <textarea
                        value={formData.jobDescription}
                        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                        placeholder="Paste the job requirements here..."
                        rows={6}
                        className="block w-full pl-12 pr-4 py-4 bg-[#F5F5F7]/50 border border-black/[0.04] rounded-2xl text-[16px] text-[#1D1D1F] placeholder-[#86868B] resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D1D1F]/10 focus:border-[#1D1D1F]/20 transition-all duration-300"
                    />
                </div>
            </div>

            {/* Language Hidden Toggle (keeping logic but clean) */}
            <div className="flex items-center gap-4 pt-4">
                <p className="text-[13px] text-[#86868B]">Output Language</p>
                <div className="flex gap-1">
                    {['English', 'German', 'Japanese'].map(lang => (
                        <button
                            key={lang}
                            onClick={() => setFormData({ ...formData, language: lang })}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${formData.language === lang ? 'bg-[#1D1D1F] text-white' : 'bg-transparent text-[#86868B] hover:text-[#1D1D1F]'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default FormSections;
