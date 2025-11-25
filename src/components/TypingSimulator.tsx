import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  MdPause,
  MdPlayArrow,
  MdRefresh,
  MdSpeed,
  MdVideocam,
  MdDownload,
  MdStopCircle,
  MdSettings,
  MdKeyboard,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import TimelineControl from "@/components/TimelineControl";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import SettingsDialog from "@/components/SettingsDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import RecordRTC from "recordrtc";
import RecordingGuide from "./RecordingGuide";
import { convertWebMToMP4, cancelConversion } from "@/lib/ffmpeg";

interface TypingSimulatorProps {
  code: string;
  onComplete: () => void;
  onSettingsReady?: (callback: () => void) => void;
}

interface KeyboardShortcuts {
  record: string;
  pause: string;
  reset: string;
  fullscreen: string;
}

const defaultShortcuts: KeyboardShortcuts = {
  record: "F9",
  pause: " ",
  reset: "r",
  fullscreen: "f",
};

const TypingSimulator = ({ code, onComplete, onSettingsReady }: TypingSimulatorProps) => {
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<"webm" | "mp4">("webm");
  const [mp4Quality, setMp4Quality] = useState<"high" | "medium" | "fast">("medium");
  const [mp4Preset, setMp4Preset] = useState<"ultrafast" | "fast" | "medium">("ultrafast");
  const [mp4Resolution, setMp4Resolution] = useState<"original" | "1080p" | "720p">("original");
  const [saveWebmBackup, setSaveWebmBackup] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captureMode, setCaptureMode] = useState<"screen" | "editor">("editor");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:3" | "21:9">("16:9");
  const [shortcuts, setShortcuts] = useState<KeyboardShortcuts>(() => {
    const saved = localStorage.getItem("typingSimulatorShortcuts");
    return saved ? JSON.parse(saved) : defaultShortcuts;
  });
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<keyof KeyboardShortcuts | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [loopCount, setLoopCount] = useState(0);

  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Sauvegarder les raccourcis dans localStorage
  useEffect(() => {
    localStorage.setItem("typingSimulatorShortcuts", JSON.stringify(shortcuts));
  }, [shortcuts]);

  // Fournir la fonction d'ouverture des paramètres au parent
  useEffect(() => {
    if (onSettingsReady) {
      onSettingsReady(() => () => setIsSettingsDialogOpen(true));
    }
  }, [onSettingsReady]);

  // Créer l'URL de prévisualisation quand recordedBlob change
  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setVideoPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoPreviewUrl(null);
    }
  }, [recordedBlob]);

  // Raccourcis clavier configurables
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorer si on est en train d'éditer un raccourci
      if (editingShortcut) return;

      const key = e.key === " " ? " " : e.key;

      // Enregistrement
      if (key === shortcuts.record) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (!isConverting) {
          startRecording();
        }
      }

      // Pause/Reprendre avec Espace
      if (key === shortcuts.pause && !isConverting) {
        e.preventDefault();
        setIsPaused(!isPaused);
        if (isRecording) {
          addLog(isPaused ? "Animation reprise" : "Animation mise en pause");
        }
      }

      // Flèche droite : avancer d'un caractère
      if (e.key === "ArrowRight" && !isConverting) {
        e.preventDefault();
        const newIndex = Math.min(currentIndex + 1, code.length);
        setCurrentIndex(newIndex);
        setDisplayedCode(code.slice(0, newIndex));
        if (!isPaused) setIsPaused(true); // Pause automatique quand on navigue
      }

      // Flèche gauche : reculer d'un caractère
      if (e.key === "ArrowLeft" && !isConverting) {
        e.preventDefault();
        const newIndex = Math.max(currentIndex - 1, 0);
        setCurrentIndex(newIndex);
        setDisplayedCode(code.slice(0, newIndex));
        if (!isPaused) setIsPaused(true); // Pause automatique quand on navigue
      }

      // Reset
      if (key === shortcuts.reset && !isConverting) {
        e.preventDefault();
        handleReset();
        if (isRecording) {
          addLog("Animation réinitialisée pendant l'enregistrement");
        }
      }

      // Plein écran (désactivé pendant l'enregistrement)
      if (key === shortcuts.fullscreen && !isRecording) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }

      // Echap pour quitter le mode plein écran (désactivé pendant l'enregistrement, mais autorisé après)
      if (e.key === "Escape" && isFullscreen && (!isRecording || recordedBlob)) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRecording, isConverting, isFullscreen, isPaused, shortcuts, editingShortcut, currentIndex, code]);

  useEffect(() => {
    if (currentIndex >= code.length) {
      // Si mode boucle activé, redémarrer automatiquement
      if (isLoopEnabled) {
        const timer = setTimeout(() => {
          setCurrentIndex(0);
          setDisplayedCode("");
          setLoopCount((prev) => prev + 1); // Incrémenter le compteur de boucles
        }, 500); // Petite pause avant de recommencer
        return () => clearTimeout(timer);
      }
      // Sinon, arrêter automatiquement à la fin
      if (!isPaused) {
        setIsPaused(true);
      }
      return;
    }
    if (isPaused || isDraggingSlider) return;

    const delay = Math.max(10, 100 - speed);
    const timer = setTimeout(() => {
      setDisplayedCode(code.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, code, isPaused, speed, isDraggingSlider, isLoopEnabled]);

  const handleReset = () => {
    setDisplayedCode("");
    setCurrentIndex(0);
    setIsPaused(false);
    setRecordedBlob(null);
    setVideoPreviewUrl(null);
    setLogs([]);
    setLoopCount(0); // Réinitialiser le compteur de boucles
  };

  const handleSliderChange = (value: number[]) => {
    const newIndex = value[0];
    setCurrentIndex(newIndex);
    setDisplayedCode(code.slice(0, newIndex));
    setIsDraggingSlider(true);
  };

  const handleSliderCommit = () => {
    setIsDraggingSlider(false);
  };

  // Convertir la position en timecode (MM:SS)
  const getTimecode = (index: number) => {
    const delay = Math.max(10, 100 - speed);
    const totalMs = index * delay;
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-98), `[${timestamp}] ${message}`]);
  };

  const startRecording = async () => {
    try {
      // Réinitialiser l'animation et mettre en pause
      setDisplayedCode("");
      setCurrentIndex(0);
      setIsPaused(true);
      addLog("Éditeur réinitialisé et mis en pause");

      // Si mode éditeur, activer le plein écran d'abord
      if (captureMode === "editor" && !isFullscreen) {
        setIsFullscreen(true);
        addLog("Mode plein écran activé pour capture éditeur");
        // Attendre un peu que le rendu soit fait
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      addLog("Demande de partage d'écran...");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      addLog("Partage d'écran accepté, lancement du compte à rebours...");
      streamRef.current = stream;

      // Afficher le compte à rebours avant de démarrer l'enregistrement
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      addLog("Démarrage de l'enregistrement...");

      const recorder = new RecordRTC(stream, {
        type: "video",
        mimeType: "video/webm",
        videoBitsPerSecond: 2500000,
        frameRate: 30,
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);

      // Arrêter automatiquement quand l'animation est terminée
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        addLog("Partage d'écran arrêté par l'utilisateur");
        stopRecording();
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement:", error);
      addLog("Erreur lors du démarrage de l'enregistrement");
      setCountdown(null);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'enregistrement. Assurez-vous d'avoir autorisé le partage d'écran.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current && streamRef.current) {
      addLog("Arrêt de l'enregistrement, récupération du fichier WebM...");
      recorderRef.current.stopRecording(async () => {
        const webmBlob = recorderRef.current!.getBlob();
        setIsRecording(false);

        // Arrêter tous les tracks du stream
        streamRef.current!.getTracks().forEach((track) => track.stop());
        addLog(`Fichier WebM obtenu (${webmBlob.size} octets)`);

        // Désactiver le mode plein écran si on était en mode éditeur
        if (captureMode === "editor" && isFullscreen) {
          setIsFullscreen(false);
          addLog("Mode plein écran désactivé");
        }

        // Si format WebM, télécharger directement
        if (exportFormat === "webm") {
          setRecordedBlob(webmBlob);
          addLog("Mode WebM : aucun traitement supplémentaire, prêt à télécharger.");
          toast({
            title: "Vidéo prête !",
            description: "Votre vidéo WebM est prête à être téléchargée",
          });
          return;
        }

        // Sauvegarder le WebM de secours si option activée
        if (saveWebmBackup) {
          addLog("Sauvegarde du WebM de secours avant conversion...");
          const url = URL.createObjectURL(webmBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `code-typing-backup-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          addLog("Backup WebM téléchargé automatiquement.");
        }

        // Sinon, convertir en MP4
        toast({
          title: "Conversion en MP4",
          description: "Conversion de la vidéo en cours...",
        });
        addLog("Démarrage de la conversion MP4 via FFmpeg...");

        try {
          setIsConverting(true);
          setConversionProgress(0);

          // Paramètres de conversion basés sur les réglages
          const crfValue = mp4Quality === "high" ? 18 : mp4Quality === "medium" ? 23 : 28;
          const scaleFilter =
            mp4Resolution === "1080p" ? "scale=-2:1080" : mp4Resolution === "720p" ? "scale=-2:720" : null;

          const mp4Blob = await convertWebMToMP4(
            webmBlob,
            {
              preset: mp4Preset,
              crf: crfValue,
              scale: scaleFilter,
            },
            (progress) => {
              setConversionProgress(progress);
              addLog(`Progression FFmpeg: ${progress}%`);
            },
          );

          setRecordedBlob(mp4Blob);
          setIsConverting(false);
          setConversionProgress(0);
          addLog("Conversion MP4 terminée avec succès.");

          toast({
            title: "Vidéo prête !",
            description: "Votre vidéo MP4 est prête à être téléchargée",
          });
        } catch (error) {
          console.error("Erreur lors de la conversion:", error);
          setIsConverting(false);
          setConversionProgress(0);
          addLog("Erreur lors de la conversion MP4. Fallback en WebM.");
          // En cas d'erreur, garder le WebM
          setRecordedBlob(webmBlob);

          toast({
            title: "Conversion échouée",
            description: "Vidéo sauvegardée en WebM",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleCancelConversion = async () => {
    addLog("Annulation de la conversion demandée...");
    await cancelConversion();
    setIsConverting(false);
    setConversionProgress(0);
    addLog("Conversion annulée.");

    toast({
      title: "Conversion annulée",
      description: "La conversion MP4 a été interrompue",
      variant: "destructive",
    });
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      a.download = `code-typing-${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);

      addLog(`Téléchargement du fichier ${extension.toUpperCase()} demandé.`);

      toast({
        title: "Téléchargement lancé",
        description: `Votre vidéo ${extension.toUpperCase()} a été téléchargée`,
      });
    }
  };

  const progress = (currentIndex / code.length) * 100;

  const handleShortcutCapture = (action: keyof KeyboardShortcuts, e: React.KeyboardEvent) => {
    e.preventDefault();
    const key = e.key === " " ? " " : e.key;
    setShortcuts((prev) => ({ ...prev, [action]: key }));
    setEditingShortcut(null);
  };

  const resetShortcutsToDefault = () => {
    setShortcuts(defaultShortcuts);
    toast({
      title: "Raccourcis réinitialisés",
      description: "Les raccourcis par défaut ont été restaurés",
    });
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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (currentIndex >= code.length) {
                    // Redémarrer depuis le début
                    handleReset();
                  } else {
                    setIsPaused(!isPaused);
                  }
                }}
                className="bg-vscode-button hover:bg-vscode-button-hover text-white"
                size="sm"
              >
                {currentIndex >= code.length ? (
                  <>
                    <MdRefresh className="w-4 h-4 mr-2" />
                    Reprendre
                  </>
                ) : isPaused ? (
                  <>
                    <MdPlayArrow className="w-4 h-4 mr-2" />
                    Lecture
                  </>
                ) : (
                  <>
                    <MdPause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>

              <Button onClick={handleReset} variant="outline" size="sm" className="border-border hover:bg-secondary">
                <MdRefresh className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>

              {/* Compteur de boucles */}
              {isLoopEnabled && loopCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded text-xs text-primary font-medium animate-fade-in">
                  <MdRefresh className="w-3.5 h-3.5" />
                  <span>
                    {loopCount} boucle{loopCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-2">
              {!isRecording && !isConverting ? (
                <Button
                  onClick={startRecording}
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <MdVideocam className="w-4 h-4 mr-2" />
                  Enregistrer {exportFormat.toUpperCase()}
                </Button>
              ) : isRecording ? (
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white animate-pulse"
                >
                  <MdStopCircle className="w-4 h-4 mr-2" />
                  Arrêter
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button disabled variant="outline" size="sm" className="border-border opacity-50">
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Conversion MP4...
                  </Button>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${conversionProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono min-w-[35px]">{conversionProgress}%</span>
                  </div>
                  <Button
                    onClick={handleCancelConversion}
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  >
                    <MdStopCircle className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}

              {recordedBlob && !isConverting && (
                <Button
                  onClick={downloadRecording}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="sm"
                >
                  <MdDownload className="w-4 h-4 mr-2" />
                  Télécharger {recordedBlob.type.includes("mp4") ? "MP4" : "WebM"}
                </Button>
              )}
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-3 ml-4 flex-1 max-w-xs">
              <MdSpeed className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={0}
                max={100}
                step={10}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground min-w-[60px]">
                {speed === 0 ? "Lent" : speed === 100 ? "Rapide" : "Moyen"}
              </span>
            </div>

            <Button onClick={onComplete} variant="outline" size="sm" className="border-border hover:bg-secondary">
              Retour à l'éditeur
            </Button>

            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary"
              title={`Mode plein écran (${shortcuts.fullscreen})`}
            >
              {isFullscreen ? (
                <>
                  <MdFullscreenExit className="w-4 h-4 " />
                </>
              ) : (
                <>
                  <MdFullscreen className="w-4 h-4 " />
                </>
              )}
            </Button>
          </div>

          {/* Ligne 2: Timeline Control */}
          <div className="px-4 py-3 flex items-start ">
            <div className="w-full max-w-4xl my-2">
              <TimelineControl
                currentIndex={currentIndex}
                totalLength={code.length}
                speed={speed}
                onPositionChange={(index) => {
                  setCurrentIndex(index);
                  setDisplayedCode(code.slice(0, index));
                  if (!isPaused) setIsPaused(true);
                }}
                onDragStart={() => setIsDraggingSlider(true)}
                onDragEnd={() => setIsDraggingSlider(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        captureMode={captureMode}
        setCaptureMode={setCaptureMode}
        speed={speed}
        setSpeed={setSpeed}
        isLoopEnabled={isLoopEnabled}
        setIsLoopEnabled={setIsLoopEnabled}
        isRecording={isRecording}
        isConverting={isConverting}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        saveWebmBackup={saveWebmBackup}
        setSaveWebmBackup={setSaveWebmBackup}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        mp4Quality={mp4Quality}
        setMp4Quality={setMp4Quality}
        mp4Preset={mp4Preset}
        setMp4Preset={setMp4Preset}
        mp4Resolution={mp4Resolution}
        setMp4Resolution={setMp4Resolution}
        onShortcutsClick={() => {
          setIsSettingsDialogOpen(false);
          setIsShortcutsDialogOpen(true);
        }}
      />

      {/* Shortcuts Dialog */}
      <Dialog open={isShortcutsDialogOpen} onOpenChange={setIsShortcutsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Raccourcis clavier</DialogTitle>
            <DialogDescription>
              Cliquez sur un champ et appuyez sur la touche souhaitée pour configurer un raccourci.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="record">Démarrer/Arrêter l'enregistrement</Label>
              <Input
                id="record"
                value={shortcuts.record}
                readOnly
                className="font-mono cursor-pointer"
                onFocus={() => setEditingShortcut("record")}
                onKeyDown={(e) => editingShortcut === "record" && handleShortcutCapture("record", e)}
                placeholder="Appuyez sur une touche..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pause">Pause/Reprendre l'animation</Label>
              <Input
                id="pause"
                value={shortcuts.pause === " " ? "Espace" : shortcuts.pause}
                readOnly
                className="font-mono cursor-pointer"
                onFocus={() => setEditingShortcut("pause")}
                onKeyDown={(e) => editingShortcut === "pause" && handleShortcutCapture("pause", e)}
                placeholder="Appuyez sur une touche..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset">Réinitialiser l'animation</Label>
              <Input
                id="reset"
                value={shortcuts.reset}
                readOnly
                className="font-mono cursor-pointer"
                onFocus={() => setEditingShortcut("reset")}
                onKeyDown={(e) => editingShortcut === "reset" && handleShortcutCapture("reset", e)}
                placeholder="Appuyez sur une touche..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullscreen">Activer/Désactiver plein écran</Label>
              <Input
                id="fullscreen"
                value={shortcuts.fullscreen}
                readOnly
                className="font-mono cursor-pointer"
                onFocus={() => setEditingShortcut("fullscreen")}
                onKeyDown={(e) => editingShortcut === "fullscreen" && handleShortcutCapture("fullscreen", e)}
                placeholder="Appuyez sur une touche..."
              />
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Label className="text-sm font-semibold">Raccourcis fixes</Label>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                  <span>Avancer d'un caractère</span>
                  <span className="font-mono text-foreground">→</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                  <span>Reculer d'un caractère</span>
                  <span className="font-mono text-foreground">←</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                  <span>Quitter le plein écran</span>
                  <span className="font-mono text-foreground">Échap</span>
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={resetShortcutsToDefault} className="w-full">
              Réinitialiser par défaut
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-9xl font-bold text-white drop-shadow-2xl"
          >
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
                aspectRatio: aspectRatio,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <Editor
                height="100%"
                defaultLanguage="python"
                value={displayedCode}
                theme="vs-dark"
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

            {/* Cursor effect */}
            {currentIndex < code.length && !isPaused && (
              <motion.div
                className="absolute w-2 h-5 bg-primary"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  left: `${(currentIndex % 80) * 8}px`,
                  top: `${Math.floor(currentIndex / 80) * 20}px`,
                }}
              />
            )}
          </div>
        </ResizablePanel>

        {/* Video Preview Panel */}
        {videoPreviewUrl && !isFullscreen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={20}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full bg-panel-bg border-l border-border flex flex-col"
              >
                <div className="p-4 border-b border-border">
                  <div className="text-sm text-muted-foreground font-medium mb-2">Aperçu de la vidéo</div>
                  <div className="text-xs text-muted-foreground">
                    Format: {recordedBlob?.type.includes("mp4") ? "MP4" : "WebM"} • Taille:{" "}
                    {((recordedBlob?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center  p-4 gap-4">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full max-h-[60vh] rounded border border-border bg-black"
                  />
                  <Button
                    onClick={() => {
                      if (recordedBlob) {
                        const url = URL.createObjectURL(recordedBlob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `code-typing-${Date.now()}.${recordedBlob.type.includes("mp4") ? "mp4" : "webm"}`;
                        a.click();
                        URL.revokeObjectURL(url);
                        addLog("Vidéo téléchargée");
                        toast({
                          title: "Téléchargement lancé",
                          description: "Votre vidéo a été téléchargée avec succès",
                        });
                      }
                    }}
                    className="w-auto px-4 py-2 rounded"
                  >
                    <MdDownload className="w-4 h-4 mr-2" />
                    Télécharger la vidéo
                  </Button>
                </div>
              </motion.div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Console */}
      {!isFullscreen && (
        <div className="h-32 bg-panel-bg border-t border-border px-4 py-2 text-xs font-mono overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Console</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-muted-foreground"
              onClick={() => setLogs([])}
            >
              Effacer
            </Button>
          </div>
          {logs.length === 0 ? (
            <div className="text-muted-foreground/70">Aucun log pour le moment.</div>
          ) : (
            <div className="space-y-0.5">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TypingSimulator;
