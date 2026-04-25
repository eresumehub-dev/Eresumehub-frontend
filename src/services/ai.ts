import api from './api';

export interface MotivationResponse {
    success: boolean;
    draft: string;
}

export const generateMotivationDraft = async (userData: any, jobTitle: string, country: string = "Japan"): Promise<MotivationResponse> => {
    const response = await api.post<MotivationResponse>('/ai/generate-motivation', {
        user_data: userData,
        job_title: jobTitle,
        country
    });
    return response.data;
};
