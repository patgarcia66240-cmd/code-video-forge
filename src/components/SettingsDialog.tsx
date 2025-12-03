import { MdKeyboard } from "react-icons/md";
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
import { Button } from "@/components/ui/button";
import SliderSpeed from "@/components/SliderSpeed";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  captureMode: "screen" | "window" | "tab";
  setCaptureMode: (mode: "screen" | "window" | "tab") => void;
  speed: number;
  setSpeed: (speed: number) => void;
  isLoopEnabled: boolean;
  setIsLoopEnabled: (enabled: boolean) => void;
  autoStart: boolean;
  setAutoStart: (enabled: boolean) => void;
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
  audioEnabled?: boolean;
  setAudioEnabled?: (enabled: boolean) => void;
  audioQuality?: "high" | "medium" | "low";
  setAudioQuality?: (quality: "high" | "medium" | "low") => void;
  audioSource?: "microphone" | "system" | "both";
  setAudioSource?: (source: "microphone" | "system" | "both") => void;
  audioVolume?: number;
  setAudioVolume?: (volume: number) => void;
  scrollEffect?: "none" | "instant" | "smooth" | "center";
  setScrollEffect?: (effect: "none" | "instant" | "smooth" | "center") => void;
  displayEffect?: "typewriter" | "word" | "line" | "block" | "instant";
  setDisplayEffect?: (effect: "typewriter" | "word" | "line" | "block" | "instant") => void;
  cursorType?: "none" | "bar" | "block" | "underline" | "outline";
  setCursorType?: (type: "none" | "bar" | "block" | "underline" | "outline") => void;
  codeOnlyMode?: boolean;
  setCodeOnlyMode?: (enabled: boolean) => void;
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
  autoStart,
  setAutoStart,
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
  audioEnabled,
  setAudioEnabled,
  audioQuality,
  setAudioQuality,
  audioSource,
  setAudioSource,
  onShortcutsClick,
  scrollEffect,
  setScrollEffect,
  displayEffect,
  setDisplayEffect,
  cursorType,
  setCursorType,
  codeOnlyMode,
  setCodeOnlyMode,
  audioVolume,
  setAudioVolume,
}: SettingsDialogProps) => {
  // Lire la valeur actuelle depuis localStorage pour éviter les problèmes de synchronisation
  const getCurrentAudioEnabled = () => {
    const saved = localStorage.getItem("typingSimulatorAudioEnabled");
    return saved ? JSON.parse(saved) : true;
  };

  const currentAudioEnabled = getCurrentAudioEnabled();
  console.log("📝 SettingsDialog audio from localStorage:", currentAudioEnabled);
  console.log("📝 SettingsDialog audio from props:", audioEnabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>Configurez les paramètres de l'application et de l'export vidéo</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="video">Vidéo</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Mode de capture</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "screen", label: "Écran complet", desc: "Capture tout l'écran" },
                    { value: "window", label: "Fenêtre", desc: "Capture une fenêtre" },
                    { value: "tab", label: "Onglet", desc: "Capture l'onglet complet" },
                  ].map((mode) => (
                    <Button
                      key={mode.value}
                      variant={captureMode === mode.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCaptureMode(mode.value as any)}
                      disabled={isRecording || isConverting}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-sm font-medium">{mode.label}</span>
                      <span className="text-xs opacity-70">{mode.desc}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {captureMode === "screen" && "Capture complète de l'écran partagé"}
                  {captureMode === "window" && "Capture une fenêtre d'application spécifique"}
                  {captureMode === "tab" && "Capture l'onglet du navigateur en plein écran"}
                </p>
              </div>

              <SliderSpeed speed={speed} setSpeed={setSpeed} />

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Lecture automatique</Label>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Démarrage automatique</span>
                    <span className="text-xs text-muted-foreground">
                      Lance l'animation automatiquement au démarrage
                    </span>
                  </div>
                  <Switch
                    checked={autoStart}
                    onCheckedChange={setAutoStart}
                    disabled={isRecording || isConverting}
                  />
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
                <Label className="text-sm font-semibold">Effet de scroll</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "none", label: "Aucun" },
                    { value: "instant", label: "Instantané" },
                    { value: "smooth", label: "Doux" },
                    { value: "center", label: "Centré" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={scrollEffect === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScrollEffect?.(opt.value as any)}
                      disabled={isRecording || isConverting}
                      className="h-auto py-2"
                    >
                      <span className="text-sm">{opt.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Choisissez la façon dont l'éditeur doit se centrer sur le texte pendant la lecture.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Effet d'apparition</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: "typewriter", label: "Typewriter" },
                    { value: "word", label: "Mot" },
                    { value: "line", label: "Ligne" },
                    { value: "block", label: "Bloc" },
                    { value: "instant", label: "Instant" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={displayEffect === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDisplayEffect?.(opt.value as any)}
                      disabled={isRecording || isConverting}
                      className="h-auto py-2"
                    >
                      <span className="text-sm">{opt.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Choisissez comment le texte est révélé pendant la lecture (caractère/mot/ligne/bloc/instantané).
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Type de curseur</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: "none", label: "Sans" },
                    { value: "bar", label: "Barre" },
                    { value: "block", label: "Bloc" },
                    { value: "underline", label: "Souligné" },
                    { value: "outline", label: "Contour" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      variant={cursorType === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCursorType?.(opt.value as any)}
                      disabled={isRecording || isConverting}
                      className="h-auto py-2"
                    >
                      <span className="text-sm">{opt.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Style visuel du curseur utilisé par le simulateur.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Mode code seul</Label>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Masquer les contrôles pendant la lecture</span>
                    <span className="text-xs text-muted-foreground">
                      Cache les contrôles au-dessus de l'éditeur quand la lecture est en cours
                    </span>
                  </div>
                  <Switch
                    checked={codeOnlyMode}
                    onCheckedChange={setCodeOnlyMode}
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
              {/* Activation audio */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Enregistrement audio</Label>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Activer l'audio</span>
                    <span className="text-xs text-muted-foreground">
                      Enregistrer le son pendant la capture vidéo
                    </span>
                  </div>
                  <Switch
                    checked={currentAudioEnabled}
                    onCheckedChange={(checked) => {
                        console.log("🔊 Switch cliqué:", checked);
                        console.log("🔊 setAudioEnabled existe:", !!setAudioEnabled);
                        // Sauvegarder directement dans localStorage
                        localStorage.setItem("typingSimulatorAudioEnabled", JSON.stringify(checked));
                        setAudioEnabled?.(checked);
                    }}
                    disabled={isRecording || isConverting}
                  />
                </div>
              </div>

              {/* Source audio */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Source audio</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "microphone", label: "Microphone", desc: "Votre voix" },
                    { value: "system", label: "Système", desc: "Audio système" },
                    { value: "both", label: "Les deux", desc: "Micro + système" },
                  ].map((source) => (
                    <Button
                      key={source.value}
                      variant={audioSource === source.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAudioSource?.(source.value as any)}
                      disabled={isRecording || isConverting || !audioEnabled}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-sm font-medium">{source.label}</span>
                      <span className="text-xs opacity-70">{source.desc}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Choisissez la source audio à enregistrer avec la vidéo.
                </p>
              </div>

              {/* Qualité audio */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Qualité audio</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "high", label: "Haute", desc: "192kbps" },
                    { value: "medium", label: "Moyenne", desc: "128kbps" },
                    { value: "low", label: "Basse", desc: "96kbps" },
                  ].map((quality) => (
                    <Button
                      key={quality.value}
                      variant={audioQuality === quality.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAudioQuality?.(quality.value as any)}
                      disabled={isRecording || isConverting || !audioEnabled}
                      className="flex flex-col h-auto py-2"
                    >
                      <span className="text-sm">{quality.label}</span>
                      <span className="text-xs opacity-70">{quality.desc}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Qualité de l'enregistrement audio (débit binaire).
                </p>
              </div>

              {/* Volume audio */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Volume audio</Label>
                <div className="p-4 bg-secondary/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Volume d'enregistrement</span>
                      <span className="text-xs text-muted-foreground">
                        Contrôle le volume du microphone et de l'audio système
                      </span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {audioVolume ? Math.round(audioVolume * 100) : 100}%
                    </span>
                  </div>
                  <div className="w-full">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioVolume ? audioVolume * 100 : 100}
                      onChange={(e) => {
                        const volume = parseInt(e.target.value) / 100;
                        setAudioVolume?.(volume);
                      }}
                      disabled={isRecording || isConverting || !audioEnabled}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      style={{
                        background: audioEnabled
                          ? `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${audioVolume ? audioVolume * 100 : 100}%, hsl(var(--secondary)) ${audioVolume ? audioVolume * 100 : 100}%, hsl(var(--secondary)) 100%)`
                          : 'hsl(var(--secondary))'
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ajustez le volume d'entrée pour optimiser la qualité de l'enregistrement audio.
                </p>
              </div>

              {/* Informations */}
              <div className="space-y-3">
                <div className="p-4 bg-accent/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note :</strong> L'enregistrement audio nécessite l'autorisation du navigateur.
                    Assurez-vous d'accepter la demande d'accès au microphone/système audio.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Onglet À propos */}
          <TabsContent value="about" className="space-y-6 py-4">
            <div className="space-y-6">
              {/* Version */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Version</Label>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Code Typing Simulator</span>
                    <span className="text-sm font-mono font-semibold">v1.0.0</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Description</Label>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Simulateur de frappe de code avec enregistrement vidéo. Créez des animations professionnelles 
                    de code qui s'écrit automatiquement, parfait pour les tutoriels, présentations et démos.
                  </p>
                </div>
              </div>

              {/* Crédits */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Technologies</Label>
                <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Interface</span>
                    <span className="font-medium">React + Vite</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Éditeur de code</span>
                    <span className="font-medium">Monaco Editor</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Animations</span>
                    <span className="font-medium">Framer Motion</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Enregistrement</span>
                    <span className="font-medium">RecordRTC</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Conversion vidéo</span>
                    <span className="font-medium">FFmpeg.wasm</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Design</span>
                    <span className="font-medium">Tailwind CSS</span>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-3">
                <div className="p-4 bg-accent/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Tous les paramètres sont automatiquement sauvegardés dans votre navigateur
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
