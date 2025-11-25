import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Pause, Play, RotateCcw, Gauge, Video, Download, StopCircle, Settings, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}

interface KeyboardShortcuts {
  record: string;
  pause: string;
  reset: string;
  fullscreen: string;
}

const defaultShortcuts: KeyboardShortcuts = {
  record: 'F9',
  pause: 'Space',
  reset: 'r',
  fullscreen: 'f',
};

const TypingSimulator = ({ code, onComplete }: TypingSimulatorProps) => {
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<'webm' | 'mp4'>('webm');
  const [mp4Quality, setMp4Quality] = useState<'high' | 'medium' | 'fast'>('medium');
  const [mp4Preset, setMp4Preset] = useState<'ultrafast' | 'fast' | 'medium'>('ultrafast');
  const [mp4Resolution, setMp4Resolution] = useState<'original' | '1080p' | '720p'>('original');
  const [saveWebmBackup, setSaveWebmBackup] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captureMode, setCaptureMode] = useState<'screen' | 'editor'>('editor');
  const [shortcuts, setShortcuts] = useState<KeyboardShortcuts>(() => {
    const saved = localStorage.getItem('typingSimulatorShortcuts');
    return saved ? JSON.parse(saved) : defaultShortcuts;
  });
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<keyof KeyboardShortcuts | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Sauvegarder les raccourcis dans localStorage
  useEffect(() => {
    localStorage.setItem('typingSimulatorShortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

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
      
      const key = e.key === ' ' ? 'Space' : e.key;
      
      // Enregistrement
      if (key === shortcuts.record) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else if (!isConverting) {
          startRecording();
        }
      }
      
      // Pause/Reprendre
      if (key === shortcuts.pause && !isRecording && !isConverting) {
        e.preventDefault();
        setIsPaused(!isPaused);
      }
      
      // Reset
      if (key === shortcuts.reset && !isRecording && !isConverting) {
        e.preventDefault();
        handleReset();
      }
      
      // Plein écran
      if (key === shortcuts.fullscreen && !isRecording) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      
      // Echap pour quitter le mode plein écran
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRecording, isConverting, isFullscreen, isPaused, shortcuts, editingShortcut]);

  useEffect(() => {
    if (currentIndex >= code.length) return;
    if (isPaused || isDraggingSlider) return;

    const delay = Math.max(10, 100 - speed);
    const timer = setTimeout(() => {
      setDisplayedCode(code.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, code, isPaused, speed, isDraggingSlider]);

  const handleReset = () => {
    setDisplayedCode("");
    setCurrentIndex(0);
    setIsPaused(false);
    setRecordedBlob(null);
    setVideoPreviewUrl(null);
    setLogs([]);
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

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-98), `[${timestamp}] ${message}`]);
  };

  const startRecording = async () => {
    try {
      // Si mode éditeur, activer le plein écran d'abord
      if (captureMode === 'editor' && !isFullscreen) {
        setIsFullscreen(true);
        addLog("Mode plein écran activé pour capture éditeur");
        // Attendre un peu que le rendu soit fait
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addLog("Demande de partage d'écran...");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      addLog("Partage d'écran accepté, lancement du compte à rebours...");
      streamRef.current = stream;

      // Afficher le compte à rebours avant de démarrer l'enregistrement
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
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

      toast({
        title: "Enregistrement démarré",
        description: captureMode === 'editor' 
          ? "Partagez l'onglet entier pour capturer l'éditeur seul" 
          : "La vidéo est en cours d'enregistrement",
      });

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
        streamRef.current!.getTracks().forEach(track => track.stop());
        addLog(`Fichier WebM obtenu (${webmBlob.size} octets)`);

        // Désactiver le mode plein écran si on était en mode éditeur
        if (captureMode === 'editor' && isFullscreen) {
          setIsFullscreen(false);
          addLog("Mode plein écran désactivé");
        }

        // Si format WebM, télécharger directement
        if (exportFormat === 'webm') {
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
          const crfValue = mp4Quality === 'high' ? 18 : mp4Quality === 'medium' ? 23 : 28;
          const scaleFilter = mp4Resolution === '1080p' ? 'scale=-2:1080' : mp4Resolution === '720p' ? 'scale=-2:720' : null;
          
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
            }
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
    const key = e.key === ' ' ? 'Space' : e.key;
    setShortcuts(prev => ({ ...prev, [action]: key }));
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
      <div className="h-16 bg-panel-bg border-b border-border flex items-center px-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            className="bg-vscode-button hover:bg-vscode-button-hover text-white"
            size="sm"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Reprendre
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-border hover:bg-secondary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Mode capture:</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${captureMode === 'screen' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Écran
            </span>
            <Switch
              checked={captureMode === 'editor'}
              onCheckedChange={(checked) => setCaptureMode(checked ? 'editor' : 'screen')}
              disabled={isRecording || isConverting}
            />
            <span className={`text-xs ${captureMode === 'editor' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Éditeur seul
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Format:</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${exportFormat === 'webm' ? 'text-foreground' : 'text-muted-foreground'}`}>
              WebM
            </span>
            <Switch
              checked={exportFormat === 'mp4'}
              onCheckedChange={(checked) => setExportFormat(checked ? 'mp4' : 'webm')}
              disabled={isRecording || isConverting}
            />
            <span className={`text-xs font-mono ${exportFormat === 'mp4' ? 'text-foreground' : 'text-muted-foreground'}`}>
              MP4
            </span>
          </div>
          {exportFormat === 'mp4' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Backup WebM:</span>
                <Switch
                  checked={saveWebmBackup}
                  onCheckedChange={setSaveWebmBackup}
                  disabled={isRecording || isConverting}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isRecording || isConverting}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                <DropdownMenuLabel>Paramètres MP4</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Qualité
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setMp4Quality('high')}
                  className={mp4Quality === 'high' ? 'bg-accent' : ''}
                >
                  Haute (CRF 18) - Meilleure qualité
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMp4Quality('medium')}
                  className={mp4Quality === 'medium' ? 'bg-accent' : ''}
                >
                  Moyenne (CRF 23) - Équilibrée
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMp4Quality('fast')}
                  className={mp4Quality === 'fast' ? 'bg-accent' : ''}
                >
                  Rapide (CRF 28) - Plus petit
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Vitesse de conversion
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setMp4Preset('ultrafast')}
                  className={mp4Preset === 'ultrafast' ? 'bg-accent' : ''}
                >
                  Ultra rapide
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMp4Preset('fast')}
                  className={mp4Preset === 'fast' ? 'bg-accent' : ''}
                >
                  Rapide
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMp4Preset('medium')}
                  className={mp4Preset === 'medium' ? 'bg-accent' : ''}
                >
                  Moyenne
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Résolution
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setMp4Resolution('original')}
                  className={mp4Resolution === 'original' ? 'bg-accent' : ''}
                >
                  Originale
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMp4Resolution('1080p')}
                  className={mp4Resolution === '1080p' ? 'bg-accent' : ''}
                >
                  1080p
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setMp4Resolution('720p')}
                  className={mp4Resolution === '720p' ? 'bg-accent' : ''}
                >
                  720p
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-2">{!isRecording && !isConverting ? (
            <Button
              onClick={startRecording}
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive hover:text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Enregistrer {exportFormat.toUpperCase()}
            </Button>
          ) : isRecording ? (
            <Button
              onClick={stopRecording}
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive hover:text-white animate-pulse"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Arrêter
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                disabled
                variant="outline"
                size="sm"
                className="border-border opacity-50"
              >
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
                <span className="text-xs text-muted-foreground font-mono min-w-[35px]">
                  {conversionProgress}%
                </span>
              </div>
              <Button
                onClick={handleCancelConversion}
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                <StopCircle className="w-4 h-4 mr-2" />
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
              <Download className="w-4 h-4 mr-2" />
              Télécharger {recordedBlob.type.includes("mp4") ? "MP4" : "WebM"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 ml-4 flex-1 max-w-xs">
          <Gauge className="w-4 h-4 text-muted-foreground" />
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

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Position</span>
          <Slider
            value={[currentIndex]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            min={0}
            max={code.length}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground font-mono min-w-[80px]">
            {currentIndex} / {code.length}
          </span>
        </div>

        <Button
          onClick={onComplete}
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary"
        >
          Retour à l'éditeur
        </Button>

        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary"
          title={`Mode plein écran (${shortcuts.fullscreen})`}
        >
          {isFullscreen ? "Quitter plein écran" : "Plein écran"}
        </Button>

        <Dialog open={isShortcutsDialogOpen} onOpenChange={setIsShortcutsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary"
              title="Configurer les raccourcis clavier"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </DialogTrigger>
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
                  onFocus={() => setEditingShortcut('record')}
                  onKeyDown={(e) => editingShortcut === 'record' && handleShortcutCapture('record', e)}
                  placeholder="Appuyez sur une touche..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pause">Pause/Reprendre l'animation</Label>
                <Input
                  id="pause"
                  value={shortcuts.pause}
                  readOnly
                  className="font-mono cursor-pointer"
                  onFocus={() => setEditingShortcut('pause')}
                  onKeyDown={(e) => editingShortcut === 'pause' && handleShortcutCapture('pause', e)}
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
                  onFocus={() => setEditingShortcut('reset')}
                  onKeyDown={(e) => editingShortcut === 'reset' && handleShortcutCapture('reset', e)}
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
                  onFocus={() => setEditingShortcut('fullscreen')}
                  onKeyDown={(e) => editingShortcut === 'fullscreen' && handleShortcutCapture('fullscreen', e)}
                  placeholder="Appuyez sur une touche..."
                />
              </div>
              <Button
                variant="outline"
                onClick={resetShortcutsToDefault}
                className="w-full"
              >
                Réinitialiser par défaut
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Video Preview */}
      {videoPreviewUrl && !isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-panel-bg border-b border-border p-4"
        >
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground font-medium">
              Aperçu de la vidéo :
            </div>
            <video
              src={videoPreviewUrl}
              controls
              className="h-32 rounded border border-border bg-black"
            />
            <div className="text-xs text-muted-foreground">
              Format: {recordedBlob?.type.includes("mp4") ? "MP4" : "WebM"} •{" "}
              Taille: {((recordedBlob?.size || 0) / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </motion.div>
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

      {/* Editor with typing effect */}
      <div className="flex-1 overflow-hidden relative">
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
