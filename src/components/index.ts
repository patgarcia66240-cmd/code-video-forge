/**
 * Point d'entrée central pour les composants de l'application
 * Exporte tous les composants de manière organisée
 */

// Layout principal
export { default as VSCodeLayout } from './VSCodeLayout';
export { default as ActivityBar } from './ActivityBar';
export { default as NavLink } from './NavLink';

// Composants principaux
export { default as CodeEditor } from './CodeEditor';
export { default as VideoPreview } from './VideoPreview';
export { default as TypingSimulator } from './TypingSimulator';

// Composants de la TypingSimulator
export { default as TypingControls } from './TypingSimulator/TypingControls';
export { default as RecordingControls } from './TypingSimulator/RecordingControls';
export { default as TimelinePanel } from './TypingSimulator/TimelinePanel';
export { default as VideoPreviewPanel } from './TypingSimulator/VideoPreviewPanel';

// Composants d'état et d'information
export { default as StatusIndicator } from './StatusIndicator';
export { default as VideoInfoPanel } from './VideoInfoPanel';

// Composants de configuration
export { default as SettingsDialog } from './SettingsDialog';
export { default as RecordingGuide } from './RecordingGuide';
export { default as SliderSpeed } from './SliderSpeed';

// Réexporter les composants UI pour un accès facile
export * from './ui';