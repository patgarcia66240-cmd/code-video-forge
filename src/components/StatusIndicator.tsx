import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Square,
  Circle,
  Video,
  Settings,
  FileCode,
  Eye
} from 'lucide-react';
import { useAppStatus } from '@/hooks/useAppStatus';
import { useAppStatusStore } from '@/store/useAppStatusStore';
import {
  AppPhase,
  SimulationStatus,
  RecordingStatus,
  ConversionStatus
} from '@/types/appStatus';

interface StatusIndicatorProps {
  className?: string;
  showProgress?: boolean;
  compact?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  className = '',
  showProgress = true,
  compact = false
}) => {
  const {
    phase,
    appStatus,
    simulationStatus,
    recordingStatus,
    conversionStatus,
    progress,
    hasError
  } = useAppStatus();

  // Fonctions locales pour les messages
  const getStatusMessage = (status: string, type: 'simulation' | 'recording' | 'conversion') => {
    switch (status) {
      case 'playing':
        return type === 'simulation' ? 'Simulation en cours...' :
               type === 'recording' ? 'Enregistrement en cours...' : 'Conversion en cours...';
      case 'paused':
        return 'En pause';
      case 'completed':
        return type === 'simulation' ? 'Simulation terminée' :
               type === 'recording' ? 'Enregistrement terminé' : 'Conversion terminée';
      case 'error':
      case 'failed':
        return `${type === 'simulation' ? 'Simulation' :
                 type === 'recording' ? 'Enregistrement' : 'Conversion'} a échoué`;
      case 'processing':
        return 'Traitement en cours...';
      case 'preparing':
        return 'Préparation...';
      case 'idle':
        return 'En attente';
      default:
        return status;
    }
  };

  const globalMessage = hasError ? useAppStatusStore.getState().lastError :
                      (appStatus === 'busy' ? 'Opération en cours...' : '');

  // Configuration des icônes et couleurs pour chaque status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'playing':
      case 'recording':
      case 'converting':
      case 'busy':
        return {
          icon: Loader2,
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          variant: 'default' as const,
          animation: 'animate-spin'
        };
      case 'completed':
      case 'ready':
        return {
          icon: CheckCircle,
          color: 'bg-green-500',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          variant: 'default' as const,
          animation: ''
        };
      case 'paused':
        return {
          icon: Pause,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          variant: 'default' as const,
          animation: ''
        };
      case 'error':
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'bg-red-500',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          variant: 'destructive' as const,
          animation: ''
        };
      case 'idle':
        return {
          icon: Circle,
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          variant: 'secondary' as const,
          animation: ''
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          variant: 'secondary' as const,
          animation: ''
        };
    }
  };

  // Configuration pour les phases
  const getPhaseConfig = (phase: AppPhase) => {
    switch (phase) {
      case AppPhase.EDITOR:
        return {
          icon: FileCode,
          label: 'Éditeur',
          color: 'bg-purple-500'
        };
      case AppPhase.SIMULATION:
        return {
          icon: Play,
          label: 'Simulation',
          color: 'bg-blue-500'
        };
      case AppPhase.PREVIEW:
        return {
          icon: Eye,
          label: 'Aperçu',
          color: 'bg-green-500'
        };
      case AppPhase.SETTINGS:
        return {
          icon: Settings,
          label: 'Paramètres',
          color: 'bg-gray-500'
        };
      default:
        return {
          icon: FileCode,
          label: 'Inconnu',
          color: 'bg-gray-500'
        };
    }
  };

  const phaseConfig = getPhaseConfig(phase);
  const appConfig = getStatusConfig(appStatus);

  // Version compacte
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge
          variant={appConfig.variant}
          className={`${appConfig.borderColor} ${appConfig.textColor}`}
        >
          <phaseConfig.icon className="w-3 h-3 mr-1" />
          {phaseConfig.label}
        </Badge>
        {progress !== undefined && showProgress && (
          <Progress value={progress} className="w-16 h-2" />
        )}
      </div>
    );
  }

  // Version complète
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barre de status principale */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Phase actuelle */}
          <Badge
            variant="outline"
            className={`${phaseConfig.color} text-white border-none`}
          >
            <phaseConfig.icon className="w-4 h-4 mr-2" />
            {phaseConfig.label}
          </Badge>

          {/* Status global */}
          <Badge
            variant={appConfig.variant}
            className={`${appConfig.borderColor} ${appConfig.textColor}`}
          >
            <appConfig.icon className={`w-4 h-4 mr-2 ${appConfig.animation}`} />
            {appStatus}
          </Badge>
        </div>

        {/* Message global */}
        {globalMessage && (
          <span className="text-sm text-muted-foreground">
            {globalMessage}
          </span>
        )}
      </div>

      {/* Barre de progression */}
      {progress !== undefined && showProgress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Détails des status par opération */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        {/* Status de simulation */}
        {phase === AppPhase.SIMULATION && (() => {
          const simConfig = getStatusConfig(simulationStatus);
          const SimIcon = simConfig.icon;
          return (
            <div className="flex items-center gap-2 p-2 rounded border">
              <SimIcon className={`w-4 h-4 ${simConfig.animation}`} />
              <div className="flex-1">
                <div className="font-medium">Simulation</div>
                <div className="text-xs text-muted-foreground">
                  {getStatusMessage(simulationStatus, 'simulation')}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Status d'enregistrement */}
        {(recordingStatus !== 'idle') && (() => {
          const recConfig = getStatusConfig(recordingStatus);
          const RecIcon = recConfig.icon;
          return (
            <div className="flex items-center gap-2 p-2 rounded border">
              <RecIcon className={`w-4 h-4 ${recConfig.animation}`} />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <Video className="w-3 h-3" />
                  Enregistrement
                </div>
                <div className="text-xs text-muted-foreground">
                  {getStatusMessage(recordingStatus, 'recording')}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Status de conversion */}
        {(conversionStatus !== 'idle') && (() => {
          const convConfig = getStatusConfig(conversionStatus);
          const ConvIcon = convConfig.icon;
          return (
            <div className="flex items-center gap-2 p-2 rounded border">
              <ConvIcon className={`w-4 h-4 ${convConfig.animation}`} />
              <div className="flex-1">
                <div className="font-medium">Conversion</div>
                <div className="text-xs text-muted-foreground">
                  {getStatusMessage(conversionStatus, 'conversion')}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Message d'erreur */}
      {hasError && (
        <div className="p-3 rounded bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Erreur</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {useAppStatusStore.getState().lastError}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;