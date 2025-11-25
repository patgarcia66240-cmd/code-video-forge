import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

interface TimelineControlProps {
  currentIndex: number;
  totalLength: number;
  speed: number;
  onPositionChange: (index: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const TimelineControl = ({
  currentIndex,
  totalLength,
  speed,
  onPositionChange,
  onDragStart,
  onDragEnd,
}: TimelineControlProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const getTimecode = (index: number) => {
    const delay = Math.max(10, 100 - speed);
    const totalMs = index * delay;
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = totalLength > 0 ? (currentIndex / totalLength) * 100 : 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    onDragStart?.();
    updatePosition(e);
  };

  const updatePosition = (e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newIndex = Math.round(percentage * totalLength);
    onPositionChange(newIndex);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, totalLength]);

  const jumpTo = (percentage: number) => {
    const newIndex = Math.round((percentage / 100) * totalLength);
    onPositionChange(Math.max(0, Math.min(newIndex, totalLength)));
  };

  const skipAmount = Math.max(1, Math.floor(totalLength * 0.05)); // 5% du total

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Timecode et progression */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-bold text-foreground">
            {getTimecode(currentIndex)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {Math.round(progress)}%
          </span>
        </div>
        <span className="text-sm font-mono text-muted-foreground">
          {getTimecode(totalLength)}
        </span>
      </div>

      {/* Barre de timeline interactive */}
      <div
        ref={trackRef}
        className="relative h-8 bg-secondary/50 rounded-lg cursor-pointer border border-border hover:border-primary/50 transition-colors"
        onMouseDown={handleMouseDown}
      >
        {/* Barre de progression */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/60 to-primary rounded-l-lg transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        
        {/* Marqueurs de temps */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
          {[0, 25, 50, 75, 100].map((marker) => (
            <div
              key={marker}
              className="relative h-full flex items-center"
            >
              <div className="w-px h-3 bg-border" />
            </div>
          ))}
        </div>

        {/* Curseur de position */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full shadow-lg pointer-events-none transition-all duration-100"
          style={{ left: `${progress}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-xl" />
        </div>
      </div>

      {/* Boutons de navigation rapide */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPositionChange(0)}
            className="h-7 px-2"
          >
            <SkipBack className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPositionChange(Math.max(0, currentIndex - skipAmount))}
            className="h-7 px-2"
          >
            <ChevronLeft className="w-3 h-3" />
            <span className="text-xs ml-1">5%</span>
          </Button>
        </div>

        <div className="flex gap-2 text-xs text-muted-foreground">
          {[0, 25, 50, 75, 100].map((marker) => (
            <button
              key={marker}
              onClick={() => jumpTo(marker)}
              className="px-2 py-1 rounded hover:bg-secondary hover:text-foreground transition-colors"
            >
              {marker}%
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPositionChange(Math.min(totalLength, currentIndex + skipAmount))}
            className="h-7 px-2"
          >
            <span className="text-xs mr-1">5%</span>
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPositionChange(totalLength)}
            className="h-7 px-2"
          >
            <SkipForward className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimelineControl;
