import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Pause, Play, RotateCcw, Gauge, Video, Download, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import RecordRTC from "recordrtc";
import RecordingGuide from "./RecordingGuide";
import { convertWebMToMP4 } from "@/lib/ffmpeg";

interface TypingSimulatorProps {
  code: string;
  onComplete: () => void;
}

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
  
  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

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

  const startRecording = async () => {
    try {
      // Capture l'écran de l'éditeur
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      streamRef.current = stream;

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
        description: "La vidéo est en cours d'enregistrement",
      });

      // Arrêter automatiquement quand l'animation est terminée
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopRecording();
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'enregistrement. Assurez-vous d'avoir autorisé le partage d'écran.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current && streamRef.current) {
      recorderRef.current.stopRecording(async () => {
        const webmBlob = recorderRef.current!.getBlob();
        setIsRecording(false);

        // Arrêter tous les tracks du stream
        streamRef.current!.getTracks().forEach(track => track.stop());

        // Si format WebM, télécharger directement
        if (exportFormat === 'webm') {
          setRecordedBlob(webmBlob);
          toast({
            title: "Vidéo prête !",
            description: "Votre vidéo WebM est prête à être téléchargée",
          });
          return;
        }

        // Sinon, convertir en MP4
        toast({
          title: "Conversion en MP4",
          description: "Conversion de la vidéo en cours...",
        });

        try {
          setIsConverting(true);
          setConversionProgress(0);
          
          const mp4Blob = await convertWebMToMP4(webmBlob, (progress) => {
            setConversionProgress(progress);
          });
          
          setRecordedBlob(mp4Blob);
          setIsConverting(false);
          setConversionProgress(0);

          toast({
            title: "Vidéo prête !",
            description: "Votre vidéo MP4 est prête à être téléchargée",
          });
        } catch (error) {
          console.error("Erreur lors de la conversion:", error);
          setIsConverting(false);
          setConversionProgress(0);
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

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      a.download = `code-typing-${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Téléchargement lancé",
        description: `Votre vidéo ${extension.toUpperCase()} a été téléchargée`,
      });
    }
  };

  const progress = (currentIndex / code.length) * 100;

  return (
    <div className="flex-1 flex flex-col bg-editor relative">
      {/* Tab Bar */}
      <div className="h-10 bg-panel-bg flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1 bg-editor rounded-t border-t-2 border-primary">
          <span className="text-sm text-foreground">typing-demo.py</span>
          <span className="text-xs text-muted-foreground ml-2">
            {currentIndex} / {code.length} caractères
          </span>
        </div>
      </div>

      {/* Controls */}
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
          className="ml-auto border-border hover:bg-secondary"
        >
          Retour à l'éditeur
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Recording Guide */}
      {isRecording && <RecordingGuide />}

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
    </div>
  );
};

export default TypingSimulator;
