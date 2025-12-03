/**
 * Point d'entrée central pour les composants de l'application
 * Exporte tous les composants de manière organisée
 */

// Layout principal
export { default as VSCodeLayout } from './VSCodeLayout';
export { default as ActivityBar } from './ActivityBar';

// Composants principaux
export { default as CodeEditor } from './CodeEditor';
export { default as VideoPreview } from './VideoPreview';
export { default as TypingSimulator } from './TypingSimulator';

// Composants de la TypingSimulator
export { TypingControls } from './TypingSimulator/TypingControls';
export { RecordingControls } from './TypingSimulator/RecordingControls';
export { TimelinePanel } from './TypingSimulator/TimelinePanel';
export { VideoPreviewPanel } from './TypingSimulator/VideoPreviewPanel';

// Composants d'état et d'information
export { default as StatusIndicator } from './StatusIndicator';
export { default as VideoInfoPanel } from './VideoInfoPanel';

// Composants de configuration
export { default as SettingsDialog } from './SettingsDialog';
export { default as RecordingGuide } from './RecordingGuide';
export { default as SliderSpeed } from './SliderSpeed';
