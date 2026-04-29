import api from './api';
import { MarketSchema } from '../utils/compliance_check';

export const getAvailableCountries = async (): Promise<string[]> => {
    try {
        const response = await api.get('/schemas/countries');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return ['Germany', 'India', 'Japan', 'United States'];
    } catch (error) {
        console.error('Error fetching available countries:', error);
        return ['Germany', 'India', 'Japan', 'United States']; // Fallback
    }
};

export const getCountrySchema = async (country: string): Promise<MarketSchema | null> => {
    try {
        const response = await api.get(`/schemas/${country}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching schema for ${country}:`, error);
        return null;
    }
};
