import { MdInsertDriveFile, MdPlayArrow, MdAccountTree, MdSettings } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActivityBarProps {
  onSettingsClick?: () => void;
  onExplorerClick?: () => void;
  onSimulationClick?: () => void;
}

const ActivityBar = ({ onSettingsClick, onExplorerClick, onSimulationClick }: ActivityBarProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-12 bg-vscode-activitybar flex flex-col items-center py-4 gap-4 border-r border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-2 hover:bg-secondary rounded transition-colors"
              onClick={onExplorerClick}
            >
              <MdInsertDriveFile className="w-5 h-5 text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Explorateur</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-2 hover:bg-secondary rounded transition-colors"
              onClick={onSimulationClick}
            >
              <MdPlayArrow className="w-5 h-5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Lancer la simulation</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="p-2 hover:bg-secondary rounded transition-colors">
              <MdAccountTree className="w-5 h-5 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Contrôle de code source</p>
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
