import { useState, useEffect, useRef, useCallback } from "react";
import * as monaco from "monaco-editor";
import { simulateTyping, createTypingSequence, calculateTypingProgress, getTypingTextAtTime } from "@/core/typing/engine";
import { TypingConfig } from "@/core/typing/types";

interface UseTypingEngineProps {
    code: string;
    onComplete?: () => void;
}

export const useTypingEngine = ({ code, onComplete }: UseTypingEngineProps) => {
    const [displayedCode, setDisplayedCode] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [loopCount, setLoopCount] = useState(0);

    // Settings state
    const [speed, setSpeed] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorSpeed");
        return saved ? JSON.parse(saved) : 50;
    });

    const [autoStart, setAutoStart] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorAutoStart");
        return saved ? JSON.parse(saved) : false;
    });

    const [scrollEffect, setScrollEffect] = useState<"none" | "instant" | "smooth" | "center">(() => {
        const saved = localStorage.getItem("typingSimulatorScrollEffect");
        return (saved as "none" | "instant" | "smooth" | "center") || "smooth";
    });

    const [displayEffect, setDisplayEffect] = useState<"typewriter" | "word" | "line" | "block" | "instant">(() => {
        const saved = localStorage.getItem("typingSimulatorDisplayEffect");
        return (saved as "typewriter" | "word" | "line" | "block" | "instant") || "typewriter";
    });

    const [cursorType, setCursorType] = useState<"none" | "bar" | "block" | "underline" | "outline">(() => {
        const saved = localStorage.getItem("typingSimulatorCursorType");
        return (saved as "none" | "bar" | "block" | "underline" | "outline") || "bar";
    });

    const [isLoopEnabled, setIsLoopEnabled] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorIsLoopEnabled");
        return saved ? JSON.parse(saved) : false;
    });

    // Refs
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof monaco | null>(null);
    const decorationsRef = useRef<string[] | null>(null);

    // Persist settings
    useEffect(() => { localStorage.setItem("typingSimulatorSpeed", JSON.stringify(speed)); }, [speed]);
    useEffect(() => { localStorage.setItem("typingSimulatorAutoStart", JSON.stringify(autoStart)); }, [autoStart]);
    useEffect(() => { localStorage.setItem("typingSimulatorScrollEffect", scrollEffect); }, [scrollEffect]);
    useEffect(() => { localStorage.setItem("typingSimulatorDisplayEffect", displayEffect); }, [displayEffect]);
    useEffect(() => { localStorage.setItem("typingSimulatorCursorType", cursorType); }, [cursorType]);
    useEffect(() => { localStorage.setItem("typingSimulatorIsLoopEnabled", JSON.stringify(isLoopEnabled)); }, [isLoopEnabled]);

    // Auto-start logic
    useEffect(() => {
        if (currentIndex === 0) {
            setIsPaused(!autoStart);
        }
    }, [autoStart, currentIndex]);

    // Scroll effect
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return;
        if (scrollEffect === "none") return;

        try {
            const lines = displayedCode.slice(0, currentIndex).split("\n");
            const lineNumber = Math.max(1, lines.length);

            if (scrollEffect === "center") {
                editorRef.current.revealLineInCenter(lineNumber);
                return;
            }

            const scrollType = monacoRef.current.editor.ScrollType;
            if (scrollEffect === "smooth" && scrollType) {
                editorRef.current.revealPosition({ lineNumber, column: 1 }, scrollType.Smooth);
            } else if (scrollEffect === "instant" && scrollType) {
                editorRef.current.revealPosition({ lineNumber, column: 1 }, scrollType.Immediate);
            } else {
                editorRef.current.revealLineInCenter(lineNumber);
            }
        } catch (err) {
            // ignore
        }
    }, [currentIndex, displayedCode, scrollEffect]);

    // Cursor decoration
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return;

        try {
            const monacoInstance = monacoRef.current;

            if (cursorType === "none") {
                if (decorationsRef.current && decorationsRef.current.length > 0) {
                    editorRef.current.deltaDecorations(decorationsRef.current, []);
                    decorationsRef.current = null;
                }
                return;
            }

            const upToIndex = code.slice(0, Math.max(0, currentIndex));
            const lines = upToIndex.split("\n");
            const lineNumber = Math.max(1, lines.length);
            const column = (lines[lines.length - 1]?.length || 0) + 1;

            const range = new monacoInstance.Range(lineNumber, column, lineNumber, column);

            const newDecorations = [
                {
                    range,
                    options: {
                        glyphMarginClassName: `sim-cursor sim-cursor--${cursorType}`,
                        glyphMarginHoverMessage: null,
                        stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        isWholeLine: false,
                        marginClassName: `sim-cursor-margin sim-cursor-margin--${cursorType}`,
                        beforeContentClassName: `sim-cursor-before sim-cursor-before--${cursorType}`,
                    },
                },
            ];

            if (decorationsRef.current && decorationsRef.current.length > 0) {
                editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
            } else {
                decorationsRef.current = editorRef.current.deltaDecorations([], newDecorations);
            }
        } catch (err) {
            // ignore
        }

        return () => {
            try {
                if (editorRef.current && decorationsRef.current && decorationsRef.current.length) {
                    editorRef.current.deltaDecorations(decorationsRef.current, []);
                    decorationsRef.current = null;
                }
            } catch (e) {
                // ignore
            }
        };
    }, [currentIndex, code, cursorType]);

    // Typing simulation loop
    useEffect(() => {
        if (currentIndex >= code.length) {
            if (isLoopEnabled) {
                const timer = setTimeout(() => {
                    setCurrentIndex(0);
                    setDisplayedCode("");
                    setLoopCount((prev) => prev + 1);
                }, 500);
                return () => clearTimeout(timer);
            }

            if (!isPaused) {
                setIsPaused(true);
                onComplete?.();
            }
            return;
        }

        if (isPaused || isDraggingSlider) return;

        const delay = Math.max(10, 100 - speed);

        if (displayEffect === "instant") {
            setDisplayedCode(code);
            setCurrentIndex(code.length);
            return;
        }

        const computeNextIndex = (ci: number) => {
            if (ci >= code.length) return code.length;
            if (displayEffect === "typewriter") return Math.min(code.length, ci + 1);
            if (displayEffect === "word") {
                const rest = code.slice(ci);
                const m = rest.search(/\s/);
                if (m === -1) return code.length;
                return Math.min(code.length, ci + m + 1);
            }
            if (displayEffect === "line") {
                const idx = code.indexOf("\n", ci);
                return idx === -1 ? code.length : idx + 1;
            }
            if (displayEffect === "block") {
                const blockSize = 120;
                return Math.min(code.length, ci + blockSize);
            }
            return Math.min(code.length, ci + 1);
        };

        const timer = setTimeout(() => {
            const next = computeNextIndex(currentIndex);
            const finalNext = next === currentIndex ? Math.min(code.length, currentIndex + 1) : next;
            setDisplayedCode(code.slice(0, finalNext));
            setCurrentIndex(finalNext);
        }, delay);

        return () => clearTimeout(timer);
    }, [currentIndex, code, isPaused, speed, isDraggingSlider, isLoopEnabled, displayEffect, onComplete]);

    const handleReset = useCallback(() => {
        setDisplayedCode("");
        setCurrentIndex(0);
        setIsPaused(true); // Reset to paused state usually
        setLoopCount(0);
    }, []);

    const handleSliderChange = useCallback((value: number[]) => {
        const newIndex = value[0];
        setCurrentIndex(newIndex);
        setDisplayedCode(code.slice(0, newIndex));
        setIsDraggingSlider(true);
    }, [code]);

    const handleSliderCommit = useCallback(() => {
        setIsDraggingSlider(false);
    }, []);

    return {
        // State
        displayedCode,
        currentIndex,
        isPaused,
        setIsPaused,
        speed,
        setSpeed,
        loopCount,

        // Settings
        autoStart,
        setAutoStart,
        scrollEffect,
        setScrollEffect,
        displayEffect,
        setDisplayEffect,
        cursorType,
        setCursorType,
        isLoopEnabled,
        setIsLoopEnabled,

        // Refs
        editorRef,
        monacoRef,

        // Actions
        handleReset,
        handleSliderChange,
        handleSliderCommit,
        setDisplayedCode,
        setCurrentIndex,
    };
};
