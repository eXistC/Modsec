import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardEntry } from "@/types/password";

interface CardFieldsProps {
  formData: CardEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: keyof CardEntry) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CardFields({ 
  formData, 
  isEditing, 
  showPassword, 
  setShowPassword, 
  handleChange 
}: CardFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Card Holder Name</label>
        <Input
          placeholder="Enter card holder name"
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
          value={formData.cardHolderName}
          onChange={handleChange('cardHolderName')}
          readOnly={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Card Number</label>
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"}
            placeholder="Enter card number"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono pr-10`}
            value={formData.cardNumber}
            onChange={handleChange('cardNumber')}
            readOnly={!isEditing}
          />
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground/70" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground/70" />
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Valid From</label>
          <Input
            placeholder="MM/YY"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.validFrom}
            onChange={handleChange('validFrom')}
            readOnly={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Expiration Date</label>
          <Input
            placeholder="MM/YY"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background`}
            value={formData.expirationDate}
            onChange={handleChange('expirationDate')}
            readOnly={!isEditing}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">CVV</label>
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"}
            placeholder="Enter CVV"
            className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background font-mono pr-10`}
            value={formData.cvv}
            onChange={handleChange('cvv')}
            readOnly={!isEditing}
          />
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground/70" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground/70" />
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}