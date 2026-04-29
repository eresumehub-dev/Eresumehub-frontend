export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
}

export interface ResumeItem {
    id: string;
    title?: string;
    subtitle?: string;
    date?: string;
    description?: string[]; // Standardized to array for consistency
    location?: string;
    field_of_study?: string;
    gpa?: string;
}

export interface ResumeSection {
    id: string;
    type: 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'custom';
    title: string;
    isVisible: boolean;
    content: string | ResumeItem[];
}

export interface ResumeData {
    id?: string;
    title: string;
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
    score?: number;
    full_name?: string;
    summary_text?: string;
    original_pdf_url?: string;
    theme: {
        color: string;
        font: string;
        layout: 'single' | 'double';
    };
    created_at: string;
    updated_at: string;
}
