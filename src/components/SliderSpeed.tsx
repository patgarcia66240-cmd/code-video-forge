import { MdDirectionsWalk } from "react-icons/md";
import { GiTurtle, GiRabbit } from "react-icons/gi";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SliderSpeedProps {
  speed: number;
  setSpeed: (speed: number) => void;
}

const SliderSpeed = ({ speed, setSpeed }: SliderSpeedProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Vitesse d'animation</Label>
      <div className="flex items-center gap-4">
        {speed < 30 ? (
          <GiTurtle className="w-6 h-6 text-muted-foreground transition-all duration-300" />
        ) : speed < 70 ? (
          <MdDirectionsWalk className="w-6 h-6 text-muted-foreground transition-all duration-300" />
        ) : (
          <GiRabbit className="w-6 h-6 text-muted-foreground transition-all duration-300" />
        )}
        <Slider
          value={[speed]}
          onValueChange={(value) => setSpeed(value[0])}
          min={0}
          max={100}
          step={10}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground min-w-[80px] text-right">
          {speed === 0
            ? "Très lent"
            : speed < 30
              ? "Lent"
              : speed < 70
                ? "Moyen"
                : speed < 100
                  ? "Rapide"
                  : "Très rapide"}
        </span>
      </div>
    </div>
  );
};

export default SliderSpeed;
