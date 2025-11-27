/**
 * Exemple d'intégration du système de status dans l'application
 * Montre comment utiliser le hook et le composant StatusIndicator
 */

import React, { useEffect } from 'react';
import StatusIndicator from '@/components/StatusIndicator';
import { useAppStatus } from '@/hooks/useAppStatus';
import { AppPhase, SimulationStatus, RecordingStatus } from '@/types/appStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  Square,
  Video,
  Settings,
  FileCode,
  Eye,
  RotateCcw
} from 'lucide-react';

const StatusIntegrationExample: React.FC = () => {
  const {
    // État
    phase,
    appStatus,
    simulationStatus,
    recordingStatus,
    progress,
    hasError,
    isBusy,

    // Utilitaires
    isEditorMode,
    isSimulationMode,
    isPreviewMode,

    // Actions navigation
    goToEditor,
    goToSimulation,
    goToPreview,
    goToSettings,

    // Actions simulation
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    completeSimulation,

    // Actions enregistrement
    startRecording,
    stopRecording,
    completeRecording,

    // Actions utilitaires
    setError,
    clearError,
    setProgress,
    clearProgress,

    // États calculés
    canStartSimulation,
    canStartRecording,
    canConvertVideo
  } = useAppStatus();

  // Simulation de progression
  useEffect(() => {
    if ((recordingStatus === 'recording' || recordingStatus === 'converting') && progress !== undefined) {
      const timer = setTimeout(() => {
        if (progress < 100) {
          setProgress(progress + 10);
        } else {
          if (recordingStatus === 'recording') {
            completeRecording();
          } else {
            // completeConversion();
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [recordingStatus, progress, setProgress, completeRecording]);

  // Handlers
  const handleStartSimulation = () => {
    if (!canStartSimulation) return;
    goToSimulation();
    startSimulation();

    // Simuler la fin après 3 secondes
    setTimeout(() => {
      completeSimulation();
    }, 3000);
  };

  const handlePauseResumeSimulation = () => {
    if (simulationStatus === 'playing') {
      pauseSimulation();
    } else if (simulationStatus === 'paused') {
      resumeSimulation();
    }
  };

  const handleStopSimulation = () => {
    stopSimulation();
    goToEditor();
  };

  const handleStartRecording = () => {
    if (!canStartRecording) return;
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();

    // Simuler la complétion après 1 seconde
    setTimeout(() => {
      completeRecording();
      goToPreview();
    }, 1000);
  };

  const handleSimulateError = () => {
    setError('Ceci est une erreur simulée pour tester le système');
  };

  const handleReset = () => {
    clearError();
    clearProgress();
    goToEditor();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Titre et status principal */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Exemple d'intégration du système de status</h1>
        <StatusIndicator />
      </div>

      {/* Contrôles de navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={phase === AppPhase.EDITOR ? 'default' : 'outline'}
              onClick={goToEditor}
              disabled={isBusy}
            >
              <FileCode className="w-4 h-4 mr-2" />
              Éditeur
            </Button>
            <Button
              variant={phase === AppPhase.SIMULATION ? 'default' : 'outline'}
              onClick={goToSimulation}
              disabled={isBusy}
            >
              <Play className="w-4 h-4 mr-2" />
              Simulation
            </Button>
            <Button
              variant={phase === AppPhase.PREVIEW ? 'default' : 'outline'}
              onClick={goToPreview}
              disabled={isBusy}
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button
              variant={phase === AppPhase.SETTINGS ? 'default' : 'outline'}
              onClick={goToSettings}
              disabled={isBusy}
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles par phase */}
      <Tabs value={phase} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value={AppPhase.EDITOR} disabled={!isEditorMode}>
            <FileCode className="w-4 h-4 mr-2" />
            Éditeur
          </TabsTrigger>
          <TabsTrigger value={AppPhase.SIMULATION} disabled={!isSimulationMode}>
            <Play className="w-4 h-4 mr-2" />
            Simulation
          </TabsTrigger>
          <TabsTrigger value={AppPhase.PREVIEW} disabled={!isPreviewMode}>
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value={AppPhase.SETTINGS} disabled={phase !== AppPhase.SETTINGS}>
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value={AppPhase.EDITOR} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mode Éditeur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Mode éditeur actif. Vous pouvez commencer une simulation ici.
              </p>
              <Button
                onClick={handleStartSimulation}
                disabled={!canStartSimulation}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Commencer la simulation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={AppPhase.SIMULATION} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contrôles de simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handlePauseResumeSimulation}
                  disabled={simulationStatus !== 'playing' && simulationStatus !== 'paused'}
                  variant={simulationStatus === 'playing' ? 'secondary' : 'default'}
                >
                  {simulationStatus === 'playing' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Reprendre
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleStopSimulation}
                  disabled={simulationStatus === 'idle'}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Arrêter
                </Button>
                <Button
                  onClick={handleStartRecording}
                  disabled={!canStartRecording}
                  variant="secondary"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
              <StatusIndicator compact showProgress />
            </CardContent>
          </Card>

          {recordingStatus !== 'idle' && (
            <Card>
              <CardHeader>
                <CardTitle>Enregistrement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {recordingStatus === 'recording' && (
                    <Button onClick={handleStopRecording} variant="destructive">
                      <Square className="w-4 h-4 mr-2" />
                      Arrêter l'enregistrement
                    </Button>
                  )}
                  {progress !== undefined && (
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">
                        Progression: {progress}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value={AppPhase.PREVIEW} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mode Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Mode aperçu actif. La vidéo enregistrée serait affichée ici.
              </p>
              <StatusIndicator compact />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={AppPhase.SETTINGS} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mode Paramètres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Mode paramètres actif. Configurez les options de l'application ici.
              </p>
              <StatusIndicator compact />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contrôles de débogage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Débogage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={handleSimulateError}
              variant="outline"
              size="sm"
            >
              Simuler une erreur
            </Button>
            <Button
              onClick={clearError}
              variant="outline"
              size="sm"
              disabled={!hasError}
            >
              Effacer l'erreur
            </Button>
            <Button
              onClick={() => setProgress(50)}
              variant="outline"
              size="sm"
            >
              Set progress 50%
            </Button>
            <Button
              onClick={clearProgress}
              variant="outline"
              size="sm"
              disabled={progress === undefined}
            >
              Effacer progress
            </Button>
          </div>
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser tout
          </Button>
        </CardContent>
      </Card>

      {/* État actuel (pour le débogage) */}
      <Card>
        <CardHeader>
          <CardTitle>État actuel (débogage)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto">
            {JSON.stringify({
              phase,
              appStatus,
              simulationStatus,
              recordingStatus,
              progress,
              hasError,
              isBusy,
              canStartSimulation,
              canStartRecording,
              canConvertVideo
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusIntegrationExample;