import { ReactNode } from "react";
import { Code2, FileCode, GitBranch, Search, Settings, Play } from "lucide-react";

interface VSCodeLayoutProps {
  children: ReactNode;
}

const VSCodeLayout = ({ children }: VSCodeLayoutProps) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Title Bar */}
      <div className="h-9 bg-vscode-titlebar flex items-center px-4 text-xs text-muted-foreground border-b border-border">
        <Code2 className="w-4 h-4 mr-2" />
        <span>Code Typing Simulator - typing-demo.py</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-vscode-activitybar flex flex-col items-center py-4 gap-4 border-r border-border">
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <FileCode className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors">
            <GitBranch className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors mt-auto">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-vscode-statusbar flex items-center px-4 text-xs text-white">
        <GitBranch className="w-3 h-3 mr-2" />
        <span className="mr-4">main</span>
        <span className="mr-4">Python</span>
        <span className="ml-auto">UTF-8</span>
        <span className="ml-4">LF</span>
      </div>
    </div>
  );
};

export default VSCodeLayout;
