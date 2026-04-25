import { UserProfile } from '../services/profile';

export interface ComplianceWarning {
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
    actionLink?: string;
}

/**
 * Basic Completeness Check (Dashboard use)
 * Ensures standard fields are present before showing health stats.
 */
export const checkBasicCompleteness = (profile: UserProfile | null): ComplianceWarning[] => {
    if (!profile) return [];
    const warnings: ComplianceWarning[] = [];
    if (!profile.full_name?.trim()) {
        warnings.push({
            id: 'basic-name', type: 'error', title: 'Name Required',
            message: 'Your full name is required for any resume.',
            actionLabel: 'Add', actionLink: '/profile'
        });
    }
    if (!profile.email?.trim()) {
        warnings.push({
            id: 'basic-email', type: 'error', title: 'Email Required',
            message: 'An email address is required so employers can contact you.',
            actionLabel: 'Add', actionLink: '/profile'
        });
    }
    if (!profile.work_experiences || profile.work_experiences.length === 0) {
        warnings.push({
            id: 'basic-experience', type: 'warning', title: 'Experience Recommended',
            message: 'Adding work experience significantly improves your resume score.',
            actionLabel: 'Add', actionLink: '/profile'
        });
    }
    return warnings;
};

/**
 * Dynamic Market Compliance Engine
 * Uses the RAG JSON knowledge_base schema dynamically to enforce regional rules.
 */
export const evaluateMarketRules = (profile: UserProfile | null, schema: any): ComplianceWarning[] => {
    if (!profile || !schema) return [];
    
    const warnings: ComplianceWarning[] = [];
    const country = schema.country || 'Target market';

    // 1. Basic Identity Check (Mandatory for all RAG-enabled countries)
    if (!profile.full_name?.trim()) {
        warnings.push({
            id: 'basic-name', type: 'error', title: 'Name Required',
            message: 'Your full name is required for any resume.',
            actionLabel: 'Add', actionLink: '/profile'
        });
    }

    // 2. Parse Mandatory Personal Info from RAG
    const cvStructure = schema.cv_structure || {};
    const mandatorySections = cvStructure.mandatory_sections || {};
    const personalInfo = mandatorySections.personal_info || {};
    const requiredPersonalInfo: string[] = Array.isArray(personalInfo.required) ? personalInfo.required : [];

    const checkRequired = (keyword: string) => 
        requiredPersonalInfo.some(req => typeof req === 'string' && req.toLowerCase().includes(keyword.toLowerCase()));

    // Date of Birth
    if (checkRequired('date of birth') || checkRequired('dob')) {
        const dob = profile.date_of_birth;
        if (!dob || dob.trim() === "") {
            warnings.push({
                id: 'dob-missing', type: 'error', title: 'Date of Birth Required',
                message: `${country} standard CVs strictly require a Date of Birth for identification.`,
                actionLabel: 'Add', actionLink: '/profile'
            });
        }
    }

    // Nationality
    if (checkRequired('nationality')) {
        const nationality = profile.nationality;
        if (!nationality || nationality.trim() === "") {
            warnings.push({
                id: 'nationality-missing', type: 'error', title: 'Nationality Required',
                message: `Nationality is mandatory in ${country} to clarify work permit and visa status.`,
                actionLabel: 'Add', actionLink: '/profile'
            });
        }
    }

    // Location
    const headerReqs = Array.isArray(cvStructure.header?.required) ? cvStructure.header.required : [];
    const allContactReqs = [...requiredPersonalInfo, ...headerReqs];
    const locationRequired = allContactReqs.some(k => typeof k === 'string' && ['City', 'Location', 'Current City and State'].includes(k));
    
    if (locationRequired) {
        const city = profile.city || (profile as any).location;
        if (!city || city.trim().length < 2) {
            warnings.push({
                id: 'location-missing', type: 'error', title: 'Location Required',
                message: `City/Location is required for ${country} resumes.`,
                actionLabel: 'Add', actionLink: '/profile'
            });
        }
    }

    // Professional Photo
    if (checkRequired('photo') && !profile.photo_url) {
        warnings.push({
            id: 'photo-missing', type: 'warning', title: 'Professional Photo Recommended',
            message: `${country} employers typically expect a professional headshot.`,
            actionLabel: 'Upload', actionLink: '/profile'
        });
    }

    // 3. Structural Content Parsing
    const order: string[] = Array.isArray(cvStructure.order) ? cvStructure.order : [];
    const requiresSelfPr = order.some(o => typeof o === 'string' && (o.toLowerCase().includes('self-pr') || o.includes('自己PR')));
    const requiresMotivation = order.some(o => typeof o === 'string' && (o.toLowerCase().includes('motivation') || o.includes('志望動機')));

    if (requiresSelfPr) {
        if (!profile.professional_summary?.trim()) {
            warnings.push({
                id: 'self-pr-missing', type: 'error', title: 'Summary Required',
                message: `A Professional Summary is mandatory for ${country} market resumes.`,
                actionLabel: 'Add', actionLink: '/profile'
            });
        }
    }

    if (requiresMotivation && !(profile as any).motivation?.trim()) {
        warnings.push({
            id: 'motivation-missing', type: 'error', title: 'Motivation Required',
            message: `A Motivation section (志望動機) is a critical requirement for ${country}.`,
            actionLabel: 'Add', actionLink: '/profile'
        });
    }

    // Education
    if (mandatorySections.education || order.some(o => typeof o === 'string' && o.toLowerCase().includes('education'))) {
        const educations = Array.isArray(profile.educations) ? profile.educations : (Array.isArray((profile as any).education) ? (profile as any).education : []);
        if (!educations || educations.length === 0) {
            warnings.push({
                id: 'education-missing', type: 'error', title: 'Education Required',
                message: `Education history is a mandatory section for ${country} resumes.`,
                actionLabel: 'Add', actionLink: '/profile'
            });
        }
    }

    // 4. Required Languages Check (Mirroring Backend Logic)
    const requiredLanguages: string[] = Array.isArray(schema.required_languages) ? schema.required_languages : [];
    const userLangs = (Array.isArray(profile.languages) ? profile.languages : []).map((l: any) => 
        (typeof l === 'string' ? l : (l?.name || l?.language || '')).toLowerCase()
    );

    requiredLanguages.forEach(langReq => {
        const hasLang = userLangs.some(ul => typeof ul === 'string' && ul.includes(langReq.toLowerCase()));

        if (!hasLang) {
            warnings.push({
                id: `language-missing-${langReq.toLowerCase()}`, type: 'error', title: `${langReq} Required`,
                message: `${langReq} language proficiency is required in ${country}. Please add it to your profile.`,
                actionLabel: 'Add', actionLink: '/profile'
            });
        }
    });

    return warnings;
};
