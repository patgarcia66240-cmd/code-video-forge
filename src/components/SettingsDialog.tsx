import { MdKeyboard, MdSpeed, MdSlowMotionVideo, MdFastForward } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  captureMode: "screen" | "editor";
  setCaptureMode: (mode: "screen" | "editor") => void;
  speed: number;
  setSpeed: (speed: number) => void;
  isLoopEnabled: boolean;
  setIsLoopEnabled: (enabled: boolean) => void;
  isRecording: boolean;
  isConverting: boolean;
  exportFormat: "webm" | "mp4";
  setExportFormat: (format: "webm" | "mp4") => void;
  saveWebmBackup: boolean;
  setSaveWebmBackup: (save: boolean) => void;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9";
  setAspectRatio: (ratio: "16:9" | "9:16" | "1:1" | "4:3" | "21:9") => void;
  mp4Quality: "high" | "medium" | "fast";
  setMp4Quality: (quality: "high" | "medium" | "fast") => void;
  mp4Preset: "ultrafast" | "fast" | "medium";
  setMp4Preset: (preset: "ultrafast" | "fast" | "medium") => void;
  mp4Resolution: "original" | "1080p" | "720p";
  setMp4Resolution: (resolution: "original" | "1080p" | "720p") => void;
  onShortcutsClick: () => void;
}

const SettingsDialog = ({
  open,
  onOpenChange,
  captureMode,
  setCaptureMode,
  speed,
  setSpeed,
  isLoopEnabled,
  setIsLoopEnabled,
  isRecording,
  isConverting,
  exportFormat,
  setExportFormat,
  saveWebmBackup,
  setSaveWebmBackup,
  aspectRatio,
  setAspectRatio,
  mp4Quality,
  setMp4Quality,
  mp4Preset,
  setMp4Preset,
  mp4Resolution,
  setMp4Resolution,
  onShortcutsClick,
}: SettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>Configurez les paramètres de l'application et de l'export vidéo</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="video">Vidéo</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Mode de capture</Label>
                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                  <span
                    className={`text-sm ${captureMode === "screen" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    Écran complet
                  </span>
                  <Switch
                    checked={captureMode === "editor"}
                    onCheckedChange={(checked) => setCaptureMode(checked ? "editor" : "screen")}
                    disabled={isRecording || isConverting}
                  />
                  <span
                    className={`text-sm ${captureMode === "editor" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    Éditeur seul
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {captureMode === "editor"
                    ? "Mode plein écran automatique pour capturer uniquement l'éditeur"
                    : "Capture complète de l'écran partagé"}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Vitesse d'animation</Label>
                <div className="flex items-center gap-4">
                  <MdSlowMotionVideo className="w-5 h-5 text-muted-foreground" />
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    min={0}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <MdSpeed className="w-5 h-5 text-muted-foreground" />
                  <MdFastForward className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {speed === 0
                      ? "Très lent"
                      : speed < 30
                        ? "Lent"
                        : speed < 70
                          ? "Moyen"
                          : speed < 100
                            ? "Rapide"
                            : "Très rapide"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Mode boucle</Label>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Boucle automatique</span>
                    <span className="text-xs text-muted-foreground">
                      Redémarre l'animation automatiquement à la fin
                    </span>
                  </div>
                  <Switch
                    checked={isLoopEnabled}
                    onCheckedChange={setIsLoopEnabled}
                    disabled={isRecording || isConverting}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Raccourcis clavier</Label>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={onShortcutsClick}
                >
                  <span className="flex items-center gap-2">
                    <MdKeyboard className="w-4 h-4" />
                    Configurer les raccourcis
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Vidéo */}
          <TabsContent value="video" className="space-y-6 py-4">
            {/* Format d'export */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Format d'export</Label>
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                <span
                  className={`text-sm font-mono ${exportFormat === "webm" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  WebM
                </span>
                <Switch
                  checked={exportFormat === "mp4"}
                  onCheckedChange={(checked) => setExportFormat(checked ? "mp4" : "webm")}
                  disabled={isRecording || isConverting}
                />
                <span
                  className={`text-sm font-mono ${exportFormat === "mp4" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  MP4
                </span>
              </div>
              {exportFormat === "mp4" && (
                <div className="flex items-center gap-2 p-3 bg-accent/50 rounded border border-border">
                  <Switch
                    checked={saveWebmBackup}
                    onCheckedChange={setSaveWebmBackup}
                    disabled={isRecording || isConverting}
                  />
                  <Label className="text-xs cursor-pointer">Sauvegarder une copie WebM de secours</Label>
                </div>
              )}
            </div>

            {/* Format d'image */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Format d'image (Aspect Ratio)</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "16:9", label: "16:9", desc: "Horizontal" },
                  { value: "9:16", label: "9:16", desc: "Vertical" },
                  { value: "1:1", label: "1:1", desc: "Carré" },
                  { value: "4:3", label: "4:3", desc: "Classique" },
                  { value: "21:9", label: "21:9", desc: "Ultra-wide" },
                ].map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={aspectRatio === ratio.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatio(ratio.value as any)}
                    disabled={isRecording || isConverting}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="font-mono text-sm">{ratio.label}</span>
                    <span className="text-xs opacity-70">{ratio.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {exportFormat === "mp4" && (
              <>
                {/* Qualité */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Qualité vidéo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "high", label: "Haute", desc: "CRF 18" },
                      { value: "medium", label: "Moyenne", desc: "CRF 23" },
                      { value: "fast", label: "Rapide", desc: "CRF 28" },
                    ].map((quality) => (
                      <Button
                        key={quality.value}
                        variant={mp4Quality === quality.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMp4Quality(quality.value as any)}
                        disabled={isRecording || isConverting}
                        className="flex flex-col h-auto py-2"
                      >
                        <span className="text-sm">{quality.label}</span>
                        <span className="text-xs opacity-70">{quality.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Vitesse de conversion */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Vitesse de conversion</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "ultrafast", label: "Ultra rapide" },
                      { value: "fast", label: "Rapide" },
                      { value: "medium", label: "Moyenne" },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        variant={mp4Preset === preset.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMp4Preset(preset.value as any)}
                        disabled={isRecording || isConverting}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Résolution */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Résolution</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "original", label: "Originale" },
                      { value: "1080p", label: "1080p" },
                      { value: "720p", label: "720p" },
                    ].map((resolution) => (
                      <Button
                        key={resolution.value}
                        variant={mp4Resolution === resolution.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMp4Resolution(resolution.value as any)}
                        disabled={isRecording || isConverting}
                      >
                        {resolution.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Onglet Audio */}
          <TabsContent value="audio" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="p-6 bg-secondary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">L'enregistrement audio n'est pas encore disponible.</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Cette fonctionnalité sera ajoutée dans une prochaine version.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
