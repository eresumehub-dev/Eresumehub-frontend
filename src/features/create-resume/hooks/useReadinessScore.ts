import { useCallback, useMemo } from 'react';
import { UserProfile } from '../../../services/profile';

export interface ComplianceWarning {
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
    actionLink?: string;
}

export interface ReadinessScoreResult {
    readinessScore: number;
    projectedAtsScore: number;
    interpretation: {
        label: string;
        color: string;
        guidance: string;
    };
    warnings: ComplianceWarning[];
}

export const useReadinessScore = (
    profile: UserProfile | null,
    jobTitle: string,
    jobDescription: string,
    country: string,
    dismissedWarnings: Set<string>
) => {
    // 🧪 DEBUG: v3.1.4b Hook entry (CACHE BUSTER)
    console.warn("🚨 [v3.1.4-2200] HOOK CALLED", { targetCountry: country });

    // 🧪 DEBUG: v3.1.3 Entry Trace
    console.warn("🚨 useReadinessScore HOOK RUNNING", {
        targetCountry: country,
        userProfile: profile
    });

    // 1. Compliance Logic (Internal helper)
    const generateComplianceWarnings = useCallback((userProfile: UserProfile, targetCountry: string) => {
        const newWarnings: ComplianceWarning[] = [];
        const countryLower = targetCountry?.toLowerCase();

        // 🧪 DEBUG: v3.1.3 Logic Trace
        console.log("🌍 Country detected:", countryLower);
        console.log("🧪 Fields check:", {
            dob: userProfile?.date_of_birth || (userProfile as any)?.dob,
            nationality: userProfile?.nationality,
            languages: userProfile?.languages
        });

        if (countryLower === 'germany') {
            console.log(`[useReadinessScore] 🇩🇪 Germany compliance detected.`);
            
            const dob = userProfile.date_of_birth || (userProfile as any).dob;
            const nationality = userProfile.nationality;

            if (!dob || dob === "" || dob === "undefined" || dob === "null") {
                console.warn(`[useReadinessScore] 🔴 DOB missing or invalid (fallback checked): ${dob}`);
                const w: ComplianceWarning = {
                    id: 'dob-missing',
                    type: 'error',
                    title: 'Date of Birth required',
                    message: 'Date of Birth is strictly required for German market CVs.',
                    actionLabel: 'Add',
                    actionLink: '/profile',
                };
                console.log("Pushing warning:", w.id);
                newWarnings.push(w);
            }
            if (!nationality || nationality === "" || nationality === "undefined" || nationality === "null") {
                console.warn(`[useReadinessScore] 🔴 Nationality missing or invalid: ${nationality}`);
                const w: ComplianceWarning = {
                    id: 'nationality-missing',
                    type: 'error',
                    title: 'Nationality required',
                    message: 'Nationality is strictly required for German market CVs.',
                    actionLabel: 'Add',
                    actionLink: '/profile',
                };
                console.log("Pushing warning:", w.id);
                newWarnings.push(w);
            }
            if (!userProfile.photo_url) {
                newWarnings.push({
                    id: 'photo-missing',
                    type: 'warning',
                    title: 'Professional Photo',
                    message: 'German employers expect a professional headshot.',
                    actionLabel: 'Upload',
                    actionLink: '/profile',
                });
            }

            const languages = (userProfile.languages || []) as any[];
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
                const cefrMatch = upper.match(/\b([A-C][1-2])\b/g);
                let detectedLevel = 'NATIVE';
                if (cefrMatch && cefrMatch.length > 0) detectedLevel = cefrMatch.sort()[cefrMatch.length - 1].toUpperCase();
                
                const userScore = cefrScore[detectedLevel] || 0;
                if (userScore > 0 && userScore < 3) {
                    newWarnings.push({
                        id: 'german-level-low',
                        type: 'warning',
                        title: 'German level',
                        message: `B1+ typically required. Detected: ${detectedLevel}.`,
                        actionLabel: 'Update',
                        actionLink: '/profile#languages',
                    });
                }
            } else {
                newWarnings.push({
                    id: 'german-missing',
                    type: 'error',
                    title: 'German Language required',
                    message: 'CEFR German proficiency is required. Add it to languages.',
                    actionLabel: 'Add',
                    actionLink: '/profile#languages',
                });
            }

            if (!userProfile.educations || userProfile.educations.length === 0) {
                const text = (userProfile.professional_summary || '') + ' ' + (userProfile.work_experiences?.map(e => e.achievements.join(' ')).join(' ') || '');
                const eduKeywords = ['bachelor', 'university', 'degree', 'master', 'phd', 'mba', 'b.tech', 'diploma'];
                if (eduKeywords.some(kw => text.toLowerCase().includes(kw))) {
                    newWarnings.push({
                        id: 'education-detected',
                        type: 'warning',
                        title: 'Education',
                        message: 'Keywords detected but no education entries.',
                        actionLabel: 'Add',
                        actionLink: '/profile#education',
                    });
                }
            }
        }

        const filtered = newWarnings.filter(w => !dismissedWarnings.has(w.id));
        
        // 🧪 DEBUG: v3.1.3 Result Trace
        console.warn("⚠️ Generated warnings:", filtered);
        
        return filtered;
    }, [dismissedWarnings]);

    // 2. Main Memoized Calculation
    const result = useMemo((): ReadinessScoreResult => {
        if (!profile) return { 
            readinessScore: 0, 
            projectedAtsScore: 0, 
            interpretation: { label: 'Incomplete', color: 'gray', guidance: 'Define your role to start.' }, 
            warnings: [] 
        };

        const activeWarnings = generateComplianceWarnings(profile, country);

        // Readiness Score
        let rScore = 100;
        if (!profile.full_name) rScore -= 10;
        if (!profile.email) rScore -= 10;
        if ((profile.work_experiences?.length || 0) === 0) rScore -= 20;
        if ((profile.skills?.length || 0) === 0) rScore -= 15;
        if ((profile.educations?.length || 0) === 0) rScore -= 10;
        rScore -= (activeWarnings.length * 5);
        rScore = Math.max(0, Math.min(100, rScore));

        // ATS Score
        let ats = 85;
        if ((profile.work_experiences?.length || 0) === 0) ats -= 20;
        else if ((profile.work_experiences?.length || 0) > 1) ats += 5;
        
        if ((profile.skills?.length || 0) === 0) ats -= 15;
        else if ((profile.skills?.length || 0) > 5) ats += 5;

        if (!profile.professional_summary) ats -= 10;

        if (jobDescription.trim().length > 20) { // Lowered threshold for meaningful matching
            const jdLower = jobDescription.toLowerCase();
            const profileSkills = (profile.skills || []).map(s => s.toLowerCase());
            let matches = 0;
            profileSkills.forEach(skill => { if (jdLower.includes(skill)) matches++; });
            const matchRatio = Math.min(1, matches / 5); 
            // Scale dynamically between 60 (bad match) and 95 (hub match)
            ats = 60 + (matchRatio * 35);
        }
        
        if (activeWarnings.some(w => w.type === 'error')) ats -= 20;
        if (activeWarnings.some(w => w.type === 'warning')) ats -= 5;
        ats = Math.floor(Math.max(0, Math.min(99, ats)));

        // Interpretation
        let interpretation = { label: 'Incomplete', color: 'slate', guidance: 'Define your role to start.' };
        if (rScore > 40) interpretation = { label: 'Needs Focus', color: 'amber', guidance: 'Add a job description to improve matching.' };
        if (rScore > 70) interpretation = { label: 'Ready to Launch', color: 'blue', guidance: 'Good — ready for a standard application.' };
        if (rScore > 85) interpretation = { label: 'Elite Match', color: 'emerald', guidance: 'Optimized for maximum ATS performance.' };

        return {
            readinessScore: rScore,
            projectedAtsScore: ats,
            interpretation,
            warnings: activeWarnings
        };
    }, [profile, country, jobTitle, jobDescription, generateComplianceWarnings]);

    return result;
};
