import { Button } from "@/components/ui/button";
import { Globe, User, CreditCard, Wallet, File, X } from "lucide-react";
import { PasswordType } from "@/types/password";
import { useColorSettings } from "@/context/ColorSettingsContext";

interface NewItemTypeOverlayProps {
  onSelect: (type: PasswordType) => void;
  onClose: () => void;
}

export function NewItemTypeOverlay({ onSelect, onClose }: NewItemTypeOverlayProps) {
  // Use the color settings from context instead of hardcoded values
  const { colors } = useColorSettings();

  // Updated helper function to determine icon background and text color
  const getIconStyle = (type: string): React.CSSProperties => {
    switch (type) {
      case "website":
        return { 
          backgroundColor: `${colors.website}20`, // 20 is hex for 12% opacity
          color: colors.website 
        };
      case "identity":
        return { 
          backgroundColor: `${colors.identity}20`,
          color: colors.identity
        };
      case "card":
        return { 
          backgroundColor: `${colors.card}20`,
          color: colors.card
        };
      case "crypto":
        return { 
          backgroundColor: `${colors.crypto}20`,
          color: colors.crypto
        };
      case "memo":
        return { 
          backgroundColor: `${colors.memo}20`,
          color: colors.memo
        };
      default:
        return { 
          backgroundColor: 'var(--secondary)', 
          opacity: 0.6 
        };
    }
  };

  const types = [
    { type: "website" as PasswordType, icon: Globe, label: "Website", description: "Store login credentials for websites" },
    { type: "identity" as PasswordType, icon: User, label: "Identity", description: "Save personal identification details" },
    { type: "card" as PasswordType, icon: CreditCard, label: "Payment Card", description: "Secure your payment card information" },
    { type: "crypto" as PasswordType, icon: Wallet, label: "Crypto Wallet", description: "Store cryptocurrency wallet details" },
    { type: "memo" as PasswordType, icon: File, label: "Secure Note", description: "Keep sensitive notes and information" },
  ];

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-[400px] rounded-xl border bg-card text-card-foreground shadow-lg">
          <div className="flex h-[52px] items-center justify-between border-b px-6">
            <h2 className="text-lg font-semibold">Add New Item</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-secondary/80"
              onClick={onClose}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="p-2">
            {types.map(({ type, icon: Icon, label, description }) => (
              <Button
                key={type}
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto hover:bg-secondary/40 group transition-colors"
                onClick={() => onSelect(type)}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg p-2.5 shadow-sm group-hover:bg-opacity-20 transition-all duration-200"
                       style={getIconStyle(type)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}