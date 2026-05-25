import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Type, PaintBucket } from "lucide-react";
import { TEXT_COLORS, BACKGROUND_COLORS } from "./constants";

interface ColorPickerProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  colors: string[];
  onColorSelect: (color: string) => void;
}

export const ColorPicker = ({ icon: Icon, title, colors, onColorSelect }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title={title}>
          <Icon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{title}</Label>
          <div className="grid grid-cols-10 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onColorSelect(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const TextColorPicker = ({ onColorSelect }: { onColorSelect: (color: string) => void }) => (
  <ColorPicker icon={Type} title="Text Color" colors={TEXT_COLORS} onColorSelect={onColorSelect} />
);

export const BackgroundColorPicker = ({
  onColorSelect,
}: {
  onColorSelect: (color: string) => void;
}) => (
  <ColorPicker
    icon={PaintBucket}
    title="Background Color"
    colors={BACKGROUND_COLORS}
    onColorSelect={onColorSelect}
  />
);
