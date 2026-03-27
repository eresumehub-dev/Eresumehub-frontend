export interface ResumeItem {
    id: string;
    title?: string;
    subtitle?: string;
    date?: string;
    description?: string; // HTML string for bullet points
    location?: string;
}

export interface ResumeSection {
    id: string;
    type: 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'custom';
    title: string;
    isVisible: boolean;
    content: string | ResumeItem[]; // String for summary, array for others
}

export interface ResumeData {
    title: string;
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
    };
    sections: ResumeSection[];
    theme: {
        color: string;
        font: string;
        layout: 'single' | 'double';
    };
}
