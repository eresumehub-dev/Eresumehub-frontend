import api from './api';

export interface WorkExperience {
    id?: string;
    job_title: string;
    company: string;
    city?: string;
    country?: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    achievements: string[];
    display_order?: number;
}

export interface Education {
    id?: string;
    degree: string;
    field_of_study?: string;
    institution: string;
    city?: string;
    country?: string;
    location?: string;
    graduation_date?: string;
    gpa?: string;
    display_order?: number;
}

export interface Project {
    id?: string;
    title: string;
    description?: string;
    technologies?: string[];
    link?: string;
    role?: string;
    start_date?: string;
    end_date?: string;
    display_order?: number;
}

export interface Certification {
    id?: string;
    name: string;
    issuing_organization: string;
    issue_date: string;
    expiration_date?: string;
    credential_id?: string;
    credential_url?: string;
    display_order?: number;
}

export interface ProfileExtras {
    publications?: Array<{
        title: string;
        publisher: string;
        date: string;
        url?: string;
    }>;
    volunteering?: Array<{
        organization: string;
        role: string;
        start_date: string;
        end_date?: string;
        description: string;
    }>;
    awards?: Array<{
        title: string;
        issuer: string;
        date: string;
        description?: string;
    }>;
    interests?: string[];
    references?: Array<{
        name: string;
        title: string;
        company: string;
        email: string;
        phone?: string;
    }>;
}

export interface UserProfile {
    id?: string;
    user_id?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
    linkedin_url?: string;
    photo_url?: string;
    date_of_birth?: string;
    nationality?: string;
    professional_summary?: string;
    motivation?: string;
    self_pr?: string;
    skills?: string[];
    languages?: Array<{ name: string; level: string }>;
    links?: Array<{ label: string; url: string }>;
    work_experiences?: WorkExperience[];
    educations?: Education[];
    projects?: Project[];
    certifications?: Certification[];
    extras?: ProfileExtras;
    created_at?: string;
    updated_at?: string;
}

export const getProfile = async (): Promise<{ profile: UserProfile | null; exists: boolean }> => {
    const response = await api.get('/profile');
    return response.data;
};

export const createOrUpdateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.post('/profile', profileData);
    return response.data.profile;
};

export const getProfileCompletion = async (): Promise<{ completion_percentage: number }> => {
    const response = await api.get('/profile/completion');
    return response.data;
};

export const uploadProfilePicture = async (file: File): Promise<{ photo_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/profile/upload-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const createProfileFromResume = async (file: File): Promise<{ profile: UserProfile; message: string; warnings?: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/profile/from-resume', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const improveResume = async (
    file: File,
    country: string,
    jobDescription: string
): Promise<{ improved_text: string; original_text: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('country', country);
    formData.append('job_description', jobDescription);

    const response = await api.post('/resume/improve', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const generateSummary = async (profileData: Partial<UserProfile>): Promise<{ summary: string }> => {
    const response = await api.post('/profile/generate-summary', profileData);
    return response.data;
};
