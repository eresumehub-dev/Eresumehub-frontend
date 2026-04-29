import api from './api';
import { UserProfile } from './profile';

export interface MotivationResponse {
    success: boolean;
    draft: string;
}

export interface MotivationRequest {
    user_data: Partial<UserProfile>;
    job_title: string;
    country: string;
}

export const generateMotivationDraft = async (data: MotivationRequest): Promise<MotivationResponse> => {
    const response = await api.post<MotivationResponse>('/ai/generate-motivation', data);
    return response.data;
};
