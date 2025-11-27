/**
 * Types et interfaces pour le système de simulation de frappe
 * Fonctions pures, indépendantes de React
 */

export interface TypingEvent {
    type: 'add_char' | 'pause' | 'complete';
    char?: string;
    delay: number; // en millisecondes
    timestamp?: number; // timestamp relatif au début
}

export interface TypingConfig {
    speed: number; // caractères par minute
    effect: "smooth" | "burst";
    loop: boolean;
    pauseBetweenLoops?: number; // en millisecondes
}

export interface TypingState {
    currentIndex: number;
    isPlaying: boolean;
    isPaused: boolean;
    isComplete: boolean;
    totalChars: number;
    startTime?: number;
    pauseTime?: number;
}

export interface TypingSequence {
    text: string;
    config: TypingConfig;
    events: TypingEvent[];
    estimatedDuration: number; // en millisecondes
}
