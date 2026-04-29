import { tracker } from './tracker';

/**
 * Staff+ Analytics Layer: Event Tracking (v6.8.0)
 * Centralizes behavioral tracking and funnel observability.
 * Integrated with the generation pipeline and dashboard interactions.
 */

type EventName = 
    | 'creation_funnel_started'
    | 'readiness_threshold_hit'
    | 'generation_started'
    | 'generation_succeeded'
    | 'generation_failed'
    | 'pdf_downloaded'
    | 'ats_check_performed'
    | 'compliance_bypassed';

export const trackEvent = (eventName: EventName, metadata: Record<string, any> = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[OBSERVABILITY] ${timestamp} | EVENT: ${eventName}`, metadata);

    // Use the robust Tracker engine to ensure schema compliance and session consistency
    tracker.trackEvent(eventName, metadata).catch(err => {
        console.warn('[OBSERVABILITY] Failed to send telemetry', err);
    });
};

export const useTracker = () => {
    return { track: trackEvent };
};
