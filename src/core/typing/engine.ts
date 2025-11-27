/**
 * Moteur de simulation de frappe - fonctions pures
 * Indépendant de React, testable unitairement
 */

import { TypingEvent, TypingConfig, TypingSequence } from './types';

/**
 * Calcule le délai entre deux caractères basé sur la vitesse et l'effet
 */
export function calculateCharDelay(
    speed: number, // caractères par minute
    effect: "smooth" | "burst",
    charIndex: number,
    totalChars: number
): number {
    const baseDelay = (60 / speed) * 1000; // millisecondes par caractère

    if (effect === "smooth") {
        // Variation naturelle : ±20% avec une courbe gaussienne
        const variation = Math.sin((charIndex / totalChars) * Math.PI * 2) * 0.2;
        return Math.max(50, baseDelay * (1 + variation));
    } else if (effect === "burst") {
        // Effet burst : groupes rapides avec pauses
        const burstSize = 5;
        const isBurstEnd = (charIndex + 1) % burstSize === 0;
        return isBurstEnd ? baseDelay * 3 : baseDelay * 0.7;
    }

    return baseDelay;
}

/**
 * Génère une séquence d'événements de frappe pour un texte donné
 */
export function simulateTyping(
    text: string,
    config: TypingConfig
): TypingEvent[] {
    if (!text || text.length === 0) {
        return [{ type: 'complete', delay: 0 }];
    }

    const events: TypingEvent[] = [];
    let currentTime = 0;

    // Si on boucle, on ajoute le texte plusieurs fois
    const loopCount = config.loop ? 2 : 1; // Pour l'instant, max 2 boucles pour éviter l'infini
    let fullText = text;

    if (config.loop && config.pauseBetweenLoops) {
        // Pour les tests, on limite à 2 itérations
        fullText = text + '\n' + text;
    }

    for (let loopIndex = 0; loopIndex < loopCount; loopIndex++) {
        const loopText = loopIndex === 0 ? text : text;

        for (let i = 0; i < loopText.length; i++) {
            const char = loopText[i];
            const delay = calculateCharDelay(
                config.speed,
                config.effect,
                i,
                loopText.length
            );

            events.push({
                type: 'add_char',
                char,
                delay,
                timestamp: currentTime
            });

            currentTime += delay;
        }

        // Pause entre les boucles si configuré
        if (config.loop && config.pauseBetweenLoops && loopIndex < loopCount - 1) {
            events.push({
                type: 'pause',
                delay: config.pauseBetweenLoops,
                timestamp: currentTime
            });
            currentTime += config.pauseBetweenLoops;
        }
    }

    // Événement de fin
    events.push({
        type: 'complete',
        delay: 0,
        timestamp: currentTime
    });

    return events;
}

/**
 * Crée une séquence de frappe complète avec métadonnées
 */
export function createTypingSequence(
    text: string,
    config: TypingConfig
): TypingSequence {
    const events = simulateTyping(text, config);
    const estimatedDuration = events.reduce((total, event) => total + event.delay, 0);

    return {
        text,
        config,
        events,
        estimatedDuration
    };
}

/**
 * Calcule la progression d'une séquence de frappe
 */
export function calculateTypingProgress(
    events: TypingEvent[],
    currentTime: number
): {
    currentIndex: number;
    isComplete: boolean;
    progress: number; // 0-1
} {
    let accumulatedTime = 0;
    let currentIndex = 0;

    for (let i = 0; i < events.length; i++) {
        accumulatedTime += events[i].delay;

        if (currentTime >= accumulatedTime) {
            currentIndex = i;
        } else {
            break;
        }
    }

    const totalDuration = events.reduce((sum, event) => sum + event.delay, 0);
    const progress = totalDuration > 0 ? Math.min(currentTime / totalDuration, 1) : 1;
    const isComplete = currentIndex >= events.length - 1 && events[events.length - 1]?.type === 'complete';

    return {
        currentIndex,
        isComplete,
        progress
    };
}

/**
 * Extrait le texte affiché à un moment donné
 */
export function getTypingTextAtTime(
    events: TypingEvent[],
    currentTime: number
): string {
    let accumulatedTime = 0;
    let currentText = '';

    for (const event of events) {
        accumulatedTime += event.delay;

        if (currentTime >= accumulatedTime) {
            if (event.type === 'add_char' && event.char) {
                currentText += event.char;
            }
        } else {
            break;
        }
    }

    return currentText;
}
