import { useState, useEffect, useRef } from "react";
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

    // États d'enregistrement
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [conversionProgress, setConversionProgress] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);

    // États UI
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    // Refs
    const editorRef = useRef<any | null>(null);
    const monacoRef = useRef<any | null>(null);
    const decorationsRef = useRef<string[] | null>(null);

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

    // Gestion des paramètres
    useEffect(() => {
        if (onSettingsReady) {
            onSettingsReady(() => setIsSettingsDialogOpen(true));
        }
    }, [onSettingsReady]);

    // Gestion des raccourcis clavier (simplifié)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen && (!isRecording || recordedBlob)) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isFullscreen, isRecording, recordedBlob]);

    // Handlers
    const handleReset = () => {
        setDisplayedCode("");
        setCurrentIndex(0);
        setIsPaused(true);
        setRecordedBlob(null);
        setVideoPreviewUrl(null);
        setLoopCount(0);
    };

    const handleTogglePlay = () => {
        if (isComplete) {
            handleReset();
        } else {
            setIsPaused(!isPaused);
        }
    };

    const handlePositionChange = (index: number) => {
        setCurrentIndex(index);
        setDisplayedCode(code.slice(0, index));
        setIsDraggingSlider(true);
    };

    const handleDragEnd = () => {
        setIsDraggingSlider(false);
    };

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

    // Placeholder handlers pour les fonctionnalités d'enregistrement
    // Ces handlers devront être implémentés avec les hooks appropriés
    const handleStartRecording = () => {
        // TODO: Implémenter avec useScreenRecorder
        console.log("Démarrage enregistrement");
    };

    const handleStopRecording = () => {
        // TODO: Implémenter avec useScreenRecorder
        console.log("Arrêt enregistrement");
    };

    const handleCancelConversion = () => {
        // TODO: Implémenter avec useVideoConverter
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
            {!isFullscreen && (
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

            {/* Recording Guide */}
            {isRecording && !isFullscreen && <RecordingGuide />}

            {/* Countdown overlay */}
            {countdown !== null && (
                <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
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
                captureMode="editor"
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
                displayEffect="typewriter"
                setDisplayEffect={() => { }}
                cursorType="bar"
                setCursorType={() => { }}
                onShortcutsClick={() => {
                    setIsSettingsDialogOpen(false);
                    // TODO: Implémenter ouverture dialog raccourcis
                }}
            />
        </div>
    );
};

export default TypingSimulator;
