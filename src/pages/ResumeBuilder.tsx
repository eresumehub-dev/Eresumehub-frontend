import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    ChevronLeft, Save, Download, Share2,
    User, Briefcase, GraduationCap, Wrench, Plus,
    Layout, Palette,
    AlertCircle, Sparkles, Upload,
    Undo, Redo, Copy, Trash2, GripVertical, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, createOrUpdateProfile } from '../services/profile';
import { profileToResume, resumeToProfile } from '../utils/resumeMapper';
import { ResumeData, ResumeSection, ResumeItem } from '../types/resume';

// --- Components ---
const EditableText = ({
    value,
    onChange,
    className,
    placeholder,
    multiline = false,
    tagName = 'div',
    style
}: {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    tagName?: 'div' | 'h1' | 'h2' | 'h3' | 'span' | 'p';
    style?: React.CSSProperties;
}) => {
    const Tag = tagName as any;
    return (
        <Tag
            contentEditable
            suppressContentEditableWarning
            className={`outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text transition-colors hover:bg-blue-50/30 focus:bg-blue-50/50 rounded px-1 -mx-1 ${className}`}
            data-placeholder={placeholder}
            onBlur={(e: React.FocusEvent) => onChange(e.currentTarget.textContent || '')}
            dangerouslySetInnerHTML={{ __html: value }}
            style={style}
        />
    );
};

// --- Mock Data (Fallback) ---
const INITIAL_RESUME: ResumeData = {
    title: 'My Professional Resume',
    personalInfo: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA'
    },
    theme: { color: '#3b82f6', font: 'Inter', layout: 'single' },
    sections: [
        {
            id: '1',
            type: 'summary',
            title: 'Professional Summary',
            isVisible: true,
            content: 'Experienced software engineer with a passion for building scalable web applications. Proven track record of delivering high-quality code and leading teams to success.'
        },
        {
            id: '2',
            type: 'experience',
            title: 'Work Experience',
            isVisible: true,
            content: [
                {
                    id: 'e1',
                    title: 'Senior Frontend Developer',
                    subtitle: 'Tech Solutions Inc.',
                    date: '2021 - Present',
                    location: 'San Francisco, CA',
                    description: '<ul><li>Led migration of legacy codebase to React 18.</li><li>Improved site performance by 40% through code splitting and lazy loading.</li><li>Mentored junior developers and conducted code reviews.</li></ul>'
                }
            ]
        },
        {
            id: '3',
            type: 'education',
            title: 'Education',
            isVisible: true,
            content: [
                {
                    id: 'ed1',
                    title: 'B.S. Computer Science',
                    subtitle: 'University of Technology',
                    date: '2015 - 2019',
                    location: 'Boston, MA',
                    description: 'Graduated with Honors. GPA: 3.8/4.0'
                }
            ]
        },
        {
            id: '4',
            type: 'skills',
            title: 'Skills',
            isVisible: true,
            content: 'JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker, Git'
        },
    ]
};

