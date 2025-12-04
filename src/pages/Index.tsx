import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VSCodeLayout from "@/components/VSCodeLayout";
import CodeEditor from "@/components/CodeEditor";
import TypingSimulator from "@/components/TypingSimulator";
import VideoPreview from "@/components/VideoPreview";
import Gallery from "@/pages/Gallery";
import CodesGallery from "@/pages/CodesGallery";
import { useForgeStore } from "@/store/useForgeStore";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  // Utiliser le store global au lieu des useState locaux
  const {
    code,
    isSimulating,
    showVideoPreview,
    recordedBlob,
    videoPreviewUrl,
    currentFileName,
    setCode,
    setCurrentFileName,
    startSimulation,
    stopSimulation,
    showPreview,
    resetToEditor,
    setRecordedBlob,
    setVideoPreviewUrl,
  } = useForgeStore();

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showGallery, setShowGallery] = useState(false);
  const [showCodesGallery, setShowCodesGallery] = useState(false);
  const [galleryFileName, setGalleryFileName] = useState<string | null>(null);
  const [onSettingsClick, setOnSettingsClick] = useState<(() => void) | undefined>(undefined);
  const [onCodeEditorSettingsClick, setOnCodeEditorSettingsClick] = useState<(() => void) | undefined>(undefined);

  // Utiliser la bonne fonction selon la vue active
  const activeSettingsClick = isSimulating ? onSettingsClick : onCodeEditorSettingsClick;

  // Déterminer la vue active - priorité : gallery > codes > preview > simulation > explorer
  const activeView = showGallery ? 'gallery' : showCodesGallery ? 'codes' : showVideoPreview ? 'preview' : isSimulating ? 'simulation' : 'explorer';

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

  const handleShowGallery = () => {
    // Vérifier si l'utilisateur est connecté avant d'afficher la galerie
    if (!user) {
      navigate('/auth?redirect=/gallery');
      return;
    }
    setShowGallery(true);
  };

  const handleBackFromGallery = () => {
    setShowGallery(false);
  };

  const handleEditCode = (savedCode: any) => {
    console.log('🔍 Index - handleEditCode:', { code: savedCode.code, title: savedCode.title });
    setCode(savedCode.code);
    setCurrentFileName(savedCode.title);
    setShowCodesGallery(false);
  };

  const handleBackFromCodesGallery = () => {
    setShowCodesGallery(false);
    // Revenir à l'éditeur en nettoyant les autres états
    setShowGallery(false);
  };

  // Gérer le code à éditer depuis navigation
  useEffect(() => {
    if (location.state?.codeToEdit) {
      const codeToEdit = location.state.codeToEdit;
      setCode(codeToEdit.code);
      // Stocker le nom du fichier pour le passer au CodeEditor
      setGalleryFileName(codeToEdit.title);
      // Mettre à jour le nom du fichier actuel
      setCurrentFileName(codeToEdit.title);
      // Mettre à jour le titre du document
      document.title = `${codeToEdit.title} - Code Video Forge`;
      // Nettoyer le state pour ne pas le réutiliser
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setCode]);

  // Synchroniser le nom du fichier quand on quitte la vue de la galerie
  useEffect(() => {
    if (!showCodesGallery && galleryFileName) {
      // Si on sort de la galerie et qu'on avait un fichier de la galerie
      // mais qu'on est dans l'éditeur, on l'utilise
      if (!isSimulating && !showVideoPreview) {
        setGalleryFileName(null);
      }
    }
  }, [showCodesGallery, galleryFileName, isSimulating, showVideoPreview]);

  // Debug
  console.log('🔍 Debug Index:', {
    currentFileName,
    activeView,
    shouldShowFileName: activeView === 'explorer' || activeView === 'simulation'
  });

  return (
    <VSCodeLayout
      activeView={activeView}
      fileName={activeView === 'explorer' || activeView === 'simulation' ? currentFileName : undefined}
      onSettingsClick={activeSettingsClick}
      onExplorerClick={() => {
        setShowGallery(false);
        setShowCodesGallery(false);
        resetToEditor();
      }}
      onSimulationClick={() => {
        setShowGallery(false);
        setShowCodesGallery(false);
        startSimulation();
      }}
      onPreviewClick={() => {
        if (videoPreviewUrl && recordedBlob) {
          setShowGallery(false);
          setShowCodesGallery(false);
          showPreview();
        }
      }}
      onGalleryClick={handleShowGallery}
      onCodesClick={() => {
        if (!user) {
          navigate('/auth');
        } else {
          setShowCodesGallery(true);
          setShowGallery(false);
          // Ne pas resetToEditor ici pour éviter de perdre l'état
        }
      }}
    >
      {showGallery ? (
        <Gallery embedded onBack={handleBackFromGallery} />
      ) : showCodesGallery ? (
        <CodesGallery embedded onBack={handleBackFromCodesGallery} onEditCode={handleEditCode} />
      ) : showVideoPreview && videoPreviewUrl && recordedBlob ? (
        <VideoPreview
          videoUrl={videoPreviewUrl}
          videoBlob={recordedBlob}
          onDownload={handleDownloadVideo}
          onDelete={handleDeleteVideo}
          fileName={currentFileName}
        />
      ) : !isSimulating ? (
        <CodeEditor
          code={code}
          setCode={setCode}
          onStartSimulation={startSimulation}
          onSettingsReady={setOnCodeEditorSettingsClick}
          onFileNameChange={setCurrentFileName}
          initialFileName={galleryFileName}
        />
      ) : (
        <TypingSimulator
          code={code}
          onComplete={stopSimulation}
          onSettingsReady={setOnSettingsClick}
          fileName={currentFileName}
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
