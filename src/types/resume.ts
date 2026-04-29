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

export interface TextSection {
    id: string;
    type: 'summary' | 'skills';
    title: string;
    isVisible: boolean;
    content: string;
}

export interface ItemSection {
    id: string;
    type: 'experience' | 'education' | 'projects' | 'custom';
    title: string;
    isVisible: boolean;
    content: ResumeItem[];
}

export type ResumeSection = TextSection | ItemSection;

export interface ResumeData {
    id: string;
    title: string;
    personalInfo: PersonalInfo;
    sections: ResumeSection[];
    theme: {
        color: string;
        font: string;
        layout: 'single' | 'double'; // Currently only 'single' and 'double' native layouts are supported
    };
    created_at: string;
    updated_at: string;
}
