import CreateResumePage from '../features/create-resume/CreateResumePage';

/**
 * CreateResume Entry Point (Guided Intelligence Overhaul v6.7.0)
 * 
 * This page was refactored from an 1100-line monolith into a modular 
 * feature-based architecture located in src/features/create-resume/.
 * 
 * Refactor highlights:
 * - Logic extracted to useCreateResumeFlow & useReadinessScore hooks.
 * - Shared UI primitives in src/components/shared/ui/.
 * - Unified Readiness Hub sidebar.
 * - Progressive Disclosure Form.
 */
export default CreateResumePage;
