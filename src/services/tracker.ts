import api from './api';
import { v4 as uuidv4 } from 'uuid';

export interface EventContext {
    ip?: string;
    device_type: 'mobile' | 'desktop' | 'tablet';
    browser: string;
    screen_width: number;
    screen_height: number;
    referrer: string;
}

export interface StandardEvent {
    event_name: string;
    session_id: string;
    user_id?: string | null;
    properties: Record<string, any>;
    context?: EventContext;
}

class Tracker {
    private sessionId: string;
    private startTime: number;
    private ttv: number | null = null; // Time to value (first scroll)

    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.startTime = Date.now();
        this.setupTTVTracker();
    }

    private getOrCreateSessionId(): string {
        const sid = sessionStorage.getItem('eresume_session_id');
        if (sid) return sid;
        
        const newSid = uuidv4();
        sessionStorage.setItem('eresume_session_id', newSid);
        return newSid;
    }

    private setupTTVTracker() {
        if (typeof window === 'undefined') return;
        
        const handleFirstScroll = () => {
            if (this.ttv === null) {
                this.ttv = (Date.now() - this.startTime) / 1000;
                console.log(`[Tracker] TTV (First Scroll): ${this.ttv}s`);
            }
        };
        
        // v16.5.0: Using { once: true } ensures the listener is self-cleaning 
        // even if navigation occurs before the first scroll.
        window.addEventListener('scroll', handleFirstScroll, { once: true });
    }

    private getContext(): EventContext {
        return {
            device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browser: navigator.userAgent,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            referrer: document.referrer
        };
    }

    async trackEvent(name: string, properties: Record<string, any> = {}, userId?: string | null) {
        // Inject TTV if this is an end session event or download
        const enrichedProps = { ...properties };
        if (this.ttv !== null && (name === 'resume_view_ended' || name === 'resume_download')) {
            enrichedProps.time_to_first_scroll = this.ttv;
        }

        const event: StandardEvent = {
            event_name: name,
            session_id: this.sessionId,
            user_id: userId,
            properties: enrichedProps,
            context: this.getContext()
        };

        try {
            const response = await api.post('/analytics/events/track', event);
            return response.data;
        } catch (error) {
            console.error(`[Tracker] Failed to track ${name}:`, error);
            return { success: false };
        }
    }
}

export const tracker = new Tracker();
