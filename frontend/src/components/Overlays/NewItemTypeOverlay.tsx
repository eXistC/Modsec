import { Button } from "@/components/ui/button";
import { Globe, User, CreditCard, Wallet, File } from "lucide-react";
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
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                className="h-4 w-4 text-muted-foreground"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
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