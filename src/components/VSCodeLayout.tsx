import { ReactNode } from "react";
import { MdCode, MdAccountTree } from "react-icons/md";
import ActivityBar from "./ActivityBar";

interface VSCodeLayoutProps {
  children: ReactNode;
  activeView?: 'explorer' | 'simulation' | 'preview';
  onSettingsClick?: () => void;
  onExplorerClick?: () => void;
  onSimulationClick?: () => void;
  onPreviewClick?: () => void;
}

const VSCodeLayout = ({ children, activeView, onSettingsClick, onExplorerClick, onSimulationClick, onPreviewClick }: VSCodeLayoutProps) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Title Bar */}
      <div className="h-9 bg-vscode-titlebar flex items-center px-4 text-xs text-muted-foreground border-b border-border">
        <MdCode className="w-4 h-4 mr-2" />
        <span>Code Typing Simulator - typing-demo.py</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar 
          activeView={activeView}
          onSettingsClick={onSettingsClick} 
          onExplorerClick={onExplorerClick}
          onSimulationClick={onSimulationClick}
          onPreviewClick={onPreviewClick}
        />

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
