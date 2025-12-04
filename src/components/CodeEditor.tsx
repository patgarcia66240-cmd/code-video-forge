import Editor from "@monaco-editor/react";
import { MdPlayArrow, MdDownload, MdInfo, MdSave, MdUpdate } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SaveModal from "@/components/SaveModal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useRef } from "react";
import { MdUpload } from "react-icons/md";
import { useCodeStorage } from "@/hooks/useCodeStorage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useForgeCurrentFileName } from "@/store/useForgeStore";
import { generateAndUploadThumbnail } from "@/utils/codeThumbnailGenerator";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onStartSimulation: () => void;
  onSettingsReady?: (callback: () => void) => void;
  onFileNameChange?: (fileName: string) => void;
  initialFileName?: string;
}

const CodeEditor = ({ code, setCode, onStartSimulation, onSettingsReady, onFileNameChange, initialFileName }: CodeEditorProps) => {
  // Utiliser le nom de fichier depuis le store global
  const globalFileName = useForgeCurrentFileName();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fileName, setFileName] = useState(globalFileName);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [tempFileName, setTempFileName] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveModalType, setSaveModalType] = useState<'create' | 'update'>('create');
  const [saveModalFileName, setSaveModalFileName] = useState("");
  const { saveCode, updateCode, isLoading, savedCodes } = useCodeStorage();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fournir la fonction d'ouverture des paramètres au parent
  useEffect(() => {
    if (onSettingsReady) {
      onSettingsReady(() => () => setIsSettingsOpen(true));
    }
  }, [onSettingsReady]);

  // Synchroniser le nom de fichier avec le store global et prioriser initialFileName
  useEffect(() => {
    // Priorité: initialFileName > globalFileName > fileName actuel
    if (initialFileName && initialFileName !== fileName) {
      setFileName(initialFileName);
    } else if (globalFileName && globalFileName !== fileName) {
      setFileName(globalFileName);
    }
  }, [initialFileName, globalFileName]);

  // Notifier le parent quand le nom de fichier change
  useEffect(() => {
    if (onFileNameChange) {
      console.log('🔍 CodeEditor - fileName changing to:', fileName);
      onFileNameChange(fileName);
    }
  }, [fileName, onFileNameChange]);

  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileNameInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileNameDoubleClick = () => {
    setTempFileName(fileName);
    setIsEditingFileName(true);
    setTimeout(() => {
      fileNameInputRef.current?.focus();
      fileNameInputRef.current?.select();
    }, 0);
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempFileName(e.target.value);
  };

  const handleFileNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmFileNameChange();
    } else if (e.key === 'Escape') {
      cancelFileNameChange();
    }
  };

  const handleFileNameBlur = () => {
    confirmFileNameChange();
  };

  const confirmFileNameChange = () => {
    if (tempFileName.trim() && tempFileName !== fileName) {
      setFileName(tempFileName.trim());
      toast({
        title: "Fichier renommé",
        description: `Le fichier a été renommé en "${tempFileName.trim()}"`,
      });
    }
    setIsEditingFileName(false);
  };

  const cancelFileNameChange = () => {
    setIsEditingFileName(false);
    setTempFileName(fileName);
  };

  const handleModalConfirm = async () => {
    try {
      if (saveModalType === 'update') {
        // Mettre à jour le code existant
        const existingCode = savedCodes.find(savedCode => savedCode.title === saveModalFileName);
        if (existingCode) {
          const updatedResult = await updateCode(existingCode.id, {
            code: code,
            language: "python",
            description: "Code mis à jour avec Code Typing Simulator",
            tags: ["typing-demo", "python", "animation"]
          });

          if (updatedResult) {
            // Regénérer et uploader la vignette
            const thumbnailUrl = await generateAndUploadThumbnail(
              code,
              "python",
              existingCode.id,
              user.id
            );

            if (thumbnailUrl) {
              await updateCode(existingCode.id, { thumbnail: thumbnailUrl });
            }

            toast({
              title: "Code mis à jour !",
              description: `"${saveModalFileName}" a été mis à jour avec succès`,
            });
          }
        }
      } else {
        // Créer un nouveau code
        const result = await saveCode(
          code,
          "python",
          saveModalFileName,
          "Code créé avec Code Typing Simulator",
          ["typing-demo", "python", "animation"]
        );

        if (result && result.id) {
          // Générer et uploader la vignette
          const thumbnailUrl = await generateAndUploadThumbnail(
            code,
            "python",
            result.id,
            user.id
          );

          if (thumbnailUrl) {
            // Mettre à jour le code avec l'URL de la vignette
            await updateCode(result.id, { thumbnail: thumbnailUrl });

            toast({
              title: "Code sauvegardé !",
              description: `"${saveModalFileName}" a été ajouté à vos collections`,
            });
          } else {
            toast({
              title: "Code sauvegardé !",
              description: `"${saveModalFileName}" a été ajouté, mais la vignette n'a pas pu être générée`,
              variant: "default",
            });
          }
        }
      }
      setSaveModalOpen(false);
    } catch (error) {
      console.error('Erreur sauvegarde/mise à jour code:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde/mise à jour",
        variant: "destructive",
      });
    }
  };

  const handleModalCancel = () => {
    setSaveModalOpen(false);
    setSaveModalFileName("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setCode(text);
      // Extraire le nom de fichier (sans l'extension pour garder l'extension .py)
      const fileNameWithExt = file.name;
      const parts = fileNameWithExt.split('.');
      if (parts.length > 1) {
        parts.pop(); // Enlever l'extension
        const fileNameWithoutExt = parts.join('.');
        setFileName(fileNameWithoutExt + '.py');
      } else {
        setFileName(fileNameWithExt + '.py');
      }
    };
    reader.readAsText(file);
    // reset input so the same file can be selected again if needed
    e.currentTarget.value = "";
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCode = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour sauvegarder votre code",
        variant: "destructive",
      });
      // Rediriger vers la page de login
      window.location.href = '/auth';
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Code vide",
        description: "Veuillez écrire du code avant de le sauvegarder",
        variant: "destructive",
      });
      return;
    }

    try {
      // Vérifier si un code avec le même titre existe déjà
      const existingCode = savedCodes.find(savedCode => savedCode.title === fileName);

      if (existingCode) {
        // Afficher la modale de mise à jour
        setSaveModalType('update');
        setSaveModalFileName(fileName);
        setSaveModalOpen(true);
      } else {
        // Afficher la modale de création
        setSaveModalType('create');
        setSaveModalFileName(fileName);
        setSaveModalOpen(true);
      }
    } catch (error) {
      console.error('Erreur sauvegarde/mise à jour code:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde/mise à jour",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-editor">
      {/* Tab Bar */}
      <div className="h-10 bg-panel-bg flex items-center px-4 border-b border-border mb-0">
        <div
          className="flex items-center gap-2 px-3 py-1 bg-editor rounded-t border-t-2 border-primary cursor-pointer hover:bg-editor/80 transition-colors group"
          onDoubleClick={handleFileNameDoubleClick}
          title="Double-cliquer pour renommer"
        >
          {isEditingFileName ? (
            <input
              ref={fileNameInputRef}
              type="text"
              value={tempFileName}
              onChange={handleFileNameChange}
              onKeyDown={handleFileNameKeyDown}
              onBlur={handleFileNameBlur}
              className="text-sm text-foreground bg-transparent border-none outline-none w-32"
              style={{ minWidth: '100px' }}
            />
          ) : (
            <span className="text-sm text-foreground select-none group-hover:text-primary/80">
              {fileName}
            </span>
          )}
        </div>
        {isEditingFileName && (
          <div className="text-xs text-muted-foreground ml-2">
            <span className="bg-muted px-1 rounded">Entrée pour valider</span>
            <span className="bg-muted px-1 rounded ml-1">Échap pour annuler</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-panel-bg border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center gap-2">
          <Button 
            onClick={onStartSimulation}
            className="bg-vscode-button hover:bg-vscode-button-hover text-white"
            size="sm"
          >
            <MdPlayArrow className="w-4 h-4 mr-2" />
            Lancer la simulation
          </Button>
          <Button 
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="border-border hover:bg-secondary"
          >
            <MdDownload className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button
            onClick={handleImportClick}
            variant="outline"
            size="sm"
            className="border-border hover:bg-secondary"
          >
            <MdUpload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <Button
            onClick={handleSaveCode}
            variant="default"
            size="sm"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MdSave className="w-4 h-4 mr-2" />
            Sauver dans mes collections
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.txt"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden
          />
        </div>
        
        <Card className="bg-editor/50 border-primary/20 p-3">
          <div className="flex items-start gap-2">
            <MdInfo className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Enregistrement vidéo disponible</p>
              <p>Lancez la simulation puis cliquez sur <strong>Enregistrer</strong> pour capturer l'animation en MP4</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value || "")}
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
          }}
        />
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres</DialogTitle>
            <DialogDescription>
              Les paramètres de simulation sont disponibles une fois que vous avez lancé la simulation.
              Cliquez sur "Lancer la simulation" pour accéder aux options de vitesse, format vidéo, et raccourcis clavier.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Save Modal */}
      <SaveModal
        isOpen={saveModalOpen}
        type={saveModalType}
        fileName={saveModalFileName}
        code={code}
        isLoading={isLoading}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};

export default CodeEditor;
