import Editor from "@monaco-editor/react";
import { Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onStartSimulation: () => void;
}

const CodeEditor = ({ code, setCode, onStartSimulation }: CodeEditorProps) => {
  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.py";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-editor">
      {/* Tab Bar */}
      <div className="h-10 bg-panel-bg flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1 bg-editor rounded-t border-t-2 border-primary">
          <span className="text-sm text-foreground">typing-demo.py</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-12 bg-panel-bg border-b border-border flex items-center px-4 gap-2">
        <Button 
          onClick={onStartSimulation}
          className="bg-vscode-button hover:bg-vscode-button-hover text-white"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Lancer la simulation
        </Button>
        <Button 
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </Button>
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
    </div>
  );
};

export default CodeEditor;
