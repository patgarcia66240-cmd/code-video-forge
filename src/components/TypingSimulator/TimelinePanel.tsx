import { motion } from "framer-motion";
import TimelineControl from "@/components/TimelineControl";
import SliderSpeed from "@/components/SliderSpeed";

interface TimelinePanelProps {
    currentIndex: number;
    totalLength: number;
    speed: number;
    onPositionChange: (index: number) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onSpeedChange: (speed: number) => void;
}

export const TimelinePanel = ({
    currentIndex,
    totalLength,
    speed,
    onPositionChange,
    onDragStart,
    onDragEnd,
    onSpeedChange
}: TimelinePanelProps) => {
    return (
        <div className="px-4 py-3 flex items-start">
            <div className="w-full max-w-4xl my-2">
                <TimelineControl
                    currentIndex={currentIndex}
                    totalLength={totalLength}
                    speed={speed}
                    onPositionChange={onPositionChange}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                />
            </div>
        </div>
    );
};

interface ControlsPanelProps {
    speed: number;
    onSpeedChange: (speed: number) => void;
    onComplete: () => void;
    onToggleFullscreen: () => void;
    isFullscreen: boolean;
}

export const ControlsPanel = ({
    speed,
    onSpeedChange,
    onComplete,
    onToggleFullscreen,
    isFullscreen
}: ControlsPanelProps) => {
    return (
        <div className="flex items-center gap-3 ml-4 flex-1 max-w-md">
            <SliderSpeed speed={speed} setSpeed={onSpeedChange} />
        </div>
    );
};
