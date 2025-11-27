import { Button } from "@/components/ui/button";
import { MdPause, MdPlayArrow, MdRefresh } from "react-icons/md";

interface TypingControlsProps {
    isPaused: boolean;
    isComplete: boolean;
    loopCount: number;
    isLoopEnabled: boolean;
    onTogglePlay: () => void;
    onReset: () => void;
}

export const TypingControls = ({
    isPaused,
    isComplete,
    loopCount,
    isLoopEnabled,
    onTogglePlay,
    onReset
}: TypingControlsProps) => {
    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={onTogglePlay}
                className="bg-vscode-button hover:bg-vscode-button-hover text-white"
                size="sm"
            >
                {isComplete ? (
                    <>
                        <MdRefresh className="w-4 h-4 mr-2" />
                        Reprendre
                    </>
                ) : isPaused ? (
                    <>
                        <MdPlayArrow className="w-4 h-4 mr-2" />
                        Lecture
                    </>
                ) : (
                    <>
                        <MdPause className="w-4 h-4 mr-2" />
                        Pause
                    </>
                )}
            </Button>

            <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="border-border hover:bg-secondary"
            >
                <MdRefresh className="w-4 h-4 mr-2" />
                Réinitialiser
            </Button>

            {/* Compteur de boucles */}
            {isLoopEnabled && loopCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded text-xs text-primary font-medium animate-fade-in">
                    <MdRefresh className="w-3.5 h-3.5" />
                    <span>
                        {loopCount} boucle{loopCount > 1 ? "s" : ""}
                    </span>
                </div>
            )}
        </div>
    );
};
