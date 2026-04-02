import api from './api';

export interface Resume {
    id: string;
    title: string;
    slug: string;
    country: string;
    language: string;
    template_style: string;
    pdf_url?: string;
    created_at: string;
    updated_at?: string;
    resume_data: any;
    thumbnail_url?: string;
    view_count?: number;
    download_count?: number;
    visibility?: 'public' | 'unlisted' | 'private';
    is_default?: boolean;
    archived_at?: string;
    parent_resume_id?: string;
    regenerate_pdf?: boolean;
}

export interface JobStatusResponse {
    job_id: string;
    status: 'queued' | 'started' | 'deferred' | 'finished' | 'failed' | 'stopped' | 'canceled';
    progress: number;
    step: string;
    result?: Resume;
    error?: string;
    request_id: string;
}

export const getResumes = async () => {
    const response = await api.get<{ success: boolean; data: { resumes: Resume[] } }>('/resumes');
    return response.data.data.resumes;
};

export const getResume = async (id: string) => {
    const response = await api.get<{ success: boolean; data: Resume }>(`/resumes/${id}`);
    return response.data.data;
};

export const updateResume = async (id: string, data: Partial<Resume>): Promise<Resume> => {
    const response = await api.patch(`/resumes/${id}`, data);
    return response.data.data;
};

export const deleteResume = async (id: string): Promise<boolean> => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
};

export const createResume = async (data: any): Promise<{ success: boolean; data: { id: string }; job_id?: string }> => {
    const response = await api.post('/resume/create', data);
    return response.data;
};

/**
 * Elite Recursive Polling Engine (v3.9.0)
 * Uses recursive setTimeout instead of setInterval to prevent request stacking.
 * Includes a 5-minute (300s) watchdog safety.
 */
export const pollJobStatus = (
    jobId: string,
    onProgress?: (progress: number, step: string) => void,
    intervalMs: number = 2000
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const WATCHDOG_LIMIT_MS = 300000; // 5 minutes

        const poll = async () => {
            // 1. Safety Check: Watchdog
            if (Date.now() - startTime > WATCHDOG_LIMIT_MS) {
                return reject(new Error("GENERATION_TIMEOUT: Pipeline took too long to respond."));
            }

            try {
                const response = await api.get(`/jobs/${jobId}`);
                const { status, progress, step, data, error } = response.data;

                if (onProgress) onProgress(progress, step);

                // 2. Terminal States
                if (status === 'completed') {
                    if (onProgress) onProgress(100, "Completed");
                    return resolve(data);
                }

                if (status === 'failed') {
                    return reject(new Error(error || "JOB_FAILED: The background worker encountered a fatal error."));
                }

                // 3. Recursive Step: Wait for the next beat
                setTimeout(poll, intervalMs);
            } catch (err: any) {
                // Handle 404s or network drops gracefully for 3 retries
                console.error("Polling error:", err);
                setTimeout(poll, intervalMs * 2); // Exponential backoff on error
            }
        };

        // Kick off the engine
        poll();
    });
};

// New helper for ATS Import flow
export const createResumeFromData = async (parsedData: any, jobTitle: string, country: string, jobDescription?: string, atsReport?: any) => {
    // Construct payload expected by backend
    const payload = {
        title: jobTitle || "Imported Resume",
        // Flatten user_data for the endpoint if needed, or nest it depending on main.py expectation
        // main.py line 835 expects data.get("user_data", {})
        user_data: {
            full_name: parsedData.full_name,
            contact: {
                email: parsedData.email,
                phone: parsedData.phone,
                city: parsedData.city
            },
            professional_summary: parsedData.summary,
            skills: parsedData.skills || [],
            work_experiences: parsedData.experience || [],
            educations: parsedData.education || [],
            languages: parsedData.languages || [],
            projects: parsedData.projects || [],
            ats_report: atsReport || null // Store the logic for AI to use later
        },
        country: country,
        language: "English",
        template_style: "professional", // Use table-based layout for stability
        job_description: jobDescription || "",
        slug: `imported-${Date.now()}`, // Ensure unique slug
        skip_enhancement: true // Use raw imported data, don’t rewrite immediately
    };

    // Use the CORRECT endpoint that returns JSON ID
    const response = await api.post('/resume/create', payload);
    return response.data.data; // Correctly unwrap: { success: true, data: { id: ... } } -> { id: ... }
};

export const cloneResume = async (id: string, title?: string) => {
    const response = await api.post(`/resumes/${id}/clone`, { title });
    return response.data.data;
};

export const createVersion = async (id: string) => {
    const response = await api.post(`/resumes/${id}/version`);
    return response.data.data;
};

export const getScoreHistory = async (id: string, limit: number = 10) => {
    const response = await api.get(`/resumes/${id}/scores?limit=${limit}`);
    return response.data.data;
};

export const archiveResume = async (id: string) => {
    const response = await api.post(`/resumes/${id}/archive`);
    return response.data.success;
};

export const restoreResume = async (id: string) => {
    const response = await api.post(`/resumes/${id}/restore`);
    return response.data.success;
};

export const enhanceResume = async (id: string): Promise<Resume> => {
    const response = await api.post<{ success: boolean; data: Resume }>(`/resumes/${id}/enhance`);
    return response.data.data;
};

export const uploadResumePDF = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/resumes/${id}/upload_pdf`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const setDefaultResume = async (id: string) => {
    const response = await api.patch(`/resumes/${id}/default`);
    return response.data.success;
};

export const getPublicResume = async (username: string, slug: string): Promise<Resume> => {
    const response = await api.get<{ success: boolean; data: Resume }>(`/public/resumes/${username}/${slug}`);
    return response.data.data;
};

/**
 * Optimized PDF Download: Utilizes the backend's RedirectResponse pattern 
 * to stream the file securely with zero API-server RAM overhead.
 */
export const downloadResumePDF = (resumeId: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');
    
    // Redirect browser to the secure download endpoint
    // The browser will handle the 307 redirect automatically.
    window.location.href = `${baseUrl}/api/v1/resume/${resumeId}/pdf?token=${token}`;
};
