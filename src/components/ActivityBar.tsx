import { MdInsertDriveFile, MdPlayArrow, MdOndemandVideo, MdSettings, MdViewList } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityBarProps {
  activeView?: 'explorer' | 'simulation' | 'preview' | 'gallery';
  onSettingsClick?: () => void;
  onExplorerClick?: () => void;
  onSimulationClick?: () => void;
  onPreviewClick?: () => void;
  onGalleryClick?: () => void;
}

const ActivityBar = ({ activeView, onSettingsClick, onExplorerClick, onSimulationClick, onPreviewClick, onGalleryClick }: ActivityBarProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-12 bg-vscode-activitybar flex flex-col items-center py-4 gap-4 border-r border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-2 hover:bg-secondary rounded transition-colors"
              onClick={onExplorerClick}
            >
              <MdInsertDriveFile className={`w-5 h-5 ${activeView === 'explorer' ? 'text-primary' : 'text-muted-foreground'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Editeur</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-2 hover:bg-secondary rounded transition-colors"
              onClick={onSimulationClick}
            >
              <MdPlayArrow className={`w-5 h-5 ${activeView === 'simulation' ? 'text-primary' : 'text-muted-foreground'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Lancer la simulation</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-2 hover:bg-secondary rounded transition-colors"
              onClick={onPreviewClick}
            >
              <MdOndemandVideo className={`w-5 h-5 ${activeView === 'preview' ? 'text-primary' : 'text-muted-foreground'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Aperçu vidéo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-2 hover:bg-secondary rounded transition-colors"
              onClick={onGalleryClick}
            >
              <MdViewList className={`w-5 h-5 ${activeView === 'gallery' ? 'text-primary' : 'text-muted-foreground'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Liste des vidéos</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-2 hover:bg-secondary rounded transition-colors mt-auto"
              onClick={onSettingsClick}
            >
              <MdSettings className="w-5 h-5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Paramètres</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ActivityBar;
