import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Pause, Play, RotateCcw, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TypingSimulatorProps {
  code: string;
  onComplete: () => void;
}

const TypingSimulator = ({ code, onComplete }: TypingSimulatorProps) => {
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);

  useEffect(() => {
    if (currentIndex >= code.length) return;
    if (isPaused) return;

    const delay = Math.max(10, 100 - speed);
    const timer = setTimeout(() => {
      setDisplayedCode(code.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, code, isPaused, speed]);

  const handleReset = () => {
    setDisplayedCode("");
    setCurrentIndex(0);
    setIsPaused(false);
  };

  const progress = (currentIndex / code.length) * 100;

  return (
    <div className="flex-1 flex flex-col bg-editor">
      {/* Tab Bar */}
      <div className="h-10 bg-panel-bg flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1 bg-editor rounded-t border-t-2 border-primary">
          <span className="text-sm text-foreground">typing-demo.py</span>
          <span className="text-xs text-muted-foreground ml-2">
            {currentIndex} / {code.length} caractères
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="h-16 bg-panel-bg border-b border-border flex items-center px-4 gap-4">
        <Button
          onClick={() => setIsPaused(!isPaused)}
          className="bg-vscode-button hover:bg-vscode-button-hover text-white"
          size="sm"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Reprendre
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          )}
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>

        <div className="flex items-center gap-3 ml-4 flex-1 max-w-xs">
          <Gauge className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
            min={0}
            max={100}
            step={10}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground min-w-[60px]">
            {speed === 0 ? "Lent" : speed === 100 ? "Rapide" : "Moyen"}
          </span>
        </div>

        <Button
          onClick={onComplete}
          variant="outline"
          size="sm"
          className="ml-auto border-border hover:bg-secondary"
        >
          Retour à l'éditeur
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Editor with typing effect */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={displayedCode}
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
            readOnly: true,
            cursorStyle: "block",
            cursorBlinking: "solid",
          }}
        />
        
        {/* Cursor effect */}
        {currentIndex < code.length && !isPaused && (
          <motion.div
            className="absolute w-2 h-5 bg-primary"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              left: `${(currentIndex % 80) * 8}px`,
              top: `${Math.floor(currentIndex / 80) * 20}px`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TypingSimulator;
