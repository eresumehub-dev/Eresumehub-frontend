import api from './api';

export const getAvailableCountries = async (): Promise<string[]> => {
    try {
        const response = await api.get('/schemas/countries');
        return response.data;
    } catch (error) {
        console.error('Error fetching available countries:', error);
        return ['Germany', 'India']; // Fallback
    }
};

export const getCountrySchema = async (country: string): Promise<any> => {
    try {
        const response = await api.get(`/schemas/${country}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching schema for ${country}:`, error);
        return null;
    }
};
