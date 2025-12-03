import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VSCodeLayout from "@/components/VSCodeLayout";
import CodeEditor from "@/components/CodeEditor";
import TypingSimulator from "@/components/TypingSimulator";
import VideoPreview from "@/components/VideoPreview";
import Gallery from "@/pages/Gallery";
import { useForgeStore } from "@/store/useForgeStore";

const Index = () => {
  // Utiliser le store global au lieu des useState locaux
  const {
    code,
    isSimulating,
    showVideoPreview,
    recordedBlob,
    videoPreviewUrl,
    setCode,
    startSimulation,
    stopSimulation,
    showPreview,
    resetToEditor,
    setRecordedBlob,
    setVideoPreviewUrl,
  } = useForgeStore();

  const [showGallery, setShowGallery] = useState(false);
  const [onSettingsClick, setOnSettingsClick] = useState<(() => void) | undefined>(undefined);
  const [onCodeEditorSettingsClick, setOnCodeEditorSettingsClick] = useState<(() => void) | undefined>(undefined);

  // Utiliser la bonne fonction selon la vue active
  const activeSettingsClick = isSimulating ? onSettingsClick : onCodeEditorSettingsClick;

  // Déterminer la vue active
  const activeView = showGallery ? 'gallery' : showVideoPreview ? 'preview' : isSimulating ? 'simulation' : 'explorer';

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
    resetToEditor();
  };

  const navigate = useNavigate();

  const handleShowGallery = () => {
    setShowGallery(true);
  };

  const handleBackFromGallery = () => {
    setShowGallery(false);
  };

  const handleNavigateToAuth = () => {
    navigate('/auth?redirect=/');
  };

  return (
    <VSCodeLayout
      activeView={activeView}
      onSettingsClick={activeSettingsClick}
      onExplorerClick={() => {
        setShowGallery(false);
        resetToEditor();
      }}
      onSimulationClick={() => {
        setShowGallery(false);
        startSimulation();
      }}
      onPreviewClick={() => {
        if (videoPreviewUrl && recordedBlob) {
          setShowGallery(false);
          showPreview();
        }
      }}
      onGalleryClick={handleShowGallery}
    >
      {showGallery ? (
        <Gallery embedded onBack={handleBackFromGallery} />
      ) : showVideoPreview && videoPreviewUrl && recordedBlob ? (
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
          onStartSimulation={startSimulation}
          onSettingsReady={setOnCodeEditorSettingsClick}
        />
      ) : (
        <TypingSimulator
          code={code}
          onComplete={stopSimulation}
          onSettingsReady={setOnSettingsClick}
          onVideoRecorded={(blob) => {
            setRecordedBlob(blob);
            // Créer l'URL automatiquement quand on reçoit le blob
            const url = URL.createObjectURL(blob);
            setVideoPreviewUrl(url);
            showPreview();
          }}
        />
      )}
    </VSCodeLayout>
  );
};

export default Index;
