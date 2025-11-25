import { ReactNode } from "react";
import { MdCode, MdInsertDriveFile, MdAccountTree, MdSearch, MdSettings, MdPlayArrow } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VSCodeLayoutProps {
  children: ReactNode;
  onSettingsClick?: () => void;
}

const VSCodeLayout = ({ children, onSettingsClick }: VSCodeLayoutProps) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Title Bar */}
      <div className="h-9 bg-vscode-titlebar flex items-center px-4 text-xs text-muted-foreground border-b border-border">
        <MdCode className="w-4 h-4 mr-2" />
        <span>Code Typing Simulator - typing-demo.py</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <TooltipProvider delayDuration={300}>
          <div className="w-12 bg-vscode-activitybar flex flex-col items-center py-4 gap-4 border-r border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-secondary rounded transition-colors">
                  <MdInsertDriveFile className="w-5 h-5 text-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Explorateur</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-secondary rounded transition-colors">
                  <MdSearch className="w-5 h-5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Rechercher</p>
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-vscode-statusbar flex items-center px-4 text-xs text-white">
        <MdAccountTree className="w-3 h-3 mr-2" />
        <span className="mr-4">main</span>
        <span className="mr-4">Python</span>
        <span className="ml-auto">UTF-8</span>
        <span className="ml-4">LF</span>
      </div>
    </div>
  );
};

export default VSCodeLayout;
