import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { CardEntry } from "@/types/password";
import { Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CardFieldsProps {
  formData: CardEntry;
  isEditing: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  copyToClipboard: (field: string, value: string) => void;
  copiedField: string | null;
}

export function CardFields({ 
  formData, 
  isEditing, 
  showPassword, 
  setShowPassword, 
  handleChange,
  copyToClipboard,
  copiedField 
}: CardFieldsProps) {

  const handleFieldFocus = () => {
    // Match WebsiteFields behavior - only show in editing mode
    if (isEditing) {
      setShowPassword(true);
    }
  };

  const handlePasswordChange = (field: keyof CardEntry) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field as string)(e);
  };

  // Helper component for copyable inputs
  const CopyableInput = ({ 
    label, 
    value, 
    fieldName,
    placeholder = "",
    className = ""
  }: { 
    label: string;
    value: string | undefined;
    fieldName: string;
    placeholder?: string;
    className?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          placeholder={placeholder}
          className={`${!isEditing ? 'bg-background' : 'bg-secondary'} border-[1px] border-input focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background pr-10 ${className}`}
          value={value || ''}
          onChange={handleChange(fieldName)}
          readOnly={!isEditing}
        />
        {!isEditing && value && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                onClick={() => copyToClipboard(fieldName, value)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {copiedField === fieldName ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copiedField === fieldName ? "Copied!" : "Copy to clipboard"}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      <CopyableInput
        label="Card Holder Name"
        value={formData.cardHolderName}
        fieldName="cardHolderName"
        placeholder="Enter card holder name"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Card Number</label>
        <div className="relative">
          <PasswordInput 
            placeholder="Enter card number"
            value={formData.cardNumber || ''}
            onChange={handlePasswordChange('cardNumber')}
            isEditing={isEditing}
            showPassword={showPassword}
            onPasswordVisibilityChange={setShowPassword}
            onPasswordFocus={handleFieldFocus}
            className="font-mono"
          />
          {!isEditing && formData.cardNumber && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  onClick={() => copyToClipboard('cardNumber', formData.cardNumber)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {copiedField === 'cardNumber' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copiedField === 'cardNumber' ? "Copied!" : "Copy to clipboard"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CopyableInput
          label="Valid From"
          value={formData.validFrom}
          fieldName="validFrom"
          placeholder="MM/YY"
        />
        <CopyableInput
          label="Expiration Date"
          value={formData.expirationDate}
          fieldName="expirationDate"
          placeholder="MM/YY"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">CVV</label>
        <div className="relative">
          <PasswordInput 
            placeholder="Enter CVV"
            value={formData.cvv || ''}
            onChange={handlePasswordChange('cvv')}
            isEditing={isEditing}
            showPassword={showPassword}
            onPasswordVisibilityChange={setShowPassword}
            onPasswordFocus={handleFieldFocus}
            className="font-mono"
          />
          {!isEditing && formData.cvv && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button"
                  onClick={() => copyToClipboard('cvv', formData.cvv)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {copiedField === 'cvv' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copiedField === 'cvv' ? "Copied!" : "Copy to clipboard"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </>
  );
}