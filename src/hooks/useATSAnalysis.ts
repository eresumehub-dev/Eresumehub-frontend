import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

import { UserProfile } from '../services/profile';

export interface ATSResult {
    score: number;
    country: string;
    jobRole: string;
    strengths: string[];
    warnings: string[];
    errors: string[];
    keywords: { found: number; recommended: number; missing: string[] };
    countrySpecific: string[];
    debug_parsed_profile?: Partial<UserProfile>;
}

const STAGES = [
    "Reading Resume Content...",
    "Scanning Country Norms...",
    "Comparing with Role Requirements...",
    "Crunching AI Analytics...",
    "Finalizing Your Report..."
];

export const useATSAnalysis = (country: string) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [results, setResults] = useState<ATSResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Stage rotation and timer logic
    useEffect(() => {
        if (!analyzing) { setElapsedTime(0); return; }
        setLoadingStage(0);
        const start = Date.now();
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - start) / 1000));
            setLoadingStage(prev => (prev + 1) % STAGES.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [analyzing]);

    const analyzeResume = useCallback(async (file: File, jobRole: string, jobDescription: string) => {
        setAnalyzing(true);
        setError(null);
        setResults(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const formData = new FormData();
            formData.append('file', file, file.name);
            formData.append('job_role', jobRole);
            formData.append('target_country', country);
            formData.append('job_description', jobDescription || '');

            const response = await api.post('/ats/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                signal: controller.signal
            });

            if (response.data.success) {
                setResults(response.data.data);
            } else {
                throw new Error(response.data.error || 'Analysis failed');
            }
        } catch (err: any) {
            console.error('ATS Analysis Error:', err);
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                setError('AI processing took too long (60s). Try again.');
            } else {
                setError(err.response?.data?.detail || err.message || 'Analysis failed');
            }
        } finally {
            clearTimeout(timeoutId);
            setAnalyzing(false);
        }
    }, [country]);

    return {
        analyzing,
        loadingStage,
        stageText: STAGES[loadingStage],
        results,
        error,
        elapsedTime,
        analyzeResume,
        setResults
    };
};