const ResumeBuilder: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuth(); // Unused
    const [resume, setResume] = useState<ResumeData>(INITIAL_RESUME);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [rightPanelTab, setRightPanelTab] = useState<'ats' | 'ai' | 'job'>('ats');
    const [isSaving, setIsSaving] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDesignPanel, setShowDesignPanel] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { profile } = await getProfile();
                if (profile) {
                    const mappedResume = profileToResume(profile);
                    // Merge with initial theme/title if needed, or just set
                    setResume(prev => ({
                        ...mappedResume,
                        // Preserve theme if profile doesn't have it (profile currently doesn't store theme)
                        theme: prev.theme,
                        title: prev.title // or mappedResume.title
                    }));
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        };
        loadProfile();
    }, []);

    // --- Mock AI Service ---
    const generateContent = async (type: 'summary' | 'bullets' | 'grammar') => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        setIsGenerating(false);

        if (type === 'summary') {
            return "Highly motivated and results-oriented Software Engineer with 5+ years of experience in full-stack development. Proven track record of delivering scalable web applications and optimizing performance. Adept at collaborating with cross-functional teams to drive project success.";
        }
        return null;
    };

    const handleAIRewrite = async () => {
        const newSummary = await generateContent('summary');
        if (newSummary) {
            setResume(prev => ({
                ...prev,
                sections: prev.sections.map(s => s.type === 'summary' ? { ...s, content: newSummary } : s)
            }));
        }
    };

    const handleAnalyzeJob = (jd: string) => {
        setJobDescription(jd);
        setShowUploadModal(false);
        // In a real app, this would trigger a backend analysis
        setRightPanelTab('ats');
    };

    // --- Constants ---
    const FONTS = ['Inter', 'Roboto', 'Merriweather', 'Open Sans', 'Lato'];
    const COLORS = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Green', value: '#10b981' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Black', value: '#111827' },
    ];

    // --- Refs ---
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // --- Actions ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const profileData = resumeToProfile(resume);
            await createOrUpdateProfile(profileData);
            // Show success feedback (could be a toast)
            // For now, just a small delay to show "Saved" state
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error("Failed to save resume:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = sectionRefs.current[sectionId];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const addSection = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newSection: ResumeSection = {
            id: newId,
            type: 'custom',
            title: 'New Section',
            isVisible: true,
            content: ''
        };
        setResume({ ...resume, sections: [...resume.sections, newSection] });
        setActiveSection(newId);
        // Scroll to new section after render
        setTimeout(() => scrollToSection(newId), 100);
    };

    const deleteSection = (sectionId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent scrolling to section when deleting
        if (confirm('Are you sure you want to delete this section?')) {
            setResume({ ...resume, sections: resume.sections.filter(s => s.id !== sectionId) });
        }
    };

    const duplicateSection = (section: ResumeSection, e: React.MouseEvent) => {
        e.stopPropagation();
        const newId = Math.random().toString(36).substr(2, 9);
        // Deep copy content if it's an array
        const newContent = Array.isArray(section.content)
            ? section.content.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }))
            : section.content;

        const newSection = { ...section, id: newId, title: `${section.title} (Copy)`, content: newContent };
        setResume({ ...resume, sections: [...resume.sections, newSection] });
    };

    const updateSectionContent = (sectionId: string, newContent: any) => {
        setResume({
            ...resume,
            sections: resume.sections.map(s => s.id === sectionId ? { ...s, content: newContent } : s)
        });
    };

    const addSectionItem = (sectionId: string) => {
        const section = resume.sections.find(s => s.id === sectionId);
        if (!section || !Array.isArray(section.content)) return;

        const newItem: ResumeItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Position',
            subtitle: 'Company Name',
            date: 'Date Range',
            location: 'Location',
            description: '<ul><li>Description of your responsibilities and achievements.</li></ul>'
        };

        updateSectionContent(sectionId, [newItem, ...section.content]);
    };

    const deleteSectionItem = (sectionId: string, itemId: string) => {
        const section = resume.sections.find(s => s.id === sectionId);
        if (!section || !Array.isArray(section.content)) return;
        updateSectionContent(sectionId, section.content.filter((item: ResumeItem) => item.id !== itemId));
    };

    const updateSectionItem = (sectionId: string, itemId: string, field: keyof ResumeItem, value: string) => {
        const section = resume.sections.find(s => s.id === sectionId);
        if (!section || !Array.isArray(section.content)) return;

        updateSectionContent(sectionId, section.content.map((item: ResumeItem) =>
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
            {/* --- HEADER --- */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={resume.title}
                            onChange={(e) => setResume({ ...resume, title: e.target.value })}
                            className="font-semibold text-lg bg-transparent border-none focus:ring-0 p-0 text-gray-900 placeholder-gray-400"
                            placeholder="Untitled Resume"
                        />
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            {isSaving ? 'Saving...' : 'Saved'}
                            {!isSaving && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 text-sm font-medium">
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 tooltip" title="Export PDF">
                        <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 tooltip" title="Share">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* --- MAIN WORKSPACE --- */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT PANEL - SECTIONS */}
                <aside className="w-72 bg-white border-r border-gray-200 flex flex-col z-10">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sections</h3>
                        <div className="space-y-1">
                            <Reorder.Group axis="y" values={resume.sections} onReorder={(newSections) => setResume({ ...resume, sections: newSections })}>
                                {resume.sections.map((section) => (
                                    <Reorder.Item key={section.id} value={section}>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${activeSection === section.id ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'hover:bg-gray-50 text-gray-700'}`}
                                            onClick={() => scrollToSection(section.id)}
                                        >
                                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                                            {section.type === 'summary' && <User className="w-4 h-4" />}
                                            {section.type === 'experience' && <Briefcase className="w-4 h-4" />}
                                            {section.type === 'education' && <GraduationCap className="w-4 h-4" />}
                                            {section.type === 'skills' && <Wrench className="w-4 h-4" />}
                                            {section.type === 'custom' && <Layout className="w-4 h-4" />}
                                            <span className="text-sm font-medium flex-1 truncate">{section.title}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                    title="Duplicate"
                                                    onClick={(e) => duplicateSection(section, e)}
                                                >
                                                    <Copy className="w-3 h-3 text-gray-400" />
                                                </button>
                                                <button
                                                    className="p-1 hover:bg-gray-200 rounded"
                                                    title="Delete"
                                                    onClick={(e) => deleteSection(section.id, e)}
                                                >
                                                    <Trash2 className="w-3 h-3 text-gray-400" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                        <button
                            onClick={addSection}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Section
                        </button>
                    </div>
                </aside>

                {/* CENTER CANVAS - BUILDER */}
                <main className="flex-1 bg-gray-100/50 overflow-y-auto p-8 flex justify-center relative">
                    {/* Toolbar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex items-center gap-1 z-10">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Undo">
                            <Undo className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Redo">
                            <Redo className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                            <Layout className="w-4 h-4" />
                            Template
                        </button>
                        <button
                            onClick={() => setShowDesignPanel(!showDesignPanel)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${showDesignPanel ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <Palette className="w-4 h-4" />
                            Design
                        </button>
                    </div>

                    {/* Design Panel Popover */}
                    <AnimatePresence>
                        {showDesignPanel && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-16 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-80 z-20"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Color Theme</label>
                                        <div className="flex gap-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.name}
                                                    onClick={() => setResume({ ...resume, theme: { ...resume.theme, color: c.value } })}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${resume.theme.color === c.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundColor: c.value }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Typography</label>
                                        <select
                                            value={resume.theme.font}
                                            onChange={(e) => setResume({ ...resume, theme: { ...resume.theme, font: e.target.value } })}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {FONTS.map(font => (
                                                <option key={font} value={font}>{font}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Layout</label>
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setResume({ ...resume, theme: { ...resume.theme, layout: 'single' } })}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resume.theme.layout === 'single' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Single Column
                                            </button>
                                            <button
                                                onClick={() => setResume({ ...resume, theme: { ...resume.theme, layout: 'double' } })}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resume.theme.layout === 'double' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Two Columns
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* A4 Page Canvas */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-[210mm] min-h-[297mm] bg-white shadow-2xl rounded-sm p-[20mm] relative group transition-all duration-300 ease-in-out transform origin-top scale-[0.85] lg:scale-100"
                        style={{ fontFamily: resume.theme.font }}
                    >
                        {/* Resume Content Placeholder */}
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center border-b-2 pb-6" style={{ borderColor: resume.theme.color }}>
                                <EditableText
                                    tagName="h1"
                                    className="text-4xl font-bold mb-2 inline-block"
                                    style={{ color: resume.theme.color }}
                                    value={resume.personalInfo.fullName}
                                    onChange={(val) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, fullName: val } })}
                                    placeholder="Your Name"
                                />
                                <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2">
                                    <EditableText
                                        tagName="span"
                                        value={resume.personalInfo.email}
                                        onChange={(val) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, email: val } })}
                                        placeholder="Email"
                                    />
                                    <span>•</span>
                                    <EditableText
                                        tagName="span"
                                        value={resume.personalInfo.phone}
                                        onChange={(val) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, phone: val } })}
                                        placeholder="Phone"
                                    />
                                    <span>•</span>
                                    <EditableText
                                        tagName="span"
                                        value={resume.personalInfo.location}
                                        onChange={(val) => setResume({ ...resume, personalInfo: { ...resume.personalInfo, location: val } })}
                                        placeholder="Location"
                                    />
                                </div>
                            </div>

                            {/* Sections */}
                            {resume.sections.map(section => (
                                <div
                                    key={section.id}
                                    ref={(el) => sectionRefs.current[section.id] = el}
                                    className="group/section relative hover:ring-1 hover:ring-blue-200 hover:bg-blue-50/10 rounded p-2 -m-2 transition-all"
                                >
                                    <h2
                                        className="text-lg font-bold uppercase tracking-wider mb-3 border-b pb-1 flex items-center justify-between"
                                        style={{ color: resume.theme.color, borderColor: resume.theme.color }}
                                    >
                                        <EditableText
                                            tagName="span"
                                            value={section.title}
                                            onChange={(val) => setResume({
                                                ...resume,
                                                sections: resume.sections.map(s => s.id === section.id ? { ...s, title: val } : s)
                                            })}
                                        />
                                        <div className="opacity-0 group-hover/section:opacity-100 flex gap-2">
                                            <button
                                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                                onClick={() => deleteSection(section.id, { stopPropagation: () => { } } as any)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            {(section.type === 'experience' || section.type === 'education') && (
                                                <button
                                                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                                    onClick={() => addSectionItem(section.id)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </h2>

                                    <div className="min-h-[50px] text-sm text-gray-700 leading-relaxed">
                                        {/* Summary / Skills / Custom (Simple Text) */}
                                        {(section.type === 'summary' || section.type === 'skills' || section.type === 'custom') && typeof section.content === 'string' && (
                                            <EditableText
                                                tagName="div"
                                                multiline
                                                className="whitespace-pre-wrap"
                                                value={section.content}
                                                onChange={(val) => updateSectionContent(section.id, val)}
                                                placeholder={`Enter ${section.title.toLowerCase()}...`}
                                            />
                                        )}

                                        {/* Experience / Education (List Items) */}
                                        {(section.type === 'experience' || section.type === 'education') && Array.isArray(section.content) && (
                                            <Reorder.Group axis="y" values={section.content} onReorder={(newContent) => updateSectionContent(section.id, newContent)}>
                                                {section.content.map((item: ResumeItem) => (
                                                    <Reorder.Item key={item.id} value={item} className="mb-4 group/item relative pl-6 border-l-2 border-transparent hover:border-gray-200 transition-colors">
                                                        <div className="absolute left-0 top-1 opacity-0 group-hover/item:opacity-100 -ml-2 cursor-grab active:cursor-grabbing p-1 text-gray-400">
                                                            <GripVertical className="w-3 h-3" />
                                                        </div>
                                                        <button
                                                            className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 p-1 text-red-400 hover:bg-red-50 rounded"
                                                            onClick={() => deleteSectionItem(section.id, item.id)}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>

                                                        <div className="flex justify-between font-semibold">
                                                            <EditableText
                                                                tagName="span"
                                                                value={item.title || ''}
                                                                onChange={(val) => updateSectionItem(section.id, item.id, 'title', val)}
                                                                placeholder="Title / Degree"
                                                            />
                                                            <EditableText
                                                                tagName="span"
                                                                className="text-right"
                                                                value={item.date || ''}
                                                                onChange={(val) => updateSectionItem(section.id, item.id, 'date', val)}
                                                                placeholder="Date Range"
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-gray-600 italic mb-1">
                                                            <EditableText
                                                                tagName="span"
                                                                value={item.subtitle || ''}
                                                                onChange={(val) => updateSectionItem(section.id, item.id, 'subtitle', val)}
                                                                placeholder="Company / School"
                                                            />
                                                            <EditableText
                                                                tagName="span"
                                                                className="text-right"
                                                                value={item.location || ''}
                                                                onChange={(val) => updateSectionItem(section.id, item.id, 'location', val)}
                                                                placeholder="Location"
                                                            />
                                                        </div>
                                                        <EditableText
                                                            tagName="div"
                                                            multiline
                                                            className="ml-4"
                                                            value={item.description || ''}
                                                            onChange={(val) => updateSectionItem(section.id, item.id, 'description', val)}
                                                            placeholder="Description (bullet points)"
                                                        />
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </main>

                {/* RIGHT PANEL - AI & ATS */}
                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col z-10">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setRightPanelTab('ats')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${rightPanelTab === 'ats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            ATS Report
                        </button>
                        <button
                            onClick={() => setRightPanelTab('ai')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${rightPanelTab === 'ai' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            AI Tools
                        </button>
                        <button
                            onClick={() => setRightPanelTab('job')}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${rightPanelTab === 'job' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Job Match
                        </button>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={rightPanelTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 overflow-y-auto p-5"
                        >
                            {rightPanelTab === 'ats' && (
                                <div className="space-y-6">
                                    {!jobDescription ? (
                                        <div className="text-center py-8">
                                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Briefcase className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Description</h3>
                                            <p className="text-sm text-gray-500 mb-6">Upload a job description to see how well your resume matches.</p>
                                            <button
                                                onClick={() => setShowUploadModal(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Add Job Description
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Score Ring */}
                                            <div className="flex flex-col items-center justify-center py-4">
                                                <div className="relative w-32 h-32">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                                        <circle cx="64" cy="64" r="56" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="351.86" strokeDashoffset="70" className="transition-all duration-1000 ease-out" />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-3xl font-bold text-gray-900">80</span>
                                                        <span className="text-xs text-gray-500 uppercase font-medium">ATS Score</span>
                                                    </div>
                                                </div>
                                                <p className="text-center text-sm text-gray-600 mt-2">Your resume is well-optimized!</p>
                                            </div>

                                            {/* Categories */}
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Formatting', score: 95, color: 'bg-green-500' },
                                                    { label: 'Keywords', score: 70, color: 'bg-yellow-500' },
                                                    { label: 'Impact', score: 60, color: 'bg-orange-500' },
                                                    { label: 'Brevity', score: 100, color: 'bg-green-500' }
                                                ].map((item) => (
                                                    <div key={item.label}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="font-medium text-gray-700">{item.label}</span>
                                                            <span className="text-gray-500">{item.score}%</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Issues */}
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                                <h4 className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Critical Issues (2)
                                                </h4>
                                                <ul className="space-y-2 text-sm text-red-600">
                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-1">•</span>
                                                        <span>Missing "Project Management" keyword found in job description.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="mt-1">•</span>
                                                        <span>Summary is too long (keep under 4 lines).</span>
                                                    </li>
                                                </ul>
                                                <button className="w-full mt-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors">
                                                    Fix All Issues
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {rightPanelTab === 'ai' && (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-2">
                                            <Sparkles className="w-4 h-4" />
                                            AI Assistant
                                        </h4>
                                        <p className="text-sm text-purple-600 mb-4">I can help you rewrite sections, improve grammar, or tailor your resume.</p>
                                        <div className="space-y-2">
                                            <button
                                                onClick={handleAIRewrite}
                                                disabled={isGenerating}
                                                className="w-full text-left px-3 py-2 bg-white border border-purple-200 rounded text-sm text-gray-700 hover:bg-purple-50 transition-colors flex items-center justify-between"
                                            >
                                                <span>✨ Rewrite professional summary</span>
                                                {isGenerating && <span className="text-xs text-purple-500">Generating...</span>}
                                            </button>
                                            <button className="w-full text-left px-3 py-2 bg-white border border-purple-200 rounded text-sm text-gray-700 hover:bg-purple-50 transition-colors">
                                                💪 Make bullet points more impactful
                                            </button>
                                            <button className="w-full text-left px-3 py-2 bg-white border border-purple-200 rounded text-sm text-gray-700 hover:bg-purple-50 transition-colors">
                                                📝 Check for grammar errors
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {rightPanelTab === 'job' && (
                                <div className="space-y-4">
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                                        onClick={() => setShowUploadModal(true)}
                                    >
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-900">Paste Job Description</p>
                                        <p className="text-xs text-gray-500 mt-1">or upload file</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </aside>
            </div>

            {/* Upload Modal Placeholder */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Upload Job Description</h3>
                        <p className="text-sm text-gray-600 mb-4">Paste the job description or upload a file to get tailored AI suggestions.</p>
                        <textarea
                            className="w-full h-32 border border-gray-300 rounded-md p-2 text-sm mb-4"
                            placeholder="Paste job description here..."
                            id="jd-input"
                        ></textarea>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button
                                onClick={() => {
                                    const val = (document.getElementById('jd-input') as HTMLTextAreaElement).value;
                                    handleAnalyzeJob(val);
                                }}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Analyze
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeBuilder;
