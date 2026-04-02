import { renderHook } from '@testing-library/react';
import { useReadinessScore } from './useReadinessScore';
import { describe, it, expect } from 'vitest';

/**
 * Staff+ Unit Test: useReadinessScore (v6.9.0)
 * Verifies the "Guided Intelligence" brain.
 * Covers compliance, matching heuristics, and state transitions.
 */

describe('useReadinessScore', () => {
    const mockProfile: any = {
        full_name: 'John Doe',
        email: 'john@example.com',
        professional_summary: 'Experienced developer with React expertise.',
        work_experiences: [{ id: '1', role: 'Dev', achievements: ['Built stuff'] }],
        skills: ['React', 'TypeScript', 'Node', 'SQL', 'AWS'],
        educations: [{ id: '1', degree: 'CS' }]
    };

    it('returns 0 readiness when profile is null', () => {
        const { result } = renderHook(() => 
            useReadinessScore(null, '', '', 'USA', new Set())
        );
        expect(result.current.readinessScore).toBe(0);
        expect(result.current.interpretation.label).toBe('Incomplete');
    });

    it('calculates high score for complete profile', () => {
        const { result } = renderHook(() => 
            useReadinessScore(mockProfile, 'Software Engineer', '', 'USA', new Set())
        );
        // Base score for complete profile is high
        expect(result.current.readinessScore).toBeGreaterThan(80);
        expect(result.current.interpretation.label).toBe('Elite Match');
    });

    describe('Germany Compliance', () => {
        it('adds photo warning for Germany if photo is missing', () => {
            const { result } = renderHook(() => 
                useReadinessScore(mockProfile, 'Dev', '', 'Germany', new Set())
            );
            const photoWarning = result.current.warnings.find(w => w.id === 'photo-missing');
            expect(photoWarning).toBeDefined();
            expect(photoWarning?.type).toBe('info');
        });

        it('discounts score if warnings are present', () => {
            const { result: res1 } = renderHook(() => 
                useReadinessScore(mockProfile, 'Dev', '', 'USA', new Set())
            );
            const { result: res2 } = renderHook(() => 
                useReadinessScore(mockProfile, 'Dev', '', 'Germany', new Set())
            );
            // Germany score should be lower due to missing photo warning
            expect(res2.current.readinessScore).toBeLessThan(res1.current.readinessScore);
        });
    });

    describe('ATS Matching Logic', () => {
        it('boosts ATS score when job description matches skills', () => {
            const { result } = renderHook(() => 
                useReadinessScore(mockProfile, 'Software Engineer', 'We need a React, TypeScript, Node, SQL, and AWS expert', 'USA', new Set())
            );
            // With matching skills and JD > 20 chars, ATS score should be high
            expect(result.current.projectedAtsScore).toBeGreaterThan(90);
        });

        it('penalizes ATS score for incomplete profile', () => {
             const incompleteProfile = { ...mockProfile, skills: [], work_experiences: [] };
             const { result } = renderHook(() => 
                useReadinessScore(incompleteProfile, 'Software Engineer', '', 'USA', new Set())
            );
            expect(result.current.projectedAtsScore).toBeLessThan(70);
        });
    });
});
