import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ToolbarButtonProps {
  icon: LucideIcon;
  isActive?: boolean;
  onClick: (e?: React.MouseEvent) => void;
  title: string;
  disabled?: boolean;
  children?: ReactNode;
}

export const ToolbarButton = ({
  icon: Icon,
  isActive = false,
  onClick,
  title,
  disabled = false,
  children,
}: ToolbarButtonProps) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      className="h-8 w-8 p-0"
      title={title}
      disabled={disabled}
    >
      {children || <Icon className="h-4 w-4" />}
    </Button>
  );
};
