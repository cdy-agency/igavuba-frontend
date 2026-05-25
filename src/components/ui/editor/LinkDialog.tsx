import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LinkIcon } from "lucide-react";
import { useState, useCallback } from "react";

interface LinkDialogProps {
  onAddLink: (url: string) => void;
}

export const LinkDialog = ({ onAddLink }: LinkDialogProps) => {
  const [linkUrl, setLinkUrl] = useState("");

  const handleAddLink = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (!linkUrl) return;

      onAddLink(linkUrl);
      setLinkUrl("");
    },
    [linkUrl, onAddLink]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add Link">
          <LinkIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add Link</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
            />
            <Button onClick={handleAddLink} size="sm" disabled={!linkUrl}>
              Add
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
