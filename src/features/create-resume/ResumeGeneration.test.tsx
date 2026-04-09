import { render, screen, fireEvent, waitFor } from '../../test/utils';
import CreateResumePage from './CreateResumePage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as resumeService from '../../services/resume';
// import * as schemaService from '../../services/schema';
import * as profileQuery from '../../hooks/queries/useUserProfileQuery';

/**
 * Staff+ Integration Test: Resume Generation Flow (v6.9.0)
 * Verifies the end-to-end interaction between UI, Hooks, and Services.
 * Covers: Form Input -> Readiness Update -> Generation Trigger -> Progress Feedback.
 */

vi.mock('../../services/resume', () => ({
    createResume: vi.fn(),
    pollJobStatus: vi.fn(),
    getResumes: vi.fn().mockResolvedValue([]),
    deleteResume: vi.fn(),
    updateResume: vi.fn(),
}));

vi.mock('../../services/schema', () => ({
    getAvailableCountries: vi.fn().mockResolvedValue(['Germany', 'USA', 'India']),
}));

vi.mock('../../hooks/queries/useUserProfileQuery', () => ({
    useUserProfileQuery: vi.fn(),
    getUserInitials: vi.fn().mockReturnValue('JD'),
}));

describe('Resume Generation Integration', () => {
    const mockProfile = {
        full_name: 'John Doe',
        email: 'john@example.com',
        professional_summary: 'Experienced developer.',
        work_experiences: [{ id: '1', role: 'Dev', achievements: ['Built stuff'] }],
        skills: ['React', 'TypeScript'],
        educations: [{ id: '1', degree: 'CS' }],
        country: 'USA'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (profileQuery.useUserProfileQuery as any).mockReturnValue({
            data: { profile: mockProfile },
            isLoading: false
        });
    });

    it('updates readiness score and allows generation after job title is entered', async () => {
        render(<CreateResumePage />);

        // 1. Initial State: Button should be disabled (title empty)
        const generateBtn = screen.getByTestId('generate-button');
        expect(generateBtn).toBeDisabled();

        // 2. User Action: Enter Job Title
        const titleInput = screen.getByPlaceholderText(/e.g. senior frontend engineer/i);
        fireEvent.change(titleInput, { target: { value: 'Staff Software Engineer' } });

        // 3. Verification: Button should be enabled
        expect(generateBtn).toBeEnabled();

        // 4. Verification: Readiness Score should be visible
        await waitFor(() => {
            expect(screen.getByText(/Ready/i)).toBeInTheDocument();
        });

        // 5. User Action: Click Generate
        (resumeService.createResume as any).mockResolvedValue({ job_id: 'job_123' });
        fireEvent.click(generateBtn!);

        // 6. Verification: Loading state and step feedback
        await waitFor(() => {
            expect(screen.getByText(/Initializing.../i)).toBeInTheDocument();
        });
        
        expect(resumeService.createResume).toHaveBeenCalled();
        expect(resumeService.pollJobStatus).toHaveBeenCalledWith('job_123', expect.any(Function));
    });

    it('displays error message if generation fails', async () => {
        render(<CreateResumePage />);

        const titleInput = screen.getByPlaceholderText(/e.g. senior frontend engineer/i);
        fireEvent.change(titleInput, { target: { value: 'Staff Software Engineer' } });

        const generateBtn = screen.getByRole('button', { name: /generate resume/i });
        
        // Mock error
        (resumeService.createResume as any).mockRejectedValue(new Error('API Down'));
        
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(screen.getByText(/API Down/i)).toBeInTheDocument();
        });
    });
});
