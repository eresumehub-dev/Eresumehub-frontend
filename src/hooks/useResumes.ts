import { useState, useCallback } from 'react';
import { getResumes, deleteResume, updateResume, Resume } from '../services/resume';

export const useResumes = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResumes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getResumes();
            // Standardize format (v3.30.0 logic)
            const list = Array.isArray(data) ? data : ((data as any).resumes || []);
            setResumes(list);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch resumes');
            setResumes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteResumeAction = async (id: string) => {
        try {
            await deleteResume(id);
            setResumes(prev => prev.filter(r => r.id !== id));
            return true;
        } catch (err) {
            console.error('Delete error:', err);
            return false;
        }
    };

    const renameResumeAction = async (id: string, newTitle: string) => {
        try {
            await updateResume(id, { title: newTitle });
            setResumes(prev => prev.map(r => r.id === id ? { ...r, title: newTitle } : r));
            return true;
        } catch (err) {
            console.error('Rename error:', err);
            return false;
        }
    };

    return {
        resumes,
        loading,
        error,
        fetchResumes,
        deleteResumeAction,
        renameResumeAction,
        setResumes
    };
};
