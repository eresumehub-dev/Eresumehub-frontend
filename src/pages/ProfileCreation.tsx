import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { getProfile, createOrUpdateProfile, createProfileFromResume, UserProfile } from '../services/profile';
import { getAvailableCountries } from '../services/schema';

const ProfileCreation: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Profile state
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        full_name: '',
        email: user?.email || '',
        phone: '',
        city: '',
        country: '',
        linkedin_url: '',
        professional_summary: '',
        motivation: '',
        self_pr: '',
        skills: [],
        languages: [],
        work_experiences: [],
        educations: []
    });

    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    // Temporary state for adding items
    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Intermediate' });

    useEffect(() => {
        loadProfile();
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        const countries = await getAvailableCountries();
        setAvailableCountries(countries);
    };

    const loadProfile = async () => {
        try {
            const { profile: existingProfile, exists } = await getProfile();
            if (exists && existingProfile) {
                setProfile(existingProfile);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setError('');

        try {
            const { profile: importedProfile } = await createProfileFromResume(file);
            setProfile(importedProfile);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError('Failed to import resume. Please try again.');
        } finally {
            setImporting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createOrUpdateProfile(profile);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err: any) {
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        if (newSkill && !profile.skills?.includes(newSkill)) {
            setProfile({
                ...profile,
                skills: [...(profile.skills || []), newSkill]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setProfile({
            ...profile,
            skills: profile.skills?.filter(s => s !== skill)
        });
    };

    const addLanguage = () => {
        if (newLanguage.name) {
            setProfile({
                ...profile,
                languages: [...(profile.languages || []), newLanguage]
            });
            setNewLanguage({ name: '', level: 'Intermediate' });
        }
    };

    const removeLanguage = (index: number) => {
        setProfile({
            ...profile,
            languages: profile.languages?.filter((_, i) => i !== index)
        });
    };

    const addWorkExperience = () => {
        setProfile({
            ...profile,
            work_experiences: [
                ...(profile.work_experiences || []),
                {
                    job_title: '',
                    company: '',
                    location: '',
                    start_date: '',
                    end_date: '',
                    is_current: false,
                    achievements: ['']
                }
            ]
        });
    };

    const updateWorkExperience = (index: number, field: string, value: any) => {
        const updated = [...(profile.work_experiences || [])];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, work_experiences: updated });
    };

    const removeWorkExperience = (index: number) => {
        setProfile({
            ...profile,
            work_experiences: profile.work_experiences?.filter((_, i) => i !== index)
        });
    };

    const addEducation = () => {
        setProfile({
            ...profile,
            educations: [
                ...(profile.educations || []),
                {
                    degree: '',
                    field_of_study: '',
                    institution: '',
                    location: '',
                    graduation_date: '',
                    gpa: ''
                }
            ]
        });
    };

    const updateEducation = (index: number, field: string, value: any) => {
        const updated = [...(profile.educations || [])];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, educations: updated });
    };

    const removeEducation = (index: number) => {
        setProfile({
            ...profile,
            educations: profile.educations?.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Profile</h1>
                    <p className="text-gray-600">Fill out your information once, generate unlimited resumes</p>

                    {/* Import Resume Button */}
                    <div className="mt-4">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-600 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="font-medium">Import from Existing Resume (PDF/DOCX)</span>
                            <input type="file" accept=".pdf,.docx" onChange={handleImportResume} className="hidden" />
                        </label>
                        {importing && <p className="text-sm text-gray-600 mt-2">Importing... this may take a moment</p>}
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">Profile saved successfully!</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-800">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={profile.city}
                                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select
                                    value={profile.country}
                                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    {availableCountries.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={profile.linkedin_url}
                                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={profile.professional_summary}
                                    onChange={(e) => setProfile({ ...profile, professional_summary: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    placeholder="Brief overview of your professional background..."
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Self-PR (自己PR)</label>
                                    <textarea
                                        rows={2}
                                        value={profile.self_pr}
                                        onChange={(e) => setProfile({ ...profile, self_pr: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                        placeholder="Specific strengths for Japan market..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivation (志望動機)</label>
                                    <textarea
                                        rows={2}
                                        value={profile.motivation}
                                        onChange={(e) => setProfile({ ...profile, motivation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                        placeholder="Why do you want this role?"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Work Experience */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                            <button
                                type="button"
                                onClick={addWorkExperience}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add Experience
                            </button>
                        </div>

                        {profile.work_experiences?.map((exp, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-gray-900">Experience #{index + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeWorkExperience(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Job Title *"
                                        value={exp.job_title}
                                        onChange={(e) => updateWorkExperience(index, 'job_title', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Company *"
                                        value={exp.company}
                                        onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={exp.location}
                                        onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="month"
                                            placeholder="Start Date"
                                            value={exp.start_date}
                                            onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                        <input
                                            type="month"
                                            placeholder="End Date"
                                            value={exp.end_date}
                                            onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)}
                                            disabled={exp.is_current}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={exp.is_current}
                                            onChange={(e) => updateWorkExperience(index, 'is_current', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm text-gray-700">I currently work here</span>
                                    </label>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements (one per line)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="• Led a team of 5 engineers&#10;• Increased performance by 40%&#10;• Implemented new CI/CD pipeline"
                                        value={(exp.achievements || []).join('\n')}
                                        onChange={(e) => updateWorkExperience(index, 'achievements', e.target.value.split('\n').filter(a => a.trim()))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        ))}

                        {(!profile.work_experiences || profile.work_experiences.length === 0) && (
                            <p className="text-gray-500 text-center py-8">No work experience added yet. Click "Add Experience" to get started.</p>
                        )}
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Education</h2>
                            <button
                                type="button"
                                onClick={addEducation}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add Education
                            </button>
                        </div>

                        {profile.educations?.map((edu, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-gray-900">Education #{index + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeEducation(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Degree *"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Field of Study"
                                        value={edu.field_of_study}
                                        onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Institution *"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={edu.location}
                                        onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="month"
                                        placeholder="Graduation Date"
                                        value={edu.graduation_date}
                                        onChange={(e) => updateEducation(index, 'graduation_date', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="GPA (optional)"
                                        value={edu.gpa}
                                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        ))}

                        {(!profile.educations || profile.educations.length === 0) && (
                            <p className="text-gray-500 text-center py-8">No education added yet. Click "Add Education" to get started.</p>
                        )}
                    </div>

                    {/* Skills & Languages */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Languages</h2>

                        {/* Skills */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Add a skill (e.g., Python, Project Management)"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map((skill, index) => (
                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newLanguage.name}
                                    onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Language name"
                                />
                                <select
                                    value={newLanguage.level}
                                    onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                                    className="px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="Native">Native</option>
                                    <option value="Fluent">Fluent</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Basic">Basic</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={addLanguage}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {profile.languages?.map((lang, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-gray-900">{lang.name} - <span className="text-gray-600">{lang.level}</span></span>
                                        <button type="button" onClick={() => removeLanguage(index)} className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileCreation;
