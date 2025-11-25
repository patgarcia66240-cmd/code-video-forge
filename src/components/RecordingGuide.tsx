import { motion } from "framer-motion";
import { Info, Monitor, Video } from "lucide-react";
import { Card } from "@/components/ui/card";

const RecordingGuide = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-20 right-4 z-50 max-w-sm"
    >
      <Card className="bg-panel-bg border-border p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Guide d'enregistrement</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Monitor className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Cliquez sur <strong>Enregistrer</strong> et sélectionnez l'onglet du navigateur</p>
              </div>
              <div className="flex items-start gap-2">
                <Video className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>L'animation sera capturée en temps réel avec l'audio système (optionnel)</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border space-y-1">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Astuce</strong> : Plein écran pour meilleure qualité
              </p>
              <p className="text-xs text-primary">
                ✨ La vidéo sera automatiquement convertie en MP4
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RecordingGuide;
