import { renderHook, act, waitFor } from '@testing-library/react';
import { useCreateResumeFlow } from './useCreateResumeFlow';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as router from 'react-router-dom';
import * as query from '@tanstack/react-query';
import * as profileQuery from '../../../hooks/queries/useUserProfileQuery';


/**
 * Staff+ Unit Test: useCreateResumeFlow (v6.9.0)
 * Verifies the multi-step generation flow and data mapping.
 * Mocks TanStack Query and Navigation to isolate hook logic.
 */

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}));

vi.mock('../../../hooks/queries/useUserProfileQuery', () => ({
    useUserProfileQuery: vi.fn(),
}));

vi.mock('../../../services/resume', () => ({
    createResume: vi.fn(),
    pollJobStatus: vi.fn(),
}));

vi.mock('../../../services/event_tracking', () => ({
    trackEvent: vi.fn(),
}));

describe('useCreateResumeFlow', () => {
    const navigate = vi.fn();
    const invalidateQueries = vi.fn();
    const mutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (router.useNavigate as any).mockReturnValue(navigate);
        (query.useQueryClient as any).mockReturnValue({ invalidateQueries });
        (query.useMutation as any).mockReturnValue({ mutate, mutateAsync: vi.fn() });
    });

    it('initializes with default form data', () => {
        (profileQuery.useUserProfileQuery as any).mockReturnValue({
            data: null,
            isLoading: true
        });

        const { result } = renderHook(() => useCreateResumeFlow());
        expect(result.current.formData.country).toBe('');
        expect(result.current.loadingProfile).toBe(true);
    });

    it('syncs country from profile when loaded', async () => {
        (profileQuery.useUserProfileQuery as any).mockReturnValue({
            data: { profile: { country: 'USA' } },
            isLoading: false
        });

        const { result } = renderHook(() => useCreateResumeFlow());
        
        await waitFor(() => {
            expect(result.current.formData.country).toBe('USA');
        });
    });

    it('prevents generation if profile is missing', async () => {
        (profileQuery.useUserProfileQuery as any).mockReturnValue({
            data: null,
            isLoading: false
        });

        const { result } = renderHook(() => useCreateResumeFlow());
        
        await act(async () => {
            await result.current.handleGenerate();
        });

        expect(mutate).not.toHaveBeenCalled();
    });

    it('calls mutation with mapped data on handleGenerate', async () => {
        const mockProfile = {
            full_name: 'Test User',
            email: 'test@example.com',
            country: 'Germany'
        };

        (profileQuery.useUserProfileQuery as any).mockReturnValue({
            data: { profile: mockProfile },
            isLoading: false
        });

        const { result } = renderHook(() => useCreateResumeFlow());
        
        act(() => {
            result.current.setFormData({ ...result.current.formData, jobTitle: 'Scientist' });
        });

        await act(async () => {
            await result.current.handleGenerate();
        });

        // Verify mutation was called with correctly mapped data
        expect(mutate).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Scientist',
            user_data: expect.objectContaining({
                full_name: 'Test User',
                contact: expect.objectContaining({
                    email: 'test@example.com'
                })
            })
        }));
    });
});
