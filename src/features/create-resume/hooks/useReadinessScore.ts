import { useCallback, useMemo, useState, useEffect } from 'react';
import { UserProfile } from '../../../services/profile';
import { evaluateMarketRules, ComplianceWarning } from '../../../utils/compliance_check';
import { getCountrySchema } from '../../../services/schema';
import { useDebounce } from '../../../hooks/useDebounce';

export interface ReadinessScoreResult {
    readinessScore: number;
    projectedAtsScore: number;
    interpretation: {
        label: string;
        color: string;
        guidance: string;
    };
    warnings: ComplianceWarning[];
    isEvaluatingRules?: boolean;
    schema: any;
}


export const useReadinessScore = (
    profile: UserProfile | null,
    jobTitle: string,
    jobDescription: string,
    country: string,
    dismissedWarnings: Set<string>
) => {
    const [schema, setSchema] = useState<any>(null);
    const [isLoadingRules, setIsLoadingRules] = useState(false);

    useEffect(() => {
        let active = true;
        if (!country) {
            setSchema(null);
            return;
        }
        setIsLoadingRules(true);
        getCountrySchema(country).then(data => {
            if (active) {
                setSchema(data);
                setIsLoadingRules(false);
            }
        });
        return () => { active = false; };
    }, [country]);

    // 1. Compliance Logic (Refactored to dynamic rule evaluation)
    const generateComplianceWarnings = useCallback((userProfile: UserProfile, schemaData: any) => {
        if (!schemaData) return [];
        const newWarnings = evaluateMarketRules(userProfile, schemaData);
        const filtered = newWarnings.filter(w => !dismissedWarnings.has(w.id));
        return filtered;
    }, [dismissedWarnings]);

    // 2. Main Memoized Calculation
    const debouncedJD = useDebounce(jobDescription, 500);

    const result = useMemo((): ReadinessScoreResult => {
        if (!profile) return { 
            readinessScore: 0, 
            projectedAtsScore: 0, 
            interpretation: { label: 'Incomplete', color: 'slate', guidance: 'Define your role to start.' }, 
            warnings: [],
            isEvaluatingRules: false,
            schema: null
        };

        const activeWarnings = generateComplianceWarnings(profile, schema);
        const hasErrors = Array.isArray(activeWarnings) && activeWarnings.some(w => w.type === 'error');

        // Readiness Score
        let rScore = 100;
        if (!profile.full_name) rScore -= 10;
        if (!profile.email) rScore -= 10;
        if ((Array.isArray(profile.work_experiences) ? profile.work_experiences.length : 0) === 0) rScore -= 20;
        
        const skillsCount = Array.isArray(profile.skills) ? profile.skills.length : 0;
        if (skillsCount === 0) rScore -= 15;
        
        if ((Array.isArray(profile.educations) ? profile.educations.length : 0) === 0) rScore -= 10;
        rScore -= (Array.isArray(activeWarnings) ? activeWarnings.length : 0) * 5;
        
        // --- v3.5.0 Hard Compliance Cap ---
        if (hasErrors) {
            rScore = Math.min(60, rScore);
        }
        
        rScore = Math.max(0, Math.min(100, rScore));

        // ATS Score
        let ats = 85;
        const expCount = Array.isArray(profile.work_experiences) ? profile.work_experiences.length : 0;
        if (expCount === 0) ats -= 20;
        else if (expCount > 1) ats += 5;
        
        if (skillsCount === 0) ats -= 15;
        else if (skillsCount > 5) ats += 5;

        if (!profile.professional_summary) ats -= 10;

        if (debouncedJD.trim().length > 20) {
            const jdLower = debouncedJD.toLowerCase();
            const profileSkills = (Array.isArray(profile.skills) ? profile.skills : []).map(s => String(s).toLowerCase());
            let matches = 0;
            profileSkills.forEach(skill => { if (jdLower.includes(skill)) matches++; });
            const matchRatio = Math.min(1, matches / 5); 
            ats = 60 + (matchRatio * 35);
        }
        
        if (hasErrors) ats -= 20;
        ats = Math.floor(Math.max(0, Math.min(99, ats)));

        // Interpretation (High Priority for Errors)
        let interpretation = { label: 'Incomplete', color: 'slate', guidance: 'Define your role to start.' };
        
        if (hasErrors) {
            interpretation = { 
                label: 'Market Alert', 
                color: 'amber', 
                guidance: `Missing mandatory sections for ${country}. Check the checklist.` 
            };
        } else {
            if (rScore > 40) interpretation = { label: 'Needs Focus', color: 'amber', guidance: 'Add a job description to improve matching.' };
            if (rScore > 70) interpretation = { label: 'Ready to Launch', color: 'blue', guidance: 'Good — ready for a standard application.' };
            if (rScore > 85) interpretation = { label: 'Elite Match', color: 'emerald', guidance: 'Optimized for maximum ATS performance.' };
        }

        return {
            readinessScore: rScore,
            projectedAtsScore: ats,
            interpretation,
            warnings: Array.isArray(activeWarnings) ? activeWarnings : [],
            isEvaluatingRules: isLoadingRules,
            schema
        };
    }, [profile, schema, isLoadingRules, jobTitle, debouncedJD, country, generateComplianceWarnings]);

    return result;
};
