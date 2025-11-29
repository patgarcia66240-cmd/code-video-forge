import { describe, it, expect } from 'vitest';
import { simulateTyping } from './engine';

describe('simulateTyping', () => {
    it('should return correct events for basic text', () => {
        const text = 'hello';
        const config = { speed: 120, effect: 'smooth' as const, loop: false }; // 120 caractères/minute
        const events = simulateTyping(text, config);

        // Should have events for each character plus completion
        expect(events.length).toBeGreaterThan(text.length);

        // First event should be adding 'h'
        expect(events[0].type).toBe('add_char');
        expect(events[0].char).toBe('h');

        // Last event should be completion
        const lastEvent = events[events.length - 1];
        expect(lastEvent.type).toBe('complete');
    });

    it('should respect speed parameter', () => {
        const text = 'hi';
        const fastConfig = { speed: 600, effect: 'smooth' as const, loop: false }; // Très rapide
        const slowConfig = { speed: 60, effect: 'smooth' as const, loop: false }; // Lent

        const fastEvents = simulateTyping(text, fastConfig);
        const slowEvents = simulateTyping(text, slowConfig);

        // Fast should have shorter delays
        const fastDelay = fastEvents[0].delay;
        const slowDelay = slowEvents[0].delay;

        expect(fastDelay).toBeLessThan(slowDelay);
    });

    it('should handle empty text', () => {
        const config = { speed: 120, effect: 'smooth' as const, loop: false };
        const events = simulateTyping('', config);
        expect(events.length).toBe(1);
        expect(events[0].type).toBe('complete');
    });

    it('should handle single character', () => {
        const config = { speed: 120, effect: 'smooth' as const, loop: false };
        const events = simulateTyping('a', config);
        expect(events.length).toBe(2); // add_char + complete
        expect(events[0].type).toBe('add_char');
        expect(events[0].char).toBe('a');
        expect(events[1].type).toBe('complete');
    });
});
