import { Button } from "@/components/ui/button";
import { Globe, User, CreditCard, Wallet, File, X } from "lucide-react";
import { PasswordType } from "@/types/password";

interface NewItemTypeOverlayProps {
  onSelect: (type: PasswordType) => void;
  onClose: () => void;
}

export function NewItemTypeOverlay({ onSelect, onClose }: NewItemTypeOverlayProps) {
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
                  <div className="rounded-lg bg-secondary/40 p-2 group-hover:bg-secondary transition-colors">
                    <Icon className="h-5 w-5 text-foreground/70" />
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