import { useCallback, useMemo } from 'react';
import { UserProfile } from '../../../services/profile';
import { checkMarketCompliance, ComplianceWarning } from '../../../utils/compliance_check';

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

    // 1. Compliance Logic (Refactored to shared utility v3.2.0)
    const generateComplianceWarnings = useCallback((userProfile: UserProfile, targetCountry: string) => {
        const newWarnings = checkMarketCompliance(userProfile, targetCountry);
        
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
