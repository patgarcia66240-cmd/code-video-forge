import { useState, useEffect } from "react";
import VSCodeLayout from "@/components/VSCodeLayout";
import CodeEditor from "@/components/CodeEditor";
import TypingSimulator from "@/components/TypingSimulator";
import VideoPreview from "@/components/VideoPreview";

const Index = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [code, setCode] = useState(`# Bienvenue dans le simulateur de code
# Ce simulateur reproduit l'écriture de code en temps réel

def fibonacci(n):
    """Calcule la suite de Fibonacci"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Exemple d'utilisation
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

class DataProcessor:
    def __init__(self, data):
        self.data = data
    
    def process(self):
        """Traite les données"""
        return [x * 2 for x in self.data]

# Instance et utilisation
processor = DataProcessor([1, 2, 3, 4, 5])
result = processor.process()
print(f"Résultat: {result}")
`);

  const [onSettingsClick, setOnSettingsClick] = useState<(() => void) | undefined>(undefined);
  const [onCodeEditorSettingsClick, setOnCodeEditorSettingsClick] = useState<(() => void) | undefined>(undefined);

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

  // Utiliser la bonne fonction selon la vue active
  const activeSettingsClick = isSimulating ? onSettingsClick : onCodeEditorSettingsClick;

  const handleDownloadVideo = () => {
    if (recordedBlob && videoPreviewUrl) {
      const a = document.createElement("a");
      a.href = videoPreviewUrl;
      const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      a.download = `typing-animation-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDeleteVideo = () => {
    setRecordedBlob(null);
    setVideoPreviewUrl(null);
    setShowVideoPreview(false);
  };

  return (
    <VSCodeLayout 
      onSettingsClick={activeSettingsClick}
      onExplorerClick={() => {
        setIsSimulating(false);
        setShowVideoPreview(false);
      }}
      onSimulationClick={() => {
        setIsSimulating(true);
        setShowVideoPreview(false);
      }}
      onPreviewClick={() => {
        if (videoPreviewUrl && recordedBlob) {
          setShowVideoPreview(true);
          setIsSimulating(false);
        }
      }}
    >
      {showVideoPreview && videoPreviewUrl && recordedBlob ? (
        <VideoPreview
          videoUrl={videoPreviewUrl}
          videoBlob={recordedBlob}
          onDownload={handleDownloadVideo}
          onDelete={handleDeleteVideo}
        />
      ) : !isSimulating ? (
        <CodeEditor 
          code={code} 
          setCode={setCode} 
          onStartSimulation={() => setIsSimulating(true)}
          onSettingsReady={setOnCodeEditorSettingsClick}
        />
      ) : (
        <TypingSimulator 
          code={code} 
          onComplete={() => setIsSimulating(false)}
          onSettingsReady={setOnSettingsClick}
          onVideoRecorded={(blob) => setRecordedBlob(blob)}
        />
      )}
    </VSCodeLayout>
  );
};

export default Index;
