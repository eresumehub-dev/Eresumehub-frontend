// This file contains the implementations for Steps 6-9 of the ProfileCreationMultiStep
// Copy these case statements into the renderStepContent() switch statement

// Replace cases 6-9 in ProfileCreationMultiStep.tsx with these implementations:

// STEP 6: PROJECTS
case 6:
const addProject = () => {
    setProfile({
        ...profile,
        projects: [
            ...(profile.projects || []),
            {
                title: '',
                description: '',
                technologies: [],
                link: '',
                role: '',
                start_date: '',
                end_date: ''
            }
        ]
    });
};

const updateProject = (index: number, field: string, value: any) => {
    const updated = [...(profile.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, projects: updated });
};

const removeProject = (index: number) => {
    setProfile({
        ...profile,
        projects: profile.projects?.filter((_, i) => i !== index)
    });
};

const addProjectTechnology = (index: number, tech: string) => {
    const updated = [...(profile.projects || [])];
    if (updated[index] && tech && !updated[index].technologies?.includes(tech)) {
        updated[index] = {
            ...updated[index],
            technologies: [...(updated[index].technologies || []), tech]
        };
        setProfile({ ...profile, projects: updated });
    }
};

const removeProjectTechnology = (index: number, tech: string) => {
    const updated = [...(profile.projects || [])];
    if (updated[index]) {
        updated[index] = {
            ...updated[index],
            technologies: updated[index].technologies?.filter(t => t !== tech)
        };
        setProfile({ ...profile, projects: updated });
    }
};

return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
                <p className="text-gray-600">Showcase your portfolio and side projects</p>
            </div>
            <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
                <Plus className="w-4 h-4" />
                Add Project
            </button>
        </div>

        <div className="space-y-4">
            {profile.projects?.map((project, index) => {
                const [newTech, setNewTech] = React.useState('');

                return (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900">Project #{index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => removeProject(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Project Title *"
                                value={project.title}
                                onChange={(e) => updateProject(index, 'title', e.target.value)}
                                className="md:col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Your Role"
                                value={project.role}
                                onChange={(e) => updateProject(index, 'role', e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <input
                                type="url"
                                placeholder="Project Link (GitHub, Demo, etc.)"
                                value={project.link}
                                onChange={(e) => updateProject(index, 'link', e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <textarea
                            rows={3}
                            placeholder="Describe the project, its purpose, and your contributions..."
                            value={project.description}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies Used</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTech}
                                    onChange={(e) => setNewTech(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addProjectTechnology(index, newTech);
                                            setNewTech('');
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="e.g., React, Node.js, MongoDB"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        addProjectTechnology(index, newTech);
                                        setNewTech('');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies?.map((tech, techIndex) => (
                                    <span
                                        key={techIndex}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                                    >
                                        {tech}
                                        <button
                                            type="button"
                                            onClick={() => removeProjectTechnology(index, tech)}
                                            className="hover:text-green-900 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}

            {(!profile.projects || profile.projects.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No projects added yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Add Project" to get started</p>
                </div>
            )}
        </div>
    </div>
);

// STEP 7: CERTIFICATIONS
case 7:
const addCertification = () => {
    setProfile({
        ...profile,
        certifications: [
            ...(profile.certifications || []),
            {
                name: '',
                issuing_organization: '',
                issue_date: '',
                expiration_date: '',
                credential_id: '',
                credential_url: ''
            }
        ]
    });
};

const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...(profile.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, certifications: updated });
};

const removeCertification = (index: number) => {
    setProfile({
        ...profile,
        certifications: profile.certifications?.filter((_, i) => i !== index)
    });
};

return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Certifications</h2>
                <p className="text-gray-600">Add professional certifications and licenses</p>
            </div>
            <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
                <Plus className="w-4 h-4" />
                Add Certification
            </button>
        </div>

        <div className="space-y-4">
            {profile.certifications?.map((cert, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">Certification #{index + 1}</h3>
                        <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Certification Name *"
                            value={cert.name}
                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                            className="md:col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Issuing Organization *"
                            value={cert.issuing_organization}
                            onChange={(e) => updateCertification(index, 'issuing_organization', e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                        <input
                            type="month"
                            placeholder="Issue Date *"
                            value={cert.issue_date}
                            onChange={(e) => updateCertification(index, 'issue_date', e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                        <input
                            type="month"
                            placeholder="Expiration Date (if applicable)"
                            value={cert.expiration_date}
                            onChange={(e) => updateCertification(index, 'expiration_date', e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                            type="text"
                            placeholder="Credential ID"
                            value={cert.credential_id}
                            onChange={(e) => updateCertification(index, 'credential_id', e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                            type="url"
                            placeholder="Credential URL"
                            value={cert.credential_url}
                            onChange={(e) => updateCertification(index, 'credential_url', e.target.value)}
                            className="md:col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            ))}

            {(!profile.certifications || profile.certifications.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No certifications added yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Add Certification" to get started</p>
                </div>
            )}
        </div>
    </div>
);

// STEP 8: LANGUAGES
case 8:
const [newLanguage, setNewLanguage] = React.useState({ name: '', level: 'Intermediate' });

return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Languages</h2>
            <p className="text-gray-600">List the languages you speak</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Add Language</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newLanguage.name}
                        onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., English, Spanish, Mandarin"
                    />
                    <select
                        value={newLanguage.level}
                        onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            if (newLanguage.name) {
                                addLanguage(newLanguage.name, newLanguage.level);
                                setNewLanguage({ name: '', level: 'Intermediate' });
                            }
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/30"
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="space-y-2 min-h-[100px]">
                {profile.languages?.map((lang, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <div>
                            <span className="font-semibold text-gray-900">{lang.name}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-600">{lang.level}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeLanguage(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {(!profile.languages || profile.languages.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                        <Globe className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p>Your languages will appear here</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// STEP 9: EXTRAS (Optional Sections)
case 9:
return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Sections (Optional)</h2>
            <p className="text-gray-600">Add extra information to strengthen your profile</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <p className="text-center text-gray-600 py-8">
                📌 Optional sections (Publications, Volunteering, Awards, Interests, References) coming soon!
            </p>
            <p className="text-sm text-center text-gray-500">
                You can skip this step for now and proceed to Review
            </p>
        </div>
    </div>
);
