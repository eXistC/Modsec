import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { PasswordGenerator } from "./PasswordGenerator";
import { useState, useRef, useEffect } from "react";

interface InlinePasswordGeneratorProps {
  onGenerate: (password: string) => void;
  onClose: () => void;
}

export function InlinePasswordGenerator({ onGenerate, onClose }: InlinePasswordGeneratorProps) {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handlePasswordGenerated = (password: string) => {
    setCurrentPassword(password);
  };

  const handleUsePassword = () => {
    if (currentPassword) {
      onGenerate(currentPassword);
      onClose();
    }
  };

  return (
    <div 
      ref={popupRef}
      className="absolute top-full left-0 mt-2 z-50 w-full min-w-[280px] max-w-[400px] bg-popover border rounded-md shadow-md"
    >
      <div className="p-3 overflow-auto">
        <div className="flex items-center justify-between px-4 mb-3">
          <Button
            size="sm"
            variant="secondary"
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="default"
            className={`transition-colors bg-primary
              ${currentPassword 
                ? 'text-secondary hover:text-secondary/90 hover:bg-primary/90' 
                : 'text-muted-foreground opacity-50 cursor-not-allowed'
              }`}
            onClick={handleUsePassword}
            disabled={!currentPassword}
          >
            Use
          </Button>
        </div>
        <div className="border-t">
          <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
        </div>
      </div>
    </div>
  );
}