import React from 'react';
import { Check, X, Briefcase } from 'lucide-react';
// @ts-ignore
import executivePreview from '../assets/executive.jpg';

interface Template {
    id: string;
    name: string;
    description: string;
    tagline: string;
    icon: any;
    bestFor: string;
}

const TEMPLATES: Template[] = [
    {
        id: 'executive',
        name: 'Standard',
        tagline: 'Professional & Clear',
        description: 'The standard for professional roles. Clean typography with a single-column layout.',
        icon: Briefcase,
        bestFor: 'General Purpose, Corporate, Management'
    }
];

interface TemplateSelectorProps {
    selectedTemplate: string;
    onSelect: (id: string) => void;
}

const TemplatePreview: React.FC<{ id: string; isSelected: boolean; isLarge?: boolean }> = ({ id, isSelected, isLarge }) => {
    return (
        <div className={`rounded-lg border overflow-hidden transition-all duration-300 relative flex-shrink-0
            ${isSelected ? 'border-zinc-700 shadow-2xl' : 'border-zinc-200 group-hover:border-zinc-300'}
            bg-white
            ${isLarge ? 'w-full h-auto shadow-none border-0 rounded-none' : 'w-32 h-44'}
        `}>
            <img
                src={executivePreview}
                alt={`${id} template preview`}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerText = 'Image Not Found';
                }}
            />
        </div>
    );
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelect }) => {
    const [previewId, setPreviewId] = React.useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;

                return (
                    <div
                        key={template.id}
                        onClick={() => onSelect(template.id)}
                        className={`group relative flex flex-col rounded-2xl cursor-pointer transition-all duration-300 border overflow-hidden
                            ${isSelected
                                ? 'bg-white border-zinc-900 shadow-xl ring-2 ring-zinc-900 transform scale-[1.02]'
                                : 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-lg'
                            }
                        `}
                    >
                        {/* Status Icon Overlay */}
                        {isSelected && (
                            <div className="absolute top-3 right-3 z-10 bg-zinc-900 text-white p-1.5 rounded-full shadow-lg">
                                <Check className="w-4 h-4" />
                            </div>
                        )}

                        {/* Template Preview - Full Card */}
                        <div className="relative w-full aspect-[210/297] bg-zinc-100">
                            {/* Reusing TemplatePreview but forcing full size via container and class overrides if needed 
                                 Actually, since we pass isLarge={true}, it removes the w-32 constraint.
                             */}
                            <TemplatePreview id={template.id} isSelected={false} isLarge={true} />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewId(template.id);
                                }}
                                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                            >
                                Enlarge
                            </button>
                        </div>

                        {/* Minimal Footer */}
                        <div className="p-3 border-t border-zinc-100 text-center bg-white">
                            <span className={`text-sm font-bold ${isSelected ? 'text-zinc-900' : 'text-zinc-600'}`}>
                                {template.name}
                            </span>
                        </div>
                    </div>
                );
            })}


            {/* Quick View Modal */}
            {previewId && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
                    onClick={() => setPreviewId(null)}
                >
                    <div
                        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewId(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-500" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-zinc-900 mb-1">
                                {TEMPLATES.find(t => t.id === previewId)?.name} Template
                            </h3>
                            <p className="text-zinc-500">
                                {TEMPLATES.find(t => t.id === previewId)?.description}
                            </p>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <TemplatePreview id={previewId} isSelected={true} isLarge />
                        </div>

                        <button
                            onClick={() => {
                                onSelect(previewId!);
                                setPreviewId(null);
                            }}
                            className="w-full mt-6 py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-all hover:scale-[1.02]"
                        >
                            Use This Template
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateSelector;
