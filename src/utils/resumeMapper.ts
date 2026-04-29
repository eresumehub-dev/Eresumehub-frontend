import { UserProfile } from '../services/profile';
import { ResumeData, ResumeSection, ResumeItem } from '../types/resume';
import { v4 as uuidv4 } from 'uuid';

export const profileToResume = (profile: UserProfile): ResumeData => {
    const sections: ResumeSection[] = [];

    // Summary
    if (profile.professional_summary) {
        sections.push({
            id: 'summary',
            type: 'summary',
            title: 'Professional Summary',
            isVisible: true,
            content: profile.professional_summary
        });
    }

    // Experience
    if (profile.work_experiences && profile.work_experiences.length > 0) {
        const experienceItems: ResumeItem[] = profile.work_experiences.map(exp => ({
            id: exp.id || uuidv4(),
            title: exp.job_title,
            subtitle: exp.company,
            date: `${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date || ''}`,
            location: exp.location,
            description: exp.achievements || []
        }));

        sections.push({
            id: 'experience',
            type: 'experience',
            title: 'Work Experience',
            isVisible: true,
            content: experienceItems
        });
    }

    // Education
    if (profile.educations && profile.educations.length > 0) {
        const educationItems: ResumeItem[] = profile.educations.map(edu => ({
            id: edu.id || uuidv4(),
            title: edu.degree,
            subtitle: edu.institution,
            date: edu.graduation_date,
            location: edu.location,
            field_of_study: edu.field_of_study,
            gpa: edu.gpa
        }));

        sections.push({
            id: 'education',
            type: 'education',
            title: 'Education',
            isVisible: true,
            content: educationItems
        });
    }

    // Skills
    if (profile.skills && profile.skills.length > 0) {
        sections.push({
            id: 'skills',
            type: 'skills',
            title: 'Skills',
            isVisible: true,
            content: profile.skills.join(', ')
        });
    }

    // Default sections if empty
    if (sections.length === 0) {
        // Add default empty sections structure
        sections.push(
            { id: 'summary', type: 'summary', title: 'Professional Summary', isVisible: true, content: '' },
            { id: 'experience', type: 'experience', title: 'Work Experience', isVisible: true, content: [] },
            { id: 'education', type: 'education', title: 'Education', isVisible: true, content: [] },
            { id: 'skills', type: 'skills', title: 'Skills', isVisible: true, content: '' }
        );
    }

    return {
        id: uuidv4(),
        title: profile.full_name ? `${profile.full_name}'s Resume` : 'My Resume',
        personalInfo: {
            fullName: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: [profile.city, profile.country].filter(Boolean).join(', ')
        },
        sections: sections,
        theme: {
            color: '#3b82f6',
            font: 'Inter',
            layout: 'single'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
};

export const resumeToProfile = (resume: ResumeData): Partial<UserProfile> => {
    const profile: Partial<UserProfile> = {
        full_name: resume.personalInfo.fullName,
        email: resume.personalInfo.email,
        phone: resume.personalInfo.phone,
        // Location parsing is tricky, just saving as city for now if simple
        city: resume.personalInfo.location.split(',')[0]?.trim(),
        country: resume.personalInfo.location.split(',')[1]?.trim()
    };

    // Summary
    const summarySection = resume.sections.find(s => s.type === 'summary');
    if (summarySection && typeof summarySection.content === 'string') {
        profile.professional_summary = summarySection.content;
    }

    // Skills
    const skillsSection = resume.sections.find(s => s.type === 'skills');
    if (skillsSection && typeof skillsSection.content === 'string') {
        profile.skills = skillsSection.content.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Experience
    const experienceSection = resume.sections.find(s => s.type === 'experience');
    if (experienceSection && Array.isArray(experienceSection.content)) {
        profile.work_experiences = experienceSection.content.map(item => {
            // Fix: Split by " - " to avoid breaking YYYY-MM-DD dates
            const dates = (item.date || '').split(' - ').map(d => d.trim());
            // Staff+ Recovery (v16.5.0): Fallback for manual edits or AI-generated non-standard separators
            const safeDates = dates.length === 1
                ? dates[0].split(/\s*(?:-|to|~)\s*/i).map(d => d.trim())
                : dates;

            return {
                job_title: item.title || '',
                company: item.subtitle || '',
                location: item.location,
                start_date: safeDates[0] || '',
                end_date: safeDates[1] === 'Present' ? undefined : safeDates[1],
                is_current: safeDates[1] === 'Present',
                achievements: item.description || []
            };
        });
    }

    // Education
    const educationSection = resume.sections.find(s => s.type === 'education');
    if (educationSection && Array.isArray(educationSection.content)) {
        profile.educations = educationSection.content.map(item => ({
            degree: item.title || '',
            institution: item.subtitle || '',
            location: item.location,
            graduation_date: item.date,
            field_of_study: item.field_of_study,
            gpa: item.gpa
        }));
    }

    return profile;
};
