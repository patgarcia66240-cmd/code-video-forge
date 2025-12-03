import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { MdFullscreen, MdFullscreenExit, MdSettings } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import SettingsDialog from "@/components/SettingsDialog";
import RecordingGuide from "../RecordingGuide";
import { TypingControls } from "./TypingControls";
import { RecordingControls } from "./RecordingControls";
import { VideoPreviewPanel } from "./VideoPreviewPanel";
import { TimelinePanel } from "./TimelinePanel";
import { useScreenRecorder } from "@/hooks/useScreenRecorder";

interface TypingSimulatorProps {
    code: string;
    onComplete: () => void;
    onSettingsReady?: (callback: () => void) => void;
    onVideoRecorded?: (blob: Blob) => void;
}

const TypingSimulator = ({ code, onComplete, onSettingsReady, onVideoRecorded }: TypingSimulatorProps) => {
    // États principaux
    const [displayedCode, setDisplayedCode] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [loopCount, setLoopCount] = useState(0);

    // États UI
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    // États depuis localStorage
    const [speed, setSpeed] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorSpeed");
        return saved ? JSON.parse(saved) : 50;
    });

    const [autoStart, setAutoStart] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorAutoStart");
        return saved ? JSON.parse(saved) : false;
    });

    const [isLoopEnabled, setIsLoopEnabled] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorIsLoopEnabled");
        return saved ? JSON.parse(saved) : false;
    });

    const [codeOnlyMode, setCodeOnlyMode] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorCodeOnlyMode");
        return saved ? JSON.parse(saved) : false;
    });

    const [audioEnabled, setAudioEnabled] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorAudioEnabled");
        const value = saved ? JSON.parse(saved) : true;
        console.log("🔊 audioEnabled initialisé:", value);
        return value;
    });

    const [audioSource, setAudioSource] = useState<"microphone" | "system" | "both">(() => {
        const saved = localStorage.getItem("typingSimulatorAudioSource");
        return saved ? JSON.parse(saved) : "microphone";
    });

    const [audioQuality, setAudioQuality] = useState<"high" | "medium" | "low">(() => {
        const saved = localStorage.getItem("typingSimulatorAudioQuality");
        return saved ? JSON.parse(saved) : "medium";
    });

    const [audioVolume, setAudioVolume] = useState(() => {
        const saved = localStorage.getItem("typingSimulatorAudioVolume");
        return saved ? JSON.parse(saved) : 1.0; // Volume par défaut à 100%
    });

    // Hook d'enregistrement d'écran
    const {
        isRecording,
        recordedBlob,
        setRecordedBlob,
        countdown,
        isFullscreen,
        setIsFullscreen,
        captureMode,
        startRecording,
        stopRecording,
    } = useScreenRecorder({
        addLog: (message: string) => console.log("[Recording]", message),
        onVideoRecorded: (blob: Blob) => {
            onVideoRecorded?.(blob);
        },
        audioEnabled,
        audioSource,
        audioVolume,
    });

    // États d'enregistrement calculés
    const isConverting = false; // TODO: Intégrer avec useVideoConverter
    const conversionProgress = 0; // TODO: Intégrer avec useVideoConverter

    // Gestion des URLs de prévisualisation
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    // Refs
    const editorRef = useRef<any | null>(null);
    const monacoRef = useRef<any | null>(null);
    const decorationsRef = useRef<string[] | null>(null);

    // États pour le mode code seul
    const [displayEffect, setDisplayEffect] = useState<"typewriter" | "word" | "line" | "block" | "instant">(() => {
        const saved = localStorage.getItem("typingSimulatorDisplayEffect");
        return (saved as any) || "instant"; // Par défaut instant en mode code seul
    });

    const [cursorType, setCursorType] = useState<"none" | "bar" | "block" | "underline" | "outline">(() => {
        const saved = localStorage.getItem("typingSimulatorCursorType");
        return (saved as any) || "none"; // Par défaut sans curseur en mode code seul
    });

    // Sauvegarde des paramètres dans localStorage
    useEffect(() => {
        localStorage.setItem("typingSimulatorSpeed", JSON.stringify(speed));
    }, [speed]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorAutoStart", JSON.stringify(autoStart));
    }, [autoStart]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorIsLoopEnabled", JSON.stringify(isLoopEnabled));
    }, [isLoopEnabled]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorCodeOnlyMode", JSON.stringify(codeOnlyMode));
    }, [codeOnlyMode]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorDisplayEffect", JSON.stringify(displayEffect));
    }, [displayEffect]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorCursorType", JSON.stringify(cursorType));
    }, [cursorType]);

    useEffect(() => {
        console.log("🔊 audioEnabled changé:", audioEnabled);
        localStorage.setItem("typingSimulatorAudioEnabled", JSON.stringify(audioEnabled));
    }, [audioEnabled]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorAudioQuality", JSON.stringify(audioQuality));
    }, [audioQuality]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorAudioSource", JSON.stringify(audioSource));
    }, [audioSource]);

    useEffect(() => {
        localStorage.setItem("typingSimulatorAudioVolume", JSON.stringify(audioVolume));
    }, [audioVolume]);

    // Calculs dérivés
    const isComplete = currentIndex >= code.length;
    const progress = (currentIndex / code.length) * 100;

    // Gestion des URLs de prévisualisation
    useEffect(() => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            setVideoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setVideoPreviewUrl(null);
        }
    }, [recordedBlob]);

    // Auto-start
    useEffect(() => {
        if (currentIndex === 0) {
            setIsPaused(!autoStart);
        }
    }, [autoStart, currentIndex]);

    // Optimisation automatique du mode code seul
    useEffect(() => {
        if (codeOnlyMode) {
            // En mode code seul, optimiser pour la présentation
            setDisplayEffect("instant");
            setCursorType("none");
        }
    }, [codeOnlyMode]);

    // Handlers
    const handleReset = useCallback(() => {
        setDisplayedCode("");
        setCurrentIndex(0);
        setIsPaused(true);
        setRecordedBlob(null);
        setVideoPreviewUrl(null);
        setLoopCount(0);
    }, []);

    const handleTogglePlay = useCallback(() => {
        if (isComplete) {
            handleReset();
        } else {
            setIsPaused((prev) => !prev);
        }
    }, [isComplete, handleReset]);

    const handlePositionChange = useCallback((index: number) => {
        setCurrentIndex(index);
        setDisplayedCode(code.slice(0, index));
        setIsDraggingSlider(true);
    }, [code]);

    const handleDragEnd = useCallback(() => {
        setIsDraggingSlider(false);
    }, []);

    // Gestion des paramètres
    useEffect(() => {
        if (onSettingsReady) {
            onSettingsReady(() => setIsSettingsDialogOpen(true));
        }
    }, [onSettingsReady]);

    // Gestion des raccourcis clavier
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen && (!isRecording || recordedBlob)) {
                setIsFullscreen(false);
            }

            // Ctrl+P pour lancer le partage
            if (e.ctrlKey && e.key === "p") {
                e.preventDefault();
                e.stopPropagation();
                if (recordedBlob) {
                    handleDownloadRecording();
                } else if (!isRecording && !isConverting) {
                    handleStartRecording();
                }
                return;
            }

            // Navigation avec les flèches (autorisée même pendant l'enregistrement)
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                e.stopPropagation();
                const skipAmount = Math.max(1, Math.floor(code.length * 0.05)); // 5% du total
                handlePositionChange(Math.max(0, currentIndex - skipAmount));
                return;
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                e.stopPropagation();
                const skipAmount = Math.max(1, Math.floor(code.length * 0.05)); // 5% du total
                handlePositionChange(Math.min(code.length, currentIndex + skipAmount));
                return;
            }

            // Espace pour play/pause
            if (e.key === " " && !isRecording) {
                e.preventDefault();
                e.stopPropagation();
                handleTogglePlay();
                return;
            }

            // Pendant l'enregistrement, empêcher les touches de navigation et d'entrée dans l'éditeur
            if (isRecording && (
                e.key === "ArrowUp" || e.key === "ArrowDown" ||
                e.key === "Home" || e.key === "End" || e.key === "PageUp" || e.key === "PageDown" ||
                (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) // Empêcher la saisie de caractères simples
            )) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isFullscreen, isRecording, recordedBlob, currentIndex, code.length, handlePositionChange, handleTogglePlay]);

    const handleDownloadRecording = () => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement("a");
            a.href = url;
            const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
            a.download = `code-typing-${Date.now()}.${extension}`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    // Handlers d'enregistrement
    const handleStartRecording = () => {
        startRecording();
    };

    const handleStopRecording = () => {
        stopRecording();
    };

    const handleCancelConversion = () => {
        // TODO: Intégrer avec useVideoConverter
        console.log("Annulation conversion");
    };

    return (
        <div className="flex-1 flex flex-col bg-editor relative">
            {/* Tab Bar */}
            {!isFullscreen && (
                <div className="h-10 bg-panel-bg flex items-center px-4 border-b border-border">
                    <div className="flex items-center gap-2 px-3 py-1 bg-editor rounded-t border-t-2 border-primary">
                        <span className="text-sm text-foreground">typing-demo.py</span>
                        <span className="text-xs text-muted-foreground ml-2">
                            {currentIndex} / {code.length} caractères
                        </span>
                    </div>
                </div>
            )}

            {/* Controls */}
            {!isFullscreen && !(codeOnlyMode && !isPaused) && (
                <div className="bg-panel-bg border-b border-border">
                    {/* Ligne 1: Contrôles principaux */}
                    <div className="h-16 flex items-center px-4 gap-4 flex-wrap border-b border-border/50">
                        <TypingControls
                            isPaused={isPaused}
                            isComplete={isComplete}
                            loopCount={loopCount}
                            isLoopEnabled={isLoopEnabled}
                            onTogglePlay={handleTogglePlay}
                            onReset={handleReset}
                        />

                        <div className="h-8 w-px bg-border" />

                        <RecordingControls
                            isRecording={isRecording}
                            isConverting={isConverting}
                            conversionProgress={conversionProgress}
                            recordedBlob={recordedBlob}
                            onStartRecording={handleStartRecording}
                            onStopRecording={handleStopRecording}
                            onCancelConversion={handleCancelConversion}
                            onDownloadRecording={handleDownloadRecording}
                            audioEnabled={audioEnabled}
                            audioSource={audioSource}
                        />

                        <div className="h-8 w-px bg-border" />

                        <div className="flex items-center gap-3 ml-4 flex-1 max-w-md">
                            <span className="text-sm text-muted-foreground">Vitesse: {speed}%</span>
                        </div>

                        <Button onClick={onComplete} variant="outline" size="sm" className="border-border hover:bg-secondary">
                            Retour à l'éditeur
                        </Button>

                        <Button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            variant="outline"
                            size="sm"
                            className="border-border hover:bg-secondary"
                        >
                            {isFullscreen ? <MdFullscreenExit className="w-4 h-4" /> : <MdFullscreen className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Timeline */}
                    <TimelinePanel
                        currentIndex={currentIndex}
                        totalLength={code.length}
                        speed={speed}
                        onPositionChange={handlePositionChange}
                        onDragStart={() => setIsDraggingSlider(true)}
                        onDragEnd={handleDragEnd}
                        onSpeedChange={setSpeed}
                    />
                </div>
            )}

            {/* Progress Bar */}
            {!isFullscreen && (
                <div className="h-1 bg-secondary">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                    />
                </div>
            )}


            {/* Countdown overlay */}
            {countdown !== null && (
                <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div className="text-9xl font-bold text-white drop-shadow-2xl">
                        {countdown}
                    </motion.div>
                </motion.div>
            )}

            {/* Editor and Video Preview Layout */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Editor Panel */}
                <ResizablePanel defaultSize={videoPreviewUrl && !isFullscreen ? 65 : 100} minSize={30}>
                    <div className="h-full overflow-hidden relative flex items-center justify-center bg-editor">
                        <div
                            className="w-full h-full max-w-full max-h-full"
                            style={{
                                aspectRatio: "16:9",
                                maxWidth: "100%",
                                maxHeight: "100%",
                            }}
                        >
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                value={displayedCode}
                                theme="vs-dark"
                                onMount={(editor, monaco) => {
                                    editorRef.current = editor;
                                    monacoRef.current = monaco;
                                }}
                                options={{
                                    fontSize: 14,
                                    fontFamily: "Fira Code, Consolas, Monaco, monospace",
                                    minimap: { enabled: false },
                                    lineNumbers: "on",
                                    renderLineHighlight: "all",
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                    wordWrap: "on",
                                    readOnly: true,
                                    cursorStyle: "block",
                                    cursorBlinking: "solid",
                                }}
                            />
                        </div>
                    </div>
                </ResizablePanel>

                {/* Video Preview Panel */}
                {videoPreviewUrl && !isFullscreen && (
                    <>
                        <ResizableHandle withHandle />
                        <VideoPreviewPanel
                            videoPreviewUrl={videoPreviewUrl}
                            recordedBlob={recordedBlob}
                            onDownload={handleDownloadRecording}
                        />
                    </>
                )}
            </ResizablePanelGroup>

            {/* Settings Dialog */}
            <SettingsDialog
                open={isSettingsDialogOpen}
                onOpenChange={setIsSettingsDialogOpen}
                captureMode={captureMode}
                setCaptureMode={() => { }}
                speed={speed}
                setSpeed={setSpeed}
                isLoopEnabled={isLoopEnabled}
                setIsLoopEnabled={setIsLoopEnabled}
                autoStart={autoStart}
                setAutoStart={setAutoStart}
                isRecording={isRecording}
                isConverting={isConverting}
                exportFormat="webm"
                setExportFormat={() => { }}
                saveWebmBackup={true}
                setSaveWebmBackup={() => { }}
                aspectRatio="16:9"
                setAspectRatio={() => { }}
                mp4Quality="medium"
                setMp4Quality={() => { }}
                mp4Preset="ultrafast"
                setMp4Preset={() => { }}
                mp4Resolution="original"
                setMp4Resolution={() => { }}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                audioQuality={audioQuality}
                setAudioQuality={setAudioQuality}
                audioSource={audioSource}
                setAudioSource={setAudioSource}
                audioVolume={audioVolume}
                setAudioVolume={setAudioVolume}
                displayEffect={displayEffect}
                setDisplayEffect={setDisplayEffect}
                cursorType={cursorType}
                setCursorType={setCursorType}
                codeOnlyMode={codeOnlyMode}
                setCodeOnlyMode={setCodeOnlyMode}
                onShortcutsClick={() => {
                    setIsSettingsDialogOpen(false);
                    // TODO: Implémenter ouverture dialog raccourcis
                }}
            />
        </div>
    );
};

export default TypingSimulator;
