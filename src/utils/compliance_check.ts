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
 * Unified Market Compliance Engine (v3.2.0)
 * Mirrors Backend 'ResumeComplianceValidator' logic to ensure consistency.
 */
export const checkMarketCompliance = (
    profile: UserProfile | null, 
    country: string
): ComplianceWarning[] => {
    if (!profile) return [];

    const warnings: ComplianceWarning[] = [];
    const countryLower = country?.toLowerCase();

    // --- GERMANY (DACH) RULES ---
    if (countryLower === 'germany') {
        // 1. Date of Birth (Strictly Required in DE)
        const dob = profile.date_of_birth || (profile as any).dob;
        if (!dob || dob === "" || dob === "undefined" || dob === "null") {
            warnings.push({
                id: 'dob-missing',
                type: 'error',
                title: 'Date of Birth required',
                message: 'German market CVs strictly require Date of Birth for identification.',
                actionLabel: 'Add',
                actionLink: '/profile',
            });
        }

        // 2. Nationality (Strictly Required for Visa/Work Permit checks)
        const nationality = profile.nationality;
        if (!nationality || nationality === "" || nationality === "undefined" || nationality === "null") {
            warnings.push({
                id: 'nationality-missing',
                type: 'error',
                title: 'Nationality required',
                message: 'Nationality is mandatory for German market compliance.',
                actionLabel: 'Add',
                actionLink: '/profile',
            });
        }

        // 3. German Language Proficiency (B1+ usually required)
        const languages = (profile.languages || []) as any[];
        const germanLang = languages.find(l => {
            const name = typeof l === 'string' ? l : (l.name || l.language || '');
            return name.toLowerCase().includes('german');
        });

        if (germanLang) {
            const level = typeof germanLang === 'string' ? 'Native' : (germanLang.level || germanLang.proficiency_cefr || 'Native');
            const upper = level.toUpperCase();
            
            const cefrScore: { [key: string]: number } = {
                'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'NATIVE': 7,
                'FLUENT': 6, 'PROFICIENT': 5, 'ADVANCED': 5, 'INTERMEDIATE': 3, 'BASIC': 1, 'BEGINNER': 1
            };
            
            // Extract A1, B2, etc. using regex
            const cefrMatch = upper.match(/\b([A-C][1-2])\b/g);
            let detectedLevel = 'NATIVE';
            if (cefrMatch && cefrMatch.length > 0) {
                detectedLevel = cefrMatch.sort()[cefrMatch.length - 1].toUpperCase();
            }
            
            const userScore = cefrScore[detectedLevel] || 0;
            if (userScore > 0 && userScore < 3) { // Below B1
                warnings.push({
                    id: 'german-level-low',
                    type: 'warning',
                    title: 'German level',
                    message: `German B1+ is typically required. Detected: ${detectedLevel}.`,
                    actionLabel: 'Update',
                    actionLink: '/profile#languages',
                });
            }
        } else {
            warnings.push({
                id: 'german-missing',
                type: 'error',
                title: 'German Language required',
                message: 'CEFR German proficiency is required for German market CVs.',
                actionLabel: 'Add',
                actionLink: '/profile#languages',
            });
        }

        // 4. Photo (Warning)
        if (!profile.photo_url) {
            warnings.push({
                id: 'photo-missing',
                type: 'warning',
                title: 'Professional Photo',
                message: 'German employers expect a professional headshot.',
                actionLabel: 'Upload',
                actionLink: '/profile',
            });
        }
    }

    // --- JAPAN RULES (Functional Parity v3.2.0) ---
    if (countryLower === 'japan') {
        // 1. Self-PR (Mandatory in Japan)
        if (!profile.professional_summary && !(profile as any).self_pr) {
            warnings.push({
                id: 'self-pr-missing',
                type: 'error',
                title: 'Self-PR Required',
                message: 'A Self-PR (自己PR) section is required for Japanese market resumes.',
                actionLabel: 'Add',
                actionLink: '/profile',
            });
        }

        // 2. Motivation (Critical for Japan)
        if (!(profile as any).motivation) {
            warnings.push({
                id: 'motivation-missing',
                type: 'error',
                title: 'Motivation Required',
                message: "A Motivation section (志望動機) is critical for Japanese employers.",
                actionLabel: 'Add',
                actionLink: '/profile',
            });
        }

        // 3. Certifications (Expected by default)
        if ((!profile.educations || profile.educations.length === 0) && !(profile as any).certifications) {
            warnings.push({
                id: 'certifications-missing',
                type: 'warning',
                title: 'Certifications',
                message: 'Qualifications and Licenses are highly expected in Japanese resumes.',
                actionLabel: 'Add',
                actionLink: '/profile',
            });
        }
    }

    return warnings;
};
